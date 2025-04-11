
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Droplet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MoistureRangeSliderProps {
  optimalRange: [number, number];
  onChangeMoistureRange: (range: [number, number]) => void;
}

const MoistureRangeSlider: React.FC<MoistureRangeSliderProps> = ({
  optimalRange,
  onChangeMoistureRange
}) => {
  const { toast } = useToast();
  const [localRange, setLocalRange] = useState<[number, number]>(optimalRange);
  
  // Update local state when profile changes
  useEffect(() => {
    setLocalRange(optimalRange);
  }, [optimalRange]);

  const handleRangeChange = (values: number[]) => {
    setLocalRange([values[0], values[1]]);
  };

  const applyMoistureRange = () => {
    onChangeMoistureRange(localRange);
    toast({
      title: "Moisture Range Updated",
      description: `Optimal range set to ${localRange[0]}%-${localRange[1]}%`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-2">
        <Label className="flex items-center gap-1">
          <Droplet className="h-4 w-4 text-plant-water" />
          Optimal Moisture Range
        </Label>
        <span className="text-sm text-muted-foreground">
          {localRange[0]}% - {localRange[1]}%
        </span>
      </div>
      
      <div className="pt-4 pb-2">
        <Slider
          defaultValue={[localRange[0], localRange[1]]}
          max={100}
          step={1}
          value={[localRange[0], localRange[1]]}
          onValueChange={handleRangeChange}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Dry (0%)</span>
        <span>Optimal</span>
        <span>Wet (100%)</span>
      </div>
      
      <Button 
        onClick={applyMoistureRange} 
        variant="secondary" 
        className="w-full mt-2"
      >
        Apply Moisture Range
      </Button>
    </div>
  );
};

export default MoistureRangeSlider;
