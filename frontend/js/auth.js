// Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        try {
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;

            const data = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            Auth.setToken(data.token);
            Auth.setUser(data.user);

            window.location.href = 'dashboard.html';
        } catch (error) {
            showAlert(error.message, 'danger');
            submitBtn.textContent = 'Login';
            submitBtn.disabled = false;
        }
    });
}

// Handle Register
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = registerForm.querySelector('button[type="submit"]');

        try {
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;

            const data = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });

            Auth.setToken(data.token);
            Auth.setUser(data.user);

            window.location.href = 'dashboard.html';
        } catch (error) {
            showAlert(error.message, 'danger');
            submitBtn.textContent = 'Sign Up';
            submitBtn.disabled = false;
        }
    });
}
