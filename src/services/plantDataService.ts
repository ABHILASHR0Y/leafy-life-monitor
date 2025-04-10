
import { PlantProfile } from '@/data/plants';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Save moisture reading to database
export const saveMoistureReading = async (plantId: string, moistureLevel: number) => {
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
export const saveWateringEvent = async (plantId: string, eventType: 'water' | 'fertilizer', duration: number) => {
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

// Update plant in database
export const updatePlantInDatabase = async (plantId: string, updates: any) => {
  try {
    const { error } = await supabase
      .from('plants')
      .update(updates)
      .eq('id', plantId);
      
    if (error) {
      console.error('Error updating plant:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to update plant:', err);
    return false;
  }
};

// Load plant data from the database
export const loadPlantData = async () => {
  try {
    // Get plants from database
    const { data: plants, error } = await supabase
      .from('plants')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error loading plant data:', error);
      return null;
    }

    // If we have plants, return the first one
    if (plants && plants.length > 0) {
      return plants[0];
    }
    
    return null;
  } catch (err) {
    console.error('Failed to load plant data:', err);
    return null;
  }
};

// Load moisture history from database
export const loadMoistureHistory = async (plantId: string) => {
  try {
    const { data: readings, error } = await supabase
      .from('moisture_readings')
      .select('*')
      .eq('plant_id', plantId)
      .order('timestamp', { ascending: false })
      .limit(25);

    if (error) {
      console.error('Error loading moisture history:', error);
      return null;
    }

    // We need to find all watering events for correlation with moisture readings
    const { data: waterEvents } = await supabase
      .from('watering_events')
      .select('*')
      .eq('plant_id', plantId)
      .eq('event_type', 'water')
      .order('timestamp', { ascending: false })
      .limit(25);  // Increased limit to ensure we catch all relevant water events

    const { data: fertilizerEvents } = await supabase
      .from('watering_events')
      .select('*')
      .eq('plant_id', plantId)
      .eq('event_type', 'fertilizer')
      .order('timestamp', { ascending: false })
      .limit(25);  // Increased limit to ensure we catch all relevant fertilizer events

    return { readings: readings || [], waterEvents, fertilizerEvents };
  } catch (err) {
    console.error('Failed to load moisture history:', err);
    return null;
  }
};

// Load watering events from database
export const loadWateringEvents = async (plantId: string) => {
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
    }

    return { waterEvents, fertEvents };
  } catch (err) {
    console.error('Failed to load watering events:', err);
    return { waterEvents: null, fertEvents: null };
  }
};

// Check if plant exists in database, if not create it
export const ensurePlantExists = async (plant: PlantProfile) => {
  try {
    // Check if this plant exists in the database
    const { data: existingPlants, error: queryError } = await supabase
      .from('plants')
      .select('id')
      .eq('name', plant.name)
      .limit(1);
      
    if (queryError) {
      console.error('Error checking for existing plant:', queryError);
      return null;
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
        return null;
      }
      
      if (newPlant) {
        plantId = newPlant.id;
      }
    }
    
    return plantId;
  } catch (err) {
    console.error('Error ensuring plant exists:', err);
    return null;
  }
};
