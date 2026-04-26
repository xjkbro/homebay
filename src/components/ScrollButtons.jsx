import React from 'react'

function ScrollButtons({ scrollContainerRef, scrollAmount = 150, className = '' }) {
  const scrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <button
        onClick={scrollUp}
        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-1.5 rounded-full transition-all shadow-lg"
        aria-label="Scroll Up"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button
        onClick={scrollDown}
        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-1.5 rounded-full transition-all shadow-lg"
        aria-label="Scroll Down"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )
}

export default ScrollButtons
