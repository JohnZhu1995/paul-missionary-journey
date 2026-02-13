// ============================================
// 保罗传道旅程 - 玩家类模块
// 职责：管理玩家（保罗）的属性和行为
// ============================================

import { ResourceChange } from './types.js';
import { Companion } from './companion.js';
import { INITIAL_RESOURCES } from './constants.js';

class Player {
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

  constructor() {
    this.faith = INITIAL_RESOURCES.faith || 100;
    this.stamina = INITIAL_RESOURCES.stamina || 100;
    this.maxStamina = 100;
    this.reputation = INITIAL_RESOURCES.reputation || 50;
    this.churches = INITIAL_RESOURCES.churches || 0;
    this.disciples = INITIAL_RESOURCES.disciples || 0;
    this.provision = INITIAL_RESOURCES.provision || 100;
    this.stability = INITIAL_RESOURCES.stability || 50;
    this.persecution = INITIAL_RESOURCES.persecution || 0;
    this.morale = INITIAL_RESOURCES.morale || 80;
    this.companions = [];
    this.visitedCities = [];
    this.currentCity = null;
  }

  addCompanion(companion: Companion): void {
    this.companions.push(companion);
  }

  removeCompanion(companionId: string): boolean {
    const index = this.companions.findIndex(c => c.id === companionId);
    if (index !== -1) {
      this.companions.splice(index, 1);
      return true;
    }
    return false;
  }

  getActiveCompanions(): Companion[] {
    return this.companions.filter(c => c.isActive);
  }

  consumeResources(cost: ResourceChange): boolean {
    if (cost.faith && this.faith < cost.faith) return false;
    if (cost.stamina && this.stamina < cost.stamina) return false;
    if (cost.reputation && this.reputation < cost.reputation) return false;
    if (cost.disciples && this.disciples < cost.disciples) return false;
    if (cost.provision && this.provision < cost.provision) return false;

    if (cost.faith) this.faith -= cost.faith;
    if (cost.stamina) this.stamina -= cost.stamina;
    if (cost.reputation) this.reputation -= cost.reputation;
    if (cost.disciples) this.disciples -= cost.disciples;
    if (cost.provision) this.provision -= cost.provision;

    return true;
  }

  applyEffects(effect: ResourceChange): void {
    if (effect.faith !== undefined) this.faith = Math.min(this.faith + effect.faith, 200);
    if (effect.stamina !== undefined) this.stamina = Math.min(this.stamina + effect.stamina, this.maxStamina);
    if (effect.reputation !== undefined) this.reputation = Math.min(this.reputation + effect.reputation, 200);
    if (effect.churches !== undefined) this.churches += effect.churches;
    if (effect.disciples !== undefined) this.disciples += effect.disciples;
    if (effect.provision !== undefined) this.provision = Math.min(this.provision + effect.provision, 150);
    if (effect.stability !== undefined) this.stability = Math.min(Math.max(this.stability + effect.stability, 0), 100);
    if (effect.persecution !== undefined) this.persecution = Math.min(Math.max(this.persecution + effect.persecution, 0), 100);
    if (effect.morale !== undefined) this.morale = Math.min(Math.max(this.morale + effect.morale, 0), 100);
  }

  rest(): void {
    this.stamina = Math.min(this.stamina + 30, this.maxStamina);
    this.faith = Math.min(this.faith + 15, 200);
    
    // 恢复同工体力
    for (const companion of this.companions) {
      companion.recoverStamina();
    }
  }

  isAlive(): boolean {
    return this.stamina > 0 && this.provision > 0;
  }

  getStatus(): string {
    return `
┌─────────────────────────────────────────┐
│  保罗的状态                              │
├─────────────────────────────────────────┤
│  信心 (Faith):         ${this.faith.toString().padStart(3)}/200  │
│  体力 (Stamina):       ${this.stamina.toString().padStart(3)}/100  │
│  声望 (Reputation):    ${this.reputation.toString().padStart(3)}/200  │
│  教会 (Churches):      ${this.churches.toString().padStart(3)}      │
│  门徒 (Disciples):     ${this.disciples.toString().padStart(3)}      │
│  物资 (Provision):     ${this.provision.toString().padStart(3)}/150  │
│  稳定 (Stability):     ${this.stability.toString().padStart(3)}/100  │
│  逼迫 (Persecution):   ${this.persecution.toString().padStart(3)}/100  │
│  士气 (Morale):        ${this.morale.toString().padStart(3)}/100  │
└─────────────────────────────────────────┘`;
  }
  
  // 团队视图状态 - 返回关键资源对象
  getTeamViewStatus(): { 
    stamina: string;
    provision: string;
    stability: string;
    persecution: string;
    reputation: string;
    faith: string;
  } {
    return {
      stamina: `${this.stamina}/${this.maxStamina}`,
      provision: `${this.provision}/150`,
      stability: `${this.stability}/100`,
      persecution: `${this.persecution}/100`,
      reputation: `${this.reputation}/200`,
      faith: `${this.faith}/200`,
    };
  }

  // 紧凑格式状态显示（单行）
  getCompactStatus(): string {
    const faithBar = this.getProgressBar(this.faith, 200, 10);
    const staminaBar = this.getProgressBar(this.stamina, 100, 10);
    const repBar = this.getProgressBar(this.reputation, 200, 10);
    const provBar = this.getProgressBar(this.provision, 150, 10);
    const stabBar = this.getProgressBar(this.stability, 100, 10);
    const persBar = this.getProgressBar(this.persecution, 100, 10);
    
    const line1 = `┌─ 保罗 ─┬─ 信心:${faithBar} ${this.faith.toString().padStart(3)}/200 ─┬─ 体力:${staminaBar} ${this.stamina.toString().padStart(3)}/100 ─┬─ 声望:${repBar} ${this.reputation.toString().padStart(3)}/200 ─┐`;
    const line2 = `└─ 教会:${this.churches.toString().padStart(2)} ─┴─ 门徒:${this.disciples.toString().padStart(3)} ─┴─ 物资:${provBar} ${this.provision.toString().padStart(3)}/150 ─┴─ 稳定:${stabBar} ${this.stability.toString().padStart(3)}/100 ─┴─ 逼迫:${persBar} ${this.persecution.toString().padStart(3)}/100 ─┘`;
    
    return `${line1}\n${line2}`;
  }
  
  private getProgressBar(value: number, max: number, width: number): string {
    const filled = Math.round((value / max) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
}

export { Player };
