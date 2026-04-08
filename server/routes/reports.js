const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { verifyImage } = require('../ml/imageVerifier');

// POST /api/reports — submit a report with image verification
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { reportType, title, description, image, listingId } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Report title is required' });
    }
    if (!image) {
      return res.status(400).json({ error: 'Report image is required' });
    }

    // Create report with pending status
    const report = new Report({
      reporterId: req.user._id,
      listingId: listingId || undefined,
      reportType: reportType || 'food_quality',
      title,
      description: description || '',
      image,
      status: 'Pending',
      imageVerification: { overallVerdict: 'Pending' }
    });

    await report.save();

    // Run ML verification (async — update report when done)
    try {
      console.log(`[Reports] Running ML verification for report ${report._id}...`);
      const { verification, reportStatus } = await verifyImage(image, title, description);
      report.imageVerification = verification;
      report.status = reportStatus;
      await report.save();
      console.log(`[Reports] Report ${report._id}: verdict=${verification.overallVerdict}, status=${reportStatus}`);
    } catch (mlErr) {
      console.error('[Reports] ML verification failed:', mlErr.message);
      report.imageVerification.overallVerdict = 'Pending';
      report.imageVerification.details = 'ML verification encountered an error: ' + mlErr.message;
      await report.save();
    }

    // Populate reporter info before returning
    await report.populate('reporterId', 'name email role');
    if (report.listingId) {
      await report.populate('listingId', 'foodType quantity');
    }

    res.status(201).json({ report });
  } catch (err) {
    console.error('[Reports] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/admin — all reports for admin dashboard
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email role')
      .populate('listingId', 'foodType quantity status')
      .sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reports/:id/reverify — re-run ML analysis (admin only)
router.post('/:id/reverify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    if (!report.image) {
      return res.status(400).json({ error: 'Report has no image to verify' });
    }

    console.log(`[Reports] Re-verifying report ${report._id}...`);
    const { verification, reportStatus } = await verifyImage(report.image, report.title, report.description);
    report.imageVerification = verification;
    report.status = reportStatus;
    await report.save();

    await report.populate('reporterId', 'name email role');
    if (report.listingId) {
      await report.populate('listingId', 'foodType quantity status');
    }

    res.json({ report });
  } catch (err) {
    console.error('[Reports] Re-verify error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
