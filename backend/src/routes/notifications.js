const express = require('express');
const EmailService = require('../services/emailService');
const WhatsAppService = require('../services/whatsappService');
const CalendarService = require('../services/calendarService');
const authRoutes = require('./auth');

const router = express.Router();
const emailService = new EmailService();
const whatsappService = new WhatsAppService();
const calendarService = new CalendarService();

/**
 * Send meeting notifications via multiple channels
 */
router.post('/send', async (req, res) => {
  try {
    const {
      session,
      meetLink,
      meetingDetails,
      notifications,
      recipients
    } = req.body;

    if (!session) {
      return res.status(401).json({ error: 'Session ID required' });
    }

    if (!meetLink) {
      return res.status(400).json({ error: 'Meeting link is required' });
    }

    if (!notifications || Object.keys(notifications).length === 0) {
      return res.status(400).json({ error: 'At least one notification method must be selected' });
    }

    const tokens = authRoutes.getSessionTokens(session);
    const results = {};

    // Send email notifications
    if (notifications.email && recipients.email && recipients.email.length > 0) {
      try {
        if (!tokens) {
          throw new Error('Authentication required for email sending');
        }

        const emailResult = await emailService.sendEmail(tokens, {
          to: recipients.email,
          subject: notifications.email.subject,
          body: notifications.email.body,
          meetLink,
          meetingDetails
        });

        results.email = {
          success: true,
          ...emailResult
        };
      } catch (error) {
        console.error('Email sending failed:', error);
        results.email = {
          success: false,
          error: error.message
        };
      }
    }

    // Send WhatsApp notifications
    if (notifications.whatsapp && recipients.whatsapp && recipients.whatsapp.length > 0) {
      try {
        const whatsappResult = await whatsappService.sendMeetingInvite({
          to: recipients.whatsapp,
          meetLink,
          meetingDetails,
          customMessage: notifications.whatsapp.message
        });

        results.whatsapp = {
          success: true,
          ...whatsappResult
        };
      } catch (error) {
        console.error('WhatsApp sending failed:', error);
        results.whatsapp = {
          success: false,
          error: error.message
        };
      }
    }

    // Create calendar event
    if (notifications.calendar) {
      try {
        if (!tokens) {
          throw new Error('Authentication required for calendar event creation');
        }

        const calendarResult = await calendarService.createEvent(tokens, {
          title: meetingDetails.title,
          description: meetingDetails.description,
          startTime: meetingDetails.startTime,
          endTime: meetingDetails.endTime,
          timezone: meetingDetails.timezone,
          attendees: recipients.email || [],
          location: 'Google Meet',
          reminders: notifications.calendar.reminders
        });

        results.calendar = {
          success: true,
          ...calendarResult
        };
      } catch (error) {
        console.error('Calendar event creation failed:', error);
        results.calendar = {
          success: false,
          error: error.message
        };
      }
    }

    // Calculate overall success
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalAttempts = Object.keys(results).length;

    res.json({
      success: successCount > 0,
      totalAttempts,
      successCount,
      failureCount: totalAttempts - successCount,
      results,
      meetLink,
      meetingDetails
    });

  } catch (error) {
    console.error('Error in notification sending:', error);
    res.status(500).json({
      error: 'Failed to send notifications',
      message: error.message
    });
  }
});

/**
 * Send email only
 */
router.post('/email', async (req, res) => {
  try {
    const { session, to, subject, body, meetLink, meetingDetails } = req.body;

    if (!session) {
      return res.status(401).json({ error: 'Session ID required' });
    }

    const tokens = authRoutes.getSessionTokens(session);
    if (!tokens) {
      return res.status(401).json({ error: 'Invalid session or not authenticated' });
    }

    const result = await emailService.sendEmail(tokens, {
      to,
      subject,
      body,
      meetLink,
      meetingDetails
    });

    res.json(result);

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message
    });
  }
});

/**
 * Send WhatsApp message only
 */
router.post('/whatsapp', async (req, res) => {
  try {
    const { to, meetLink, meetingDetails, customMessage } = req.body;

    const result = await whatsappService.sendMeetingInvite({
      to,
      meetLink,
      meetingDetails,
      customMessage
    });

    res.json(result);

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({
      error: 'Failed to send WhatsApp message',
      message: error.message
    });
  }
});

/**
 * Create calendar event only
 */
router.post('/calendar', async (req, res) => {
  try {
    const { session, eventData } = req.body;

    if (!session) {
      return res.status(401).json({ error: 'Session ID required' });
    }

    const tokens = authRoutes.getSessionTokens(session);
    if (!tokens) {
      return res.status(401).json({ error: 'Invalid session or not authenticated' });
    }

    const result = await calendarService.createEvent(tokens, eventData);
    res.json(result);

  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({
      error: 'Failed to create calendar event',
      message: error.message
    });
  }
});

/**
 * Send meeting reminders
 */
router.post('/reminders', async (req, res) => {
  try {
    const {
      session,
      meetLink,
      meetingDetails,
      recipients,
      reminderTypes,
      minutesBeforeMeeting = 15
    } = req.body;

    if (!session) {
      return res.status(401).json({ error: 'Session ID required' });
    }

    const tokens = authRoutes.getSessionTokens(session);
    const results = {};

    // Send email reminders
    if (reminderTypes.includes('email') && recipients.email && recipients.email.length > 0) {
      try {
        if (!tokens) {
          throw new Error('Authentication required for email reminders');
        }

        const emailResult = await emailService.sendMeetingReminder(tokens, {
          to: recipients.email,
          meetLink,
          meetingDetails,
          minutesBeforeMeeting
        });

        results.email = {
          success: true,
          ...emailResult
        };
      } catch (error) {
        console.error('Email reminder failed:', error);
        results.email = {
          success: false,
          error: error.message
        };
      }
    }

    // Send WhatsApp reminders
    if (reminderTypes.includes('whatsapp') && recipients.whatsapp && recipients.whatsapp.length > 0) {
      try {
        const whatsappResult = await whatsappService.sendMeetingReminder({
          to: recipients.whatsapp,
          meetLink,
          meetingDetails,
          minutesBeforeMeeting
        });

        results.whatsapp = {
          success: true,
          ...whatsappResult
        };
      } catch (error) {
        console.error('WhatsApp reminder failed:', error);
        results.whatsapp = {
          success: false,
          error: error.message
        };
      }
    }

    const successCount = Object.values(results).filter(r => r.success).length;
    const totalAttempts = Object.keys(results).length;

    res.json({
      success: successCount > 0,
      totalAttempts,
      successCount,
      results,
      minutesBeforeMeeting
    });

  } catch (error) {
    console.error('Error sending reminders:', error);
    res.status(500).json({
      error: 'Failed to send reminders',
      message: error.message
    });
  }
});

/**
 * Check WhatsApp service status
 */
router.get('/whatsapp/status', async (req, res) => {
  try {
    const status = await whatsappService.checkServiceStatus();
    res.json(status);
  } catch (error) {
    console.error('Error checking WhatsApp status:', error);
    res.status(500).json({
      error: 'Failed to check WhatsApp service status',
      message: error.message
    });
  }
});

/**
 * Get message delivery status
 */
router.get('/whatsapp/status/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const status = await whatsappService.getMessageStatus(messageId);
    res.json(status);
  } catch (error) {
    console.error('Error getting message status:', error);
    res.status(500).json({
      error: 'Failed to get message status',
      message: error.message
    });
  }
});

module.exports = router;