// src/components/game/Zeke/GameData.ts

export interface GameItem {
  id: string;
  name: string; // Tagalog name - THIS STAYS TAGALOG
  image?: string;
  imagePlaceholder?: string; 
  categoryKey: 'plantResources' | 'mineralResources' | 'edibleFauna' | 'edibleFlora' | 'nonEdibleProducts' | 'helpfulActions' | 'harmfulActions';
  careTip?: string; // English tip
  learnMore?: string; // New field for a fun educational fact (English)
}

export interface Category {
  key: GameItem['categoryKey'];
  title: string; // English title for the bin
  color: string; // Hex color for the bin (Duolingo palette)
  textColor?: string; // Optional text color for the bin title 
}

export interface GameLevel {
  level: number;
  title: string; // English title for the level
  items: GameItem[];
  categories: Category[];
  instructions: string; // English instructions
}

// Duolingo Palette
const DUOLINGO_GREEN = '#58CC02';
const DUOLINGO_YELLOW = '#FFDE59';
const DUOLINGO_BLUE = '#1CB0F6';
const DUOLINGO_RED = '#FF5959';
const TEXT_BLACK = '#000000'; // Using a darker black for better contrast
const TEXT_WHITE = '#FFFFFF';

// --- LEVEL 1 DATA: Land Resources (Expanded) ---
const level1Items: GameItem[] = [
  { id: 'l1item1', name: 'Puno', image: '/images/likas-na-yaman/Puno.svg', categoryKey: 'plantResources', careTip: 'Planting trees helps the environment.', learnMore: 'Trees give us oxygen to breathe and are homes for many animals!' },
  { id: 'l1item2', name: 'Palay', image: '/images/likas-na-yaman/palay.svg', categoryKey: 'plantResources', careTip: 'Rice is a staple food, conserve it.', learnMore: 'Palay is the plant, and Bigas is the grain. When cooked, it becomes Kanin!' },
  { id: 'l1item3', name: 'Ginto', image: '/images/likas-na-yaman/ginto.svg', categoryKey: 'mineralResources', careTip: 'Gold is a valuable but finite resource.', learnMore: 'Gold is so soft, it can be molded into many shapes. It\'s used in jewelry and even electronics!' },
  { id: 'l1item4', name: 'Tanso', image: '/images/likas-na-yaman/tanso.svg', categoryKey: 'mineralResources', careTip: 'Copper is used in wires and pipes.', learnMore: 'Copper is a great conductor of electricity, that\'s why it\'s in wires!' },
  { id: 'l1item5', name: 'Mais', image: '/images/likas-na-yaman/mais.svg', categoryKey: 'plantResources', careTip: 'Corn can be eaten or used for animal feed.', learnMore: 'Did you know popcorn is made from a special kind of mais (corn)?' },
  { id: 'l1item6', name: 'Bakal', image: '/images/likas-na-yaman/bakal.svg', categoryKey: 'mineralResources', careTip: 'Iron is strong and used for construction.', learnMore: 'Bakal (Iron) can be made into steel, which is super strong for buildings and cars!' },
  { id: 'l1item7', name: 'Bulaklak', image: '/images/likas-na-yaman/bulaklak.svg', categoryKey: 'plantResources', careTip: 'Flowers beautify our surroundings and help pollinators.', learnMore: 'Bees love bulaklak (flowers) because they get nectar to make honey!' },
  { id: 'l1item8', name: 'Karbon (Coal)', image: '/images/likas-na-yaman/coal.svg', categoryKey: 'mineralResources', careTip: 'Coal is a fossil fuel; burning it impacts air quality.', learnMore: 'Karbon (Coal) was formed from ancient plants millions of years ago!' },
  { id: 'l1item9', name: 'Gulay (Kamatis)', image: '/images/likas-na-yaman/kamatis.svg', categoryKey: 'plantResources', careTip: 'Vegetables are important for a healthy diet.', learnMore: 'Kamatis (Tomato) is actually a fruit, but we often use it like a vegetable in cooking!' },
  { id: 'l1item10', name: 'Buhangin', image: '/images/likas-na-yaman/buhangin.svg', categoryKey: 'mineralResources', careTip: 'Sand is used for construction and beaches.', learnMore: 'Buhangin (Sand) is made of tiny pieces of rocks and minerals, worn down over time.' },
];

const level1Categories: Category[] = [
  { key: 'plantResources', title: 'Plant-based Resources', color: DUOLINGO_GREEN, textColor: TEXT_WHITE }, 
  { key: 'mineralResources', title: 'Mineral & Rock Resources', color: DUOLINGO_BLUE, textColor: TEXT_WHITE }, 
];

// --- LEVEL 2 DATA: Uses of Natural Resources ---
const level2Items: GameItem[] = [
  { id: 'l2item1', name: 'Isda (Tilapia)', image: '/images/likas-na-yaman/2isda.svg', categoryKey: 'edibleFauna', careTip: 'Fish are a good source of protein.', learnMore: 'Tilapia can live in both fresh and slightly salty water!' },
  { id: 'l2item2', name: 'Prutas (Mangga)', image: '/images/likas-na-yaman/2mangga.svg', categoryKey: 'edibleFlora', careTip: 'Fruits are rich in vitamins.', learnMore: 'The Philippines is famous for its sweet Mangga (Mangoes)!' },
  { id: 'l2item3', name: 'Mesa (Kahoy)', image: '/images/likas-na-yaman/2Mesa.svg', categoryKey: 'nonEdibleProducts', careTip: 'Wooden tables come from trees.', learnMore: 'Different kinds of kahoy (wood) make mesas (tables) of different colors and strengths.' },
  { id: 'l2item4', name: 'Alahas (Ginto)', image: '/images/likas-na-yaman/alahas.svg', categoryKey: 'nonEdibleProducts', careTip: 'Jewelry can be made from precious metals.', learnMore: 'Alahas (Jewelry) made from ginto (gold) can last for a very, very long time!' },
  { id: 'l2item5', name: 'Manok', image: '/images/likas-na-yaman/2manok.svg', categoryKey: 'edibleFauna', careTip: 'Chicken is a common food source.', learnMore: 'Manok (Chickens) can\'t fly very far, but they are great runners!' },
  { id: 'l2item6', name: 'Kanin (Bigas)', image: '/images/likas-na-yaman/palay.svg', categoryKey: 'edibleFlora', careTip: 'Cooked rice is a staple in many diets.', learnMore: 'Kanin (Cooked Rice) gives us energy to play and learn all day!' },
  { id: 'l2item7', name: 'Damit (Bulak)', image: '/images/likas-na-yaman/2bulak.svg', categoryKey: 'nonEdibleProducts', careTip: 'Cotton plants provide fiber for clothes.', learnMore: 'Bulak (Cotton) is a soft fiber that grows around the seeds of the cotton plant.' },
  { id: 'l2item8', name: 'Lapis (Graphite/Kahoy)', image: '/images/likas-na-yaman/2lapis.svg', categoryKey: 'nonEdibleProducts', careTip: 'Pencils use wood and graphite (a mineral).', learnMore: 'The "lead" in your lapis (pencil) is actually graphite, a type of mineral, mixed with clay!' },
  { id: 'l2item9', name: 'Gatas (Baka)', image: '/images/likas-na-yaman/2gatas.svg', categoryKey: 'edibleFauna', careTip: 'Milk comes from animals like cows.', learnMore: 'Gatas (Milk) from baka (cows) helps build strong bones because it has calcium!' },
  { id: 'l2item10', name: 'Tinapay (Trigo)', image: '/images/likas-na-yaman/2tinapay.svg', categoryKey: 'edibleFlora', careTip: 'Bread is made from grains like wheat.', learnMore: 'Trigo (Wheat) is a type of grass, and its seeds are ground to make flour for tinapay (bread).' },
];

const level2Categories: Category[] = [
  { key: 'edibleFauna', title: 'Edible: From Animals', color: DUOLINGO_YELLOW, textColor: TEXT_BLACK }, 
  { key: 'edibleFlora', title: 'Edible: From Plants', color: DUOLINGO_GREEN, textColor: TEXT_WHITE }, 
  { key: 'nonEdibleProducts', title: 'Non-Edible Products', color: DUOLINGO_BLUE, textColor: TEXT_WHITE }, 
];

// --- LEVEL 3 DATA: Caring for Our Resources ---
const level3Items: GameItem[] = [
  { id: 'l3item1', name: 'Pagtatanim ng Puno', image: '/images/likas-na-yaman/3pagtatanim.svg', categoryKey: 'helpfulActions', careTip: 'Planting trees helps combat deforestation.', learnMore: 'One tree can absorb many kilograms of carbon dioxide in its lifetime!' },
  { id: 'l3item2', name: 'Pag-recycle ng Basura', image: '/images/likas-na-yaman/3pagrecyle.svg', categoryKey: 'helpfulActions', careTip: 'Recycling reduces waste and conserves resources.', learnMore: 'Recycling an aluminum can saves enough energy to run a TV for 3 hours!' },
  { id: 'l3item3', name: 'Pagtitipid ng Tubig', image: '/images/likas-na-yaman/3pagtitipid.svg', categoryKey: 'helpfulActions', careTip: 'Conserving water is crucial, especially in dry areas.', learnMore: 'Turning off the tap while brushing your teeth can save many liters of water each day!' },
  { id: 'l3item4', name: 'Pagpuputol ng mga Puno (Illegal Logging)', image: '/images/likas-na-yaman/3pagpuputol.svg', categoryKey: 'harmfulActions', careTip: 'Illegal logging destroys habitats.', learnMore: 'When forests are cut down, animals lose their homes and the soil can wash away.' },
  { id: 'l3item5', name: 'Pagtatapon ng Basura sa Ilog', image: '/images/likas-na-yaman/3pagtatapon.svg', categoryKey: 'harmfulActions', careTip: 'Polluting rivers harms aquatic life and water quality.', learnMore: 'Trash in rivers can travel to the ocean and harm sea creatures like turtles and fish.' },
  { id: 'l3item6', name: 'Pagsusunog ng Plastik', image: '/images/likas-na-yaman/3pagsusunog.svg', categoryKey: 'harmfulActions', careTip: 'Burning plastics releases harmful toxins into the air.', learnMore: 'The smoke from burning plastic can make the air unhealthy to breathe for people and animals.' },
  { id: 'l3item7', name: 'Paggamit ng Eco Bag', image: '/images/likas-na-yaman/3ecobag.svg', categoryKey: 'helpfulActions', careTip: 'Using reusable bags reduces plastic waste.', learnMore: 'One reusable bag can replace hundreds of single-use plastic bags over its lifetime!' },
  { id: 'l3item8', name: 'Sobra-sobrang Pagmimina', image: '/images/likas-na-yaman/3pagmimina.svg', categoryKey: 'harmfulActions', careTip: 'Over-mining can lead to land degradation and pollution.', learnMore: 'When too much is mined too quickly, it can damage the land and nearby water sources for a long time.' },
];

const level3Categories: Category[] = [
  { key: 'helpfulActions', title: 'Helpful Actions', color: DUOLINGO_GREEN, textColor: TEXT_WHITE }, 
  { key: 'harmfulActions', title: 'Harmful Actions', color: DUOLINGO_RED, textColor: TEXT_WHITE }, 
];


export const gameLevels: GameLevel[] = [
  {
    level: 1,
    title: 'Level 1: Identify Land Resources!',
    items: level1Items,
    categories: level1Categories,
    instructions: 'Drag each item to the correct box: Plant-based or Mineral/Rock Resource.',
  },
  {
    level: 2,
    title: 'Level 2: Resource Uses!',
    items: level2Items,
    categories: level2Categories,
    instructions: 'Sort by what we get: Edible from Animals, Edible from Plants, or Non-Edible Products.',
  },
  {
    level: 3,
    title: 'Level 3: Caring for Nature!',
    items: level3Items,
    categories: level3Categories,
    instructions: 'Which of these actions are Helpful for nature, and which are Harmful?',
  }
];