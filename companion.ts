// ============================================
// 保罗传道旅程 - 同工类模块
// 职责：定义同工(Companion)类，管理同工的属性和行为
// ============================================

import { ResourceChange, ActionType, CompanionTaskType, SpecialtyType } from './types.js';
import { COMPANION_TASKS } from './constants.js';

// 专长类型对应的头像 emoji
const SPECIALTY_AVATARS: Record<SpecialtyType, string> = {
  preaching: '🎙️',    // 宣道者 - 麦克风
  counselor: '🤗',    // 劝慰者 - 拥抱
  resilient: '🛡️',    // 坚韧者 - 盾牌
  scribe: '📝',       // 书记 - 写作
  healing: '✋',       // 医治 - 医治的手
  crafting: '🏕️',     // 织造 - 帐篷
  teaching: '📚',     // 教师 - 书本
  defense: '⚔️',      // 辩护 - 剑与盾
};

class Companion {
  id: string;
  name: string;
  nameChinese: string;
  stamina: number;
  maxStamina: number;
  spirit: number; // 灵力（个人资源）
  maxSpirit: number;
  specialty: SpecialtyType;
  specialtyName: string;
  specialtyDescription: string;
  isActive: boolean;
  currentTask: CompanionTaskType | null;
  avatarEmoji: string;

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
    this.spirit = 100; // 初始灵力100
    this.maxSpirit = 200;
    this.specialty = specialty;
    this.specialtyName = specialtyName;
    this.specialtyDescription = specialtyDescription;
    this.isActive = true;
    this.currentTask = null;
    this.avatarEmoji = SPECIALTY_AVATARS[specialty] || '👤';
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
          bonus = { spirit: 8, reputation: 3 };
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
          bonus = { spirit: 10, stability: 5 }; // 劝慰者恢复灵力
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

  assignTask(task: CompanionTaskType): { success: boolean; message: string; effect: ResourceChange } {
    const taskInfo = COMPANION_TASKS[task];
    
    if (this.stamina < taskInfo.staminaCost) {
      return { success: false, message: `${this.nameChinese}体力不足，无法执行「${taskInfo.nameChinese}」`, effect: {} };
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
      bonusEffect = { stability: 5, spirit: 5 }; // 探访恢复灵力
    }
    
    const finalEffect = { ...taskInfo.effect, ...bonusEffect };
    
    return { 
      success: true, 
      message: `${this.nameChinese}执行「${taskInfo.nameChinese}」`, 
      effect: finalEffect 
    };
  }

  recoverStamina(): void {
    this.stamina = Math.min(this.stamina + 20, this.maxStamina);
  }

  getStatus(): string {
    const statusSymbol = this.isActive ? '✅' : '❌';
    return `${statusSymbol} ${this.nameChinese}(${this.name}) - 体力: ${this.stamina}/${this.maxStamina}, 灵力: ${this.spirit}/${this.maxSpirit}, 专长: ${this.specialtyName}`;
  }

  // 团队视图格式
  getTeamViewStatus(): string {
    return `${this.nameChinese}[${this.specialtyName}] 💪${this.stamina}  ✝️${this.spirit}`;
  }
  
  private getProgressBar(value: number, max: number, width: number): string {
    const filled = Math.round((value / max) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
}

export { Companion };
