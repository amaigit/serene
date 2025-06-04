# Personal Productivity Suite

A comprehensive personal productivity application built with React, Vite, TailwindCSS, and Convex. This application combines task management (GTD methodology), inventory tracking, and AI-powered features to help you stay organized and productive.
Inspired by https://www.youtube.com/shorts/2X0GuU2hY0U

## Demo
Try out the demo on [convex.app](https://exuberant-rat-912.convex.app/)!
## Features

### 📋 Task Management (GTD)
- **Getting Things Done (GTD) methodology** implementation
- Multiple view modes: List, Calendar, Kanban board
- Task prioritization with AI suggestions
- Project and context organization
- Due dates and scheduling
- Time estimation and tracking

### 📦 Inventory Management
- Track personal belongings with categories and locations
- AI-powered item descriptions
- Automatic task creation for disposal items (ToDiscard, ToDonate, ToSell)
- Photo support and keyword tagging
- Value tracking and purchase date recording

### 🤖 AI Features
- **Task Priority Suggestions**: AI analyzes task content to suggest appropriate priority levels
- **Inventory Descriptions**: AI generates helpful descriptions for inventory items
- **Automated Task Creation**: Smart task generation for inventory processing

### 🏗️ Organization Tools
- **Projects**: Group related tasks and track progress
- **Contexts**: Define when/where tasks should be done
- **Locations**: Manage physical locations for tasks and inventory

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Convex (real-time database and functions)
- **Authentication**: Convex Auth
- **AI**: Google Gemini API integration
- **Styling**: TailwindCSS with responsive design

## Prerequisites

- Node.js 18+ and npm
- Convex account (free tier available)
- Google Gemini API key (optional, for AI features)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd personal-productivity-suite
npm install
```

### 2. Set up Convex

```bash
# Install Convex CLI globally
npm install -g convex

# Login to Convex
npx convex login

# Initialize Convex (if not already done)
npx convex dev
```

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
# Convex (automatically configured by Convex CLI)
VITE_CONVEX_URL=your_convex_url

# Optional: Google Gemini API for AI features
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the Application

```bash
# Start Convex backend
npx convex dev

# In another terminal, start the frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## Configuration

### AI Features Setup

1. Get a free Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. In the application, go to Settings and enter your API key
3. AI features will now be available for task priority suggestions and inventory descriptions

### User Settings

Access the Settings page to configure:
- **Gemini API Key**: For AI-powered features
- **Default Task View**: Choose between List, Calendar, or Kanban
- **Theme**: Light/Dark mode (Dark mode coming soon)

## Docker Deployment

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t productivity-suite .

# Run the container
docker run -p 3000:3000 productivity-suite
```

### Docker Compose

```bash
# Start with docker-compose
docker-compose up -d

# Stop
docker-compose down
```

### Environment Variables for Docker

Create a `.env` file for production:

```env
# Convex Configuration
VITE_CONVEX_URL=your_production_convex_url

# Optional AI Features
GEMINI_API_KEY=your_gemini_api_key

# Production settings
NODE_ENV=production
PORT=3000
```

## Reverse Proxy Setup

### Nginx Configuration

Create `/etc/nginx/sites-available/productivity-suite`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/productivity-suite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Traefik Configuration

#### docker-compose.yml with Traefik

```yaml
version: '3.8'

services:
  productivity-suite:
    build: .
    container_name: productivity-suite
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.productivity.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.productivity.entrypoints=websecure"
      - "traefik.http.routers.productivity.tls.certresolver=letsencrypt"
      - "traefik.http.services.productivity.loadbalancer.server.port=3000"
      # Optional: Basic auth
      # - "traefik.http.routers.productivity.middlewares=auth"
      # - "traefik.http.middlewares.auth.basicauth.users=user:$$2y$$10$$..."
    networks:
      - traefik

  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=your-email@domain.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Traefik dashboard
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
    networks:
      - traefik

networks:
  traefik:
    external: true
```

Create the Traefik network:
```bash
docker network create traefik
```

#### Traefik Static Configuration (traefik.yml)

```yaml
api:
  dashboard: true
  insecure: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

providers:
  docker:
    exposedByDefault: false

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@domain.com
      storage: /letsencrypt/acme.json
      tlsChallenge: {}
```

## Production Deployment Checklist

### Security
- [ ] Set up SSL/TLS certificates
- [ ] Configure proper CORS settings in Convex
- [ ] Use environment variables for all secrets
- [ ] Enable security headers
- [ ] Set up proper authentication

### Performance
- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Optimize images and assets
- [ ] Set up CDN if needed
- [ ] Monitor application performance

### Monitoring
- [ ] Set up application logging
- [ ] Configure health checks
- [ ] Monitor Convex usage and limits
- [ ] Set up alerts for errors

### Backup
- [ ] Regular Convex data exports
- [ ] Environment configuration backup
- [ ] SSL certificate backup

## API Documentation

### Convex Functions

#### Tasks
- `api.tasks.list` - Get user's tasks with optional filtering
- `api.tasks.create` - Create a new task
- `api.tasks.update` - Update an existing task
- `api.tasks.remove` - Delete a task
- `api.tasks.getTasksForCalendar` - Get tasks for calendar view

#### Inventory
- `api.inventory.list` - Get user's inventory items
- `api.inventory.create` - Create a new inventory item
- `api.inventory.update` - Update an existing item
- `api.inventory.remove` - Delete an item

#### AI Features
- `api.ai.suggestTaskPriority` - Get AI priority suggestion for tasks
- `api.ai.suggestItemDescription` - Get AI description for inventory items

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Check the [Issues](../../issues) page
- Review the [Convex Documentation](https://docs.convex.dev)
- Check [Google Gemini API Documentation](https://ai.google.dev/docs)

## Roadmap

- [ ] Dark mode implementation
- [ ] Mobile app (React Native)
- [ ] Offline support with sync
- [ ] Advanced reporting and analytics
- [ ] Team collaboration features
- [ ] Integration with external calendars
- [ ] Voice input for tasks
- [ ] Advanced AI features (task scheduling, smart suggestions)
