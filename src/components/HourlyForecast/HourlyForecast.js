import React from 'react';
import './HourlyForecast.css';
import moment from 'moment';

const HourlyForecast = ({ forecastData, unit }) => {
  if (!forecastData || forecastData.length === 0) {
    return null;
  }

  // Interpolate to get 1-hour intervals for smooth detail
  const getHourlyData = (data) => {
    const hourlyData = [];
    for (let i = 0; i < data.length - 1; i++) {
      const current = data[i];
      const next = data[i + 1];

      const currentTemp = current.main.temp;
      const nextTemp = next.main.temp;
      const tempDiff = (nextTemp - currentTemp) / 3;

      // Hour 0
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
    .filter(item => item.dt >= moment().unix() - 3600) // Keep items from 1 hour ago onwards
    .slice(0, 16); // Show next 16 hours for a cleaner scroll layout

  if (hourlyForecast.length === 0) return null;

  // Math for custom inline SVG Temperature Trend Chart
  const minTemp = Math.min(...hourlyForecast.map(item => item.temp));
  const maxTemp = Math.max(...hourlyForecast.map(item => item.temp));
  const tempRange = maxTemp - minTemp || 1;

  // Chart layout config (must match CSS widths/gaps)
  const colWidth = 90;
  const gapWidth = 20;
  const chartHeight = 70;
  
  // X = index * (colWidth + gapWidth) + colWidth / 2
  const points = hourlyForecast.map((item, index) => {
    const x = index * (colWidth + gapWidth) + (colWidth / 2);
    // Scale temp to leave padding at top/bottom of chart
    const y = chartHeight - 15 - ((item.temp - minTemp) / tempRange) * (chartHeight - 30);
    return { x, y, temp: Math.round(item.temp) };
  });

  // Construct SVG paths
  let linePath = "";
  let areaPath = "";
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Draw smooth curves (Symmetric Cubic Bezier)
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    
    // Close the area path for the gradient fill
    areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;
  }

  const svgWidth = hourlyForecast.length * colWidth + (hourlyForecast.length - 1) * gapWidth;

  return (
    <div className="hourly-forecast-container glass-panel">
      <div className="hourly-forecast-title">Hourly Forecast</div>
      
      <div className="hourly-scroll-wrapper">
        <div className="hourly-forecast-list" style={{ width: `${svgWidth}px` }}>
          
          {/* SVG Trend Graph overlay */}
          <svg className="hourly-trend-svg" width={svgWidth} height={chartHeight}>
            <defs>
              <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
              <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.5"/>
              </filter>
            </defs>
            
            {/* Area Fill */}
            <path d={areaPath} fill="url(#tempAreaGrad)" />
            
            {/* Line Stroke */}
            <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="3" filter="url(#glow)" />
            
            {/* Dots and Labels */}
            {points.map((pt, idx) => (
              <g key={idx}>
                {/* Visual node */}
                <circle cx={pt.x} cy={pt.y} r="4.5" fill="#ffffff" stroke="#0ea5e9" strokeWidth="2.5" />
                {/* Temp Label above node */}
                <text 
                  x={pt.x} 
                  y={pt.y - 10} 
                  textAnchor="middle" 
                  fill="#ffffff" 
                  fontSize="0.85rem" 
                  fontWeight="bold"
                >
                  {pt.temp}°
                </text>
              </g>
            ))}
          </svg>

          {/* Forecast Columns */}
          {hourlyForecast.map((item, index) => (
            <div key={index} className="hourly-forecast-item">
              <span className="hourly-time">{moment(item.dt * 1000).format('h A')}</span>
              <div className="hourly-icon-container">
                <img
                  className="hourly-icon"
                  src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                  alt={item.description}
                />
              </div>
              
              {/* Spacer so text/SVG do not collide */}
              <div className="chart-spacer"></div>

              <span className="hourly-desc">{item.main}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;
