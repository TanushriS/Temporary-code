import React, { useRef, useState, useEffect, useContext } from 'react';
import { Chart } from 'chart.js/auto';
import ThermoSenseContext from '../context/ThermoSenseContext';

const ChartDisplay = ({ isVisible }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { batteryData, weatherData, deviceTemp } = useContext(ThermoSenseContext);

  const [chartData, setChartData] = useState({
    labels: [],
    deviceTemps: [],
    ambientTemps: [],
    batteryLevels: []
  });
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isVisible && chartRef.current && !chartInstance.current) {
      const ctx = chartRef.current.getContext('2d');

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Device Temperature',
              data: [],
              borderColor: '#1FB8CD',
              backgroundColor: 'rgba(31, 184, 205, 0.1)',
              tension: 0.4,
              fill: false,
              yAxisID: 'y'
            },
            {
              label: 'Ambient Temperature',
              data: [],
              borderColor: '#FFC185',
              backgroundColor: 'rgba(255, 193, 133, 0.1)',
              tension: 0.4,
              fill: false,
              yAxisID: 'y'
            },
            {
              label: 'Battery Level',
              data: [],
              borderColor: '#B4413C',
              backgroundColor: 'rgba(180, 65, 60, 0.1)',
              tension: 0.4,
              fill: false,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 750 },
          plugins: { legend: { display: false } },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              min: 15,
              max: 55,
              title: { display: true, text: 'Temperature (°C)' }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              min: 0,
              max: 100,
              title: { display: true, text: 'Battery Level (%)' },
              grid: { drawOnChartArea: false }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!chartInstance.current || isPaused) return;

    const interval = setInterval(() => {
      const timeLabel = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });

      setChartData(prev => {
        const newData = {
          labels: [...prev.labels, timeLabel],
          deviceTemps: [...prev.deviceTemps, deviceTemp || 25],
          ambientTemps: [...prev.ambientTemps, weatherData?.temperature || 22],
          batteryLevels: [...prev.batteryLevels, batteryData?.level || 75]
        };

        // Keep only last 50 data points
        if (newData.labels.length > 50) {
          newData.labels.shift();
          newData.deviceTemps.shift();
          newData.ambientTemps.shift();
          newData.batteryLevels.shift();
        }

        if (chartInstance.current) {
          chartInstance.current.data.labels = [...newData.labels];
          chartInstance.current.data.datasets[0].data = [...newData.deviceTemps];
          chartInstance.current.data.datasets[1].data = [...newData.ambientTemps];
          chartInstance.current.data.datasets[2].data = [...newData.batteryLevels];
          chartInstance.current.update('none');
        }

        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, deviceTemp, weatherData, batteryData]);

  if (!isVisible) return null;

  return (
    <div>
      <div className="monitoring-header">
        <h1>Live Temperature & Performance Monitor</h1>
        <div className="chart-controls">
          <button
            className="btn btn--sm"
            onClick={() => {
              setChartData({ labels: [], deviceTemps: [], ambientTemps: [], batteryLevels: [] });
              if (chartInstance.current) {
                chartInstance.current.data.labels = [];
                chartInstance.current.data.datasets.forEach(dataset => {
                  dataset.data = [];
                });
                chartInstance.current.update();
              }
            }}
          >
            Reset Chart
          </button>
          <button
            className={`btn btn--sm ${isPaused ? '' : 'btn--primary'}`}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      <div className="chart-container" style={{ height: '400px', position: 'relative' }}>
        <canvas ref={chartRef}></canvas>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color device"></span>
          <span>Device Temperature (Estimated)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color ambient"></span>
          <span>Ambient Temperature (Weather)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color battery"></span>
          <span>Battery Level</span>
        </div>
      </div>
    </div>
  );
};

export default ChartDisplay;
