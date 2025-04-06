
import { useState, useEffect, useCallback } from 'react';

export type MotorStatus = 'idle' | 'active' | 'error';
export type WateringMode = 'automatic' | 'manual';

export interface PlantData {
  currentMoisture: number;
  optimalRange: [number, number];
  waterMotorStatus: MotorStatus;
  fertilizerMotorStatus: MotorStatus;
  lastWatered: Date | null;
  lastFertilized: Date | null;
  wateringMode: WateringMode;
  wateringDuration: number; // in seconds
  fertilizerDuration: number; // in seconds
  historyData: Array<{
    timestamp: Date;
    moisture: number;
    waterMotor: boolean;
    fertilizerMotor: boolean;
  }>;
}

// This hook simulates data that would come from an Arduino
// but can also be updated with real data from the Arduino
export function usePlantData() {
  const [data, setData] = useState<PlantData>({
    currentMoisture: 65,
    optimalRange: [60, 80],
    waterMotorStatus: 'idle',
    fertilizerMotorStatus: 'idle',
    lastWatered: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    lastFertilized: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    wateringMode: 'manual', // Default to manual mode
    wateringDuration: 10, // Default 10 seconds
    fertilizerDuration: 10, // Default 10 seconds
    historyData: []
  });

  const [useSimulation, setUseSimulation] = useState(true);

  // Function to update data from Arduino readings
  const updateFromArduino = useCallback((arduinoData: any) => {
    setUseSimulation(false); // Switch to real data mode
    
    setData(prev => {
      // Create a copy to avoid mutation
      const newData = { ...prev };
      
      // Update the moisture level if provided
      if ('moisture' in arduinoData) {
        newData.currentMoisture = arduinoData.moisture;
      }
      
      // Update water motor status if provided
      if ('water_motor' in arduinoData) {
        newData.waterMotorStatus = arduinoData.water_motor ? 'active' : 'idle';
        
        // If motor just turned off, update last watered time
        if (!arduinoData.water_motor && prev.waterMotorStatus === 'active') {
          newData.lastWatered = new Date();
        }
      }
      
      // Update fertilizer motor status if provided
      if ('fertilizer_motor' in arduinoData) {
        newData.fertilizerMotorStatus = arduinoData.fertilizer_motor ? 'active' : 'idle';
        
        // If motor just turned off, update last fertilized time
        if (!arduinoData.fertilizer_motor && prev.fertilizerMotorStatus === 'active') {
          newData.lastFertilized = new Date();
        }
      }
      
      // Update watering mode if provided
      if ('mode' in arduinoData) {
        newData.wateringMode = arduinoData.mode as WateringMode;
      }
      
      // Update durations if provided
      if ('water_duration' in arduinoData) {
        newData.wateringDuration = arduinoData.water_duration;
      }
      
      if ('fertilizer_duration' in arduinoData) {
        newData.fertilizerDuration = arduinoData.fertilizer_duration;
      }
      
      // Add a data point to history
      const now = new Date();
      newData.historyData = [
        ...prev.historyData,
        {
          timestamp: now,
          moisture: newData.currentMoisture,
          waterMotor: newData.waterMotorStatus === 'active',
          fertilizerMotor: newData.fertilizerMotorStatus === 'active'
        }
      ].slice(-25); // Keep only the last 25 data points
      
      return newData;
    });
  }, []);

  // Generate mock historical data
  useEffect(() => {
    if (!useSimulation) return; // Skip simulation if using real data
    
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
  }, [useSimulation]);

  // Simulate real-time moisture fluctuations
  useEffect(() => {
    if (!useSimulation) return; // Skip simulation if using real data
    
    const interval = setInterval(() => {
      setData(prev => {
        // Simulate moisture decreasing over time, with some randomness
        let newMoisture = prev.currentMoisture - 0.1 + (Math.random() * 0.2 - 0.1);
        
        // Keep within bounds
        newMoisture = Math.max(0, Math.min(100, newMoisture));
        
        // Auto-activate water motor if in automatic mode and moisture falls below threshold
        const shouldActivateWater = prev.wateringMode === 'automatic' && 
                                   newMoisture <= 0 && 
                                   prev.waterMotorStatus === 'idle';
        
        return {
          ...prev,
          currentMoisture: newMoisture,
          waterMotorStatus: shouldActivateWater ? 'active' : prev.waterMotorStatus
        };
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [useSimulation]);

  // Simulate motor activations
  useEffect(() => {
    if (!useSimulation) return; // Skip simulation if using real data
    
    // If water motor is active, run for specified duration then turn off
    if (data.waterMotorStatus === 'active') {
      const timer = setTimeout(() => {
        setData(prev => ({
          ...prev,
          waterMotorStatus: 'idle',
          lastWatered: new Date(),
          currentMoisture: Math.min(prev.currentMoisture + 15, 100) // Increase moisture
        }));
      }, data.wateringDuration * 1000);
      
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
      }, data.fertilizerDuration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [data.waterMotorStatus, data.fertilizerMotorStatus, data.wateringDuration, data.fertilizerDuration, useSimulation]);

  // Function to manually activate water motor
  const activateWaterMotor = useCallback(() => {
    setData(prev => ({
      ...prev,
      waterMotorStatus: 'active'
    }));
  }, []);

  // Function to manually activate fertilizer motor
  const activateFertilizerMotor = useCallback(() => {
    setData(prev => ({
      ...prev,
      fertilizerMotorStatus: 'active'
    }));
  }, []);

  // Function to toggle watering mode
  const toggleWateringMode = useCallback(() => {
    setData(prev => ({
      ...prev,
      wateringMode: prev.wateringMode === 'automatic' ? 'manual' : 'automatic'
    }));
  }, []);

  // Function to update watering duration
  const setWateringDuration = useCallback((duration: number) => {
    setData(prev => ({
      ...prev,
      wateringDuration: duration
    }));
  }, []);

  // Function to update fertilizer duration
  const setFertilizerDuration = useCallback((duration: number) => {
    setData(prev => ({
      ...prev,
      fertilizerDuration: duration
    }));
  }, []);

  // Check if moisture is critically low (for alerts)
  const isMoistureCritical = data.currentMoisture < data.optimalRange[0] * 0.8;

  return {
    data,
    activateWaterMotor,
    activateFertilizerMotor,
    toggleWateringMode,
    setWateringDuration,
    setFertilizerDuration,
    updateFromArduino,
    isMoistureCritical
  };
}
