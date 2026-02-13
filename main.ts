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

  while (!game.isGameOver) {
    console.clear?.();
    displayGameState(game);
    
    const actionChoice = await question('\n🎯 选择行动 > ');
    
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

    const companionActions = await assignCompanionTasks(game, question);
    
    const result = game.handleAction(actionType, companionActions);
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

function displayGameState(game: GameEngine): void {
  console.log('\n┌─────────────────────────────────────┐');
  console.log('│  📍 ' + (game.currentCity?.nameChinese || '') + '  |  回合 ' + (game.currentCity?.currentTurn || 1) + '/' + (game.currentCity?.maxTurns || 5) + '  │');
  console.log('├─────────────────────────────────────┤');
  
  const p = game.player;
  console.log('│ 保罗状态:');
  console.log(`│   ❤️ 体力 ${p.stamina}/100  🍞 物资 ${p.provision}/150  ⛪ 教会 ${p.stability}/100`);
  console.log(`│   ✝️ 信心 ${p.faith}/100  🔥 逼迫 ${p.persecution}/100  ⭐ 名声 ${p.reputation}`);
  
  if (game.companions.length > 0) {
    console.log('├─────────────────────────────────────┤');
    console.log('│ 👥 同工团队:');
    game.companions.forEach(c => {
      if (c.isActive) {
        console.log(`│   ${c.nameChinese}[${c.specialtyName}] 💪${c.stamina} 😊${c.morale}`);
      }
    });
  }
  
  console.log('├─────────────────────────────────────┤');
  console.log('│ 🎯 行动选项:');
  console.log('│   [1]📢 讲道  [2]🏕️ 织帐  [3]👥 门训');
  console.log('│   [4]😴 休息  [5]✉️ 写信');
  console.log('└─────────────────────────────────────┘');
}

async function assignCompanionTasks(game: GameEngine, question: (p: string) => Promise<string>): Promise<Map<string, CompanionTaskType>> {
  const companionActions = new Map<string, CompanionTaskType>();
  const activeCompanions = game.player.companions.filter(c => c.isActive && c.morale >= 20);
  
  if (activeCompanions.length > 0) {
    console.log('\n┌─────────────────────────────────────┐');
    console.log('│ 👥 为同工分配任务:');
    console.log('│   [1]教  [2]访  [3]后  [4]协  [5]休  [0]跳过');
    console.log('└─────────────────────────────────────┘');
    
    for (const companion of activeCompanions) {
      let validChoice = false;
      while (!validChoice) {
        const choice = await question(`${companion.nameChinese} > `);
        if (choice.trim() === '0' || choice.trim() === '') {
          companionActions.set(companion.id, 'rest');
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
            companionActions.set(companion.id, taskMap[choice.trim()]);
            validChoice = true;
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
    if (choiceIndex === 0 || choiceIndex === 1) {
      const decisionResult = game.handleDecision(event.id, choiceIndex);
      console.log(decisionResult);
      validDecision = true;
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
