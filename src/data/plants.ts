
export interface PlantProfile {
  id: string;
  name: string;
  type: 'vegetable' | 'flower' | 'herb' | 'succulent' | 'houseplant' | 'fruit' | 'grain';
  description: string;
  wateringFrequency: 'daily' | 'twice_weekly' | 'weekly' | 'biweekly' | 'custom';
  customWateringDays?: number; // Only used when wateringFrequency is 'custom'
  idealMoistureRange: [number, number]; // [min, max] as percentage
  image?: string; // Optional image URL
}

const plants: PlantProfile[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    type: 'vegetable',
    description: 'Popular garden vegetable that requires consistent moisture.',
    wateringFrequency: 'twice_weekly',
    idealMoistureRange: [60, 80],
  },
  {
    id: 'basil',
    name: 'Basil',
    type: 'herb',
    description: 'Aromatic herb that prefers evenly moist soil.',
    wateringFrequency: 'daily',
    idealMoistureRange: [50, 70],
  },
  {
    id: 'succulent',
    name: 'Succulent',
    type: 'succulent',
    description: 'Drought-tolerant plant that stores water in its leaves.',
    wateringFrequency: 'biweekly',
    idealMoistureRange: [20, 40],
  },
  {
    id: 'peace_lily',
    name: 'Peace Lily',
    type: 'houseplant',
    description: 'Popular houseplant that prefers partial shade and frequent watering.',
    wateringFrequency: 'weekly',
    idealMoistureRange: [40, 60],
  },
  {
    id: 'orchid',
    name: 'Orchid',
    type: 'flower',
    description: 'Elegant flowering plant that requires specific care.',
    wateringFrequency: 'weekly',
    idealMoistureRange: [40, 60],
  },
  {
    id: 'snake_plant',
    name: 'Snake Plant',
    type: 'houseplant',
    description: 'Nearly indestructible plant that tolerates infrequent watering.',
    wateringFrequency: 'biweekly',
    idealMoistureRange: [30, 50],
  },
  {
    id: 'aloe_vera',
    name: 'Aloe Vera',
    type: 'succulent',
    description: 'Medicinal plant known for its healing properties.',
    wateringFrequency: 'custom',
    customWateringDays: 14,
    idealMoistureRange: [30, 50],
  },
  {
    id: 'lettuce',
    name: 'Lettuce',
    type: 'vegetable',
    description: 'Leafy green vegetable that needs consistent moisture.',
    wateringFrequency: 'daily',
    idealMoistureRange: [70, 90],
  },
  {
    id: 'lavender',
    name: 'Lavender',
    type: 'herb',
    description: 'Fragrant herb with purple flowers that prefers drier conditions.',
    wateringFrequency: 'weekly',
    idealMoistureRange: [30, 50],
  },
  {
    id: 'spider_plant',
    name: 'Spider Plant',
    type: 'houseplant',
    description: 'Air-purifying plant that produces baby plantlets.',
    wateringFrequency: 'weekly',
    idealMoistureRange: [40, 60],
  },
  {
    id: 'mint',
    name: 'Mint',
    type: 'herb',
    description: 'Fast-growing herb that loves moisture.',
    wateringFrequency: 'twice_weekly',
    idealMoistureRange: [60, 80],
  },
  {
    id: 'rice',
    name: 'Rice',
    type: 'grain',
    description: 'Grain crop that thrives in water-saturated conditions.',
    wateringFrequency: 'daily',
    idealMoistureRange: [80, 100],
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    type: 'fruit',
    description: 'Sweet fruit that needs regular watering for best production.',
    wateringFrequency: 'twice_weekly',
    idealMoistureRange: [60, 80],
  },
  {
    id: 'carrot',
    name: 'Carrot',
    type: 'vegetable',
    description: 'Root vegetable that needs consistent moisture for proper development.',
    wateringFrequency: 'twice_weekly',
    idealMoistureRange: [50, 70],
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    type: 'vegetable',
    description: 'Water-loving vine vegetable that produces crisp fruits.',
    wateringFrequency: 'daily',
    idealMoistureRange: [65, 85],
  },
  {
    id: 'rosemary',
    name: 'Rosemary',
    type: 'herb',
    description: 'Aromatic herb that prefers drier conditions and excellent drainage.',
    wateringFrequency: 'weekly',
    idealMoistureRange: [30, 50],
  },
  {
    id: 'rose',
    name: 'Rose',
    type: 'flower',
    description: 'Classic flowering plant that needs regular, deep watering.',
    wateringFrequency: 'twice_weekly',
    idealMoistureRange: [50, 70],
  },
  {
    id: 'cactus',
    name: 'Cactus',
    type: 'succulent',
    description: 'Desert plant adapted to extremely dry conditions.',
    wateringFrequency: 'custom',
    customWateringDays: 21,
    idealMoistureRange: [10, 30],
  },
  {
    id: 'pothos',
    name: 'Pothos',
    type: 'houseplant',
    description: 'Easy-care trailing houseplant that adapts to various conditions.',
    wateringFrequency: 'weekly',
    idealMoistureRange: [40, 60],
  },
  {
    id: 'corn',
    name: 'Corn',
    type: 'grain',
    description: 'Tall grain crop that needs consistent moisture during growing season.',
    wateringFrequency: 'twice_weekly',
    idealMoistureRange: [60, 80],
  },
  {
    id: 'fern',
    name: 'Fern',
    type: 'houseplant',
    description: 'Moisture-loving plant that thrives in humid environments.',
    wateringFrequency: 'twice_weekly',
    idealMoistureRange: [60, 80],
  },
  {
    id: 'bamboo',
    name: 'Bamboo',
    type: 'houseplant',
    description: 'Fast-growing plant that can be grown in water or soil.',
    wateringFrequency: 'twice_weekly',
    idealMoistureRange: [60, 90],
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    type: 'flower',
    description: 'Tall flower with large blooms that follows the sun.',
    wateringFrequency: 'twice_weekly',
    idealMoistureRange: [50, 70],
  },
  {
    id: 'custom',
    name: 'Custom Plant',
    type: 'houseplant',
    description: 'Use your own custom settings for this plant.',
    wateringFrequency: 'custom',
    customWateringDays: 3,
    idealMoistureRange: [50, 70],
  }
];

export const getPlantById = (id: string): PlantProfile | undefined => {
  return plants.find(plant => plant.id === id);
};

export const getPlantsByType = (type: PlantProfile['type']): PlantProfile[] => {
  return plants.filter(plant => plant.type === type);
};

export const getAllPlants = (): PlantProfile[] => {
  return plants;
};

export const getPlantTypes = (): PlantProfile['type'][] => {
  return [...new Set(plants.map(plant => plant.type))];
};

export default plants;
