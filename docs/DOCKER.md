# Docker Quick Start Guide

## Prerequisites
- Docker installed on your system
- Docker Compose installed

## Running the Application

### Start the application:
```bash
docker compose up
```

The application will be available at: **http://localhost:5173**

### Start in detached mode (background):
```bash
docker compose up -d
```

### View logs:
```bash
docker compose logs -f
```

### Stop the application:
```bash
docker compose down
```

### Rebuild after dependency changes:
```bash
docker compose up --build
```

### Clean restart (removes containers and volumes):
```bash
docker compose down -v
docker compose up --build
```

## Features

✅ **Hot Module Replacement (HMR)** - Changes to your code are reflected immediately
✅ **Volume Mounting** - Source code is mounted, so you can edit files on your host
✅ **Environment Variables** - `.env` file is automatically mounted
✅ **Auto-restart** - Container restarts automatically if it crashes

## Troubleshooting

### Port 5173 already in use
If you have Vite running locally, stop it first:
```bash
# Kill any process using port 5173
lsof -ti:5173 | xargs kill -9
```

Or change the port in `docker-compose.yml`:
```yaml
ports:
  - "3000:5173"  # Access via localhost:3000
```

### Changes not reflecting
The application uses polling for file watching in Docker. If hot reload isn't working:
1. Stop the container: `docker compose down`
2. Clear volumes: `docker compose down -v`
3. Rebuild: `docker compose up --build`

### Permission issues
If you get permission errors, ensure your `.env` file has proper permissions:
```bash
chmod 644 .env
```

## Development Workflow

1. **Make code changes** - Edit files in `src/` with your IDE
2. **Browser auto-refreshes** - Vite HMR updates the browser automatically
3. **Check logs** - Run `docker compose logs -f` to see console output
4. **Restart if needed** - Run `docker compose restart` for clean restart

## Production Build

To build for production:
```bash
# Build the app
docker compose exec homebay npm run build

# The built files will be in dist/
```

For a production Docker image, see `Dockerfile.prod` (coming soon).
