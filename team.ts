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
  faith: number; // 信心值

  // 其他
  visitedCities: string[];
  currentCity: string | null;

  constructor() {
    this.leader = null; // 稍后在GameEngine中初始化
    this.members = [];

    this.faith = INITIAL_RESOURCES.faith || 100;
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
    if (cost.faith && this.faith < cost.faith) return false;
    if (cost.reputation && this.reputation < cost.reputation) return false;
    if (cost.disciples && this.disciples < cost.disciples) return false;
    if (cost.provision && this.provision < cost.provision) return false;

    // 应用消耗
    if (cost.stamina && this.leader) this.leader.stamina -= cost.stamina;
    if (cost.faith) this.faith -= cost.faith;
    if (cost.reputation) this.reputation -= cost.reputation;
    if (cost.disciples) this.disciples -= cost.disciples;
    if (cost.provision) this.provision -= cost.provision;

    return true;
  }

  applyEffects(effect: ResourceChange): void {
    // 领导者个人属性
    if (this.leader) {
      if (effect.stamina !== undefined)
        this.leader.stamina = Math.min(
          this.leader.stamina + effect.stamina,
          this.leader.maxStamina,
        );
      if (effect.morale !== undefined)
        this.leader.morale = Math.min(
          Math.max(this.leader.morale + effect.morale, 0),
          100,
        );
    }

    // 团队级别资源
    if (effect.faith !== undefined)
      this.faith = Math.min(this.faith + effect.faith, 200);
    if (effect.reputation !== undefined)
      this.reputation = Math.min(this.reputation + effect.reputation, 200);
    if (effect.churches !== undefined) this.churches += effect.churches;
    if (effect.disciples !== undefined) this.disciples += effect.disciples;
    if (effect.provision !== undefined)
      this.provision = Math.min(this.provision + effect.provision, 150);
    if (effect.stability !== undefined)
      this.stability = Math.min(
        Math.max(this.stability + effect.stability, 0),
        100,
      );
    if (effect.persecution !== undefined)
      this.persecution = Math.min(
        Math.max(this.persecution + effect.persecution, 0),
        100,
      );
  }

  rest(): void {
    if (this.leader) {
      this.leader.stamina = Math.min(
        this.leader.stamina + 30,
        this.leader.maxStamina,
      );
    }
    this.faith = Math.min(this.faith + 15, 200);

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
      faith: number;
      provision: number;
      stability: number;
      persecution: number;
      reputation: number;
      disciples: number;
      churches: number;
      leaderStamina: number;
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

    const getResourceEmojis = (resourceKey: string): string[] => {
      if (!resourceChanges) return [];
      const emojis: string[] = [];
      for (const rc of resourceChanges) {
        for (const change of rc.changes) {
          const keyMap: Record<string, string> = {
            stamina: "stamina",
            faith: "faith",
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

    if (this.leader) {
      const staminaEmojis = getResourceEmojis("stamina");
      const staminaChange = prevResources ? formatChange(this.leader.stamina, prevResources.leaderStamina, staminaEmojis) : "";
      status += `║  保罗: ${this.leader.nameChinese}[${this.leader.specialtyName}] 💪${this.leader.stamina}/${this.leader.maxStamina}${staminaChange}  😊${this.leader.morale}%\n`;
    }

    // 显示其他同工
    if (this.members.length > 0) {
      for (const member of this.members) {
        status += `║  ${member.nameChinese}[${member.specialtyName}] 💪${member.stamina}/${member.maxStamina}  😊${member.morale}%\n`;
      }
    }

    status += "╠═══════════════════════════════════════════════════════╣\n";
    status += "║  团队:\n";
    
    if (prevResources && resourceChanges) {
      status += `║  🍞 物资    ${this.provision.toString().padStart(3)}/150${formatChange(this.provision, prevResources.provision, getResourceEmojis("provision"))}   ⛪ 稳定     ${this.stability.toString().padStart(3)}/100${formatChange(this.stability, prevResources.stability, getResourceEmojis("stability"))}\n`;
      status += `║  🔥 逼迫    ${this.persecution.toString().padStart(3)}/100${formatChange(this.persecution, prevResources.persecution, getResourceEmojis("persecution"))}   ⭐ 名声     ${this.reputation.toString().padStart(3)}/200${formatChange(this.reputation, prevResources.reputation, getResourceEmojis("reputation"))}\n`;
      status += `║  ✝️ 信心    ${this.faith.toString().padStart(3)}/200${formatChange(this.faith, prevResources.faith, getResourceEmojis("faith"))}   👥 门徒     ${this.disciples.toString().padStart(3)}${formatChange(this.disciples, prevResources.disciples, getResourceEmojis("disciples"))}\n`;
      status += `║  ⛪ 教会      ${this.churches.toString().padStart(3)}${formatChange(this.churches, prevResources.churches, getResourceEmojis("churches"))}\n`;
    } else {
      status += `║  🍞 物资    ${this.provision.toString().padStart(3)}/150   ⛪ 稳定     ${this.stability.toString().padStart(3)}/100\n`;
      status += `║  🔥 逼迫    ${this.persecution.toString().padStart(3)}/100   ⭐ 名声     ${this.reputation.toString().padStart(3)}/200\n`;
      status += `║  ✝️ 信心    ${this.faith.toString().padStart(3)}/200   👥 门徒     ${this.disciples.toString().padStart(3)}\n`;
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
    faith: string;
  } {
    return {
      leaderStamina: this.leader
        ? `${this.leader.stamina}/${this.leader.maxStamina}`
        : "0/100",
      leaderMorale: this.leader ? this.leader.morale : 0,
      provision: `${this.provision}/150`,
      stability: `${this.stability}/100`,
      persecution: `${this.persecution}/100`,
      reputation: `${this.reputation}/200`,
      faith: `${this.faith}/200`,
    };
  }

  /**
   * 紧凑格式状态显示（单行）
   */
  getCompactStatus(): string {
    if (!this.leader) return "领导未初始化";

    const faithBar = this.getProgressBar(this.faith, 200, 10);
    const staminaBar = this.getProgressBar(this.leader.stamina, 100, 10);
    const repBar = this.getProgressBar(this.reputation, 200, 10);
    const provBar = this.getProgressBar(this.provision, 150, 10);
    const stabBar = this.getProgressBar(this.stability, 100, 10);
    const persBar = this.getProgressBar(this.persecution, 100, 10);

    const line1 = `┌─ 团队 ─┬─ 信心:${faithBar} ${this.faith.toString().padStart(3)}/200 ─┬─ 体力:${staminaBar} ${this.leader.stamina.toString().padStart(3)}/100 ─┬─ 声望:${repBar} ${this.reputation.toString().padStart(3)}/200 ─┐`;
    const line2 = `└─ 教会:${this.churches.toString().padStart(2)} ─┴─ 门徒:${this.disciples.toString().padStart(3)} ─┴─ 物资:${provBar} ${this.provision.toString().padStart(3)}/150 ─┴─ 稳定:${stabBar} ${this.stability.toString().padStart(3)}/100 ─┴─ 逼迫:${persBar} ${this.persecution.toString().padStart(3)}/100 ─┘`;

    return `${line1}\n${line2}`;
  }

  private getProgressBar(value: number, max: number, width: number): string {
    const filled = Math.round((value / max) * width);
    const empty = width - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  }
}

export { Team };
