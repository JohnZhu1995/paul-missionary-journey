// ============================================
// 保罗传道旅程 - 主入口模块
// 职责：导入所有模块，提供交互式游戏和演示模式
// ============================================

import * as readline from "readline";
import {
  ResourceChange,
  ActionType,
  CompanionTaskType,
  SpecialtyType,
  Action,
  LetterEffect,
  GameEvent,
  DecisionEvent,
} from "./types.js";
import {
  INITIAL_RESOURCES,
  CITY_CONFIG,
  ACTIONS,
  COMPANION_TASKS,
} from "./constants.js";
import {
  ANTIOCH_EVENTS,
  PHILIPPI_EVENTS,
  EPHESUS_EVENTS,
  LETTER_EVENTS,
} from "./events.js";
import { Companion } from "./companion.js";
import { LetterSystem } from "./letter.js";
import { City } from "./city.js";
import { GameEngine } from "./game-engine.js";

// 演示模式 - 自动运行
async function runDemoMode(): Promise<void> {
  const game = new GameEngine();
  console.log("\n🎮 开始演示模式（AI自动游玩）...\n");
  await game.runDemo(800);
}

// 交互模式 - 手动游玩
async function runInteractiveMode(): Promise<void> {
  const game = new GameEngine();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => resolve(answer));
    });
  };

  console.log("\n".repeat(5));
  console.log("\n🎮 欢迎来到《保罗旅行布道》v2.0！");
  console.log("\n🆕 新特性：");
  console.log("- 👥 同工系统：招募同工，分配任务，团队协作");
  console.log("- ✉️ 书信系统：撰写书信，跨越时空治理教会");
  console.log("- 📚 收集要素：完成新约书信全集，解锁隐藏结局");
  console.log("\n按 Enter 开始游戏...");
  await question("");

  game.initializeGame();
  game.startCity("Antioch");

  let currentAction = "";
  let companionTaskSummary = "";

  while (!game.isGameOver) {
    // 检查是否有事件需要显示
    if (game.hasEventToDisplay()) {
      console.log(game.getEventDisplay());
      await question("\n按 Enter 继续...");
      game.clearEventDisplay();
    }

    // 清屏：使用多行换行替代 console.clear（兼容性更好）
    console.log("\n".repeat(5));

    // 显示状态面板（带选项提示）
    displayStatusWithAction(game, currentAction, companionTaskSummary);

    // 显示行动选项
    displayActionOptions();

    const actionChoice = await question("\n👤 为保罗选择行动 > ");

    if (actionChoice.toLowerCase() === "q") {
      console.log("\n👋 感谢游玩！再见！");
      rl.close();
      return;
    }

    const actionMap: Record<string, ActionType> = {
      "1": "preach",
      "2": "tentmaking",
      "3": "disciple",
      "4": "rest",
      "5": "write_letter",
    };

    const actionType = actionMap[actionChoice.trim()];
    if (!actionType) {
      console.log("❌ 无效选择，请输入 1-5");
      await question("\n按 Enter 继续...");
      continue;
    }

    const action = ACTIONS[actionType];
    currentAction = action.nameChinese;

    // 选择同工任务
    const companionActions = await assignCompanionTasks(game, question);

    // 生成同工任务摘要
    const taskNames: string[] = [];
    for (const [companionId, task] of companionActions) {
      const companion = game.companions.find((c) => c.id === companionId);
      if (companion) {
        const taskInfo = COMPANION_TASKS[task];
        taskNames.push(`${companion.nameChinese}:${taskInfo.nameChinese}`);
      }
    }
    companionTaskSummary = taskNames.join(" ");

    // 执行行动
    const result = game.handleAction(actionType, companionActions);

    console.log("\n" + result);

    // 触发回合事件并显示面板
    const eventResult = game.triggerEvent();
    if (eventResult.event) {
      if (eventResult.event.type === "decision") {
        await handleDecisionEvent(
          game,
          eventResult.event as DecisionEvent,
          question,
        );
      } else {
        // 将事件存储到 lastTriggeredEvent 以使用面板显示
        const event = eventResult.event as GameEvent;
        game.setLastEventForDisplay(event.name, event.description, event.text || event.description, event.effect);
        console.log(game.getEventDisplay());
        game.clearEventDisplay();
      }
    }

    await question("\n按 Enter 继续下一回合...");
    currentAction = "";
    companionTaskSummary = "";
  }

  console.log("\n".repeat(5));
  console.log(game.getGameStateDisplay());

  if (game.isVictory) {
    console.log("\n🎊 恭喜完成宣教使命！");
    console.log(game.displayEvaluation());
  } else {
    console.log("\n💀 游戏结束");
  }

  await question("\n按 Enter 退出...");
  rl.close();
}

function formatEffect(effect: ResourceChange, isCost: boolean = false): string {
  const parts: string[] = [];
  const prefix = isCost ? "-" : "+";

  if (effect.stamina) parts.push(`体${prefix}${Math.abs(effect.stamina)}`);
  if (effect.spirit) parts.push(`灵${prefix}${Math.abs(effect.spirit)}`);
  if (effect.provision) parts.push(`物${prefix}${Math.abs(effect.provision)}`);
  if (effect.reputation)
    parts.push(`声${prefix}${Math.abs(effect.reputation)}`);
  if (effect.disciples) parts.push(`徒${prefix}${Math.abs(effect.disciples)}`);
  if (effect.stability) parts.push(`稳${prefix}${Math.abs(effect.stability)}`);
  if (effect.persecution)
    parts.push(`逼${prefix}${Math.abs(effect.persecution)}`);
  if (effect.morale) parts.push(`士${prefix}${Math.abs(effect.morale)}`);
  if (effect.churches) parts.push(`教${prefix}${Math.abs(effect.churches)}`);

  return parts.length > 0 ? parts.join(" ") : "无";
}

function displayStatusWithAction(
  game: GameEngine,
  currentAction: string = "",
  companionTasks: string = "",
): void {
  const team = game.team;
  const city = game.currentCity;
  const status = team.getTeamViewStatus();

  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║  📊 状态概览                                      ║");
  console.log("╠═══════════════════════════════════════════════════════╗");

  // 第一行：城市信息 + 回合
  console.log(
    `║  📍 ${(city?.nameChinese || "").padEnd(8)}       │  ${String(city?.currentTurn || 1).padStart(2)}/${city?.maxTurns || 5}回合${" ".repeat(20)}║`,
  );
  
  // 城市被动 buff
  if (city) {
    const baseRate = city.basePersecutionRate;
    let cityBuff = "";
    if (baseRate > 0) {
      cityBuff = `🔥 每回合+${baseRate}逼迫`;
    }
    if (cityBuff) {
      console.log(`║  🏙️ 城市效果: ${cityBuff.padEnd(40)}║`);
    }
  }
  
  console.log("╠═══════════════════════════════════════════════════════╣");
  console.log("║  团队状态:");
  console.log(
    `║  🍞 物资 ${status.provision.padStart(10)}   ⛪ 稳定 ${status.stability.padStart(10)}`,
  );
  console.log(
    `║  🔥 逼迫 ${status.persecution.padStart(10)}   ⭐ 名声 ${status.reputation.padStart(10)}`,
  );
  console.log(
    `║  😊 士气 ${status.morale.padStart(10)}   👥 门徒 ${String(team.disciples).padStart(10)}`,
  );

  if (team.leader || (team.members && team.members.length > 0)) {
    console.log("╠═══════════════════════════════════════════════════════╣");
    console.log("║  团队:");
    
    // 显示保罗（leader）- 显示体力和灵力（个人资源）
    if (team.leader) {
      const leaderStatus = `${team.leader.avatarEmoji} ${team.leader.nameChinese}[${team.leader.specialtyName}] 💪${team.leader.stamina}  ✝️${team.leader.spirit}`;
      const leaderBuff = `🎁 ${team.leader.specialtyDescription}`;
      console.log(`║  ${leaderStatus}`);
      console.log(`║     ${leaderBuff}`);
    }
    
    // 显示其他同工 - 显示体力和灵力
    if (team.members && team.members.length > 0) {
      team.members.forEach((c) => {
        if (c.isActive) {
          const memberStatus = `${c.avatarEmoji} ${c.nameChinese}[${c.specialtyName}] 💪${c.stamina}  ✝️${c.spirit}`;
          const memberBuff = `🎁 ${c.specialtyDescription}`;
          console.log(`║  ${memberStatus}`);
          console.log(`║     ${memberBuff}`);
        }
      });
    }

    if (companionTasks) {
      console.log("╠═══════════════════════════════════════════════════════╣");
      console.log(`║  📋 任务: ${companionTasks}`);
    }
  }
  console.log("╚═══════════════════════════════════════════════════════╝");
}

function displayActionOptions(): void {
  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║  🎯 保罗行动选择 (消耗 → 收益)                       ║");
  console.log("╠═══════════════════════════════════════════════════════╣");

  const actionData: { key: ActionType; emoji: string }[] = [
    { key: "preach", emoji: "📢" },
    { key: "tentmaking", emoji: "🏕️" },
    { key: "disciple", emoji: "👥" },
    { key: "rest", emoji: "😴" },
    { key: "write_letter", emoji: "✉️" },
  ];

  actionData.forEach((data, idx) => {
    const action = ACTIONS[data.key];
    const cost = formatEffect(action.cost, true);
    const effect = formatEffect(action.effect);
    console.log(
      `║  [${idx + 1}] ${data.emoji} ${action.nameChinese.padEnd(4)}  消耗:${cost.padEnd(12)}  收益:${effect}`,
    );
  });
  console.log("║  [q] 退出游戏");
  console.log("╚═══════════════════════════════════════════════════════╝");
}

function displayCompanionTaskOptions(): void {
  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║  👥 同工任务选择 (消耗 → 收益)                      ║");
  console.log("╠═══════════════════════════════════════════════════════╣");

  const taskData: { key: CompanionTaskType; emoji: string }[] = [
    { key: "teach", emoji: "📖" },
    { key: "visitation", emoji: "🚶" },
    { key: "logistics", emoji: "📦" },
    { key: "assist_writing", emoji: "✍️" },
    { key: "rest", emoji: "😴" },
  ];

  taskData.forEach((data, idx) => {
    const task = COMPANION_TASKS[data.key];
    const cost = `体-${task.staminaCost}`;
    const effect = formatEffect(task.effect);
    console.log(
      `║  [${idx + 1}] ${data.emoji} ${task.nameChinese.padEnd(2)}   消耗:${cost.padEnd(8)}  收益:${effect}`,
    );
  });
  console.log("║  [0] 跳过（默认休息)");
  console.log("╚═══════════════════════════════════════════════════════╝");
}

async function assignCompanionTasks(
  game: GameEngine,
  question: (p: string) => Promise<string>,
): Promise<Map<string, CompanionTaskType>> {
  const companionActions = new Map<string, CompanionTaskType>();
  const activeCompanions = game.team.members.filter(
    (c: Companion) => c.isActive && c.spirit >= 20,
  );

  if (activeCompanions.length > 0) {
    displayCompanionTaskOptions();

    for (const companion of activeCompanions) {
      let validChoice = false;
      while (!validChoice) {
        const choice = await question(
          `\n👤 为 ${companion.nameChinese}[${companion.specialtyName}] 选择 > `,
        );
        if (choice.trim() === "0" || choice.trim() === "") {
          companionActions.set(companion.id, "rest");
          console.log(`   ✓ ${companion.nameChinese} → 休息 😴`);
          validChoice = true;
        } else {
          const taskMap: Record<string, CompanionTaskType> = {
            "1": "teach",
            "2": "visitation",
            "3": "logistics",
            "4": "assist_writing",
            "5": "rest",
          };
          if (taskMap[choice.trim()]) {
            const task = taskMap[choice.trim()];
            const taskInfo = COMPANION_TASKS[task];
            companionActions.set(companion.id, task);
            const emoji = ["📖", "🚶", "📦", "✍️", "😴"][
              parseInt(choice.trim()) - 1
            ];
            console.log(
              `   ✓ ${companion.nameChinese} → ${taskInfo.nameChinese} ${emoji}`,
            );
            validChoice = true;
          } else {
            console.log("   ❌ 无效选择，请输入 0-5");
          }
        }
      }
    }
  }

  return companionActions;
}

async function handleDecisionEvent(
  game: GameEngine,
  event: DecisionEvent,
  question: (p: string) => Promise<string>,
): Promise<void> {
  console.log("\n" + "═".repeat(50));
  console.log(`📜 ${event.name}`);
  console.log(event.text);
  console.log("═".repeat(50));
  event.choices.forEach((choice, index) => {
    console.log(`  ${index + 1}. ${choice.label}`);
  });

  let validDecision = false;
  while (!validDecision) {
    const decisionChoice = await question("\n请选择 > ");
    const choiceIndex = parseInt(decisionChoice.trim()) - 1;
    if (choiceIndex >= 0 && choiceIndex < event.choices.length) {
      const decisionResult = game.handleDecision(event.id, choiceIndex);
      console.log(decisionResult);
      validDecision = true;
    } else {
      console.log(`❌ 请输入 1-${event.choices.length}`);
    }
  }
}

// 主函数
async function main(): Promise<void> {
  // 检测命令行参数
  const args = process.argv.slice(2);

  if (args.includes("--demo")) {
    await runDemoMode();
  } else {
    await runInteractiveMode();
  }
}

// 导出所有类和类型（向后兼容）
export {
  // 类型
  ResourceChange,
  ActionType,
  CompanionTaskType,
  SpecialtyType,
  Action,
  LetterEffect,
  GameEvent,
  DecisionEvent,

  // 常量
  INITIAL_RESOURCES,
  CITY_CONFIG,
  ACTIONS,
  COMPANION_TASKS,

  // 事件
  ANTIOCH_EVENTS,
  PHILIPPI_EVENTS,
  EPHESUS_EVENTS,
  LETTER_EVENTS,

  // 类
  Companion,
  LetterSystem,
  City,
  GameEngine,

  // 主函数
  main,
  runDemoMode,
  runInteractiveMode,
};

// 如果直接运行此文件，执行主函数
if (typeof require !== "undefined" && require.main === module) {
  main();
}
