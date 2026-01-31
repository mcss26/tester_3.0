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
        userName: document.getElementById('user-name'),
        systemStatus: document.getElementById('system-status'),
        workDayDate: document.getElementById('work-day-date'),
        qrWidget: document.getElementById('qr-live-widget'),
        qrCount: document.getElementById('qr-live-count'),
        tabs: document.querySelectorAll('.segment-btn'),
        grids: document.querySelectorAll('.module-grid'),
    };

    // 4. State & Logic
    
    /**
     * Loads and displays the current user's name.
     */
    async function loadUserProfile(userId) {
        if (!refs.userName) return;

        try {
            const { data: profile, error } = await window.sb
                .from('profiles')
                .select('full_name')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            refs.userName.textContent = profile?.full_name || 'Admin';
        } catch (err) {
            console.error('Error loading profile:', err);
            // Non-blocking error, just leave default
        }
    }

    /**
     * Checks for open/planned work days and updates the status indicator.
     */
    async function loadSystemStatus() {
        if (!refs.systemStatus) return null;

        try {
            const { data: wd, error } = await window.sb
                .from('work_days')
                .select('id, work_date, status')
                .in('status', ['open', 'planning', 'planned'])
                .order('work_date', { ascending: true })
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            if (wd) {
                // Update Date Text
                if (refs.workDayDate) {
                    refs.workDayDate.textContent = wd.work_date;
                }

                // Show Container
                window.Utils.show(refs.systemStatus);
                
                // Visual Pulse for Open Days
                if (wd.status === 'open') {
                    refs.systemStatus.classList.add('live');
                    const dot = refs.systemStatus.querySelector('.kpi-dot');
                    if (dot) dot.classList.add('kpi-dot-success');
                } else {
                    refs.systemStatus.classList.remove('live');
                    const dot = refs.systemStatus.querySelector('.kpi-dot');
                    if (dot) dot.classList.add('kpi-dot-info');
                }

                return wd;
            } else {
                window.Utils.hide(refs.systemStatus);
                return null;
            }
        } catch (err) {
            console.error('Error fetching WorkDay:', err);
            window.Utils.hide(refs.systemStatus);
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
            }
        };

        // Initial Load & Polling
        fetchQrCount();
        setInterval(fetchQrCount, 30000);
    }

    /**
     * Initializes the Tab switching for different roles.
     */
    /**
     * Updates the visibility of modules based on selected role.
     */
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

    // 5. Initialization Sequence
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

})();
