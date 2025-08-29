const express = require('express');
const GoogleAuthConfig = require('../config/googleAuth');

const router = express.Router();
const googleAuth = new GoogleAuthConfig();

// Store user sessions (in production, use a proper session store like Redis)
const userSessions = new Map();

/**
 * Initiate Google OAuth2 flow
 */
router.get('/google', (req, res) => {
  try {
    const authUrl = googleAuth.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

/**
 * Handle Google OAuth2 callback
 */
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' });
  }

  try {
    const tokens = await googleAuth.getTokens(code);
    
    // Generate a session ID (in production, use a more secure method)
    const sessionId = Math.random().toString(36).substr(2, 9);
    
    // Store tokens in session (in production, use encrypted storage)
    userSessions.set(sessionId, {
      tokens,
      createdAt: new Date(),
      lastUsed: new Date()
    });

    // Redirect to frontend with session ID
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/?session=${sessionId}&auth=success`);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/?auth=error&message=${encodeURIComponent(error.message)}`);
  }
});

/**
 * Check authentication status
 */
router.get('/status', (req, res) => {
  const { session } = req.query;
  
  if (!session || !userSessions.has(session)) {
    return res.json({ authenticated: false });
  }

  const sessionData = userSessions.get(session);
  sessionData.lastUsed = new Date();
  
  res.json({ 
    authenticated: true,
    sessionId: session,
    hasTokens: !!sessionData.tokens
  });
});

/**
 * Logout and clear session
 */
router.post('/logout', (req, res) => {
  const { session } = req.body;
  
  if (session && userSessions.has(session)) {
    userSessions.delete(session);
  }
  
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * Get user session tokens (for internal API use)
 */
function getSessionTokens(sessionId) {
  if (!sessionId || !userSessions.has(sessionId)) {
    return null;
  }
  
  const sessionData = userSessions.get(sessionId);
  sessionData.lastUsed = new Date();
  return sessionData.tokens;
}

// Export the function for use in other routes
router.getSessionTokens = getSessionTokens;

module.exports = router;