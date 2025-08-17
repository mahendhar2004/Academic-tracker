import React, { useState } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow } from 'lucide-react';

const WeatherWidget = () => {
    // FIX: Removed unused setWeather function
    const [weather] = useState({
        temp: 29,
        condition: 'Partly Cloudy',
        location: 'Jabalpur',
        icon: 'Cloud'
    });

    const getWeatherIcon = (condition) => {
        const lowerCondition = condition.toLowerCase();
        if (lowerCondition.includes('rain')) return <CloudRain className="w-10 h-10 text-blue-300" />;
        if (lowerCondition.includes('cloud')) return <Cloud className="w-10 h-10 text-slate-400" />;
        if (lowerCondition.includes('snow')) return <CloudSnow className="w-10 h-10 text-white" />;
        return <Sun className="w-10 h-10 text-yellow-300" />;
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-3xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
            {getWeatherIcon(weather.condition)}
            <div>
                <p className="text-2xl font-bold text-white">{weather.temp}°C</p>
                <p className="text-sm text-slate-300">{weather.condition}</p>
            </div>
            <p className="text-sm text-slate-400 ml-auto">{weather.location}</p>
        </div>
    );
};

export default WeatherWidget;