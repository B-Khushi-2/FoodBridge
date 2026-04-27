const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    enum: ['request_received', 'request_accepted', 'request_rejected', 'request_completed', 'listing_expired', 'new_listing', 'report_verified', 'system'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId },     // optional: listing or request _id
  relatedModel: { type: String, enum: ['FoodListing', 'Request', 'Report'] },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
