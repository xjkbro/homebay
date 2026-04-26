import React, { useState, useEffect, useRef } from 'react'
import ScrollButtons from '../components/ScrollButtons'

// Curated background images
const BACKGROUND_OPTIONS = [
  {
    id: 'mountains-sunset',
    name: 'Mountain Sunset',
    url: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=400&q=80',
    category: 'Mountains'
  },
  {
    id: 'space-nebula',
    name: 'Space Nebula',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
    category: 'Space'
  },
  {
    id: 'ocean-sunset',
    name: 'Ocean Sunset',
    url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&q=80',
    category: 'Ocean'
  },
  {
    id: 'gradient-abstract',
    name: 'Abstract Gradient',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80',
    category: 'Abstract'
  },
  {
    id: 'forest-path',
    name: 'Forest Path',
    url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&q=80',
    category: 'Nature'
  },
  {
    id: 'night-stars',
    name: 'Starry Night',
    url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80',
    category: 'Space'
  },
  {
    id: 'desert-dunes',
    name: 'Desert Dunes',
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80',
    category: 'Nature'
  },
  {
    id: 'city-night',
    name: 'City Lights',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&q=80',
    category: 'Urban'
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80',
    category: 'Nature'
  },
  {
    id: 'tropical-beach',
    name: 'Tropical Beach',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    category: 'Ocean'
  },
  {
    id: 'galaxy',
    name: 'Deep Space',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80',
    category: 'Space'
  },
  {
    id: 'mountain-lake',
    name: 'Mountain Lake',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
    category: 'Mountains'
  }
]

function SettingsPage({ currentBackground, onBackgroundChange }) {
  const [customUrl, setCustomUrl] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Ref for scrollable container
  const scrollContainerRef = useRef(null)

  // Location Settings
  const [zipCode, setZipCode] = useState(() => {
    return localStorage.getItem('homeZipCode') || import.meta.env.VITE_HOME_ZIP || ''
  })
  const [schoolId, setSchoolId] = useState(() => {
    return localStorage.getItem('schoolId') || import.meta.env.VITE_MEALVIEWER_SCHOOL_ID || ''
  })

  // Rate Limit Settings
  const [calendarRateLimit, setCalendarRateLimit] = useState(() => {
    return parseInt(localStorage.getItem('calendarRateLimit') || '3')
  })
  const [goveeRateLimit, setGoveeRateLimit] = useState(() => {
    return parseInt(localStorage.getItem('goveeRateLimit') || '3')
  })

  // Auto-refresh Settings
  const [autoRefreshCalendar, setAutoRefreshCalendar] = useState(() => {
    return localStorage.getItem('autoRefreshCalendar') !== 'false'
  })
  const [autoRefreshSchoolLunch, setAutoRefreshSchoolLunch] = useState(() => {
    return localStorage.getItem('autoRefreshSchoolLunch') !== 'false'
  })

  // Screen Saver Settings
  const [screenSaverTimeout, setScreenSaverTimeout] = useState(() => {
    return parseInt(localStorage.getItem('screenSaverTimeout') || '5')
  })

  // Govee View Mode
  const [goveeViewMode, setGoveeViewMode] = useState(() => {
    return localStorage.getItem('goveeViewMode') || 'minimal'
  })

  const [saveMessage, setSaveMessage] = useState('')

  const categories = ['All', ...new Set(BACKGROUND_OPTIONS.map(bg => bg.category))]

  const filteredBackgrounds = selectedCategory === 'All'
    ? BACKGROUND_OPTIONS
    : BACKGROUND_OPTIONS.filter(bg => bg.category === selectedCategory)

  const handleBackgroundSelect = (url) => {
    localStorage.setItem('dashboardBackground', url)
    onBackgroundChange(url)
  }

  const handleCustomUrl = () => {
    if (customUrl.trim()) {
      localStorage.setItem('dashboardBackground', customUrl.trim())
      onBackgroundChange(customUrl.trim())
      setCustomUrl('')
    }
  }

  const handleSaveSettings = () => {
    // Save all settings to localStorage
    localStorage.setItem('homeZipCode', zipCode)
    localStorage.setItem('schoolId', schoolId)
    localStorage.setItem('calendarRateLimit', calendarRateLimit.toString())
    localStorage.setItem('goveeRateLimit', goveeRateLimit.toString())
    localStorage.setItem('autoRefreshCalendar', autoRefreshCalendar.toString())
    localStorage.setItem('autoRefreshSchoolLunch', autoRefreshSchoolLunch.toString())
    localStorage.setItem('screenSaverTimeout', screenSaverTimeout.toString())
    localStorage.setItem('goveeViewMode', goveeViewMode)

    // Show save confirmation
    setSaveMessage('✓ Settings saved! Reload the page to apply changes.')
    setTimeout(() => setSaveMessage(''), 5000)
  }

  const currentBg = localStorage.getItem('dashboardBackground') || currentBackground

  return (
    <div className="relative z-10 h-screen w-full px-4 py-4 text-white overflow-hidden">
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div ref={scrollContainerRef} className="h-full overflow-y-auto overflow-x-hidden px-12 pb-10">

      {/* Background Selector */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-3">Background Image</h2>

        {/* Category Filter */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Background Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {filteredBackgrounds.map(bg => (
            <div
              key={bg.id}
              onClick={() => handleBackgroundSelect(bg.url)}
              className={`relative aspect-video rounded overflow-hidden cursor-pointer transition-all hover:scale-105 ${
                currentBg === bg.url
                  ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-gray-900'
                  : 'ring-1 ring-white/20 hover:ring-white/40'
              }`}
            >
              <img
                src={bg.thumbnail}
                alt={bg.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
                <div>
                  <p className="text-white font-semibold text-[0.6rem]">{bg.name}</p>
                  <p className="text-gray-300 text-[0.5rem]">{bg.category}</p>
                </div>
              </div>
              {currentBg === bg.url && (
                <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Custom URL Input */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
          <h3 className="text-base font-bold mb-2">Custom Background URL</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCustomUrl}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded font-semibold text-xs transition-colors"
            >
              Apply
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Enter a direct image URL (works best with high-resolution images)
          </p>
        </div>
      </section>

      {/* Location Settings */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-3">Location & School</h2>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 space-y-3">
          {/* Zip Code */}
          <div>
            <label className="block text-sm font-semibold mb-1">Home Zip Code</label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="(e.g. 90745)"
              className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-400 text-xs mt-1">Used for weather location</p>
          </div>

          {/* School ID */}
          <div>
            <label className="block text-sm font-semibold mb-1">School ID (MealViewer)</label>
            <input
              type="text"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              placeholder="School ID"
              className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-400 text-xs mt-1">Your school's MealViewer ID for lunch menu</p>
          </div>
        </div>
      </section>

      {/* Rate Limit Settings */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-3">Rate Limits</h2>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 space-y-3">
          <p className="text-gray-400 text-xs mb-2">
            Control how many times you can refresh per minute to avoid API rate limits
          </p>

          {/* Calendar Rate Limit */}
          <div>
            <label className="block text-sm font-semibold mb-1">Calendar Refresh Limit (per minute)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                value={calendarRateLimit}
                onChange={(e) => setCalendarRateLimit(parseInt(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="text-base font-bold text-blue-400 w-8 text-center">{calendarRateLimit}</span>
            </div>
          </div>

          {/* Govee Rate Limit */}
          <div>
            <label className="block text-sm font-semibold mb-1">Govee Refresh Limit (per minute)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                value={goveeRateLimit}
                onChange={(e) => setGoveeRateLimit(parseInt(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="text-base font-bold text-blue-400 w-8 text-center">{goveeRateLimit}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Auto-Refresh Settings */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-3">Auto-Refresh</h2>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 space-y-3">
          <p className="text-gray-400 text-xs mb-2">
            Enable automatic midnight refresh for calendar and school lunch
          </p>

          {/* Calendar Auto-Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold">Calendar Auto-Refresh</label>
              <p className="text-gray-400 text-xs mt-0.5">Refresh events at midnight</p>
            </div>
            <button
              onClick={() => setAutoRefreshCalendar(!autoRefreshCalendar)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoRefreshCalendar ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  autoRefreshCalendar ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* School Lunch Auto-Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold">School Lunch Auto-Refresh</label>
              <p className="text-gray-400 text-xs mt-0.5">Refresh menu at midnight</p>
            </div>
            <button
              onClick={() => setAutoRefreshSchoolLunch(!autoRefreshSchoolLunch)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoRefreshSchoolLunch ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  autoRefreshSchoolLunch ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Screen Saver Settings */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-3">Screen Saver</h2>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
          <label className="block text-sm font-semibold mb-1">Inactivity Timeout (minutes)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="30"
              value={screenSaverTimeout}
              onChange={(e) => setScreenSaverTimeout(parseInt(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span className="text-base font-bold text-blue-400 w-10 text-center">{screenSaverTimeout}</span>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Screen will dim after {screenSaverTimeout} minute{screenSaverTimeout !== 1 ? 's' : ''} of inactivity
          </p>
        </div>
      </section>

      {/* Govee View Mode Settings */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-3">Govee Controller</h2>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
          <p className="text-gray-400 text-xs mb-2">
            Choose how to display Govee smart home devices
          </p>
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold">View Mode</label>
              <p className="text-gray-400 text-xs mt-0.5">
                {goveeViewMode === 'minimal' ? 'Minimal: Simple toggle buttons' : 'Full: Detailed controls'}
              </p>
            </div>
            <div className="flex gap-1 bg-white/5 rounded p-0.5">
              <button
                onClick={() => setGoveeViewMode('minimal')}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                  goveeViewMode === 'minimal'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Minimal
              </button>
              <button
                onClick={() => setGoveeViewMode('full')}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                  goveeViewMode === 'full'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Full
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="mb-6">
        <button
          onClick={handleSaveSettings}
          className="w-full py-2 bg-green-500 hover:bg-green-600 rounded-lg font-bold text-base text-white transition-colors shadow-lg"
        >
          Save All Settings
        </button>
        {saveMessage && (
          <div className="mt-2 p-2 bg-green-500/20 border border-green-500 rounded text-green-200 text-xs text-center">
            {saveMessage}
          </div>
        )}
      </div>

      {/* App Info */}
      <section>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
          <h3 className="text-base font-bold mb-2">About</h3>
          <div className="space-y-1 text-xs text-gray-300">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Features:</strong> Calendar, Weather, School Lunch, Smart Home</p>
            <p><strong>Built with:</strong> React 19, Vite, Tailwind CSS</p>
          </div>
        </div>
      </section>
      </div>

      {/* Scroll Buttons */}
      <ScrollButtons
        scrollContainerRef={scrollContainerRef}
        scrollAmount={150}
        className="absolute right-6 bottom-6"
      />
    </div>
  )
}

export default SettingsPage
