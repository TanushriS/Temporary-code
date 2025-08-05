import React, { useContext } from "react";
import ThermoSenseContext from "../context/ThermoSenseContext";

import BatteryStatus from "./BatteryStatus";
import WeatherWidget from "./WeatherWidget";
import DeviceInfo from "./DeviceInfo";
import HealthAnalysis from "./HealthAnalysis";


const Dashboard = () => {
  const {
    batteryData,
    weatherData,
    performanceData,
    deviceTemp,
    healthData,
    onRetryBattery,
    onRetryWeather,
  } = useContext(ThermoSenseContext);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Real-Time Battery Health Dashboard</h1>
        <div className="status-badges">
          <div
            className={`status status--${
              healthData.alertLevel === "safe"
                ? "success"
                : healthData.alertLevel === "warning"
                ? "warning"
                : "error"
            }`}
          >
            {healthData.alertLevel === "safe"
              ? "System Operational"
              : healthData.alertLevel === "warning"
              ? "Monitor Required"
              : "Immediate Action Required"}
          </div>
          <div className="last-updated">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <div className="data-source">Source: React Hooks & APIs</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <BatteryStatus batteryData={batteryData} onRetry={onRetryBattery} />

        <div className="widget card temperature-widget">
          <div className="widget-header">
            <h3>Temperature Status</h3>
            <div className="widget-status">
              <span className="widget-icon">🌡️</span>
              <span className="update-indicator"></span>
            </div>
          </div>
          <div className="temperature-display">
            <div className="temp-reading">
              <span className="temp-label">Estimated Device</span>
              <span className="temp-value">
                {deviceTemp?.toFixed(1) || "--"}
              </span>
              <span className="temp-unit">°C</span>
            </div>
            <div className="temp-reading">
              <span className="temp-label">Ambient Weather</span>
              <span className="temp-value">
                {weatherData?.temperature?.toFixed(1) || "--"}
              </span>
              <span className="temp-unit">°C</span>
            </div>
            <div className="temp-status">
              {deviceTemp > 40
                ? "Critical temperature"
                : deviceTemp > 35
                ? "Elevated temperature"
                : "Normal range"}
            </div>
          </div>
        </div>

        <WeatherWidget weatherData={weatherData} onRetry={onRetryWeather} />
        <DeviceInfo performanceData={performanceData} />
        <HealthAnalysis healthData={healthData} />

        <div className="widget card alerts-widget">
          <div className="widget-header">
            <h3>Active Alerts</h3>
            <span className="widget-icon">🚨</span>
          </div>
          <div className="alerts-list">
            {healthData.alertLevel === "danger" ? (
              <div className="alert-item critical">
                🚨 Critical temperature detected - immediate action required!
              </div>
            ) : healthData.alertLevel === "warning" ? (
              <div className="alert-item warning">
                ⚠️ Device temperature elevated - monitor closely
              </div>
            ) : (
              <div className="no-alerts">No active alerts</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
