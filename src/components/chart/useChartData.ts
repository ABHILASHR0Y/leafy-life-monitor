
import { useMemo } from 'react';

interface DataPoint {
  timestamp: Date;
  moisture: number;
  waterMotor: boolean;
  fertilizerMotor: boolean;
}

export interface ChartDataPoint {
  time: string;
  fullTime: string;
  moisture: number;
  waterMotor: number;
  fertilizerMotor: number;
  offline: boolean;
}

export const useChartData = (
  data: DataPoint[],
  isArduinoConnected: boolean
) => {
  // Format data for the chart
  const chartData = useMemo(() => {
    // If no data or not connected to Arduino, create simulated offline data
    if (!isArduinoConnected || data.length === 0) {
      // Generate flat line data points for offline visualization
      const offlineData = [];
      const now = new Date();
      for (let i = 12; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000); // 30-minute intervals
        offlineData.push({
          time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fullTime: timestamp.toLocaleString(),
          moisture: 0, // Flat line at 0
          waterMotor: 0,
          fertilizerMotor: 0,
          offline: true // Mark as offline data
        });
      }
      return offlineData;
    }

    // Regular data processing for online mode
    // Sort by timestamp to ensure chronological order
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return sortedData.map(point => ({
      time: point.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTime: point.timestamp.toLocaleString(),
      moisture: point.moisture,
      waterMotor: point.waterMotor ? 1 : 0,
      fertilizerMotor: point.fertilizerMotor ? 1 : 0,
      offline: false
    }));
  }, [data, isArduinoConnected]);
  
  // Get today's data only
  const todayData = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return chartData.filter(point => {
      const pointDate = new Date(point.fullTime).setHours(0, 0, 0, 0);
      return pointDate === today;
    });
  }, [chartData]);

  return {
    chartData,
    todayData
  };
};
