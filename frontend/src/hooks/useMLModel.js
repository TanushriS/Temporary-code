import { useCallback } from 'react';

const useMLModel = () => {
  const coefficients = {
    temperatureWeight: -0.12,
    usageWeight: -0.08,
    ageWeight: -0.05,
    chargingCycleWeight: -0.03,
    intercept: 100
  };

  const generateRecommendations = useCallback((batteryData, weatherData, deviceTemp, performanceData) => {
    const recommendations = [];
    let healthScore = 100;
    let alertLevel = 'safe';

    // Temperature analysis
    if (deviceTemp > 40) {
      recommendations.push("🚨 CRITICAL: Device temperature too high! Cool down immediately!");
      healthScore -= 25;
      alertLevel = 'danger';
    } else if (deviceTemp > 35) {
      recommendations.push("⚠️ WARNING: Device running hot. Reduce intensive tasks.");
      healthScore -= 15;
      alertLevel = 'warning';
    } else {
      recommendations.push("✅ Temperature levels are optimal.");
    }

    // Battery analysis
    if (batteryData) {
      if (batteryData.charging && deviceTemp > 35) {
        recommendations.push("⚠️ Charging while hot affects battery longevity.");
        healthScore -= 10;
        if (alertLevel === 'safe') alertLevel = 'warning';
      } else if (batteryData.charging) {
        recommendations.push("🔋 Charging conditions are good.");
      }

      if (batteryData.level < 20) {
        recommendations.push("🔋 Battery low. Consider charging soon.");
        healthScore -= 5;
        if (alertLevel === 'safe') alertLevel = 'warning';
      }
    }

    // Environmental analysis
    if (weatherData) {
      if (weatherData.temperature > 30) {
        recommendations.push("🌡️ High ambient temperature affects device cooling.");
        healthScore -= 8;
        if (alertLevel === 'safe') alertLevel = 'warning';
      } else if (weatherData.temperature < 10) {
        recommendations.push("❄️ Cold weather can temporarily reduce battery capacity.");
        healthScore -= 3;
      }
    }

    // Performance analysis
    if (performanceData && performanceData.cpuLoad > 80) {
      recommendations.push("📊 High CPU load detected. Monitor for heat buildup.");
      healthScore -= 10;
      if (alertLevel === 'safe') alertLevel = 'warning';
    }

    return {
      healthScore: Math.max(0, Math.min(100, healthScore)),
      recommendations,
      alertLevel,
      lastUpdated: new Date()
    };
  }, []);

  return { generateRecommendations };
};

export default useMLModel;
