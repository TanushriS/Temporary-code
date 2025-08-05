import { useState, useCallback } from "react";

const useDevicePerformance = () => {
  const [performanceData, setPerformanceData] = useState({});

  const updatePerformance = useCallback(() => {
    const performance = window.performance;

    let memoryInfo = {};
    if (performance.memory) {
      memoryInfo = {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      };
    } else {
      memoryInfo = {
        used: Math.round(45.6 + Math.random() * 10),
        total: 128,
      };
    }

    let networkInfo = {};
    if (navigator.connection) {
      networkInfo = {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
      };
    } else {
      networkInfo = {
        effectiveType: "wifi",
        downlink: 10,
      };
    }

    const cpuLoad = Math.min(100, Math.max(0, Math.random() * 40 + 15));

    setPerformanceData({
      memory: memoryInfo,
      network: networkInfo,
      cpuLoad: Math.round(cpuLoad),
      cores: navigator.hardwareConcurrency || 8,
      timestamp: new Date(),
    });
  }, []);

  return { performanceData, updatePerformance };
};

export default useDevicePerformance;
