
import React, { useMemo } from 'react';
import { Droplet, WifiOff, CircleDot, CircleX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface MoistureGaugeProps {
  currentMoisture: number;
  optimalRange: [number, number];
  isArduinoConnected: boolean;
}

const MoistureGauge: React.FC<MoistureGaugeProps> = ({ 
  currentMoisture, 
  optimalRange,
  isArduinoConnected
}) => {
  const { toast } = useToast();
  
  // Calculate the position on the gauge (0 to 100%)
  const gaugePosition = Math.min(100, Math.max(0, currentMoisture));
  
  // Determine the color based on moisture level
  const getMoistureColor = useMemo(() => {
    if (currentMoisture < optimalRange[0] * 0.7) return 'text-moisture-dry';
    if (currentMoisture < optimalRange[0]) return 'text-moisture-medium';
    if (currentMoisture <= optimalRange[1]) return 'text-moisture-optimal';
    return 'text-moisture-excess';
  }, [currentMoisture, optimalRange]);

  // Get the status text
  const statusText = useMemo(() => {
    if (currentMoisture < optimalRange[0] * 0.7) return 'Very Dry!';
    if (currentMoisture < optimalRange[0]) return 'Dry';
    if (currentMoisture <= optimalRange[1]) return 'Optimal';
    return 'Too Wet';
  }, [currentMoisture, optimalRange]);

  // Show toast when moisture is critically low
  React.useEffect(() => {
    if (isArduinoConnected && currentMoisture < optimalRange[0] * 0.7) {
      toast({
        title: 'Low Moisture Alert!',
        description: 'Your plant is very dry and needs water soon.',
        variant: 'destructive',
      });
    }
  }, [currentMoisture, optimalRange, toast, isArduinoConnected]);

  // Calculate angle for gauge needle (from -90 to 90 degrees)
  const needleAngle = -90 + (180 * gaugePosition / 100);

  // If Arduino is disconnected, show a disconnected state
  if (!isArduinoConnected) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="h-full flex flex-col items-center justify-center p-6">
          <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Moisture Sensor Disconnected</h3>
          <p className="text-sm text-muted-foreground text-center">
            Connect your Arduino to view real-time soil moisture data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="card-dashboard">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Droplet className={`h-5 w-5 ${getMoistureColor}`} />
          Soil Moisture
        </h3>
        <div className="flex items-center gap-1">
          <CircleDot className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-500 font-medium">Sensor Available</span>
        </div>
      </div>
      
      <div className="gauge-container">
        {/* Gauge background */}
        <div className="absolute inset-0 h-full w-full bg-secondary rounded-full overflow-hidden" style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0% 100%)' }}></div>
        
        {/* Gauge color sections */}
        <div className="absolute inset-0 h-full w-full" style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0% 100%)' }}>
          <div className="absolute inset-0 bg-moisture-dry" style={{ clipPath: 'polygon(0 50%, 33% 50%, 33% 100%, 0 100%)' }}></div>
          <div className="absolute inset-0 bg-moisture-medium" style={{ clipPath: 'polygon(33% 50%, 50% 50%, 50% 100%, 33% 100%)' }}></div>
          <div className="absolute inset-0 bg-moisture-optimal" style={{ clipPath: 'polygon(50% 50%, 83% 50%, 83% 100%, 50% 100%)' }}></div>
          <div className="absolute inset-0 bg-moisture-excess" style={{ clipPath: 'polygon(83% 50%, 100% 50%, 100% 100%, 83% 100%)' }}></div>
        </div>
        
        {/* Center point */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-foreground rounded-full z-10"></div>
        
        {/* Needle */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 origin-bottom w-1 h-[80px] bg-foreground rounded-t-full z-10" 
             style={{ transform: `translateX(-50%) rotate(${needleAngle}deg)` }}></div>
        
        {/* Value display */}
        <div className="absolute bottom-9 left-1/2 transform -translate-x-1/2 text-center z-10">
          <span className="text-2xl font-bold">{Math.round(currentMoisture)}%</span>
          <p className={`text-sm font-medium ${getMoistureColor}`}>{statusText}</p>
        </div>
        
        {/* Markers */}
        <div className="absolute bottom-1 left-[10%] text-xs">0%</div>
        <div className="absolute bottom-1 left-[90%] text-xs">100%</div>
        
        {/* Optimal range marker */}
        <div className="absolute bottom-[10px] left-1/2 transform -translate-x-1/2 text-xs">
          <span className="text-plant-dark">Optimal: {optimalRange[0]}-{optimalRange[1]}%</span>
        </div>
      </div>
    </div>
  );
};

export default MoistureGauge;
