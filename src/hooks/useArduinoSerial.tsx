
import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";

// Web Serial API is only available in secure contexts (HTTPS) and some browsers
const isSerialAvailable = () => {
  return 'serial' in navigator;
};

export function useArduinoSerial() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [reader, setReader] = useState<ReadableStreamDefaultReader | null>(null);
  const [writer, setWriter] = useState<WritableStreamDefaultWriter | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Function to connect to the Arduino
  const connect = useCallback(async () => {
    if (!isSerialAvailable()) {
      setConnectionError('Web Serial API is not supported in this browser.');
      toast({
        title: 'Browser Not Supported',
        description: 'Web Serial API is not supported in this browser. Try Chrome or Edge.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const newPort = await navigator.serial.requestPort();
      await newPort.open({ baudRate: 9600 });

      setPort(newPort);
      setIsConnected(true);
      setConnectionError(null);

      // Set up the writer
      const outputStream = newPort.writable;
      const newWriter = outputStream.getWriter();
      setWriter(newWriter);

      toast({
        title: 'Connected',
        description: 'Successfully connected to Arduino device.',
      });
      
      return true;
    } catch (error) {
      console.error('Error connecting to serial port:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(`Failed to connect: ${errorMessage}`);
      
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return false;
    }
  }, []);

  // Function to disconnect from the Arduino
  const disconnect = useCallback(async () => {
    try {
      // Release the reader if it exists
      if (reader) {
        setIsReading(false);
        await reader.cancel();
        reader.releaseLock();
        setReader(null);
      }

      // Release the writer if it exists
      if (writer) {
        await writer.close();
        writer.releaseLock();
        setWriter(null);
      }

      // Close the port if it exists
      if (port) {
        await port.close();
        setPort(null);
      }

      setIsConnected(false);
      toast({
        title: 'Disconnected',
        description: 'Disconnected from Arduino device.',
      });
      return true;
    } catch (error) {
      console.error('Error disconnecting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(`Failed to disconnect: ${errorMessage}`);
      
      toast({
        title: 'Disconnect Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return false;
    }
  }, [port, reader, writer]);

  // Function to send a command to the Arduino
  const sendCommand = useCallback(async (command: string) => {
    if (!writer || !isConnected) {
      console.error('Cannot send command: Not connected');
      return false;
    }

    try {
      // Add newline as terminator for Arduino commands
      const encoder = new TextEncoder();
      const data = encoder.encode(command + '\n');
      await writer.write(data);
      console.log(`Sent command to Arduino: ${command}`);
      return true;
    } catch (error) {
      console.error('Error sending command:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(`Failed to send command: ${errorMessage}`);
      
      toast({
        title: 'Command Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return false;
    }
  }, [writer, isConnected]);

  // Start reading data from Arduino
  const startReading = useCallback(async (onDataReceived: (data: string) => void) => {
    if (!port || !isConnected) {
      console.error('Cannot start reading: Not connected');
      return false;
    }

    try {
      const inputStream = port.readable;
      const newReader = inputStream.getReader();
      setReader(newReader);
      setIsReading(true);

      // Read loop
      const readLoop = async () => {
        try {
          while (isReading) {
            const { value, done } = await newReader.read();
            if (done) {
              break;
            }
            
            // Convert the received bytes to text
            const decoder = new TextDecoder();
            const text = decoder.decode(value);
            
            // Pass the data to the callback
            onDataReceived(text);
          }
        } catch (error) {
          console.error('Error reading from serial:', error);
          setIsReading(false);
        } finally {
          newReader.releaseLock();
        }
      };

      // Start the read loop
      readLoop();
      return true;
    } catch (error) {
      console.error('Error setting up reader:', error);
      setIsReading(false);
      return false;
    }
  }, [port, isConnected]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (reader) {
        setIsReading(false);
        reader.cancel().catch(console.error);
      }
      if (writer) {
        writer.close().catch(console.error);
      }
      if (port && port.readable && port.writable) {
        port.close().catch(console.error);
      }
    };
  }, [port, reader, writer]);

  return {
    isConnected,
    isReading,
    connectionError,
    serialAvailable: isSerialAvailable(),
    connect,
    disconnect,
    sendCommand,
    startReading
  };
}
