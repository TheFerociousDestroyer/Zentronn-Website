var container = document.getElementById('container');
var registerBtn = document.getElementById('register');
var loginBtn = document.getElementById('login');
var signInButton = document.getElementById('signInButton');
var emailInput = document.getElementById('emailInput');
var passwordInput = document.getElementById('passwordInput');

// Load valid emails
let validEmails = [];
fetch('users.json')
    .then(response => response.json())
    .then(data => validEmails = data)
    .catch(error => console.error('Error loading users:', error));

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check if email is registered
function isRegisteredEmail(email) {
    return validEmails.includes(email);
}


// Sign In button click handler
signInButton.addEventListener('click', () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
        alert('Please fill in both email and password fields.');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    if (!isRegisteredEmail(email)) {
        alert('This email is not registered.');
        return;
    }
    
    // If validation passes, redirect to index.html
    window.location.href = 'index.html';
});




registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});
