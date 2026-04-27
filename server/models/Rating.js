const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true, unique: true },
  raterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },      // who gave rating
  ratedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // who was rated
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '', maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rating', ratingSchema);
