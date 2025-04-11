
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, Settings } from 'lucide-react';
import { WateringFrequency } from '@/hooks/usePlantDataTypes';
import FrequencySelector from './plant-config/FrequencySelector';
import CustomWateringDays from './plant-config/CustomWateringDays';
import MoistureRangeSlider from './plant-config/MoistureRangeSlider';
import PlantProfileInfo from './plant-config/PlantProfileInfo';

interface PlantConfigCardProps {
  optimalRange: [number, number];
  wateringFrequency: WateringFrequency;
  customWateringDays: number;
  nextScheduledWatering: Date | null;
  onChangeFrequency: (frequency: WateringFrequency) => void;
  onChangeCustomDays: (days: number) => void;
  onChangeMoistureRange: (range: [number, number]) => void;
  selectedPlantId: string | null;
}

const PlantConfigCard: React.FC<PlantConfigCardProps> = ({
  optimalRange,
  wateringFrequency,
  customWateringDays,
  nextScheduledWatering,
  onChangeFrequency,
  onChangeCustomDays,
  onChangeMoistureRange,
  selectedPlantId
}) => {
  const [showMoistureConfig, setShowMoistureConfig] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          Plant Configuration
        </CardTitle>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowMoistureConfig(!showMoistureConfig)}
          className={showMoistureConfig ? "bg-secondary" : ""}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="grid gap-4">
        <PlantProfileInfo selectedPlantId={selectedPlantId} />
        
        <FrequencySelector
          wateringFrequency={wateringFrequency}
          nextScheduledWatering={nextScheduledWatering}
          onChangeFrequency={onChangeFrequency}
        />
        
        {wateringFrequency === 'custom' && (
          <CustomWateringDays
            customWateringDays={customWateringDays}
            onChangeCustomDays={onChangeCustomDays}
          />
        )}
        
        <div className={showMoistureConfig ? "space-y-4 pt-4 border-t" : "hidden"}>
          <MoistureRangeSlider
            optimalRange={optimalRange}
            onChangeMoistureRange={onChangeMoistureRange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PlantConfigCard;
