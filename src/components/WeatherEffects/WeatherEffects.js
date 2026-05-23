import React from 'react';
import './WeatherEffects.css';

const WeatherEffects = ({ condition }) => {
  if (!condition) return null;

  const getEffectMarkup = () => {
    const normCondition = condition.toLowerCase();

    // Thunderstorm
    if (normCondition.includes('thunderstorm')) {
      return (
        <div className="effect-container thunderstorm">
          {/* Lightning flashes */}
          <div className="lightning-flash"></div>
          {/* Rain overlay */}
          {Array.from({ length: 30 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const duration = 0.5 + Math.random() * 0.5;
            return (
              <div 
                key={i} 
                className="raindrop" 
                style={{ 
                  left: `${left}%`, 
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`
                }} 
              />
            );
          })}
        </div>
      );
    }

    // Rain / Drizzle / Squall
    if (normCondition.includes('rain') || normCondition.includes('drizzle') || normCondition.includes('squall')) {
      return (
        <div className="effect-container rain">
          {Array.from({ length: 40 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const duration = 0.6 + Math.random() * 0.6;
            return (
              <div 
                key={i} 
                className="raindrop" 
                style={{ 
                  left: `${left}%`, 
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`
                }} 
              />
            );
          })}
        </div>
      );
    }

    // Snow
    if (normCondition.includes('snow')) {
      return (
        <div className="effect-container snow">
          {Array.from({ length: 30 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = 3 + Math.random() * 4;
            const size = 3 + Math.random() * 6; // 3px to 9px snowflakes
            const opacity = 0.3 + Math.random() * 0.6;
            return (
              <div 
                key={i} 
                className="snowflake" 
                style={{ 
                  left: `${left}%`, 
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity: opacity
                }} 
              />
            );
          })}
        </div>
      );
    }

    // Clouds / Fog / Mist / Haze / Smoke / Dust
    if (
      normCondition.includes('clouds') || 
      normCondition.includes('mist') || 
      normCondition.includes('fog') || 
      normCondition.includes('haze') ||
      normCondition.includes('smoke') ||
      normCondition.includes('dust')
    ) {
      return (
        <div className="effect-container clouds">
          {Array.from({ length: 5 }).map((_, i) => {
            const top = 10 + i * 15; // vertical spread
            const duration = 60 + Math.random() * 40; // 60s to 100s drift
            const delay = -(Math.random() * 50); // negative delay to start clouds midway
            const scale = 0.7 + Math.random() * 0.8;
            const opacity = 0.12 + Math.random() * 0.15;
            return (
              <div 
                key={i} 
                className="cloud-particle" 
                style={{ 
                  top: `${top}%`, 
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  transform: `scale(${scale})`,
                  opacity: opacity
                }} 
              />
            );
          })}
        </div>
      );
    }

    // Clear / Sunrise
    if (normCondition.includes('clear') || normCondition.includes('sunny')) {
      return (
        <div className="effect-container clear-sky">
          <div className="sun-halo"></div>
        </div>
      );
    }

    // Fallback default (clean container)
    return null;
  };

  return <div className="weather-effects-wrapper">{getEffectMarkup()}</div>;
};

export default WeatherEffects;
