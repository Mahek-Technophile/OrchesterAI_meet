# 🚀 Deployment Guide - Google Meet System

This guide covers deploying the Google Meet System to production environments.

## 🎯 Deployment Options

### Option 1: Vercel (Frontend) + Heroku (Backend)
**Best for**: Quick deployment with minimal configuration

### Option 2: Docker + VPS/Cloud Provider
**Best for**: Full control and custom infrastructure

### Option 3: Serverless (Vercel Functions + Netlify)
**Best for**: Cost-effective for low to medium traffic

## 🔧 Pre-Deployment Checklist

- [ ] Environment variables configured for production
- [ ] Google Cloud Console project set up for production
- [ ] OAuth redirect URIs updated for production domains
- [ ] Twilio account configured for production
- [ ] Database configured (if using one)
- [ ] SSL/HTTPS certificates ready
- [ ] Domain names configured

## 🌐 Option 1: Vercel + Heroku Deployment

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from frontend directory**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure environment variables in Vercel dashboard**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.herokuapp.com
   NEXT_PUBLIC_APP_NAME=Google Meet System
   ```

4. **Set up custom domain (optional)**
   - Add domain in Vercel dashboard
   - Update DNS records

### Backend Deployment (Heroku)

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku app**
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Set environment variables**
   ```bash
   heroku config:set GOOGLE_CLIENT_ID=your_client_id
   heroku config:set GOOGLE_CLIENT_SECRET=your_client_secret
   heroku config:set GOOGLE_REDIRECT_URI=https://your-backend.herokuapp.com/auth/google/callback
   heroku config:set TWILIO_ACCOUNT_SID=your_twilio_sid
   heroku config:set TWILIO_AUTH_TOKEN=your_twilio_token
   heroku config:set TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push heroku main
   ```

## 🐳 Option 2: Docker Deployment

### Create Dockerfiles

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app

EXPOSE 3001

CMD ["npm", "start"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://backend:3001
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - FRONTEND_URL=http://frontend:3000
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI}
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_WHATSAPP_NUMBER=${TWILIO_WHATSAPP_NUMBER}

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - frontend
      - backend
```

### Deploy with Docker
```bash
# Create .env file with production values
cp .env.example .env

# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f
```

## 🔄 Option 3: Serverless Deployment

### Vercel Functions (Backend)

1. **Restructure backend for Vercel**
   ```
   api/
   ├── auth/
   │   ├── google.js
   │   └── callback.js
   ├── meet/
   │   └── generate.js
   └── notifications/
       └── send.js
   ```

2. **Example API function**
   ```javascript
   // api/meet/generate.js
   export default async function handler(req, res) {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }
     
     // Your existing logic here
   }
   ```

3. **Deploy**
   ```bash
   vercel
   ```

## 🔒 Production Security

### Environment Variables
```bash
# Required production environment variables
NODE_ENV=production
GOOGLE_CLIENT_ID=production_client_id
GOOGLE_CLIENT_SECRET=production_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
TWILIO_ACCOUNT_SID=production_account_sid
TWILIO_AUTH_TOKEN=production_auth_token
FRONTEND_URL=https://yourdomain.com
```

### Security Headers
Update your server or use a reverse proxy (nginx) to add security headers:

```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Proxy to backend
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Proxy to frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoring & Logging

### Application Monitoring
```javascript
// Add to backend/src/server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Health Checks
```javascript
// Enhanced health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-backend-app"
          heroku_email: "your-email@example.com"
          appdir: "backend"

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          npm i -g vercel
          cd frontend
          vercel --prod --token ${{secrets.VERCEL_TOKEN}}
```

## 🌍 Domain & SSL

### Custom Domain Setup

1. **Purchase domain** from registrar
2. **Update DNS records**
   ```
   A     @     your-server-ip
   CNAME www   yourdomain.com
   ```
3. **Configure SSL**
   - Use Let's Encrypt for free SSL
   - Or cloud provider SSL certificates

### Let's Encrypt SSL
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancers for multiple backend instances
- Implement session storage (Redis) for multiple servers
- Use CDN for static assets

### Performance Optimization
- Enable gzip compression
- Implement caching strategies
- Use connection pooling for databases
- Monitor and optimize API response times

## 🚨 Troubleshooting Production Issues

### Common Problems

#### 1. OAuth Redirect Mismatch
```bash
# Update Google Cloud Console
# Add production URLs to authorized redirect URIs
https://yourdomain.com/auth/google/callback
```

#### 2. CORS Issues
```javascript
// Update CORS configuration
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ],
  credentials: true
}));
```

#### 3. Environment Variables
```bash
# Verify all production env vars are set
heroku config:get GOOGLE_CLIENT_ID
```

### Monitoring Commands
```bash
# Check application logs
heroku logs --tail

# Monitor server health
curl https://yourdomain.com/health

# Check SSL certificate
openssl s_client -connect yourdomain.com:443
```

## 📋 Post-Deployment Checklist

- [ ] All services are running
- [ ] Health checks pass
- [ ] SSL certificate is valid
- [ ] OAuth flow works
- [ ] Email sending works
- [ ] WhatsApp sending works
- [ ] Calendar integration works
- [ ] Error monitoring is active
- [ ] Backup strategy is in place
- [ ] Performance monitoring is active

## 🔄 Rollback Strategy

### Quick Rollback
```bash
# Heroku rollback
heroku rollback

# Vercel rollback
vercel --prod --rollback

# Docker rollback
docker-compose down
docker-compose up -d --force-recreate previous-image
```

### Database Backup
```bash
# Regular database backups
pg_dump production_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test API endpoints manually
4. Check external service status (Google APIs, Twilio)

Remember to test the entire flow in production after deployment! 🚀