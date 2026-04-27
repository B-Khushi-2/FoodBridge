const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const FoodListing = require('../models/FoodListing');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { sendPickupRequestEmail, sendRequestAcceptedEmail, sendPickupCompletedEmail } = require('../services/emailService');


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

    // Email the donor
    const donor = await User.findById(listing.donorId);
    if (donor) sendPickupRequestEmail(donor, req.user, listing.foodType).catch(() => {});

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

// Verify QR token (receiver scans QR → complete pickup)
router.post('/verify-qr', authMiddleware, async (req, res) => {
  try {
    const { qrToken } = req.body;
    const request = await Request.findOne({ qrToken, status: 'accepted' });
    if (!request) {
      return res.status(404).json({ error: 'Invalid or already used QR code' });
    }
    if (request.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'QR code does not belong to you' });
    }

    const listing = await FoodListing.findById(request.listingId);
    const foodName = listing?.foodType || 'food';

    request.status = 'completed';
    request.pickedUpAt = new Date();
    await request.save();

    await FoodListing.findByIdAndUpdate(request.listingId, { status: 'completed' });

    await Notification.create({
      userId: request.receiverId,
      type: 'request_completed',
      title: 'Pickup Verified! 🌍',
      message: `QR verified! You successfully received "${foodName}". Thank you for reducing food waste!`,
      relatedId: request._id,
      relatedModel: 'Request'
    });
    await Notification.create({
      userId: request.donorId,
      type: 'request_completed',
      title: 'Donation Picked Up! 🎉',
      message: `"${foodName}" was picked up and QR verified. Thank you for your generosity!`,
      relatedId: request._id,
      relatedModel: 'Request'
    });

    res.json({ success: true, request });
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

    const listing = await FoodListing.findById(request.listingId);
    const foodName = listing?.foodType || 'food';

    if (status === 'accepted') {
      // Generate QR code for pickup verification
      const qrToken = crypto.randomBytes(20).toString('hex');
      const qrPayload = JSON.stringify({
        token: qrToken,
        requestId: request._id.toString(),
        food: foodName
      });
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 300,
        margin: 2,
        color: { dark: '#2D6A4F', light: '#FFFFFF' }
      });

      request.qrToken = qrToken;
      request.qrCode = qrDataUrl;

      await FoodListing.findByIdAndUpdate(request.listingId, { status: 'claimed' });
      await Request.updateMany(
        { listingId: request.listingId, _id: { $ne: request._id }, status: 'pending' },
        { status: 'rejected', message: 'Another receiver was selected' }
      );
      await Notification.create({
        userId: request.receiverId,
        type: 'request_accepted',
        title: 'Request Accepted! 🎉',
        message: `Your pickup request for "${foodName}" has been accepted. Check your QR code for pickup!`,
        relatedId: request._id,
        relatedModel: 'Request'
      });
      // Email the receiver
      const receiver = await User.findById(request.receiverId);
      const donorUser = await User.findById(request.donorId);
      if (receiver && listing) {
        sendRequestAcceptedEmail(receiver, foodName, donorUser?.name || 'Donor', listing.location).catch(() => {});
      }
    }


    if (status === 'rejected') {
      await Notification.create({
        userId: request.receiverId,
        type: 'request_rejected',
        title: 'Request Declined',
        message: `Your pickup request for "${foodName}" was declined by the donor.`,
        relatedId: request._id,
        relatedModel: 'Request'
      });
    }

    // Manual completion (fallback if QR not used)
    if (status === 'completed') {
      await FoodListing.findByIdAndUpdate(request.listingId, { status: 'completed' });
      request.pickedUpAt = new Date();
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
      // Email both parties
      const receiverUser = await User.findById(request.receiverId);
      const donorUser2 = await User.findById(request.donorId);
      if (receiverUser) sendPickupCompletedEmail(receiverUser, foodName, 'receiver').catch(() => {});
      if (donorUser2) sendPickupCompletedEmail(donorUser2, foodName, 'donor').catch(() => {});
    }


    await request.save();
    res.json({ request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
