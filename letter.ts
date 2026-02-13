// ============================================
// 保罗传道旅程 - 书信系统模块
// 职责：管理书信的撰写、收集和效果应用
// ============================================

import { ResourceChange, LetterEffect, Player } from './types.js';
import { CITY_CONFIG } from './constants.js';
import { City } from './city.js';

class LetterSystem {
  epistleCollection: Map<string, boolean>;
  cityLetterEffects: Map<string, LetterEffect[]>;
  letterScore: number;

  constructor() {
    this.epistleCollection = new Map();
    this.cityLetterEffects = new Map();
    this.letterScore = 0;
    this.initializeEpistles();
  }

  initializeEpistles(): void {
    // 加拉太书
    this.cityLetterEffects.set('galatians', [{
      cityId: 'galatia',
      effect: { faith: 20, reputation: 10, stability: 15 },
      description: '加拉太书：维护因信称义的真理'
    }]);
    
    // 腓立比书
    this.cityLetterEffects.set('philippians', [{
      cityId: 'philippi',
      effect: { faith: 25, reputation: 15, disciples: 2, stability: 10 },
      description: '腓立比书：在患难中喜乐，追求基督里的合一'
    }]);
    
    // 以弗所书
    this.cityLetterEffects.set('ephesians', [{
      cityId: 'ephesus',
      effect: { faith: 30, reputation: 20, churches: 1, stability: 20 },
      description: '以弗所书：教会的奥秘，信徒在基督里的地位'
    }]);
    
    // 歌罗西书
    this.cityLetterEffects.set('colossians', [{
      cityId: 'colossae',
      effect: { faith: 20, disciples: 2, stability: 15 },
      description: '歌罗西书：基督的至高无上'
    }]);
    
    // 腓利门书
    this.cityLetterEffects.set('philemon', [{
      cityId: 'colossae',
      effect: { reputation: 15, faith: 10, stability: 5 },
      description: '腓利门书：弟兄相爱，饶恕与接纳'
    }]);
  }

  canWriteLetter(cityId: string, player: Player): boolean {
    const cityConfig = CITY_CONFIG[cityId];
    if (!cityConfig) return false;
    
    // 检查是否已经在该城市写过信
    if (this.epistleCollection.get(cityId)) return false;
    
    // 检查门徒数量是否足够
    if (player.disciples < 3) return false;
    
    // 检查信心值是否足够
    if (player.faith < 30) return false;
    
    return true;
  }

  writeLetter(cityId: string, cityName: string): { success: boolean; message: string; effect?: ResourceChange } {
    if (this.epistleCollection.get(cityId)) {
      return { success: false, message: `已经在${cityName}写过书信了` };
    }
    
    this.epistleCollection.set(cityId, true);
    this.letterScore += 50;
    
    const effects = this.cityLetterEffects.get(cityId);
    const effect = effects ? effects[0].effect : { faith: 15, reputation: 10 };
    
    return {
      success: true,
      message: `成功撰写了致${cityName}教会的书信！`,
      effect
    };
  }

  getCollectionStatus(): string {
    const letters: { city: string; collected: boolean }[] = [];
    let collected = 0;
    
    for (const [cityId, isCollected] of this.epistleCollection) {
      const cityConfig = CITY_CONFIG[cityId];
      const cityName = cityConfig ? cityConfig.nameChinese : cityId;
      letters.push({ city: cityName, collected: isCollected });
      if (isCollected) collected++;
    }
    
    // 添加可以写的书信
    const possibleLetters = [
      { cityId: 'galatians', city: '加拉太' },
      { cityId: 'philippians', city: '腓立比' },
      { cityId: 'ephesians', city: '以弗所' },
      { cityId: 'colossians', city: '歌罗西' },
      { cityId: 'philemon', city: '腓利门' },
    ];
    
    for (const letter of possibleLetters) {
      if (!this.epistleCollection.has(letter.cityId)) {
        letters.push({ city: letter.city, collected: false });
      }
    }
    
    let output = '\n📚 书信收集进度:\n';
    output += `   已收集: ${collected}/${possibleLetters.length}\n`;
    for (const letter of letters) {
      const symbol = letter.collected ? '✅' : '⬜';
      output += `   ${symbol} ${letter.city}\n`;
    }
    
    return output;
  }

  // 紧凑单行格式
  getCompactCollectionStatus(): string {
    const possibleLetters = [
      { cityId: 'galatians', city: '加' },
      { cityId: 'philippians', city: '腓' },
      { cityId: 'ephesians', city: '以' },
      { cityId: 'colossians', city: '歌' },
      { cityId: 'philemon', city: '门' },
    ];
    
    let letterBar = '';
    let collected = 0;
    
    for (const letter of possibleLetters) {
      const isCollected = this.epistleCollection.get(letter.cityId);
      if (isCollected) {
        letterBar += `[✓${letter.city}]`;
        collected++;
      } else {
        letterBar += `[○${letter.city}]`;
      }
    }
    
    return `📚 书信: ${letterBar} (${collected}/${possibleLetters.length})`;
  }
  
  // 超紧凑格式（仅显示进度条）
  getUltraCompactStatus(): string {
    const possibleLetters = ['galatians', 'philippians', 'ephesians', 'colossians', 'philemon'];
    let collected = 0;
    let letterBar = '';
    
    for (const cityId of possibleLetters) {
      if (this.epistleCollection.get(cityId)) {
        letterBar += '✓';
        collected++;
      } else {
        letterBar += '○';
      }
    }
    
    return `📚 [${letterBar}] ${collected}/${possibleLetters.length}`;
  }

  applyLetterEffectsToCity(cityId: string): ResourceChange {
    const effects = this.cityLetterEffects.get(cityId);
    if (effects && this.epistleCollection.get(cityId)) {
      return effects[0].effect;
    }
    return {};
  }

  isCompleteCollection(): boolean {
    const possibleLetters = ['galatians', 'philippians', 'ephesians', 'colossians', 'philemon'];
    return possibleLetters.every(id => this.epistleCollection.get(id) === true);
  }
}

export { LetterSystem };
