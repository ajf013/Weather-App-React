import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
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
  
  // Unified location query state: { q: "CityName" } or { lat: 12.3, lon: 45.6 }
  const [queryLoc, setQueryLoc] = useState(null);

  // Weather states
  const [myData, setData] = useState({});
  const [myData1, setData1] = useState({});
  const [forecastData, setForecastData] = useState([]);
  const [system, setSystem] = useState({});
  const [wind, setWind] = useState([]);
  const [speed, setSpeed] = useState({});
  const [show, setShow] = useState(false);
  const [aqiData, setAqiData] = useState(null);

  // App UX states
  const [unit, setUnit] = useState('metric'); // 'metric' or 'imperial'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [widgetMode, setWidgetMode] = useState(false);

  const APIkey = process.env.REACT_APP_API_KEY || 'e7f0828f690448abc30adb5d712c9658';

  // Helper to add search to recent history
  const addRecentSearch = (cityName) => {
    if (!cityName) return;
    const cleanName = cityName.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== cleanName.toLowerCase());
      const updated = [cleanName, ...filtered].slice(0, 5);
      localStorage.setItem('weather_recents', JSON.stringify(updated));
      return updated;
    });
  };

  // Request browser location and set coordinate query
  const requestUserLocation = useCallback(() => {
    setLoading(true);
    setShowLocationPrompt(false);

    if (!navigator.geolocation) {
      const lastCity = localStorage.getItem('last_searched') || "Coimbatore";
      setQueryLoc({ q: lastCity });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        localStorage.setItem('location_permission', 'granted');
        localStorage.setItem('last_lat', lat);
        localStorage.setItem('last_lon', lon);
        setQueryLoc({ lat, lon });
      },
      (err) => {
        console.warn("Geolocation fallback triggered:", err.message);
        // Only mark denied if user explicitly blocked browser prompt
        if (err.code === 1) {
          localStorage.setItem('location_permission', 'denied');
        }
        
        // Fallback to cached lat/lon if present, else last searched city
        const cachedLat = localStorage.getItem('last_lat');
        const cachedLon = localStorage.getItem('last_lon');
        if (cachedLat && cachedLon) {
          setQueryLoc({ lat: parseFloat(cachedLat), lon: parseFloat(cachedLon) });
        } else {
          const lastCity = localStorage.getItem('last_searched') || "Coimbatore";
          setQueryLoc({ q: lastCity });
        }
      },
      {
        maximumAge: 300000, // 5 min cached location
        timeout: 10000,
        enableHighAccuracy: false
      }
    );
  }, []);

  // Decline location and load last searched city/default Coimbatore
  const handleDeclineLocation = () => {
    localStorage.setItem('location_permission', 'denied');
    setShowLocationPrompt(false);
    const lastCity = localStorage.getItem('last_searched') || "Coimbatore";
    setQueryLoc({ q: lastCity });
  };

  // Reset location permission preference manually
  const handleResetLocationPermission = () => {
    localStorage.removeItem('location_permission');
    localStorage.removeItem('last_lat');
    localStorage.removeItem('last_lon');
    setShowLocationPrompt(true);
    setShow(false);
  };

  // Sync / Re-detect location on demand
  const handleSyncLocation = () => {
    requestUserLocation();
  };

  // Check location permission & load saved preferences on mount
  useEffect(() => {
    window.scrollTo(0, 0);

    const savedFavs = localStorage.getItem('weather_favs');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }

    const savedRecents = localStorage.getItem('weather_recents');
    if (savedRecents) {
      try { setRecentSearches(JSON.parse(savedRecents)); } catch (e) {}
    }

    const storedPerm = localStorage.getItem('location_permission');
    const cachedLat = localStorage.getItem('last_lat');
    const cachedLon = localStorage.getItem('last_lon');

    // Use native Browser Permissions API if available for modern permission check
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((result) => {
          if (result.state === 'granted') {
            localStorage.setItem('location_permission', 'granted');
            if (cachedLat && cachedLon) {
              setQueryLoc({ lat: parseFloat(cachedLat), lon: parseFloat(cachedLon) });
            } else {
              requestUserLocation();
            }
          } else if (result.state === 'denied') {
            localStorage.setItem('location_permission', 'denied');
            const lastCity = localStorage.getItem('last_searched') || "Coimbatore";
            setQueryLoc({ q: lastCity });
          } else {
            // Permission state is 'prompt'
            if (storedPerm === 'granted') {
              requestUserLocation();
            } else if (storedPerm === 'denied') {
              const lastCity = localStorage.getItem('last_searched') || "Coimbatore";
              setQueryLoc({ q: lastCity });
            } else {
              setShowLocationPrompt(true);
            }
          }
        })
        .catch(() => {
          // Fallback logic
          if (storedPerm === 'granted') {
            requestUserLocation();
          } else if (storedPerm === 'denied') {
            const lastCity = localStorage.getItem('last_searched') || "Coimbatore";
            setQueryLoc({ q: lastCity });
          } else {
            setShowLocationPrompt(true);
          }
        });
    } else {
      if (storedPerm === 'granted') {
        requestUserLocation();
      } else if (storedPerm === 'denied') {
        const lastCity = localStorage.getItem('last_searched') || "Coimbatore";
        setQueryLoc({ q: lastCity });
      } else {
        setShowLocationPrompt(true);
      }
    }
  }, [requestUserLocation]);

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

  // Fetch weather, forecast, and AQI when queryLoc or unit changes
  useEffect(() => {
    if (!queryLoc) return;

    setLoading(true);
    setError('');

    const params = {
      APPID: APIkey,
      units: unit,
      ...queryLoc
    };

    axios.get('https://api.openweathermap.org/data/2.5/weather', { params })
      .then((res) => {
        setData(res.data.main);
        setData1(res.data);
        setSystem(res.data.sys);
        setWind(res.data.weather);
        setSpeed(res.data.wind);
        setShow(true);
        setLoading(false);
        
        // Persist city name as last searched
        if (res.data.name) {
          localStorage.setItem('last_searched', res.data.name);
          addRecentSearch(res.data.name);
        }

        // Fetch Air Quality Index (AQI) using coordinates
        if (res.data.coord) {
          const { lat, lon } = res.data.coord;
          axios.get('https://api.openweathermap.org/data/2.5/air_pollution', {
            params: { lat, lon, APPID: APIkey }
          })
          .then((aqiRes) => {
            if (aqiRes.data && aqiRes.data.list && aqiRes.data.list[0]) {
              setAqiData(aqiRes.data.list[0]);
            }
          })
          .catch((err) => console.error("AQI load error:", err));
        }
      })
      .catch((err) => {
        console.error("Weather load error:", err);
        if (queryLoc.q) {
          setError(`City "${queryLoc.q}" not found or failed to load. Please verify spelling.`);
        } else {
          setError("Could not get weather for your location. Loading Coimbatore instead.");
          setQueryLoc({ q: "Coimbatore" });
        }
        setLoading(false);
      });

    axios.get('https://api.openweathermap.org/data/2.5/forecast', { params })
      .then((res) => {
        setForecastData(res.data.list);
      })
      .catch((err) => {
        console.error("Forecast Error:", err);
      });
  }, [queryLoc, unit, APIkey]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleData = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setQueryLoc({ q: search.trim() });
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

  // Evaluate extreme weather warning
  const getWeatherAlert = () => {
    if (!show || !wind || !wind[0]) return null;
    const cond = wind[0].main.toLowerCase();
    const tempVal = unit === 'metric' ? myData.temp : (myData.temp - 32) * 5/9;

    if (cond.includes('thunderstorm')) {
      return { type: 'danger', message: 'Thunderstorm Advisory: Seek shelter and keep clear of electrical appliances.' };
    }
    if (cond.includes('tornado') || cond.includes('squall')) {
      return { type: 'danger', message: 'Severe Weather Warning: Stay indoors away from windows.' };
    }
    if (tempVal > 38) {
      return { type: 'warning', message: 'Extreme Heat Alert: Stay hydrated and limit direct sun exposure.' };
    }
    if (tempVal < -5) {
      return { type: 'warning', message: 'Freezing Temperature Alert: Wear layered warm clothing outdoors.' };
    }
    return null;
  };

  const weatherAlert = getWeatherAlert();

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

          {/* Quick chips (Favorites & Recent Searches) */}
          {!widgetMode && (
            <div className="quick-chips">
              {favorites.map((city) => (
                <button key={`fav-${city}`} className="chip favorite" onClick={() => setQueryLoc({ q: city })}>
                  <Icon name="star" /> {city}
                </button>
              ))}
              {recentSearches
                .filter(city => !favorites.includes(city))
                .map((city) => (
                  <button key={`rec-${city}`} className="chip recent" onClick={() => setQueryLoc({ q: city })}>
                    <Icon name="history" /> {city}
                  </button>
                ))}
              {favorites.length === 0 && recentSearches.length === 0 && ["Coimbatore", "London", "Dubai", "New York"].map((city) => (
                <button key={`def-${city}`} className="chip" onClick={() => setQueryLoc({ q: city })}>
                  {city}
                </button>
              ))}
            </div>
          )}

          {/* Extreme weather alert banner */}
          {weatherAlert && !widgetMode && (
            <div className={`weather-alert-banner ${weatherAlert.type}`} style={{
              maxWidth: '1000px',
              width: '95%',
              margin: '0 auto 15px auto',
              padding: '12px 20px',
              borderRadius: '12px',
              background: weatherAlert.type === 'danger' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
              border: `1px solid ${weatherAlert.type === 'danger' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.5)'}`,
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600
            }}>
              <Icon name={weatherAlert.type === 'danger' ? 'warning sign' : 'info circle'} size="large" />
              <span>{weatherAlert.message}</span>
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
              margin: '0 auto',
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
                aqiData={aqiData}
                unit={unit}
                setUnit={setUnit}
                isFavorite={favorites.includes(myData1.name)}
                toggleFavorite={toggleFavorite}
                widgetMode={widgetMode}
                setWidgetMode={setWidgetMode}
                onSyncLocation={handleSyncLocation}
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
          <Footer onResetLocationPermission={handleResetLocationPermission} />
        </>
      )}
    </div>
  );
}

export default App;
