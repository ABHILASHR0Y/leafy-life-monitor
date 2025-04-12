
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
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [connectionTimeout, setConnectionTimeout] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Function to disconnect from the Arduino - defined first to avoid dependency issues
  const disconnect = useCallback(async () => {
    try {
      // Clear connection timeout
      if (connectionTimeout) {
        clearInterval(connectionTimeout);
        setConnectionTimeout(null);
      }
      
      // Release the reader if it exists
      if (reader) {
        setIsReading(false);
        try {
          await reader.cancel();
          reader.releaseLock();
        } catch (e) {
          console.log('Error releasing reader:', e);
        }
        setReader(null);
      }

      // Release the writer if it exists
      if (writer) {
        try {
          await writer.close();
          writer.releaseLock();
        } catch (e) {
          console.log('Error releasing writer:', e);
        }
        setWriter(null);
      }

      // Close the port if it exists
      if (port) {
        try {
          await port.close();
        } catch (e) {
          console.log('Error closing port:', e);
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
      
      // Force reset of all connection states in case of error
      setReader(null);
      setWriter(null);
      setPort(null);
      setIsConnected(false);
      
      return false;
    }
  }, [port, reader, writer, connectionTimeout]);

  // Now define connect function with properly ordered dependencies
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

    if (isConnecting) {
      console.log('Already attempting to connect, please wait...');
      return false;
    }

    setIsConnecting(true);

    try {
      // First close any existing connection
      if (isConnected) {
        await disconnect();
      }

      const newPort = await navigator.serial.requestPort();
      await newPort.open({ baudRate: 9600 });

      // Set up the writer before setting connected state
      const outputStream = newPort.writable;
      const newWriter = outputStream.getWriter();
      
      // Update states after successful connection
      setPort(newPort);
      setWriter(newWriter);
      setIsConnected(true);
      setConnectionError(null);
      setLastActivityTime(Date.now());

      toast({
        title: 'Connected',
        description: 'Successfully connected to Arduino device.',
      });
      
      // Start connection timeout check
      if (connectionTimeout) clearInterval(connectionTimeout);
      const timeoutId = window.setInterval(() => {
        const inactiveTime = Date.now() - lastActivityTime;
        // If no activity for 10 seconds, consider disconnected
        if (inactiveTime > 10000 && isConnected) {
          console.log('Connection timeout - no activity detected');
          disconnect();
        }
      }, 5000);
      setConnectionTimeout(timeoutId);
      
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
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, lastActivityTime, disconnect, isConnecting]);

  // Function to send a command to the Arduino
  const sendCommand = useCallback(async (command: string) => {
    if (!writer) {
      console.error('Cannot send command: Writer not available');
      setConnectionError('Command failed: No writer available');
      return false;
    }

    if (!isConnected) {
      console.error('Cannot send command: Not connected');
      setConnectionError('Command failed: Not connected to Arduino');
      return false;
    }

    try {
      // Update last activity time
      setLastActivityTime(Date.now());
      
      // Add newline as terminator for Arduino commands
      const encoder = new TextEncoder();
      const data = encoder.encode(command + '\n');
      
      // Check if the writer is still valid before writing
      if (writer.closed) {
        throw new Error('Writer is closed');
      }
      
      await writer.write(data);
      console.log(`Sent command to Arduino: ${command}`);
      return true;
    } catch (error) {
      console.error('Error sending command:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(`Failed to send command: ${errorMessage}`);
      
      // If we get a "closed" error, try to reconnect
      if (errorMessage.includes('closed') || errorMessage.includes('CLOSED')) {
        console.log('Writer was closed, attempting disconnect to reset connection state');
        await disconnect();
        
        toast({
          title: 'Connection Lost',
          description: 'Arduino connection was closed. Please reconnect.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Command Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      return false;
    }
  }, [writer, isConnected, disconnect]);

  // Start reading data from Arduino
  const startReading = useCallback(async (onDataReceived: (data: string) => void) => {
    if (!port || !isConnected) {
      console.error('Cannot start reading: Not connected');
      return false;
    }

    try {
      // Release previous reader if any
      if (reader) {
        try {
          await reader.cancel();
          reader.releaseLock();
        } catch (e) {
          console.log('Error releasing previous reader:', e);
        }
      }

      const inputStream = port.readable;
      if (!inputStream) {
        throw new Error('Serial port readable stream is null');
      }
      
      const newReader = inputStream.getReader();
      setReader(newReader);
      setIsReading(true);

      // Read loop
      const readLoop = async () => {
        try {
          while (isReading) {
            const { value, done } = await newReader.read();
            if (done) {
              console.log('Reader reported done');
              break;
            }
            
            // Update last activity time when data is received
            setLastActivityTime(Date.now());
            
            // Convert the received bytes to text
            const decoder = new TextDecoder();
            const text = decoder.decode(value);
            
            // Pass the data to the callback
            onDataReceived(text);
          }
        } catch (error) {
          console.error('Error reading from serial:', error);
          setIsReading(false);
          
          // If there's a read error, consider the connection lost
          if (isConnected) {
            disconnect();
          }
        } finally {
          try {
            newReader.releaseLock();
          } catch (e) {
            console.log('Error releasing reader in finally block:', e);
          }
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
  }, [port, isConnected, disconnect, reader, isReading]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (connectionTimeout) {
        clearInterval(connectionTimeout);
      }
      
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
  }, [port, reader, writer, connectionTimeout]);

  return {
    isConnected,
    isReading,
    connectionError,
    serialAvailable: isSerialAvailable(),
    isConnecting,
    connect,
    disconnect,
    sendCommand,
    startReading
  };
}
