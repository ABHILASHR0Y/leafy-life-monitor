
import { supabase } from '@/integrations/supabase/client';

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
