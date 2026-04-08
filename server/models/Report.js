const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing' },
  reportType: { type: String, enum: ['food_quality', 'suspicious_listing', 'delivery_issue', 'other'], default: 'food_quality' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Not Valid'], default: 'Pending' },
  imageVerification: {
    overallVerdict: { type: String, enum: ['Verified', 'Fake / Suspicious', 'Mismatch', 'Pending'], default: 'Pending' },
    overallConfidence: { type: Number, default: 0 },
    elaScore: { type: Number, default: 0 },
    elaDetails: { type: String, default: '' },
    classificationLabels: [{ type: String }],
    classificationConfidence: { type: Number, default: 0 },
    isFood: { type: Boolean, default: false },
    matchedFoodLabel: { type: String, default: '' },
    contextMatch: { type: Boolean, default: false },
    qualityScore: { type: Number, default: 0 },
    qualityIssues: [{ type: String }],
    imageResolution: { type: String, default: '' },
    exifScore: { type: Number, default: 0 },
    exifPresent: { type: Boolean, default: false },
    exifDetails: { type: String, default: '' },
    statsScore: { type: Number, default: 0 },
    statsDetails: { type: String, default: '' },
    details: { type: String, default: '' },
    analyzedAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
