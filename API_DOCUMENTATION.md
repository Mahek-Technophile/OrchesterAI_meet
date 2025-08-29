# 📚 API Documentation - Google Meet System

Complete API reference for the Google Meet System backend.

## 🔗 Base URL

```
Local Development: http://localhost:3001
Production: https://your-domain.com
```

## 🔐 Authentication

The API uses session-based authentication with Google OAuth2. Some endpoints require authentication while others work without it.

### Authentication Flow

1. **Initiate OAuth**: `GET /auth/google`
2. **User completes OAuth in popup**
3. **Callback**: `GET /auth/google/callback`
4. **Use session ID** in subsequent requests

## 📋 API Endpoints

### Authentication Endpoints

#### `GET /auth/google`

Initiate Google OAuth2 authentication flow.

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/oauth2/auth?client_id=..."
}
```

**Example:**
```javascript
const response = await fetch('/auth/google');
const { authUrl } = await response.json();
window.open(authUrl, 'auth', 'width=500,height=600');
```

---

#### `GET /auth/google/callback`

Handle OAuth2 callback (redirects to frontend).

**Query Parameters:**
- `code` (string): Authorization code from Google
- `state` (string, optional): State parameter

**Redirects to:**
- Success: `${FRONTEND_URL}/?session={sessionId}&auth=success`
- Error: `${FRONTEND_URL}/?auth=error&message={errorMessage}`

---

#### `GET /auth/status`

Check authentication status for a session.

**Query Parameters:**
- `session` (string): Session ID

**Response:**
```json
{
  "authenticated": true,
  "sessionId": "abc123xyz",
  "hasTokens": true
}
```

**Example:**
```javascript
const response = await fetch('/auth/status?session=abc123xyz');
const status = await response.json();
```

---

#### `POST /auth/logout`

Logout and invalidate session.

**Request Body:**
```json
{
  "session": "abc123xyz"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Meeting Endpoints

#### `POST /api/meet/generate`

Generate a Google Meet link with calendar integration (requires authentication).

**Request Body:**
```json
{
  "session": "abc123xyz",
  "meetingDetails": {
    "title": "Team Meeting",
    "description": "Weekly team sync",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "timezone": "America/New_York",
    "attendees": ["user1@example.com", "user2@example.com"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "eventId": "event123",
  "eventDetails": {
    "title": "Team Meeting",
    "description": "Weekly team sync",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "timezone": "America/New_York",
    "htmlLink": "https://calendar.google.com/event?eid=..."
  },
  "conferenceData": {
    "entryPoints": [
      {
        "entryPointType": "video",
        "uri": "https://meet.google.com/abc-defg-hij"
      }
    ]
  }
}
```

---

#### `POST /api/meet/generate-simple`

Generate a simple Google Meet link (no authentication required).

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "meetingId": "abc-defg-hij",
  "note": "This is a generic Meet link. For calendar integration, use the full meeting generation."
}
```

---

#### `PUT /api/meet/update/:eventId`

Update an existing meeting.

**URL Parameters:**
- `eventId` (string): Google Calendar event ID

**Request Body:**
```json
{
  "session": "abc123xyz",
  "updates": {
    "title": "Updated Meeting Title",
    "description": "Updated description",
    "startTime": "2024-01-15T11:00:00Z",
    "endTime": "2024-01-15T12:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "event123",
  "eventDetails": { /* updated event data */ },
  "message": "Event updated successfully"
}
```

---

#### `DELETE /api/meet/delete/:eventId`

Delete a meeting.

**URL Parameters:**
- `eventId` (string): Google Calendar event ID

**Request Body:**
```json
{
  "session": "abc123xyz"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meeting deleted successfully"
}
```

---

### Notification Endpoints

#### `POST /api/notifications/send`

Send meeting notifications via multiple channels.

**Request Body:**
```json
{
  "session": "abc123xyz",
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "meetingDetails": {
    "title": "Team Meeting",
    "description": "Weekly sync",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "timezone": "America/New_York"
  },
  "notifications": {
    "email": {
      "subject": "Meeting Invitation - Team Meeting"
    },
    "whatsapp": {},
    "calendar": {
      "reminders": [
        { "method": "email", "minutes": 10 },
        { "method": "popup", "minutes": 5 }
      ]
    }
  },
  "recipients": {
    "email": ["user1@example.com", "user2@example.com"],
    "whatsapp": ["+1234567890", "+0987654321"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "totalAttempts": 3,
  "successCount": 2,
  "failureCount": 1,
  "results": {
    "email": {
      "success": true,
      "messageId": "msg123",
      "recipients": ["user1@example.com", "user2@example.com"],
      "message": "Email sent successfully"
    },
    "whatsapp": {
      "success": true,
      "totalSent": 2,
      "totalFailed": 0,
      "results": [
        {
          "success": true,
          "phoneNumber": "+1234567890",
          "messageId": "SM123",
          "status": "queued"
        }
      ]
    },
    "calendar": {
      "success": false,
      "error": "Calendar event creation failed"
    }
  },
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "meetingDetails": { /* meeting details */ }
}
```

---

#### `POST /api/notifications/email`

Send email notification only.

**Request Body:**
```json
{
  "session": "abc123xyz",
  "to": ["user1@example.com", "user2@example.com"],
  "subject": "Meeting Invitation",
  "body": "Custom email body (optional)",
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "meetingDetails": {
    "title": "Team Meeting",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg123",
  "recipients": ["user1@example.com", "user2@example.com"],
  "message": "Email sent successfully"
}
```

---

#### `POST /api/notifications/whatsapp`

Send WhatsApp message only.

**Request Body:**
```json
{
  "to": ["+1234567890", "+0987654321"],
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "meetingDetails": {
    "title": "Team Meeting",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z"
  },
  "customMessage": "Optional custom message"
}
```

**Response:**
```json
{
  "success": true,
  "totalSent": 2,
  "totalFailed": 0,
  "results": [
    {
      "success": true,
      "phoneNumber": "+1234567890",
      "messageId": "SM123",
      "status": "queued"
    },
    {
      "success": true,
      "phoneNumber": "+0987654321",
      "messageId": "SM124",
      "status": "queued"
    }
  ],
  "message": "Sent to 2/2 recipients"
}
```

---

#### `POST /api/notifications/calendar`

Create calendar event only.

**Request Body:**
```json
{
  "session": "abc123xyz",
  "eventData": {
    "title": "Team Meeting",
    "description": "Weekly team sync",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "timezone": "America/New_York",
    "attendees": ["user1@example.com"],
    "location": "Google Meet",
    "reminders": [
      { "method": "email", "minutes": 10 }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "event123",
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "htmlLink": "https://calendar.google.com/event?eid=...",
  "eventDetails": {
    "title": "Team Meeting",
    "description": "Weekly team sync",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "timezone": "America/New_York",
    "location": "Google Meet",
    "attendees": [
      { "email": "user1@example.com" }
    ],
    "status": "confirmed"
  }
}
```

---

#### `POST /api/notifications/reminders`

Send meeting reminders.

**Request Body:**
```json
{
  "session": "abc123xyz",
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "meetingDetails": {
    "title": "Team Meeting",
    "startTime": "2024-01-15T10:00:00Z"
  },
  "recipients": {
    "email": ["user1@example.com"],
    "whatsapp": ["+1234567890"]
  },
  "reminderTypes": ["email", "whatsapp"],
  "minutesBeforeMeeting": 15
}
```

**Response:**
```json
{
  "success": true,
  "totalAttempts": 2,
  "successCount": 2,
  "results": {
    "email": {
      "success": true,
      "messageId": "reminder123",
      "recipients": ["user1@example.com"]
    },
    "whatsapp": {
      "success": true,
      "totalSent": 1,
      "results": [
        {
          "success": true,
          "phoneNumber": "+1234567890",
          "messageId": "SM125"
        }
      ]
    }
  },
  "minutesBeforeMeeting": 15
}
```

---

#### `GET /api/notifications/whatsapp/status`

Check WhatsApp service status.

**Response:**
```json
{
  "success": true,
  "status": "connected",
  "accountSid": "AC123...",
  "accountStatus": "active",
  "whatsappNumber": "whatsapp:+14155238886"
}
```

---

#### `GET /api/notifications/whatsapp/status/:messageId`

Get WhatsApp message delivery status.

**URL Parameters:**
- `messageId` (string): Twilio message SID

**Response:**
```json
{
  "success": true,
  "messageId": "SM123",
  "status": "delivered",
  "to": "whatsapp:+1234567890",
  "from": "whatsapp:+14155238886",
  "dateCreated": "2024-01-15T09:45:00Z",
  "dateUpdated": "2024-01-15T09:46:00Z",
  "errorCode": null,
  "errorMessage": null
}
```

---

### Utility Endpoints

#### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:00:00Z",
  "service": "Google Meet System API"
}
```

---

## 🚨 Error Handling

All endpoints return errors in the following format:

**Error Response:**
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing parameters, invalid data)
- `401` - Unauthorized (invalid session, authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (endpoint or resource not found)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## 📝 Data Types

### Meeting Details Object
```typescript
{
  title?: string;
  description?: string;
  startTime?: string; // ISO 8601 format
  endTime?: string;   // ISO 8601 format
  timezone?: string;  // IANA timezone
  attendees?: string[]; // Email addresses
  location?: string;
}
```

### Notification Options
```typescript
{
  email?: {
    subject?: string;
    body?: string;
  };
  whatsapp?: {
    message?: string;
  };
  calendar?: {
    reminders?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}
```

### Recipients Object
```typescript
{
  email?: string[]; // Email addresses
  whatsapp?: string[]; // Phone numbers with country code
}
```

---

## 🔧 Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 10 requests per minute per IP
- **WhatsApp**: Limited by Twilio account type

---

## 🔐 Security

- **API Keys**: Store in environment variables, never in code
- **Sessions**: Expire after inactivity
- **CORS**: Configured for specific origins
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Prevents abuse

---

## 📱 SDK/Client Libraries

### JavaScript/TypeScript

```javascript
import { authAPI, meetingAPI, notificationsAPI } from './lib/api';

// Generate meeting
const result = await meetingAPI.generateMeetLink(sessionId, {
  title: 'Team Meeting',
  startTime: new Date().toISOString(),
  attendees: ['user@example.com']
});

// Send notifications
await notificationsAPI.sendNotifications(sessionId, {
  meetLink: result.data.meetLink,
  notifications: { email: true, whatsapp: true },
  recipients: {
    email: ['user@example.com'],
    whatsapp: ['+1234567890']
  }
});
```

---

## 🧪 Testing

Use tools like Postman, curl, or HTTPie to test the API:

```bash
# Health check
curl http://localhost:3001/health

# Generate simple meeting
curl -X POST http://localhost:3001/api/meet/generate-simple \
  -H "Content-Type: application/json" \
  -d '{}'

# Check auth status
curl "http://localhost:3001/auth/status?session=your_session_id"
```

---

## 📞 Support

For API support:
- Check error messages and status codes
- Verify environment variable configuration
- Ensure proper authentication flow
- Check rate limits and quotas