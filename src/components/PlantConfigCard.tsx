
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarClock, Droplet, Settings, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WateringFrequency } from '@/hooks/usePlantDataTypes';
import { format } from 'date-fns';
import { getPlantById } from '@/data/plants';

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
  const { toast } = useToast();
  const [localRange, setLocalRange] = useState<[number, number]>(optimalRange);
  const [localCustomDays, setLocalCustomDays] = useState<number>(customWateringDays);
  const [showMoistureConfig, setShowMoistureConfig] = useState(false);
  
  // Update local state when profile changes
  useEffect(() => {
    setLocalRange(optimalRange);
    setLocalCustomDays(customWateringDays);
  }, [optimalRange, customWateringDays]);

  const selectedPlant = selectedPlantId ? getPlantById(selectedPlantId) : null;

  const frequencyLabels = {
    daily: 'Daily',
    twice_weekly: 'Twice Weekly',
    weekly: 'Weekly',
    biweekly: 'Biweekly',
    custom: 'Custom'
  };

  const handleFrequencyChange = (value: string) => {
    const frequency = value as WateringFrequency;
    onChangeFrequency(frequency);
    
    toast({
      title: "Watering Frequency Updated",
      description: `Set to ${frequencyLabels[frequency]}`
    });
  };

  const handleCustomDaysChange = (value: string) => {
    const days = parseInt(value, 10);
    if (!isNaN(days) && days > 0) {
      setLocalCustomDays(days);
    }
  };

  const applyCustomDays = () => {
    onChangeCustomDays(localCustomDays);
    toast({
      title: "Custom Schedule Updated",
      description: `Plant will be watered every ${localCustomDays} days`
    });
  };

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

  const formatNextWatering = () => {
    if (!nextScheduledWatering) return 'Not scheduled';
    const now = new Date();
    const diffDays = Math.round((nextScheduledWatering.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days (${format(nextScheduledWatering, 'MMM d')})`;
  };

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
        {selectedPlant && (
          <div className="p-3 bg-secondary/20 rounded-md flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <p className="text-sm">Settings from <span className="font-medium">{selectedPlant.name}</span> profile</p>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between mb-2">
            <Label>Watering Frequency</Label>
            <span className="text-sm text-muted-foreground">
              Next: {formatNextWatering()}
            </span>
          </div>
          
          <Select
            value={wateringFrequency}
            onValueChange={handleFrequencyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="twice_weekly">Twice Weekly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Biweekly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {wateringFrequency === 'custom' && (
          <div className="space-y-2 p-3 bg-secondary/20 rounded-md">
            <Label>Days Between Waterings</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max="60"
                value={localCustomDays}
                onChange={(e) => handleCustomDaysChange(e.target.value)}
              />
              <Button onClick={applyCustomDays} variant="secondary">Apply</Button>
            </div>
          </div>
        )}
        
        <div className={showMoistureConfig ? "space-y-4 pt-4 border-t" : "hidden"}>
          <div>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default PlantConfigCard;
