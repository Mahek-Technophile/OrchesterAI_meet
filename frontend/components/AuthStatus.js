import { useState, useEffect } from 'react';
import { User, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { authAPI, utils } from '../lib/api';
import toast from 'react-hot-toast';

const AuthStatus = ({ sessionId, isAuthenticated, onAuthChange }) => {
  const [loading, setLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState(null);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const response = await authAPI.initiateGoogleAuth();
      const { authUrl } = response.data;
      setAuthUrl(authUrl);
      
      // Open auth URL in new window
      const authWindow = window.open(
        authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Poll for authentication completion
      const pollTimer = setInterval(() => {
        try {
          if (authWindow.closed) {
            clearInterval(pollTimer);
            // Check for session in URL params
            const params = utils.getUrlParams();
            if (params.session && params.auth === 'success') {
              onAuthChange(params.session, true);
              toast.success('Successfully authenticated with Google!');
              // Clean up URL
              window.history.replaceState({}, '', window.location.pathname);
            } else if (params.auth === 'error') {
              toast.error(params.message || 'Authentication failed');
            }
          }
        } catch (error) {
          // Cross-origin error when checking authWindow - this is normal
        }
      }, 1000);

      // Clean up timer after 5 minutes
      setTimeout(() => {
        clearInterval(pollTimer);
        if (authWindow && !authWindow.closed) {
          authWindow.close();
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      const errorInfo = utils.handleError(error);
      toast.error(errorInfo.message);
      console.error('Error initiating auth:', errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      if (sessionId) {
        await authAPI.logout(sessionId);
      }
      onAuthChange(null, false);
      toast.success('Successfully logged out');
    } catch (error) {
      const errorInfo = utils.handleError(error);
      toast.error(errorInfo.message);
      console.error('Error logging out:', errorInfo);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <Card className="animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success-100 rounded-full">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Authenticated</p>
              <p className="text-sm text-gray-600">Connected to Google services</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            loading={loading}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-2 bg-warning-100 rounded-full">
            <AlertCircle className="w-5 h-5 text-warning-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Not Authenticated</p>
            <p className="text-sm text-gray-600">Sign in to access all features</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h4 className="font-medium text-gray-900 mb-2">With Google Authentication:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Create calendar events with Meet links</li>
            <li>• Send meeting invites via Gmail</li>
            <li>• Manage meeting attendees</li>
            <li>• Set up meeting reminders</li>
          </ul>
        </div>

        <div className="bg-primary-50 rounded-lg p-4 text-left">
          <h4 className="font-medium text-primary-900 mb-2">Without Authentication:</h4>
          <ul className="text-sm text-primary-700 space-y-1">
            <li>• Generate simple Meet links</li>
            <li>• Send WhatsApp invitations</li>
            <li>• Copy links to share manually</li>
          </ul>
        </div>

        <Button
          onClick={handleGoogleAuth}
          loading={loading}
          className="w-full"
        >
          <User className="w-4 h-4 mr-2" />
          Sign in with Google
        </Button>
      </div>
    </Card>
  );
};

export default AuthStatus;