
import { useCallback } from 'react';
import { PlantData, WateringFrequency } from './usePlantDataTypes';
import * as plantDataService from '@/services';

export function useWateringSchedule(
  data: PlantData,
  setData: React.Dispatch<React.SetStateAction<PlantData>>
) {
  // Function to update watering frequency
  const setWateringFrequency = useCallback((frequency: WateringFrequency) => {
    setData(prev => {
      // Calculate next watering date based on frequency
      const now = new Date();
      let nextDate: Date;
      
      switch (frequency) {
        case 'daily':
          nextDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
          break;
        case 'twice_weekly':
          nextDate = new Date(now.getTime() + 3.5 * 24 * 60 * 60 * 1000); // 3.5 days
          break;
        case 'weekly':
          nextDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
          break;
        case 'biweekly':
          nextDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
          break;
        case 'custom':
          nextDate = new Date(now.getTime() + prev.customWateringDays * 24 * 60 * 60 * 1000);
          break;
        default:
          nextDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Default to 3 days
      }
      
      // Update plant record in database if a plant is selected
      if (prev.selectedPlantId) {
        plantDataService.updatePlantInDatabase(prev.selectedPlantId, {
          watering_frequency: frequency,
          custom_watering_days: prev.customWateringDays
        }).catch(err => console.error('Failed to update plant frequency:', err));
      }
      
      return {
        ...prev,
        wateringFrequency: frequency,
        nextScheduledWatering: nextDate
      };
    });
  }, [setData]);

  // Function to update custom watering days
  const setCustomWateringDays = useCallback((days: number) => {
    setData(prev => {
      // Only update next scheduled watering if frequency is custom
      const now = new Date();
      const nextDate = prev.wateringFrequency === 'custom' 
        ? new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
        : prev.nextScheduledWatering;
      
      // Update plant record in database if a plant is selected
      if (prev.selectedPlantId && prev.wateringFrequency === 'custom') {
        plantDataService.updatePlantInDatabase(prev.selectedPlantId, {
          custom_watering_days: days
        }).catch(err => console.error('Failed to update custom watering days:', err));
      }
        
      return {
        ...prev,
        customWateringDays: days,
        nextScheduledWatering: nextDate
      };
    });
  }, [setData]);

  // Function to update optimal moisture range
  const setOptimalMoistureRange = useCallback((range: [number, number]) => {
    // Ensure min <= max and values are within 0-100
    const validRange: [number, number] = [
      Math.max(0, Math.min(range[0], 100)),
      Math.max(0, Math.min(range[1], 100))
    ];
    
    // Ensure min <= max
    if (validRange[0] > validRange[1]) {
      validRange[0] = validRange[1];
    }
    
    // Update plant record in database if a plant is selected
    if (data.selectedPlantId) {
      plantDataService.updatePlantInDatabase(data.selectedPlantId, {
        ideal_moisture_min: validRange[0],
        ideal_moisture_max: validRange[1]
      }).catch(err => console.error('Failed to update optimal moisture range:', err));
    }
    
    setData(prev => ({
      ...prev,
      optimalRange: validRange
    }));
  }, [data.selectedPlantId, setData]);

  return {
    setWateringFrequency,
    setCustomWateringDays,
    setOptimalMoistureRange
  };
}
