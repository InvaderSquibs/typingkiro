export type FamilySize = 'small' | 'medium' | 'large';

export interface FamilyConfig {
  memberCount: number;
  wordLength: { min: number; max: number };
  pointValue: number;
  speed: number;
  color: string;
}

export const FAMILY_CONFIGS: Record<FamilySize, FamilyConfig> = {
  small: {
    memberCount: 2,
    wordLength: { min: 3, max: 5 },
    pointValue: 10,
    speed: 50,
    color: '#A469D6', // Purple-300
  },
  medium: {
    memberCount: 4,
    wordLength: { min: 6, max: 8 },
    pointValue: 25,
    speed: 40,
    color: '#7A27B8', // Purple-400
  },
  large: {
    memberCount: 6,
    wordLength: { min: 9, max: 12 },
    pointValue: 50,
    speed: 30,
    color: '#5B1391', // Purple-500
  },
};

export type SpawnDirection = 'left' | 'right';

export interface Family {
  id: string;
  size: FamilySize;
  word: string;
  typedIndex: number;
  position: { x: number; y: number };
  velocity: number;
  pointValue: number;
  atDoor: boolean;
  damageTimer: number;
  memberCount: number;
  color: string;
  scared: boolean;
  scaredTimer: number;
  direction: SpawnDirection; // Which side they spawned from
}

export function createFamily(
  id: string,
  size: FamilySize,
  word: string,
  startX: number,
  startY: number,
  direction: SpawnDirection = 'left'
): Family {
  const config = FAMILY_CONFIGS[size];
  
  return {
    id,
    size,
    word,
    typedIndex: 0,
    position: { x: startX, y: startY },
    velocity: config.speed,
    pointValue: config.pointValue,
    atDoor: false,
    damageTimer: 0,
    memberCount: config.memberCount,
    color: config.color,
    scared: false,
    scaredTimer: 0,
    direction,
  };
}
