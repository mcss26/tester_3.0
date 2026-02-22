/**
 * Admin Index / Portal Logic
 * Handles authentication check, dashboard data loading (user profile, system status),
 * and dynamic UI modules interaction (tabs, QR widget).
 */

(async function () {
    'use strict';

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['admin', 'contable']);
    if (!session) return;

    // 2. Supabase Safety Check
    if (!window.Utils.assertSbOrShowBlockingError()) return;

    // 3. DOM References
    const refs = {
        avatar: document.getElementById('user-avatar'),
        userNameDisplay: document.getElementById('user-name-display'),
        userMenu: document.getElementById('user-menu'),
        workdayStatus: document.getElementById('workday-status'),
        workdayText: document.getElementById('workday-text'),
        logoutBtn: document.getElementById('btn-logout'),
        qrWidget: document.getElementById('qr-live-widget'),
        qrCount: document.getElementById('qr-live-count'),
        tabs: document.querySelectorAll('.segment-btn'),
        grids: document.querySelectorAll('.module-grid'),
    };

    // 4. State & Logic
    const intervals = [];
    let qrFetching = false;
    let mcoFetching = false;
    
    /**
     * Loads and displays the current user's name and avatar initials.
     */
    async function loadUserProfile(userId) {
        const user = session.user;
        const meta = user.user_metadata || {};
        const fallbackName = meta.full_name || meta.name || user.email || 'Admin';

        try {
            const { data: profile, error } = await window.sb
                .from('profiles')
                .select('full_name')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            const fullName = profile?.full_name || fallbackName;
            const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';
            if (refs.avatar) refs.avatar.textContent = initials;
            if (refs.userNameDisplay) refs.userNameDisplay.textContent = fullName;
        } catch (err) {
            console.error('[admin-index] Error loading profile:', err);
            if (refs.avatar) refs.avatar.textContent = 'AD';
            if (refs.userNameDisplay) refs.userNameDisplay.textContent = fallbackName;
        }
    }

    /**
     * Loads workday status using WorkDayHelper and updates the GS topbar widget.
     */
    async function loadSystemStatus() {
        try {
            const wd = await window.WorkDayHelper.getPlannableWorkDay();

            if (wd) {
                const date = new Date(wd.work_date + 'T12:00:00');
                const dayName = date.toLocaleDateString('es-AR', { weekday: 'long' });
                const dayNum = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
                if (refs.workdayText) refs.workdayText.textContent = `${dayName} ${dayNum}`;
                if (refs.workdayStatus) {
                    refs.workdayStatus.classList.remove('status-closed', 'status-planning');
                    refs.workdayStatus.classList.add(
                        wd.status === 'ACTIVE' ? 'status-open' : 'status-planning'
                    );
                }
                return wd;
            } else {
                if (refs.workdayText) refs.workdayText.textContent = 'Sin jornada activa';
                if (refs.workdayStatus) {
                    refs.workdayStatus.classList.remove('status-open', 'status-planning');
                    refs.workdayStatus.classList.add('status-closed');
                }
                return null;
            }
        } catch (err) {
            console.warn('[admin-index] WorkDay fetch error:', err);
            if (refs.workdayText) refs.workdayText.textContent = 'Error';
            return null;
        }
    }

    /**
     * Initializes the encoded QR Live Counter widget.
     */
    function initQrWidget(workDay) {
        if (!refs.qrWidget || !workDay) return;

        window.Utils.show(refs.qrWidget);

        const fetchQrCount = async () => {
            if (qrFetching) return;
            qrFetching = true;
            try {
                const { count, error } = await window.sb
                    .from('qr_codes')
                    .select('*', { count: 'exact', head: true })
                    .eq('work_day_id', workDay.id)
                    .eq('status', 'ACREDITADO');

                if (error) throw error;
                
                if (refs.qrCount) {
                    refs.qrCount.textContent = count || 0;
                }
            } catch (err) {
                console.error('Error fetching QR count:', err);
            } finally {
                qrFetching = false;
            }
        };

        // Initial Load & Polling
        fetchQrCount();
        intervals.push(setInterval(fetchQrCount, 30000));
    }

    /**
     * Initializes MCO Member QR Counter widget.
     */
    function initMcoQrWidget() {
        const widget = document.getElementById('mco-qr-widget');
        const elGenerated = document.getElementById('mco-qr-generated');
        const elValidated = document.getElementById('mco-qr-validated');
        
        if (!widget) return;

        const MCO_BATCH_ID = window.APP_CONFIG.MCO_BATCH_ID;

        const fetchMcoStats = async () => {
            if (mcoFetching) return;
            mcoFetching = true;
            try {
                // Get generated count
                const { count: generated } = await window.sb
                    .from('qr_codes')
                    .select('*', { count: 'exact', head: true })
                    .eq('batch_id', MCO_BATCH_ID);

                // Get validated count
                const { count: validated } = await window.sb
                    .from('qr_codes')
                    .select('*', { count: 'exact', head: true })
                    .eq('batch_id', MCO_BATCH_ID)
                    .eq('status', 'ACREDITADO');

                if (elGenerated) elGenerated.textContent = generated || 0;
                if (elValidated) elValidated.textContent = validated || 0;
                
                window.Utils.show(widget);
            } catch (err) {
                console.error('Error fetching MCO QR stats:', err);
            } finally {
                mcoFetching = false;
            }
        };

        // Initial Load & Polling
        fetchMcoStats();
        intervals.push(setInterval(fetchMcoStats, 60000));
    }

    /**
     * Updates the visibility of modules based on selected role.
     */
    function updateModuleVisibility(role) {
        const modules = document.querySelectorAll('.module-card');
        modules.forEach(card => {
            const rawRoles = card.dataset.visibleRoles || '';
            const allowedRoles = rawRoles.split(',').map(r => r.trim());
            
            if (allowedRoles.includes(role)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    /**
     * Initializes the Tab switching for different roles.
     */
    function initTabs() {
        // Initial state: click the active one or default to admin
        const activeTab = document.querySelector('.segment-btn.active') || refs.tabs[0];
        if (activeTab) {
            updateModuleVisibility(activeTab.dataset.role);
        }

        refs.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Deactivate all
                refs.tabs.forEach(t => t.classList.remove('active'));

                // Activate clicked
                tab.classList.add('active');
                
                // Update Modules (Keep Grid Static)
                const role = tab.dataset.role;
                updateModuleVisibility(role);
            });
        });
    }

    // 5. Avatar Dropdown → handled by core/topbar.js (event delegation)

    // 6. Logout
    refs.logoutBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        const confirmed = await window.Utils.confirmModal('Cerrar sesión?');
        if (!confirmed) return;
        try {
            await window.Auth.logout();
        } catch (err) {
            console.error('[admin-index] Logout error:', err);
            window.Toast?.error('Error al cerrar sesión.');
        }
    });

    // 7. Initialization Sequence
    initTabs();
    
    // Load Data in parallel
    const [_, workDay] = await Promise.all([
        loadUserProfile(session.user.id),
        loadSystemStatus()
    ]);

    // Init dependent widgets
    if (workDay) {
        initQrWidget(workDay);
    }
    
    // Always init MCO widget (not dependent on current workday)
    initMcoQrWidget();

    // Cleanup on navigation
    window.addEventListener('beforeunload', () => intervals.forEach(clearInterval));

})();
