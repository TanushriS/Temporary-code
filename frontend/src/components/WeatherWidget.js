import React from 'react';
import PropTypes from 'prop-types';
import weatherUtils from '../utils/weatherUtils'; // Adjust path as needed

const WeatherWidget = ({ weatherData, onRetry }) => {
  return (
    <div className="widget card weather-widget">
      <div className="widget-header">
        <h3>Live Weather</h3>
        <div className="widget-status">
          <span className="widget-icon">
            {weatherData ? weatherUtils.getWeatherIcon(weatherData.weatherCode) : '🌤️'}
          </span>
          <span className="update-indicator" />
        </div>
      </div>

      {weatherData ? (
        <div className="weather-info">
          <div className="weather-main">
            <span className="weather-temp">
              {Math.round(weatherData.temperature)}°C
            </span>
            <div className="weather-details">
              <div className="weather-location">
                {weatherData.fallback ? 'Default Location' : 'Current Location'}
              </div>
              <div className="weather-condition">
                {weatherUtils.getWeatherDescription(weatherData.weatherCode)}
              </div>
            </div>
          </div>

          <div className="weather-metrics">
            <div className="metric">
              <span className="metric-label">Humidity</span>
              <span className="metric-value">{weatherData.humidity}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Wind</span>
              <span className="metric-value">
                {Math.round(weatherData.windSpeed)} km/h
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">UV Index</span>
              <span className="metric-value">{weatherData.uvIndex}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Loading weather data...</p>
          <button className="btn btn--sm btn--outline" onClick={onRetry}>
            Retry Connection
          </button>
        </div>
      )}
    </div>
  );
};

WeatherWidget.propTypes = {
  weatherData: PropTypes.shape({
    temperature: PropTypes.number,
    humidity: PropTypes.number,
    windSpeed: PropTypes.number,
    uvIndex: PropTypes.number,
    weatherCode: PropTypes.number,
    fallback: PropTypes.bool
  }),
  onRetry: PropTypes.func.isRequired
};

export default WeatherWidget;
