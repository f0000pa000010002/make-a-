// API Configuration
const API_BASE_URL = 'https://ingenious-secure-forge-gate.base44.app/apps/6a1216ad8d7a6bdb23a7f39f';
const CLIENT_ID = 'ca_y04ex9im0fi';
const CLIENT_SECRET = 'cs_z8lwozqoptpdoaebn3lje';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('error-message');
const logoutBtn = document.getElementById('logoutBtn');
const userEmail = document.getElementById('userEmail');
const userName = document.getElementById('userName');

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        // User is logged in, redirect to home page
        window.location.href = 'home.html';
    }
});

// Login Form Submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Validate email
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Validate password
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    // Hide previous error
    errorMessage.style.display = 'none';
    
    try {
        // Show loading state on button
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        
        // Prepare authentication request
        const authData = {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'password',
            username: email,
            password: password,
            scope: 'read write'
        };
        
        // Send authentication request to API
        const response = await fetch(API_BASE_URL + '/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams(authData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
        }
        
        // Store tokens and user data
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('tokenType', data.token_type);
        localStorage.setItem('expiresIn', data.expires_in);
        localStorage.setItem('userData', JSON.stringify({
            email: email,
            name: email.split('@')[0],
            loggedIn: true
        }));
        
        // Set cookie for remember me functionality
        if (remember) {
            document.cookie = `remember=true; max-age=604800; path=/; samesite=strict`;
        }
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 500);
        
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'An error occurred during login');
        
        // Reset button
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
});

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Logout functionality
logoutBtn.addEventListener('click', () => {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('userData');
    
    // Clear remember me cookie
    document.cookie = 'remember=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=strict';
    
    // Redirect to login page
    window.location.href = 'index.html';
});

// Home page load
document.addEventListener('DOMContentLoaded', () => {
    const homePage = window.location.pathname.includes('home.html');
    
    if (homePage) {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('userData');
        
        if (!token || !userData) {
            // Not authenticated, redirect to login
            window.location.href = 'index.html';
            return;
        }
        
        try {
            const user = JSON.parse(userData);
            
            // Display user information
            userEmail.textContent = user.email;
            userName.textContent = user.name;
            
            // Fetch user data from API
            fetchUserData();
            
        } catch (error) {
            console.error('Error parsing user data:', error);
            window.location.href = 'index.html';
        }
    }
});

// Fetch user data from API
async function fetchUserData() {
    try {
        const token = localStorage.getItem('accessToken');
        
        const response = await fetch(API_BASE_URL + '/api/user/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        
        // Update UI with user data
        document.getElementById('accountStatus').textContent = userData.status || 'Active';
        document.getElementById('apiCalls').textContent = userData.api_calls ? userData.api_calls.toLocaleString() : '1,248';
        
    } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to default values
        document.getElementById('accountStatus').textContent = 'Active';
        document.getElementById('apiCalls').textContent = '1,248';
    }
}