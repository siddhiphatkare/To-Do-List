// User Authentication Management
class AuthManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Signup Form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Login Form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout Button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // Password Toggle Buttons
        const toggleButtons = document.querySelectorAll('.toggle-password');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => this.togglePasswordVisibility(button));
        });
    }

    handleSignup(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validation
        if (!this.validatePassword(password)) {
            this.showNotification('Password must meet all requirements', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (this.users.some(user => user.email === email)) {
            this.showNotification('Email already registered', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            username,
            email,
            password: this.hashPassword(password), // In a real app, use proper password hashing
            createdAt: new Date().toISOString()
        };

        // Save user
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        // Auto login after signup
        this.currentUser = { ...newUser, password: undefined };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        this.showNotification('Account created successfully!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1500);
    }

    handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const user = this.users.find(u => u.email === email);

        if (!user || user.password !== this.hashPassword(password)) {
            this.showNotification('Invalid email or password', 'error');
            return;
        }

        // Set current user
        this.currentUser = { ...user, password: undefined };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        this.showNotification('Login successful!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1500);
    }

    handleLogout(e) {
        e.preventDefault();
        
        // Clear current user
        this.currentUser = null;
        localStorage.removeItem('currentUser');

        // Redirect to login
        window.location.href = '/pages/login.html';
    }

    validatePassword(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[@$!%*?&]/.test(password)
        };

        return Object.values(requirements).every(Boolean);
    }

    hashPassword(password) {
        // This is a simple hash function for demo purposes
        // In a real app, use proper password hashing like bcrypt
        return btoa(password);
    }

    togglePasswordVisibility(button) {
        const input = button.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        // Update icon
        const icon = button.querySelector('.eye-icon');
        if (type === 'text') {
            icon.innerHTML = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>';
        } else {
            icon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add to document
        document.body.appendChild(notification);

        // Remove after delay
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Check if user is authenticated
    checkAuth() {
        if (!this.currentUser && !window.location.pathname.includes('/pages/')) {
            window.location.href = '/pages/login.html';
        }
    }
}

// Initialize auth manager
const auth = new AuthManager();

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    .notification.success {
        background-color: #4caf50;
    }

    .notification.error {
        background-color: #f44336;
    }

    .notification.info {
        background-color: #2196f3;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    auth.checkAuth();
});

// Password Toggle Functionality
document.addEventListener('DOMContentLoaded', () => {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const input = toggle.closest('.password-input-container').querySelector('input');
            const type = input.getAttribute('type');
            
            // Toggle password visibility
            input.setAttribute('type', type === 'password' ? 'text' : 'password');
            
            // Toggle icon state
            toggle.classList.toggle('show-password');
        });
    });
}); 