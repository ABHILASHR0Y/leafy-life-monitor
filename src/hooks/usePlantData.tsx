import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PlantProfile } from '@/data/plants';
import { PlantData, MotorStatus, WateringMode, WateringFrequency } from './usePlantDataTypes';
import { usePlantOperations } from './usePlantOperations';
import { usePlantSimulation } from './usePlantSimulation';
import * as plantDataService from '@/services';

// This hook manages plant data, with database persistence via Supabase
export function usePlantData() {
  const { toast } = useToast();
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
    wateringFrequency: 'twice_weekly', // Default to twice weekly
    customWateringDays: 3, // Default to 3 days for custom frequency
    nextScheduledWatering: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    selectedPlantId: null,
    historyData: []
  });

  const [isLoading, setIsLoading] = useState(true);

  // Get simulation hooks
  const { useSimulation, setUseSimulation } = usePlantSimulation(data, setData);

  // Get plant operations
  const {
    activateWaterMotor,
    activateFertilizerMotor,
    toggleWateringMode,
    setWateringDuration,
    setFertilizerDuration,
    setWateringFrequency,
    setCustomWateringDays,
    setOptimalMoistureRange,
    setSelectedPlant,
    updateFromArduino
  } = usePlantOperations(data, setData);

  // Load selected plant from Supabase if it exists
  useEffect(() => {
    const loadInitialPlantData = async () => {
      try {
        const plant = await plantDataService.loadPlantData();
        
        // If we have a plant, set it as selected
        if (plant) {
          setData(prev => ({
            ...prev,
            selectedPlantId: plant.id,
            optimalRange: [plant.ideal_moisture_min, plant.ideal_moisture_max],
            wateringFrequency: plant.watering_frequency as WateringFrequency,
            customWateringDays: plant.custom_watering_days || prev.customWateringDays,
          }));

          // Load watering events first to ensure we have the latest data
          const eventsResult = await plantDataService.loadWateringEvents(plant.id);
          
          if (eventsResult) {
            const { waterEvents, fertEvents } = eventsResult;
            
            if (waterEvents && waterEvents.length > 0) {
              setData(prev => ({ 
                ...prev, 
                lastWatered: new Date(waterEvents[0].timestamp as string) 
              }));
            }
            
            if (fertEvents && fertEvents.length > 0) {
              setData(prev => ({ 
                ...prev, 
                lastFertilized: new Date(fertEvents[0].timestamp as string) 
              }));
            }
          }

          // Load moisture and watering history
          const historyResult = await plantDataService.loadMoistureHistory(plant.id);
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
            
            // Add latest watering events if they aren't already in the history
            if (eventsResult && eventsResult.waterEvents?.length > 0) {
              const latestWaterEvent = eventsResult.waterEvents[0];
              const latestWaterTime = new Date(latestWaterEvent.timestamp as string);
              
              // Check if the latest water event is already in the history data
              const waterEventExists = historyData.some(point => 
                point.waterMotor && 
                Math.abs(point.timestamp.getTime() - latestWaterTime.getTime()) < 5 * 60 * 1000
              );
              
              // If not, add it
              if (!waterEventExists) {
                historyData.push({
                  timestamp: latestWaterTime,
                  moisture: historyData.length > 0 ? historyData[historyData.length - 1].moisture : 0,
                  waterMotor: true,
                  fertilizerMotor: false
                });
              }
            }
            
            // Add latest fertilizer events if they aren't already in the history
            if (eventsResult && eventsResult.fertEvents?.length > 0) {
              const latestFertEvent = eventsResult.fertEvents[0];
              const latestFertTime = new Date(latestFertEvent.timestamp as string);
              
              // Check if the latest fertilizer event is already in the history data
              const fertEventExists = historyData.some(point => 
                point.fertilizerMotor && 
                Math.abs(point.timestamp.getTime() - latestFertTime.getTime()) < 5 * 60 * 1000
              );
              
              // If not, add it
              if (!fertEventExists) {
                historyData.push({
                  timestamp: latestFertTime,
                  moisture: historyData.length > 0 ? historyData[historyData.length - 1].moisture : 0,
                  waterMotor: false,
                  fertilizerMotor: true
                });
              }
            }
            
            // Sort the historyData by timestamp to ensure chronological order
            historyData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            
            setData(prev => ({
              ...prev,
              historyData,
              currentMoisture: historyData.length > 0 ? historyData[historyData.length - 1].moisture : prev.currentMoisture
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load initial plant data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialPlantData();
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
    setWateringFrequency,
    setCustomWateringDays,
    setOptimalMoistureRange,
    setSelectedPlant,
    updateFromArduino,
    setUseSimulation,
    useSimulation,
    isMoistureCritical,
    isLoading
  };
}
