
import React from 'react';
import { Info } from 'lucide-react';
import { getPlantById } from '@/data/plants';

interface PlantProfileInfoProps {
  selectedPlantId: string | null;
}

const PlantProfileInfo: React.FC<PlantProfileInfoProps> = ({
  selectedPlantId
}) => {
  const selectedPlant = selectedPlantId ? getPlantById(selectedPlantId) : null;

  if (!selectedPlant) {
    return null;
  }

  return (
    <div className="p-3 bg-secondary/20 rounded-md flex items-center gap-2">
      <Info className="h-4 w-4 text-primary" />
      <p className="text-sm">Settings from <span className="font-medium">{selectedPlant.name}</span> profile</p>
    </div>
  );
};

export default PlantProfileInfo;
