const { google } = require('googleapis');

class GoogleAuthConfig {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Define the scopes we need for our application
    this.scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/calendar.events'
    ];
  }

  /**
   * Generate the URL for Google OAuth2 authorization
   * @returns {string} Authorization URL
   */
  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for access tokens
   * @param {string} code - Authorization code from Google
   * @returns {Promise<object>} Token information
   */
  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Set credentials for the OAuth2 client
   * @param {object} tokens - Token object containing access_token, refresh_token, etc.
   */
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Get the configured OAuth2 client
   * @returns {google.auth.OAuth2} OAuth2 client instance
   */
  getClient() {
    return this.oauth2Client;
  }

  /**
   * Refresh the access token using the refresh token
   * @returns {Promise<object>} New token information
   */
  async refreshTokens() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      return credentials;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Check if the client has valid credentials
   * @returns {boolean} True if credentials are set
   */
  hasValidCredentials() {
    const credentials = this.oauth2Client.credentials;
    return credentials && credentials.access_token;
  }
}

module.exports = GoogleAuthConfig;