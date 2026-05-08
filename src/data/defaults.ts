import type { Reel } from '../types';

const id = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const flower = (name: string) => ({ id: id(name), name, image: '' });

export const DEFAULT_REELS: Reel[] = [
  {
    id: 'main-flower',
    name: 'Main Flower',
    items: [
      'Thai Rose',
      'Aisha Rose',
      'Chanel Rose',
      'Tulip',
      'Sunflower',
      'Classic Lily',
      'Stargazer Lily',
      'Peony',
      'African Daisy',
    ].map(flower),
  },
  {
    id: 'secondary-flower',
    name: 'Secondary Flower',
    items: [
      'Daisy',
      'Calla Lily',
      'Champion Flower',
      'Wild Flower',
      'Windbell Flower',
      'Lily of the Valley',
      'Freesia',
      'Peruvian Daffodil',
      'Dried Violet',
      'Pompon',
      'Lavender',
    ].map(flower),
  },
  {
    id: 'filler',
    name: 'Filler',
    items: [
      "Forget-Me-Not",
      "Baby's Breath",
      'Cotton',
      'Snowberry',
      'Winter Jasmine',
      'Creeping Woodsorrel',
    ].map(flower),
  },
  {
    id: 'greenery',
    name: 'Greenery',
    items: [
      'Fern Leaf',
      'Eucalyptus Leaf',
      'Four Clover Leaf',
      'Four-Season Leaf',
      'Oat Grass',
      'Small Bracken',
      'Leaf Vine',
      'Bamboo Leaf',
      'Cinnamon Leaf',
      'Sage Leaf',
    ].map(flower),
  },
  {
    id: 'colour',
    name: 'Colour',
    isColour: true,
    items: [
      { id: 'white', name: 'White', image: '' },
      { id: 'pink', name: 'Pink', image: '' },
      { id: 'green', name: 'Green', image: '' },
      { id: 'yellow', name: 'Yellow', image: '' },
      { id: 'blue', name: 'Blue', image: '' },
      { id: 'purple', name: 'Purple', image: '' },
      { id: 'red', name: 'Red', image: '' },
      { id: 'brown', name: 'Brown', image: '' },
    ],
  },
];

export const COLOUR_MAP: Record<string, string> = {
  white: '#F8F8F8',
  pink: '#FF69B4',
  green: '#3CB371',
  yellow: '#FFD700',
  blue: '#4169E1',
  purple: '#9B59B6',
  red: '#DC143C',
  brown: '#8B4513',
};
