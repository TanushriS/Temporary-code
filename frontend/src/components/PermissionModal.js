import React from 'react';
import PropTypes from 'prop-types';

const PermissionModal = ({ isVisible, onAllow, onDeny }) => {
  if (!isVisible) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Enable Real-Time Monitoring</h3>
        </div>
        <div className="modal-body">
          <p>ThermoSense needs access to:</p>
          <ul>
            <li>📍 Your location for weather data</li>
            <li>🔋 Battery information (if supported)</li>
            <li>📊 System performance metrics</li>
          </ul>
          <p>All data stays on your device and is used only for monitoring.</p>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn--outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDeny();
            }}
          >
            Use Without
          </button>
          <button
            className="btn btn--primary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAllow();
            }}
          >
            Enable Monitoring
          </button>
        </div>
      </div>
    </div>
  );
};

PermissionModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onAllow: PropTypes.func.isRequired,
  onDeny: PropTypes.func.isRequired
};

export default PermissionModal;
