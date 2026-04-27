require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const requestRoutes = require('./routes/requests');
const adminRoutes = require('./routes/admin');
const analyzeRoutes = require('./routes/analyze');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', timestamp: new Date().toISOString() });
});

// Start server
const startServer = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (mongoUri) {
      // Real MongoDB (Atlas or local)
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB:', mongoUri.includes('mongodb+srv') ? 'Atlas' : 'Local');
    } else {
      // Fallback to in-memory (dev only)
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('⚠️  Connected to IN-MEMORY MongoDB (data lost on restart!)');
      console.log('   Set MONGO_URI in .env for persistent storage.');
    }

    console.log('SERVER BOOT: LIMIT 200MB IS ACTIVE');

    // Seed admin user
    const User = require('./models/User');
    const existingAdmin = await User.findOne({ email: 'admin@foodbridge.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: 'admin@foodbridge.com',
        password: 'admin123',
        role: 'admin',
        phone: '0000000000',
        address: 'System'
      });
      console.log('Default admin created: admin@foodbridge.com / admin123');
    }

    // Auto-expire cron: runs every 60 seconds
    const FoodListing = require('./models/FoodListing');
    const Request = require('./models/Request');
    const Notification = require('./models/Notification');
    setInterval(async () => {
      try {
        const now = new Date();
        const expiredListings = await FoodListing.find({
          status: 'available',
          expiryTime: { $lt: now }
        });
        if (expiredListings.length > 0) {
          const expiredIds = expiredListings.map(l => l._id);
          await FoodListing.updateMany(
            { _id: { $in: expiredIds } },
            { status: 'expired' }
          );
          await Request.updateMany(
            { listingId: { $in: expiredIds }, status: 'pending' },
            { status: 'rejected', message: 'Listing expired' }
          );
          // Notify donors about expired listings
          const donorNotifications = expiredListings.map(l => ({
            userId: l.donorId,
            type: 'listing_expired',
            title: 'Listing Expired',
            message: `Your listing "${l.foodType}" has expired and is no longer visible to receivers.`,
            relatedId: l._id,
            relatedModel: 'FoodListing'
          }));
          await Notification.insertMany(donorNotifications);
          console.log(`[Cron] Expired ${expiredListings.length} listing(s) + notified donors`);
        }
      } catch (err) {
        console.error('[Cron] Expiry check failed:', err.message);
      }
    }, 60000);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
