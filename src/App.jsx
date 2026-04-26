import { useState, useEffect } from "react";
import Clock from "./components/Clock";
import SchoolLunch from "./components/SchoolLunch";
import Weather from "./components/Weather";
import Calendar from "./components/Calendar";
import ScreenSaver from "./components/ScreenSaver";
import HomePage from "./pages/HomePage";
import GoveeController from "./pages/GoveeController";
import SettingsPage from "./pages/SettingsPage";

function App() {
    const [currentPage, setCurrentPage] = useState(0);
    const [count, setCount] = useState(0);

    // Load background from localStorage or use default
    const [backgroundImage, setBackgroundImage] = useState(() => {
        return localStorage.getItem('dashboardBackground') ||
               'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1920&q=80'
    });

    // Swipe gesture state
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const handleBackgroundChange = (newBg) => {
        setBackgroundImage(newBg);
    };

    // Define your pages here
    const pages = [
        // Page 1 - Your current dashboard
        <HomePage key="page1" />,

        // Page 2 - Govee smart home control
        <GoveeController key="page2" />,

        // Page 3 - Settings
        <SettingsPage
            key="page3"
            currentBackground={backgroundImage}
            onBackgroundChange={handleBackgroundChange}
        />,
    ];

    const nextPage = () => {
        setCurrentPage((prev) => (prev + 1) % pages.length);
    };

    const prevPage = () => {
        setCurrentPage((prev) => (prev - 1 + pages.length) % pages.length);
    };

    // Swipe gesture handlers (improved to detect horizontal vs vertical)
    const [touchStartY, setTouchStartY] = useState(null);
    const [touchEndY, setTouchEndY] = useState(null);

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchEndY(null);
        setTouchStart(e.targetTouches[0].clientX);
        setTouchStartY(e.targetTouches[0].clientY);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
        setTouchEndY(e.targetTouches[0].clientY);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd || !touchStartY || !touchEndY) return;

        const distanceX = touchStart - touchEnd;
        const distanceY = touchStartY - touchEndY;

        // Calculate if the gesture is more horizontal or vertical
        const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

        // Only trigger page change if it's primarily a horizontal swipe
        if (isHorizontalSwipe) {
            const isLeftSwipe = distanceX > minSwipeDistance;
            const isRightSwipe = distanceX < -minSwipeDistance;

            if (isLeftSwipe) {
                nextPage();
            } else if (isRightSwipe) {
                prevPage();
            }
        }
        // If it's a vertical swipe, do nothing (allow scrolling)
    };

    return (
        <>
            {/* Screen Saver */}
            <ScreenSaver />

            <div
                className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundAttachment: "fixed",
                }}
            >
            {/* Semi-transparent overlay for better text readability */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

            {/* Page Content with Slide Animation */}
            <div
                className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
                style={{
                    transform: `translateX(-${currentPage * 100}vw)`,
                }}
            >
                {pages.map((page, index) => (
                    <div key={index} className="flex-shrink-0 w-screen h-full">
                        {page}
                    </div>
                ))}
            </div>

            {/* Navigation Buttons - Medium size in middle */}
            <button
                onClick={prevPage}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2.5 rounded-full transition-all"
                aria-label="Previous Page"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={nextPage}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2.5 rounded-full transition-all"
                aria-label="Next Page"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Page Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {pages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                            currentPage === index
                                ? 'bg-white w-8'
                                : 'bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Go to page ${index + 1}`}
                    />
                ))}
            </div>
        </div>
        </>
    );
}

export default App;
