const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true }, // e.g. "listingId_requestId"
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
