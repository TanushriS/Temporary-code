import React from "react";

const BatteryStatus = ({ batteryData, onRetry }) => {
  const getBatteryColor = (level) => {
    if (level < 20) return "var(--color-error)";
    if (level < 50) return "var(--color-warning)";
    return "var(--color-success)";
  };

  const formatTime = (seconds) => {
    if (seconds === Infinity || !seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="widget card battery-widget">
      <div className="widget-header">
        <h3>Battery Status</h3>
        <div className="widget-status">
          <span className="widget-icon">🔋</span>
          <span className="update-indicator"></span>
        </div>
      </div>

      {batteryData ? (
        <div className="battery-display">
          <div className="battery-visual">
            <div className="battery-shell">
              <div
                className="battery-level-fill"
                style={{
                  width: `${batteryData.level}%`,
                  background: getBatteryColor(batteryData.level),
                }}
              ></div>
              <div
                className={`charging-animation ${
                  batteryData.charging ? "active" : ""
                }`}
              ></div>
            </div>
            <div className="battery-cap"></div>
          </div>

          <div className="battery-info">
            <div className="battery-percentage">
              <span>{batteryData.level}</span>
              <span className="unit">%</span>
            </div>
            <div className="battery-details">
              <span>
                Status: {batteryData.charging ? "Charging" : "Discharging"}
              </span>
              <span>Charging: {formatTime(batteryData.chargingTime)}</span>
              <span>Remaining: {formatTime(batteryData.dischargingTime)}</span>
              <span>
                Source: {batteryData.simulated ? "Simulated" : "Battery API"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Initializing battery monitoring...</p>
          <button className="btn btn--sm btn--outline" onClick={onRetry}>
            Retry Connection
          </button>
        </div>
      )}
    </div>
  );
};

export default BatteryStatus;
