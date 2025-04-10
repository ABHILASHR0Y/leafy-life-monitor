
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PlantProfile } from '@/data/plants';
import { PlantData, MotorStatus, WateringMode, WateringFrequency } from './usePlantDataTypes';
import { usePlantOperations } from './usePlantOperations';
import { usePlantSimulation } from './usePlantSimulation';
import * as plantDataService from '@/services/plantDataService';

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
            
            setData(prev => ({
              ...prev,
              historyData,
              currentMoisture: historyData[0]?.moisture || prev.currentMoisture
            }));
          }
          
          // Load last watering/fertilizer events
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
