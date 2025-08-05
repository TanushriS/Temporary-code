import React, { useState, useEffect, useContext } from "react";
import ThermoSenseContext from "../context/ThermoSenseContext";

const AIAdvisory = ({ isVisible, healthData }) => {
  const { deviceTemp, batteryData } = useContext(ThermoSenseContext);
  
  const [customAnalysis, setCustomAnalysis] = useState({
    deviceTemp: "",
    ambientTemp: "",
    batteryLevel: "",
    usage: "",
  });

  const [customResult, setCustomResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [advisoryHistory, setAdvisoryHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      fetchAdvisoryHistory();
    }
  }, [isVisible]);

  const fetchAdvisoryHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch("/api/advice/history?limit=20");
      if (response.ok) {
        const data = await response.json();
        setAdvisoryHistory(data.history || []);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchAdvice = async ({ battery_temp, ambient_temp, device_state, battery_level, cpu_temp }) => {
    const response = await fetch("/api/advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        battery_temp, 
        ambient_temp, 
        device_state,
        battery_level: battery_level || 75,
        cpu_temp: cpu_temp || deviceTemp
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch advice from backend");
    }

    return await response.json();
  };

  const handleCustomAnalysis = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCustomResult(null);

    try {
      const { deviceTemp, ambientTemp, usage, batteryLevel } = customAnalysis;

      const data = await fetchAdvice({
        battery_temp: parseFloat(deviceTemp),
        ambient_temp: parseFloat(ambientTemp),
        device_state: usage,
        battery_level: parseInt(batteryLevel),
        cpu_temp: parseFloat(deviceTemp) + 5 // Estimate CPU temp slightly higher
      });

      setCustomResult({
        riskLevel: data.alert_level || "unknown",
        recommendation: data.natural_language_tip || "⚠️ No specific advice provided.",
        actionItems: data.optional_action
          ? Array.isArray(data.optional_action)
            ? data.optional_action
            : [data.optional_action]
          : ["No immediate action recommended"],
        impact: `Predicted health impact: ${
          typeof data.predicted_health_impact === "number"
            ? (data.predicted_health_impact * 100).toFixed(1) + "%"
            : "N/A"
        }`,
      });

      // Refresh history after new analysis
      fetchAdvisoryHistory();
    } catch (error) {
      console.error("Custom analysis error:", error);
      setCustomResult({
        riskLevel: "error",
        recommendation: "⚠️ Unable to generate advice at the moment. Please check your connection.",
        actionItems: ["Please try again later"],
        impact: "N/A",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isVisible) return null;

  return (
    <div>
      <div className="advisory-header">
        <h1>AI-Powered Battery Advisory</h1>
        <p className="advisory-subtitle">
          Powered by Gemini AI with real-time sensor data
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
                  <option value="discharging">Discharging</option>
                  <option value="charging">Charging</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn--primary btn--full-width" disabled={loading}>
              {loading ? "Analyzing with Gemini AI..." : "🤖 Analyze Scenario"}
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
                  {customResult.recommendation.split("\n").map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
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

        <div className="advisory-history card">
          <div className="history-header">
            <h3>Advisory History</h3>
            <button 
              className="btn btn--sm btn--outline" 
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide History" : "Show History"}
            </button>
          </div>
          
          {showHistory && (
            <div className="history-content">
              {historyLoading ? (
                <p>Loading history...</p>
              ) : advisoryHistory.length === 0 ? (
                <p>No advisory history yet.</p>
              ) : (
                <div className="history-list">
                  {advisoryHistory.map((entry, index) => (
                    <div key={entry.id || index} className={`history-item ${entry.alert_level}`}>
                      <div className="history-timestamp">
                        {formatTimestamp(entry.timestamp)}
                      </div>
                      <div className="history-details">
                        <span className={`risk-level-mini ${entry.alert_level}`}>
                          {entry.alert_level}
                        </span>
                        <span>Battery: {entry.battery_temp}°C</span>
                        <span>Ambient: {entry.ambient_temp}°C</span>
                        <span>State: {entry.device_state}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-16);
          margin-bottom: var(--space-20);
        }

        .advisory-history {
          margin-top: var(--space-20);
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-16);
        }

        .history-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .history-item {
          padding: var(--space-12);
          margin-bottom: var(--space-8);
          border-radius: var(--radius-base);
          background: var(--color-bg-1);
          border-left: 3px solid;
        }

        .history-item.safe {
          border-color: var(--color-success);
        }

        .history-item.warning {
          border-color: var(--color-warning);
        }

        .history-item.danger {
          border-color: var(--color-error);
        }

        .history-timestamp {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-4);
        }

        .history-details {
          display: flex;
          gap: var(--space-12);
          font-size: var(--font-size-sm);
        }

        .risk-level-mini {
          padding: var(--space-2) var(--space-6);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }

        .risk-level-mini.safe {
          background: rgba(var(--color-success-rgb), 0.15);
          color: var(--color-success);
        }

        .risk-level-mini.warning {
          background: rgba(var(--color-warning-rgb), 0.15);
          color: var(--color-warning);
        }

        .risk-level-mini.danger {
          background: rgba(var(--color-error-rgb), 0.15);
          color: var(--color-error);
        }

        .custom-result {
          margin-top: var(--space-20);
          padding: var(--space-16);
          background: var(--color-bg-8);
          border-radius: var(--radius-base);
        }

        .risk-badge {
          padding: var(--space-4) var(--space-12);
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
        }

        .risk-badge.safe {
          background: rgba(var(--color-success-rgb), 0.15);
          color: var(--color-success);
        }

        .risk-badge.warning {
          background: rgba(var(--color-warning-rgb), 0.15);
          color: var(--color-warning);
        }

        .risk-badge.danger {
          background: rgba(var(--color-error-rgb), 0.15);
          color: var(--color-error);
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .history-details {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default AIAdvisory;