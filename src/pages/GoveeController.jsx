import React, { useState, useEffect, useRef } from "react";
import { GoveeAPI } from "../lib/goveeApi";
import GoveeDeviceCard from "../components/GoveeDeviceCard";
import ScrollButtons from "../components/ScrollButtons";

function GoveeController() {
    const [devices, setDevices] = useState([]);
    const [deviceStates, setDeviceStates] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem("goveeViewMode") || "minimal";
    });
    const [refreshCount, setRefreshCount] = useState(0);

    // Ref for scrollable container
    const scrollContainerRef = useRef(null);

    const apiKey = import.meta.env.VITE_GOVEE_API_KEY || "";
    const goveeApi = apiKey ? new GoveeAPI(apiKey) : null;

    // Rate limiting helpers
    const canRefresh = () => {
        const refreshData = JSON.parse(
            localStorage.getItem("goveeRefreshes") || "[]",
        );
        const oneMinuteAgo = Date.now() - 60 * 1000;
        const rateLimit = parseInt(
            localStorage.getItem("goveeRateLimit") || "3",
        );

        // Filter to only refreshes in the last minute
        const recentRefreshes = refreshData.filter(
            (timestamp) => timestamp > oneMinuteAgo,
        );

        // Update localStorage with only recent refreshes
        localStorage.setItem("goveeRefreshes", JSON.stringify(recentRefreshes));

        return recentRefreshes.length < rateLimit;
    };

    const recordRefresh = () => {
        const refreshData = JSON.parse(
            localStorage.getItem("goveeRefreshes") || "[]",
        );
        refreshData.push(Date.now());
        localStorage.setItem("goveeRefreshes", JSON.stringify(refreshData));

        // Update count for UI
        const oneMinuteAgo = Date.now() - 60 * 1000;
        const recentCount = refreshData.filter((t) => t > oneMinuteAgo).length;
        setRefreshCount(recentCount);
    };

    // Fetch device states for all devices
    const fetchDeviceStates = async (deviceList) => {
        const states = {};

        for (const device of deviceList) {
            try {
                const state = await goveeApi.getDeviceState(device);
                states[device.device] = state;
            } catch (err) {
                console.error(
                    `Failed to get state for ${device.deviceName}:`,
                    err,
                );
                states[device.device] = { online: false };
            }
        }

        setDeviceStates(states);
    };

    // Fetch list of devices
    const fetchDevices = async () => {
        if (!goveeApi) {
            setError(
                "Please add your Govee API key to .env file as VITE_GOVEE_API_KEY",
            );
            return;
        }

        // Check rate limit
        const rateLimit = parseInt(
            localStorage.getItem("goveeRateLimit") || "3",
        );
        if (!canRefresh()) {
            setError(
                `Refresh limit reached. You can refresh ${rateLimit} times per minute.`,
            );
            setTimeout(() => setError(null), 3000);
            return;
        }

        recordRefresh();
        setLoading(true);
        setError(null);

        try {
            const deviceList = await goveeApi.fetchDevices();
            setDevices(deviceList);

            // Fetch states for all devices
            await fetchDeviceStates(deviceList);
        } catch (err) {
            setError(`Failed to fetch devices: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Toggle device on/off
    const handleToggle = async (device, turnOn) => {
        try {
            await goveeApi.toggleDevice(device, turnOn);

            // Update the state immediately
            const newState = await goveeApi.getDeviceState(device);
            setDeviceStates((prev) => ({
                ...prev,
                [device.device]: newState,
            }));
        } catch (err) {
            setError(`Failed to toggle device: ${err.message}`);
        }
    };

    // Set brightness
    const handleBrightnessChange = async (device, brightness) => {
        try {
            await goveeApi.setBrightness(device, brightness);
        } catch (err) {
            setError(`Failed to set brightness: ${err.message}`);
        }
    };

    // Set color
    const handleColorChange = async (device, r, g, b) => {
        try {
            await goveeApi.setColor(device, r, g, b);
        } catch (err) {
            setError(`Failed to set color: ${err.message}`);
        }
    };

    useEffect(() => {
        if (goveeApi) {
            fetchDevices();
        }
        // Initialize refresh count display
        const refreshData = JSON.parse(
            localStorage.getItem("goveeRefreshes") || "[]",
        );
        const oneMinuteAgo = Date.now() - 60 * 1000;
        const recentCount = refreshData.filter((t) => t > oneMinuteAgo).length;
        setRefreshCount(recentCount);
    }, []);

    return (
        <div className="relative px-4 py-4 text-white h-screen overflow-hidden">
            <h1 className="text-2xl font-bold mb-4">Govee Controller</h1>

            {/* Setup Instructions */}
            {!apiKey && (
                <div className="bg-yellow-500/20 border border-yellow-500 rounded p-2 mb-3">
                    <p className="text-yellow-200 font-semibold mb-1 text-xs">
                        Setup Required:
                    </p>
                    <ol className="text-yellow-200 text-[0.6rem] space-y-0.5 list-decimal list-inside">
                        <li>
                            Get API Key: Govee Home App → Me → Settings → Apply
                            for API Key
                        </li>
                        <li>
                            Create a{" "}
                            <code className="bg-black/30 px-1 rounded">
                                .env
                            </code>{" "}
                            file in project root
                        </li>
                        <li>
                            Add:{" "}
                            <code className="bg-black/30 px-1 rounded">
                                VITE_GOVEE_API_KEY=your-api-key-here
                            </code>
                        </li>
                        <li>Restart the dev server</li>
                    </ol>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 rounded p-2 mb-3">
                    <p className="text-red-200 text-xs">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="text-xs text-red-300 hover:text-red-100 mt-1 underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Refresh Button */}
            <div className="flex gap-2 mb-3">
                <button
                    onClick={fetchDevices}
                    disabled={loading || !apiKey}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white text-base px-3 py-1 rounded transition-colors"
                    title={`Refreshes used: ${refreshCount}/3 per minute`}
                >
                    {loading ? "Loading..." : "Refresh Devices"}
                </button>
                <div className="flex items-center text-xs text-gray-400">
                    <span>Refreshes: {refreshCount}/3 per min</span>
                </div>

                {/* View Mode Toggle */}
                {/* <div className="flex gap-2 bg-white/10 p-1 rounded-lg">
            <button
                onClick={() => setViewMode('full')}
                className={`px-4 py-2 rounded transition-colors ${
                viewMode === 'full'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
            >
                Full View
            </button>
            <button
                onClick={() => setViewMode('minimal')}
                className={`px-4 py-2 rounded transition-colors ${
                viewMode === 'minimal'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
            >
                Minimal View
            </button>
            </div> */}
            </div>
            <div
                ref={scrollContainerRef}
                className="h-full mx-12 overflow-y-auto overflow-x-hidden"
            >
                {/* No Devices Message */}
                {devices.length === 0 && !loading && apiKey && (
                    <p className="text-gray-400 text-xs">
                        No devices found. Click "Refresh Devices" to load your
                        devices.
                    </p>
                )}

                {/* Device Grid */}
                <div
                    className={
                        viewMode === "minimal"
                            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
                            : "grid grid-cols-1 gap-2"
                    }
                >
                    {devices.map((device, index) => (
                        <GoveeDeviceCard
                            key={index}
                            device={device}
                            deviceState={deviceStates[device.device]}
                            onToggle={handleToggle}
                            onBrightnessChange={handleBrightnessChange}
                            onColorChange={handleColorChange}
                            minimal={viewMode === "minimal"}
                        />
                    ))}
                </div>
            </div>

            {/* Scroll Buttons */}
            <ScrollButtons
                scrollContainerRef={scrollContainerRef}
                scrollAmount={150}
                className="absolute right-6 bottom-6"
            />
        </div>
    );
}

export default GoveeController;
