export type CategoryType = 
  | 'rios' 
  | 'montanas' 
  | 'picos' 
  | 'costas' 
  | 'mares'
  | 'islas' 
  | 'unidades_relieve';

export type VertienteType = 'cantabrico' | 'atlantico' | 'mediterraneo' | 'interior' | 'insular';

export type DifficultyLevel = 'facil' | 'medio' | 'avanzado';

export interface GeoElement {
  id: string;
  name: string;
  category: CategoryType;
  subCategory?: string; // e.g. "Río Principal", "Afluente", "Cabo", "Golfo", "Isla Balear", "Isla Canaria", "Cordillera"
  vertiente?: VertienteType;
  difficulty: DifficultyLevel;
  description: string;
  curiosity: string; // Fun fact tailored for 12-14 year olds
  elevationOrLength?: string; // e.g. "3.479 m" or "1.007 km"
  // Map positioning:
  mapX: number; // Center X in SVG coordinate system (0 to 1000)
  mapY: number; // Center Y in SVG coordinate system (0 to 750)
  svgType: 'point' | 'polyline' | 'polygon';
  svgPath?: string; // If polyline (river) or polygon (range)
  labelOffset?: { x: number; y: number };
}

export type GameMode = 'explorar' | 'reto_localizar' | 'reto_identificar' | 'contrarreloj' | 'imprimir';

export interface PlayerStats {
  xp: number;
  level: number;
  correctAnswers: number;
  totalAttempts: number;
  streak: number;
  maxStreak: number;
  unlockedBadges: string[];
  completedCategories: string[];
  visitedAtlasElements?: string[];
  atlasStampUnlocked?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredXp?: number;
  categoryRequirement?: { category: CategoryType; count: number };
  conditionDesc: string;
}

export interface QuizQuestion {
  targetElement: GeoElement;
  questionType: 'localizar' | 'identificar';
  options?: GeoElement[]; // 4 options when identifying
  prompt: string;
}
