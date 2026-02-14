// ============================================
// 保罗传道旅程 - 团队管理模块
// 职责：管理宣教团队的资源、成员和状态
// ============================================

import { ResourceChange } from "./types.js";
import { Companion } from "./companion.js";
import { INITIAL_RESOURCES } from "./constants.js";

class Team {
  // 团队领导（保罗）
  leader: Companion | null;

  // 团队成员（不包含leader，为了清晰）
  members: Companion[];

  // 团队级别资源
  provision: number; // 团队物资
  stability: number; // 教会稳定
  persecution: number; // 团队逼迫
  reputation: number; // 团队名声
  churches: number; // 团队教会
  disciples: number; // 团队门徒
  morale: number; // 团队士气值

  // 其他
  visitedCities: string[];
  currentCity: string | null;

  constructor() {
    this.leader = null; // 稍后在GameEngine中初始化
    this.members = [];

    this.morale = INITIAL_RESOURCES.morale || 50;
    this.reputation = INITIAL_RESOURCES.reputation || 50;
    this.churches = INITIAL_RESOURCES.churches || 0;
    this.disciples = INITIAL_RESOURCES.disciples || 0;
    this.provision = INITIAL_RESOURCES.provision || 100;
    this.stability = INITIAL_RESOURCES.stability || 50;
    this.persecution = INITIAL_RESOURCES.persecution || 0;

    this.visitedCities = [];
    this.currentCity = null;
  }

  // ==================== 成员管理 ====================

  addMember(companion: Companion): void {
    this.members.push(companion);
  }

  removeMember(companionId: string): boolean {
    const index = this.members.findIndex((c) => c.id === companionId);
    if (index !== -1) {
      this.members.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 获取所有团队成员（包括领导+成员）
   */
  getAllMembers(): Companion[] {
    const allMembers: Companion[] = [];
    if (this.leader) allMembers.push(this.leader);
    allMembers.push(...this.members);
    return allMembers;
  }

  /**
   * 获取活跃的普通成员（不包含领导）
   */
  getActiveMembers(): Companion[] {
    return this.members.filter((c) => c.isActive);
  }

  /**
   * 获取所有活跃的团队成员（包括领导）
   */
  getActiveTeamMembers(): Companion[] {
    const allMembers = this.getAllMembers();
    return allMembers.filter((c) => c.isActive);
  }

  // ==================== 资源管理 ====================

  consumeResources(cost: ResourceChange): boolean {
    // 领导者体力消耗检查
    if (cost.stamina && this.leader && this.leader.stamina < cost.stamina)
      return false;
    // 领导者灵力消耗检查（灵力现在是个人资源）
    if (cost.spirit && this.leader && this.leader.spirit < cost.spirit)
      return false;
    if (cost.reputation && this.reputation < cost.reputation) return false;
    if (cost.disciples && this.disciples < cost.disciples) return false;
    if (cost.provision && this.provision < cost.provision) return false;
    // 团队士气消耗检查
    if (cost.morale && this.morale < cost.morale) return false;

    // 应用消耗
    if (cost.stamina && this.leader) this.leader.stamina -= cost.stamina;
    // 灵力从领导者个人扣除
    if (cost.spirit && this.leader) this.leader.spirit -= cost.spirit;
    if (cost.reputation) this.reputation -= cost.reputation;
    if (cost.disciples) this.disciples -= cost.disciples;
    if (cost.provision) this.provision -= cost.provision;
    // 士气从团队扣除
    if (cost.morale) this.morale -= cost.morale;

    return true;
  }

  applyEffects(effect: ResourceChange): void {
    // 团队士气对正面效果的加成（士气高时效果+20%，士气低时-20%）
    const moraleModifier = (this.morale - 50) / 250; // -0.2 到 +0.2

    const applyModifier = (value: number | undefined): number => {
      if (value === undefined) return 0;
      if (value > 0) return Math.round(value * (1 + moraleModifier));
      return value; // 负面效果不加成
    };

    // 领导者个人属性（体力、灵力）
    if (this.leader) {
      if (effect.stamina !== undefined)
        this.leader.stamina = Math.min(
          this.leader.stamina + effect.stamina,
          this.leader.maxStamina,
        );
      // 灵力现在是个人资源
      if (effect.spirit !== undefined)
        this.leader.spirit = Math.min(
          Math.max(this.leader.spirit + effect.spirit, 0),
          200,
        );
    }

    // 团队级别资源（应用士气加成）
    if (effect.morale !== undefined)
      this.morale = Math.min(Math.max(this.morale + effect.morale, 0), 100);
    if (effect.reputation !== undefined)
      this.reputation = Math.min(this.reputation + applyModifier(effect.reputation), 200);
    if (effect.churches !== undefined) this.churches += applyModifier(effect.churches);
    if (effect.disciples !== undefined) this.disciples += applyModifier(effect.disciples);
    if (effect.provision !== undefined)
      this.provision = Math.min(this.provision + applyModifier(effect.provision), 150);
    if (effect.stability !== undefined)
      this.stability = Math.min(
        Math.max(this.stability + applyModifier(effect.stability), 0),
        100,
      );
    if (effect.persecution !== undefined)
      this.persecution = Math.min(
        Math.max(this.persecution + effect.persecution, 0), // 逼迫不受士气影响
        100,
      );
  }

  rest(): void {
    if (this.leader) {
      this.leader.stamina = Math.min(
        this.leader.stamina + 30,
        this.leader.maxStamina,
      );
      // 休息恢复灵力（个人资源）
      this.leader.spirit = Math.min(this.leader.spirit + 15, 200);
    }

    // 恢复所有团队成员体力
    for (const member of this.getAllMembers()) {
      member.recoverStamina();
    }
  }

  isAlive(): boolean {
    return (
      this.leader !== null && this.leader.stamina > 0 && this.provision > 0
    );
  }

  // ==================== 状态显示 ====================

  getStatus(
    prevResources?: {
      morale: number;
      provision: number;
      stability: number;
      persecution: number;
      reputation: number;
      disciples: number;
      churches: number;
      leaderStamina: number;
      leaderSpirit: number;
      memberStamina?: Map<string, number>;
      memberSpirit?: Map<string, number>;
    },
    resourceChanges?: {
      provider: string;
      emoji: string;
      changes: { resource: string; value: number; isCost: boolean }[];
    }[],
  ): string {
    const formatChange = (current: number, prev: number, emojis: string[]): string => {
      const diff = current - prev;
      if (diff === 0) return "";
      const emojiStr = emojis.length > 0 ? " " + emojis.join("") : "";
      if (diff > 0) return ` ↑${diff}${emojiStr}`;
      return ` ↓${Math.abs(diff)}${emojiStr}`;
    };

    const getResourceEmojis = (resourceKey: string, providerName?: string): string[] => {
      if (!resourceChanges) return [];
      const emojis: string[] = [];
      for (const rc of resourceChanges) {
        // 如果指定了 providerName，只收集该提供者的 emoji
        if (providerName && rc.provider !== providerName) continue;
        for (const change of rc.changes) {
          const keyMap: Record<string, string> = {
            stamina: "stamina",
            spirit: "spirit",
            morale: "morale",
            provision: "provision",
            stability: "stability",
            persecution: "persecution",
            reputation: "reputation",
            disciples: "disciples",
            churches: "churches",
          };
          if (keyMap[change.resource] === resourceKey) {
            emojis.push(rc.emoji);
          }
        }
      }
      return emojis;
    };

    let status = "╔═══════════════════════════════════════════════════════╗\n";
    status += "║  🎯 行动果效                                      ║\n";
    status += "╠═══════════════════════════════════════════════════════╣\n";

    // 显示领导者（显示体力和灵力 - 都是个人资源）
    if (this.leader) {
      const staminaEmojis = getResourceEmojis("stamina", this.leader.nameChinese);
      const spiritEmojis = getResourceEmojis("spirit", this.leader.nameChinese);
      const staminaChange = prevResources ? formatChange(this.leader.stamina, prevResources.leaderStamina, staminaEmojis) : "";
      const spiritChange = prevResources ? formatChange(this.leader.spirit, prevResources.leaderSpirit, spiritEmojis) : "";
      status += `║  ${this.leader.avatarEmoji} ${this.leader.nameChinese}[${this.leader.specialtyName}] 💪${this.leader.stamina}/${this.leader.maxStamina}${staminaChange}  ✝️${this.leader.spirit}/${this.leader.maxSpirit}${spiritChange}\n`;
    }

    // 显示其他同工（显示体力和灵力）
    if (this.members.length > 0) {
      for (const member of this.members) {
        const memberStaminaEmojis = getResourceEmojis("stamina", member.nameChinese);
        const memberSpiritEmojis = getResourceEmojis("spirit", member.nameChinese);
        const prevStamina = prevResources?.memberStamina?.get(member.nameChinese) ?? member.stamina;
        const prevSpirit = prevResources?.memberSpirit?.get(member.nameChinese) ?? member.spirit;
        const staminaChange = prevResources ? formatChange(member.stamina, prevStamina, memberStaminaEmojis) : "";
        const spiritChange = prevResources ? formatChange(member.spirit, prevSpirit, memberSpiritEmojis) : "";
        status += `║  ${member.avatarEmoji} ${member.nameChinese}[${member.specialtyName}] 💪${member.stamina}/${member.maxStamina}${staminaChange}  ✝️${member.spirit}/${member.maxSpirit}${spiritChange}\n`;
      }
    }

    status += "╠═══════════════════════════════════════════════════════╣\n";
    status += "║  团队:\n";
    
    // 显示团队资源（士气是团队资源）
    if (prevResources && resourceChanges) {
      status += `║  🍞 物资    ${this.provision.toString().padStart(3)}/150${formatChange(this.provision, prevResources.provision, getResourceEmojis("provision"))}   ⛪ 稳定     ${this.stability.toString().padStart(3)}/100${formatChange(this.stability, prevResources.stability, getResourceEmojis("stability"))}\n`;
      status += `║  🔥 逼迫    ${this.persecution.toString().padStart(3)}/100${formatChange(this.persecution, prevResources.persecution, getResourceEmojis("persecution"))}   ⭐ 名声     ${this.reputation.toString().padStart(3)}/200${formatChange(this.reputation, prevResources.reputation, getResourceEmojis("reputation"))}\n`;
      status += `║  😊 士气    ${this.morale.toString().padStart(3)}/100${formatChange(this.morale, prevResources.morale, getResourceEmojis("morale"))}   👥 门徒     ${this.disciples.toString().padStart(3)}${formatChange(this.disciples, prevResources.disciples, getResourceEmojis("disciples"))}\n`;
      status += `║  ⛪ 教会      ${this.churches.toString().padStart(3)}${formatChange(this.churches, prevResources.churches, getResourceEmojis("churches"))}\n`;
    } else {
      status += `║  🍞 物资    ${this.provision.toString().padStart(3)}/150   ⛪ 稳定     ${this.stability.toString().padStart(3)}/100\n`;
      status += `║  🔥 逼迫    ${this.persecution.toString().padStart(3)}/100   ⭐ 名声     ${this.reputation.toString().padStart(3)}/200\n`;
      status += `║  😊 士气    ${this.morale.toString().padStart(3)}/100   👥 门徒     ${this.disciples.toString().padStart(3)}\n`;
      status += `║  ⛪ 教会      ${this.churches.toString().padStart(3)}\n`;
    }
    status += "╚═══════════════════════════════════════════════════════╝";

    return status;
  }

  /**
   * 团队视图状态 - 返回关键资源对象
   */
  getTeamViewStatus(): {
    leaderStamina: string;
    leaderMorale: number;
    provision: string;
    stability: string;
    persecution: string;
    reputation: string;
    morale: string;
    disciples: number;
  } {
    return {
      leaderStamina: this.leader
        ? `${this.leader.stamina}/${this.leader.maxStamina}`
        : "0/100",
      leaderMorale: 0, // 现在士气是团队资源，这里保留兼容
      provision: `${this.provision}/150`,
      stability: `${this.stability}/100`,
      persecution: `${this.persecution}/100`,
      reputation: `${this.reputation}/200`,
      morale: `${this.morale}/100`,
      disciples: this.disciples,
    };
  }

  private getProgressBar(value: number, max: number, width: number): string {
    const filled = Math.round((value / max) * width);
    const empty = width - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  }
}

export { Team };
