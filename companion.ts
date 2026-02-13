// ============================================
// 保罗传道旅程 - 同工类模块
// 职责：定义同工(Companion)类，管理同工的属性和行为
// ============================================

import { ResourceChange, ActionType, CompanionTaskType, SpecialtyType } from './types.js';
import { COMPANION_TASKS } from './constants.js';

class Companion {
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

  constructor(
    id: string,
    name: string,
    nameChinese: string,
    specialty: SpecialtyType,
    specialtyName: string,
    specialtyDescription: string
  ) {
    this.id = id;
    this.name = name;
    this.nameChinese = nameChinese;
    this.stamina = 100;
    this.maxStamina = 100;
    this.morale = 80;
    this.specialty = specialty;
    this.specialtyName = specialtyName;
    this.specialtyDescription = specialtyDescription;
    this.isActive = true;
    this.currentTask = null;
  }

  applySpecialtyEffect(action: ActionType): ResourceChange {
    let bonus: ResourceChange = {};
    
    switch (this.specialty) {
      case 'preaching':
        if (action === 'preach') {
          bonus = { reputation: 5, disciples: 1 };
        }
        break;
      case 'crafting':
        if (action === 'tentmaking') {
          bonus = { stamina: 10, provision: 5 };
        }
        break;
      case 'healing':
        if (action === 'preach' || action === 'disciple') {
          bonus = { faith: 8, reputation: 3 };
        }
        break;
      case 'teaching':
        if (action === 'disciple') {
          bonus = { disciples: 2, stability: 5 };
        }
        break;
      case 'defense':
        if (action === 'preach') {
          bonus = { reputation: 4, persecution: -3 };
        }
        break;
      case 'counselor':
        if (action === 'disciple' || action === 'rest') {
          bonus = { morale: 10, stability: 5 };
        }
        break;
      case 'resilient':
        if (action === 'preach') {
          bonus = { stamina: 5, persecution: -5 };
        }
        break;
      case 'scribe':
        if (action === 'write_letter') {
          bonus = { reputation: 10 };
        }
        break;
    }
    
    return bonus;
  }

  getEfficiency(): number {
    const staminaRatio = this.stamina / this.maxStamina;
    const moraleFactor = this.morale / 100;
    return (staminaRatio * 0.6 + moraleFactor * 0.4);
  }

  assignTask(task: CompanionTaskType): { success: boolean; message: string; effect: ResourceChange } {
    const taskInfo = COMPANION_TASKS[task];
    
    if (this.stamina < taskInfo.staminaCost) {
      return { success: false, message: `${this.nameChinese}体力不足，无法执行${taskInfo.nameChinese}任务`, effect: {} };
    }
    
    this.currentTask = task;
    this.stamina -= taskInfo.staminaCost;
    
    // 特殊专长加成
    let bonusEffect: ResourceChange = {};
    if (this.specialty === 'teaching' && task === 'teach') {
      bonusEffect = { disciples: 1 };
    } else if (this.specialty === 'scribe' && task === 'assist_writing') {
      bonusEffect = { reputation: 5 };
    } else if (this.specialty === 'counselor' && task === 'visitation') {
      bonusEffect = { stability: 5, morale: 5 };
    }
    
    const finalEffect = { ...taskInfo.effect, ...bonusEffect };
    
    return { 
      success: true, 
      message: `${this.nameChinese}成功执行${taskInfo.nameChinese}任务`, 
      effect: finalEffect 
    };
  }

  recoverStamina(): void {
    this.stamina = Math.min(this.stamina + 20, this.maxStamina);
  }

  getStatus(): string {
    const statusSymbol = this.isActive ? '✅' : '❌';
    return `${statusSymbol} ${this.nameChinese}(${this.name}) - 体力: ${this.stamina}/${this.maxStamina}, 士气: ${this.morale}%, 专长: ${this.specialtyName}`;
  }

  // 紧凑格式（单行）
  getCompactStatus(): string {
    const staminaBar = this.getProgressBar(this.stamina, this.maxStamina, 6);
    const moraleStr = `${this.morale}%`;
    const efficiency = Math.round(this.getEfficiency() * 100);
    return `${this.nameChinese}[${this.specialtyName}] 体:${staminaBar}${moraleStr.padStart(4)} 效:${efficiency.toString().padStart(3)}%`;
  }
  
  // 用于表格的极紧凑格式
  getUltraCompactStatus(): string {
    const efficiency = Math.round(this.getEfficiency() * 100);
    const effSymbol = efficiency >= 80 ? '🟢' : efficiency >= 50 ? '🟡' : '🔴';
    return `${this.nameChinese}[${this.specialtyName}] 体:${this.stamina.toString().padStart(3)} 士:${this.morale.toString().padStart(3)}% ${effSymbol}`;
  }
  
  // 团队视图格式
  getTeamViewStatus(): string {
    return `${this.nameChinese}[${this.specialtyName}] 💪${this.stamina}  😊${this.morale}%`;
  }
  
  private getProgressBar(value: number, max: number, width: number): string {
    const filled = Math.round((value / max) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
}

export { Companion };
