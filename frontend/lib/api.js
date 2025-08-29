import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Initiate Google OAuth
  initiateGoogleAuth: () => api.get('/auth/google'),
  
  // Check authentication status
  checkAuthStatus: (sessionId) => 
    api.get('/auth/status', { params: { session: sessionId } }),
  
  // Logout
  logout: (sessionId) => 
    api.post('/auth/logout', { session: sessionId }),
};

// Meeting API
export const meetingAPI = {
  // Generate meeting link with calendar event
  generateMeetLink: (sessionId, meetingDetails) =>
    api.post('/api/meet/generate', {
      session: sessionId,
      meetingDetails,
    }),
  
  // Generate simple meeting link (no calendar)
  generateSimpleMeetLink: () =>
    api.post('/api/meet/generate-simple'),
  
  // Update meeting
  updateMeeting: (sessionId, eventId, updates) =>
    api.put(`/api/meet/update/${eventId}`, {
      session: sessionId,
      updates,
    }),
  
  // Delete meeting
  deleteMeeting: (sessionId, eventId) =>
    api.delete(`/api/meet/delete/${eventId}`, {
      data: { session: sessionId },
    }),
};

// Notifications API
export const notificationsAPI = {
  // Send notifications via multiple channels
  sendNotifications: (sessionId, data) =>
    api.post('/api/notifications/send', {
      session: sessionId,
      ...data,
    }),
  
  // Send email only
  sendEmail: (sessionId, emailData) =>
    api.post('/api/notifications/email', {
      session: sessionId,
      ...emailData,
    }),
  
  // Send WhatsApp only
  sendWhatsApp: (data) =>
    api.post('/api/notifications/whatsapp', data),
  
  // Create calendar event only
  createCalendarEvent: (sessionId, eventData) =>
    api.post('/api/notifications/calendar', {
      session: sessionId,
      eventData,
    }),
  
  // Send reminders
  sendReminders: (sessionId, reminderData) =>
    api.post('/api/notifications/reminders', {
      session: sessionId,
      ...reminderData,
    }),
  
  // Check WhatsApp service status
  checkWhatsAppStatus: () =>
    api.get('/api/notifications/whatsapp/status'),
  
  // Get message status
  getMessageStatus: (messageId) =>
    api.get(`/api/notifications/whatsapp/status/${messageId}`),
};

// Utility functions
export const utils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || error.response.data?.error || 'Server error',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0,
        data: null,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'Unknown error occurred',
        status: 0,
        data: null,
      };
    }
  },
  
  // Format date for API
  formatDateForAPI: (date) => {
    return new Date(date).toISOString();
  },
  
  // Parse URL parameters
  getUrlParams: () => {
    if (typeof window === 'undefined') return {};
    
    const params = new URLSearchParams(window.location.search);
    const result = {};
    
    for (let [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  },
  
  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validate phone number format
  isValidPhoneNumber: (phone) => {
    const phoneRegex = /^\+\d{10,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  },
  
  // Format phone number
  formatPhoneNumber: (phone) => {
    let formatted = phone.replace(/[\s\-\(\)]/g, '');
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    return formatted;
  },
};

export default api;