const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Request = require('../models/Request');
const { authMiddleware } = require('../middleware/auth');

// Submit a rating (receiver rates donor after completed pickup)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { requestId, rating, comment } = req.body;

    if (!requestId || !rating) {
      return res.status(400).json({ error: 'requestId and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify the request exists and is completed
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed pickups' });
    }
    if (request.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the receiver can rate this pickup' });
    }

    // Check if already rated
    const existing = await Rating.findOne({ requestId });
    if (existing) {
      return res.status(400).json({ error: 'You have already rated this pickup' });
    }

    const newRating = await Rating.create({
      requestId,
      raterId: req.user._id,
      ratedUserId: request.donorId,
      rating,
      comment: comment || ''
    });

    res.status(201).json({ rating: newRating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get ratings for a specific user (their average score + list)
router.get('/user/:userId', async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedUserId: req.params.userId })
      .populate('raterId', 'name')
      .sort({ createdAt: -1 });

    const avg = ratings.length
      ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10
      : null;

    res.json({ ratings, averageRating: avg, totalRatings: ratings.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if current user has rated a request
router.get('/check/:requestId', authMiddleware, async (req, res) => {
  try {
    const existing = await Rating.findOne({ requestId: req.params.requestId, raterId: req.user._id });
    res.json({ alreadyRated: !!existing, rating: existing || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: all ratings summary per donor
router.get('/summary', async (req, res) => {
  try {
    const summary = await Rating.aggregate([
      {
        $group: {
          _id: '$ratedUserId',
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      },
      {
        $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          email: '$user.email',
          averageRating: { $round: ['$averageRating', 1] },
          totalRatings: 1
        }
      },
      { $sort: { averageRating: -1 } }
    ]);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
