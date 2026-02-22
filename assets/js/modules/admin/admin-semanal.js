(async function () {
    // Init
    const session = await window.Auth.guardOrRedirect(['admin', 'contable']);
    if (!session) return;
    if (!window.Utils.assertSbOrShowBlockingError()) return;

    const refs = {
        weekSelect: document.getElementById('weekSelect'),
        btnFreeze: document.getElementById('btnFreeze'),
        statusBanner: document.getElementById('statusBanner'),
        v: {
            incWhite: document.getElementById('valIncWhite'),
            expWhite: document.getElementById('valExpWhite'),
            balWhite: document.getElementById('valBalWhite'),
            incBlack: document.getElementById('valIncBlack'),
            expBlack: document.getElementById('valExpBlack'),
            balBlack: document.getElementById('valBalBlack'),
            tax: document.getElementById('valTaxEst')
        }
    };

    const ui = {
        loadingState: document.getElementById('page-card-loading'),
    };

    // Load Weeks (Last 12)
    const populateWeeks = () => {
        const packet = [];
        let current = new Date();
        // Adjust to Monday
        const day = current.getDay(), diff = current.getDate() - day + (day == 0 ? -6 : 1);
        current.setDate(diff);

        for (let i = 0; i < 12; i++) {
            const dStr = current.toISOString().split('T')[0];
            packet.push(dStr);
            current.setDate(current.getDate() - 7);
        }

        refs.weekSelect.innerHTML = packet.map((d, idx) =>
            `<option value="${d}">${idx === 0 ? 'Actual (En Curso)' : 'Semana ' + d}</option>`
        ).join('');

        refs.weekSelect.onchange = loadData;
    };

    const loadData = async () => {
        const weekStart = refs.weekSelect.value;
        const isCurrent = refs.weekSelect.selectedIndex === 0;

        refs.statusBanner.classList.toggle('hidden', !isCurrent);
        refs.btnFreeze.classList.toggle('hidden', !isCurrent);

        Utils.setPageState(ui, { loading: true });

        try {
            // Try fetching frozen first
            const { data: frozen } = await window.sb
                .from('finance_weekly_closings')
                .select('*')
                .eq('week_start', weekStart)
                .maybeSingle();

            let data;

            if (frozen) {
                data = frozen;
                refs.statusBanner.innerHTML = `<p class="text-center font-bold text-success">✅ SEMANA CERRADA</p>`;
                refs.statusBanner.classList.remove('hidden');
                refs.btnFreeze.classList.add('hidden'); // Already frozen
            } else {
                // Fetch Live
                const { data: live } = await window.sb
                    .from('vw_financial_week_live')
                    .select('*')
                    .eq('week_start', weekStart)
                    .maybeSingle();
                data = live || { income_white: 0, income_black: 0, expense_white: 0, expense_black: 0, est_tax: 0 };
            }

            render(data);

        } catch (e) {
            console.error(e);
            window.Toast?.error("Error cargando datos semanales: " + e.message);
        } finally {
            Utils.setPageState(ui, { loading: false });
        }
    };

    const render = (d) => {
        refs.v.incWhite.textContent = window.Utils.formatARS(d.income_white || 0);
        refs.v.expWhite.textContent = window.Utils.formatARS(d.expense_white || 0);
        refs.v.balWhite.textContent = window.Utils.formatARS((d.income_white || 0) - (d.expense_white || 0));

        refs.v.incBlack.textContent = window.Utils.formatARS(d.income_black || 0);
        refs.v.expBlack.textContent = window.Utils.formatARS(d.expense_black || 0);
        refs.v.balBlack.textContent = window.Utils.formatARS((d.income_black || 0) - (d.expense_black || 0));

        refs.v.tax.textContent = window.Utils.formatARS(d.est_tax || d.tax_estimate || 0); // Handle both field names
    };

    const freezeWeek = async () => {
        if (!await window.Utils.confirmModal('¿Confirmar cierre de semana? Esto congelará los valores actuales.')) return;

        const weekStart = refs.weekSelect.value;
        // Get live data again really quick
        const { data: live } = await window.sb.from('vw_financial_week_live').select('*').eq('week_start', weekStart).single();
        if (!live) return;

        const { error } = await window.sb.from('finance_weekly_closings').insert({
            week_start: weekStart,
            income_white: live.income_white,
            income_black: live.income_black,
            expense_white: live.expense_white,
            expense_black: live.expense_black,
            tax_estimate: live.est_tax,
            status: 'CLOSED',
            closed_by: window.Auth.user.id
        });

        if (error) window.Toast.error(error.message);
        else {
            window.Toast.success('Semana cerrada correctamente');
            loadData();
        }
    };

    populateWeeks();
    loadData();
    refs.btnFreeze.onclick = freezeWeek;

})();
