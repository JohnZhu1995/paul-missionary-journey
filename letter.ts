// ============================================
// 保罗传道旅程 - 书信系统模块
// 职责：管理书信的撰写、收集和效果应用
// ============================================

import { ResourceChange, LetterEffect } from "./types.js";
import { Team } from "./team.js";

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
    this.cityLetterEffects.set("Antioch", [
      {
        cityId: "Antioch",
        effect: { spirit: 20, reputation: 10, stability: 15 },
        description: "Epistle to Antioch",
      },
    ]);

    this.cityLetterEffects.set("Philippi", [
      {
        cityId: "Philippi",
        effect: { spirit: 25, reputation: 15, disciples: 2, stability: 10 },
        description: "Epistle to Philippians",
      },
    ]);

    this.cityLetterEffects.set("Ephesus", [
      {
        cityId: "Ephesus",
        effect: { spirit: 30, reputation: 20, churches: 1, stability: 20 },
        description: "Epistle to Ephesians",
      },
    ]);
  }

  canWriteLetter(cityId: string, team: Team): boolean {
    if (this.epistleCollection.get(cityId)) return false;
    if (team.disciples < 3) return false;
    // 灵力现在是领导者个人资源
    if (!team.leader || team.leader.spirit < 30) return false;
    return true;
  }

  writeLetter(
    cityId: string,
    cityName: string,
  ): { success: boolean; message: string; effect?: ResourceChange } {
    if (this.epistleCollection.get(cityId)) {
      return { success: false, message: `已经在${cityName}写过书信了` };
    }

    this.epistleCollection.set(cityId, true);
    this.letterScore += 50;

    const effects = this.cityLetterEffects.get(cityId);
    const effect = effects ? effects[0].effect : { spirit: 15, reputation: 10 };

    return {
      success: true,
      message: `成功撰写了致${cityName}教会的书信！`,
      effect,
    };
  }

  getCollectionStatus(): string {
    const letters: { city: string; collected: boolean }[] = [];
    let collected = 0;

    for (const [cityId, isCollected] of this.epistleCollection) {
      letters.push({ city: cityId, collected: isCollected });
      if (isCollected) collected++;
    }

    const possibleLetters = [
      { cityId: "Antioch", city: "安提阿" },
      { cityId: "Philippi", city: "腓立比" },
      { cityId: "Ephesus", city: "以弗所" },
    ];

    for (const letter of possibleLetters) {
      if (!this.epistleCollection.has(letter.cityId)) {
        letters.push({ city: letter.city, collected: false });
      }
    }

    let output = "\n📚 书信收集进度:\n";
    output += `   已收集: ${collected}/${possibleLetters.length}\n`;
    for (const letter of letters) {
      const symbol = letter.collected ? "✅" : "⬜";
      output += `   ${symbol} ${letter.city}\n`;
    }

    return output;
  }

  applyLetterEffectsToCity(cityId: string): ResourceChange {
    const effects = this.cityLetterEffects.get(cityId);
    if (effects && this.epistleCollection.get(cityId)) {
      return effects[0].effect;
    }
    return {};
  }

  isCompleteCollection(): boolean {
    const cities = ["Antioch", "Philippi", "Ephesus"];
    return cities.every((id) => this.epistleCollection.get(id) === true);
  }
}

export { LetterSystem };
