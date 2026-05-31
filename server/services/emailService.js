const nodemailer = require('nodemailer');

// Create transporter — uses Gmail by default. Set EMAIL_USER + EMAIL_PASS in .env
// For testing without real credentials, logs to console.
let transporter = null;

const initTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] EMAIL_USER/EMAIL_PASS not set — emails will be logged to console only.');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS  // Use Gmail App Password (not your real password)
    }
  });
};

const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) transporter = initTransporter();

  if (!transporter) {
    // Fallback: just log
    console.log(`\n[Email MOCK] To: ${to}\n  Subject: ${subject}\n  (Set EMAIL_USER + EMAIL_PASS in .env to send real emails)\n`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"FoodBridge 🌿" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
  }
};

// ─── Email Templates ────────────────────────────────────────────────────────

const emailBase = (content) => `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width:560px; margin:0 auto; background:#f9faf7; border-radius:16px; overflow:hidden;">
  <div style="background:#2D6A4F; padding:24px 32px;">
    <h1 style="color:white; margin:0; font-size:22px;">🌿 FoodBridge</h1>
    <p style="color:rgba(255,255,255,0.8); margin:4px 0 0; font-size:13px;">Connecting surplus food to those who need it</p>
  </div>
  <div style="padding:32px; background:white;">
    ${content}
  </div>
  <div style="padding:16px 32px; background:#f0f4f0; text-align:center;">
    <p style="color:#666; font-size:12px; margin:0;">FoodBridge — Reducing food waste, one meal at a time 🌍</p>
  </div>
</div>
`;

const btn = (text, href) =>
  `<a href="${href || '#'}" style="display:inline-block; background:#2D6A4F; color:white; padding:12px 28px; border-radius:50px; text-decoration:none; font-weight:600; margin-top:16px;">${text}</a>`;

// Welcome email after registration
const sendWelcomeEmail = (user) => sendEmail({
  to: user.email,
  subject: '🌿 Welcome to FoodBridge!',
  html: emailBase(`
    <h2 style="color:#1A1A1A;">Welcome, ${user.name}! 👋</h2>
    <p style="color:#555;">You've joined FoodBridge as a <strong>${user.role}</strong>. Thank you for being part of our mission to reduce food waste.</p>
    ${user.role === 'donor' ? '<p style="color:#555;">Start posting your surplus food listings and help families in need! 🥗</p>' : ''}
    ${user.role === 'receiver' ? '<p style="color:#555;">Browse available food near you and request pickups. Together we can reduce waste! 🌱</p>' : ''}
    ${btn('Open FoodBridge', 'http://localhost:5173')}
  `)
});

// Notify donor: new pickup request received
const sendPickupRequestEmail = (donor, receiver, foodName) => sendEmail({
  to: donor.email,
  subject: `📦 New Pickup Request for "${foodName}"`,
  html: emailBase(`
    <h2 style="color:#1A1A1A;">New Pickup Request! 🎉</h2>
    <p style="color:#555;"><strong>${receiver.name}</strong> wants to pick up your <strong>"${foodName}"</strong> listing.</p>
    <p style="color:#555;">Log in to accept or decline the request before it expires.</p>
    ${btn('View Request', 'http://localhost:5173/donor/pickup-requests')}
  `)
});

// Notify receiver: request accepted
const sendRequestAcceptedEmail = (receiver, foodName, donorName, location) => sendEmail({
  to: receiver.email,
  subject: `✅ Your pickup request for "${foodName}" was accepted!`,
  html: emailBase(`
    <h2 style="color:#1A1A1A;">Request Accepted! 🎊</h2>
    <p style="color:#555;">Great news! <strong>${donorName}</strong> accepted your request for <strong>"${foodName}"</strong>.</p>
    <p style="color:#555;">📍 Pickup location: <strong>${location}</strong></p>
    <p style="color:#555;">Check your app for your 4-digit pickup PIN to show the donor at pickup.</p>
    ${btn('View My Requests', 'http://localhost:5173/receiver/my-requests')}
  `)
});

// Notify both: pickup completed
const sendPickupCompletedEmail = (user, foodName, role) => sendEmail({
  to: user.email,
  subject: `🌍 Pickup Completed — "${foodName}"`,
  html: emailBase(`
    <h2 style="color:#1A1A1A;">${role === 'donor' ? 'Your donation was picked up! 🙏' : 'Food received successfully! 🌱'}</h2>
    <p style="color:#555;">${
      role === 'donor'
        ? `Your <strong>"${foodName}"</strong> listing was successfully picked up. Thank you for your generosity!`
        : `You successfully received <strong>"${foodName}"</strong>. Thank you for helping reduce food waste!`
    }</p>
    <p style="color:#555;">Every donation makes a difference. Keep it up! 💚</p>
    ${btn('View Impact Report', 'http://localhost:5173/impact')}
  `)
});

// Notify donor: listing expiry warning
const sendExpiryWarningEmail = (donor, foodName, expiryTime) => sendEmail({
  to: donor.email,
  subject: `⚠️ Listing expiring soon: "${foodName}"`,
  html: emailBase(`
    <h2 style="color:#E76F51;">Expiry Warning ⏰</h2>
    <p style="color:#555;">Your listing <strong>"${foodName}"</strong> is expiring at <strong>${new Date(expiryTime).toLocaleString()}</strong>.</p>
    <p style="color:#555;">If no one has claimed it yet, consider extending the listing or arranging alternative distribution.</p>
    ${btn('View My Listings', 'http://localhost:5173/donor/my-listings')}
  `)
});

// Notify receiver: new listing nearby (optional broadcast)
const sendNewListingEmail = (receiver, foodName, donorName, location) => sendEmail({
  to: receiver.email,
  subject: `🥗 New food available: "${foodName}" near you`,
  html: emailBase(`
    <h2 style="color:#1A1A1A;">New Food Available! 🥗</h2>
    <p style="color:#555;"><strong>${donorName}</strong> just listed <strong>"${foodName}"</strong> available near <strong>${location}</strong>.</p>
    <p style="color:#555;">Hurry — it's first come, first served!</p>
    ${btn('Browse Listings', 'http://localhost:5173/receiver/browse')}
  `)
});

module.exports = {
  sendWelcomeEmail,
  sendPickupRequestEmail,
  sendRequestAcceptedEmail,
  sendPickupCompletedEmail,
  sendExpiryWarningEmail,
  sendNewListingEmail
};
