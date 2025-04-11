
import React from 'react';
import PlantConfigCard from '../PlantConfigCard';
import { WateringFrequency } from '@/hooks/usePlantDataTypes';

interface DashboardConfigSectionProps {
  optimalRange: [number, number];
  wateringFrequency: WateringFrequency;
  customWateringDays: number;
  nextScheduledWatering: Date | null;
  selectedPlantId: string | null;
  onChangeFrequency: (frequency: WateringFrequency) => void;
  onChangeCustomDays: (days: number) => void;
  onChangeMoistureRange: (range: [number, number]) => void;
}

const DashboardConfigSection: React.FC<DashboardConfigSectionProps> = ({
  optimalRange,
  wateringFrequency,
  customWateringDays,
  nextScheduledWatering,
  selectedPlantId,
  onChangeFrequency,
  onChangeCustomDays,
  onChangeMoistureRange
}) => {
  return (
    <div className="mt-6">
      <PlantConfigCard
        optimalRange={optimalRange}
        wateringFrequency={wateringFrequency}
        customWateringDays={customWateringDays}
        nextScheduledWatering={nextScheduledWatering}
        onChangeFrequency={onChangeFrequency}
        onChangeCustomDays={onChangeCustomDays}
        onChangeMoistureRange={onChangeMoistureRange}
        selectedPlantId={selectedPlantId}
      />
    </div>
  );
};

export default DashboardConfigSection;
