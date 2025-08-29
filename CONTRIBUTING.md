# 🤝 Contributing to Google Meet System

Thank you for your interest in contributing to the Google Meet System! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Google Cloud Console account (for testing)
- Twilio account (for testing WhatsApp features)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/google-meet-system.git
   cd google-meet-system
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Set up environment variables**
   - Follow the [SETUP_GUIDE.md](SETUP_GUIDE.md)
   - Create both `backend/.env` and `frontend/.env.local`

4. **Start development servers**
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style

We use ESLint and Prettier for code formatting. Please ensure your code follows these standards:

- **JavaScript/React**: Follow the Next.js and React best practices
- **Node.js**: Use modern ES6+ features
- **Async/Await**: Prefer over promises chains
- **Error Handling**: Always include proper error handling
- **Documentation**: Add JSDoc comments for functions

### Project Structure

```
├── frontend/                 # Next.js frontend
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   └── *.js            # Feature components
│   ├── lib/                # Utilities and API client
│   ├── pages/              # Next.js pages
│   └── styles/             # CSS and Tailwind
├── backend/                 # Express.js backend
│   └── src/
│       ├── config/         # Configuration files
│       ├── routes/         # API route handlers
│       ├── services/       # Business logic
│       └── server.js       # Main server file
└── docs/                   # Documentation
```

### Naming Conventions

- **Files**: Use camelCase for JavaScript files
- **Components**: Use PascalCase for React components
- **Functions**: Use camelCase
- **Constants**: Use UPPER_SNAKE_CASE
- **CSS Classes**: Use kebab-case (Tailwind CSS)

## 🔧 Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

### 2. Make Your Changes

- Write clean, readable code
- Add comments for complex logic
- Follow existing patterns in the codebase
- Update documentation if needed

### 3. Testing

#### Frontend Testing
```bash
cd frontend
npm run test
npm run lint
```

#### Backend Testing
```bash
cd backend
npm run test
npm run lint
```

#### Manual Testing
- Test the feature in both authenticated and non-authenticated states
- Test error scenarios
- Verify responsive design
- Test API endpoints with different inputs

### 4. Commit Your Changes

Use conventional commit messages:

```bash
git commit -m "feat: add new platform integration"
git commit -m "fix: resolve authentication bug"
git commit -m "docs: update API documentation"
git commit -m "style: improve UI responsiveness"
git commit -m "refactor: optimize email service"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## 🎯 Types of Contributions

### 🐛 Bug Fixes

- Fix existing functionality that isn't working correctly
- Improve error handling
- Resolve security vulnerabilities

### ✨ New Features

- Add new platform integrations (Slack, Teams, Zoom)
- Enhance existing features
- Improve user experience

### 📚 Documentation

- Improve setup guides
- Add code examples
- Update API documentation
- Write tutorials

### 🎨 UI/UX Improvements

- Enhance design and accessibility
- Improve responsive design
- Add animations and micro-interactions

### ⚡ Performance

- Optimize API calls
- Improve loading times
- Reduce bundle size

## 🔌 Adding New Platforms

To add support for new platforms (e.g., Slack, Microsoft Teams):

### 1. Create Service Class

Create a new service in `backend/src/services/`:

```javascript
// backend/src/services/slackService.js
class SlackService {
  constructor() {
    this.client = new SlackClient(process.env.SLACK_TOKEN);
  }

  async sendMeetingInvite(messageData) {
    // Implementation
  }
}

module.exports = SlackService;
```

### 2. Update Environment Variables

Add configuration to `backend/.env.example`:

```env
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
```

### 3. Update Notification Routes

Add the new service to `backend/src/routes/notifications.js`:

```javascript
const SlackService = require('../services/slackService');
const slackService = new SlackService();

// Add new endpoint
router.post('/slack', async (req, res) => {
  // Implementation
});
```

### 4. Update Frontend

Add UI controls in `frontend/components/MeetingGenerator.js`:

```javascript
<Checkbox
  label="Send via Slack"
  description="Share meeting link in Slack channels"
  checked={notifications.slack}
  onChange={(e) => setNotifications(prev => ({ ...prev, slack: e.target.checked }))}
/>
```

### 5. Update Documentation

- Add setup instructions
- Update API documentation
- Add examples

## 🧪 Testing Guidelines

### Unit Tests

Write unit tests for:
- Service methods
- Utility functions
- React components (optional)

### Integration Tests

Test:
- API endpoints
- Authentication flow
- External service integrations

### Manual Testing Checklist

- [ ] Authentication flow works
- [ ] Meeting generation works
- [ ] Email sending works (if authenticated)
- [ ] WhatsApp sending works
- [ ] Calendar event creation works (if authenticated)
- [ ] Error handling is proper
- [ ] UI is responsive
- [ ] No console errors

## 📝 Pull Request Guidelines

### Before Submitting

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No merge conflicts

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Manual testing completed
- [ ] Unit tests added/updated
- [ ] Integration tests pass

## Screenshots (if applicable)
Add screenshots for UI changes

## Additional Notes
Any additional information or context
```

### Review Process

1. **Automated Checks**: CI/CD will run tests and linting
2. **Code Review**: Maintainers will review your code
3. **Testing**: Manual testing by reviewers
4. **Merge**: Once approved, your PR will be merged

## 🚨 Security Considerations

### Sensitive Data

- Never commit API keys or secrets
- Use environment variables for configuration
- Be careful with user data handling
- Follow OAuth2 best practices

### Code Security

- Validate all inputs
- Sanitize data before database operations
- Use parameterized queries
- Implement proper error handling without exposing internals

## 📞 Getting Help

### Community

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion

### Documentation

- [README.md](README.md) - Project overview
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup instructions
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete API reference

### Contact

For urgent security issues, please email: [security@example.com]

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- GitHub contributors graph
- Release notes for significant contributions

Thank you for contributing to the Google Meet System! 🚀