import React from 'react';
import PropTypes from 'prop-types';

const HealthAnalysis = ({ healthData }) => {
  const getHealthColor = (score) => {
    if (score > 80) return 'var(--color-success)';
    if (score > 60) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (healthData.healthScore / 100 * circumference);

  return (
    <div className="widget card health-widget">
      <div className="widget-header">
        <h3>Battery Health Impact</h3>
        <span className="widget-icon">❤️</span>
      </div>
      <div className="health-analysis">
        <div className="health-score">
          <div className="health-circle">
            <svg className="health-circle-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="health-bg"></circle>
              <circle
                cx="50"
                cy="50"
                r="45"
                className="health-progress"
                style={{
                  stroke: getHealthColor(healthData.healthScore),
                  strokeDashoffset: offset
                }}
              ></circle>
            </svg>
            <div className="health-percentage">{healthData.healthScore}%</div>
          </div>
        </div>
        <div className="health-factors">
          <div className="factor">
            <span className="factor-label">Temperature</span>
            <span className="factor-impact">
              {healthData.alertLevel === 'danger' ? 'High' :
               healthData.alertLevel === 'warning' ? 'Medium' : 'Low'}
            </span>
          </div>
          <div className="factor">
            <span className="factor-label">Usage Pattern</span>
            <span className="factor-impact">Normal</span>
          </div>
          <div className="factor">
            <span className="factor-label">Environment</span>
            <span className="factor-impact">Good</span>
          </div>
        </div>
      </div>
    </div>
  );
};

HealthAnalysis.propTypes = {
  healthData: PropTypes.shape({
    healthScore: PropTypes.number.isRequired,
    alertLevel: PropTypes.oneOf(['safe', 'warning', 'danger']).isRequired
  }).isRequired
};

export default HealthAnalysis;
