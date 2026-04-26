# Google Calendar Setup Guide (OAuth 2.0)

## Quick Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: **External** (for personal use)
   - App name: "HomeBay Dashboard" (or whatever you like)
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Skip this for now (click "Save and Continue")
   - Test users: Add your Google account email
   - Click "Save and Continue"

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "HomeBay Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:5174` (backup port)
   - Authorized redirect URIs:
     - `http://localhost:5173`
     - `http://localhost:5174`
   - Click "Create"

5. **Copy your Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### 3. Update Your .env File

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### 4. Restart Development Server

After updating `.env`, restart Vite:
```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

### 5. Sign In

1. Open your app at `http://localhost:5173`
2. Navigate to the calendar widget
3. Click "Sign in with Google"
4. Google will show a warning that the app is unverified (this is normal for development)
5. Click "Advanced" > "Go to HomeBay Dashboard (unsafe)"
6. Grant calendar read permissions
7. Your events will load automatically!

## How It Works

- **OAuth 2.0** keeps your calendars private - no need to make them public
- The app requests **read-only** access to your calendars
- Sign in once, and your token is stored locally (localStorage)
- The token expires after ~1 hour, then you'll need to sign in again
- All calendar events from your Google account are automatically included

## Accessing From Other Devices (Future)

When you want to access from tablets or other devices on your network:

1. In Google Cloud Console, add more authorized origins:
   - `http://192.168.1.100:5173` (use your actual local IP)
   - Or deploy to a real domain and add that URL

2. Update the redirect URIs to match

## Security Notes

- ✅ Calendars stay private  
- ✅ Read-only access (app cannot create/modify events)
- ✅ Works on localhost without HTTPS
- ✅ Token stored locally (only you can access)
- ⚠️ Never commit your Client ID to public repos (keep .env in .gitignore)

## Troubleshooting

### "Google Client ID not configured"
- Make sure you added `VITE_GOOGLE_CLIENT_ID` to your `.env` file
- Restart the dev server after updating `.env`

### "Failed to initialize Google authentication"  
- Check browser console for detailed errors
- Verify the Client ID is correct
- Make sure `http://localhost:5173` is in authorized origins

### "Access blocked: This app's request is invalid"
- Verify the redirect URI in Google Console matches exactly: `http://localhost:5173`
- No trailing slashes, exact port number

### "This app isn't verified"
- This is normal for development
- Click "Advanced" > "Go to [app name] (unsafe)" to proceed
- For production, you'd submit for Google verification

### No events showing after sign in
- Check browser console for API errors
- Verify you have events in the next 7 days
- Make sure you granted calendar read permission during sign in

## What Calendars Are Included?

The app automatically fetches **all your selected/visible Google calendars**, including:
- Your personal calendar
- Shared family calendars  
- Any calendars you've subscribed to
- Work calendars (if using same Google account)

You can customize which calendars to show by editing the filter in [Calendar.jsx](src/components/Calendar.jsx).

