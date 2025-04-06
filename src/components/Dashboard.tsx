
import React, { useCallback } from 'react';
import MoistureGauge from './MoistureGauge';
import ControlPanel from './ControlPanel';
import HistoryChart from './HistoryChart';
import MotorStatus from './MotorStatus';
import NotificationSystem from './NotificationSystem';
import ArduinoConnection from './ArduinoConnection';
import { usePlantData } from '@/hooks/usePlantData';
import { Leaf } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    data, 
    activateWaterMotor, 
    activateFertilizerMotor, 
    toggleWateringMode,
    setWateringDuration,
    setFertilizerDuration,
    isMoistureCritical,
    updateFromArduino 
  } = usePlantData();
  
  // Handle real data from Arduino
  const handleArduinoData = useCallback((arduinoData: any) => {
    if (arduinoData) {
      updateFromArduino(arduinoData);
    }
  }, [updateFromArduino]);

  // Forward commands to Arduino via hook
  const handleSendCommand = useCallback(async (command: string): Promise<boolean> => {
    console.log('Command forwarded to Arduino:', command);
    // This function is called after the actual command is sent to Arduino
    // We can use it to update UI or handle command-specific logic
    return true;
  }, []);
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Leaf className="h-6 w-6 text-plant" />
          Plant Dashboard
        </h2>
        
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Status Cards */}
      <MotorStatus 
        waterMotorStatus={data.waterMotorStatus}
        fertilizerMotorStatus={data.fertilizerMotorStatus}
        lastWatered={data.lastWatered}
        lastFertilized={data.lastFertilized}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        <MoistureGauge 
          currentMoisture={data.currentMoisture} 
          optimalRange={data.optimalRange} 
        />
        
        <ControlPanel 
          waterMotorStatus={data.waterMotorStatus}
          fertilizerMotorStatus={data.fertilizerMotorStatus}
          wateringMode={data.wateringMode}
          wateringDuration={data.wateringDuration}
          fertilizerDuration={data.fertilizerDuration}
          onActivateWater={activateWaterMotor}
          onActivateFertilizer={activateFertilizerMotor}
          onToggleMode={toggleWateringMode}
          onChangeWaterDuration={setWateringDuration}
          onChangeFertilizerDuration={setFertilizerDuration}
          lastWatered={data.lastWatered}
          lastFertilized={data.lastFertilized}
        />
        
        <HistoryChart data={data.historyData} />
      </div>
      
      {/* Arduino Connection Card */}
      <div className="mt-6">
        <ArduinoConnection 
          onDataReceived={handleArduinoData}
          onSendCommand={handleSendCommand}
        />
      </div>
      
      {/* Invisible notification system */}
      <NotificationSystem 
        isMoistureCritical={isMoistureCritical} 
        moistureLevel={data.currentMoisture}
      />
    </div>
  );
};

export default Dashboard;
