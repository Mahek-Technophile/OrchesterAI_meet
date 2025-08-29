const twilio = require('twilio');

class WhatsAppService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  }

  /**
   * Send WhatsApp message with meeting link
   * @param {object} messageData - Message configuration
   * @returns {Promise<object>} Message sending result
   */
  async sendMeetingInvite(messageData) {
    try {
      const { to, meetLink, meetingDetails, customMessage } = messageData;
      
      if (!to || !Array.isArray(to) || to.length === 0) {
        throw new Error('Recipient phone numbers are required');
      }

      if (!meetLink) {
        throw new Error('Meeting link is required');
      }

      // Validate and format phone numbers
      const formattedNumbers = this.formatPhoneNumbers(to);
      const results = [];

      // Send message to each recipient
      for (const phoneNumber of formattedNumbers) {
        try {
          const messageBody = customMessage || this.createMeetingMessage({
            meetLink,
            meetingDetails
          });

          const message = await this.client.messages.create({
            from: this.whatsappNumber,
            to: `whatsapp:${phoneNumber}`,
            body: messageBody
          });

          results.push({
            success: true,
            phoneNumber,
            messageId: message.sid,
            status: message.status
          });

        } catch (error) {
          console.error(`Error sending to ${phoneNumber}:`, error);
          results.push({
            success: false,
            phoneNumber,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      return {
        success: successCount > 0,
        totalSent: successCount,
        totalFailed: failureCount,
        results,
        message: `Sent to ${successCount}/${results.length} recipients`
      };

    } catch (error) {
      console.error('Error in WhatsApp service:', error);
      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  /**
   * Create meeting invitation message
   * @param {object} params - Message parameters
   * @returns {string} WhatsApp message content
   */
  createMeetingMessage({ meetLink, meetingDetails }) {
    const title = meetingDetails?.title || 'Meeting Invitation';
    const startTime = meetingDetails?.startTime ? new Date(meetingDetails.startTime) : null;
    const endTime = meetingDetails?.endTime ? new Date(meetingDetails.endTime) : null;
    
    let message = `🎥 *${title}*\n\n`;
    
    if (meetingDetails?.description) {
      message += `📝 ${meetingDetails.description}\n\n`;
    }
    
    if (startTime) {
      message += `📅 *Start Time:* ${startTime.toLocaleString()}\n`;
    }
    
    if (endTime) {
      message += `⏰ *End Time:* ${endTime.toLocaleString()}\n`;
    }
    
    if (meetingDetails?.timezone) {
      message += `🌍 *Timezone:* ${meetingDetails.timezone}\n`;
    }
    
    message += `\n🚀 *Join the meeting:*\n${meetLink}\n\n`;
    message += `💡 *Tips:*\n`;
    message += `• Join a few minutes early\n`;
    message += `• Use Chrome for best experience\n`;
    message += `• Check your audio/video settings\n\n`;
    message += `Sent via Google Meet System 🤖`;
    
    return message;
  }

  /**
   * Send meeting reminder via WhatsApp
   * @param {object} reminderData - Reminder configuration
   * @returns {Promise<object>} Message sending result
   */
  async sendMeetingReminder(reminderData) {
    const { to, meetLink, meetingDetails, minutesBeforeMeeting = 15 } = reminderData;
    
    const reminderMessage = this.createReminderMessage({
      meetLink,
      meetingDetails,
      minutesBeforeMeeting
    });

    return await this.sendMeetingInvite({
      to,
      meetLink,
      meetingDetails,
      customMessage: reminderMessage
    });
  }

  /**
   * Create meeting reminder message
   * @param {object} params - Reminder parameters
   * @returns {string} WhatsApp reminder message
   */
  createReminderMessage({ meetLink, meetingDetails, minutesBeforeMeeting }) {
    const title = meetingDetails?.title || 'Upcoming Meeting';
    const startTime = meetingDetails?.startTime ? new Date(meetingDetails.startTime) : null;
    
    let message = `⏰ *MEETING REMINDER*\n\n`;
    message += `🎥 *${title}*\n`;
    message += `🚨 Starting in *${minutesBeforeMeeting} minutes*!\n\n`;
    
    if (startTime) {
      message += `📅 *Start Time:* ${startTime.toLocaleString()}\n\n`;
    }
    
    message += `🚀 *Join now:*\n${meetLink}\n\n`;
    message += `Don't be late! 😊`;
    
    return message;
  }

  /**
   * Send custom WhatsApp message
   * @param {object} messageData - Custom message data
   * @returns {Promise<object>} Message sending result
   */
  async sendCustomMessage(messageData) {
    try {
      const { to, message } = messageData;
      
      if (!to || !Array.isArray(to) || to.length === 0) {
        throw new Error('Recipient phone numbers are required');
      }

      if (!message) {
        throw new Error('Message content is required');
      }

      const formattedNumbers = this.formatPhoneNumbers(to);
      const results = [];

      for (const phoneNumber of formattedNumbers) {
        try {
          const response = await this.client.messages.create({
            from: this.whatsappNumber,
            to: `whatsapp:${phoneNumber}`,
            body: message
          });

          results.push({
            success: true,
            phoneNumber,
            messageId: response.sid,
            status: response.status
          });

        } catch (error) {
          console.error(`Error sending to ${phoneNumber}:`, error);
          results.push({
            success: false,
            phoneNumber,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount > 0,
        totalSent: successCount,
        totalFailed: results.length - successCount,
        results
      };

    } catch (error) {
      console.error('Error sending custom message:', error);
      throw new Error(`Failed to send custom message: ${error.message}`);
    }
  }

  /**
   * Format and validate phone numbers
   * @param {Array} phoneNumbers - Array of phone numbers
   * @returns {Array} Formatted phone numbers
   */
  formatPhoneNumbers(phoneNumbers) {
    return phoneNumbers.map(number => {
      // Remove any existing whatsapp: prefix
      let formatted = number.replace(/^whatsapp:/, '');
      
      // Remove any spaces, dashes, or brackets
      formatted = formatted.replace(/[\s\-\(\)]/g, '');
      
      // Add + if not present
      if (!formatted.startsWith('+')) {
        formatted = '+' + formatted;
      }
      
      // Validate phone number format (basic validation)
      if (!/^\+\d{10,15}$/.test(formatted)) {
        throw new Error(`Invalid phone number format: ${number}`);
      }
      
      return formatted;
    });
  }

  /**
   * Check WhatsApp service status
   * @returns {Promise<object>} Service status
   */
  async checkServiceStatus() {
    try {
      // Try to get account info to verify credentials
      const account = await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      
      return {
        success: true,
        status: 'connected',
        accountSid: account.sid,
        accountStatus: account.status,
        whatsappNumber: this.whatsappNumber
      };
    } catch (error) {
      console.error('WhatsApp service status check failed:', error);
      return {
        success: false,
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Get message delivery status
   * @param {string} messageId - Twilio message SID
   * @returns {Promise<object>} Message status
   */
  async getMessageStatus(messageId) {
    try {
      const message = await this.client.messages(messageId).fetch();
      
      return {
        success: true,
        messageId: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        dateCreated: message.dateCreated,
        dateUpdated: message.dateUpdated,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      };
    } catch (error) {
      console.error('Error fetching message status:', error);
      throw new Error(`Failed to get message status: ${error.message}`);
    }
  }
}

module.exports = WhatsAppService;