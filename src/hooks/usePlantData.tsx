import { useState, useEffect, useCallback } from 'react';
import { PlantProfile } from '@/data/plants';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

export type MotorStatus = 'idle' | 'active' | 'error';
export type WateringMode = 'automatic' | 'manual';
export type WateringFrequency = 'daily' | 'twice_weekly' | 'weekly' | 'biweekly' | 'custom';

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
  wateringFrequency: WateringFrequency;
  customWateringDays: number; // days between waterings if custom frequency
  nextScheduledWatering: Date | null;
  selectedPlantId: string | null;
  historyData: Array<{
    timestamp: Date;
    moisture: number;
    waterMotor: boolean;
    fertilizerMotor: boolean;
  }>;
}

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

  const [useSimulation, setUseSimulation] = useState(true); // Enable simulation by default
  const [isLoading, setIsLoading] = useState(true);

  // Load selected plant from Supabase if it exists
  useEffect(() => {
    const loadPlantData = async () => {
      try {
        // Get plants from database
        const { data: plants, error } = await supabase
          .from('plants')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error loading plant data:', error);
          return;
        }

        // If we have plants, set the first one as selected
        if (plants && plants.length > 0) {
          const plant = plants[0];
          setData(prev => ({
            ...prev,
            selectedPlantId: plant.id,
            optimalRange: [plant.ideal_moisture_min, plant.ideal_moisture_max],
            wateringFrequency: plant.watering_frequency as WateringFrequency,
            customWateringDays: plant.custom_watering_days || prev.customWateringDays,
          }));

          // Load moisture history for this plant
          loadMoistureHistory(plant.id);
          
          // Load watering events for this plant
          loadWateringEvents(plant.id);
        }
      } catch (err) {
        console.error('Failed to load plant data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlantData();
  }, []);

  // Load moisture history from database
  const loadMoistureHistory = async (plantId: string) => {
    try {
      const { data: readings, error } = await supabase
        .from('moisture_readings')
        .select('*')
        .eq('plant_id', plantId)
        .order('timestamp', { ascending: false })
        .limit(25);

      if (error) {
        console.error('Error loading moisture history:', error);
        return;
      }

      if (readings && readings.length > 0) {
        // We need to find watering events to correlate with moisture readings
        const { data: waterEvents } = await supabase
          .from('watering_events')
          .select('*')
          .eq('plant_id', plantId)
          .eq('event_type', 'water')
          .order('timestamp', { ascending: false });

        const { data: fertilizerEvents } = await supabase
          .from('watering_events')
          .select('*')
          .eq('plant_id', plantId)
          .eq('event_type', 'fertilizer')
          .order('timestamp', { ascending: false });

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
    } catch (err) {
      console.error('Failed to load moisture history:', err);
    }
  };

  // Load watering events from database
  const loadWateringEvents = async (plantId: string) => {
    try {
      // Get most recent water event
      const { data: waterEvents, error: waterError } = await supabase
        .from('watering_events')
        .select('*')
        .eq('plant_id', plantId)
        .eq('event_type', 'water')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (waterError) {
        console.error('Error loading water events:', waterError);
      } else if (waterEvents && waterEvents.length > 0) {
        const lastWatered = new Date(waterEvents[0].timestamp as string);
        setData(prev => ({ ...prev, lastWatered }));
      }

      // Get most recent fertilizer event
      const { data: fertEvents, error: fertError } = await supabase
        .from('watering_events')
        .select('*')
        .eq('plant_id', plantId)
        .eq('event_type', 'fertilizer')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (fertError) {
        console.error('Error loading fertilizer events:', fertError);
      } else if (fertEvents && fertEvents.length > 0) {
        const lastFertilized = new Date(fertEvents[0].timestamp as string);
        setData(prev => ({ ...prev, lastFertilized }));
      }
    } catch (err) {
      console.error('Failed to load watering events:', err);
    }
  };

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
          saveMoistureReading(prev.selectedPlantId, arduinoData.moisture).catch(err => 
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
            saveWateringEvent(
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
            saveWateringEvent(
              prev.selectedPlantId, 
              'fertilizer', 
              prev.fertilizerDuration
            ).catch(err => console.error('Failed to save fertilizer event:', err));
          }
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

  // Save moisture reading to database
  const saveMoistureReading = async (plantId: string, moistureLevel: number) => {
    if (!plantId) return;
    
    try {
      const { error } = await supabase
        .from('moisture_readings')
        .insert({
          plant_id: plantId,
          moisture_level: moistureLevel
        });
        
      if (error) {
        console.error('Error saving moisture reading:', error);
      }
    } catch (err) {
      console.error('Failed to save moisture reading:', err);
    }
  };

  // Save watering or fertilizer event to database
  const saveWateringEvent = async (plantId: string, eventType: 'water' | 'fertilizer', duration: number) => {
    if (!plantId) return;
    
    try {
      const { error } = await supabase
        .from('watering_events')
        .insert({
          plant_id: plantId,
          event_type: eventType,
          duration: duration
        });
        
      if (error) {
        console.error(`Error saving ${eventType} event:`, error);
      }
    } catch (err) {
      console.error(`Failed to save ${eventType} event:`, err);
    }
  };

  // Generate mock historical data if no data in the database
  useEffect(() => {
    // If we have real data from the database or we're loading, don't generate simulation data
    if (data.historyData.length > 0 || isLoading) return;
    
    // Generate simulation data even if we're using real data
    // so we always have something to show
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
    setData(prev => {
      if (prev.historyData.length === 0 || useSimulation) {
        return { ...prev, historyData: history };
      }
      return prev;
    });
  }, [useSimulation, isLoading, data.historyData.length]);

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

  // Check if it's time to water based on frequency and moisture level
  useEffect(() => {
    if (!useSimulation || data.wateringMode !== 'automatic') return;
    
    const now = new Date();
    
    // Check if it's time to water based on schedule AND if moisture is below threshold
    if (data.nextScheduledWatering && 
        now >= data.nextScheduledWatering && 
        data.currentMoisture < data.optimalRange[0] && 
        data.waterMotorStatus === 'idle') {
      
      // Activate water motor
      setData(prev => ({
        ...prev,
        waterMotorStatus: 'active'
      }));
    }
  }, [data.currentMoisture, data.nextScheduledWatering, data.optimalRange, data.waterMotorStatus, data.wateringMode, useSimulation]);

  // Modified function to manually activate water motor
  const activateWaterMotor = useCallback(() => {
    setData(prev => {
      // Fix: Ensure we're using the correct MotorStatus type
      const newData = { ...prev, waterMotorStatus: 'active' as MotorStatus };
      
      // If a plant is selected, schedule saving the watering event when the motor stops
      if (prev.selectedPlantId) {
        // We'll save the event after the motor has run for the specified duration
        setTimeout(() => {
          saveWateringEvent(
            prev.selectedPlantId!, 
            'water', 
            prev.wateringDuration
          ).catch(err => console.error('Failed to save watering event:', err));
          
          // Also save a new moisture reading with increased level
          saveMoistureReading(
            prev.selectedPlantId!,
            Math.min(prev.currentMoisture + 15, 100)
          ).catch(err => console.error('Failed to save moisture reading:', err));
        }, prev.wateringDuration * 1000);
      }
      
      return newData;
    });
  }, []);

  // Modified function to manually activate fertilizer motor
  const activateFertilizerMotor = useCallback(() => {
    setData(prev => {
      // Fix: Ensure we're using the correct MotorStatus type
      const newData = { ...prev, fertilizerMotorStatus: 'active' as MotorStatus };
      
      // If a plant is selected, schedule saving the fertilizer event when the motor stops
      if (prev.selectedPlantId) {
        // We'll save the event after the motor has run for the specified duration
        setTimeout(() => {
          saveWateringEvent(
            prev.selectedPlantId!, 
            'fertilizer', 
            prev.fertilizerDuration
          ).catch(err => console.error('Failed to save fertilizer event:', err));
        }, prev.fertilizerDuration * 1000);
      }
      
      return newData;
    });
  }, []);

  // Modified function to toggle watering mode
  const toggleWateringMode = useCallback(() => {
    setData(prev => ({
      ...prev,
      wateringMode: prev.wateringMode === 'automatic' ? 'manual' : 'automatic'
    }));
  }, []);

  // Modified function to update watering duration
  const setWateringDuration = useCallback((duration: number) => {
    setData(prev => ({
      ...prev,
      wateringDuration: duration
    }));
  }, []);

  // Modified function to update fertilizer duration
  const setFertilizerDuration = useCallback((duration: number) => {
    setData(prev => ({
      ...prev,
      fertilizerDuration: duration
    }));
  }, []);

  // Modified function to update watering frequency
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
        updatePlantInDatabase(prev.selectedPlantId, {
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
  }, []);

  // Modified function to update custom watering days
  const setCustomWateringDays = useCallback((days: number) => {
    setData(prev => {
      // Only update next scheduled watering if frequency is custom
      const now = new Date();
      const nextDate = prev.wateringFrequency === 'custom' 
        ? new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
        : prev.nextScheduledWatering;
      
      // Update plant record in database if a plant is selected
      if (prev.selectedPlantId && prev.wateringFrequency === 'custom') {
        updatePlantInDatabase(prev.selectedPlantId, {
          custom_watering_days: days
        }).catch(err => console.error('Failed to update custom watering days:', err));
      }
        
      return {
        ...prev,
        customWateringDays: days,
        nextScheduledWatering: nextDate
      };
    });
  }, []);

  // Modified function to update optimal moisture range
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
      updatePlantInDatabase(data.selectedPlantId, {
        ideal_moisture_min: validRange[0],
        ideal_moisture_max: validRange[1]
      }).catch(err => console.error('Failed to update optimal moisture range:', err));
    }
    
    setData(prev => ({
      ...prev,
      optimalRange: validRange
    }));
  }, [data.selectedPlantId]);

  // Function to update plant in database
  const updatePlantInDatabase = async (plantId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('plants')
        .update(updates)
        .eq('id', plantId);
        
      if (error) {
        console.error('Error updating plant:', error);
        toast({
          title: "Update Failed",
          description: "Failed to save plant settings to database",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Failed to update plant:', err);
      toast({
        title: "Update Failed",
        description: "Failed to save plant settings to database",
        variant: "destructive"
      });
    }
  };

  // Modified function to set the selected plant profile
  const setSelectedPlant = useCallback(async (plant: PlantProfile) => {
    try {
      // Check if this plant exists in the database
      const { data: existingPlants, error: queryError } = await supabase
        .from('plants')
        .select('id')
        .eq('name', plant.name)
        .limit(1);
        
      if (queryError) {
        console.error('Error checking for existing plant:', queryError);
        return;
      }
      
      let plantId = existingPlants?.[0]?.id;
      
      // If plant doesn't exist in database, create it
      if (!existingPlants || existingPlants.length === 0) {
        const { data: newPlant, error: insertError } = await supabase
          .from('plants')
          .insert({
            name: plant.name,
            ideal_moisture_min: plant.idealMoistureRange[0],
            ideal_moisture_max: plant.idealMoistureRange[1],
            watering_frequency: plant.wateringFrequency,
            custom_watering_days: plant.customWateringDays || 3
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating plant:', insertError);
          toast({
            title: "Plant Creation Failed",
            description: "Could not save new plant to database",
            variant: "destructive"
          });
          return;
        }
        
        if (newPlant) {
          plantId = newPlant.id;
        
          toast({
            title: "Plant Profile Created",
            description: `${plant.name} has been saved to database`
          });
        }
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
      
      if (plantId) {
        // Load history data for this plant
        loadMoistureHistory(plantId);
        loadWateringEvents(plantId);
        
        setData(prev => ({
          ...prev,
          selectedPlantId: plantId,
          optimalRange: plant.idealMoistureRange,
          wateringFrequency: plant.wateringFrequency,
          customWateringDays: plant.customWateringDays || prev.customWateringDays,
          nextScheduledWatering: nextDate
        }));
        
        toast({
          title: "Plant Profile Loaded",
          description: `${plant.name} has been loaded from database`
        });
      }
    } catch (err) {
      console.error('Error setting selected plant:', err);
    }
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
    useSimulation, // Expose the simulation state
    isMoistureCritical,
    isLoading
  };
}
