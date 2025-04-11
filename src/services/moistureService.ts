
import { supabase } from '@/integrations/supabase/client';

// Save moisture reading to database
export const saveMoistureReading = async (plantId: string, moistureLevel: number) => {
  if (!plantId) {
    console.error('Cannot save moisture reading: No plant ID provided');
    return;
  }
  
  try {
    const { error } = await supabase
      .from('moisture_readings')
      .insert({
        plant_id: plantId,
        moisture_level: moistureLevel
      });
      
    if (error) {
      console.error('Error saving moisture reading:', error);
    } else {
      console.log(`Successfully saved moisture reading (${moistureLevel}%) for plant ${plantId}`);
    }
  } catch (err) {
    console.error('Failed to save moisture reading:', err);
  }
};

// Load moisture history from database
export const loadMoistureHistory = async (plantId: string) => {
  if (!plantId) {
    console.error('Cannot load moisture history: No plant ID provided');
    return { readings: [], waterEvents: [], fertilizerEvents: [] };
  }
  
  try {
    // Get recent moisture readings, ordered by time
    const { data: readings, error } = await supabase
      .from('moisture_readings')
      .select('*')
      .eq('plant_id', plantId)
      .order('timestamp', { ascending: true }) // Changed to ascending for proper timeline
      .limit(50); // Increased to show more history

    if (error) {
      console.error('Error loading moisture history:', error);
      return { readings: [], waterEvents: [], fertilizerEvents: [] };
    }

    // We need to find all watering events for correlation with moisture readings
    const { data: waterEvents, error: waterError } = await supabase
      .from('watering_events')
      .select('*')
      .eq('plant_id', plantId)
      .eq('event_type', 'water')
      .order('timestamp', { ascending: true })
      .limit(50);  
      
    if (waterError) {
      console.error('Error loading water events:', waterError);
    }

    const { data: fertilizerEvents, error: fertError } = await supabase
      .from('watering_events')
      .select('*')
      .eq('plant_id', plantId)
      .eq('event_type', 'fertilizer')
      .order('timestamp', { ascending: true })
      .limit(50);
      
    if (fertError) {
      console.error('Error loading fertilizer events:', fertError);
    }

    return { 
      readings: readings || [], 
      waterEvents: waterEvents || [],
      fertilizerEvents: fertilizerEvents || []
    };
  } catch (err) {
    console.error('Failed to load moisture history:', err);
    return { readings: [], waterEvents: [], fertilizerEvents: [] };
  }
};
