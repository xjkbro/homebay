import React, { useState, useEffect, useRef } from 'react'
import {
  initGoogleAuth,
  authorize,
  isAuthenticated,
  signOut,
  fetchCalendarList,
  fetchAllCalendarEvents
} from '../lib/googleAuth'
import ScrollButtons from './ScrollButtons'

// Color palette for different calendars
const CALENDAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-cyan-500'
]

function Calendar() {
  const [events, setEvents] = useState([])
  const [calendars, setCalendars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)

  // Load preferences from localStorage or use defaults
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('calendarViewMode') || 'month'
  })
  const [displayMode, setDisplayMode] = useState(() => {
    return localStorage.getItem('calendarDisplayMode') || 'calendar'
  })

  const [refreshCount, setRefreshCount] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Ref for scrollable container
  const scrollContainerRef = useRef(null)

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('calendarViewMode', viewMode)
  }, [viewMode])

  useEffect(() => {
    localStorage.setItem('calendarDisplayMode', displayMode)
  }, [displayMode])

  useEffect(() => {
    initializeAuth()
    // Initialize refresh count display
    const refreshData = JSON.parse(localStorage.getItem('calendarRefreshes') || '[]')
    const oneMinuteAgo = Date.now() - 60 * 1000
    const recentCount = refreshData.filter(t => t > oneMinuteAgo).length
    setRefreshCount(recentCount)
  }, [])

  // Auto-refresh at midnight
  useEffect(() => {
    const scheduleNightRefresh = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const msUntilMidnight = tomorrow.getTime() - now.getTime()

      // Schedule refresh at midnight
      const timeoutId = setTimeout(() => {
        console.log('Midnight refresh triggered for calendar')
        if (authenticated && calendars.length > 0) {
          loadCalendarsAndEvents()
        }
        // Schedule next midnight refresh
        scheduleNightRefresh()
      }, msUntilMidnight)

      return timeoutId
    }

    const timeoutId = scheduleNightRefresh()
    return () => clearTimeout(timeoutId)
  }, [authenticated, calendars])

  // Reload events when view mode changes
  useEffect(() => {
    if (authenticated && calendars.length > 0) {
      loadCalendarsAndEvents()
    }
  }, [viewMode])

  const initializeAuth = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    if (!clientId) {
      setError('Google Client ID not configured')
      setLoading(false)
      return
    }

    try {
      await initGoogleAuth()
      setAuthInitialized(true)

      // Check if already authenticated
      if (isAuthenticated()) {
        setAuthenticated(true)
        await loadCalendarsAndEvents()
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.error('Error initializing Google Auth:', err)
      setError('Failed to initialize Google authentication')
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    try {
      setLoading(true)
      setError(null) // Clear any previous errors
      await authorize()
      setAuthenticated(true)
      await loadCalendarsAndEvents()
    } catch (err) {
      console.error('Error signing in:', err)
      setError('Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    // Confirmation dialog to prevent accidental sign out
    const confirmed = window.confirm('Are you sure you want to sign out of Google Calendar?')

    if (!confirmed) {
      return
    }

    signOut()
    setAuthenticated(false)
    setEvents([])
    setCalendars([])
    setError(null) // Clear errors on sign out
    setLoading(false) // Reset loading state
  }


  const canRefresh = () => {
    const refreshData = JSON.parse(localStorage.getItem('calendarRefreshes') || '[]')
    const oneMinuteAgo = Date.now() - 60 * 1000
    const rateLimit = parseInt(localStorage.getItem('calendarRateLimit') || '3')

    // Filter to only refreshes in the last minute
    const recentRefreshes = refreshData.filter(timestamp => timestamp > oneMinuteAgo)

    // Update localStorage with only recent refreshes
    localStorage.setItem('calendarRefreshes', JSON.stringify(recentRefreshes))

    return recentRefreshes.length < rateLimit
  }

  const recordRefresh = () => {
    const refreshData = JSON.parse(localStorage.getItem('calendarRefreshes') || '[]')
    refreshData.push(Date.now())
    localStorage.setItem('calendarRefreshes', JSON.stringify(refreshData))

    // Update count for UI
    const oneMinuteAgo = Date.now() - 60 * 1000
    const recentCount = refreshData.filter(t => t > oneMinuteAgo).length
    setRefreshCount(recentCount)
  }

  const handleRefresh = async () => {
    const rateLimit = parseInt(localStorage.getItem('calendarRateLimit') || '3')
    if (!canRefresh()) {
      setError(`Refresh limit reached. You can refresh ${rateLimit} times per minute.`)
      setTimeout(() => setError(null), 3000)
      return
    }

    recordRefresh()
    await loadCalendarsAndEvents()
  }

  const getDateRange = () => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (viewMode === 'week') {
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return { start: now, end: nextWeek }
    } else {
      const nextMonth = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000)
      return { start: now, end: nextMonth }
    }
  }

  const loadCalendarsAndEvents = async () => {
    try {
      setLoading(true)

      // Fetch user's calendar list
      const calendarList = await fetchCalendarList()

      console.log('Found calendars:', calendarList.map(cal => ({
        name: cal.summary,
        id: cal.id,
        selected: cal.selected,
        accessRole: cal.accessRole,
        primary: cal.primary
      })))

      // Get ALL calendars including Family Link calendars
      // Family Link calendars don't have special accessRole, they just appear in the list
      const relevantCalendars = calendarList
        .filter(cal => {
          // Include if it has any access role OR if it's just in the calendar list
          // This catches Family Link calendars which may not have explicit roles
          return cal.accessRole || cal.selected !== false
        })
        .map((cal, index) => ({
          id: cal.id,
          name: cal.summary,
          color: CALENDAR_COLORS[index % CALENDAR_COLORS.length],
          backgroundColor: cal.backgroundColor,
          accessRole: cal.accessRole
        }))

      console.log('Using calendars:', relevantCalendars.map(c => ({
        name: c.name,
        id: c.id,
        accessRole: c.accessRole
      })))

      setCalendars(relevantCalendars)

      // Fetch events from all calendars
      const calendarIds = relevantCalendars.map(cal => cal.id)
      const dateRange = getDateRange()
      console.log(`Attempting to fetch events from ${calendarIds.length} calendars (${viewMode} view)`)

      const allEvents = await fetchAllCalendarEvents(calendarIds, dateRange.start, dateRange.end)

      // Map events with calendar info
      const mappedEvents = allEvents.map(event => {
        // Find the calendar this event belongs to using the tagged calendarId
        const calendar = relevantCalendars.find(cal => cal.id === event.calendarId)
        return {
          id: event.id,
          title: event.summary || 'Untitled Event',
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          allDay: !event.start.dateTime,
          calendarName: calendar?.name || 'Unknown Calendar',
          calendarColor: calendar?.color || 'bg-gray-500',
          location: event.location,
          description: event.description
        }
      })

      // Show breakdown of events by calendar
      const eventsByCalendar = mappedEvents.reduce((acc, event) => {
        acc[event.calendarName] = (acc[event.calendarName] || 0) + 1
        return acc
      }, {})

      console.log(`Loaded ${mappedEvents.length} total events:`, eventsByCalendar)

      setEvents(mappedEvents)
      setError(null)
    } catch (err) {
      console.error('Error loading calendar data:', err)
      setError('Failed to load calendar events')
    } finally {
      setLoading(false)
    }
  }

  const formatEventTime = (event) => {
    let startDate, endDate

    // For all-day events, parse date string in local time to avoid timezone issues
    if (event.allDay) {
      const [year, month, day] = event.start.split('-').map(Number)
      startDate = new Date(year, month - 1, day)
      const [endYear, endMonth, endDay] = event.end.split('-').map(Number)
      endDate = new Date(endYear, endMonth - 1, endDay)
    } else {
      startDate = new Date(event.start)
      endDate = new Date(event.end)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if event is today
    const eventDateOnly = new Date(startDate)
    eventDateOnly.setHours(0, 0, 0, 0)
    const isToday = eventDateOnly.getTime() === today.getTime()

    // Check if event is tomorrow
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const isTomorrow = eventDateOnly.getTime() === tomorrow.getTime()

    if (event.allDay) {
      if (isToday) return 'Today - All Day'
      if (isTomorrow) return 'Tomorrow - All Day'
      return startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const timeStr = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    if (isToday) {
      return `Today at ${timeStr}`
    }
    if (isTomorrow) {
      return `Tomorrow at ${timeStr}`
    }

    return `${startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${timeStr}`
  }

  const generateCalendarDays = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days = []
    const daysToShow = viewMode === 'week' ? 7 : 30

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      const dayEvents = events.filter(event => {
        let eventStartDate, eventEndDate

        // For all-day events, parse the date string directly in local time
        // to avoid timezone conversion issues
        if (event.allDay) {
          const startStr = event.start // This is "YYYY-MM-DD" format
          const [startYear, startMonth, startDay] = startStr.split('-').map(Number)
          eventStartDate = new Date(startYear, startMonth - 1, startDay) // month is 0-indexed

          const endStr = event.end
          const [endYear, endMonth, endDay] = endStr.split('-').map(Number)
          eventEndDate = new Date(endYear, endMonth - 1, endDay)
          // Google Calendar's end date for all-day events is exclusive (the day after the event ends)
          // So subtract one day to get the actual last day of the event
          eventEndDate.setDate(eventEndDate.getDate() - 1)
        } else {
          eventStartDate = new Date(event.start)
          eventEndDate = new Date(event.end)
        }

        eventStartDate.setHours(0, 0, 0, 0)
        eventEndDate.setHours(0, 0, 0, 0)
        const dateTime = date.getTime()

        // Check if this day falls within the event's date range (inclusive)
        return dateTime >= eventStartDate.getTime() && dateTime <= eventEndDate.getTime()
      })

      days.push({
        date: date,
        dayNumber: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: date.toDateString() === today.toDateString(),
        events: dayEvents
      })
    }

    return days
  }

  const renderCalendarView = () => {
    const days = generateCalendarDays()

    return (
      <div ref={scrollContainerRef} className={viewMode === 'month' ? 'max-h-[320px] overflow-y-auto' : ''}>
        <div className={`grid gap-1 ${
          viewMode === 'week'
            ? 'grid-cols-7'
            : 'grid-cols-7'
        }`}>
          {days.map((day, index) => (
          <div
            key={index}
            className={`border rounded p-1 min-h-[60px] ${
              day.isToday
                ? 'bg-blue-500/20 border-blue-500'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="text-center mb-1">
              <div className="text-[0.6rem] text-gray-400">{day.dayName}</div>
              <div className={`text-sm font-bold ${day.isToday ? 'text-blue-400' : ''}`}>
                {day.dayNumber}
              </div>
              {index < 7 && <div className="text-[0.6rem] text-gray-500">{day.month}</div>}
            </div>

            <div className="space-y-0.5">
              {day.events.map(event => (
                <div
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event)
                    setShowModal(true)
                  }}
                  className={`${event.calendarColor} text-[0.6rem] p-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity`}
                  title={`${event.title} - ${event.calendarName}`}
                >
                  {!event.allDay && (
                    <div className="font-semibold text-[0.55rem] opacity-80">
                      {new Date(event.start).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  )}
                  <div className="font-medium truncate text-[0.6rem] leading-tight">{event.title}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    )
  }

  const renderListView = () => {
    return (
      <div ref={scrollContainerRef} className="space-y-1 h-full max-h-[320px] overflow-y-auto">
        {events.map(event => (
          <div
            key={event.id}
            className="bg-white/5 rounded p-2 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-1">
              <div className={`w-0.5 h-full ${event.calendarColor} rounded-full shrink-0`}></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xs leading-tight truncate">{event.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatEventTime(event)}
                </p>
                {event.location && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    {event.location}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-1">
                  <span className={`${event.calendarColor} text-[0.6rem] px-1 py-0.5 rounded-full`}>
                    {event.calendarName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Not authenticated - show sign in button
  if (!authenticated) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
        <h2 className="text-lg font-bold mb-2">Upcoming Events</h2>
        {error ? (
          <div className="text-center">
            <div className="text-red-400 mb-2 text-sm">{error}</div>
            <div className="text-sm text-gray-400">
              Make sure to set VITE_GOOGLE_CLIENT_ID in your .env file
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-400 mb-2 text-sm">Sign in to view your calendar events</p>
            <button
              onClick={handleSignIn}
              disabled={!authInitialized || loading}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {loading ? (
                'Loading...'
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
        <h2 className="text-lg font-bold mb-2">Upcoming Events</h2>
        <div className="text-center text-gray-400 text-sm">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20 relative">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Upcoming Events</h2>
        <div className="flex items-center gap-2">
          {/* Display Mode Toggle */}
          <div className="flex gap-0.5 bg-white/5 rounded p-0.5">
            <button
              onClick={() => setDisplayMode('list')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                displayMode === 'list'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setDisplayMode('calendar')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                displayMode === 'calendar'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Grid
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-0.5 bg-white/5 rounded p-0.5">
            <button
              onClick={() => setViewMode('week')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                viewMode === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                viewMode === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Month
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            title={`Refreshes used: ${refreshCount}/3 per minute`}
          >
            Refresh
          </button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded p-2 mb-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center text-gray-400 py-4 text-[1.5rem]">
          No events scheduled for the next {viewMode === 'week' ? 'week' : 'month'}
        </div>
      ) : (
        <>
          {displayMode === 'calendar' ? renderCalendarView() : renderListView()}

          {/* Scroll Buttons */}
          <ScrollButtons
            scrollContainerRef={scrollContainerRef}
            scrollAmount={100}
            className="absolute right-2 bottom-12"
          />
        </>
      )}

      {/* Event Detail Modal */}
      {showModal && selectedEvent && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2"
          onClick={() => {
            setShowModal(false)
            setSelectedEvent(null)
          }}
        >
          <div
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-white/20 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`${selectedEvent.calendarColor} p-3 rounded-t-xl relative`}>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedEvent(null)
                }}
                className="absolute top-2 right-2 text-white/80 hover:text-white text-xl font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/20 transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
              <h2 className="text-lg font-bold text-white pr-8 leading-tight">
                {selectedEvent.title}
              </h2>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3">
              {/* Time */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-1 flex items-center gap-1">
                  Time
                </h3>
                <p className="text-sm text-white">
                  {formatEventTime(selectedEvent)}
                </p>
                {!selectedEvent.allDay && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(selectedEvent.start).toLocaleString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                    {' '}-{' '}
                    {new Date(selectedEvent.end).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                )}
              </div>

              {/* Calendar Owner */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-1 flex items-center gap-1">
                  Calendar
                </h3>
                <div className="flex items-center gap-1">
                  <span className={`${selectedEvent.calendarColor} px-2 py-0.5 rounded-full text-xs`}>
                    {selectedEvent.calendarName}
                  </span>
                </div>
              </div>

              {/* Location */}
              {selectedEvent.location && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    Location
                  </h3>
                  <p className="text-sm text-white">{selectedEvent.location}</p>
                </div>
              )}

              {/* Description */}
              {selectedEvent.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    Description
                  </h3>
                  <div className="text-xs text-white whitespace-pre-wrap bg-white/5 p-2 rounded border border-white/10">
                    {selectedEvent.description}
                  </div>
                </div>
              )}

              {!selectedEvent.description && !selectedEvent.location && (
                <div className="text-center text-gray-400 text-xs py-2">
                  No additional details available
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedEvent(null)
                }}
                className="px-4 py-1 bg-white/10 hover:bg-white/20 rounded text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
