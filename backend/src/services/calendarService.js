const { google } = require('googleapis');
const GoogleAuthConfig = require('../config/googleAuth');

class CalendarService {
  constructor() {
    this.googleAuth = new GoogleAuthConfig();
  }

  /**
   * Create a calendar event with Google Meet
   * @param {object} tokens - User's OAuth2 tokens
   * @param {object} eventData - Event configuration
   * @returns {Promise<object>} Created event details
   */
  async createEvent(tokens, eventData) {
    try {
      // Set up authentication
      this.googleAuth.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.googleAuth.getClient() });

      const {
        title,
        description,
        startTime,
        endTime,
        timezone,
        attendees,
        location,
        reminders,
        recurrence,
        visibility = 'default'
      } = eventData;

      // Prepare event object
      const event = {
        summary: title || 'Meeting',
        description: description || 'Created via Google Meet System',
        start: {
          dateTime: startTime || new Date(Date.now() + 5 * 60000).toISOString(),
          timeZone: timezone || process.env.DEFAULT_MEETING_TIMEZONE || 'UTC',
        },
        end: {
          dateTime: endTime || new Date(Date.now() + 65 * 60000).toISOString(),
          timeZone: timezone || process.env.DEFAULT_MEETING_TIMEZONE || 'UTC',
        },
        location: location || 'Google Meet',
        attendees: attendees ? attendees.map(email => ({ email })) : [],
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: reminders || {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 10 },
            { method: 'popup', minutes: 5 }
          ]
        },
        visibility: visibility
      };

      // Add recurrence if specified
      if (recurrence) {
        event.recurrence = recurrence;
      }

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

      return {
        success: true,
        eventId: createdEvent.id,
        meetLink,
        htmlLink: createdEvent.htmlLink,
        eventDetails: {
          title: createdEvent.summary,
          description: createdEvent.description,
          startTime: createdEvent.start.dateTime,
          endTime: createdEvent.end.dateTime,
          timezone: createdEvent.start.timeZone,
          location: createdEvent.location,
          attendees: createdEvent.attendees || [],
          status: createdEvent.status
        },
        conferenceData: createdEvent.conferenceData
      };

    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error(`Failed to create calendar event: ${error.message}`);
    }
  }

  /**
   * Update an existing calendar event
   * @param {object} tokens - User's OAuth2 tokens
   * @param {string} eventId - Event ID to update
   * @param {object} updates - Updates to apply
   * @returns {Promise<object>} Updated event details
   */
  async updateEvent(tokens, eventId, updates) {
    try {
      this.googleAuth.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.googleAuth.getClient() });

      // Prepare update object
      const updateData = {};
      
      if (updates.title) updateData.summary = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.startTime) {
        updateData.start = {
          dateTime: updates.startTime,
          timeZone: updates.timezone || process.env.DEFAULT_MEETING_TIMEZONE || 'UTC'
        };
      }
      if (updates.endTime) {
        updateData.end = {
          dateTime: updates.endTime,
          timeZone: updates.timezone || process.env.DEFAULT_MEETING_TIMEZONE || 'UTC'
        };
      }
      if (updates.location) updateData.location = updates.location;
      if (updates.attendees) {
        updateData.attendees = updates.attendees.map(email => ({ email }));
      }
      if (updates.reminders) updateData.reminders = updates.reminders;

      const response = await calendar.events.patch({
        calendarId: 'primary',
        eventId: eventId,
        resource: updateData,
        sendUpdates: 'all'
      });

      return {
        success: true,
        eventId: response.data.id,
        eventDetails: response.data,
        message: 'Event updated successfully'
      };

    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error(`Failed to update calendar event: ${error.message}`);
    }
  }

  /**
   * Delete a calendar event
   * @param {object} tokens - User's OAuth2 tokens
   * @param {string} eventId - Event ID to delete
   * @returns {Promise<object>} Deletion result
   */
  async deleteEvent(tokens, eventId) {
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
        eventId,
        message: 'Event deleted successfully'
      };

    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error(`Failed to delete calendar event: ${error.message}`);
    }
  }

  /**
   * Get event details
   * @param {object} tokens - User's OAuth2 tokens
   * @param {string} eventId - Event ID
   * @returns {Promise<object>} Event details
   */
  async getEvent(tokens, eventId) {
    try {
      this.googleAuth.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.googleAuth.getClient() });

      const response = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      const event = response.data;
      const meetLink = event.conferenceData?.entryPoints?.find(
        entry => entry.entryPointType === 'video'
      )?.uri;

      return {
        success: true,
        eventId: event.id,
        meetLink,
        htmlLink: event.htmlLink,
        eventDetails: {
          title: event.summary,
          description: event.description,
          startTime: event.start.dateTime,
          endTime: event.end.dateTime,
          timezone: event.start.timeZone,
          location: event.location,
          attendees: event.attendees || [],
          status: event.status,
          created: event.created,
          updated: event.updated
        },
        conferenceData: event.conferenceData
      };

    } catch (error) {
      console.error('Error getting calendar event:', error);
      throw new Error(`Failed to get calendar event: ${error.message}`);
    }
  }

  /**
   * List upcoming events
   * @param {object} tokens - User's OAuth2 tokens
   * @param {object} options - Query options
   * @returns {Promise<object>} List of events
   */
  async listEvents(tokens, options = {}) {
    try {
      this.googleAuth.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.googleAuth.getClient() });

      const {
        maxResults = 10,
        timeMin = new Date().toISOString(),
        timeMax,
        singleEvents = true,
        orderBy = 'startTime'
      } = options;

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        maxResults,
        singleEvents,
        orderBy
      });

      const events = response.data.items || [];
      const processedEvents = events.map(event => {
        const meetLink = event.conferenceData?.entryPoints?.find(
          entry => entry.entryPointType === 'video'
        )?.uri;

        return {
          eventId: event.id,
          title: event.summary,
          description: event.description,
          startTime: event.start.dateTime || event.start.date,
          endTime: event.end.dateTime || event.end.date,
          location: event.location,
          meetLink,
          htmlLink: event.htmlLink,
          status: event.status,
          attendees: event.attendees || []
        };
      });

      return {
        success: true,
        events: processedEvents,
        totalEvents: events.length,
        nextPageToken: response.data.nextPageToken
      };

    } catch (error) {
      console.error('Error listing calendar events:', error);
      throw new Error(`Failed to list calendar events: ${error.message}`);
    }
  }

  /**
   * Check calendar availability for a time slot
   * @param {object} tokens - User's OAuth2 tokens
   * @param {object} timeSlot - Time slot to check
   * @returns {Promise<object>} Availability status
   */
  async checkAvailability(tokens, timeSlot) {
    try {
      this.googleAuth.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.googleAuth.getClient() });

      const { startTime, endTime, timezone } = timeSlot;

      const response = await calendar.freebusy.query({
        resource: {
          timeMin: startTime,
          timeMax: endTime,
          timeZone: timezone || 'UTC',
          items: [{ id: 'primary' }]
        }
      });

      const busyTimes = response.data.calendars.primary.busy || [];
      const isAvailable = busyTimes.length === 0;

      return {
        success: true,
        isAvailable,
        busyTimes,
        timeSlot: {
          startTime,
          endTime,
          timezone
        }
      };

    } catch (error) {
      console.error('Error checking calendar availability:', error);
      throw new Error(`Failed to check calendar availability: ${error.message}`);
    }
  }

  /**
   * Add attendees to an existing event
   * @param {object} tokens - User's OAuth2 tokens
   * @param {string} eventId - Event ID
   * @param {Array} newAttendees - Array of email addresses
   * @returns {Promise<object>} Update result
   */
  async addAttendees(tokens, eventId, newAttendees) {
    try {
      // First, get the current event
      const currentEvent = await this.getEvent(tokens, eventId);
      const existingAttendees = currentEvent.eventDetails.attendees.map(a => a.email);
      
      // Merge with new attendees (avoid duplicates)
      const allAttendees = [...existingAttendees];
      newAttendees.forEach(email => {
        if (!allAttendees.includes(email)) {
          allAttendees.push(email);
        }
      });

      // Update the event
      return await this.updateEvent(tokens, eventId, {
        attendees: allAttendees
      });

    } catch (error) {
      console.error('Error adding attendees:', error);
      throw new Error(`Failed to add attendees: ${error.message}`);
    }
  }

  /**
   * Create recurring meeting series
   * @param {object} tokens - User's OAuth2 tokens
   * @param {object} eventData - Event configuration with recurrence
   * @returns {Promise<object>} Created recurring event details
   */
  async createRecurringEvent(tokens, eventData) {
    const {
      recurrenceRule,
      endDate,
      occurrences
    } = eventData;

    // Build recurrence rules
    let recurrence = [];
    
    if (recurrenceRule) {
      let rule = `RRULE:${recurrenceRule}`;
      
      if (endDate) {
        rule += `;UNTIL=${new Date(endDate).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
      } else if (occurrences) {
        rule += `;COUNT=${occurrences}`;
      }
      
      recurrence.push(rule);
    }

    return await this.createEvent(tokens, {
      ...eventData,
      recurrence
    });
  }
}

module.exports = CalendarService;