import React, { useState } from "react";

const AIAdvisory = ({ isVisible, healthData }) => {
  const [customAnalysis, setCustomAnalysis] = useState({
    deviceTemp: "",
    ambientTemp: "",
    batteryLevel: "",
    usage: "",
  });
  const [customResult, setCustomResult] = useState(null);

  const handleCustomAnalysis = (e) => {
    e.preventDefault();

    const deviceTemp = parseFloat(customAnalysis.deviceTemp);
    const ambientTemp = parseFloat(customAnalysis.ambientTemp);
    const batteryLevel = parseInt(customAnalysis.batteryLevel);
    const usage = customAnalysis.usage;

    let riskLevel = "low";
    let recommendation = "";
    let actionItems = [];

    if (deviceTemp > 40) {
      riskLevel = "high";
      recommendation =
        "🚨 CRITICAL: This temperature level poses immediate risk!";
      actionItems = [
        "Stop all intensive tasks immediately",
        "Power down device if possible",
        "Move to cool, ventilated area",
      ];
    } else if (deviceTemp > 35) {
      riskLevel = "medium";
      recommendation = "⚠️ WARNING: Device is running hot and needs attention.";
      actionItems = [
        "Reduce intensive applications",
        "Improve ventilation",
        "Avoid charging while hot",
      ];
    } else {
      recommendation = "✅ Temperature levels are acceptable for normal use.";
      actionItems = ["Continue normal usage", "Monitor periodically"];
    }

    if (usage === "gaming" && deviceTemp > 30) {
      recommendation += " Heavy usage increases thermal stress.";
      actionItems.push("Consider reducing graphics settings");
    }

    setCustomResult({
      riskLevel,
      recommendation,
      actionItems,
      impact:
        riskLevel === "high"
          ? "High risk of permanent damage"
          : riskLevel === "medium"
          ? "Moderate impact on battery health"
          : "Minimal impact on battery health",
    });
  };

  if (!isVisible) return null;

  return (
    <div>
      <div className="advisory-header">
        <h1>AI-Powered Battery Advisory</h1>
        <p className="advisory-subtitle">
          Get personalized recommendations based on real-time data
        </p>
      </div>

      <div className="advisory-content">
        <div className="current-analysis card">
          <h3>Current System Analysis</h3>
          <div className="analysis-result">
            <div className={`risk-level ${healthData.alertLevel}`}>
              Risk Level: {healthData.alertLevel.toUpperCase()}
            </div>
            <div className="analysis-text">
              Current health score: {healthData.healthScore}%<br />
              System Status:{" "}
              {healthData.alertLevel === "danger"
                ? "Immediate attention required"
                : healthData.alertLevel === "warning"
                ? "Monitor closely"
                : "Operating normally"}
            </div>
            <div className="recommendations">
              <strong>Real-time Recommendations:</strong>
              <ul>
                {healthData.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="custom-analysis card">
          <h3>Custom Scenario Analysis</h3>
          <form onSubmit={handleCustomAnalysis}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Device Temperature (°C)</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.1"
                  min="20"
                  max="60"
                  value={customAnalysis.deviceTemp}
                  onChange={(e) =>
                    setCustomAnalysis((prev) => ({
                      ...prev,
                      deviceTemp: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Ambient Temperature (°C)</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.1"
                  min="5"
                  max="50"
                  value={customAnalysis.ambientTemp}
                  onChange={(e) =>
                    setCustomAnalysis((prev) => ({
                      ...prev,
                      ambientTemp: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Battery Level (%)</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="100"
                  value={customAnalysis.batteryLevel}
                  onChange={(e) =>
                    setCustomAnalysis((prev) => ({
                      ...prev,
                      batteryLevel: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Usage Scenario</label>
                <select
                  className="form-control"
                  value={customAnalysis.usage}
                  onChange={(e) =>
                    setCustomAnalysis((prev) => ({
                      ...prev,
                      usage: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select scenario...</option>
                  <option value="idle">Idle</option>
                  <option value="light">Light Usage</option>
                  <option value="moderate">Moderate Usage</option>
                  <option value="heavy">Heavy Usage</option>
                  <option value="gaming">Gaming/Intensive</option>
                  <option value="charging">Charging</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn--primary btn--full-width">
              🤖 Analyze Scenario
            </button>
          </form>

          {customResult && (
            <div className="custom-result">
              <div className="result-header">
                <h4>Analysis Result</h4>
                <div className={`risk-badge ${customResult.riskLevel}`}>
                  {customResult.riskLevel.toUpperCase()}
                </div>
              </div>
              <div className="result-content">
                <div className="recommendation">
                  {customResult.recommendation}
                </div>
                <div className="action-items">
                  <strong>Action Items:</strong>
                  <ul>
                    {customResult.actionItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="impact-forecast">{customResult.impact}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAdvisory;
