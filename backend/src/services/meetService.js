const { google } = require('googleapis');
const GoogleAuthConfig = require('../config/googleAuth');

class MeetService {
  constructor() {
    this.googleAuth = new GoogleAuthConfig();
  }

  /**
   * Generate a Google Meet link by creating a Calendar event
   * @param {object} tokens - User's OAuth2 tokens
   * @param {object} meetingDetails - Meeting configuration
   * @returns {Promise<object>} Meeting details including Meet link
   */
  async generateMeetLink(tokens, meetingDetails = {}) {
    try {
      // Set up authentication
      this.googleAuth.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.googleAuth.getClient() });

      // Default meeting configuration
      const now = new Date();
      const startTime = meetingDetails.startTime || new Date(now.getTime() + 5 * 60000); // 5 minutes from now
      const duration = meetingDetails.duration || parseInt(process.env.DEFAULT_MEETING_DURATION) || 60;
      const endTime = new Date(startTime.getTime() + duration * 60000);

      // Create event with Google Meet
      const event = {
        summary: meetingDetails.title || 'Quick Meeting',
        description: meetingDetails.description || 'Meeting generated via Google Meet System',
        start: {
          dateTime: startTime.toISOString(),
          timeZone: meetingDetails.timezone || process.env.DEFAULT_MEETING_TIMEZONE || 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: meetingDetails.timezone || process.env.DEFAULT_MEETING_TIMEZONE || 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`, // Unique request ID
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        attendees: meetingDetails.attendees || [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 10 },
            { method: 'popup', minutes: 5 }
          ]
        }
      };

      // Create the event
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      });

      const createdEvent = response.data;
      const meetLink = createdEvent.conferenceData?.entryPoints?.find(
        entry => entry.entryPointType === 'video'
      )?.uri;

      if (!meetLink) {
        throw new Error('Failed to generate Google Meet link');
      }

      return {
        success: true,
        meetLink,
        eventId: createdEvent.id,
        eventDetails: {
          title: createdEvent.summary,
          description: createdEvent.description,
          startTime: createdEvent.start.dateTime,
          endTime: createdEvent.end.dateTime,
          timezone: createdEvent.start.timeZone,
          htmlLink: createdEvent.htmlLink
        },
        conferenceData: createdEvent.conferenceData
      };

    } catch (error) {
      console.error('Error generating Meet link:', error);
      throw new Error(`Failed to generate Google Meet link: ${error.message}`);
    }
  }

  /**
   * Generate a simple Meet link without calendar event (alternative method)
   * This creates a generic Meet link that can be used immediately
   * @returns {object} Simple meet link details
   */
  generateSimpleMeetLink() {
    // Generate a random meeting ID
    const meetingId = this.generateMeetingId();
    const meetLink = `https://meet.google.com/${meetingId}`;
    
    return {
      success: true,
      meetLink,
      meetingId,
      note: 'This is a generic Meet link. For calendar integration, use the full meeting generation.'
    };
  }

  /**
   * Generate a random meeting ID for Google Meet
   * Format: xxx-xxxx-xxx (similar to Google Meet format)
   * @returns {string} Meeting ID
   */
  generateMeetingId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const part1 = Array.from({length: 3}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    const part2 = Array.from({length: 4}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    const part3 = Array.from({length: 3}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    
    return `${part1}-${part2}-${part3}`;
  }

  /**
   * Update meeting details
   * @param {object} tokens - User's OAuth2 tokens
   * @param {string} eventId - Calendar event ID
   * @param {object} updates - Updates to apply
   * @returns {Promise<object>} Updated event details
   */
  async updateMeeting(tokens, eventId, updates) {
    try {
      this.googleAuth.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.googleAuth.getClient() });

      const response = await calendar.events.patch({
        calendarId: 'primary',
        eventId: eventId,
        resource: updates,
        sendUpdates: 'all'
      });

      return {
        success: true,
        event: response.data
      };
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw new Error(`Failed to update meeting: ${error.message}`);
    }
  }

  /**
   * Delete a meeting
   * @param {object} tokens - User's OAuth2 tokens
   * @param {string} eventId - Calendar event ID
   * @returns {Promise<object>} Deletion result
   */
  async deleteMeeting(tokens, eventId) {
    try {
      this.googleAuth.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.googleAuth.getClient() });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      });

      return {
        success: true,
        message: 'Meeting deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw new Error(`Failed to delete meeting: ${error.message}`);
    }
  }
}

module.exports = MeetService;