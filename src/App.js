import axios from 'axios'
import React, { useEffect, useState } from 'react';
import { Icon } from 'semantic-ui-react';
import DisplayData from './components/displayData/DisplayData';
import HourlyForecast from './components/HourlyForecast/HourlyForecast';
import Typed from "react-typed";
import './App.css';
import Footer from './components/footer/Footer';

function App() {
  const [search, setSearch] = useState('');
  const [enterData, setEnterData] = useState('');
  const [myData, setData] = useState([]);
  const [myData1, setData1] = useState([]);
  const [forecastData, setForecastData] = useState([]); // State for forecast data
  const [system, setSystem] = useState([]);
  const [wind, setWind] = useState([]);
  const [speed, setSpeed] = useState([]);
  const [show, setShow] = useState(false);
  const APIkey = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    window.scrollTo(0, 0);
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeatherByLoc(lat, lon);
    });
  }, []);

  const getWeatherByLoc = (lat, lon) => {
    axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${APIkey}&units=metric`)
      .then((res) => {
        setData(res.data.main);
        setData1(res.data);
        setSystem(res.data.sys)
        setWind(res.data.weather)
        setSpeed(res.data.wind)
        setShow(true);
      })
      .catch((err) => {
        console.log(err);
      })

    // Fetch Forecast Data
    axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&APPID=${APIkey}&units=metric`)
      .then((res) => {
        setForecastData(res.data.list);
      })
      .catch((err) => {
        console.log("Forecast Error:", err);
      });
  }

  useEffect(() => {
    if (enterData) {
      axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${enterData}&APPID=${APIkey}&units=metric`)
        .then((res) => {
          setData(res.data.main);
          setData1(res.data);
          setSystem(res.data.sys)
          setWind(res.data.weather)
          setSpeed(res.data.wind)
          setShow(true);
        })

      // Fetch Forecast Data by City
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${enterData}&APPID=${APIkey}&units=metric`)
        .then((res) => {
          setForecastData(res.data.list);
        })
        .catch((err) => {
          console.log("Forecast Error:", err);
        });
    }
  }, [enterData, APIkey])

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const handleData = (e) => {
    e.preventDefault();
    setEnterData(search);
    setSearch("");
    setShow(true);

  }

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
        // Fallback to temperature based if no specific weather match, or just default to normal/clear
        if (myData.temp > 35) return 'sunrise';
        if (myData.temp < 10) return 'cold';
        return 'normal';
    }
  };

  return (
    <div className={getBackgroundClass()} >
      <div className="search_form">
        <form>

          <input placeholder="Enter city" type="text" value={search} onChange={handleSearch} />
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
                backDelay={1}

                loop
              />
            </h3>
          </div>
          <button style={{ display: "none" }} onClick={handleData}>
            <Icon type="button" style={{ margin: "" }} name="search" size="large" />
          </button>
        </form>
      </div>
      {show ? (
        <>
          <DisplayData windStatus={wind} windSpeed={speed} sysCountry={system} myWeatherLoc={myData1} myWeather={myData} />
          <HourlyForecast forecastData={forecastData} />
        </>
      ) : ''}
      <div className="divider"></div>
      <Footer />
    </div>
  )
}

export default App
