
import React from 'react';
import MoistureGauge from '../MoistureGauge';
import ControlPanel from '../ControlPanel';
import HistoryChart from '../HistoryChart';
import { MotorStatus as MotorStatusType, WateringMode } from '@/hooks/usePlantDataTypes';

interface DashboardMainContentProps {
  currentMoisture: number;
  optimalRange: [number, number];
  waterMotorStatus: MotorStatusType;
  fertilizerMotorStatus: MotorStatusType;
  wateringMode: WateringMode;
  wateringDuration: number;
  fertilizerDuration: number;
  lastWatered: Date | null;
  lastFertilized: Date | null;
  historyData: Array<{
    timestamp: Date;
    moisture: number;
    waterMotor: boolean;
    fertilizerMotor: boolean;
  }>;
  isArduinoConnected: boolean;
  onActivateWater: () => void;
  onActivateFertilizer: () => void;
  onToggleMode: () => void;
  onChangeWaterDuration: (value: number) => void;
  onChangeFertilizerDuration: (value: number) => void;
  onRefreshData: () => void;
  isLoading: boolean;
}

const DashboardMainContent: React.FC<DashboardMainContentProps> = ({
  currentMoisture,
  optimalRange,
  waterMotorStatus,
  fertilizerMotorStatus,
  wateringMode,
  wateringDuration,
  fertilizerDuration,
  lastWatered,
  lastFertilized,
  historyData,
  isArduinoConnected,
  onActivateWater,
  onActivateFertilizer,
  onToggleMode,
  onChangeWaterDuration,
  onChangeFertilizerDuration,
  onRefreshData,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
      <MoistureGauge 
        currentMoisture={currentMoisture} 
        optimalRange={optimalRange}
        isArduinoConnected={isArduinoConnected}
      />
      
      <ControlPanel 
        waterMotorStatus={waterMotorStatus}
        fertilizerMotorStatus={fertilizerMotorStatus}
        wateringMode={wateringMode}
        wateringDuration={wateringDuration}
        fertilizerDuration={fertilizerDuration}
        onActivateWater={onActivateWater}
        onActivateFertilizer={onActivateFertilizer}
        onToggleMode={onToggleMode}
        onChangeWaterDuration={onChangeWaterDuration}
        onChangeFertilizerDuration={onChangeFertilizerDuration}
        lastWatered={lastWatered}
        lastFertilized={lastFertilized}
        isArduinoConnected={isArduinoConnected}
      />
      
      <HistoryChart 
        data={historyData} 
        isArduinoConnected={isArduinoConnected}
        onRefresh={onRefreshData}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardMainContent;
