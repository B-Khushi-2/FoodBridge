const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const { authMiddleware } = require('../middleware/auth');

// Get chat history for a room
router.get('/:roomId', authMiddleware, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ roomId: req.params.roomId })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a message (also emitted via socket, but REST as fallback)
router.post('/:roomId', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Message cannot be empty' });

    const msg = await ChatMessage.create({
      roomId: req.params.roomId,
      senderId: req.user._id,
      senderName: req.user.name,
      text: text.trim()
    });

    // Emit to socket room if io is available
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.roomId).emit('new_message', msg);
    }

    res.status(201).json({ message: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
