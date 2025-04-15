
import { useCallback } from 'react';
import { PlantData, MotorStatus, WateringMode } from './usePlantDataTypes';
import * as plantDataService from '@/services';

export function useMotorOperations(
  data: PlantData,
  setData: React.Dispatch<React.SetStateAction<PlantData>>
) {
  // Function to manually activate water motor
  const activateWaterMotor = useCallback(() => {
    setData(prev => {
      // Fix: Ensure we're using the correct MotorStatus type
      const newData = { ...prev, waterMotorStatus: 'active' as MotorStatus };
      
      // If a plant is selected, schedule saving the watering event when the motor stops
      if (prev.selectedPlantId) {
        // We'll save the event after the motor has run for the specified duration
        setTimeout(() => {
          plantDataService.saveWateringEvent(
            prev.selectedPlantId!, 
            'water', 
            prev.wateringDuration
          ).catch(err => console.error('Failed to save watering event:', err));
          
          // Also save a new moisture reading with increased level
          plantDataService.saveMoistureReading(
            prev.selectedPlantId!,
            Math.min(prev.currentMoisture + 15, 100)
          ).catch(err => console.error('Failed to save moisture reading:', err));
        }, prev.wateringDuration * 1000);
      }
      
      return newData;
    });
  }, [setData]);

  // Function to manually activate fertilizer motor
  const activateFertilizerMotor = useCallback(() => {
    setData(prev => {
      // Fix: Ensure we're using the correct MotorStatus type
      const newData = { ...prev, fertilizerMotorStatus: 'active' as MotorStatus };
      
      // If a plant is selected, schedule saving the fertilizer event when the motor stops
      if (prev.selectedPlantId) {
        // We'll save the event after the motor has run for the specified duration
        setTimeout(() => {
          plantDataService.saveWateringEvent(
            prev.selectedPlantId!, 
            'fertilizer', 
            prev.fertilizerDuration
          ).catch(err => console.error('Failed to save fertilizer event:', err));
        }, prev.fertilizerDuration * 1000);
      }
      
      return newData;
    });
  }, [setData]);

  // Function to toggle watering mode
  const toggleWateringMode = useCallback(() => {
    setData(prev => ({
      ...prev,
      wateringMode: prev.wateringMode === 'automatic' ? 'manual' : 'automatic'
    }));
  }, [setData]);

  // Function to update watering duration
  const setWateringDuration = useCallback((duration: number) => {
    setData(prev => ({
      ...prev,
      wateringDuration: duration
    }));
  }, [setData]);

  // Function to update fertilizer duration
  const setFertilizerDuration = useCallback((duration: number) => {
    setData(prev => ({
      ...prev,
      fertilizerDuration: duration
    }));
  }, [setData]);

  return {
    activateWaterMotor,
    activateFertilizerMotor,
    toggleWateringMode,
    setWateringDuration,
    setFertilizerDuration
  };
}
