import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Settings, Video, Mail, MessageSquare, CalendarPlus } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import Button from './ui/Button';
import Input from './ui/Input';
import Checkbox from './ui/Checkbox';
import Card from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';
import { meetingAPI, notificationsAPI, utils } from '../lib/api';
import toast from 'react-hot-toast';

const MeetingGenerator = ({ sessionId, isAuthenticated }) => {
  const [loading, setLoading] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState({
    title: '',
    description: '',
    startTime: '',
    duration: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  const [generatedMeeting, setGeneratedMeeting] = useState(null);
  const [notifications, setNotifications] = useState({
    email: false,
    whatsapp: false,
    calendar: false
  });
  
  const [recipients, setRecipients] = useState({
    email: '',
    whatsapp: ''
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize default start time (5 minutes from now)
  useEffect(() => {
    const now = new Date();
    const defaultStart = addMinutes(now, 5);
    setMeetingDetails(prev => ({
      ...prev,
      startTime: format(defaultStart, "yyyy-MM-dd'T'HH:mm")
    }));
  }, []);

  const handleGenerateMeeting = async () => {
    setLoading(true);
    try {
      let result;
      
      if (isAuthenticated && sessionId) {
        // Generate full meeting with calendar integration
        const startTime = new Date(meetingDetails.startTime);
        const endTime = addMinutes(startTime, parseInt(meetingDetails.duration));
        
        const meetingData = {
          title: meetingDetails.title || 'Quick Meeting',
          description: meetingDetails.description || 'Meeting generated via Google Meet System',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          timezone: meetingDetails.timezone,
          attendees: recipients.email ? recipients.email.split(',').map(e => e.trim()).filter(e => e) : []
        };
        
        const response = await meetingAPI.generateMeetLink(sessionId, meetingData);
        result = response.data;
      } else {
        // Generate simple meeting link
        const response = await meetingAPI.generateSimpleMeetLink();
        result = response.data;
      }
      
      setGeneratedMeeting(result);
      toast.success('Meeting link generated successfully!');
      
      // Auto-send notifications if any are selected
      if (result.meetLink && (notifications.email || notifications.whatsapp || notifications.calendar)) {
        await handleSendNotifications(result);
      }
      
    } catch (error) {
      const errorInfo = utils.handleError(error);
      toast.error(errorInfo.message);
      console.error('Error generating meeting:', errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotifications = async (meetingData = generatedMeeting) => {
    if (!meetingData?.meetLink) {
      toast.error('No meeting link available to share');
      return;
    }

    setLoading(true);
    try {
      const recipientData = {
        email: recipients.email ? recipients.email.split(',').map(e => e.trim()).filter(e => e) : [],
        whatsapp: recipients.whatsapp ? recipients.whatsapp.split(',').map(p => p.trim()).filter(p => p) : []
      };

      // Validate recipients
      if (notifications.email && recipientData.email.length > 0) {
        const invalidEmails = recipientData.email.filter(email => !utils.isValidEmail(email));
        if (invalidEmails.length > 0) {
          toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
          return;
        }
      }

      if (notifications.whatsapp && recipientData.whatsapp.length > 0) {
        recipientData.whatsapp = recipientData.whatsapp.map(phone => {
          try {
            return utils.formatPhoneNumber(phone);
          } catch (error) {
            throw new Error(`Invalid phone number: ${phone}`);
          }
        });
      }

      const notificationData = {
        meetLink: meetingData.meetLink,
        meetingDetails: meetingData.eventDetails || {
          title: meetingDetails.title || 'Quick Meeting',
          description: meetingDetails.description,
          startTime: meetingDetails.startTime ? new Date(meetingDetails.startTime).toISOString() : null,
          endTime: meetingDetails.startTime ? addMinutes(new Date(meetingDetails.startTime), parseInt(meetingDetails.duration)).toISOString() : null,
          timezone: meetingDetails.timezone
        },
        notifications: {
          email: notifications.email ? {
            subject: `Meeting Invitation - ${meetingDetails.title || 'Quick Meeting'}`
          } : false,
          whatsapp: notifications.whatsapp ? {} : false,
          calendar: notifications.calendar ? {} : false
        },
        recipients: recipientData
      };

      let response;
      if (sessionId && (notifications.email || notifications.calendar)) {
        // Use authenticated endpoint for email/calendar
        response = await notificationsAPI.sendNotifications(sessionId, notificationData);
      } else if (notifications.whatsapp && !notifications.email && !notifications.calendar) {
        // Use WhatsApp only endpoint
        response = await notificationsAPI.sendWhatsApp({
          to: recipientData.whatsapp,
          meetLink: meetingData.meetLink,
          meetingDetails: notificationData.meetingDetails
        });
      } else {
        throw new Error('Authentication required for email or calendar notifications');
      }

      const result = response.data;
      
      // Show success/failure messages
      if (result.success) {
        const messages = [];
        if (result.results?.email?.success) {
          messages.push(`Email sent to ${result.results.email.recipients?.length || 0} recipients`);
        }
        if (result.results?.whatsapp?.success) {
          messages.push(`WhatsApp sent to ${result.results.whatsapp.totalSent || 0} recipients`);
        }
        if (result.results?.calendar?.success) {
          messages.push('Calendar event created');
        }
        
        if (messages.length > 0) {
          toast.success(messages.join(', '));
        }
      }
      
      // Show any failures
      if (result.results) {
        Object.entries(result.results).forEach(([method, methodResult]) => {
          if (!methodResult.success) {
            toast.error(`${method} failed: ${methodResult.error}`);
          }
        });
      }
      
    } catch (error) {
      const errorInfo = utils.handleError(error);
      toast.error(errorInfo.message);
      console.error('Error sending notifications:', errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Meeting Configuration */}
      <Card title="Meeting Configuration" className="animate-fade-in">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Meeting Title"
              placeholder="Enter meeting title"
              value={meetingDetails.title}
              onChange={(e) => setMeetingDetails(prev => ({ ...prev, title: e.target.value }))}
            />
            <div className="flex items-end space-x-2">
              <Input
                label="Duration (minutes)"
                type="number"
                min="15"
                max="480"
                value={meetingDetails.duration}
                onChange={(e) => setMeetingDetails(prev => ({ ...prev, duration: e.target.value }))}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="mb-0"
              >
                <Settings className="w-4 h-4 mr-1" />
                {showAdvanced ? 'Less' : 'More'}
              </Button>
            </div>
          </div>
          
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-gray-200 animate-slide-up">
              <Input
                label="Description"
                placeholder="Meeting description (optional)"
                value={meetingDetails.description}
                onChange={(e) => setMeetingDetails(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="datetime-local"
                  value={meetingDetails.startTime}
                  onChange={(e) => setMeetingDetails(prev => ({ ...prev, startTime: e.target.value }))}
                />
                <Input
                  label="Timezone"
                  value={meetingDetails.timezone}
                  onChange={(e) => setMeetingDetails(prev => ({ ...prev, timezone: e.target.value }))}
                  placeholder="e.g., America/New_York"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Notification Options */}
      <Card title="Sharing Options" subtitle="Choose how to share the meeting link">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Checkbox
              label="Send via Email"
              description="Send meeting invite via Gmail"
              checked={notifications.email}
              onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
              disabled={!isAuthenticated}
            />
            <Checkbox
              label="Send via WhatsApp"
              description="Send meeting link via WhatsApp"
              checked={notifications.whatsapp}
              onChange={(e) => setNotifications(prev => ({ ...prev, whatsapp: e.target.checked }))}
            />
            <Checkbox
              label="Add to Calendar"
              description="Create calendar event with Meet link"
              checked={notifications.calendar}
              onChange={(e) => setNotifications(prev => ({ ...prev, calendar: e.target.checked }))}
              disabled={!isAuthenticated}
            />
          </div>

          {(notifications.email || notifications.whatsapp) && (
            <div className="space-y-4 pt-4 border-t border-gray-200 animate-slide-up">
              {notifications.email && (
                <Input
                  label="Email Recipients"
                  placeholder="email1@example.com, email2@example.com"
                  value={recipients.email}
                  onChange={(e) => setRecipients(prev => ({ ...prev, email: e.target.value }))}
                  className={!isAuthenticated ? 'opacity-50' : ''}
                  disabled={!isAuthenticated}
                />
              )}
              {notifications.whatsapp && (
                <Input
                  label="WhatsApp Recipients"
                  placeholder="+1234567890, +0987654321"
                  value={recipients.whatsapp}
                  onChange={(e) => setRecipients(prev => ({ ...prev, whatsapp: e.target.value }))}
                />
              )}
            </div>
          )}

          {!isAuthenticated && (notifications.email || notifications.calendar) && (
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 animate-slide-up">
              <p className="text-sm text-warning-800">
                <strong>Authentication required:</strong> Please authenticate with Google to use email and calendar features.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerateMeeting}
          loading={loading}
          size="lg"
          className="min-w-48"
        >
          <Video className="w-5 h-5 mr-2" />
          Generate Meeting Link
        </Button>
      </div>

      {/* Generated Meeting */}
      {generatedMeeting && (
        <Card title="Meeting Generated!" className="animate-slide-up">
          <div className="space-y-4">
            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-success-900">Meeting Link Ready</p>
                  <p className="text-sm text-success-700 break-all mt-1">
                    {generatedMeeting.meetLink}
                  </p>
                </div>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => copyToClipboard(generatedMeeting.meetLink)}
                >
                  Copy Link
                </Button>
              </div>
            </div>

            {generatedMeeting.eventDetails && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-900">Meeting Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Title:</strong> {generatedMeeting.eventDetails.title}</p>
                  {generatedMeeting.eventDetails.startTime && (
                    <p><strong>Start:</strong> {new Date(generatedMeeting.eventDetails.startTime).toLocaleString()}</p>
                  )}
                  {generatedMeeting.eventDetails.endTime && (
                    <p><strong>End:</strong> {new Date(generatedMeeting.eventDetails.endTime).toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}

            {(notifications.email || notifications.whatsapp || notifications.calendar) && (
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={() => handleSendNotifications()}
                  loading={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Notifications Now
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MeetingGenerator;