# 🎥 Google Meet System

A comprehensive system for generating Google Meet links and sharing them via multiple channels including Email (Gmail), WhatsApp, and Calendar events. Built with Next.js frontend and Express.js backend.

## ✨ Features

- **🚀 Instant Meet Link Generation**: Create Google Meet links with a single click
- **📧 Gmail Integration**: Send professional meeting invitations via Gmail API
- **📱 WhatsApp Integration**: Share meeting links through WhatsApp Business API
- **📅 Calendar Integration**: Automatically create Google Calendar events with Meet links
- **🔐 OAuth2 Authentication**: Secure Google authentication for enhanced features
- **⚡ Real-time Notifications**: Instant success/failure feedback for all actions
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **🛡️ Security First**: Environment variables for API keys, rate limiting, and CORS protection

## 🏗️ Architecture

```
├── frontend/          # Next.js application with Tailwind CSS
│   ├── components/    # Reusable UI components
│   ├── pages/         # Next.js pages
│   ├── lib/           # API client and utilities
│   └── styles/        # Global CSS and Tailwind config
│
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── config/    # Google OAuth configuration
│   │   ├── routes/    # API route handlers
│   │   └── services/  # Business logic (Email, WhatsApp, Calendar)
│   └── package.json
│
└── package.json       # Root package.json for running both apps
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Console account
- Twilio account (for WhatsApp integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd google-meet-system
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Configure environment variables** (see detailed setup below)

4. **Start the development servers**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:3001`.

## 🔧 Detailed Setup Instructions

### 1. Google Cloud Console Setup

#### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note down your Project ID

#### Step 2: Enable Required APIs
Enable the following APIs in your Google Cloud Console:
- Google Calendar API
- Gmail API
- Google Meet API (if available in your region)

Navigate to "APIs & Services" → "Library" and search for each API to enable them.

#### Step 3: Create OAuth2 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
5. Download the credentials JSON file

#### Step 4: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Fill in required information:
   - App name: "Google Meet System"
   - User support email: Your email
   - Scopes: Add the following scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
     - `https://www.googleapis.com/auth/gmail.send`

### 2. Twilio WhatsApp Setup

#### Step 1: Create Twilio Account
1. Sign up at [Twilio](https://www.twilio.com/)
2. Verify your phone number and email

#### Step 2: Set up WhatsApp Sandbox
1. Go to Console → Develop → Messaging → Try it out → Send a WhatsApp message
2. Follow the instructions to connect your WhatsApp number to the sandbox
3. Note down:
   - Account SID
   - Auth Token
   - WhatsApp Sandbox Number

#### Step 3: Production Setup (Optional)
For production use, you'll need to:
1. Apply for WhatsApp Business API access
2. Complete business verification
3. Set up approved message templates

### 3. Environment Configuration

#### Backend Configuration (`backend/.env`)
```bash
# Copy the example file
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Meeting Defaults
DEFAULT_MEETING_DURATION=60
DEFAULT_MEETING_TIMEZONE=America/New_York
```

#### Frontend Configuration (`frontend/.env.local`)
```bash
# Copy the example file
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

## 🎯 Usage Guide

### Without Authentication
1. Open the application
2. Configure meeting details (title, duration, etc.)
3. Select "Send via WhatsApp" if desired
4. Click "Generate Meeting Link"
5. Copy the link or send via WhatsApp

### With Google Authentication
1. Click "Sign in with Google"
2. Complete OAuth flow in popup window
3. Configure meeting details and attendees
4. Select sharing options:
   - ✅ Send via Email (Gmail)
   - ✅ Send via WhatsApp
   - ✅ Add to Calendar
5. Enter recipient email addresses and/or phone numbers
6. Click "Generate Meeting Link"
7. System will automatically:
   - Create calendar event with Meet link
   - Send email invitations
   - Send WhatsApp messages
   - Show success/failure status for each action

## 📚 API Documentation

### Authentication Endpoints

#### `GET /auth/google`
Initiate Google OAuth2 flow
```json
{
  "authUrl": "https://accounts.google.com/oauth2/auth?..."
}
```

#### `GET /auth/google/callback`
Handle OAuth2 callback (redirects to frontend)

#### `GET /auth/status?session={sessionId}`
Check authentication status
```json
{
  "authenticated": true,
  "sessionId": "abc123",
  "hasTokens": true
}
```

### Meeting Endpoints

#### `POST /api/meet/generate`
Generate meeting with calendar integration
```json
{
  "session": "session_id",
  "meetingDetails": {
    "title": "Team Meeting",
    "description": "Weekly sync",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "timezone": "America/New_York",
    "attendees": ["user@example.com"]
  }
}
```

#### `POST /api/meet/generate-simple`
Generate simple meeting link (no auth required)
```json
{
  "success": true,
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "meetingId": "abc-defg-hij"
}
```

### Notification Endpoints

#### `POST /api/notifications/send`
Send via multiple channels
```json
{
  "session": "session_id",
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "meetingDetails": {...},
  "notifications": {
    "email": { "subject": "Meeting Invitation" },
    "whatsapp": {},
    "calendar": {}
  },
  "recipients": {
    "email": ["user1@example.com", "user2@example.com"],
    "whatsapp": ["+1234567890", "+0987654321"]
  }
}
```

## 🔧 Development

### Project Structure

#### Backend Services
- **AuthService**: Google OAuth2 authentication
- **MeetService**: Google Meet link generation
- **EmailService**: Gmail API integration
- **WhatsAppService**: Twilio WhatsApp integration
- **CalendarService**: Google Calendar API integration

#### Frontend Components
- **MeetingGenerator**: Main interface for creating meetings
- **AuthStatus**: Authentication state management
- **UI Components**: Reusable button, input, card components

### Adding New Platforms

The system is designed to be extensible. To add new platforms (Slack, Teams, Zoom):

1. **Create new service** in `backend/src/services/`
2. **Add configuration** to environment variables
3. **Update notification routes** in `backend/src/routes/notifications.js`
4. **Add UI controls** in `frontend/components/MeetingGenerator.js`

Example service structure:
```javascript
class SlackService {
  async sendMeetingInvite(messageData) {
    // Implementation
  }
}
```

### Testing

#### Backend Testing
```bash
cd backend
npm test
```

#### Frontend Testing
```bash
cd frontend
npm test
```

### Production Deployment

#### Environment Setup
1. Set `NODE_ENV=production`
2. Use production OAuth redirect URIs
3. Configure production database (recommended)
4. Set up proper session storage (Redis recommended)

#### Security Considerations
- Use HTTPS in production
- Implement proper session management
- Regular security audits
- Monitor API usage and rate limits

## 🐛 Troubleshooting

### Common Issues

#### "Invalid client" error
- Verify Google Client ID and Secret
- Check OAuth redirect URI configuration
- Ensure APIs are enabled in Google Cloud Console

#### WhatsApp messages not sending
- Verify Twilio credentials
- Check WhatsApp sandbox setup
- Ensure phone numbers are in correct format (+1234567890)

#### Calendar events not creating
- Verify Google Calendar API is enabled
- Check OAuth scopes include calendar permissions
- Ensure proper authentication

#### CORS errors
- Check `FRONTEND_URL` environment variable
- Verify CORS configuration in backend

### Debug Mode
Enable detailed logging:
```bash
DEBUG=* npm run dev
```

### API Rate Limits
Be aware of the following rate limits:
- Google Calendar API: 1,000,000 requests/day
- Gmail API: 1,000,000,000 quota units/day
- Twilio: Varies by account type

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Submit a pull request

### Code Style
- Use ESLint configuration provided
- Follow React/Next.js best practices
- Write clear, documented code
- Include error handling

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google APIs for meeting and calendar integration
- Twilio for WhatsApp messaging capabilities
- Next.js and React communities
- Tailwind CSS for beautiful styling

---

**Need help?** Open an issue on GitHub or check the troubleshooting section above.