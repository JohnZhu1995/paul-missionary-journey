// ============================================
// 保罗传道旅程 - 主入口模块
// 职责：导入所有模块，提供交互式游戏和演示模式
// ============================================

import * as readline from 'readline';
import { 
  ResourceChange, 
  ActionType, 
  CompanionTaskType, 
  SpecialtyType,
  Action,
  LetterEffect,
  GameEvent,
  DecisionEvent,
} from './types.js';
import { 
  INITIAL_RESOURCES, 
  CITY_CONFIG, 
  ACTIONS, 
  COMPANION_TASKS 
} from './constants.js';
import { 
  ANTIOCH_EVENTS, 
  PHILIPPI_EVENTS, 
  EPHESUS_EVENTS, 
  LETTER_EVENTS 
} from './events.js';
import { Companion } from './companion.js';
import { LetterSystem } from './letter.js';
import { Player } from './player.js';
import { City } from './city.js';
import { GameEngine } from './game-engine.js';

// 演示模式 - 自动运行
async function runDemoMode(): Promise<void> {
  const game = new GameEngine();
  console.log('\n🎮 开始演示模式（AI自动游玩）...\n');
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

  console.clear?.();
  console.log('\n🎮 欢迎来到《保罗旅行布道》v2.0！');
  console.log('\n🆕 新特性：');
  console.log('- 👥 同工系统：招募同工，分配任务，团队协作');
  console.log('- ✉️ 书信系统：撰写书信，跨越时空治理教会');
  console.log('- 📚 收集要素：完成新约书信全集，解锁隐藏结局');
  console.log('\n按 Enter 开始游戏...');
  await question('');

  game.initializeGame();
  game.startCity('Antioch');

  let lastAction = '';
  let lastCompanionResults: string[] = [];

  while (!game.isGameOver) {
    console.clear?.();
    displayGameState(game, lastAction, lastCompanionResults);
    
    const actionChoice = await question('\n🎯 为保罗选择行动 > ');
    
    if (actionChoice.toLowerCase() === 'q') {
      console.log('\n👋 感谢游玩！再见！');
      rl.close();
      return;
    }

    const actionMap: Record<string, ActionType> = {
      '1': 'preach',
      '2': 'tentmaking',
      '3': 'disciple',
      '4': 'rest',
      '5': 'write_letter',
    };

    const actionType = actionMap[actionChoice.trim()];
    if (!actionType) {
      console.log('❌ 无效选择，请输入 1-5');
      await question('\n按 Enter 继续...');
      continue;
    }

    const action = ACTIONS[actionType];
    lastAction = `保罗: ${action.nameChinese}`;
    
    const companionActions = await assignCompanionTasks(game, question);
    
    const result = game.handleAction(actionType, companionActions);
    
    lastCompanionResults = result.split('\n').filter(line => line.includes('✅') || line.includes('❌'));
    
    console.log('\n' + result);

    const eventResult = game.triggerEvent();
    if (eventResult.event) {
      if (eventResult.event.type === 'decision') {
        await handleDecisionEvent(game, eventResult.event as DecisionEvent, question);
      } else {
        console.log(eventResult.message);
      }
    }

    await question('\n按 Enter 继续...');
    lastAction = '';
    lastCompanionResults = [];
  }

  console.clear?.();
  console.log(game.getGameStateDisplay());
  
  if (game.isVictory) {
    console.log('\n🎊 恭喜完成宣教使命！');
    console.log(game.displayEvaluation());
  } else {
    console.log('\n💀 游戏结束');
  }
  
  await question('\n按 Enter 退出...');
  rl.close();
}

function formatEffect(effect: ResourceChange, isCost: boolean = false): string {
  const parts: string[] = [];
  const prefix = isCost ? '-' : '+';
  
  if (effect.stamina) parts.push(`体${prefix}${Math.abs(effect.stamina)}`);
  if (effect.faith) parts.push(`信${prefix}${Math.abs(effect.faith)}`);
  if (effect.provision) parts.push(`物${prefix}${Math.abs(effect.provision)}`);
  if (effect.reputation) parts.push(`声${prefix}${Math.abs(effect.reputation)}`);
  if (effect.disciples) parts.push(`徒${prefix}${Math.abs(effect.disciples)}`);
  if (effect.stability) parts.push(`稳${prefix}${Math.abs(effect.stability)}`);
  if (effect.persecution) parts.push(`逼${prefix}${Math.abs(effect.persecution)}`);
  if (effect.morale) parts.push(`士${prefix}${Math.abs(effect.morale)}`);
  if (effect.churches) parts.push(`教${prefix}${Math.abs(effect.churches)}`);
  
  return parts.length > 0 ? parts.join(' ') : '无';
}

function formatActionCard(key: string, action: Action, index: number): string {
  const cost = formatEffect(action.cost, true);
  const effect = formatEffect(action.effect);
  const emojis = ['📢', '🏕️', '👥', '😴', '✉️'];
  return `│ ${index}[${emojis[index-1]}${action.nameChinese}] 消耗:${cost} 收益:${effect}`;
}

function displayGameState(game: GameEngine, lastAction?: string, companionResults?: string[]): void {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log(`║  📍 ${(game.currentCity?.nameChinese || '').padEnd(6)}  │  回合 ${game.currentCity?.currentTurn || 1}/${game.currentCity?.maxTurns || 5}  ║`);
  console.log('╠═══════════════════════════════════════════════════════╣');
  
  const p = game.player;
  const statusLine = `║  ❤️体:${String(p.stamina).padStart(3)}/100 🍞物:${String(p.provision).padStart(3)}/150 ⛪稳:${String(p.stability).padStart(3)}/100`;
  console.log(statusLine.padEnd(60) + '║');
  const statusLine2 = `║  ✝️信:${String(p.faith).padStart(3)}/200 🔥逼:${String(p.persecution).padStart(3)}/100 ⭐声:${String(p.reputation).padStart(3)}/200`;
  console.log(statusLine2.padEnd(60) + '║');
  
  if (game.companions.length > 0) {
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log('║  👥 同工团队:');
    game.companions.forEach(c => {
      if (c.isActive) {
        console.log(`║     ${c.nameChinese}[${c.specialtyName}] 💪${c.stamina} 😊${c.morale}%`);
      }
    });
  }
  
  console.log('╠═══════════════════════════════════════════════════════╣');
  console.log('║  🎯 行动选项 (消耗 → 收益):');
  
  const actionKeys: ActionType[] = ['preach', 'tentmaking', 'disciple', 'rest', 'write_letter'];
  actionKeys.forEach((key, idx) => {
    console.log(formatActionCard(key, ACTIONS[key], idx + 1));
  });
  console.log('║  [q] 退出游戏');
  console.log('╠═══════════════════════════════════════════════════════╣');
  
  if (lastAction) {
    console.log(`║  📝 上次行动: ${lastAction}`);
  }
  
  if (companionResults && companionResults.length > 0) {
    console.log('║  👥 同工行动:');
    companionResults.forEach(r => {
      const trimmed = r.replace('✅ ', '').replace('❌ ', '');
      console.log(`║     ${trimmed}`);
    });
  }
  
  console.log('╚═══════════════════════════════════════════════════════╝');
}

async function assignCompanionTasks(game: GameEngine, question: (p: string) => Promise<string>): Promise<Map<string, CompanionTaskType>> {
  const companionActions = new Map<string, CompanionTaskType>();
  const activeCompanions = game.player.companions.filter((c: Companion) => c.isActive && c.morale >= 20);
  
  if (activeCompanions.length > 0) {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  👥 为同工分配任务 (消耗 → 收益):                    ║');
    console.log('╠═══════════════════════════════════════════════════════╣');
    
    const taskKeys: CompanionTaskType[] = ['teach', 'visitation', 'logistics', 'assist_writing', 'rest'];
    const taskEmojis = ['📖', '🚶', '📦', '✍️', '😴'];
    
    taskKeys.forEach((task, idx) => {
      const taskInfo = COMPANION_TASKS[task];
      const cost = `体-${taskInfo.staminaCost}`;
      const effect = formatEffect(taskInfo.effect);
      console.log(`║  [${idx + 1}]${taskEmojis[idx]}${taskInfo.nameChinese} 消耗:${cost} 收益:${effect}`);
    });
    console.log('║  [0] 跳过（默认休息)');
    console.log('╚═══════════════════════════════════════════════════════╝');
    
    for (const companion of activeCompanions) {
      let validChoice = false;
      while (!validChoice) {
        const choice = await question(`\n👤 为 ${companion.nameChinese}[${companion.specialtyName}] 选择任务 > `);
        if (choice.trim() === '0' || choice.trim() === '') {
          companionActions.set(companion.id, 'rest');
          console.log(`   → ${companion.nameChinese} 选择休息 😴`);
          validChoice = true;
        } else {
          const taskMap: Record<string, CompanionTaskType> = {
            '1': 'teach',
            '2': 'visitation',
            '3': 'logistics',
            '4': 'assist_writing',
            '5': 'rest',
          };
          if (taskMap[choice.trim()]) {
            const task = taskMap[choice.trim()];
            const taskInfo = COMPANION_TASKS[task];
            companionActions.set(companion.id, task);
            console.log(`   → ${companion.nameChinese} 选择 ${taskInfo.nameChinese} ${taskEmojis[taskKeys.indexOf(task)]}`);
            validChoice = true;
          } else {
            console.log('   ❌ 无效选择，请输入 0-5');
          }
        }
      }
    }
  }
  
  return companionActions;
}

async function handleDecisionEvent(game: GameEngine, event: DecisionEvent, question: (p: string) => Promise<string>): Promise<void> {
  console.log('\n' + '═'.repeat(50));
  console.log(`📜 ${event.name}`);
  console.log(event.text);
  console.log('═'.repeat(50));
  event.choices.forEach((choice, index) => {
    console.log(`  ${index + 1}. ${choice.label}`);
  });
  
  let validDecision = false;
  while (!validDecision) {
    const decisionChoice = await question('\n请选择 > ');
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
  
  if (args.includes('--demo')) {
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
  Player,
  City,
  GameEngine,
  
  // 主函数
  main,
  runDemoMode,
  runInteractiveMode,
};

// 如果直接运行此文件，执行主函数
if (typeof require !== 'undefined' && require.main === module) {
  main();
}
