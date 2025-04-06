
import React, { useState } from 'react';
import { Droplet, Beaker, AlertCircle, Clock, Settings, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MotorStatus, WateringMode } from '@/hooks/usePlantData';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ControlPanelProps {
  waterMotorStatus: MotorStatus;
  fertilizerMotorStatus: MotorStatus;
  wateringMode: WateringMode;
  wateringDuration: number;
  fertilizerDuration: number;
  onActivateWater: () => void;
  onActivateFertilizer: () => void;
  onToggleMode: () => void;
  onChangeWaterDuration: (duration: number) => void;
  onChangeFertilizerDuration: (duration: number) => void;
  lastWatered: Date | null;
  lastFertilized: Date | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  waterMotorStatus,
  fertilizerMotorStatus,
  wateringMode,
  wateringDuration,
  fertilizerDuration,
  onActivateWater,
  onActivateFertilizer,
  onToggleMode,
  onChangeWaterDuration,
  onChangeFertilizerDuration,
  lastWatered,
  lastFertilized
}) => {
  const { toast } = useToast();
  const [isWaterConfirmOpen, setIsWaterConfirmOpen] = useState(false);
  const [isFertilizerConfirmOpen, setIsFertilizerConfirmOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
        description: `The water motor has been turned on for ${wateringDuration} seconds.`,
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
        description: `The fertilizer motor has been turned on for ${fertilizerDuration} seconds.`,
      });
    } else {
      setIsFertilizerConfirmOpen(true);
      setTimeout(() => setIsFertilizerConfirmOpen(false), 3000); // Auto reset after 3 seconds
    }
  };

  const handleModeToggle = () => {
    onToggleMode();
    toast({
      title: "Watering Mode Changed",
      description: `Mode set to ${wateringMode === 'automatic' ? 'manual' : 'automatic'}.`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span>Motor Controls</span>
          {(waterMotorStatus === 'active' || fertilizerMotorStatus === 'active') && (
            <span className="text-sm text-plant bg-secondary py-1 px-2 rounded-full animate-pulse-gentle">
              Motors Active
            </span>
          )}
        </CardTitle>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setShowSettings(!showSettings)}
          className={showSettings ? "bg-secondary" : ""}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      {showSettings && (
        <div className="px-6 pb-4 border-b">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-plant" />
                <Label htmlFor="auto-mode">Automatic Watering</Label>
              </div>
              <Switch 
                id="auto-mode" 
                checked={wateringMode === 'automatic'} 
                onCheckedChange={handleModeToggle}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="water-duration" className="text-sm flex items-center gap-1 mb-2">
                  <Clock className="h-3 w-3" /> Water Duration
                </Label>
                <Select 
                  value={wateringDuration.toString()} 
                  onValueChange={(val) => onChangeWaterDuration(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="fertilizer-duration" className="text-sm flex items-center gap-1 mb-2">
                  <Clock className="h-3 w-3" /> Fertilizer Duration
                </Label>
                <Select 
                  value={fertilizerDuration.toString()} 
                  onValueChange={(val) => onChangeFertilizerDuration(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        {/* Water Motor Control */}
        <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-plant-water" />
              <h3 className="font-medium">Water Motor</h3>
              {wateringMode === 'automatic' && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
                  Auto
                </span>
              )}
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
            <p className="text-xs text-muted-foreground mt-1">Duration: {wateringDuration} seconds</p>
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
              <Beaker className="h-5 w-5 text-plant-fertilizer" />
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
            <p className="text-xs text-muted-foreground mt-1">Duration: {fertilizerDuration} seconds</p>
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
