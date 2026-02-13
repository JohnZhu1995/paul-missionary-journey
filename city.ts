// ============================================
// 保罗传道旅程 - 城市类模块
// 职责：管理城市的属性和进度
// ============================================

import { CITY_CONFIG } from './constants.js';

class City {
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

  constructor(cityId: string) {
    const config = CITY_CONFIG[cityId];
    if (!config) {
      throw new Error(`Unknown city: ${cityId}`);
    }
    
    this.id = cityId;
    this.name = config.name;
    this.nameChinese = config.nameChinese;
    this.difficulty = config.difficulty;
    this.maxTurns = config.maxTurns;
    this.currentTurn = 1;
    this.description = config.description;
    this.isCompleted = false;
    this.letterWritten = false;
    this.disciplesGained = 0;
    this.reputationGained = 0;
    this.basePersecutionRate = config.basePersecutionRate;
  }

  advanceTurn(): boolean {
    this.currentTurn++;
    if (this.currentTurn >= this.maxTurns) {
      this.isCompleted = true;
      return true;
    }
    return false;
  }

  getRemainingTurns(): number {
    return this.maxTurns - this.currentTurn;
  }

  getProgress(): number {
    return (this.currentTurn / this.maxTurns) * 100;
  }

  hasMoreRounds(): boolean {
    return this.currentTurn < this.maxTurns;
  }

  nextRound(): void {
    this.currentTurn++;
  }

  addDisciples(count: number): void {
    this.disciplesGained += count;
  }

  addReputation(amount: number): void {
    this.reputationGained += amount;
  }

  getRoundInfo(): string {
    return `${this.nameChinese}(${this.name}) - 第 ${this.currentTurn}/${this.maxTurns} 回合`;
  }

  getSummary(): string {
    return `${this.nameChinese}(${this.name}) - 回合: ${this.currentTurn}/${this.maxTurns}, 获得门徒: ${this.disciplesGained}, 声望: +${this.reputationGained}`;
  }
}

export { City };
