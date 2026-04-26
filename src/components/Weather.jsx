import React, { useState, useEffect } from 'react'

function Weather() {
    const zipCode = localStorage.getItem('homeZipCode') || import.meta.env.VITE_HOME_ZIP || ''

    const [weather, setWeather] = useState({
            temperature: '--',
            condition: 'Loading...',
            location: 'Loading...'
        });

        // Map weather codes to descriptions
        const getWeatherDescription = (code) => {
            const weatherCodes = {
                0: 'Clear Sky',
                1: 'Mainly Clear',
                2: 'Partly Cloudy',
                3: 'Overcast',
                45: 'Foggy',
                48: 'Foggy',
                51: 'Light Drizzle',
                53: 'Drizzle',
                55: 'Heavy Drizzle',
                61: 'Light Rain',
                63: 'Rain',
                65: 'Heavy Rain',
                71: 'Light Snow',
                73: 'Snow',
                75: 'Heavy Snow',
                77: 'Snow Grains',
                80: 'Light Showers',
                81: 'Showers',
                82: 'Heavy Showers',
                85: 'Light Snow Showers',
                86: 'Snow Showers',
                95: 'Thunderstorm',
                96: 'Thunderstorm with Hail',
                99: 'Thunderstorm with Hail'
            };
            return weatherCodes[code] || 'Unknown';
        };

        useEffect(() => {
            // Fetch location from zip code, then fetch weather
            const fetchWeather = async () => {
                try {
                    // First, get location data from zip code
                    const zipResponse = await fetch(`http://api.zippopotam.us/us/${zipCode}`);
                    const zipData = await zipResponse.json();

                    const cityName = zipData.places[0]['place name'];
                    const latitude = zipData.places[0].latitude;
                    const longitude = zipData.places[0].longitude;

                    // Then fetch weather using those coordinates
                    const weatherResponse = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
                    );
                    const weatherData = await weatherResponse.json();

                    setWeather({
                        temperature: Math.round(weatherData.current.temperature_2m),
                        condition: getWeatherDescription(weatherData.current.weather_code),
                        location: cityName
                    });
                } catch (error) {
                    console.error('Error fetching weather:', error);
                    setWeather({
                        temperature: '--',
                        condition: 'Error loading',
                        location: 'Unknown'
                    });
                }
            };

        fetchWeather();
        // Refresh weather every 60 minutes
        const weatherInterval = setInterval(fetchWeather, 3600000);

        return () => clearInterval(weatherInterval);
    }, []);
  return (
    <div className="text-right mt-2">
        <div className='text-sm'>{weather.location}</div>
        <div className='text-xl font-semibold'>{weather.temperature}°F</div>
        <div className='text-sm'>{weather.condition}</div>
    </div>
  )
}

export default Weather
