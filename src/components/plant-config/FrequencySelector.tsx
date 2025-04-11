
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarClock } from 'lucide-react';
import { WateringFrequency } from '@/hooks/usePlantDataTypes';
import { format } from 'date-fns';

interface FrequencySelectorProps {
  wateringFrequency: WateringFrequency;
  nextScheduledWatering: Date | null;
  onChangeFrequency: (frequency: WateringFrequency) => void;
}

const FrequencySelector: React.FC<FrequencySelectorProps> = ({
  wateringFrequency,
  nextScheduledWatering,
  onChangeFrequency
}) => {
  const frequencyLabels = {
    daily: 'Daily',
    twice_weekly: 'Twice Weekly',
    weekly: 'Weekly',
    biweekly: 'Biweekly',
    custom: 'Custom'
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

  const handleFrequencyChange = (value: string) => {
    const frequency = value as WateringFrequency;
    onChangeFrequency(frequency);
  };

  return (
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
  );
};

export default FrequencySelector;
