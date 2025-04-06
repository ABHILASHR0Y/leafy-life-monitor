import { useState, useEffect } from 'react';

export type MotorStatus = 'idle' | 'active' | 'error';

export interface PlantData {
  currentMoisture: number;
  optimalRange: [number, number];
  waterMotorStatus: MotorStatus;
  fertilizerMotorStatus: MotorStatus;
  lastWatered: Date | null;
  lastFertilized: Date | null;
  historyData: Array<{
    timestamp: Date;
    moisture: number;
    waterMotor: boolean;
    fertilizerMotor: boolean;
  }>;
}

// This is a mock hook that simulates data that would come from an Arduino
export function usePlantData() {
  const [data, setData] = useState<PlantData>({
    currentMoisture: 65,
    optimalRange: [60, 80],
    waterMotorStatus: 'idle',
    fertilizerMotorStatus: 'idle',
    lastWatered: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    lastFertilized: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    historyData: []
  });

  // Generate mock historical data
  useEffect(() => {
    const now = new Date();
    const history = [];
    
    // Generate data for the last 24 hours, every hour
    for (let i = 24; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      // Base moisture with some randomness
      const baseMoisture = 70 + Math.sin(i / 3) * 20;
      const moisture = Math.max(0, Math.min(100, baseMoisture + (Math.random() * 10 - 5)));
      
      // Water motor was active if moisture was below 50
      const waterMotor = moisture < 50;
      
      // Fertilizer motor activates once a day at a specific hour (e.g., 9 AM)
      const fertilizerMotor = timestamp.getHours() === 9 && timestamp.getDate() % 3 === 0;
      
      history.push({
        timestamp,
        moisture,
        waterMotor,
        fertilizerMotor
      });
    }
    
    setData(prev => ({ ...prev, historyData: history }));
  }, []);

  // Simulate real-time moisture fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        // Simulate moisture decreasing over time, with some randomness
        let newMoisture = prev.currentMoisture - 0.1 + (Math.random() * 0.2 - 0.1);
        
        // Keep within bounds
        newMoisture = Math.max(0, Math.min(100, newMoisture));
        
        // Auto-activate water motor if moisture falls below minimum threshold
        const shouldActivateWater = newMoisture < prev.optimalRange[0] && 
                                   prev.waterMotorStatus === 'idle';
        
        return {
          ...prev,
          currentMoisture: newMoisture,
          waterMotorStatus: shouldActivateWater ? 'active' : prev.waterMotorStatus
        };
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Simulate motor activations
  useEffect(() => {
    // If water motor is active, run for 5 seconds then turn off
    if (data.waterMotorStatus === 'active') {
      const timer = setTimeout(() => {
        setData(prev => ({
          ...prev,
          waterMotorStatus: 'idle',
          lastWatered: new Date(),
          currentMoisture: Math.min(prev.currentMoisture + 15, 100) // Increase moisture
        }));
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    // Similarly for fertilizer motor
    if (data.fertilizerMotorStatus === 'active') {
      const timer = setTimeout(() => {
        setData(prev => ({
          ...prev,
          fertilizerMotorStatus: 'idle',
          lastFertilized: new Date()
        }));
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [data.waterMotorStatus, data.fertilizerMotorStatus]);

  // Function to manually activate water motor
  const activateWaterMotor = () => {
    setData(prev => ({
      ...prev,
      waterMotorStatus: 'active'
    }));
  };

  // Function to manually activate fertilizer motor
  const activateFertilizerMotor = () => {
    setData(prev => ({
      ...prev,
      fertilizerMotorStatus: 'active'
    }));
  };

  // Check if moisture is critically low (for alerts)
  const isMoistureCritical = data.currentMoisture < data.optimalRange[0] * 0.8;

  return {
    data,
    activateWaterMotor,
    activateFertilizerMotor,
    isMoistureCritical
  };
}
