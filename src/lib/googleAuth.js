// Google OAuth 2.0 Authentication for Calendar API

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'

let tokenClient = null
let gapiInited = false
let gisInited = false
let tokenRefreshTimer = null

// Initialize Google API client
export const initGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    // Load the Google API client library
    const script1 = document.createElement('script')
    script1.src = 'https://apis.google.com/js/api.js'
    script1.onload = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          discoveryDocs: [DISCOVERY_DOC],
        })
        gapiInited = true
        maybeResolve()
      })
    }
    script1.onerror = reject
    document.body.appendChild(script1)

    // Load the Google Identity Services library
    const script2 = document.createElement('script')
    script2.src = 'https://accounts.google.com/gsi/client'
    script2.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Will be set per request
      })
      gisInited = true
      maybeResolve()
    }
    script2.onerror = reject
    document.body.appendChild(script2)

    function maybeResolve() {
      if (gapiInited && gisInited) {
        resolve()
      }
    }
  })
}

// Schedule automatic token refresh before expiration
const scheduleTokenRefresh = (expiresAt) => {
  // Clear any existing timer
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer)
  }

  // Refresh 5 minutes before expiration
  const refreshTime = expiresAt - Date.now() - (5 * 60 * 1000)

  if (refreshTime > 0) {
    console.log(`Token will auto-refresh in ${Math.round(refreshTime / 1000 / 60)} minutes`)
    tokenRefreshTimer = setTimeout(() => {
      console.log('Auto-refreshing token...')
      silentTokenRefresh().catch((error) => {
        console.error('Auto-refresh failed:', error)
        // Token will need manual re-auth on next API call
      })
    }, refreshTime)
  }
}

// Silently refresh token without user interaction
const silentTokenRefresh = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client not initialized'))
      return
    }

    tokenClient.callback = async (response) => {
      if (response.error) {
        console.error('Silent token refresh failed:', response.error)
        // Clear stored token if refresh fails
        localStorage.removeItem('google_token')
        reject(response)
        return
      }

      // Store new token with expiration time
      const tokenInfo = {
        access_token: response.access_token,
        expires_at: Date.now() + (response.expires_in * 1000)
      }
      localStorage.setItem('google_token', JSON.stringify(tokenInfo))
      window.gapi.client.setToken({ access_token: response.access_token })

      scheduleTokenRefresh(tokenInfo.expires_at)
      console.log('Token refreshed successfully')
      resolve(response)
    }

    // Request token silently (won't prompt user if session is still active)
    tokenClient.requestAccessToken({ prompt: '' })
  })
}

// Request access token
export const authorize = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Auth not initialized'))
      return
    }

    tokenClient.callback = async (response) => {
      if (response.error) {
        reject(response)
        return
      }

      // Store token info
      const tokenInfo = {
        access_token: response.access_token,
        expires_at: Date.now() + (response.expires_in * 1000)
      }
      localStorage.setItem('google_token', JSON.stringify(tokenInfo))
      window.gapi.client.setToken({ access_token: response.access_token })

      scheduleTokenRefresh(tokenInfo.expires_at)
      resolve(response)
    }

    // Check if we already have a valid token
    const storedToken = getStoredToken()
    if (storedToken && storedToken.expires_at > Date.now()) {
      // Token is still valid
      window.gapi.client.setToken({ access_token: storedToken.access_token })
      scheduleTokenRefresh(storedToken.expires_at)
      resolve({ access_token: storedToken.access_token })
    } else {
      // Try silent refresh first (works if browser session is still active)
      silentTokenRefresh()
        .then(resolve)
        .catch(() => {
          // If silent refresh fails, show consent screen (first time or session expired)
          console.log('Silent refresh failed, requesting user consent')
          tokenClient.requestAccessToken({ prompt: 'consent' })
        })
    }
  })
}

// Get stored token
export const getStoredToken = () => {
  const stored = localStorage.getItem('google_token')
  if (!stored) return null

  const tokenInfo = JSON.parse(stored)

  // Check if expired
  if (tokenInfo.expires_at <= Date.now()) {
    localStorage.removeItem('google_token')
    return null
  }

  return tokenInfo
}

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getStoredToken()
  return !!token
}

// Sign out
export const signOut = () => {
  // Clear auto-refresh timer
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer)
    tokenRefreshTimer = null
  }

  const token = getStoredToken()
  if (token) {
    window.google.accounts.oauth2.revoke(token.access_token, () => {
      localStorage.removeItem('google_token')
    })
  } else {
    localStorage.removeItem('google_token')
  }
}

// Set the token for API calls
export const setToken = () => {
  const token = getStoredToken()
  if (token) {
    window.gapi.client.setToken({ access_token: token.access_token })
  }
}

// Fetch calendar list
export const fetchCalendarList = async () => {
  setToken()

  try {
    const response = await window.gapi.client.calendar.calendarList.list({
      maxResults: 250, // Increased to get all calendars including Family Link
      showHidden: true, // Show hidden calendars too (Family Link may be hidden)
      minAccessRole: 'freeBusyReader' // Include calendars with any access level
    })

    return response.result.items || []
  } catch (error) {
    console.error('Error fetching calendar list:', error)
    throw error
  }
}

// Fetch events from a specific calendar
export const fetchCalendarEvents = async (calendarId, timeMin, timeMax) => {
  setToken()

  try {
    console.log(`  Fetching from "${calendarId}" between ${timeMin.toLocaleDateString()} and ${timeMax.toLocaleDateString()}`)

    const response = await window.gapi.client.calendar.events.list({
      calendarId: calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 100,
    })

    const items = response.result.items || []

    if (items.length === 0) {
      console.log(`    No events found in this date range`)
    } else {
      console.log(`    Found ${items.length} events`)
      items.slice(0, 3).forEach(event => {
        console.log(`      - ${event.summary} (${event.start.dateTime || event.start.date})`)
      })
    }

    return items
  } catch (error) {
    console.error(`    Error fetching events:`, error)
    throw error
  }
}

// Fetch events from multiple calendars
export const fetchAllCalendarEvents = async (calendarIds, timeMin, timeMax) => {
  // Use provided dates or default to next 30 days
  const now = timeMin || new Date()
  if (!timeMin) {
    now.setHours(0, 0, 0, 0)
  }
  const endDate = timeMax || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  console.log(`Fetching events from ${calendarIds.length} calendars (${now.toLocaleDateString()} to ${endDate.toLocaleDateString()})...`)

  // Fetch from all calendars in parallel with calendar ID tagging
  // Use allSettled to handle individual calendar failures gracefully
  const promises = calendarIds.map(async (calId) => {
    try {
      const events = await fetchCalendarEvents(calId, now, endDate)
      console.log(`  ✓ Calendar "${calId}": ${events.length} events`)
      // Tag each event with its calendar ID
      return events.map(event => ({ ...event, calendarId: calId }))
    } catch (error) {
      console.warn(`  ✗ Failed to fetch from "${calId}":`, error.message)
      return [] // Return empty array on error
    }
  })

  const results = await Promise.allSettled(promises)

  // Combine all successful results
  const allEvents = results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value)
    .flat()
    .sort((a, b) => {
      const aStart = new Date(a.start.dateTime || a.start.date)
      const bStart = new Date(b.start.dateTime || b.start.date)
      return aStart - bStart
    })

  console.log(`Total events fetched: ${allEvents.length}`)

  return allEvents
}
