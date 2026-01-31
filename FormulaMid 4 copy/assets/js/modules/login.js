
document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('login-form');
  const errorContainer = document.getElementById('login-error');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  // 1. Check existing session manually (avoid guardOrRedirect's auto-redirect to login)
  const session = await window.Auth.getSession();
  if (session) {
    // If logged in, fetch profile to decide where to go
    const profile = await window.Auth.getMyProfile();
    if (profile && profile.role) {
       window.location.href = window.Auth.roleLanding(profile.role);
       return;
    }
    // If session exists but no profile, we might want to let them login again or sign out
    // For now, let's sign out to clean state if profile is missing
    if (!profile) {
      await window.Auth.signOutAndGoLogin();
    }
  }

  // 2. Handle Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorContainer.textContent = '';
      
      const email = emailInput.value;
      const password = passwordInput.value;

      if (!email || !password) {
        errorContainer.textContent = 'Por favor, completa todos los campos.';
        return;
      }

      // Show loading state (optional, can be done via CSS/button text)
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Ingresando...';

      try {
        const { data, error } = await window.sb.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw error;
        }

        // Login success, fetch profile to know where to go
        const profile = await window.Auth.getMyProfile();
        
        if (!profile) {
           throw new Error('No se encontró el perfil de usuario.');
        }

        // Redirect
        window.location.href = window.Auth.roleLanding(profile.role);

      } catch (err) {
        console.error('Login error:', err);
        errorContainer.textContent = translateError(err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }

  // Simple error translator
  function translateError(msg) {
    if (msg.includes('Invalid login credentials')) return 'Credenciales incorrectas.';
    if (msg.includes('Email not confirmed')) return 'Email no confirmado.';
    return msg || 'Error al iniciar sesión.';
  }
});
