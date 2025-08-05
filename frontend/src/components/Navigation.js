import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Navigation = ({ apiStatus, onThemeToggle, onExport }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>🌡️ ThermoSense</h2>
          <span className="nav-subtitle">React Real-Time Monitoring</span>
        </div>
        <div className="nav-controls">
          <div className="api-status">
            <div className="api-indicator">
              <span className={`api-dot ${apiStatus.battery}`}></span>
              <span className="api-label">Battery</span>
            </div>
            <div className="api-indicator">
              <span className={`api-dot ${apiStatus.weather}`}></span>
              <span className="api-label">Weather</span>
            </div>
            <div className="api-indicator">
              <span className={`api-dot ${apiStatus.performance}`}></span>
              <span className="api-label">Performance</span>
            </div>
          </div>
          <div className="connection-status">
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <button className="btn btn--sm" onClick={onThemeToggle}>🌙</button>
          <button className="btn btn--sm" onClick={onExport}>📊 Export</button>
        </div>
      </div>
    </nav>
  );
};

Navigation.propTypes = {
  apiStatus: PropTypes.shape({
    battery: PropTypes.string,
    weather: PropTypes.string,
    performance: PropTypes.string
  }).isRequired,
  onThemeToggle: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired
};

export default Navigation;
