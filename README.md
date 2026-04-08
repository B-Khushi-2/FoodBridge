# FoodBridge - Food Redistribution System

**FoodBridge** is a comprehensive food redistribution platform that connects food donors (restaurants, households, events) with food receivers (NGOs, shelters, individuals, cattle owners) to reduce food waste and help those in need.

This repository contains the full MERN stack source code.

---

## 🚀 Running the code

### 1. Install Dependencies
Run the following from the root directory to install all required dependencies (for both frontend and backend if using a concurrent script, or else install locally):
```bash
npm i
```

*(Note: Ensure you also install dependencies inside `/client` and `/server` if instructed by the package structure).*

### 2. Start the Development Server
```bash
npm run dev
```

---

## 🔐 Demo Credentials

Use the following credentials to access the **Admin Dashboard**:
- **Email:** `admin@foodbridge.com`
- **Password:** `admin123`

*(You can also register as a Donor or Receiver through the Sign Up pages.)*

---

## 🎨 App Structure & User Roles

### 1. Food Donors 🍽️
- Post food listings with photos, quantities, expiry times.
- Manage pickup requests from receivers.
- Track donation impact (meals enabled, CO2 saved).
- Real-time chat with receivers.

### 2. Food Receivers 🤝
- Browse available food listings nearby.
- Filter by distance, category, expiry time.
- Request pickups with estimated arrival time.
- Track request status (pending, confirmed, completed).
- Real-time chat with donors.

---

## 🎨 Design System Elements

### Color Palette
- **Primary Green**: `#2D6A4F` - Main brand color for donors
- **Secondary Orange**: `#F4A261` - Accent color for receivers  
- **Terracotta**: `#E76F51` - Call-to-action and urgency
- **Warm Background**: `#FAFAF7` - Soft off-white background
- **Success Green**: `#40916C` - Positive states
- **Error Red**: `#E63946` - Warnings and errors

### Typography
- **Display/Headings**: Fraunces 
- **Body/UI**: DM Sans 
- **Data/Numbers**: JetBrains Mono

---

## 🔧 Technical Details
- **Frontend Stack:** React, Radix UI primitives, Vite
- **Backend Stack:** Node.js, Express, MongoDB (Mongoose)

---

## 🌟 Future Enhancements
1. Image intelligence models (AI-based image verification)
2. Live Maps integration for routes
3. Push notifications
4. Multi-language support
5. Dark mode
