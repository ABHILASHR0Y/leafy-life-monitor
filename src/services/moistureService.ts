
import { supabase } from '@/integrations/supabase/client';

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
