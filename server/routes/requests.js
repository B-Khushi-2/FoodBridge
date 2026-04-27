const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const FoodListing = require('../models/FoodListing');
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

// Create a request (receiver only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'receiver') {
      return res.status(403).json({ error: 'Only receivers can request food' });
    }
    const { listingId, message } = req.body;
    const listing = await FoodListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (listing.status !== 'available') {
      return res.status(400).json({ error: 'Listing is no longer available' });
    }
    const existingRequest = await Request.findOne({ listingId, receiverId: req.user._id, status: { $in: ['pending', 'accepted'] } });
    if (existingRequest) {
      return res.status(400).json({ error: 'You have already requested this listing' });
    }
    const newRequest = new Request({
      listingId,
      receiverId: req.user._id,
      donorId: listing.donorId,
      message
    });
    await newRequest.save();

    // Notify the donor about the new pickup request
    await Notification.create({
      userId: listing.donorId,
      type: 'request_received',
      title: 'New Pickup Request',
      message: `${req.user.name} wants to pick up your "${listing.foodType}" listing.`,
      relatedId: newRequest._id,
      relatedModel: 'Request'
    });

    res.status(201).json({ request: newRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get receiver's requests (with populated data)
router.get('/receiver', authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ receiverId: req.user._id })
      .populate('listingId')
      .populate('donorId', 'name email phone address')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get donor's incoming requests
router.get('/donor', authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ donorId: req.user._id })
      .populate('listingId')
      .populate('receiverId', 'name email phone address')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update request status (donor accepts/rejects)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted', 'rejected', 'completed'
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    // Donor can accept/reject/complete, Receiver can cancel pending
    const isDonor = request.donorId.toString() === req.user._id.toString();
    const isReceiver = request.receiverId.toString() === req.user._id.toString();
    
    if (!isDonor && !isReceiver) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Receiver can only cancel their pending requests
    if (isReceiver && !isDonor) {
      if (status !== 'cancelled' || request.status !== 'pending') {
        return res.status(403).json({ error: 'Receivers can only cancel pending requests' });
      }
    }

    request.status = status;
    await request.save();

    // If accepted, mark listing as claimed so it won't be expired by cron
    const listing = await FoodListing.findById(request.listingId);
    const foodName = listing?.foodType || 'food';

    if (status === 'accepted') {
      await FoodListing.findByIdAndUpdate(request.listingId, { status: 'claimed' });
      // Reject all other pending requests for this listing
      await Request.updateMany(
        { listingId: request.listingId, _id: { $ne: request._id }, status: 'pending' },
        { status: 'rejected', message: 'Another receiver was selected' }
      );
      // Notify receiver their request was accepted
      await Notification.create({
        userId: request.receiverId,
        type: 'request_accepted',
        title: 'Request Accepted! 🎉',
        message: `Your pickup request for "${foodName}" has been accepted. Go pick it up!`,
        relatedId: request._id,
        relatedModel: 'Request'
      });
    }

    if (status === 'rejected') {
      // Notify receiver their request was rejected
      await Notification.create({
        userId: request.receiverId,
        type: 'request_rejected',
        title: 'Request Declined',
        message: `Your pickup request for "${foodName}" was declined by the donor.`,
        relatedId: request._id,
        relatedModel: 'Request'
      });
    }

    // If completed, mark listing as completed too
    if (status === 'completed') {
      await FoodListing.findByIdAndUpdate(request.listingId, { status: 'completed' });
      // Notify both parties
      await Notification.create({
        userId: request.receiverId,
        type: 'request_completed',
        title: 'Pickup Completed! 🌍',
        message: `You successfully received "${foodName}". Thank you for reducing food waste!`,
        relatedId: request._id,
        relatedModel: 'Request'
      });
      await Notification.create({
        userId: request.donorId,
        type: 'request_completed',
        title: 'Donation Completed! 🎉',
        message: `Your "${foodName}" was successfully picked up. Thank you for your generosity!`,
        relatedId: request._id,
        relatedModel: 'Request'
      });
    }

    res.json({ request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
