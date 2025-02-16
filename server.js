const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

// Load users from JSON file
let users = [];
try {
    users = JSON.parse(fs.readFileSync('users.json'));
} catch (err) {
    console.log('No existing users found, starting with empty user list');
}

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// Generate random 6-digit verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Register new user
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Save user
    users.push({ email, password: hashedPassword });
    fs.writeFileSync('users.json', JSON.stringify(users));
    
    res.json({ message: 'User registered successfully' });
});

// Login and send verification code
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate and send verification code
    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    fs.writeFileSync('users.json', JSON.stringify(users));

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${verificationCode}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to send verification code' });
        }
        res.json({ message: 'Verification code sent' });
    });
});

// Verify code and complete login
app.post('/verify', (req, res) => {
    const { email, code } = req.body;
    
    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Verify code
    if (user.verificationCode !== parseInt(code)) {
        return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Clear verification code
    delete user.verificationCode;
    fs.writeFileSync('users.json', JSON.stringify(users));

    res.json({ message: 'Login successful' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
