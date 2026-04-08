const express = require('express');
const router = express.Router();
const FoodListing = require('../models/FoodListing');
const { authMiddleware } = require('../middleware/auth');

// Create food listing (donor only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ error: 'Only donors can create food listings' });
    }
    const { foodType, quantity, description, expiryTime, location, coordinates, pickupWindowStart, pickupWindowEnd, image, allergens, suitableFor, imageAnalysis } = req.body;
    const listing = new FoodListing({
      donorId: req.user._id,
      foodType,
      quantity,
      description,
      expiryTime,
      location,
      coordinates: coordinates || { lat: 0, lng: 0 },
      pickupWindowStart,
      pickupWindowEnd,
      image: image || '',
      allergens: allergens || [],
      suitableFor: suitableFor || [],
      imageAnalysis: imageAnalysis || {}
    });
    await listing.save();
    // Populate donorId before returning so frontend gets the name
    await listing.populate('donorId', 'name email phone address');
    res.status(201).json({ listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all available listings (public — for receivers)
router.get('/', async (req, res) => {
  try {
    const listings = await FoodListing.find({ status: 'available' })
      .populate('donorId', 'name email phone address')
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get ALL listings (all statuses — for full visibility)
router.get('/all', async (req, res) => {
  try {
    const listings = await FoodListing.find()
      .populate('donorId', 'name email phone address')
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get donor's own listings (all statuses — includes expired)
router.get('/donor', authMiddleware, async (req, res) => {
  try {
    const listings = await FoodListing.find({ donorId: req.user._id })
      .populate('donorId', 'name email phone address')
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a listing
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (listing.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await FoodListing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
