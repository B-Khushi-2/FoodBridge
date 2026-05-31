# FoodBridge - Food Redistribution System

**FoodBridge** is a premium, responsive, and robust food redistribution platform that connects food donors (restaurants, households, events) with receivers (NGOs, shelters, individuals, cattle owners) to minimize food waste and support communities. 

The system leverages AI image verification, real-time messaging, interactive maps, multi-language localization, and a secure 4-digit PIN-based pickup workflow.

---

## 🌟 Key Features

### 1. 🍽️ Donor Dashboard & Workflows
* **Post New Listings:** Easily add surplus food listings with details like food type, quantity, unit, allergens, suitability tags, pickup windows, and instructions.
* **AI Image Analyzer:** Built-in computer vision model (TensorFlow/MobileNet) that automatically scans food photos to verify if they contain food, estimates freshness, and flags/rejects suspicious uploads.
* **Verification Desk:** Verify receiver pickups securely by entering their 4-digit verification PIN.
* **Impact Tracking:** Dynamic stats displaying total food donated (kg), estimated meals enabled, and completed pickups.

### 2. 🤝 Receiver Dashboard & Workflows
* **Browse & Map View:** Search available listings in a list view or see them mapped nearby using Leaflet interactive maps.
* **Request & Claim Food:** Send claims for surplus listings with custom notes and arrival times.
* **Verification PIN:** Upon acceptance, a secure 4-digit PIN is generated and displayed in a digital card format with one-click copy support.
* **Impact and Badges:** Gamified progress dashboard tracking pickups, people served, active days, carbon footprint reduction (CO₂ saved), and unlockable achievement badges.

### 3. 🛡️ Admin Approval Desk
* **Operational Stats:** High-level metrics showing total users, active listings, and platform impact.
* **Verification Controls:** Verify new users and inspect reported or flagged listings.
* **Analytics Tabs:** Inspect active listings, user roles, ratings summary, and system-wide audit reports.

### 4. ⚡ Core Capabilities & Real-Time Sync
* **Real-Time Chat:** Dedicated socket-based messaging rooms to coordinate pickups, integrated with pre-set quick replies.
* **Persistent Notifications:** Live notification feed (e.g., listing accepted, request received, auto-expiring listings).
* **Multi-Language Support (i18n):** Real-time language switching (English, Hindi, etc.) configured via `i18next`.
* **PWA Capabilities:** Service worker configuration (`sw.js`) and manifest settings to enable offline capabilities.

---

## 🛠️ Technical Stack

* **Frontend:** React 18, TypeScript, Tailwind CSS, Vite, Radix UI Primitives, Lucide icons, Leaflet Maps, i18next (localization)
* **Backend:** Node.js, Express, MongoDB (Mongoose schemas), Socket.io (real-time chat), Nodemailer (email notifications)
* **AI/ML:** TensorFlow.js + MobileNet (automatic food image analysis & freshness prediction)

---

## 🚀 Running the App Locally

### 1. Install Dependencies
Run the following from the root directory to install all package dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add the following settings:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key

# Email configuration (Nodemailer SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Start Servers
You can start the backend and frontend dev servers concurrently:
```bash
# Start backend server (starts on http://localhost:5000)
cd server
node index.js

# Start frontend server (starts on http://localhost:5173)
cd ..
npm run dev
```

---

## 🔐 Seed Admin Credentials

To inspect the system administrator workspace, log in with the following default account:
* **Email:** `admin@foodbridge.com`
* **Password:** `admin123`

*(To test the donor and receiver screens, you can sign up for separate test accounts using the signup pages).*

---

## 🛡️ Verification Workflow (PIN-based)

To ensure secure handovers and eliminate legacy dependencies:
1. **Request:** A receiver claims a food listing.
2. **Acceptance:** The donor accepts the request. The backend auto-generates a secure 4-digit `pickupPin` and emails it to the receiver.
3. **Verification:** The receiver displays or shares the 4-digit PIN at the pickup location. The donor enters this PIN into their dashboard to verify and mark the transaction as **Completed**.
