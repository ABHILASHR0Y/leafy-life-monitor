
import React, { useMemo } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart4, WifiOff, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataPoint {
  timestamp: Date;
  moisture: number;
  waterMotor: boolean;
  fertilizerMotor: boolean;
}

interface HistoryChartProps {
  data: DataPoint[];
  isArduinoConnected: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const HistoryChart: React.FC<HistoryChartProps> = ({ 
  data, 
  isArduinoConnected, 
  onRefresh,
  isLoading = false
}) => {
  // Format data for the chart
  const chartData = useMemo(() => {
    // If no data or not connected to Arduino, create simulated offline data
    if (!isArduinoConnected || data.length === 0) {
      // Generate flat line data points for offline visualization
      const offlineData = [];
      const now = new Date();
      for (let i = 12; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000); // 30-minute intervals
        offlineData.push({
          time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fullTime: timestamp.toLocaleString(),
          moisture: 0, // Flat line at 0
          waterMotor: 0,
          fertilizerMotor: 0,
          offline: true // Mark as offline data
        });
      }
      return offlineData;
    }

    // Regular data processing for online mode
    // Sort by timestamp to ensure chronological order
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return sortedData.map(point => ({
      time: point.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTime: point.timestamp.toLocaleString(),
      moisture: point.moisture,
      waterMotor: point.waterMotor ? 1 : 0,
      fertilizerMotor: point.fertilizerMotor ? 1 : 0,
      offline: false
    }));
  }, [data, isArduinoConnected]);
  
  // Get today's data only
  const todayData = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return chartData.filter(point => {
      const pointDate = new Date(point.fullTime).setHours(0, 0, 0, 0);
      return pointDate === today;
    });
  }, [chartData]);
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Handle offline data specially
      const isOffline = payload[0].payload.offline;
      
      if (isOffline) {
        return (
          <div className="bg-card p-3 border rounded-md shadow-md">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-red-500">Sensor disconnected</p>
          </div>
        );
      }
      
      return (
        <div className="bg-card p-3 border rounded-md shadow-md">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-xs">
              {entry.name === 'moisture' 
                ? `Moisture: ${entry.value.toFixed(1)}%` 
                : entry.name === 'waterMotor' && entry.value === 1
                  ? 'Water: Active'
                  : entry.name === 'fertilizerMotor' && entry.value === 1
                    ? 'Fertilizer: Active'
                    : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Show chart with real or simulated data
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Moisture History
            <Database className="h-4 w-4 text-primary" />
          </CardTitle>
          {!isArduinoConnected && (
            <p className="text-sm text-muted-foreground">
              <WifiOff className="h-4 w-4 inline-block mr-2 text-red-500" />
              Sensor disconnected - Showing offline visualization
            </p>
          )}
        </div>
        {onRefresh && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={todayData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#6666661a" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis 
                    yAxisId="left" 
                    domain={[0, 100]} 
                    label={{ value: 'Moisture (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} 
                  />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 1.1]} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="moisture" 
                    stroke={!isArduinoConnected ? "#EF4444" : "#4CAF50"} 
                    strokeWidth={!isArduinoConnected ? 2 : 1.5}
                    dot={{ r: isArduinoConnected ? 2 : 0 }} 
                    activeDot={{ r: isArduinoConnected ? 5 : 0 }} 
                    name={isArduinoConnected ? "Moisture" : "Sensor Disconnected"} 
                  />
                  {isArduinoConnected && (
                    <>
                      <Line yAxisId="right" type="monotone" dataKey="waterMotor" stroke="#03A9F4" strokeWidth={2} dot={{ r: 2 }} name="Water Motor" />
                      <Line yAxisId="right" type="monotone" dataKey="fertilizerMotor" stroke="#9C27B0" strokeWidth={2} dot={{ r: 2 }} name="Fertilizer Motor" />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="all" className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#6666661a" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis 
                    yAxisId="left" 
                    domain={[0, 100]} 
                    label={{ value: 'Moisture (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} 
                  />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 1.1]} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="moisture" 
                    stroke={!isArduinoConnected ? "#EF4444" : "#4CAF50"} 
                    strokeWidth={!isArduinoConnected ? 2 : 1.5}
                    dot={{ r: isArduinoConnected ? 2 : 0 }} 
                    activeDot={{ r: isArduinoConnected ? 5 : 0 }} 
                    name={isArduinoConnected ? "Moisture" : "Sensor Disconnected"} 
                  />
                  {isArduinoConnected && (
                    <>
                      <Line yAxisId="right" type="monotone" dataKey="waterMotor" stroke="#03A9F4" strokeWidth={2} dot={{ r: 2 }} name="Water Motor" />
                      <Line yAxisId="right" type="monotone" dataKey="fertilizerMotor" stroke="#9C27B0" strokeWidth={2} dot={{ r: 2 }} name="Fertilizer Motor" />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HistoryChart;
