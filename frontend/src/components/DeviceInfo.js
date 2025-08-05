import React from 'react';
import PropTypes from 'prop-types';

const DeviceInfo = ({ performanceData }) => {
  return (
    <div className="widget card performance-widget">
      <div className="widget-header">
        <h3>System Performance</h3>
        <div className="widget-status">
          <span className="widget-icon">📊</span>
          <span className="update-indicator"></span>
        </div>
      </div>
      <div className="performance-info">
        <div className="perf-metric">
          <span className="perf-label">Memory Usage</span>
          <div className="perf-bar">
            <div
              className="perf-fill"
              style={{
                width: `${performanceData.memory ? (performanceData.memory.used / performanceData.memory.total) * 100 : 0}%`
              }}
            ></div>
          </div>
          <span className="perf-value">
            {performanceData.memory ? `${performanceData.memory.used} MB` : '-- MB'}
          </span>
        </div>
        <div className="perf-metric">
          <span className="perf-label">CPU Load Est.</span>
          <div className="perf-bar">
            <div className="perf-fill" style={{ width: `${performanceData.cpuLoad || 0}%` }}></div>
          </div>
          <span className="perf-value">{performanceData.cpuLoad || 0}%</span>
        </div>
        <div className="perf-metric">
          <span className="perf-label">Network</span>
          <span className="perf-value">
            {performanceData.network?.effectiveType || 'Unknown'}
          </span>
        </div>
        <div className="perf-metric">
          <span className="perf-label">CPU Cores</span>
          <span className="perf-value">{performanceData.cores || 4}</span>
        </div>
      </div>
    </div>
  );
};

DeviceInfo.propTypes = {
  performanceData: PropTypes.shape({
    memory: PropTypes.shape({
      used: PropTypes.number,
      total: PropTypes.number
    }),
    cpuLoad: PropTypes.number,
    network: PropTypes.shape({
      effectiveType: PropTypes.string
    }),
    cores: PropTypes.number
  }).isRequired
};

export default DeviceInfo;
