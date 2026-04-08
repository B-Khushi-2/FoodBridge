const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Request = require('../models/Request');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All routes require admin
router.use(authMiddleware, adminMiddleware);

// Get all users with enriched data (listing/request counts)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    // Enrich each user with counts
    const enriched = await Promise.all(users.map(async (user) => {
      const listingCount = await FoodListing.countDocuments({ donorId: user._id });
      const requestCount = await Request.countDocuments({ receiverId: user._id });
      const donationCount = await Request.countDocuments({ donorId: user._id, status: 'completed' });
      return {
        ...user,
        listingCount,
        requestCount,
        donationCount
      };
    }));
    res.json({ users: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all food listings
router.get('/listings', async (req, res) => {
  try {
    const listings = await FoodListing.find()
      .populate('donorId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('listingId')
      .populate('receiverId', 'name email phone')
      .populate('donorId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get stats (enriched with expired/rejected)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalReceivers = await User.countDocuments({ role: 'receiver' });
    const totalListings = await FoodListing.countDocuments();
    const availableListings = await FoodListing.countDocuments({ status: 'available' });
    const claimedListings = await FoodListing.countDocuments({ status: 'claimed' });
    const expiredListings = await FoodListing.countDocuments({ status: 'expired' });
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const acceptedRequests = await Request.countDocuments({ status: 'accepted' });
    const rejectedRequests = await Request.countDocuments({ status: 'rejected' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });

    res.json({
      stats: {
        totalUsers, totalDonors, totalReceivers,
        totalListings, availableListings, claimedListings, expiredListings,
        totalRequests, pendingRequests, acceptedRequests, rejectedRequests, completedRequests
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete listing
router.delete('/listings/:id', async (req, res) => {
  try {
    await FoodListing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

