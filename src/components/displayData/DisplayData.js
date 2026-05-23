import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Icon } from 'semantic-ui-react';
import './display.css';

function DisplayData({ 
  myWeather, 
  myWeatherLoc, 
  sysCountry, 
  windStatus, 
  windSpeed, 
  unit, 
  setUnit, 
  isFavorite, 
  toggleFavorite,
  widgetMode,
  setWidgetMode
}) {
  const [localTime, setLocalTime] = useState('');
  const timezoneOffset = myWeatherLoc.timezone || 0;

  // Ticking local clock for the searched city
  useEffect(() => {
    const updateTime = () => {
      const utc = moment.utc();
      const cityLocal = utc.add(timezoneOffset, 'seconds');
      setLocalTime(cityLocal.format('h:mm:ss A'));
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, [timezoneOffset]);

  const sunRise = moment.utc(sysCountry.sunrise * 1000).add(timezoneOffset, 'seconds');
  const sunSet = moment.utc(sysCountry.sunset * 1000).add(timezoneOffset, 'seconds');
  const tempVal = Math.round(myWeather.temp || 0);
  const tempMax = Math.round(myWeather.temp_max || 0);
  const tempMin = Math.round(myWeather.temp_min || 0);
  const feelsLikeVal = Math.round(myWeather.feels_like || 0);

  // Speed unit representation
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';

  return (
    <div className={`weather-dashboard ${widgetMode ? 'widget-view' : ''}`}>
      {/* Hero Weather Section */}
      <div className={`weather-hero-card glass-panel ${widgetMode ? 'widget-card' : ''}`}>
        <div className="hero-header">
          <div className="location-info">
            <h2>
              {myWeatherLoc.name}, {sysCountry.country}
              {!widgetMode && (
                <button 
                  className={`favorite-btn ${isFavorite ? 'active' : ''}`} 
                  onClick={() => toggleFavorite(myWeatherLoc.name)}
                  title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <Icon name={isFavorite ? "star" : "star outline"} />
                </button>
              )}
            </h2>
            <p className="local-date">{moment().format('dddd, MMMM D, YYYY')}</p>
            <p className="local-time-label">
              <Icon name="clock outline" /> Local Time: <span className="ticking-time">{localTime}</span>
            </p>
          </div>

          {/* Unit & Widget Controls */}
          <div className="header-controls">
            {!widgetMode && (
              <button 
                className="widget-toggle-btn" 
                onClick={() => setWidgetMode(true)}
                title="Enter Widget Mode"
              >
                <Icon name="window minimize" style={{ margin: 0 }} /> <span>Widget</span>
              </button>
            )}

            <div className="unit-toggle-container">
              <button 
                className={`unit-btn ${unit === 'metric' ? 'active' : ''}`} 
                onClick={() => setUnit('metric')}
              >
                °C
              </button>
              <button 
                className={`unit-btn ${unit === 'imperial' ? 'active' : ''}`} 
                onClick={() => setUnit('imperial')}
              >
                °F
              </button>
            </div>
          </div>
        </div>

        <div className="hero-body">
          <div className="temperature-section">
            <h1 className="hero-temp">{tempVal}°</h1>
            <div className="weather-condition-meta">
              <span className="condition-text">
                {windStatus && windStatus[0] ? windStatus[0].description : 'N/A'}
              </span>
              <div className="temp-range-pills">
                <span className="pill max"><Icon name="arrow up" /> H: {tempMax}°</span>
                <span className="pill min"><Icon name="arrow down" /> L: {tempMin}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Metrics Dashboard (Hidden in Widget Mode) */}
      {!widgetMode && (
        <div className="bento-grid">
          {/* Feels Like */}
          <div className="bento-card glass-panel">
            <div className="bento-card-header">
              <Icon name="thermometer" />
              <span>Feels Like</span>
            </div>
            <div className="bento-card-body">
              <span className="metric-large-value">{feelsLikeVal}°</span>
              <span className="metric-subtext">
                {feelsLikeVal > tempVal ? 'Humidex influence' : 'Wind chill effect'}
              </span>
            </div>
          </div>

          {/* Wind Speed & Compass Direction */}
          <div className="bento-card glass-panel">
            <div className="bento-card-header">
              <Icon name="wind" />
              <span>Wind Status</span>
            </div>
            <div className="bento-card-body wind-body">
              <div className="wind-text-block">
                <span className="metric-large-value">{windSpeed.speed}</span>
                <span className="metric-unit"> {speedUnit}</span>
              </div>
              <div className="wind-compass-section">
                <div 
                  className="compass-arrow" 
                  style={{ transform: `rotate(${windSpeed.deg || 0}deg)` }}
                  title={`Wind direction: ${windSpeed.deg || 0}°`}
                >
                  <Icon name="long arrow alternate up" size="large" />
                </div>
                <span className="compass-degree">{windSpeed.deg || 0}°</span>
              </div>
            </div>
          </div>

          {/* Humidity */}
          <div className="bento-card glass-panel">
            <div className="bento-card-header">
              <Icon name="tint" />
              <span>Humidity</span>
            </div>
            <div className="bento-card-body">
              <span className="metric-large-value">{myWeather.humidity}%</span>
              <div className="humidity-progress-bar">
                <div className="fill" style={{ width: `${myWeather.humidity}%` }}></div>
              </div>
              <span className="metric-subtext">
                The dew point is comfort-rated.
              </span>
            </div>
          </div>

          {/* Visibility */}
          <div className="bento-card glass-panel">
            <div className="bento-card-header">
              <Icon name="eye" />
              <span>Visibility</span>
            </div>
            <div className="bento-card-body">
              <span className="metric-large-value">
                {myWeatherLoc.visibility ? (myWeatherLoc.visibility / 1000).toFixed(1) : '10'}
              </span>
              <span className="metric-unit"> km</span>
              <span className="metric-subtext">
                {(myWeatherLoc.visibility || 10000) >= 9000 ? 'Perfectly clear view' : 'Light mist in the air'}
              </span>
            </div>
          </div>

          {/* Barometric Pressure */}
          <div className="bento-card glass-panel">
            <div className="bento-card-header">
              <Icon name="compress" />
              <span>Pressure</span>
            </div>
            <div className="bento-card-body">
              <span className="metric-large-value">{myWeather.pressure}</span>
              <span className="metric-unit"> hPa</span>
              <span className="metric-subtext">
                {myWeather.pressure >= 1013 ? 'High pressure system' : 'Low pressure system'}
              </span>
            </div>
          </div>

          {/* Sunrise / Sunset */}
          <div className="bento-card glass-panel sunrise-sunset-card">
            <div className="bento-card-header">
              <Icon name="sun" />
              <span>Sunrise & Sunset</span>
            </div>
            <div className="bento-card-body sun-times-body">
              <div className="sun-time-item">
                <Icon name="arrow circle up" className="sunrise-icon" />
                <div>
                  <span className="sun-label">Sunrise</span>
                  <span className="sun-val">{moment(sunRise).format('LT')}</span>
                </div>
              </div>
              <div className="sun-time-item">
                <Icon name="arrow circle down" className="sunset-icon" />
                <div>
                  <span className="sun-label">Sunset</span>
                  <span className="sun-val">{moment(sunSet).format('LT')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisplayData;
