
import React, { useCallback, useState, useEffect } from 'react';
import MoistureGauge from './MoistureGauge';
import ControlPanel from './ControlPanel';
import HistoryChart from './HistoryChart';
import MotorStatus from './MotorStatus';
import NotificationSystem from './NotificationSystem';
import ArduinoConnection from './ArduinoConnection';
import PlantConfigCard from './PlantConfigCard';
import PlantProfileSelector from './PlantProfileSelector';
import { usePlantData } from '@/hooks/usePlantData';
import { useArduinoSerial } from '@/hooks/useArduinoSerial';
import { Leaf, Database } from 'lucide-react';
import { PlantProfile } from '@/data/plants';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const { isConnected } = useArduinoSerial();
  const { toast } = useToast();
  
  const { 
    data, 
    activateWaterMotor, 
    activateFertilizerMotor, 
    toggleWateringMode,
    setWateringDuration,
    setFertilizerDuration,
    setWateringFrequency,
    setCustomWateringDays,
    setOptimalMoistureRange,
    setSelectedPlant,
    isMoistureCritical,
    updateFromArduino,
    setUseSimulation,
    useSimulation,
    isLoading
  } = usePlantData();
  
  // Update plant data hook when Arduino connection changes
  useEffect(() => {
    // If not using simulation and not connected, we use simulation data
    if (!useSimulation && !isConnected) {
      // This is handled in the MoistureGauge component now
    }
  }, [isConnected, setUseSimulation, useSimulation]);
  
  // Handle real data from Arduino
  const handleArduinoData = useCallback((arduinoData: any) => {
    if (arduinoData && isConnected) {
      updateFromArduino(arduinoData);
    }
  }, [updateFromArduino, isConnected]);

  // Forward commands to Arduino via hook
  const handleSendCommand = useCallback(async (command: string): Promise<boolean> => {
    console.log('Command forwarded to Arduino:', command);
    // This function is called after the actual command is sent to Arduino
    // We can use it to update UI or handle command-specific logic
    return true;
  }, []);

  // Handle Arduino connection status change
  const handleArduinoConnectionChange = useCallback((connected: boolean) => {
    // No need to manually set this as the useArduinoSerial hook manages the connection state
    if (connected) {
      toast({
        title: "Arduino Connected",
        description: "Now receiving real sensor data"
      });
    }
  }, [toast]);

  // Handle plant profile selection
  const handleSelectPlant = useCallback((plant: PlantProfile) => {
    setSelectedPlant(plant);
  }, [setSelectedPlant]);
  
  // Refresh data from database
  const handleRefreshData = useCallback(() => {
    if (data.selectedPlantId) {
      // This will trigger a reload of the plant from the database
      // We need to get the current plant profile from the list
      const plantId = data.selectedPlantId;
      import('@/data/plants').then(({ getPlantById }) => {
        const plant = getPlantById(plantId);
        if (plant) {
          setSelectedPlant(plant);
        }
      });
    }
  }, [data.selectedPlantId, setSelectedPlant]);
  
  // Determine if we should show components that require Arduino connection
  // When simulation is enabled, show everything regardless of actual connection
  const showArduinoComponents = isConnected || useSimulation;
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Leaf className="h-6 w-6 text-plant" />
          Plant Dashboard
          <span className="ml-2 text-sm bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
            <Database className="h-3 w-3" />
            Database Connected
          </span>
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
        isArduinoConnected={showArduinoComponents}
      />
      
      {/* Plant Profile Selector - Moved to the top for better visibility */}
      <div className="mt-6">
        <PlantProfileSelector
          selectedPlantId={data.selectedPlantId}
          onSelectPlant={handleSelectPlant}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        <MoistureGauge 
          currentMoisture={data.currentMoisture} 
          optimalRange={data.optimalRange}
          isArduinoConnected={showArduinoComponents}
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
          isArduinoConnected={showArduinoComponents}
        />
        
        <HistoryChart 
          data={data.historyData} 
          isArduinoConnected={true} // Always show history chart
          onRefresh={handleRefreshData}
          isLoading={isLoading}
        />
      </div>
      
      {/* Plant Config */}
      <div className="mt-6">
        <PlantConfigCard
          optimalRange={data.optimalRange}
          wateringFrequency={data.wateringFrequency}
          customWateringDays={data.customWateringDays}
          nextScheduledWatering={data.nextScheduledWatering}
          onChangeFrequency={setWateringFrequency}
          onChangeCustomDays={setCustomWateringDays}
          onChangeMoistureRange={setOptimalMoistureRange}
          selectedPlantId={data.selectedPlantId}
        />
      </div>
      
      {/* Arduino Connection Card */}
      <div className="mt-6">
        <ArduinoConnection 
          onDataReceived={handleArduinoData}
          onSendCommand={handleSendCommand}
          onConnectionChange={handleArduinoConnectionChange}
        />
      </div>
      
      {/* Invisible notification system */}
      <NotificationSystem 
        isMoistureCritical={isMoistureCritical && showArduinoComponents} 
        moistureLevel={data.currentMoisture}
      />
    </div>
  );
};

export default Dashboard;
