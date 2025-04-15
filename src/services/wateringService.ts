
import { supabase } from '@/integrations/supabase/client';

// Save watering or fertilizer event to database
export const saveWateringEvent = async (plantId: string, eventType: 'water' | 'fertilizer', duration: number) => {
  if (!plantId) {
    console.error('Cannot save watering event: No plant ID provided');
    return { success: false, error: 'No plant ID provided' };
  }
  
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
      return { success: false, error: error.message };
    } else {
      console.log(`Successfully saved ${eventType} event for plant ${plantId}`);
      return { success: true };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Failed to save ${eventType} event:`, errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Load watering events from database
export const loadWateringEvents = async (plantId: string) => {
  if (!plantId) {
    console.error('Cannot load watering events: No plant ID provided');
    return { waterEvents: [], fertEvents: [], success: false, error: 'No plant ID provided' };
  }
  
  try {
    // Get most recent water event
    const { data: waterEvents, error: waterError } = await supabase
      .from('watering_events')
      .select('*')
      .eq('plant_id', plantId)
      .eq('event_type', 'water')
      .order('timestamp', { ascending: false })
      .limit(10); // Increased limit to get more history

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
      .limit(10); // Increased limit to get more history

    if (fertError) {
      console.error('Error loading fertilizer events:', fertError);
    }

    return { 
      waterEvents: waterEvents || [], 
      fertEvents: fertEvents || [],
      success: !(waterError || fertError),
      error: waterError ? waterError.message : (fertError ? fertError.message : null)
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to load watering events:', errorMessage);
    return { 
      waterEvents: [], 
      fertEvents: [],
      success: false,
      error: errorMessage
    };
  }
};
