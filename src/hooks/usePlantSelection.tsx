
import { useCallback } from 'react';
import { PlantProfile } from '@/data/plants';
import { PlantData } from './usePlantDataTypes';
import { useToast } from '@/hooks/use-toast';
import * as plantDataService from '@/services';

export function usePlantSelection(
  setData: React.Dispatch<React.SetStateAction<PlantData>>
) {
  const { toast } = useToast();

  // Function to set the selected plant profile
  const setSelectedPlant = useCallback(async (plant: PlantProfile) => {
    try {
      const plantId = await plantDataService.ensurePlantExists(plant);
      
      if (!plantId) {
        toast({
          title: "Plant Creation Failed",
          description: "Could not save new plant to database",
          variant: "destructive"
        });
        return;
      }
      
      // Calculate next watering date based on plant's frequency
      const now = new Date();
      let nextDate: Date;
      
      switch (plant.wateringFrequency) {
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
          nextDate = new Date(now.getTime() + (plant.customWateringDays || 3) * 24 * 60 * 60 * 1000);
          break;
        default:
          nextDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Default to 3 days
      }
      
      // Load history data for this plant
      const historyResult = await plantDataService.loadMoistureHistory(plantId);
      const wateringResult = await plantDataService.loadWateringEvents(plantId);
      
      if (historyResult) {
        const { readings, waterEvents, fertilizerEvents } = historyResult;
        
        // Transform readings to match historyData format
        const historyData = readings.map(reading => {
          // Find if there was a watering event close to this reading (within 5 minutes)
          const readingTime = new Date(reading.timestamp as string).getTime();
          
          const waterMotor = waterEvents ? waterEvents.some(event => {
            const eventTime = new Date(event.timestamp as string).getTime();
            return Math.abs(eventTime - readingTime) < 5 * 60 * 1000; // 5 minutes
          }) : false;
          
          const fertilizerMotor = fertilizerEvents ? fertilizerEvents.some(event => {
            const eventTime = new Date(event.timestamp as string).getTime();
            return Math.abs(eventTime - readingTime) < 5 * 60 * 1000; // 5 minutes
          }) : false;

          return {
            timestamp: new Date(reading.timestamp as string),
            moisture: reading.moisture_level,
            waterMotor,
            fertilizerMotor
          };
        });
        
        setData(prev => ({
          ...prev,
          historyData,
          currentMoisture: historyData[0]?.moisture || prev.currentMoisture
        }));
      }
      
      // Set last watered/fertilized dates
      let lastWatered = null;
      let lastFertilized = null;
      
      if (wateringResult) {
        const { waterEvents, fertEvents } = wateringResult;
        
        if (waterEvents && waterEvents.length > 0) {
          lastWatered = new Date(waterEvents[0].timestamp as string);
        }
        
        if (fertEvents && fertEvents.length > 0) {
          lastFertilized = new Date(fertEvents[0].timestamp as string);
        }
      }
      
      setData(prev => ({
        ...prev,
        selectedPlantId: plantId,
        optimalRange: plant.idealMoistureRange,
        wateringFrequency: plant.wateringFrequency,
        customWateringDays: plant.customWateringDays || prev.customWateringDays,
        nextScheduledWatering: nextDate,
        lastWatered: lastWatered || prev.lastWatered,
        lastFertilized: lastFertilized || prev.lastFertilized
      }));
      
      toast({
        title: "Plant Profile Loaded",
        description: `${plant.name} has been loaded from database`
      });
    } catch (err) {
      console.error('Error setting selected plant:', err);
      toast({
        title: "Failed to Load Plant",
        description: "An error occurred while loading plant data",
        variant: "destructive"
      });
    }
  }, [setData, toast]);

  return { setSelectedPlant };
}
