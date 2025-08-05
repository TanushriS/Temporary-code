import React from 'react';
import PropTypes from 'prop-types';

const LoadingScreen = ({ isVisible, progress, currentStep, steps }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">🌡️</div>
        <h2>ThermoSense</h2>
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="loading-text">{currentStep}</div>
        </div>
        <div className="loading-steps">
          {steps.map((step, index) => (
            <div key={index} className={`step ${step.status}`}>
              {step.status === 'completed'
                ? '✅'
                : step.status === 'error'
                ? '❌'
                : '⏳'}{' '}
              {step.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

LoadingScreen.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  progress: PropTypes.number.isRequired,
  currentStep: PropTypes.string.isRequired,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['pending', 'active', 'completed', 'error']).isRequired
    })
  ).isRequired
};

export default LoadingScreen;
