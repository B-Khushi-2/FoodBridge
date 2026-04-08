const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodType: { type: String, required: true },
  quantity: { type: String, required: true },
  description: { type: String, default: '' },
  expiryTime: { type: Date, required: true },
  location: { type: String, required: true },
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  pickupWindowStart: { type: String, required: true },
  pickupWindowEnd: { type: String, required: true },
  image: { type: String, default: '' },
  allergens: [{ type: String }],
  suitableFor: [{ type: String }],
  status: { type: String, enum: ['available', 'claimed', 'completed', 'expired'], default: 'available' },
  imageAnalysis: {
    isFood: { type: Boolean, default: true },
    freshness: { type: Number, default: 0.8 },
    confidence: { type: Number, default: 0.5 },
    labels: [{ type: String }],
    verdict: { type: String, enum: ['approved', 'suspected', 'rejected'], default: 'approved' },
    reason: { type: String, default: '' },
    score: { type: Number, default: 50 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FoodListing', foodListingSchema);
