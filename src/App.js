import axios from 'axios'
import React, { useEffect, useState } from 'react';
import {Icon} from 'semantic-ui-react';
import DisplayData from './components/displayData/DisplayData';
import Typed from "react-typed";
import './App.css';
import Footer from './components/footer/Footer';

function App() {
  const [search, setSearch] = useState('');
  const [enterData, setEnterData] = useState('');
  const [myData, setData] = useState([]);
  const [myData1, setData1] = useState([]);
  const [system, setSystem] = useState([]);
  const [wind, setWind] = useState([]);
  const [speed, setSpeed] = useState([]);
  const [show, setShow] = useState(false);
  const APIkey = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${enterData}&APPID=${APIkey}&units=metric`)
    .then((res) => {
        setData(res.data.main);
        setData1(res.data);
        setSystem(res.data.sys)
        setWind(res.data.weather)
        setSpeed(res.data.wind)
    })
    
  }, [enterData])

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const handleData = (e) => {
    e.preventDefault();
    setEnterData(search);
    setSearch("");
    setShow(true);
    
  }

  return (
    <div className={
      myData.temp > 35 && myData.temp < 45 ? 'sunrise' :
      myData.temp > 25 && myData.temp < 35 ? 'sunlight':
      myData.temp < 25 ? 'cold' : 'normal'
    } >
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
          <button style={{display:"none"}} onClick={handleData}>
            <Icon type="button" style={{margin:""}} name="search" size="large" />
          </button>
        </form>
      </div>
      {show ? <DisplayData windStatus={wind} windSpeed={speed} sysCountry={system} myWeatherLoc={myData1} myWeather={myData} /> : ''}
      <div className="divider"></div>
      <Footer />
    </div>
  )
}

export default App
