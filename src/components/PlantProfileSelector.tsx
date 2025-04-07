
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Flower, Carrot, Sprout, Leaf, Brain, Apple, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlantProfile, getAllPlants, getPlantsByType, getPlantTypes } from '@/data/plants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface PlantProfileSelectorProps {
  selectedPlantId: string | null;
  onSelectPlant: (plant: PlantProfile) => void;
}

const PlantProfileSelector: React.FC<PlantProfileSelectorProps> = ({
  selectedPlantId,
  onSelectPlant
}) => {
  const { toast } = useToast();
  const allPlants = getAllPlants();
  const plantTypes = getPlantTypes();
  const selectedPlant = allPlants.find(plant => plant.id === selectedPlantId) || null;

  const plantsByType = useMemo(() => {
    const result: Record<string, PlantProfile[]> = {};
    plantTypes.forEach(type => {
      result[type] = getPlantsByType(type);
    });
    return result;
  }, [plantTypes]);

  const getPlantIcon = (type: PlantProfile['type']) => {
    switch (type) {
      case 'vegetable':
        return <Carrot className="h-4 w-4 text-orange-500" />;
      case 'flower':
        return <Flower className="h-4 w-4 text-pink-500" />;
      case 'herb':
        return <Sprout className="h-4 w-4 text-green-500" />;
      case 'fruit':
        return <Apple className="h-4 w-4 text-red-500" />;
      case 'grain':
        return <Brain className="h-4 w-4 text-yellow-500" />; // Changed from Grain to Brain
      case 'succulent':
      case 'houseplant':
      default:
        return <Leaf className="h-4 w-4 text-plant" />;
    }
  };

  const handleSelectPlant = (plant: PlantProfile) => {
    onSelectPlant(plant);
    toast({
      title: "Plant Profile Selected",
      description: `${plant.name} settings have been applied.`
    });
  };

  const getTypeLabel = (type: PlantProfile['type']) => {
    switch (type) {
      case 'vegetable': return 'Vegetables';
      case 'flower': return 'Flowers';
      case 'herb': return 'Herbs';
      case 'succulent': return 'Succulents';
      case 'houseplant': return 'House Plants';
      case 'fruit': return 'Fruits';
      case 'grain': return 'Grains';
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-plant" />
          Plant Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {selectedPlant && (
            <div className="p-3 bg-secondary/20 rounded-md space-y-2">
              <div className="flex items-center gap-2">
                {getPlantIcon(selectedPlant.type)}
                <span className="font-medium">{selectedPlant.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getTypeLabel(selectedPlant.type)}
                </Badge>
                
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1"
                >
                  {selectedPlant.idealMoistureRange[0]}%-{selectedPlant.idealMoistureRange[1]}% Moisture
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {selectedPlant.description}
              </p>
            </div>
          )}

          <Tabs defaultValue={selectedPlant?.type || plantTypes[0]}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Select Plant Type</h3>
              <div className="flex gap-1 items-center text-xs text-muted-foreground">
                <ChevronDown className="h-3 w-3" />
                <span>Scroll for more</span>
              </div>
            </div>
            
            <ScrollArea className="h-12 pb-2">
              <TabsList className="w-full justify-start">
                {plantTypes.map(type => (
                  <TabsTrigger key={type} value={type} className="flex items-center gap-1">
                    {getPlantIcon(type)}
                    {getTypeLabel(type)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
            
            {plantTypes.map(type => (
              <TabsContent key={type} value={type} className="mt-2">
                <div className="relative">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    {getPlantIcon(type)} {getTypeLabel(type)}
                  </h4>
                  
                  <Carousel className="w-full">
                    <CarouselContent>
                      {plantsByType[type].map(plant => (
                        <CarouselItem key={plant.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                          <div 
                            className={`p-3 rounded-md cursor-pointer border transition-all ${
                              selectedPlantId === plant.id 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border hover:border-primary/40'
                            }`}
                            onClick={() => handleSelectPlant(plant)}
                          >
                            <div className="text-sm font-medium truncate">{plant.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {plant.idealMoistureRange[0]}-{plant.idealMoistureRange[1]}% moisture
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </Carousel>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlantProfileSelector;
