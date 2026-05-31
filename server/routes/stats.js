const express = require('express');
const router = express.Router();
const FoodListing = require('../models/FoodListing');
const Request = require('../models/Request');
const { authMiddleware } = require('../middleware/auth');

// GET /api/stats/user — get impact stats for the logged-in user
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let stats = {};

    if (role === 'donor') {
      const myListings = await FoodListing.find({ donorId: userId });
      const totalFood = myListings.reduce((sum, l) => {
        const val = parseFloat(l.quantity || 0);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
      const completedPickups = myListings.filter(l => l.status === 'completed').length;
      const mealsEnabled = Math.round(totalFood * 2.5);
      const co2Saved = Math.round(totalFood * 1.5);

      stats = {
        totalFood,
        pickups: completedPickups,
        mealsEnabled,
        co2Saved,
        activeListings: myListings.filter(l => l.status === 'available').length
      };
    } else {
      const myRequests = await Request.find({ receiverId: userId });
      const pickupsReceived = myRequests.filter(r => r.status === 'completed').length;
      const activeRequests = myRequests.filter(r => r.status === 'accepted' || r.status === 'pending').length;
      const peopleServed = pickupsReceived * 5;

      stats = {
        pickupsReceived,
        peopleServed,
        activeRequests,
        totalRequests: myRequests.length
      };
    }

    res.json({ stats });
  } catch (err) {
    console.error('[Stats] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
