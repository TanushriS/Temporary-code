import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Context
import ThermoSenseContext from './context/ThermoSenseContext';

// Components
import LoadingScreen from './components/LoadingScreen';
import PermissionModal from './components/PermissionModal';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChartDisplay from './components/ChartDisplay';
import AIAdvisory from './components/AIAdvisory';
import NotificationCenter from './components/NotificationCenter';
import Settings from './components/Settings';

// Hooks
import useBattery from './hooks/useBattery';
import useWeather from './hooks/useWeather';
import useDevicePerformance from './hooks/useDevicePerformance';
import useMLModel from './hooks/useMLModel';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [deviceTemp, setDeviceTemp] = useState(27.5);

  const { batteryData, batteryStatus, initializeBattery, retryBattery } = useBattery();
  const { weatherData, weatherStatus, getLocationAndWeather, retryWeather } = useWeather();
  const { performanceData, updatePerformance } = useDevicePerformance();
  const { generateRecommendations } = useMLModel();

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [loadingSteps, setLoadingSteps] = useState([
    { text: 'Starting ThermoSense...', status: 'pending' },
    { text: 'Checking browser compatibility...', status: 'pending' },
    { text: 'Requesting location access...', status: 'pending' },
    { text: 'Connecting to weather service...', status: 'pending' },
    { text: 'Initializing battery monitoring...', status: 'pending' },
    { text: 'Setting up real-time updates...', status: 'pending' }
  ]);

  const apiStatus = useMemo(() => ({
    battery: batteryStatus === 'connected' ? 'connected' : batteryStatus === 'retrying' ? 'retrying' : 'disconnected',
    weather: weatherStatus === 'connected' ? 'connected' : weatherStatus === 'retrying' ? 'retrying' : 'disconnected',
    performance: 'connected'
  }), [batteryStatus, weatherStatus]);

  const healthData = useMemo(() => {
    return generateRecommendations(batteryData, weatherData, deviceTemp, performanceData);
  }, [batteryData, weatherData, deviceTemp, performanceData, generateRecommendations]);

  const notificationCount = useMemo(() => {
    return notifications.filter(n => n.type === 'critical' || n.type === 'warning').length;
  }, [notifications]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [{ ...notification, id, timestamp: new Date() }, ...prev.slice(0, 99)]);
  }, []);

  useEffect(() => {
    const runLoadingSequence = async () => {
      const steps = [
        { duration: 500 }, { duration: 1000 }, { duration: 1500 },
        { duration: 1000 }, { duration: 1000 }, { duration: 500 }
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(loadingSteps[i].text);
        setLoadingSteps(prev => prev.map((s, idx) =>
          idx === i ? { ...s, status: 'active' } : s
        ));
        await new Promise(res => setTimeout(res, steps[i].duration));
        setLoadingSteps(prev => prev.map((s, idx) =>
          idx === i ? { ...s, status: 'completed' } : s
        ));
        setLoadingProgress(((i + 1) / steps.length) * 100);
      }

      setTimeout(() => {
        setIsLoading(false);
        setShowPermissionModal(true);
      }, 1000);
    };

    runLoadingSequence();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      let baseTemp = 25;
      if (weatherData) baseTemp += (weatherData.temperature - 20) * 0.3;
      if (batteryData?.charging) baseTemp += 3;
      if (performanceData.cpuLoad) baseTemp += (performanceData.cpuLoad / 100) * 8;
      baseTemp += (Math.random() - 0.5) * 2;
      setDeviceTemp(Math.max(20, Math.min(50, baseTemp)));
    }, 15000);
    return () => clearInterval(interval);
  }, [weatherData, batteryData, performanceData]);

  useEffect(() => {
    const interval = setInterval(() => {
      updatePerformance();
    }, 10000);
    return () => clearInterval(interval);
  }, [updatePerformance]);

  const handleAllowPermissions = async () => {
    setShowPermissionModal(false);
    try {
      await Promise.all([initializeBattery(), getLocationAndWeather()]);
      addNotification({ type: 'info', message: '✅ Monitoring permissions enabled successfully' });
    } catch (err) {
      addNotification({ type: 'warning', message: '⚠️ Some permissions failed — limited mode' });
    }
  };

  const handleDenyPermissions = () => {
    setShowPermissionModal(false);
    initializeBattery();
    getLocationAndWeather();
    addNotification({ type: 'info', message: '⚠️ Running in limited mode — enable permissions for full features' });
  };

  const handleThemeToggle = useCallback(() => {
    const current = document.documentElement.getAttribute('data-color-scheme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-color-scheme', next);
    localStorage.setItem('thermosense-theme', next);
  }, []);

  const handleExport = useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      batteryData, weatherData, performanceData,
      deviceTemp, healthData, notifications, apiStatus
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thermosense-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification({ type: 'info', message: '📊 Data exported successfully' });
  }, [batteryData, weatherData, performanceData, deviceTemp, healthData, notifications, apiStatus, addNotification]);

  const handleTestNotification = useCallback(() => {
    addNotification({ type: 'info', message: '🧪 Test notification — system working properly' });
  }, [addNotification]);

  const contextValue = {
    batteryData,
    weatherData,
    performanceData,
    deviceTemp,
    healthData,
    notifications,
    onRetryBattery: retryBattery,
    onRetryWeather: retryWeather,
    addNotification
  };

  return (
    <ThermoSenseContext.Provider value={contextValue}>
      <div className="app">
        <LoadingScreen
          isVisible={isLoading}
          progress={loadingProgress}
          currentStep={currentStep}
          steps={loadingSteps}
        />

        <PermissionModal
          isVisible={showPermissionModal}
          onAllow={handleAllowPermissions}
          onDeny={handleDenyPermissions}
        />

        <Navigation
          apiStatus={apiStatus}
          onThemeToggle={handleThemeToggle}
          onExport={handleExport}
        />

        <div className="app-container">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            notificationCount={notificationCount}
          />

          <main className="main-content">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'monitoring' && <ChartDisplay isVisible />}
            {activeTab === 'advisory' && <AIAdvisory isVisible healthData={healthData} />}
            {activeTab === 'notifications' && (
              <NotificationCenter
                isVisible
                notifications={notifications}
                onClearAll={() => setNotifications([])}
                onTestNotification={handleTestNotification}
              />
            )}
            {activeTab === 'settings' && <Settings isVisible />}
          </main>
        </div>
      </div>
    </ThermoSenseContext.Provider>
  );
};

export default App;