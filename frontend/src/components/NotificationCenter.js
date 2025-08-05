import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";

const NotificationCenter = ({
  isVisible,
  notifications,
  onClearAll,
  onTestNotification,
}) => {
  const [filter, setFilter] = useState("all");

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  if (!isVisible) return null;

  return (
    <div>
      <div className="notifications-header">
        <h1>Alert & Notification Center</h1>
        <div className="notifications-controls">
          <button className="btn btn--sm btn--outline" onClick={onClearAll}>
            Clear All
          </button>
          <button
            className="btn btn--sm btn--primary"
            onClick={onTestNotification}
          >
            Test Alert
          </button>
        </div>
      </div>

      <div className="notifications-filters">
        {["all", "critical", "warning", "info"].map((filterType) => (
          <button
            key={filterType}
            className={`filter-btn ${filter === filterType ? "active" : ""}`}
            onClick={() => setFilter(filterType)}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      <div className="notifications-container">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            {filter === "all"
              ? "No notifications yet"
              : `No ${filter} notifications`}
          </div>
        ) : (
          filteredNotifications.map((notif, index) => (
            <div key={index} className={`notification-full ${notif.type}`}>
              <div className="notification-timestamp">
                {notif.timestamp.toLocaleString()}
              </div>
              <div className="notification-message">{notif.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

NotificationCenter.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      timestamp: PropTypes.instanceOf(Date).isRequired,
    })
  ).isRequired,
  onClearAll: PropTypes.func.isRequired,
  onTestNotification: PropTypes.func.isRequired,
};

export default NotificationCenter;
