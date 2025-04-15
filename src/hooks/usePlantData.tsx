
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
    currentMoisture: 0, // Start with 0 until real data is loaded
    optimalRange: [60, 80],
    waterMotorStatus: 'idle',
    fertilizerMotorStatus: 'idle',
    lastWatered: null, // Initialize as null until data is loaded
    lastFertilized: null, // Initialize as null until data is loaded
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Get simulation hooks - with parameter to disable simulation if real data exists
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
        setIsLoading(true);
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
              console.log('Last watered time loaded:', new Date(waterEvents[0].timestamp as string));
            }
            
            if (fertEvents && fertEvents.length > 0) {
              setData(prev => ({ 
                ...prev, 
                lastFertilized: new Date(fertEvents[0].timestamp as string) 
              }));
              console.log('Last fertilized time loaded:', new Date(fertEvents[0].timestamp as string));
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
              eventsResult.waterEvents.forEach(waterEvent => {
                const waterTime = new Date(waterEvent.timestamp as string);
                
                // Check if this water event is already represented in the history data
                const waterEventExists = historyData.some(point => 
                  point.waterMotor && 
                  Math.abs(point.timestamp.getTime() - waterTime.getTime()) < 5 * 60 * 1000
                );
                
                // If not, add it
                if (!waterEventExists) {
                  // Find the closest moisture reading to this event
                  let closestReadingValue = historyData.length > 0 ? historyData[0].moisture : 50;
                  if (historyData.length > 0) {
                    const sortedData = [...historyData].sort((a, b) => 
                      Math.abs(a.timestamp.getTime() - waterTime.getTime()) - 
                      Math.abs(b.timestamp.getTime() - waterTime.getTime())
                    );
                    closestReadingValue = sortedData[0].moisture;
                  }
                  
                  historyData.push({
                    timestamp: waterTime,
                    moisture: closestReadingValue,
                    waterMotor: true,
                    fertilizerMotor: false
                  });
                }
              });
            }
            
            // Add latest fertilizer events if they aren't already in the history
            if (eventsResult && eventsResult.fertEvents?.length > 0) {
              eventsResult.fertEvents.forEach(fertEvent => {
                const fertTime = new Date(fertEvent.timestamp as string);
                
                // Check if this fertilizer event is already represented in the history data
                const fertEventExists = historyData.some(point => 
                  point.fertilizerMotor && 
                  Math.abs(point.timestamp.getTime() - fertTime.getTime()) < 5 * 60 * 1000
                );
                
                // If not, add it
                if (!fertEventExists) {
                  // Find the closest moisture reading to this event
                  let closestReadingValue = historyData.length > 0 ? historyData[0].moisture : 50;
                  if (historyData.length > 0) {
                    const sortedData = [...historyData].sort((a, b) => 
                      Math.abs(a.timestamp.getTime() - fertTime.getTime()) - 
                      Math.abs(b.timestamp.getTime() - fertTime.getTime())
                    );
                    closestReadingValue = sortedData[0].moisture;
                  }
                  
                  historyData.push({
                    timestamp: fertTime,
                    moisture: closestReadingValue,
                    waterMotor: false,
                    fertilizerMotor: true
                  });
                }
              });
            }
            
            // Sort the historyData by timestamp to ensure chronological order
            historyData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            
            // If we have actual historical data, use it
            if (historyData.length > 0) {
              setData(prev => ({
                ...prev,
                historyData,
                // Use the most recent moisture level
                currentMoisture: historyData[historyData.length - 1].moisture
              }));
              
              // Turn off simulation if we have real data
              if (historyData.length > 5) {
                setUseSimulation(false);
                console.log('Using real data, simulation disabled');
              }
            }
          }
        }
        
        setInitialLoadComplete(true);
      } catch (err) {
        console.error('Failed to load initial plant data:', err);
        setInitialLoadComplete(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialPlantData();
  }, [setUseSimulation]);

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
    isLoading,
    initialLoadComplete
  };
}
