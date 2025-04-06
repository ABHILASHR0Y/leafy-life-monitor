
import React, { useState } from 'react';
import { Droplet, Flask, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MotorStatus } from '@/hooks/usePlantData';
import { useToast } from '@/hooks/use-toast';

interface ControlPanelProps {
  waterMotorStatus: MotorStatus;
  fertilizerMotorStatus: MotorStatus;
  onActivateWater: () => void;
  onActivateFertilizer: () => void;
  lastWatered: Date | null;
  lastFertilized: Date | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  waterMotorStatus,
  fertilizerMotorStatus,
  onActivateWater,
  onActivateFertilizer,
  lastWatered,
  lastFertilized
}) => {
  const { toast } = useToast();
  const [isWaterConfirmOpen, setIsWaterConfirmOpen] = useState(false);
  const [isFertilizerConfirmOpen, setIsFertilizerConfirmOpen] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const handleWaterActivate = () => {
    if (waterMotorStatus !== 'idle') {
      toast({
        title: "Motor Busy",
        description: "Water motor is currently busy. Please wait.",
        variant: "default",
      });
      return;
    }
    
    if (isWaterConfirmOpen) {
      onActivateWater();
      setIsWaterConfirmOpen(false);
      toast({
        title: "Water Motor Activated",
        description: "The water motor has been turned on.",
      });
    } else {
      setIsWaterConfirmOpen(true);
      setTimeout(() => setIsWaterConfirmOpen(false), 3000); // Auto reset after 3 seconds
    }
  };

  const handleFertilizerActivate = () => {
    if (fertilizerMotorStatus !== 'idle') {
      toast({
        title: "Motor Busy",
        description: "Fertilizer motor is currently busy. Please wait.",
        variant: "default",
      });
      return;
    }
    
    if (isFertilizerConfirmOpen) {
      onActivateFertilizer();
      setIsFertilizerConfirmOpen(false);
      toast({
        title: "Fertilizer Motor Activated",
        description: "The fertilizer motor has been turned on.",
      });
    } else {
      setIsFertilizerConfirmOpen(true);
      setTimeout(() => setIsFertilizerConfirmOpen(false), 3000); // Auto reset after 3 seconds
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Motor Controls</span>
          {(waterMotorStatus === 'active' || fertilizerMotorStatus === 'active') && (
            <span className="text-sm text-plant bg-secondary py-1 px-2 rounded-full animate-pulse-gentle">
              Motors Active
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Water Motor Control */}
        <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-plant-water" />
              <h3 className="font-medium">Water Motor</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                waterMotorStatus === 'active' ? 'bg-green-500 animate-pulse-gentle' :
                waterMotorStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-xs capitalize">{waterMotorStatus}</span>
            </div>
          </div>
          
          <div className="text-sm mb-4">
            <p>Last activated: <span className="font-medium">{formatDate(lastWatered)}</span></p>
          </div>
          
          <Button 
            className={`w-full ${waterMotorStatus === 'active' ? 'opacity-50 cursor-not-allowed' : ''} ${
              isWaterConfirmOpen ? 'bg-red-500 hover:bg-red-600' : 'btn-water'
            }`}
            onClick={handleWaterActivate}
            disabled={waterMotorStatus === 'active' || waterMotorStatus === 'error'}
          >
            {isWaterConfirmOpen ? (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Confirm Activation
              </span>
            ) : 'Activate Water'}
          </Button>
        </div>
        
        {/* Fertilizer Motor Control */}
        <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20 dark:to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flask className="h-5 w-5 text-plant-fertilizer" />
              <h3 className="font-medium">Fertilizer Motor</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                fertilizerMotorStatus === 'active' ? 'bg-green-500 animate-pulse-gentle' :
                fertilizerMotorStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-xs capitalize">{fertilizerMotorStatus}</span>
            </div>
          </div>
          
          <div className="text-sm mb-4">
            <p>Last activated: <span className="font-medium">{formatDate(lastFertilized)}</span></p>
          </div>
          
          <Button 
            className={`w-full ${fertilizerMotorStatus === 'active' ? 'opacity-50 cursor-not-allowed' : ''} ${
              isFertilizerConfirmOpen ? 'bg-red-500 hover:bg-red-600' : 'btn-fertilizer'
            }`}
            onClick={handleFertilizerActivate}
            disabled={fertilizerMotorStatus === 'active' || fertilizerMotorStatus === 'error'}
          >
            {isFertilizerConfirmOpen ? (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Confirm Activation
              </span>
            ) : 'Activate Fertilizer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
