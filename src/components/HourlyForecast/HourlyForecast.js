import React from 'react';
import './HourlyForecast.css';
import moment from 'moment';

const HourlyForecast = ({ forecastData }) => {
    if (!forecastData || forecastData.length === 0) {
        return null;
    }

    // Interpolate to get 1-hour intervals
    const getHourlyData = (data) => {
        const hourlyData = [];

        // We only take the first few items to generate enough hourly data (e.g., next 24h)
        // 3-hour API gives 8 items for 24 hours. We need 24 items.
        // Let's interpolate between each pair of 3-hour points.

        for (let i = 0; i < data.length - 1; i++) {
            const current = data[i];
            const next = data[i + 1];

            const currentTemp = current.main.temp;
            const nextTemp = next.main.temp;
            const tempDiff = (nextTemp - currentTemp) / 3;

            // Hour 0 (Current 3h point)
            hourlyData.push({
                dt: current.dt,
                temp: currentTemp,
                icon: current.weather[0].icon,
                description: current.weather[0].description,
                main: current.weather[0].main
            });

            // Hour +1
            hourlyData.push({
                dt: current.dt + 3600,
                temp: currentTemp + tempDiff,
                icon: current.weather[0].icon,
                description: current.weather[0].description,
                main: current.weather[0].main
            });

            // Hour +2
            hourlyData.push({
                dt: current.dt + 7200,
                temp: currentTemp + (tempDiff * 2),
                icon: current.weather[0].icon,
                description: current.weather[0].description,
                main: current.weather[0].main
            });
        }

        return hourlyData;
    };

    const hourlyForecast = getHourlyData(forecastData)
        .filter(item => item.dt >= moment().unix() - 3600) // Keep items from 1 hour ago onwards to be safe, or strictly current
        .slice(0, 24); // Show next 24 hours (approx)

    return (
        <div className="hourly-forecast-container">
            <div className="hourly-forecast-title">Hourly Forecast</div>
            <div className="hourly-forecast-list">
                {hourlyForecast.map((item, index) => (
                    <div key={index} className="hourly-forecast-item">
                        <span className="hourly-time">{moment(item.dt * 1000).format('h A')}</span>
                        <img
                            className="hourly-icon"
                            src={`http://openweathermap.org/img/w/${item.icon}.png`}
                            alt={item.description}
                        />
                        <span className="hourly-temp">{Math.round(item.temp)}°C</span>
                        <span className="hourly-desc">{item.main}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HourlyForecast;
