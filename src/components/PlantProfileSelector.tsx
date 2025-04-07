
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flower, Carrot, Sprout, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlantProfile, getAllPlants, getPlantsByType } from '@/data/plants';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
  const selectedPlant = allPlants.find(plant => plant.id === selectedPlantId) || null;

  const getPlantIcon = (type: PlantProfile['type']) => {
    switch (type) {
      case 'vegetable':
        return <Carrot className="h-4 w-4 text-orange-500" />;
      case 'flower':
        return <Flower className="h-4 w-4 text-pink-500" />;
      case 'herb':
        return <Sprout className="h-4 w-4 text-green-500" />;
      case 'succulent':
      case 'houseplant':
      default:
        return <Leaf className="h-4 w-4 text-plant" />;
    }
  };

  const handleSelectPlant = (plantId: string) => {
    const plant = allPlants.find(p => p.id === plantId);
    if (plant) {
      onSelectPlant(plant);
      toast({
        title: "Plant Profile Selected",
        description: `${plant.name} settings have been applied.`
      });
    }
  };

  const getTypeLabel = (type: PlantProfile['type']) => {
    switch (type) {
      case 'vegetable': return 'Vegetables';
      case 'flower': return 'Flowers';
      case 'herb': return 'Herbs';
      case 'succulent': return 'Succulents';
      case 'houseplant': return 'House Plants';
      default: return type;
    }
  };

  // Group plants by type for the dropdown
  const plantsByType: Record<string, PlantProfile[]> = {};
  allPlants.forEach(plant => {
    if (!plantsByType[plant.type]) {
      plantsByType[plant.type] = [];
    }
    plantsByType[plant.type].push(plant);
  });

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  {selectedPlant ? (
                    <>
                      {getPlantIcon(selectedPlant.type)}
                      {selectedPlant.name}
                    </>
                  ) : (
                    <>
                      <Leaf className="h-4 w-4" />
                      Select a plant...
                    </>
                  )}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Select Plant Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {Object.keys(plantsByType).map(type => (
                <React.Fragment key={type}>
                  <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                    {getPlantIcon(type as PlantProfile['type'])}
                    {getTypeLabel(type as PlantProfile['type'])}
                  </DropdownMenuLabel>
                  
                  {plantsByType[type].map(plant => (
                    <DropdownMenuItem 
                      key={plant.id}
                      onClick={() => handleSelectPlant(plant.id)}
                      className="pl-6"
                    >
                      {plant.name}
                    </DropdownMenuItem>
                  ))}
                  
                  <DropdownMenuSeparator />
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {selectedPlant && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getPlantIcon(selectedPlant.type)}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default PlantProfileSelector;
