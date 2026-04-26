# 🏠 HomeBay Dashboard

A Raspberry Pi touchscreen dashboard for viewing family events, controlling home lights, and checking school lunch menus. HomeBay is a central hub that helps families stay organized by displaying what's happening today and throughout the month.

## 💡 About

HomeBay started as a solution to a common family problem: **we needed a central place to see what's happening each day**. With scattered calendars, school schedules, and smart home devices, important information was hard to access quickly.

This project transforms a Raspberry Pi 4 and touchscreen (800x480) into an always-on family dashboard that everyone can glance at to see:
- Today's calendar events
- This week's or month's schedule
- Current weather
- School lunch menu
- Smart home light controls

**Why HomeBay?** I had a Raspberry Pi 4 collecting dust and a small touchscreen with no purpose. Rather than let them sit unused, I built a practical tool that improves our family's daily routine by keeping essential information close and visible.

## ✨ Features

- 📅 **Google Calendar Integration**
  - OAuth 2.0 authentication
  - Multi-calendar support (including Family Link calendars)
  - Week/Month view toggle
  - Grid or List display modes
  - Event details modal with descriptions and locations
  - Auto-refresh at midnight
  - Rate limiting protection

- 💡 **Govee Smart Home Control**
  - Device on/off toggle
  - Brightness adjustment
  - Color picker with preset palette
  - Minimal or Full view modes
  - Real-time device state tracking

- 🌤️ **Weather Display**
  - Current temperature and conditions
  - Location-based (uses ZIP code)
  - Live updates

- 🍽️ **School Lunch Menu**
  - Daily menu from MealViewer
  - Categorized lunch items
  - "No school lunch" message for weekends/holidays
  - Auto-refresh at midnight

- ⏰ **Live Clock & Date**
  - Real-time display
  - Day of week and formatted date

- 🎨 **Customization**
  - Multiple background image options (mountains, space, ocean, abstract, nature)
  - Custom background URL support
  - Configurable refresh rates
  - Screen saver timeout settings
  - Dark theme optimized for always-on displays

- 📱 **Touch-Optimized Interface**
  - Swipe between pages (Home, Govee Control, Settings)
  - Scroll buttons for easy navigation
  - Mouse-emulation friendly (works with Linux touchscreens)
  - No scrollbars for clean look
  - 800x480 resolution optimized

## 📦 Tech Stack

**Frontend:**
- React 19.1.0
- Vite 7.0.4 (Build tool & dev server)
- Tailwind CSS 4.2.4

**APIs & Services:**
- Google Calendar API (OAuth 2.0)
- Govee Developer API
- MealViewer API

**Deployment:**
- Docker & Docker Compose
- Raspberry Pi 4 (Chromium kiosk mode)
- Node.js 20

## 🚀 Quick Start

### Development (Local)

1. **Clone and install:**
```bash
git clone <your-repo-url>
cd homebay
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the root directory:
```env
# Weather (your ZIP code)
VITE_HOME_ZIP=YOUR_ZIP_CODE

# School Lunch (your school's MealViewer ID)
VITE_MEALVIEWER_SCHOOL_ID=YOUR_SCHOOL_ID

# Govee Smart Home (get from Govee Home app → Settings → Apply for API Key)
VITE_GOVEE_API_KEY=YOUR_GOVEE_API_KEY

# Google Calendar (see CALENDAR_SETUP.md)
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

3. **Start development server:**
```bash
npm run dev
```

Visit **http://localhost:5173**

### Development (Docker)

1. **Create `.env` file** (as shown above)

2. **Start with Docker Compose:**
```bash
docker compose up
```

Visit **http://localhost:5173**

The Docker setup includes:
- Hot module replacement (changes reflect immediately)
- Volume mounts for live code editing
- Automatic restart on failure
- Isolated Node.js environment

**Docker Commands:**
```bash
# Start dashboard
docker compose up

# Start in background
docker compose up -d

# Stop dashboard
docker compose down

# Rebuild after dependency changes
docker compose up --build

# View logs
docker compose logs -f
```

## 🥧 Raspberry Pi Deployment

### Hardware Requirements
- Raspberry Pi 4 (or compatible)
- Official 7" touchscreen or 800x480 display
- MicroSD card (16GB+)
- Power supply

### Production Setup

1. **Install Raspberry Pi OS** (Lite or Desktop)

2. **Install dependencies:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Chromium
sudo apt install -y chromium-browser

# Clone repository
cd ~
git clone <your-repo-url> homebay
cd homebay
npm install
```

3. **Configure `.env` file** with your API keys

4. **Build and run:**
```bash
# Make start script executable
chmod +x start.sh

# Run in kiosk mode
./start.sh
```

The `start.sh` script will:
- Build the production bundle
- Start the preview server (port 4173)
- Launch Chromium in fullscreen kiosk mode
- Automatically cleanup on exit

### Auto-Start on Boot

To launch HomeBay automatically when your Pi boots:

1. **Create systemd service:**
```bash
sudo nano /etc/systemd/system/homebay.service
```

2. **Add configuration:**
```ini
[Unit]
Description=HomeBay Dashboard
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/homebay
ExecStart=/home/pi/homebay/start.sh
Restart=on-failure
RestartSec=10
Environment=DISPLAY=:0

[Install]
WantedBy=graphical.target
```

3. **Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable homebay
sudo systemctl start homebay
```

## ⚙️ Settings & Configuration

Access the Settings page (swipe to page 3) to configure:

- **Background Image**: Choose from curated images or use custom URL
- **Location**: Set ZIP code for weather
- **School**: Set MealViewer school ID
- **Rate Limits**: Control API refresh rates (default: 3/minute)
- **Auto-Refresh**: Enable midnight refresh for calendar and lunch
- **Screen Saver**: Set inactivity timeout (1-30 minutes)
- **Govee View**: Toggle between minimal or full device controls

Settings persist in localStorage and survive page reloads.

## 📖 Documentation

- [CALENDAR_SETUP.md](CALENDAR_SETUP.md) - Google Calendar OAuth configuration
- [DOCKER.md](DOCKER.md) - Detailed Docker setup and troubleshooting

## 🎯 Usage Tips

**Navigation:**
- Swipe left/right to change pages
- Use arrow buttons in the middle of screen edges
- Scroll buttons appear on Calendar, Settings, and Govee pages

**Calendar:**
- Click events in grid or list for full details
- Toggle Week/Month views for different time ranges
- Use Refresh button to manually update (respects rate limits)

**Govee Devices:**
- Minimal mode: Quick on/off toggles
- Full mode: Brightness sliders and color pickers
- Device states update in real-time

**Touch Optimization:**
- Designed for click-and-drag scrolling
- Text selection disabled for smoother interaction
- Mouse emulation friendly for Linux touchscreens

## 🛠️ Development

**Project Structure:**
```
homebay/
├── src/
│   ├── components/       # React components
│   │   ├── Calendar.jsx
│   │   ├── Clock.jsx
│   │   ├── SchoolLunch.jsx
│   │   ├── Weather.jsx
│   │   ├── GoveeDeviceCard.jsx
│   │   └── ScrollButtons.jsx
│   ├── pages/            # Page components
│   │   ├── HomePage.jsx
│   │   ├── GoveeController.jsx
│   │   └── SettingsPage.jsx
│   ├── lib/              # APIs and utilities
│   │   ├── googleAuth.js
│   │   ├── goveeApi.js
│   │   └── mealService.js
│   ├── App.jsx           # Main app with page navigation
│   └── main.jsx
├── public/               # Static assets
├── .env                  # Environment variables (create this)
├── docker-compose.yml    # Docker configuration
├── Dockerfile            # Docker image definition
└── start.sh             # Raspberry Pi startup script
```

**Available Scripts:**
```bash
npm run dev       # Development server (port 5173)
npm run build     # Production build
npm run preview   # Preview production build (port 4173)
npm run lint      # Run ESLint
```

## 🐛 Troubleshooting

**Calendar not loading?**
- Check VITE_GOOGLE_CLIENT_ID in `.env`
- Follow [CALENDAR_SETUP.md](CALENDAR_SETUP.md) for OAuth setup
- Ensure `http://localhost:5173` is in authorized origins

**Govee devices not appearing?**
- Verify VITE_GOVEE_API_KEY is correct
- Check rate limits in Settings page
- Ensure devices are online in Govee Home app

**Touch scrolling issues?**
- Use scroll buttons on right side of pages
- Drag-to-scroll should work with mouse emulation
- Check index.css for touch CSS properties

**Docker issues?**
- See [DOCKER.md](DOCKER.md) for detailed troubleshooting
- Ensure `.env` file exists and is mounted
- Check logs: `docker compose logs -f`

## 📝 License

MIT

## 🙏 Acknowledgments

- Google Calendar API
- Govee Developer API
- MealViewer API
- React & Vite teams
- Tailwind CSS
