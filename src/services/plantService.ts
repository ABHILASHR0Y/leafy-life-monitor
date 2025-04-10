
import { PlantProfile } from '@/data/plants';
import { supabase } from '@/integrations/supabase/client';

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
