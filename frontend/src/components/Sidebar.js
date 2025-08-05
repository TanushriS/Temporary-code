import React from 'react';
import PropTypes from 'prop-types';

const Sidebar = ({ activeTab, onTabChange, notificationCount }) => {
  const tabs = [
    { id: 'dashboard', label: '📊 Live Dashboard' },
    { id: 'monitoring', label: '📈 Real-Time Chart' },
    // { id: 'analytics', label: '🔍 Analytics' },
    { id: 'advisory', label: '🤖 AI Advisory' },
    { id: 'notifications', label: '🔔 Alerts', badge: notificationCount },
    { id: 'settings', label: '⚙️ Settings' }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTabChange(tab.id);
            }}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span className="notification-badge visible">{tab.badge}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
};

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  notificationCount: PropTypes.number
};

Sidebar.defaultProps = {
  notificationCount: 0
};

export default Sidebar;
