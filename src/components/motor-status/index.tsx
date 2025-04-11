
import React from 'react';
import { MotorStatus as MotorStatusType } from '@/hooks/usePlantDataTypes';
import MotorStatusCard from './MotorStatusCard';
import LastActionCard from './LastActionCard';
import DisconnectedStatusCard from './DisconnectedStatusCard';

interface MotorStatusProps {
  waterMotorStatus: MotorStatusType;
  fertilizerMotorStatus: MotorStatusType;
  lastWatered: Date | null;
  lastFertilized: Date | null;
  isArduinoConnected: boolean;
}

const MotorStatus: React.FC<MotorStatusProps> = ({
  waterMotorStatus,
  fertilizerMotorStatus,
  lastWatered,
  lastFertilized,
  isArduinoConnected
}) => {
  if (!isArduinoConnected) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DisconnectedStatusCard type="water" />
        <LastActionCard type="watered" lastActionDate={lastWatered} />
        <DisconnectedStatusCard type="fertilizer" />
        <LastActionCard type="fertilized" lastActionDate={lastFertilized} />
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <MotorStatusCard type="water" status={waterMotorStatus} />
      <LastActionCard type="watered" lastActionDate={lastWatered} />
      <MotorStatusCard type="fertilizer" status={fertilizerMotorStatus} />
      <LastActionCard type="fertilized" lastActionDate={lastFertilized} />
    </div>
  );
};

export default MotorStatus;
