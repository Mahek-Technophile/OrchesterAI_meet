# 🚀 Setup Guide - Google Meet System

This guide will walk you through setting up the Google Meet System step by step.

## 📋 Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js 18 or later installed
- [ ] npm or yarn package manager
- [ ] A Google account
- [ ] A Twilio account (for WhatsApp features)
- [ ] Basic knowledge of environment variables

## 🎯 Step-by-Step Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repository-url>
cd google-meet-system

# Install all dependencies for both frontend and backend
npm run setup
```

### Step 2: Google Cloud Console Configuration

#### 2.1 Create a Google Cloud Project

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `google-meet-system`
4. Click "Create"
5. Wait for project creation to complete

#### 2.2 Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search and enable the following APIs:
   - **Google Calendar API**
   - **Gmail API**
   - **Google Meet API** (if available)

For each API:
- Click on the API name
- Click "Enable"
- Wait for activation

#### 2.3 Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in the application information:
   - **App name**: `Google Meet System`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click "Save and Continue"
5. On the "Scopes" page, click "Add or Remove Scopes"
6. Add these scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/gmail.send`
7. Click "Save and Continue"
8. Add test users (your email address)
9. Click "Save and Continue"

#### 2.4 Create OAuth2 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Set the name: `Google Meet System`
5. Add Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:3001`
6. Add Authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback`
7. Click "Create"
8. **Important**: Copy the Client ID and Client Secret

### Step 3: Twilio WhatsApp Configuration

#### 3.1 Create Twilio Account

1. Go to [Twilio](https://www.twilio.com/)
2. Sign up for a free account
3. Verify your phone number and email

#### 3.2 Get Twilio Credentials

1. From the Twilio Console dashboard
2. Note down your:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click the eye icon to reveal)

#### 3.3 Set Up WhatsApp Sandbox

1. In Twilio Console, go to "Develop" → "Messaging" → "Try it out" → "Send a WhatsApp message"
2. Follow the instructions to join the sandbox:
   - Send the provided message to the Twilio WhatsApp number
   - This links your phone number to the sandbox
3. Note the sandbox WhatsApp number (usually `+1 415 523 8886`)

### Step 4: Environment Configuration

#### 4.1 Backend Environment

```bash
# Create backend environment file
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values:

```env
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_client_id_from_step_2.4
GOOGLE_CLIENT_SECRET=your_client_secret_from_step_2.4
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_from_step_3.2
TWILIO_AUTH_TOKEN=your_auth_token_from_step_3.2
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Meeting Defaults
DEFAULT_MEETING_DURATION=60
DEFAULT_MEETING_TIMEZONE=America/New_York
```

#### 4.2 Frontend Environment

```bash
# Create frontend environment file
cp frontend/.env.local.example frontend/.env.local
```

Edit `frontend/.env.local`:

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Application Configuration
NEXT_PUBLIC_APP_NAME=Google Meet System
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Step 5: Test the Setup

#### 5.1 Start the Development Servers

```bash
# Start both frontend and backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📱 Frontend URL: http://localhost:3000
🌍 Environment: development
```

#### 5.2 Test Basic Functionality

1. Open `http://localhost:3000` in your browser
2. You should see the Google Meet System homepage
3. Try generating a simple meeting link (without authentication)
4. Click "Generate Meeting Link" - you should get a Meet link

#### 5.3 Test Google Authentication

1. Click "Sign in with Google"
2. A popup should open with Google OAuth
3. Sign in with your Google account
4. Accept the permissions
5. You should be redirected back and see "Authenticated" status

#### 5.4 Test WhatsApp Integration

1. Select "Send via WhatsApp"
2. Enter your phone number (the one connected to Twilio sandbox)
3. Generate a meeting and send WhatsApp message
4. You should receive a WhatsApp message with the meeting link

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue: "Error 400: redirect_uri_mismatch"
**Solution**: Check your OAuth2 redirect URI in Google Cloud Console
- Go to "APIs & Services" → "Credentials"
- Edit your OAuth client
- Ensure `http://localhost:3001/auth/google/callback` is in authorized redirect URIs

#### Issue: "WhatsApp messages not sending"
**Solution**: Verify your Twilio setup
- Ensure you've joined the WhatsApp sandbox
- Check your phone number format (+1234567890)
- Verify Twilio credentials are correct

#### Issue: "Calendar API not enabled"
**Solution**: Enable the Google Calendar API
- Go to Google Cloud Console → "APIs & Services" → "Library"
- Search for "Google Calendar API"
- Click "Enable"

#### Issue: "CORS errors in browser"
**Solution**: Check your environment variables
- Ensure `FRONTEND_URL=http://localhost:3000` in backend/.env
- Restart the backend server after changes

#### Issue: "Authentication popup blocked"
**Solution**: Allow popups for localhost
- Check browser popup blocker settings
- Add localhost to popup exceptions

### Getting Help

If you encounter issues:

1. Check the [README.md](README.md) troubleshooting section
2. Verify all environment variables are set correctly
3. Check the browser console for error messages
4. Check the backend console for error logs

### Debug Mode

For detailed logging:

```bash
# Backend debug
cd backend
DEBUG=* npm run dev

# Frontend debug
cd frontend
npm run dev
```

## ✅ Final Checklist

Before considering setup complete, verify:

- [ ] Both servers start without errors
- [ ] Homepage loads at http://localhost:3000
- [ ] Simple meeting link generation works
- [ ] Google authentication works (popup opens and closes)
- [ ] WhatsApp message can be sent (if configured)
- [ ] No CORS errors in browser console

## 🎉 You're All Set!

Your Google Meet System is now ready to use. You can:

1. Generate Google Meet links instantly
2. Send invitations via email (with authentication)
3. Send meeting links via WhatsApp
4. Create calendar events with Meet links
5. Manage meeting attendees and settings

Enjoy your streamlined meeting workflow! 🚀