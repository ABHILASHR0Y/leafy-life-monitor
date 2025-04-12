
import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Use refs to track the current state in async callbacks
  const isConnectedRef = useRef(isConnected);
  const isReadingRef = useRef(isReading);
  
  // Update refs when state changes
  useEffect(() => {
    isConnectedRef.current = isConnected;
    isReadingRef.current = isReading;
  }, [isConnected, isReading]);

  // Function to disconnect from the Arduino
  const disconnect = useCallback(async () => {
    try {
      // Release the reader if it exists
      if (reader) {
        setIsReading(false);
        isReadingRef.current = false;
        try {
          await reader.cancel();
        } catch (err) {
          console.log('Error cancelling reader:', err);
        }
        reader.releaseLock();
        setReader(null);
      }

      // Release the writer if it exists
      if (writer) {
        try {
          await writer.close();
        } catch (err) {
          console.log('Error closing writer:', err);
        }
        writer.releaseLock();
        setWriter(null);
      }

      // Close the port if it exists
      if (port) {
        try {
          await port.close();
        } catch (err) {
          console.log('Error closing port:', err);
        }
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

    // If already connected, disconnect first
    if (isConnected) {
      await disconnect();
    }

    try {
      const newPort = await navigator.serial.requestPort();
      await newPort.open({ baudRate: 9600 });

      setPort(newPort);
      setIsConnected(true);
      isConnectedRef.current = true;
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
  }, [isConnected, disconnect]);

  // Function to send a command to the Arduino
  const sendCommand = useCallback(async (command: string) => {
    if (!writer || !isConnectedRef.current) {
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
  }, [writer]);

  // Start reading data from Arduino
  const startReading = useCallback(async (onDataReceived: (data: string) => void) => {
    if (!port || !isConnectedRef.current) {
      console.error('Cannot start reading: Not connected');
      return false;
    }

    try {
      const inputStream = port.readable;
      const newReader = inputStream.getReader();
      setReader(newReader);
      setIsReading(true);
      isReadingRef.current = true;

      // Read loop
      const readLoop = async () => {
        try {
          while (isReadingRef.current) {
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
          isReadingRef.current = false;
        } finally {
          try {
            newReader.releaseLock();
          } catch (e) {
            console.log('Error releasing reader lock:', e);
          }
        }
      };

      // Start the read loop
      readLoop();
      return true;
    } catch (error) {
      console.error('Error setting up reader:', error);
      setIsReading(false);
      isReadingRef.current = false;
      return false;
    }
  }, [port]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (reader) {
        setIsReading(false);
        isReadingRef.current = false;
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
