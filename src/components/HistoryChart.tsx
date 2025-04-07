
import React, { useMemo } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart4, WifiOff } from 'lucide-react';

interface DataPoint {
  timestamp: Date;
  moisture: number;
  waterMotor: boolean;
  fertilizerMotor: boolean;
}

interface HistoryChartProps {
  data: DataPoint[];
  isArduinoConnected: boolean;
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data, isArduinoConnected }) => {
  // If not connected to Arduino, show disconnected state
  if (!isArduinoConnected) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Moisture History</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">History Data Unavailable</h3>
          <p className="text-sm text-muted-foreground">
            Connect your Arduino to view moisture history data.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart
  const chartData = useMemo(() => {
    return data.map(point => ({
      time: point.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTime: point.timestamp.toLocaleString(),
      moisture: point.moisture,
      waterMotor: point.waterMotor ? 1 : 0,
      fertilizerMotor: point.fertilizerMotor ? 1 : 0
    }));
  }, [data]);
  
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

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Moisture History</CardTitle>
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
                  <YAxis yAxisId="left" domain={[0, 100]} label={{ value: 'Moisture (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 1.1]} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="moisture" stroke="#4CAF50" dot={{ r: 2 }} activeDot={{ r: 5 }} name="Moisture" />
                  <Line yAxisId="right" type="monotone" dataKey="waterMotor" stroke="#03A9F4" strokeWidth={2} dot={{ r: 2 }} name="Water Motor" />
                  <Line yAxisId="right" type="monotone" dataKey="fertilizerMotor" stroke="#9C27B0" strokeWidth={2} dot={{ r: 2 }} name="Fertilizer Motor" />
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
                  <YAxis yAxisId="left" domain={[0, 100]} label={{ value: 'Moisture (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 1.1]} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="moisture" stroke="#4CAF50" dot={{ r: 2 }} activeDot={{ r: 5 }} name="Moisture" />
                  <Line yAxisId="right" type="monotone" dataKey="waterMotor" stroke="#03A9F4" strokeWidth={2} dot={{ r: 2 }} name="Water Motor" />
                  <Line yAxisId="right" type="monotone" dataKey="fertilizerMotor" stroke="#9C27B0" strokeWidth={2} dot={{ r: 2 }} name="Fertilizer Motor" />
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
