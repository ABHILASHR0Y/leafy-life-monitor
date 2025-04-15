import { useState, useEffect, useCallback } from 'react';
import { MotorStatus, PlantData } from '@/hooks/usePlantDataTypes';

export function usePlantSimulation(plantData: PlantData, setPlantData: React.Dispatch<React.SetStateAction<PlantData>>) {
  const [useSimulation, setUseSimulation] = useState(true); // Enable simulation by default

  // Generate mock historical data if no data in the database
  useEffect(() => {
    // If we have real data from the database, don't generate simulation data
    if (plantData.historyData.length > 0) return;
    
    // Generate simulation data
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
    
    // Only update if historyData is empty or useSimulation is true
    setPlantData(prev => {
      if (prev.historyData.length === 0 || useSimulation) {
        return { ...prev, historyData: history };
      }
      return prev;
    });
  }, [useSimulation, plantData.historyData.length, setPlantData]);

  // Simulate real-time moisture fluctuations
  useEffect(() => {
    if (!useSimulation) return; // Skip simulation if using real data
    
    const interval = setInterval(() => {
      setPlantData(prev => {
        // Simulate moisture decreasing over time, with some randomness
        let newMoisture = prev.currentMoisture - 0.1 + (Math.random() * 0.2 - 0.1);
        
        // Keep within bounds
        newMoisture = Math.max(0, Math.min(100, newMoisture));
        
        // Auto-activate water motor if in automatic mode and moisture falls below threshold
        const shouldActivateWater = prev.wateringMode === 'automatic' && 
                                  newMoisture <= prev.optimalRange[0] * 0.7 && 
                                  prev.waterMotorStatus === 'idle';
        
        // Fix: Ensure we're using the correct type
        const newStatus: MotorStatus = shouldActivateWater ? 'active' : prev.waterMotorStatus;
        
        return {
          ...prev,
          currentMoisture: newMoisture,
          waterMotorStatus: newStatus
        };
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [useSimulation, setPlantData]);

  // Simulate motor activations
  useEffect(() => {
    if (!useSimulation) return; // Skip simulation if using real data
    
    // If water motor is active, run for specified duration then turn off
    if (plantData.waterMotorStatus === 'active') {
      const timer = setTimeout(() => {
        setPlantData(prev => ({
          ...prev,
          waterMotorStatus: 'idle',
          lastWatered: new Date(),
          currentMoisture: Math.min(prev.currentMoisture + 15, 100) // Increase moisture
        }));
      }, plantData.wateringDuration * 1000);
      
      return () => clearTimeout(timer);
    }
    
    // Similarly for fertilizer motor
    if (plantData.fertilizerMotorStatus === 'active') {
      const timer = setTimeout(() => {
        setPlantData(prev => ({
          ...prev,
          fertilizerMotorStatus: 'idle',
          lastFertilized: new Date()
        }));
      }, plantData.fertilizerDuration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [plantData.waterMotorStatus, plantData.fertilizerMotorStatus, plantData.wateringDuration, plantData.fertilizerDuration, useSimulation, setPlantData]);

  // Check if it's time to water based on frequency and moisture level
  useEffect(() => {
    if (!useSimulation || plantData.wateringMode !== 'automatic') return;
    
    const now = new Date();
    
    // Check if it's time to water based on schedule AND if moisture is below threshold
    if (plantData.nextScheduledWatering && 
        now >= plantData.nextScheduledWatering && 
        plantData.currentMoisture < plantData.optimalRange[0] && 
        plantData.waterMotorStatus === 'idle') {
      
      // Activate water motor
      setPlantData(prev => ({
        ...prev,
        waterMotorStatus: 'active'
      }));
    }
  }, [plantData.currentMoisture, plantData.nextScheduledWatering, plantData.optimalRange, plantData.waterMotorStatus, plantData.wateringMode, useSimulation, setPlantData]);

  return {
    useSimulation,
    setUseSimulation
  };
}
