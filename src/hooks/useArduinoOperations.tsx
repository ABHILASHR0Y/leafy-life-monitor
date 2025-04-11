
import { useCallback } from 'react';
import { PlantData, MotorStatus } from './usePlantDataTypes';
import * as plantDataService from '@/services';

export function useArduinoOperations(
  setData: React.Dispatch<React.SetStateAction<PlantData>>
) {
  // Function to update data from Arduino readings and save to database
  const updateFromArduino = useCallback(async (arduinoData: any) => {
    setData(prev => {
      // Create a copy to avoid mutation
      const newData = { ...prev };
      
      // Update the moisture level if provided
      if ('moisture' in arduinoData) {
        newData.currentMoisture = arduinoData.moisture;
        
        // Save moisture reading to database if a plant is selected
        if (prev.selectedPlantId) {
          plantDataService.saveMoistureReading(prev.selectedPlantId, arduinoData.moisture).catch(err => 
            console.error('Failed to save moisture reading:', err)
          );
        }
      }
      
      // Update water motor status if provided
      if ('water_motor' in arduinoData) {
        const wasActive = prev.waterMotorStatus === 'active';
        // Fix: Ensure we're using the correct type by using type assertion
        const newStatus: MotorStatus = arduinoData.water_motor ? 'active' : 'idle';
        newData.waterMotorStatus = newStatus;
        
        // If motor just turned off, update last watered time and save to database
        if (!arduinoData.water_motor && wasActive) {
          newData.lastWatered = new Date();
          
          // Save watering event to database if a plant is selected
          if (prev.selectedPlantId) {
            plantDataService.saveWateringEvent(
              prev.selectedPlantId, 
              'water', 
              prev.wateringDuration
            ).catch(err => console.error('Failed to save watering event:', err));
          }
        }
      }
      
      // Update fertilizer motor status if provided
      if ('fertilizer_motor' in arduinoData) {
        const wasActive = prev.fertilizerMotorStatus === 'active';
        // Fix: Ensure we're using the correct type by using type assertion
        const newStatus: MotorStatus = arduinoData.fertilizer_motor ? 'active' : 'idle';
        newData.fertilizerMotorStatus = newStatus;
        
        // If motor just turned off, update last fertilized time and save to database
        if (!arduinoData.fertilizer_motor && wasActive) {
          newData.lastFertilized = new Date();
          
          // Save fertilizer event to database if a plant is selected
          if (prev.selectedPlantId) {
            plantDataService.saveWateringEvent(
              prev.selectedPlantId, 
              'fertilizer', 
              prev.fertilizerDuration
            ).catch(err => console.error('Failed to save fertilizer event:', err));
          }
        }
      }
      
      // Update watering mode if provided
      if ('mode' in arduinoData) {
        newData.wateringMode = arduinoData.mode;
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
  }, [setData]);

  return { updateFromArduino };
}
