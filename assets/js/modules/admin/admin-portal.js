/**
 * Admin Portal Module
 * Handles authentication, user profile display, workday status, and navigation menu
 * 
 * Features:
 * - Auth guard and session validation
 * - User avatar with initials
 * - Workday status display with real-time updates
 * - Dropdown menu with logout functionality
 * - Keyboard & click-away handling for accessibility
 */
(async function () {
   'use strict';

   // ===== CONSTANTS =====
   const ROLE_GUARD = ['admin', 'contable', 'manager'];

   // ===== DOM REFERENCES =====
   const domRefs = {
      avatar: document.getElementById('user-avatar'),
      userNameDisplay: document.getElementById('user-name-display'),
      userMenu: document.getElementById('user-menu'),
      workdayStatus: document.getElementById('workday-status'),
      workdayText: document.getElementById('workday-text'),
      logoutBtn: document.getElementById('btn-logout'),
      globalSearch: document.getElementById('global-search')
   };

   // ===== VALIDATION =====
   if (!domRefs.avatar || !domRefs.userMenu) {
      console.warn('Required DOM elements not found for admin portal');
      return;
   }

   // ===== AUTHENTICATION =====
   const session = await window.Auth.guardOrRedirect(ROLE_GUARD);
   if (!session) return;

   // ===== USER PROFILE =====
   function initializeUserProfile() {
      const user = session.user;
      const metadata = user.user_metadata || {};
      const fullName = metadata.full_name || metadata.name || user.email || 'User';

      const initials = fullName
         .split(' ')
         .slice(0, 2)
         .map(n => n[0])
         .join('')
         .toUpperCase();

      domRefs.avatar.textContent = initials;
      domRefs.userNameDisplay.textContent = fullName;
      domRefs.avatar.setAttribute('aria-label', `Menu de usuario - ${fullName}`);
   }

   // ===== WORKDAY STATUS =====
   async function updateWorkdayStatus() {
      try {
         const workday = await window.WorkDayHelper.getOpenWorkDay();

         if (workday) {
            const date = new Date(workday.work_date + 'T12:00:00');
            const dayName = date.toLocaleDateString('es-AR', { weekday: 'long' });
            const dayNum = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
            domRefs.workdayText.textContent = `${dayName} ${dayNum}`;

            domRefs.workdayStatus.classList.remove('status-closed', 'status-planning');
            const statusClass = workday.status === 'ACTIVE' ? 'status-open' : 'status-planning';
            domRefs.workdayStatus.classList.add(statusClass);
         } else {
            domRefs.workdayText.textContent = 'Sin jornada activa';
            domRefs.workdayStatus.classList.remove('status-open', 'status-planning');
            domRefs.workdayStatus.classList.add('status-closed');
         }
      } catch (error) {
         console.warn('WorkDay fetch error:', error);
         domRefs.workdayText.textContent = 'Error';
      }
   }

   // ===== DROPDOWN MENU =====
   function initializeDropdown() {
      domRefs.avatar.addEventListener('click', (event) => {
         event.stopPropagation();
         toggleDropdown();
      });

      document.addEventListener('click', () => {
         closeDropdown();
      });

      document.addEventListener('keydown', (event) => {
         if (event.key === 'Escape') {
            closeDropdown();
         }
      });

      domRefs.userMenu.addEventListener('click', (event) => {
         event.stopPropagation();
      });
   }

   function toggleDropdown() {
      const isHidden = domRefs.userMenu.classList.contains('hidden');
      if (isHidden) {
         openDropdown();
      } else {
         closeDropdown();
      }
   }

   function openDropdown() {
      domRefs.userMenu.classList.remove('hidden');
      domRefs.avatar.setAttribute('aria-expanded', 'true');
   }

   function closeDropdown() {
      domRefs.userMenu.classList.add('hidden');
      domRefs.avatar.setAttribute('aria-expanded', 'false');
   }

   // ===== LOGOUT =====
   function initializeLogout() {
      if (!domRefs.logoutBtn) return;
      domRefs.logoutBtn.addEventListener('click', async (event) => {
         event.preventDefault();
         const confirmed = window.Utils?.confirmModal
            ? await window.Utils.confirmModal('Cerrar sesion?')
            : window.confirm('Cerrar sesion?');
         if (!confirmed) return;

         try {
            await window.Auth.logout();
         } catch (error) {
            console.error('Logout error:', error);
            const message = 'Error al cerrar sesion. Por favor intenta nuevamente.';
            if (window.Toast?.error) {
               window.Toast.error(message);
               return;
            }
            if (window.Utils?.alertModal) {
               await window.Utils.alertModal(message, 'Error');
            }
         }
      });
   }

   // ===== SEARCH =====
   function initializeSearch() {
      if (!domRefs.globalSearch) return;
      domRefs.globalSearch.addEventListener('keydown', (event) => {
         if (event.key === 'Enter') {
            const searchTerm = domRefs.globalSearch.value.trim();
            if (searchTerm) {
               console.log('Search:', searchTerm);
            }
         }
      });
   }

   // ===== INITIALIZATION =====
   function initialize() {
      initializeUserProfile();
      initializeDropdown();
      initializeLogout();
      initializeSearch();
      updateWorkdayStatus();
   }

   initialize();
})();

