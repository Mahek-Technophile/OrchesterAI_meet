const { google } = require('googleapis');
const GoogleAuthConfig = require('../config/googleAuth');

class EmailService {
  constructor() {
    this.googleAuth = new GoogleAuthConfig();
  }

  /**
   * Send email via Gmail API
   * @param {object} tokens - User's OAuth2 tokens
   * @param {object} emailData - Email configuration
   * @returns {Promise<object>} Email sending result
   */
  async sendEmail(tokens, emailData) {
    try {
      // Set up authentication
      this.googleAuth.setCredentials(tokens);
      const gmail = google.gmail({ version: 'v1', auth: this.googleAuth.getClient() });

      // Prepare email content
      const { to, subject, body, meetLink, meetingDetails } = emailData;
      
      if (!to || !Array.isArray(to) || to.length === 0) {
        throw new Error('Recipient email addresses are required');
      }

      if (!meetLink) {
        throw new Error('Meeting link is required');
      }

      // Create email content
      const emailContent = this.createEmailContent({
        to: to.join(', '),
        subject: subject || 'Meeting Invitation - Google Meet Link',
        body,
        meetLink,
        meetingDetails
      });

      // Send email
      const response = await gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: emailContent
        }
      });

      return {
        success: true,
        messageId: response.data.id,
        recipients: to,
        message: 'Email sent successfully'
      };

    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Create properly formatted email content
   * @param {object} params - Email parameters
   * @returns {string} Base64 encoded email content
   */
  createEmailContent({ to, subject, body, meetLink, meetingDetails }) {
    const startTime = meetingDetails?.startTime ? new Date(meetingDetails.startTime) : null;
    const endTime = meetingDetails?.endTime ? new Date(meetingDetails.endTime) : null;
    
    const emailBody = body || this.getDefaultEmailTemplate({
      meetLink,
      meetingDetails,
      startTime,
      endTime
    });

    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      emailBody
    ].join('\n');

    // Encode in base64
    return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Get default email template
   * @param {object} params - Template parameters
   * @returns {string} HTML email template
   */
  getDefaultEmailTemplate({ meetLink, meetingDetails, startTime, endTime }) {
    const title = meetingDetails?.title || 'Meeting Invitation';
    const description = meetingDetails?.description || 'You have been invited to join a meeting.';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4285f4; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .meeting-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4285f4; }
        .join-button { display: inline-block; background: #34a853; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .join-button:hover { background: #2d8f47; }
        .meeting-details { margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .divider { height: 2px; background: #e0e0e0; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📹 ${title}</h1>
    </div>
    
    <div class="content">
        <p>Hello,</p>
        <p>${description}</p>
        
        <div class="meeting-info">
            <h3>📅 Meeting Details</h3>
            <div class="meeting-details">
                ${startTime ? `<p><strong>Start Time:</strong> ${startTime.toLocaleString()}</p>` : ''}
                ${endTime ? `<p><strong>End Time:</strong> ${endTime.toLocaleString()}</p>` : ''}
                ${meetingDetails?.timezone ? `<p><strong>Timezone:</strong> ${meetingDetails.timezone}</p>` : ''}
            </div>
            
            <div class="divider"></div>
            
            <p><strong>Join the meeting:</strong></p>
            <a href="${meetLink}" class="join-button">🚀 Join Google Meet</a>
            
            <p style="margin-top: 20px;">
                <strong>Meeting Link:</strong><br>
                <a href="${meetLink}" style="color: #4285f4; word-break: break-all;">${meetLink}</a>
            </p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0;"><strong>💡 Tips:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Join a few minutes early to test your audio and video</li>
                <li>Use Chrome browser for the best experience</li>
                <li>Make sure your microphone and camera permissions are enabled</li>
            </ul>
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>Google Meet System</p>
    </div>
    
    <div class="footer">
        <p>This email was sent by Google Meet System. Please do not reply to this email.</p>
    </div>
</body>
</html>`;
  }

  /**
   * Send meeting reminder email
   * @param {object} tokens - User's OAuth2 tokens
   * @param {object} reminderData - Reminder configuration
   * @returns {Promise<object>} Email sending result
   */
  async sendMeetingReminder(tokens, reminderData) {
    const { to, meetLink, meetingDetails, minutesBeforeMeeting = 15 } = reminderData;
    
    const emailData = {
      to,
      subject: `Reminder: Meeting in ${minutesBeforeMeeting} minutes - ${meetingDetails?.title || 'Upcoming Meeting'}`,
      body: this.getReminderEmailTemplate({ meetLink, meetingDetails, minutesBeforeMeeting }),
      meetLink,
      meetingDetails
    };

    return await this.sendEmail(tokens, emailData);
  }

  /**
   * Get reminder email template
   * @param {object} params - Template parameters
   * @returns {string} HTML reminder email template
   */
  getReminderEmailTemplate({ meetLink, meetingDetails, minutesBeforeMeeting }) {
    const title = meetingDetails?.title || 'Upcoming Meeting';
    const startTime = meetingDetails?.startTime ? new Date(meetingDetails.startTime) : null;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Meeting Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .reminder-header { background: #ff9800; color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-top: 20px; }
        .join-button { display: inline-block; background: #4285f4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; font-size: 16px; }
    </style>
</head>
<body>
    <div class="reminder-header">
        <h1>⏰ Meeting Reminder</h1>
        <h2>Starting in ${minutesBeforeMeeting} minutes!</h2>
    </div>
    
    <div class="content">
        <h3>${title}</h3>
        ${startTime ? `<p><strong>Start Time:</strong> ${startTime.toLocaleString()}</p>` : ''}
        
        <p>Your meeting is starting soon. Click the button below to join:</p>
        
        <a href="${meetLink}" class="join-button">🚀 Join Now</a>
        
        <p><strong>Meeting Link:</strong><br>
        <a href="${meetLink}" style="color: #4285f4;">${meetLink}</a></p>
    </div>
</body>
</html>`;
  }

  /**
   * Validate email addresses
   * @param {Array} emails - Array of email addresses
   * @returns {boolean} True if all emails are valid
   */
  validateEmails(emails) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every(email => emailRegex.test(email.trim()));
  }
}

module.exports = EmailService;