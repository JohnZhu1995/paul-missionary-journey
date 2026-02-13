// ============================================
// 保罗传道旅程 - 游戏引擎模块
// 职责：核心游戏逻辑、状态管理和游戏流程控制
// ============================================

import {
  ResourceChange,
  ActionType,
  CompanionTaskType,
  GameEvent,
  DecisionEvent,
} from "./types.js";
import { City } from "./city.js";
import { Team } from "./team.js";
import { Companion } from "./companion.js";
import { LetterSystem } from "./letter.js";
import { ACTIONS, COMPANION_TASKS } from "./constants.js";
import { ANTIOCH_EVENTS, PHILIPPI_EVENTS, EPHESUS_EVENTS } from "./events.js";

class GameEngine {
  team: Team;
  currentCity: City | null;
  letterSystem: LetterSystem;
  gameLog: string[];
  isGameOver: boolean;
  isVictory: boolean;
  currentTurn: number;
  maxTurns: number;
  availableCities: string[];
  completedCities: string[];
  cities: City[];
  currentCityIndex: number;
  eventHistory: string[];
  tyrannusMode: boolean;
  companions: Companion[];
  companionLimit: number;
  totalFaithfulnessPoints: number;
  cityStabilityRecords: Map<string, number>;
  totalPersecutionReceived: number;
  totalStabilityLost: number;
  persecutionEventTriggered: boolean;

  constructor() {
    this.team = new Team();
    this.currentCity = null;
    this.letterSystem = new LetterSystem();
    this.gameLog = [];
    this.isGameOver = false;
    this.isVictory = false;
    this.currentTurn = 0;
    this.maxTurns = 15;
    this.availableCities = ["Antioch", "Philippi", "Ephesus"];
    this.completedCities = [];
    this.cities = [];
    this.currentCityIndex = 0;
    this.eventHistory = [];
    this.tyrannusMode = false;
    this.companions = [];
    this.companionLimit = 2;
    this.totalFaithfulnessPoints = 0;
    this.cityStabilityRecords = new Map();
    this.totalPersecutionReceived = 0;
    this.totalStabilityLost = 0;
    this.persecutionEventTriggered = false;

    // 初始化城市
    for (const cityId of this.availableCities) {
      this.cities.push(new City(cityId));
    }

    if (this.cities.length > 0) {
      this.currentCity = this.cities[0];
    }
  }

  initializeGame(): void {
    // 初始化保罗为团队领导
    const paul = new Companion(
      "paul",
      "Paul",
      "保罗",
      "preaching",
      "宣道者",
      "专长宣讲福音",
    );
    this.team.leader = paul;

    // 初始化同工
    const barnabas = new Companion(
      "barnabas",
      "Barnabas",
      "巴拿巴",
      "counselor",
      "劝慰者",
      "提升探访效率和士气恢复",
    );
    const silas = new Companion(
      "silas",
      "Silas",
      "西拉",
      "resilient",
      "坚韧者",
      "降低逼迫带来的体力损耗",
    );
    const timothy = new Companion(
      "timothy",
      "Timothy",
      "提摩太",
      "scribe",
      "忠心代笔者",
      "协助撰写书信，体力消耗减半",
    );
    const luke = new Companion(
      "luke",
      "Luke",
      "路加",
      "healing",
      "医治",
      "擅长医治病人",
    );
    const priscilla = new Companion(
      "priscilla",
      "Priscilla",
      "百基拉",
      "crafting",
      "织造",
      "擅长织造帐篷",
    );

    this.team.addMember(barnabas);
    this.companions.push(barnabas);

    this.addToLog("游戏开始！保罗的宣教之旅正式启程。");
    this.addToLog("你的同工团队：巴拿巴（初始）");
    this.addToLog("其他同工将在后续城市加入。");
  }

  addCompanion(companion: Companion): boolean {
    if (this.companions.length >= this.companionLimit) {
      return false;
    }
    this.companions.push(companion);
    this.team.addMember(companion);
    return true;
  }

  getActiveCompanions(): Companion[] {
    return this.companions.filter((c) => c.morale >= 20 && c.stamina > 0);
  }

  hasScribeCompanion(): boolean {
    return this.companions.some(
      (c) => c.specialty === "scribe" && c.morale >= 20,
    );
  }

  startCity(cityId: string): boolean {
    if (!this.availableCities.includes(cityId)) {
      return false;
    }

    const city = this.cities.find((c) => c.id === cityId);
    if (!city) {
      return false;
    }

    this.currentCity = city;
    this.team.currentCity = cityId;

    if (!this.team.visitedCities.includes(cityId)) {
      this.team.visitedCities.push(cityId);
    }

    this.addToLog(
      `抵达${this.currentCity.nameChinese}(${this.currentCity.name})`,
    );
    this.addToLog(this.currentCity.description);

    // 触发城市事件
    this.triggerCityEvent(cityId);

    return true;
  }

  triggerCityEvent(cityId: string): void {
    let events: (GameEvent | DecisionEvent)[] = [];

    switch (cityId) {
      case "Antioch":
        events = Object.values(ANTIOCH_EVENTS);
        break;
      case "Philippi":
        events = Object.values(PHILIPPI_EVENTS);
        break;
      case "Ephesus":
        events = Object.values(EPHESUS_EVENTS);
        break;
    }

    if (events.length > 0) {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      if (randomEvent.type === "event") {
        const event = randomEvent as GameEvent;
        this.addToLog(`【事件】${event.name}: ${event.description}`);

        // 自动选择第一个选项
        this.team.applyEffects(event.effect);
        this.addToLog(`影响: ${JSON.stringify(event.effect)}`);
      }
    }
  }

  performAction(actionType: ActionType): { success: boolean; message: string } {
    if (!this.currentCity) {
      return { success: false, message: "没有当前城市" };
    }

    if (this.isGameOver) {
      return { success: false, message: "游戏已结束" };
    }

    const action = ACTIONS[actionType];

    // 检查资源
    if (!this.team.consumeResources(action.cost)) {
      return { success: false, message: "资源不足，无法执行此行动" };
    }

    // 应用行动效果
    this.team.applyEffects(action.effect);

    // 应用同工加成
    for (const companion of this.team.getActiveMembers()) {
      const bonus = companion.applySpecialtyEffect(actionType);
      this.team.applyEffects(bonus);
    }

    // 更新城市状态
    if (action.effect.disciples) {
      this.currentCity.addDisciples(action.effect.disciples);
    }
    if (action.effect.reputation) {
      this.currentCity.addReputation(action.effect.reputation);
    }

    // 推进回合
    this.currentTurn++;
    const cityCompleted = this.currentCity.advanceTurn();

    this.addToLog(`执行行动: ${action.nameChinese} - ${action.description}`);

    if (cityCompleted) {
      this.completeCurrentCity();
    }

    // 检查游戏结束条件
    this.checkGameEnd();

    return { success: true, message: `成功执行${action.nameChinese}` };
  }

  handleAction(
    actionType: ActionType,
    companionActions?: Map<string, CompanionTaskType>,
  ): string {
    if (this.isGameOver) {
      return "游戏已结束。";
    }

    const action = ACTIONS[actionType];

    if (!this.canPerformAction(action)) {
      return `资源不足，无法执行「${action.name}」`;
    }

    // 记录行动前的资源状态
    const prevResources = {
      faith: this.team.faith,
      provision: this.team.provision,
      stability: this.team.stability,
      persecution: this.team.persecution,
      reputation: this.team.reputation,
      disciples: this.team.disciples,
      churches: this.team.churches,
      leaderStamina: this.team.leader?.stamina || 0,
    };

    // 记录各成员的体力变化来源
    const staminaChanges: Map<string, { name: string; change: number }[]> = new Map();
    if (this.team.leader) {
      staminaChanges.set("leader", [{ name: this.team.leader.nameChinese, change: 0 }]);
    }

    // 记录忠心点数
    if (actionType === "preach" && this.team.persecution > 70) {
      this.totalFaithfulnessPoints += 10;
    }

    const prevStability = this.team.stability;

    // 收集各成员带来的资源变化
    const resourceChanges: {
      provider: string;
      emoji: string;
      changes: { resource: string; value: number; isCost: boolean }[];
    }[] = [];

    // 保罗行动的变化
    const paulChanges: { resource: string; value: number; isCost: boolean }[] = [];
    if (action.cost.stamina) paulChanges.push({ resource: "stamina", value: action.cost.stamina, isCost: true });
    if (action.cost.faith) paulChanges.push({ resource: "faith", value: action.cost.faith, isCost: true });
    if (action.cost.provision) paulChanges.push({ resource: "provision", value: action.cost.provision, isCost: true });
    for (const [key, val] of Object.entries(action.effect)) {
      if (val && val > 0) paulChanges.push({ resource: key, value: val, isCost: false });
    }
    resourceChanges.push({
      provider: this.team.leader?.nameChinese || "保罗",
      emoji: "👤",
      changes: paulChanges,
    });

    // 处理同工任务
    let companionResults: string[] = [];
    if (companionActions) {
      for (const [companionId, taskType] of companionActions) {
        const companion = this.companions.find((c) => c.id === companionId);
        if (companion) {
          const taskInfo = COMPANION_TASKS[taskType];
          const companionChange: { resource: string; value: number; isCost: boolean }[] = [];
          companionChange.push({ resource: "stamina", value: taskInfo.staminaCost, isCost: true });
          for (const [key, val] of Object.entries(taskInfo.effect)) {
            if (val && val > 0) companionChange.push({ resource: key, value: val, isCost: false });
          }

          const result = companion.assignTask(taskType);
          if (result.success) {
            this.team.applyEffects(result.effect);
            companionResults.push(`✅ ${result.message}`);
            resourceChanges.push({
              provider: companion.nameChinese,
              emoji: "👥",
              changes: companionChange,
            });
          } else {
            companionResults.push(`❌ ${result.message}`);
          }
        }
      }
    }

    // 扣除保罗行动的消耗
    if (action.cost.stamina && this.team.leader) {
      this.team.leader.stamina -= action.cost.stamina;
    }
    if (action.cost.faith) {
      this.team.faith -= action.cost.faith;
    }
    if (action.cost.provision) {
      this.team.provision -= action.cost.provision;
    }

    // 应用保罗的行动效果
    this.team.applyEffects(action.effect);

    // 书信系统特殊处理
    if (actionType === "write_letter" && this.currentCity) {
      const letterResult = this.letterSystem.writeLetter(
        this.currentCity.id,
        this.currentCity.nameChinese,
      );
      if (letterResult.success) {
        this.team.applyEffects(letterResult.effect || {});
        this.currentCity.letterWritten = true;
        companionResults.push(`✉️ ${letterResult.message}`);
      } else {
        companionResults.push(`❌ ${letterResult.message}`);
      }
    }

    // 回合推进
    this.currentCity?.nextRound();
    this.currentTurn++;

    // 回合结束结算
    this.endOfRoundSettlement();

    // 追踪教会健康度变化
    const stabilityLoss = prevStability - this.team.stability;
    if (stabilityLoss > 0) {
      this.totalStabilityLost += stabilityLoss;
    }

    // 恢复同工体力（已注释：改为玩家主动选择休息任务）
    // this.companions.forEach((c) => c.recoverStamina());

    if (this.currentCity && !this.currentCity.hasMoreRounds()) {
      this.moveToNextCity();
    }

    // 检查游戏结束条件
    this.checkGameEnd();

    return this.generateActionResult(action, companionResults, prevResources, resourceChanges);
  }

  private generateActionResult(
    action: (typeof ACTIONS)["preach"],
    companionResults: string[],
    prevResources: {
      faith: number;
      provision: number;
      stability: number;
      persecution: number;
      reputation: number;
      disciples: number;
      churches: number;
      leaderStamina: number;
    },
    resourceChanges: {
      provider: string;
      emoji: string;
      changes: { resource: string; value: number; isCost: boolean }[];
    }[],
  ): string {
    const leaderName = this.team.leader?.nameChinese || "保罗";
    let result = `\n✅ ${leaderName}执行「${action.nameChinese}」`;
    if (companionResults.length > 0) {
      result += "\n" + companionResults.join("\n");
    }
    result += `\n${this.team.getStatus(prevResources, resourceChanges)}`;
    if (this.currentCity) {
      result += `\n📍 当前位置: ${this.currentCity.getRoundInfo()}`;
    }
    return result;
  }

  private canPerformAction(action: (typeof ACTIONS)["preach"]): boolean {
    const cost = action.cost;
    if (
      cost.stamina &&
      this.team.leader &&
      this.team.leader.stamina < cost.stamina
    ) {
      return false;
    }
    if (cost.faith && this.team.faith < cost.faith) {
      return false;
    }
    if (cost.provision && this.team.provision < cost.provision) {
      return false;
    }
    return true;
  }

  private endOfRoundSettlement(): void {
    if (this.currentCity) {
      // 追踪累计逼迫值
      this.totalPersecutionReceived += this.currentCity.basePersecutionRate;

      // 城市固有的逼迫增长
      this.team.applyEffects({
        persecution: this.currentCity.basePersecutionRate,
      });

      // 以弗所特殊机制
      if (this.currentCity.name === "Ephesus" && this.tyrannusMode) {
        this.team.applyEffects({ stamina: -10 });
      }
    }

    this.checkCrisisEvents();
  }

  private checkCrisisEvents(): void {
    // 暴动事件 - 逼迫首次超过70时触发，之后需要降低到50以下才能再次触发
    if (this.team.persecution > 70 && !this.persecutionEventTriggered) {
      console.log("\n⚠️  【暴动事件】逼迫太甚，会堂中有人起来反对！");
      this.team.applyEffects({ stamina: -15, stability: -10 });
      this.persecutionEventTriggered = true;
    }

    // 逼迫降低后重置触发标记
    if (this.team.persecution < 50) {
      this.persecutionEventTriggered = false;
    }

    // 分裂风险
    if (this.team.stability < 30) {
      console.log("\n⚠️  【分裂风险】信徒之间产生争论，需要更多关怀！");
      this.team.applyEffects({ stability: -5 });
    }

    if (!this.team.isAlive()) {
      this.isGameOver = true;
      this.isVictory = false;
    }
  }

  private moveToNextCity(): void {
    if (!this.currentCity) return;

    console.log(
      `\n🎉 完成 ${this.currentCity.nameChinese} 的宣教工作！准备前往下一城...\n`,
    );

    // 记录当前城市的教会健康度
    this.cityStabilityRecords.set(this.currentCity.name, this.team.stability);

    // 离开以弗所时重置推喇奴学房模式
    if (this.currentCity.name === "Ephesus") {
      this.tyrannusMode = false;
    }

    // 重置暴动事件触发标记
    this.persecutionEventTriggered = false;

    this.currentCityIndex++;

    if (this.currentCityIndex >= this.cities.length) {
      this.isGameOver = true;
      this.isVictory = true;
    } else {
      this.currentCity = this.cities[this.currentCityIndex];

      // 招募新同工
      this.recruitCompanionForCity();
    }
  }

  private recruitCompanionForCity(): void {
    if (!this.currentCity) return;

    if (
      this.currentCity.name === "Philippi" &&
      !this.companions.some((c) => c.id === "silas")
    ) {
      const silas = new Companion(
        "silas",
        "Silas",
        "西拉",
        "resilient",
        "坚韧者",
        "降低逼迫带来的体力损耗，增强教导能力",
      );
      if (this.addCompanion(silas)) {
        console.log(`\n👥 【同工加入】${silas.nameChinese}加入了团队！`);
        console.log(
          `   特性：${silas.specialtyName} - ${silas.specialtyDescription}`,
        );
      }
    }

    if (
      this.currentCity.name === "Ephesus" &&
      !this.companions.some((c) => c.id === "timothy")
    ) {
      const timothy = new Companion(
        "timothy",
        "Timothy",
        "提摩太",
        "scribe",
        "忠心代笔者",
        "协助撰写书信，体力消耗减半",
      );
      if (this.addCompanion(timothy)) {
        console.log(`\n👥 【同工加入】${timothy.nameChinese}加入了团队！`);
        console.log(
          `   特性：${timothy.specialtyName} - ${timothy.specialtyDescription}`,
        );
      }
    }
  }

  writeLetter(): { success: boolean; message: string } {
    if (!this.currentCity) {
      return { success: false, message: "没有当前城市" };
    }

    if (!this.letterSystem.canWriteLetter(this.currentCity.id, this.team)) {
      return {
        success: false,
        message: "条件不满足（需要至少3名门徒和30信心值）",
      };
    }

    const result = this.letterSystem.writeLetter(
      this.currentCity.id,
      this.currentCity.nameChinese,
    );

    if (result.success) {
      this.team.applyEffects(result.effect || {});
      this.currentCity.letterWritten = true;
      this.addToLog(result.message);
    }

    return result;
  }

  completeCurrentCity(): void {
    if (!this.currentCity) return;

    this.completedCities.push(this.currentCity.id);
    this.addToLog(`完成${this.currentCity.nameChinese}的事工！`);

    // 奖励
    const bonus: ResourceChange = {
      faith: 20,
      reputation: 10,
    };

    if (this.currentCity.disciplesGained >= 5) {
      bonus.churches = 1;
      this.addToLog("建立了新的教会！");
    }

    this.team.applyEffects(bonus);
  }

  moveToNextCityManual(): boolean {
    if (this.completedCities.length >= this.availableCities.length) {
      this.isGameOver = true;
      this.isVictory = true;
      return false;
    }

    // 找到下一个未访问的城市
    for (const cityId of this.availableCities) {
      if (!this.completedCities.includes(cityId)) {
        this.startCity(cityId);
        return true;
      }
    }

    return false;
  }

  checkGameEnd(): void {
    // 检查胜利条件
    if (
      this.completedCities.length >= 3 &&
      this.letterSystem.isCompleteCollection()
    ) {
      this.isGameOver = true;
      this.isVictory = true;
      this.addToLog("恭喜！你完成了保罗的三次宣教旅程并收集了所有书信！");
      return;
    }

    // 检查失败条件
    if (this.team.faith <= 0) {
      this.isGameOver = true;
      this.isVictory = false;
      this.addToLog("游戏结束：信心耗尽...");
      return;
    }

    if ((this.team.leader?.stamina || 0) <= 0) {
      this.isGameOver = true;
      this.isVictory = false;
      this.addToLog("游戏结束：体力耗尽...");
      return;
    }

    if (this.currentTurn >= this.maxTurns) {
      this.isGameOver = true;
      this.isVictory = this.completedCities.length >= 2;
      this.addToLog(
        this.isVictory
          ? "时间到，但你完成了主要目标！"
          : "时间到，未能完成主要目标...",
      );
    }
  }

  assignCompanionTask(
    companionId: string,
    task: CompanionTaskType,
  ): { success: boolean; message: string } {
    const companion = this.team.members.find((c) => c.id === companionId);
    if (!companion) {
      return { success: false, message: "找不到该同工" };
    }

    if (!companion.isActive) {
      return { success: false, message: "该同工当前不活跃" };
    }

    const result = companion.assignTask(task);
    if (result.success) {
      const taskInfo = COMPANION_TASKS[task];
      this.team.applyEffects(result.effect);
      this.addToLog(
        `${companion.nameChinese}执行${taskInfo.nameChinese}任务: ${taskInfo.description}`,
      );
      return { success: true, message: `成功分配任务` };
    }

    return { success: false, message: result.message };
  }

  triggerEvent(): { event: GameEvent | DecisionEvent | null; message: string } {
    // 安提阿事件流
    if (this.currentCity?.name === "Antioch") {
      if (
        this.currentCity.currentTurn === 2 &&
        !this.eventHistory.includes("christian_name")
      ) {
        return this.executeEvent(ANTIOCH_EVENTS["christian_name"] as GameEvent);
      }

      if (
        this.team.provision < 20 &&
        this.currentCity.currentTurn >= 3 &&
        !this.eventHistory.includes("paul_barnabas_dispute")
      ) {
        return { event: ANTIOCH_EVENTS["paul_barnabas_dispute"], message: "" };
      }
    }

    // 腓立比事件流
    if (this.currentCity?.name === "Philippi") {
      if (
        this.currentCity.currentTurn === 1 &&
        !this.eventHistory.includes("lydia_meeting")
      ) {
        return this.executeEvent(PHILIPPI_EVENTS["lydia_meeting"] as GameEvent);
      }
    }

    // 以弗所事件流
    if (this.currentCity?.name === "Ephesus") {
      if (
        this.currentCity.currentTurn === 1 &&
        !this.eventHistory.includes("tyrannus_school")
      ) {
        return this.executeEvent(
          EPHESUS_EVENTS["tyrannus_school"] as GameEvent,
        );
      }

      if (
        this.currentCity.currentTurn === 2 &&
        !this.eventHistory.includes("timothy_recruitment")
      ) {
        return this.executeEvent(
          EPHESUS_EVENTS["timothy_recruitment"] as GameEvent,
        );
      }

      if (
        this.currentCity.currentTurn >= 3 &&
        !this.eventHistory.includes("sceva_sons")
      ) {
        return { event: EPHESUS_EVENTS["sceva_sons"], message: "" };
      }

      if (
        this.currentCity.currentTurn >= 4 &&
        !this.eventHistory.includes("burning_scrolls")
      ) {
        return this.executeEvent(
          EPHESUS_EVENTS["burning_scrolls"] as GameEvent,
        );
      }
    }

    return { event: null, message: "" };
  }

  private executeEvent(event: GameEvent): {
    event: GameEvent | DecisionEvent | null;
    message: string;
  } {
    if (event.type === "decision") {
      return { event, message: "" };
    }

    this.eventHistory.push(event.id);
    this.team.applyEffects(event.effect);

    let message = "\n" + "=".repeat(50);
    message += `\n📜 【${event.name}】${event.description}`;
    message += "\n" + "-".repeat(50);
    message += `\n${event.text}`;
    message += "\n" + "-".repeat(50);

    const changes: string[] = [];
    if (event.effect.stability)
      changes.push(
        `教会健康 ${event.effect.stability > 0 ? "+" : ""}${event.effect.stability}`,
      );
    if (event.effect.persecution)
      changes.push(
        `逼迫指数 ${event.effect.persecution > 0 ? "+" : ""}${event.effect.persecution}`,
      );
    if (event.effect.stamina)
      changes.push(
        `体力 ${event.effect.stamina > 0 ? "+" : ""}${event.effect.stamina}`,
      );
    if (event.effect.provision)
      changes.push(
        `物资 ${event.effect.provision > 0 ? "+" : ""}${event.effect.provision}`,
      );
    if (event.effect.reputation)
      changes.push(
        `名声 ${event.effect.reputation > 0 ? "+" : ""}${event.effect.reputation}`,
      );
    if (event.effect.morale)
      changes.push(
        `同工士气 ${event.effect.morale > 0 ? "+" : ""}${event.effect.morale}`,
      );

    if (changes.length > 0) {
      message += `\n📊 影响：${changes.join("， ")}`;
    }
    message += "\n" + "=".repeat(50);

    return { event, message };
  }

  handleDecision(eventId: string, choiceIndex: number): string {
    const event = (ANTIOCH_EVENTS[eventId] ||
      PHILIPPI_EVENTS[eventId] ||
      EPHESUS_EVENTS[eventId]) as DecisionEvent;
    if (!event || event.type !== "decision") {
      return "无效的事件或决策";
    }

    if (choiceIndex < 0 || choiceIndex >= event.choices.length) {
      return "无效的选择";
    }

    this.eventHistory.push(eventId);
    const choice = event.choices[choiceIndex];
    this.team.applyEffects(choice.effect);

    // 处理同工争执的特殊效果
    if (eventId === "paul_barnabas_dispute") {
      if (choiceIndex === 0) {
        // 巴拿巴带着马可离开
        const barnabas = this.companions.find((c) => c.id === "barnabas");
        if (barnabas) {
          barnabas.isActive = false;
          console.log("\n💔 巴拿巴带着马可前往塞浦路斯...");
        }
      }
    }

    let message = "\n" + "=".repeat(50);
    message += `\n📜 【${event.name}】${event.description}`;
    message += "\n" + "-".repeat(50);
    message += `\n${event.text}`;
    message += "\n" + "-".repeat(50);
    message += `\n✅ 你选择：${choice.label}`;
    message += `\n   ${choice.description}`;

    const changes: string[] = [];
    if (choice.effect.stability)
      changes.push(
        `教会健康 ${choice.effect.stability > 0 ? "+" : ""}${choice.effect.stability}`,
      );
    if (choice.effect.persecution)
      changes.push(
        `逼迫指数 ${choice.effect.persecution > 0 ? "+" : ""}${choice.effect.persecution}`,
      );
    if (choice.effect.stamina)
      changes.push(
        `体力 ${choice.effect.stamina > 0 ? "+" : ""}${choice.effect.stamina}`,
      );
    if (choice.effect.provision)
      changes.push(
        `物资 ${choice.effect.provision > 0 ? "+" : ""}${choice.effect.provision}`,
      );
    if (choice.effect.morale)
      changes.push(
        `同工士气 ${choice.effect.morale > 0 ? "+" : ""}${choice.effect.morale}`,
      );

    if (changes.length > 0) {
      message += `\n📊 影响：${changes.join("， ")}`;
    }
    message += "\n" + "=".repeat(50);

    return message;
  }

  calculateFinalScore(): {
    totalScore: number;
    churchMaturity: number;
    resilience: number;
    stewardship: number;
    faithfulness: number;
    letterBonus: number;
    verdict: string;
    description: string;
  } {
    if (
      this.currentCity &&
      !this.cityStabilityRecords.has(this.currentCity.name)
    ) {
      this.cityStabilityRecords.set(this.currentCity.name, this.team.stability);
    }

    let totalStability = 0;
    let cityCount = 0;
    this.cityStabilityRecords.forEach((stability) => {
      totalStability += stability;
      cityCount++;
    });
    if (cityCount < this.cities.length) {
      totalStability += this.team.stability;
      cityCount++;
    }
    const churchMaturity = cityCount > 0 ? totalStability / cityCount : 0;

    let resilience = 100;
    if (this.totalStabilityLost > 0) {
      resilience = Math.max(
        0,
        100 - (this.totalStabilityLost / this.totalPersecutionReceived) * 100,
      );
    }

    const staminaRatio = (this.team.leader?.stamina || 0) / 100;
    const provisionRatio = this.team.provision / 150;
    const stewardship = ((staminaRatio + provisionRatio) / 2) * 100;

    const faithfulness = Math.min(100, 50 + this.totalFaithfulnessPoints);

    // 书信加成
    const letterBonus = this.letterSystem.letterScore / 10;

    const totalScore =
      churchMaturity * 0.35 +
      resilience * 0.15 +
      stewardship * 0.15 +
      faithfulness * 0.2 +
      Math.min(letterBonus, 15);

    // 完整书信集隐藏加成
    const collectionComplete = this.letterSystem.isCompleteCollection();
    const finalScore = collectionComplete
      ? Math.min(100, totalScore + 5)
      : totalScore;

    let verdict: string;
    let description: string;

    if (finalScore >= 90) {
      verdict = "【至死忠心的使徒】";
      description = collectionComplete
        ? '"你到达了罗马，身上带着基督的印记。你在亚细亚和欧洲建立的教会稳固如磐石，同工们视你为榜样。新约书信在你手中完成，成为后世信徒永恒的指南。你打过了那美好的仗。"'
        : '"你到达了罗马，身上带着基督的印记。你在亚细亚和欧洲建立的教会稳固如磐石，同工们视你为榜样。你打过了那美好的仗。"';
    } else if (finalScore >= 70) {
      verdict = "【劳苦的福音先锋】";
      description =
        '"尽管路途艰辛，身体衰弱，但你成功地在关键城市扎下了真理的根。书信成为了你留给后世最宝贵的财富。"';
    } else if (finalScore >= 40) {
      verdict = "【疲惫的守望者】";
      description =
        '"你到达了罗马，但心中充满了忧虑。部分城市的教会因缺乏教导而动摇。你尽力了，但资源匮乏让你步履维艰。"';
    } else {
      verdict = "【被围困的独行者】";
      description =
        '"你几乎是孤身一人到达罗马。虽然完成了旅程，但身后的教会网络支离破碎。这趟旅程对你而言是一场惨烈的生还。"';
    }

    return {
      totalScore: Math.round(finalScore),
      churchMaturity: Math.round(churchMaturity),
      resilience: Math.round(resilience),
      stewardship: Math.round(stewardship),
      faithfulness: Math.round(faithfulness),
      letterBonus: Math.round(letterBonus),
      verdict,
      description,
    };
  }

  displayEvaluation(): string {
    const score = this.calculateFinalScore();

    let output = "\n" + "=".repeat(60);
    output += "\n" + " ".repeat(15) + "📊 使命忠心度评估 📊";
    output += "\n" + "=".repeat(60);
    output += "\n";
    output += "\n📈 详细评分：";
    output += `\n   教会成熟度 (35%): ${score.churchMaturity}/100`;
    output += `\n   使命韧性   (15%): ${score.resilience}/100`;
    output += `\n   资源管家   (15%): ${score.stewardship}/100`;
    output += `\n   忠心指数   (20%): ${score.faithfulness}/100`;
    output += `\n   书信贡献   (+15): ${score.letterBonus}/15`;
    output += "\n" + "-".repeat(60);
    output += `\n📊 总分: ${score.totalScore}/100`;
    if (this.letterSystem.isCompleteCollection()) {
      output += "\n🏆 【隐藏成就】完成新约书信全集！";
    }
    output += "\n" + "=".repeat(60);
    output += `\n🏆 ${score.verdict}`;
    output += "\n" + "-".repeat(60);
    output += `\n${score.description}`;
    output += "\n" + "=".repeat(60);

    return output;
  }

  getGameStateDisplay(): string {
    if (this.isGameOver) {
      if (this.isVictory) {
        return '\n🏆 【游戏结束】你完成了所有城市的宣教使命！"那美好的仗我已经打过了..."';
      } else {
        return "\n💀 【游戏结束】你耗尽了体力或物资，无法继续旅程。请重新开始。";
      }
    }

    let state = `${this.team.getStatus()}`;
    if (this.currentCity) {
      state += `\n📍 当前位置: ${this.currentCity.getRoundInfo()}`;
    }

    // 显示同工团队
    if (this.companions.length > 0) {
      state += "\n\n👥 同工团队：";
      this.companions.forEach((companion) => {
        state += "\n   " + companion.getStatus();
      });
    }

    // 显示书信收集
    state += this.letterSystem.getCollectionStatus();

    state += this.getAvailableActions();

    return state;
  }

  // 紧凑版游戏状态显示（用于交互模式）
  getCompactGameStateDisplay(): string {
    if (this.isGameOver) {
      if (this.isVictory) {
        return '\n🏆 【游戏结束】你完成了所有城市的宣教使命！"那美好的仗我已经打过了..."';
      } else {
        return "\n💀 【游戏结束】你耗尽了体力或物资，无法继续旅程。请重新开始。";
      }
    }

    let state = this.team.getCompactStatus();

    // 添加当前位置和回合信息
    if (this.currentCity) {
      const currentTurn = this.currentCity.currentTurn || 1;
      const maxTurns = this.currentCity.maxTurns || 5;
      state += `\n📍 当前: ${this.currentCity.nameChinese} (第 ${currentTurn}/${maxTurns} 回合)`;
    }

    // 显示同工团队（紧凑单行）
    if (this.companions.length > 0) {
      const companionStr = this.companions
        .filter((c) => c.isActive)
        .map((c) => c.getUltraCompactStatus())
        .join(" | ");
      if (companionStr) {
        state += `\n👥 同工: ${companionStr}`;
      }
    }

    // 显示书信收集（紧凑）
    state += "\n" + this.letterSystem.getCompactCollectionStatus();

    // 显示最近事件
    if (this.eventHistory.length > 0) {
      const recentEvents = this.eventHistory.slice(-3);
      state += "\n📜 最近: " + recentEvents.join(" | ");
    }

    state += "\n" + this.getCompactAvailableActions();

    return state;
  }

  // 获取最近的事件日志（用于显示区域）
  getRecentEvents(count: number = 3): string[] {
    return this.gameLog.slice(-count);
  }

  getAvailableActions(): string {
    let output = "\n📋 可选行动:\n";
    const actions: ActionType[] = [
      "preach",
      "tentmaking",
      "disciple",
      "rest",
      "write_letter",
    ];

    actions.forEach((key, index) => {
      const action = ACTIONS[key];
      output += `  ${index + 1}. ${action.nameChinese} - ${action.description}\n`;
    });

    return output;
  }

  // 紧凑版行动选项
  getCompactAvailableActions(): string {
    const actions: ActionType[] = [
      "preach",
      "tentmaking",
      "disciple",
      "rest",
      "write_letter",
    ];
    const emojis = ["📢", "🏕️", "👥", "😴", "✉️"];

    let output = "\n🎯 行动: ";
    const actionDisplays: string[] = [];

    actions.forEach((key, index) => {
      const action = ACTIONS[key];
      const effects: string[] = [];

      // 收集正效果
      if (action.effect.stability && action.effect.stability > 0)
        effects.push(`+${action.effect.stability}健`);
      if (action.effect.provision && action.effect.provision > 0)
        effects.push(`+${action.effect.provision}物`);
      if (action.effect.stamina && action.effect.stamina > 0)
        effects.push(`+${action.effect.stamina}体`);
      if (action.effect.faith && action.effect.faith > 0)
        effects.push(`+${action.effect.faith}信`);
      if (action.effect.reputation && action.effect.reputation > 0)
        effects.push(`+${action.effect.reputation}声`);
      if (action.effect.disciples && action.effect.disciples > 0)
        effects.push(`+${action.effect.disciples}徒`);

      // 收集负效果
      if (action.effect.stability && action.effect.stability < 0)
        effects.push(`${action.effect.stability}健`);
      if (action.effect.provision && action.effect.provision < 0)
        effects.push(`${action.effect.provision}物`);
      if (action.effect.stamina && action.effect.stamina < 0)
        effects.push(`${action.effect.stamina}体`);
      if (action.effect.persecution && action.effect.persecution > 0)
        effects.push(`+${action.effect.persecution}逼`);

      actionDisplays.push(
        `[${index + 1}${action.nameChinese.substring(0, 2)}${emojis[index]}${effects.length > 0 ? effects.join("/") : ""}]`,
      );
    });

    output += actionDisplays.join(" ");
    output += " [q退出]";

    return output;
  }

  // 超紧凑版行动选项（仅显示编号和名称）
  getUltraCompactActions(): string {
    const actions: ActionType[] = [
      "preach",
      "tentmaking",
      "disciple",
      "rest",
      "write_letter",
    ];
    const emojis = ["📢", "🏕️", "👥", "😴", "✉️"];

    const actionDisplays = actions.map((key, index) => {
      const action = ACTIONS[key];
      return `[${index + 1}]${action.nameChinese.substring(0, 2)}${emojis[index]}`;
    });

    return "🎯 " + actionDisplays.join(" ") + " [q]退出";
  }

  addToLog(message: string): void {
    this.gameLog.push(`[回合${this.currentTurn}] ${message}`);
  }

  getGameLog(): string[] {
    return this.gameLog;
  }

  getGameState(): {
    team: Team;
    currentCity: City | null;
    turn: number;
    maxTurns: number;
    isGameOver: boolean;
    isVictory: boolean;
    letterCollection: ReturnType<LetterSystem["getCollectionStatus"]>;
  } {
    return {
      team: this.team,
      currentCity: this.currentCity,
      turn: this.currentTurn,
      maxTurns: this.maxTurns,
      isGameOver: this.isGameOver,
      isVictory: this.isVictory,
      letterCollection: this.letterSystem.getCollectionStatus(),
    };
  }

  async runDemo(delay: number = 1000): Promise<void> {
    console.log("\n🎮 开始保罗旅行布道游戏演示...\n");
    this.initializeGame();
    console.log(this.getGameStateDisplay());

    const actionKeys: ActionType[] = [
      "preach",
      "tentmaking",
      "disciple",
      "rest",
    ];

    while (!this.isGameOver) {
      await this.sleep(delay);

      const eventResult = this.triggerEvent();
      if (eventResult.event) {
        if (eventResult.event.type === "decision") {
          const decisionEvent = eventResult.event as DecisionEvent;
          const randomChoice = Math.floor(
            Math.random() * decisionEvent.choices.length,
          );
          const decisionResult = this.handleDecision(
            eventResult.event.id,
            randomChoice,
          );
          console.log(decisionResult);
        } else {
          console.log(eventResult.message);
        }
        await this.sleep(delay);
      }

      // AI策略：简单决策
      const randomAction =
        actionKeys[Math.floor(Math.random() * actionKeys.length)];

      let chosenAction: ActionType;
      if ((this.team.leader?.stamina || 0) < 30) {
        chosenAction = "rest";
      } else if (this.team.provision < 20) {
        chosenAction = "tentmaking";
      } else if (this.team.persecution > 60) {
        chosenAction = "disciple";
      } else {
        chosenAction = randomAction;
      }

      // AI分配同工任务（简化版）
      const companionActions = new Map<string, CompanionTaskType>();
      this.companions.forEach((companion) => {
        if (companion.stamina > 20 && companion.morale >= 40) {
          if (this.team.stability < 40) {
            companionActions.set(companion.id, "teach");
          } else if (this.team.persecution > 50) {
            companionActions.set(companion.id, "visitation");
          } else {
            companionActions.set(companion.id, "logistics");
          }
        } else {
          companionActions.set(companion.id, "rest");
        }
      });

      const result = this.handleAction(chosenAction, companionActions);
      console.log(result);
    }

    console.log(this.getGameStateDisplay());

    if (this.isVictory) {
      console.log(this.displayEvaluation());
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export { GameEngine };
