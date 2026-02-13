// ============================================
// 保罗传道旅程 - 类型定义模块
// 职责：定义游戏中使用的所有类型和接口
// ============================================

type ResourceChange = {
  faith?: number;
  stamina?: number;
  reputation?: number;
  churches?: number;
  disciples?: number;
  provision?: number;
  stability?: number;
  persecution?: number;
  morale?: number;
};

type ActionType = 'preach' | 'tentmaking' | 'disciple' | 'rest' | 'write_letter';

type CompanionTaskType = 'preach' | 'tentmaking' | 'heal' | 'teach' | 'defend' | 'visitation' | 'logistics' | 'assist_writing' | 'rest';

type SpecialtyType = 'preaching' | 'crafting' | 'healing' | 'teaching' | 'defense' | 'counselor' | 'resilient' | 'scribe';

interface Action {
  id: ActionType;
  name: string;
  nameChinese: string;
  description: string;
  cost: ResourceChange;
  effect: ResourceChange;
  minDisciples?: number;
  requiresCompanion?: boolean;
}

interface LetterEffect {
  cityId: string;
  effect: ResourceChange;
  description: string;
}

interface GameEvent {
  id: string;
  name: string;
  type: 'event' | 'decision';
  title?: string;
  description: string;
  text?: string;
  effect: ResourceChange;
  choices?: {
    label: string;
    description: string;
    effect: ResourceChange;
  }[];
}

interface DecisionEvent {
  id: string;
  name: string;
  type: 'decision';
  title?: string;
  description: string;
  text?: string;
  condition: (player: Player, city: City) => boolean;
  choices: {
    label: string;
    description: string;
    text: string;
    effect: ResourceChange;
    consequence: string;
  }[];
}

// 前置声明，避免循环依赖
interface Player {
  faith: number;
  stamina: number;
  maxStamina: number;
  reputation: number;
  churches: number;
  disciples: number;
  provision: number;
  stability: number;
  persecution: number;
  morale: number;
  companions: Companion[];
  visitedCities: string[];
  currentCity: string | null;
  addCompanion(companion: Companion): void;
  removeCompanion(companionId: string): boolean;
  getActiveCompanions(): Companion[];
  consumeResources(cost: ResourceChange): boolean;
  applyEffects(effect: ResourceChange): void;
  rest(): void;
  isAlive(): boolean;
  getStatus(): string;
}

interface City {
  id: string;
  name: string;
  nameChinese: string;
  difficulty: number;
  maxTurns: number;
  currentTurn: number;
  description: string;
  isCompleted: boolean;
  letterWritten: boolean;
  disciplesGained: number;
  reputationGained: number;
  basePersecutionRate: number;
  advanceTurn(): boolean;
  getRemainingTurns(): number;
  getProgress(): number;
  hasMoreRounds(): boolean;
  nextRound(): void;
  addDisciples(count: number): void;
  addReputation(amount: number): void;
  getRoundInfo(): string;
  getSummary(): string;
}

interface Companion {
  id: string;
  name: string;
  nameChinese: string;
  stamina: number;
  maxStamina: number;
  morale: number;
  specialty: SpecialtyType;
  specialtyName: string;
  specialtyDescription: string;
  isActive: boolean;
  currentTask: CompanionTaskType | null;
  applySpecialtyEffect(action: ActionType): ResourceChange;
  getEfficiency(): number;
  assignTask(task: CompanionTaskType): { success: boolean; message: string; effect: ResourceChange };
  recoverStamina(): void;
  getStatus(): string;
}

export {
  ResourceChange,
  ActionType,
  CompanionTaskType,
  SpecialtyType,
  Action,
  LetterEffect,
  GameEvent,
  DecisionEvent,
  Player,
  City,
  Companion,
};
