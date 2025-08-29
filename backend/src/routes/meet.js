const express = require('express');
const MeetService = require('../services/meetService');
const authRoutes = require('./auth');

const router = express.Router();
const meetService = new MeetService();

/**
 * Generate a Google Meet link
 */
router.post('/generate', async (req, res) => {
  try {
    const { session, meetingDetails } = req.body;
    
    if (!session) {
      return res.status(401).json({ error: 'Session ID required' });
    }

    const tokens = authRoutes.getSessionTokens(session);
    if (!tokens) {
      return res.status(401).json({ error: 'Invalid session or not authenticated' });
    }

    const result = await meetService.generateMeetLink(tokens, meetingDetails);
    res.json(result);

  } catch (error) {
    console.error('Error generating meet link:', error);
    res.status(500).json({ 
      error: 'Failed to generate meeting link',
      message: error.message 
    });
  }
});

/**
 * Generate a simple Meet link (without calendar event)
 */
router.post('/generate-simple', (req, res) => {
  try {
    const result = meetService.generateSimpleMeetLink();
    res.json(result);
  } catch (error) {
    console.error('Error generating simple meet link:', error);
    res.status(500).json({ 
      error: 'Failed to generate simple meeting link',
      message: error.message 
    });
  }
});

/**
 * Update meeting details
 */
router.put('/update/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { session, updates } = req.body;
    
    if (!session) {
      return res.status(401).json({ error: 'Session ID required' });
    }

    const tokens = authRoutes.getSessionTokens(session);
    if (!tokens) {
      return res.status(401).json({ error: 'Invalid session or not authenticated' });
    }

    const result = await meetService.updateMeeting(tokens, eventId, updates);
    res.json(result);

  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ 
      error: 'Failed to update meeting',
      message: error.message 
    });
  }
});

/**
 * Delete a meeting
 */
router.delete('/delete/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { session } = req.body;
    
    if (!session) {
      return res.status(401).json({ error: 'Session ID required' });
    }

    const tokens = authRoutes.getSessionTokens(session);
    if (!tokens) {
      return res.status(401).json({ error: 'Invalid session or not authenticated' });
    }

    const result = await meetService.deleteMeeting(tokens, eventId);
    res.json(result);

  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ 
      error: 'Failed to delete meeting',
      message: error.message 
    });
  }
});

module.exports = router;