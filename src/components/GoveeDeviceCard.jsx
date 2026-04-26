import React, { useState, useEffect } from 'react';
import { getDeviceType, COLOR_PALETTE } from '../lib/goveeApi';

function GoveeDeviceCard({ device, deviceState, onToggle, onBrightnessChange, onColorChange, minimal = false }) {
  // Get power state from deviceState or use local state
  const [localIsOn, setLocalIsOn] = useState(false);

  const deviceInfo = getDeviceType(device);
  const supportsBrightness = device.supportCmds?.includes('brightness');
  const supportsColor = device.supportCmds?.includes('color');

  // Extract state from API response
  const isOnline = deviceState?.online ?? true;
  const powerState = deviceState?.properties?.find(prop => prop.powerState !== undefined);
  const isOn = powerState?.powerState === 'on' || localIsOn;

  useEffect(() => {
    if (powerState?.powerState) {
      setLocalIsOn(powerState.powerState === 'on');
    }
  }, [powerState]);

  const handleToggle = () => {
    const newState = !isOn;
    setLocalIsOn(newState);
    onToggle(device, newState);
  };

  // Minimal mode - large toggle button
  if (minimal) {
    return (
      <button
        onClick={handleToggle}
        disabled={!isOnline}
        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all min-h-20 ${
          !isOnline
            ? 'bg-gray-600/20 border-gray-600 opacity-50 cursor-not-allowed'
            : isOn
              ? 'bg-green-500/30 border-green-500 hover:bg-green-500/40 shadow-lg shadow-green-500/20'
              : 'bg-white/5 border-white/30 hover:bg-white/10 hover:border-white/40'
        }`}
      >
        <span className="text-3xl">{deviceInfo.icon}</span>
        <div className="text-center">
          <p className="font-bold text-sm leading-tight mb-0.5">{device.deviceName}</p>
          <p className={`text-xs ${isOn ? 'text-green-200' : 'text-gray-400'}`}>
            {!isOnline ? '🔴 Offline' : isOn ? 'ON' : 'OFF'}
          </p>
        </div>
      </button>
    );
  }

  // Full mode - complete card with all controls
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-3 border transition-all ${
      !isOnline
        ? 'border-red-500/50 opacity-75'
        : 'border-white/20'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold mb-0.5">{device.deviceName}</h3>
          <p className="text-xs text-gray-300">Model: {device.model}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="text-xs text-gray-400">
              {isOnline ? 'Online' : 'Offline'}
            </p>
            {isOnline && (
              <span className="text-xs text-gray-400">
                • {isOn ? 'On' : 'Off'}
              </span>
            )}
          </div>
        </div>
        <span className="text-xl">{deviceInfo.icon}</span>
      </div>

      <div className="space-y-2">
        {/* Toggle On/Off */}
        <div className="flex gap-1">
          <button
            onClick={() => onToggle(device, true)}
            disabled={!isOnline}
            className={`flex-1 px-2 py-1 rounded transition-colors text-xs ${
              isOn && isOnline
                ? 'bg-green-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-500 disabled:cursor-not-allowed'
            }`}
          >
            Turn On
          </button>
          <button
            onClick={() => onToggle(device, false)}
            disabled={!isOnline}
            className={`flex-1 px-2 py-1 rounded transition-colors text-xs ${
              !isOn && isOnline
                ? 'bg-red-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-500 disabled:cursor-not-allowed'
            }`}
          >
            Turn Off
          </button>
        </div>

        {/* Brightness Slider */}
        {supportsBrightness && (
          <div>
            <label className="block text-xs mb-0.5">Brightness</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              disabled={!isOnline}
              onChange={(e) => onBrightnessChange(device, parseInt(e.target.value))}
              className="w-full accent-blue-500 disabled:opacity-50"
            />
          </div>
        )}

        {/* Quick Color Buttons */}
        {supportsColor && (
          <div>
            <label className="block text-xs mb-1">Quick Colors</label>
            <div className="flex gap-1 flex-wrap">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color.name}
                  disabled={!isOnline}
                  onClick={() => onColorChange(device, color.r, color.g, color.b)}
                  className={`w-6 h-6 rounded-full ${color.class} hover:scale-110 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoveeDeviceCard;
