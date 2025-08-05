import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Settings = ({ isVisible }) => {
  const [settings, setSettings] = useState({
    batteryInterval: 5000,
    weatherInterval: 120000,
    chartInterval: 30000,
    tempWarning: 35,
    tempCritical: 40,
    batteryLow: 15,
    enableTempAlerts: true,
    enableBatteryAlerts: true,
    enableWeatherAlerts: true,
    enableSoundAlerts: false
  });

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isVisible) return null;

  return (
    <div>
      <div className="settings-header">
        <h1>Settings & Configuration</h1>
        <button className="btn btn--sm btn--outline">Reset to Defaults</button>
      </div>

      <div className="settings-grid">
        {/* Monitoring Settings */}
        <div className="settings-section card">
          <h3>Monitoring Settings</h3>
          <div className="form-group">
            <label className="form-label">Battery Update Interval</label>
            <select
              className="form-control"
              value={settings.batteryInterval}
              onChange={(e) =>
                handleSettingChange('batteryInterval', parseInt(e.target.value))
              }
            >
              <option value="5000">5 seconds</option>
              <option value="10000">10 seconds</option>
              <option value="15000">15 seconds</option>
              <option value="30000">30 seconds</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Weather Update Interval</label>
            <select
              className="form-control"
              value={settings.weatherInterval}
              onChange={(e) =>
                handleSettingChange('weatherInterval', parseInt(e.target.value))
              }
            >
              <option value="60000">1 minute</option>
              <option value="120000">2 minutes</option>
              <option value="300000">5 minutes</option>
              <option value="600000">10 minutes</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Chart Update Interval</label>
            <select
              className="form-control"
              value={settings.chartInterval}
              onChange={(e) =>
                handleSettingChange('chartInterval', parseInt(e.target.value))
              }
            >
              <option value="15000">15 seconds</option>
              <option value="30000">30 seconds</option>
              <option value="60000">1 minute</option>
            </select>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="settings-section card">
          <h3>Alert Thresholds</h3>
          <div className="form-group">
            <label className="form-label">Temperature Warning (°C)</label>
            <input
              type="number"
              className="form-control"
              value={settings.tempWarning}
              onChange={(e) =>
                handleSettingChange('tempWarning', parseFloat(e.target.value))
              }
              min="30"
              max="45"
              step="0.5"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Temperature Critical (°C)</label>
            <input
              type="number"
              className="form-control"
              value={settings.tempCritical}
              onChange={(e) =>
                handleSettingChange('tempCritical', parseFloat(e.target.value))
              }
              min="35"
              max="50"
              step="0.5"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Battery Low (%)</label>
            <input
              type="number"
              className="form-control"
              value={settings.batteryLow}
              onChange={(e) =>
                handleSettingChange('batteryLow', parseInt(e.target.value))
              }
              min="5"
              max="30"
            />
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="settings-section card">
          <h3>Notification Preferences</h3>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.enableTempAlerts}
                onChange={(e) =>
                  handleSettingChange('enableTempAlerts', e.target.checked)
                }
              />
              Temperature alerts
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.enableBatteryAlerts}
                onChange={(e) =>
                  handleSettingChange('enableBatteryAlerts', e.target.checked)
                }
              />
              Battery level alerts
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.enableWeatherAlerts}
                onChange={(e) =>
                  handleSettingChange('enableWeatherAlerts', e.target.checked)
                }
              />
              Weather-based alerts
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.enableSoundAlerts}
                onChange={(e) =>
                  handleSettingChange('enableSoundAlerts', e.target.checked)
                }
              />
              Sound notifications
            </label>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="settings-section card">
          <h3>Data & Privacy</h3>
          <div className="privacy-info">
            <p>✅ All data is processed locally on your device</p>
            <p>✅ Weather data from Open-Meteo (anonymous)</p>
            <p>✅ No personal data is transmitted or stored</p>
            <p>✅ Location used only for weather (not stored)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

Settings.propTypes = {
  isVisible: PropTypes.bool.isRequired
};

export default Settings;
