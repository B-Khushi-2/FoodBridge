const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const { authMiddleware } = require('../middleware/auth');

// Haversine distance between two lat/lng points (returns km)
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /api/geo/nearby-listings?lat=X&lng=Y&radius=10
// Returns listings sorted by distance from receiver's location
router.get('/nearby-listings', async (req, res) => {
  try {
    const { lat, lng, radius = 20 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

    const listings = await FoodListing.find({ status: 'available' })
      .populate('donorId', 'name email phone address')
      .sort({ createdAt: -1 });

    const withDistance = listings
      .map((l) => {
        const dist = haversineDistance(
          parseFloat(lat), parseFloat(lng),
          l.coordinates?.lat || 0,
          l.coordinates?.lng || 0
        );
        return { ...l.toObject(), distanceKm: Math.round(dist * 10) / 10 };
      })
      .filter((l) => l.distanceKm <= parseFloat(radius))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ listings: withDistance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/geo/nearest-receivers?listingId=X
// For donors: after posting, shows nearest receivers (by their address coords stored in profile)
router.get('/nearest-receivers', authMiddleware, async (req, res) => {
  try {
    const { listingId } = req.query;
    if (!listingId) return res.status(400).json({ error: 'listingId required' });

    const listing = await FoodListing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const { lat, lng } = listing.coordinates || {};
    if (!lat || !lng) return res.json({ receivers: [] });

    const receivers = await User.find({ role: 'receiver' });

    const withDistance = receivers
      .filter((r) => r.coordinates?.lat && r.coordinates?.lng)
      .map((r) => ({
        _id: r._id,
        name: r.name,
        address: r.address,
        distanceKm: Math.round(
          haversineDistance(lat, lng, r.coordinates.lat, r.coordinates.lng) * 10
        ) / 10
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 10);

    res.json({ receivers: withDistance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
