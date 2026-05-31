const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const user = new User({ name, email, password, role, phone, address });
    await user.save();
    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(() => {});
    res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address } });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google Login
router.post('/google', async (req, res) => {
  try {
    const { credential, role } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      // Create new user if not exists
      user = new User({
        name,
        email,
        password: googleId, // Dummy password for oauth users
        role: role || 'receiver', // Use chosen signup role
        phone: '0000000000',
        address: 'N/A'
      });
      await user.save();
      sendWelcomeEmail(user).catch(() => {});
    }

    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address } });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});


module.exports = router;
