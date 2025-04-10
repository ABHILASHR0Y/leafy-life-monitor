
import { useCallback } from 'react';
import { PlantProfile } from '@/data/plants';
import { PlantData, WateringFrequency, MotorStatus } from './usePlantDataTypes';
import { useToast } from '@/hooks/use-toast';
import * as plantDataService from '@/services/plantDataService';

export function usePlantOperations(
  data: PlantData,
  setData: React.Dispatch<React.SetStateAction<PlantData>>
) {
  const { toast } = useToast();
  
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

  return {
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
  };
}
