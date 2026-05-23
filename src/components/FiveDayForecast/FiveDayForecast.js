import React from 'react';
import moment from 'moment';
import './FiveDayForecast.css';

const FiveDayForecast = ({ forecastData, unit }) => {
  if (!forecastData || forecastData.length === 0) {
    return null;
  }

  // Aggregate 3-hourly data points into daily stats
  const getDailyForecasts = (list) => {
    const dailyMap = {};

    list.forEach(item => {
      const dateStr = moment(item.dt * 1000).format('YYYY-MM-DD');
      const dayName = moment(item.dt * 1000).format('dddd');
      
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {
          day: dayName,
          date: dateStr,
          tempMin: item.main.temp,
          tempMax: item.main.temp,
          weather: item.weather[0],
          temps: [item.main.temp]
        };
      } else {
        const current = dailyMap[dateStr];
        if (item.main.temp < current.tempMin) current.tempMin = item.main.temp;
        if (item.main.temp > current.tempMax) current.tempMax = item.main.temp;
        current.temps.push(item.main.temp);
        
        // Select mid-day weather (approx 12 PM - 3 PM) to represent the day
        const hour = moment(item.dt * 1000).hour();
        if (hour >= 11 && hour <= 15) {
          current.weather = item.weather[0];
        }
      }
    });

    return Object.values(dailyMap).slice(0, 5);
  };

  const dailyForecasts = getDailyForecasts(forecastData);

  // Find absolute min/max for the temperature bar ranges
  const allMinTemps = dailyForecasts.map(d => d.tempMin);
  const allMaxTemps = dailyForecasts.map(d => d.tempMax);
  const globalMin = Math.min(...allMinTemps);
  const globalMax = Math.max(...allMaxTemps);
  const globalRange = globalMax - globalMin || 1;

  const todayStr = moment().format('YYYY-MM-DD');

  return (
    <div className="fiveday-forecast-container glass-panel">
      <div className="fiveday-forecast-title">5-Day Outlook</div>
      <div className="fiveday-forecast-list">
        {dailyForecasts.map((day, index) => {
          const isToday = day.date === todayStr;
          const displayDay = isToday ? 'Today' : day.day;
          
          const tempMinRound = Math.round(day.tempMin);
          const tempMaxRound = Math.round(day.tempMax);
          
          // Calculate percentages for range bar fill
          const leftPercent = ((day.tempMin - globalMin) / globalRange) * 100;
          const fillWidthPercent = ((day.tempMax - day.tempMin) / globalRange) * 100;

          return (
            <div key={day.date} className="fiveday-item">
              {/* Day Label */}
              <span className={`fiveday-day ${isToday ? 'highlight' : ''}`}>{displayDay}</span>
              
              {/* Weather Icon & Description */}
              <div className="fiveday-condition">
                <img
                  className="fiveday-icon"
                  src={`https://openweathermap.org/img/wn/${day.weather.icon}@2x.png`}
                  alt={day.weather.description}
                />
                <span className="fiveday-desc-text">{day.weather.main}</span>
              </div>
              
              {/* Temperature range bar */}
              <div className="fiveday-temp-section">
                <span className="fiveday-temp min">{tempMinRound}°</span>
                
                <div className="range-bar-container">
                  <div 
                    className="range-bar-fill" 
                    style={{ 
                      left: `${leftPercent}%`, 
                      width: `${fillWidthPercent || 2}%` 
                    }}
                  ></div>
                </div>
                
                <span className="fiveday-temp max">{tempMaxRound}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FiveDayForecast;
