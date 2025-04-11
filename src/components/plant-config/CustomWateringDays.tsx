
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CustomWateringDaysProps {
  customWateringDays: number;
  onChangeCustomDays: (days: number) => void;
}

const CustomWateringDays: React.FC<CustomWateringDaysProps> = ({
  customWateringDays,
  onChangeCustomDays
}) => {
  const { toast } = useToast();
  const [localCustomDays, setLocalCustomDays] = useState<number>(customWateringDays);
  
  // Update local state when profile changes
  useEffect(() => {
    setLocalCustomDays(customWateringDays);
  }, [customWateringDays]);

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

  return (
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
  );
};

export default CustomWateringDays;
