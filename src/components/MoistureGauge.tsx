
import React, { useMemo } from 'react';
import { Droplet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MoistureGaugeProps {
  currentMoisture: number;
  optimalRange: [number, number];
}

const MoistureGauge: React.FC<MoistureGaugeProps> = ({ 
  currentMoisture, 
  optimalRange 
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
    if (currentMoisture < optimalRange[0] * 0.7) {
      toast({
        title: 'Low Moisture Alert!',
        description: 'Your plant is very dry and needs water soon.',
        variant: 'destructive',
      });
    }
  }, [currentMoisture, optimalRange, toast]);

  // Calculate angle for gauge needle (from -90 to 90 degrees)
  const needleAngle = -90 + (180 * gaugePosition / 100);

  return (
    <div className="card-dashboard">
      <h3 className="text-xl font-semibold mb-3 flex items-center justify-center gap-2">
        <Droplet className={`h-5 w-5 ${getMoistureColor}`} />
        Soil Moisture
      </h3>
      
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
