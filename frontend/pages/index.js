import { useState, useEffect } from 'react';
import { Video, Mail, MessageSquare, Calendar, Github, ExternalLink } from 'lucide-react';
import AuthStatus from '../components/AuthStatus';
import MeetingGenerator from '../components/MeetingGenerator';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { authAPI, utils } from '../lib/api';

export default function Home() {
  const [sessionId, setSessionId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for session on page load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check URL params for session from OAuth callback
        const params = utils.getUrlParams();
        
        if (params.session) {
          const response = await authAPI.checkAuthStatus(params.session);
          if (response.data.authenticated) {
            setSessionId(params.session);
            setIsAuthenticated(true);
            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);
          }
        }
        
        // Check localStorage for existing session
        const savedSession = localStorage.getItem('meetSystemSession');
        if (savedSession && !sessionId) {
          try {
            const response = await authAPI.checkAuthStatus(savedSession);
            if (response.data.authenticated) {
              setSessionId(savedSession);
              setIsAuthenticated(true);
            } else {
              localStorage.removeItem('meetSystemSession');
            }
          } catch (error) {
            localStorage.removeItem('meetSystemSession');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleAuthChange = (newSessionId, authenticated) => {
    setSessionId(newSessionId);
    setIsAuthenticated(authenticated);
    
    if (newSessionId) {
      localStorage.setItem('meetSystemSession', newSessionId);
    } else {
      localStorage.removeItem('meetSystemSession');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-success-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Meet System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Google Meet System</h1>
                <p className="text-sm text-gray-600">Generate & share meeting links instantly</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Create Google Meet Links
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Generate meeting links instantly and share them via email, WhatsApp, or calendar events. 
              Perfect for quick meetings and team collaboration.
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <Card className="text-center">
              <div className="space-y-3">
                <div className="p-3 bg-primary-100 rounded-full w-fit mx-auto">
                  <Video className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Instant Meet Links</h3>
                <p className="text-sm text-gray-600">
                  Generate Google Meet links with or without calendar integration
                </p>
              </div>
            </Card>
            
            <Card className="text-center">
              <div className="space-y-3">
                <div className="p-3 bg-success-100 rounded-full w-fit mx-auto">
                  <Mail className="w-6 h-6 text-success-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Multi-Channel Sharing</h3>
                <p className="text-sm text-gray-600">
                  Send invites via Gmail, WhatsApp, or create calendar events
                </p>
              </div>
            </Card>
            
            <Card className="text-center">
              <div className="space-y-3">
                <div className="p-3 bg-warning-100 rounded-full w-fit mx-auto">
                  <Calendar className="w-6 h-6 text-warning-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Smart Scheduling</h3>
                <p className="text-sm text-gray-600">
                  Set meeting times, add attendees, and send reminders
                </p>
              </div>
            </Card>
          </div>

          {/* Authentication Status */}
          <AuthStatus
            sessionId={sessionId}
            isAuthenticated={isAuthenticated}
            onAuthChange={handleAuthChange}
          />

          {/* Main Meeting Generator */}
          <MeetingGenerator
            sessionId={sessionId}
            isAuthenticated={isAuthenticated}
          />

          {/* Help Section */}
          <Card title="How it Works" className="mt-8">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Without Authentication:</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Configure your meeting details</li>
                    <li>Click "Generate Meeting Link"</li>
                    <li>Copy the link or send via WhatsApp</li>
                    <li>Share with participants</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">With Google Authentication:</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Sign in with your Google account</li>
                    <li>Set meeting details and attendees</li>
                    <li>Choose sharing options (email, WhatsApp, calendar)</li>
                    <li>Generate and auto-send invitations</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-primary-50 rounded-lg p-4 mt-6">
                <p className="text-sm text-primary-800">
                  <strong>Pro Tip:</strong> Use Google authentication to automatically create calendar events 
                  with Meet links and send professional email invitations to all attendees.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-1 bg-primary-600 rounded">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-600">
                Google Meet System - Streamline your meeting workflow
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>Built with Next.js & Express</span>
              <span>•</span>
              <span>Powered by Google APIs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}