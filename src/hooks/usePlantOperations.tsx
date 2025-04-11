
import { PlantData } from './usePlantDataTypes';
import { PlantProfile } from '@/data/plants';
import { useArduinoOperations } from './useArduinoOperations';
import { useMotorOperations } from './useMotorOperations';
import { useWateringSchedule } from './useWateringSchedule';
import { usePlantSelection } from './usePlantSelection';

export function usePlantOperations(
  data: PlantData,
  setData: React.Dispatch<React.SetStateAction<PlantData>>
) {
  const { updateFromArduino } = useArduinoOperations(setData);
  
  const {
    activateWaterMotor,
    activateFertilizerMotor,
    toggleWateringMode,
    setWateringDuration,
    setFertilizerDuration
  } = useMotorOperations(data, setData);
  
  const {
    setWateringFrequency,
    setCustomWateringDays,
    setOptimalMoistureRange
  } = useWateringSchedule(data, setData);
  
  const { setSelectedPlant } = usePlantSelection(setData);

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
