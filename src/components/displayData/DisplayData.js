import React from 'react'
import moment from 'moment';
import './display.css';

function DisplayData({myWeather, myWeatherLoc, sysCountry, windStatus, windSpeed}) {

    const unixEpochTimeMS = myWeatherLoc.dt * 1000;
    const d = new Date(unixEpochTimeMS);

    const unixTime = sysCountry.sunrise * 1000;
    const sunRise = new Date(unixTime)

    const unixTime1 = sysCountry.sunset * 1000;
    const sunSet = new Date(unixTime1)

    return (
        <div>
            <div className="weather_main">
                <div className="waether_data">
                    <h2>{myWeatherLoc.name}, {sysCountry.country}</h2>
                </div>
                <div className="waether_data">
                    <h1>{Math.floor(myWeather.temp)} ° C  | {windStatus.map((data) => data.description)}</h1>
                    <p>{moment(d).format('ll')}</p>
                </div>
                <div className="weather_other">
                    <div className="weather_temp">
                        <div className="weather_change">
                            <p>High</p>
                            <p>{myWeather.temp_max} ° C</p>
                        </div>
                        <div className="weather_change">
                            <p>Low</p>
                            <p>{myWeather.temp_min} ° C</p>
                        </div>
                    </div>
                    <div className="weather_rain">
                        <div className="weather_change">
                                <p>Humidity {myWeather.humidity}%</p>
                        </div>
                    </div>
                    <div className="weather_temp">
                        <div className="weather_change">
                            <p>Sunrise</p>
                            <p>{moment(sunRise).format('LT')}</p>
                        </div>
                        <div className="weather_change">
                            <p>Sunset</p>
                            <p>{moment(sunSet).format('LT')}</p>
                        </div>
                    </div>
                    <div className="weather_rain">
                        <div className="weather_change">
                                <p>Wind Speed</p>
                                <p>{windSpeed.speed} mph</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DisplayData
