
import { useState, useEffect } from 'react';

// This is a mock hook that simulates connection to an Arduino via serial port
export function useSerialConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [availablePorts, setAvailablePorts] = useState<string[]>(['/dev/ttyACM0', 'COM3', '/dev/ttyUSB0']);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);

  // Simulate initial connection attempt
  useEffect(() => {
    // Simulate connection after a delay
    const timer = setTimeout(() => {
      const success = Math.random() > 0.3; // 70% chance of success
      
      if (success) {
        setIsConnected(true);
        setConnectionError(null);
        setSelectedPort(availablePorts[0]);
      } else {
        setIsConnected(false);
        setConnectionError('Failed to connect to Arduino. Check connection and try again.');
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Function to connect to a specific port
  const connect = (port: string) => {
    setIsConnected(false);
    setConnectionError(null);
    
    // Simulate connection attempt
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% chance of success
      
      if (success) {
        setIsConnected(true);
        setSelectedPort(port);
      } else {
        setConnectionError(`Failed to connect to ${port}. Check connection and try again.`);
      }
    }, 1000);
  };

  // Function to disconnect
  const disconnect = () => {
    setIsConnected(false);
    setSelectedPort(null);
  };

  // Simulate sending command to Arduino
  const sendCommand = (command: string) => {
    if (!isConnected) {
      console.error('Cannot send command: Not connected');
      return false;
    }
    
    console.log(`Sending command to Arduino: ${command}`);
    return true;
  };

  return {
    isConnected,
    connectionError,
    availablePorts,
    selectedPort,
    connect,
    disconnect,
    sendCommand
  };
}
