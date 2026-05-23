// API Configuration
const API_URL = 'https://ingenious-secure-forge-gate.base44.app/apps/6a1216ad8d7a6bdb23a7f39f';
const CLIENT_ID = 'ca_y04ex9im0fi';
const CLIENT_SECRET = 'cs_z8lwozqoptpdoaebn3lje';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const userNameSpan = document.getElementById('userName');
const currentDateSpan = document.getElementById('currentDate');
const demoText = document.querySelector('.demo-text');

// Set current date
const today = new Date();
const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
});
currentDateSpan.textContent = dateStr;

// Check if user is already logged in (simple check)
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        showHomePage(JSON.parse(user));
    } else {
        showLoginPage();
    }
}

// Show login page
function showLoginPage() {
    window.location.href = 'index.html';
}

// Show home page
function showHomePage(user) {
    window.location.href = 'home.html';
    // Update user info after page load
    if (user) {
        userNameSpan.textContent = user.name || 'User';
    }
}

// Login handler
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        // Show loading state
        const submitBtn = loginForm.querySelector('button');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Authenticating...';
        submitBtn.disabled = true;
        
        // Prepare auth request
        const authData = {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'password', // Using resource owner password credentials
            username: email,
            password: password,
            scope: 'read write'
        };
        
        const response = await fetch(API_URL + '/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(authData)
        });
        
        if (!response.ok) {
            throw new Error('Authentication failed');
        }
        
        const data = await response.json();
        
        // Store token and user info
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('user', JSON.stringify({
            name: email.split('@')[0],
            email: email,
            id: data.user_id || '123'
        }));
        
        // Redirect to home
        showHomePage({
            name: email.split('@')[0]
        });
        
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials.');
        
        // Reset button
        const submitBtn = loginForm.querySelector('button');
        submitBtn.textContent = 'Sign In';
        submitBtn.disabled = false;
    }
}

// Logout handler
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    showLoginPage();
}

// Demo login
function handleDemoLogin() {
    document.getElementById('email').value = 'demo@secure.com';
    document.getElementById('password').value = 'demo123';
    alert('Demo credentials entered. Click Sign In to continue.');
}

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
demoText.addEventListener('click', handleDemoLogin);

demoText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleDemoLogin();
    }
});

// Initialize app
checkAuth();