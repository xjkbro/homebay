import { useState, useEffect } from 'react'
import Clock from './Clock'

function ScreenSaver() {
  const [isDimmed, setIsDimmed] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  // Configurable timeout in milliseconds - read from localStorage or default to 5 minutes
  const DIM_TIMEOUT = (parseInt(localStorage.getItem('screenSaverTimeout') || '5')) * 60 * 1000

  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now())
      if (isDimmed) {
        setIsDimmed(false)
      }
    }

    // Activity events
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Check for inactivity
    const checkInactivity = setInterval(() => {
      const now = Date.now()
      const inactive = now - lastActivity > DIM_TIMEOUT

      if (inactive && !isDimmed) {
        console.log('Dimming screen due to inactivity')
        setIsDimmed(true)
      }
    }, 10000) // Check every 10 seconds

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      clearInterval(checkInactivity)
    }
  }, [lastActivity, isDimmed])

  if (!isDimmed) {
    return null
  }

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center transition-opacity duration-1000"
      onClick={() => setIsDimmed(false)}
    >
      <div className="text-center">
        <Clock />
        <p className="text-gray-300 text-[1.5rem] mt-8">Touch to wake</p>
      </div>
    </div>
  )
}

export default ScreenSaver
