# SpeedySpoon Mobile App Deployment Guide

## Setup Instructions

### 1. SMS Notifications Setup
To enable SMS notifications for new orders, you need to set up Twilio:

1. Go to [Twilio](https://www.twilio.com) and create an account
2. Get your Account SID, Auth Token, and a Twilio phone number
3. Add these as secrets in your Supabase project

### 2. Mobile App Deployment

The app is now configured for mobile deployment with Capacitor.

#### For Local Development:
1. Export to GitHub and clone the repository
2. Run `npm install`
3. Add platforms: `npx cap add ios` and/or `npx cap add android`
4. Build the project: `npm run build`
5. Sync with native platforms: `npx cap sync`
6. Open in IDE: `npx cap run ios` or `npx cap run android`

#### Session Management:
- The app is configured with persistent sessions that work across mobile and web
- Sessions will persist when running locally and in mobile apps
- No timeout issues expected during development or deployment

#### App Store/Play Store:
- Capacitor configuration is set up for both platforms
- App ID: `app.lovable.140dbf6e66ea4ed5bbc32b0669d696a2`
- App Name: `speedy-spoon-mobile-eats`
- Ready for submission to both stores

### 3. Admin Notifications
- Admin will receive both in-app notifications and SMS messages
- SMS includes order ID, customer info, amount, delivery address, and item count
- Full order details (including spice levels) available in the admin dashboard

The app is now mobile-ready and will maintain session consistency across all platforms.