import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Icon } from 'semantic-ui-react';
import DisplayData from './components/displayData/DisplayData';
import HourlyForecast from './components/HourlyForecast/HourlyForecast';
import FiveDayForecast from './components/FiveDayForecast/FiveDayForecast';
import WeatherEffects from './components/WeatherEffects/WeatherEffects';
import Typed from "react-typed";
import './App.css';
import Footer from './components/footer/Footer';

function App() {
  const [search, setSearch] = useState('');
  const [enterData, setEnterData] = useState('');
  
  // Weather states
  const [myData, setData] = useState({});
  const [myData1, setData1] = useState({});
  const [forecastData, setForecastData] = useState([]);
  const [system, setSystem] = useState({});
  const [wind, setWind] = useState([]);
  const [speed, setSpeed] = useState({});
  const [show, setShow] = useState(false);

  // App UX states
  const [unit, setUnit] = useState('metric'); // 'metric' or 'imperial'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [widgetMode, setWidgetMode] = useState(false); // Widget view active state

  const APIkey = process.env.REACT_APP_API_KEY;

  // Load favorites & check location permission on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    const savedFavs = localStorage.getItem('weather_favs');
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }

    const permission = localStorage.getItem('location_permission');
    
    if (permission === 'granted') {
      requestUserLocation();
    } else if (permission === 'denied') {
      const lastCity = localStorage.getItem('last_searched') || "Coimbatore";
      setEnterData(lastCity);
    } else {
      setShowLocationPrompt(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Request browser location and fetch weather
  const requestUserLocation = () => {
    setLoading(true);
    setShowLocationPrompt(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        localStorage.setItem('location_permission', 'granted');
        getWeatherByLoc(lat, lon, unit);
      },
      (err) => {
        console.error("Geolocation error:", err);
        localStorage.setItem('location_permission', 'denied');
        const lastCity = localStorage.getItem('last_searched') || "Coimbatore";
        setEnterData(lastCity);
      }
    );
  };

  // Decline location and load last searched city/default Coimbatore
  const handleDeclineLocation = () => {
    localStorage.setItem('location_permission', 'denied');
    setShowLocationPrompt(false);
    const lastCity = localStorage.getItem('last_searched') || "Coimbatore";
    setEnterData(lastCity);
  };

  // Sync favorites to local storage
  const toggleFavorite = (cityName) => {
    if (!cityName) return;
    const cleanName = cityName.trim();
    let updated;
    if (favorites.includes(cleanName)) {
      updated = favorites.filter(c => c !== cleanName);
    } else {
      updated = [...favorites, cleanName];
    }
    setFavorites(updated);
    localStorage.setItem('weather_favs', JSON.stringify(updated));
  };

  // Fetch weather by geographic coordinates
  const getWeatherByLoc = (lat, lon, currentUnit) => {
    setLoading(true);
    setError('');
    axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${APIkey}&units=${currentUnit}`)
      .then((res) => {
        setData(res.data.main);
        setData1(res.data);
        setSystem(res.data.sys);
        setWind(res.data.weather);
        setSpeed(res.data.wind);
        setShow(true);
        setLoading(false);
        localStorage.setItem('last_searched', res.data.name);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not get weather for your location. Loading Coimbatore instead.");
        setLoading(false);
        setEnterData("Coimbatore");
      });

    axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&APPID=${APIkey}&units=${currentUnit}`)
      .then((res) => {
        setForecastData(res.data.list);
      })
      .catch((err) => {
        console.error("Forecast Error:", err);
      });
  };

  // Fetch weather and forecast when enterData or unit changes
  useEffect(() => {
    if (!enterData) return;

    setLoading(true);
    setError('');
    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${enterData}&APPID=${APIkey}&units=${unit}`)
      .then((res) => {
        setData(res.data.main);
        setData1(res.data);
        setSystem(res.data.sys);
        setWind(res.data.weather);
        setSpeed(res.data.wind);
        setShow(true);
        setLoading(false);
        localStorage.setItem('last_searched', res.data.name);
      })
      .catch((err) => {
        console.error(err);
        setError(`City "${enterData}" not found or failed to load. Please verify spelling.`);
        setLoading(false);
      });

    axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${enterData}&APPID=${APIkey}&units=${unit}`)
      .then((res) => {
        setForecastData(res.data.list);
      })
      .catch((err) => {
        console.error("Forecast Error:", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterData, unit, APIkey]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleData = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setEnterData(search.trim());
      setSearch("");
    }
  };

  const getBackgroundClass = () => {
    if (!show || !wind || wind.length === 0) return 'normal';
    const mainWeather = wind[0].main;

    switch (mainWeather) {
      case 'Rain':
      case 'Drizzle':
        return 'weather-rain';
      case 'Clouds':
        return 'weather-clouds';
      case 'Clear':
        return 'weather-clear';
      case 'Snow':
        return 'weather-snow';
      case 'Thunderstorm':
        return 'weather-thunder';
      case 'Mist':
      case 'Smoke':
      case 'Haze':
      case 'Dust':
      case 'Fog':
      case 'Sand':
      case 'Ash':
      case 'Squall':
      case 'Tornado':
        return 'weather-mist';
      default:
        const tempVal = unit === 'metric' ? myData.temp : (myData.temp - 32) * 5/9;
        if (tempVal > 30) return 'sunrise';
        if (tempVal < 10) return 'cold';
        return 'normal';
    }
  };

  return (
    <div className={`${getBackgroundClass()} ${widgetMode ? 'widget-mode-active' : ''}`}>
      {/* Background weather conditions animations overlay */}
      {show && wind && wind[0] && (
        <WeatherEffects condition={wind[0].main} />
      )}

      {/* Exit Widget Mode floating button overlay */}
      {widgetMode && (
        <button 
          className="exit-widget-btn glass-panel" 
          onClick={() => setWidgetMode(false)}
          title="Exit Widget Mode"
        >
          <Icon name="expand" /> <span>Dashboard</span>
        </button>
      )}

      {/* Location Permission Prompt Modal */}
      {showLocationPrompt && !show ? (
        <div className="location-prompt-modal glass-panel">
          <Icon name="map marker alternate" size="huge" style={{ color: 'var(--accent-color)', marginBottom: '15px' }} />
          <h2>Enable Local Weather</h2>
          <p>Allow location access to instantly detect your current city and view real-time weather forecasts.</p>
          <div className="prompt-actions">
            <button className="prompt-btn allow" onClick={requestUserLocation}>
              <Icon name="checkmark" /> Allow Access
            </button>
            <button className="prompt-btn decline" onClick={handleDeclineLocation}>
              <Icon name="search" /> Search Manually
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Search Layout (Hidden in Widget Mode) */}
          {!widgetMode && (
            <div className="search_form">
              <form onSubmit={handleData}>
                <div className="search_input_wrapper">
                  <input 
                    placeholder="Enter city..." 
                    type="text" 
                    value={search} 
                    onChange={handleSearch} 
                  />
                  <button type="submit" className="search_button" aria-label="Search">
                    <Icon name="search" size="large" style={{ margin: 0 }} />
                  </button>
                </div>
                <div className="search_type">
                  <h3>Search for
                    <Typed
                      strings={[
                        " Coimbatore",
                        " Mumbai",
                        " Dubai",
                        " London",
                        " Singapore",
                        " Malaysia"
                      ]}
                      typeSpeed={150}
                      backSpeed={50}
                      backDelay={1000}
                      loop
                    />
                  </h3>
                </div>
              </form>
            </div>
          )}

          {/* Favorite quick chips (Hidden in Widget Mode) */}
          {!widgetMode && (
            <div className="quick-chips">
              {favorites.map((city) => (
                <button key={city} className="chip favorite" onClick={() => setEnterData(city)}>
                  <Icon name="star" /> {city}
                </button>
              ))}
              {favorites.length === 0 && ["Coimbatore", "London", "Dubai", "New York"].map((city) => (
                <button key={city} className="chip" onClick={() => setEnterData(city)}>
                  {city}
                </button>
              ))}
            </div>
          )}

          {/* Error notification */}
          {error && !widgetMode && <div className="error-banner">{error}</div>}

          {/* Main Content Layout */}
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              maxWidth: '800px',
              width: '90%',
              margin: '20px auto'
            }}>
              <div className="skeleton" style={{ width: '100%', height: '350px', borderRadius: '20px' }}></div>
              <div className="skeleton" style={{ width: '100%', height: '180px', borderRadius: '20px' }}></div>
            </div>
          ) : show ? (
            <div style={{
              maxWidth: '1000px',
              width: '95%',
              margin: widgetMode ? '0 auto' : '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              transition: 'all 0.5s ease-in-out'
            }}>
              <DisplayData 
                windStatus={wind} 
                windSpeed={speed} 
                sysCountry={system} 
                myWeatherLoc={myData1} 
                myWeather={myData} 
                unit={unit}
                setUnit={setUnit}
                isFavorite={favorites.includes(myData1.name)}
                toggleFavorite={toggleFavorite}
                widgetMode={widgetMode}
                setWidgetMode={setWidgetMode}
              />
              {!widgetMode && (
                <>
                  <HourlyForecast forecastData={forecastData} unit={unit} />
                  <FiveDayForecast forecastData={forecastData} unit={unit} />
                </>
              )}
            </div>
          ) : null}
        </>
      )}

      {!widgetMode && (
        <>
          <div className="divider"></div>
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
