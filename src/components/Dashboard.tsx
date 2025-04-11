
import React from 'react';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardStatusCards from './dashboard/DashboardStatusCards';
import DashboardMainContent from './dashboard/DashboardMainContent';
import DashboardConfigSection from './dashboard/DashboardConfigSection';
import NotificationSystem from './NotificationSystem';
import ArduinoConnection from './ArduinoConnection';
import PlantProfileSelector from './PlantProfileSelector';
import { useDashboard } from '@/hooks/useDashboard';

const Dashboard: React.FC = () => {
  const {
    data,
    lastSyncTime,
    isLoading,
    showArduinoComponents,
    activateWaterMotor,
    activateFertilizerMotor,
    toggleWateringMode,
    setWateringDuration,
    setFertilizerDuration,
    setWateringFrequency,
    setCustomWateringDays,
    setOptimalMoistureRange,
    handleSelectPlant,
    handleRefreshData,
    handleArduinoData,
    handleSendCommand,
    handleArduinoConnectionChange,
    isMoistureCritical
  } = useDashboard();
  
  return (
    <div className="container py-6">
      <DashboardHeader 
        onRefreshData={handleRefreshData}
        lastSyncTime={lastSyncTime}
        isLoading={isLoading}
      />
      
      {/* Status Cards */}
      <DashboardStatusCards 
        waterMotorStatus={data.waterMotorStatus}
        fertilizerMotorStatus={data.fertilizerMotorStatus}
        lastWatered={data.lastWatered}
        lastFertilized={data.lastFertilized}
        isArduinoConnected={showArduinoComponents}
      />
      
      {/* Plant Profile Selector */}
      <div className="mt-6">
        <PlantProfileSelector
          selectedPlantId={data.selectedPlantId}
          onSelectPlant={handleSelectPlant}
        />
      </div>
      
      {/* Main Content Area */}
      <DashboardMainContent 
        currentMoisture={data.currentMoisture}
        optimalRange={data.optimalRange}
        waterMotorStatus={data.waterMotorStatus}
        fertilizerMotorStatus={data.fertilizerMotorStatus}
        wateringMode={data.wateringMode}
        wateringDuration={data.wateringDuration}
        fertilizerDuration={data.fertilizerDuration}
        lastWatered={data.lastWatered}
        lastFertilized={data.lastFertilized}
        historyData={data.historyData}
        isArduinoConnected={showArduinoComponents}
        onActivateWater={activateWaterMotor}
        onActivateFertilizer={activateFertilizerMotor}
        onToggleMode={toggleWateringMode}
        onChangeWaterDuration={setWateringDuration}
        onChangeFertilizerDuration={setFertilizerDuration}
        onRefreshData={handleRefreshData}
        isLoading={isLoading}
      />
      
      {/* Plant Config */}
      <DashboardConfigSection
        optimalRange={data.optimalRange}
        wateringFrequency={data.wateringFrequency}
        customWateringDays={data.customWateringDays}
        nextScheduledWatering={data.nextScheduledWatering}
        selectedPlantId={data.selectedPlantId}
        onChangeFrequency={setWateringFrequency}
        onChangeCustomDays={setCustomWateringDays}
        onChangeMoistureRange={setOptimalMoistureRange}
      />
      
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
