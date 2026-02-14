// ============================================
// 保罗传道旅程 - 配置常量模块
// 职责：定义游戏的所有配置常量和预设值
// ============================================

import { ResourceChange, ActionType, CompanionTaskType, Action } from './types.js';

const INITIAL_RESOURCES: ResourceChange = {
  provision: 100,
  stability: 50,
  persecution: 0,
  reputation: 50,
  churches: 0,
  disciples: 0,
  morale: 50, // 团队士气（原为个人士气）
  // spirit 现在为个人资源，在 Companion 中初始化
};

const CITY_CONFIG: Record<string, { name: string; nameChinese: string; difficulty: number; rounds: number; basePersecutionRate: number; maxTurns: number; description: string }> = {
  Antioch: {
    name: 'Antioch',
    nameChinese: '安提阿',
    difficulty: 1,
    rounds: 4,
    basePersecutionRate: 5,
    maxTurns: 4,
    description: '保罗传道旅程的起点，信徒众多，教导基础稳固',
  },
  Philippi: {
    name: 'Philippi',
    nameChinese: '腓立比',
    difficulty: 2,
    rounds: 5,
    basePersecutionRate: 8,
    maxTurns: 5,
    description: '马其顿的首城，紫色布料商人之地，需要面对挑战',
  },
  Ephesus: {
    name: 'Ephesus',
    nameChinese: '以弗所',
    difficulty: 3,
    rounds: 6,
    basePersecutionRate: 12,
    maxTurns: 6,
    description: '亚细亚的大都会，亚底米神庙所在地，充满属灵争战',
  },
};

const ACTIONS: Record<ActionType, Action> = {
  preach: {
    id: 'preach',
    name: 'Preach Gospel',
    nameChinese: '传扬福音',
    description: '向城中居民宣讲福音，建立教会，增加信徒',
    cost: { stamina: 20, spirit: 5, morale: 10 },
    effect: { reputation: 10, disciples: 2, persecution: 10 },
  },
  tentmaking: {
    id: 'tentmaking',
    name: 'Tentmaking',
    nameChinese: '织帐棚',
    description: '制作帐篷维生，恢复体力，维持基本生活',
    cost: { stamina: 10 },
    effect: { stamina: 15, spirit: 5, provision: 10 },
  },
  disciple: {
    id: 'disciple',
    name: 'Train Disciples',
    nameChinese: '训练门徒',
    description: '深入教导信徒，建立坚固的门徒，增加教会根基',
    cost: { stamina: 15, spirit: 10 },
    effect: { disciples: 3, reputation: 5, stability: 10 },
    minDisciples: 2,
  },
  rest: {
    id: 'rest',
    name: 'Rest',
    nameChinese: '安歇',
    description: '休息祷告，恢复体力和灵力',
    cost: {},
    effect: { stamina: 30, spirit: 15 },
  },
  write_letter: {
    id: 'write_letter',
    name: 'Write Epistle',
    nameChinese: '撰写书信',
    description: '为建立的教会撰写书信，留下属灵遗产',
    cost: { stamina: 25, spirit: 20, morale: 15 },
    effect: { reputation: 15 },
    requiresCompanion: true,
  },
};

const COMPANION_TASKS: Record<CompanionTaskType, { name: string; nameChinese: string; description: string; staminaCost: number; effect: ResourceChange }> = {
  preach: {
    name: 'Preach',
    nameChinese: '宣讲',
    description: '协助宣讲福音',
    staminaCost: 15,
    effect: { reputation: 5 },
  },
  tentmaking: {
    name: 'Tentmaking',
    nameChinese: '织帐',
    description: '协助制作帐篷',
    staminaCost: 10,
    effect: { stamina: 10, provision: 5 },
  },
  heal: {
    name: 'Heal',
    nameChinese: '医治',
    description: '为人医病',
    staminaCost: 20,
    effect: { reputation: 8, spirit: 5 },
  },
  teach: {
    name: 'Teach',
    nameChinese: '教导',
    description: '教导信徒',
    staminaCost: 15,
    effect: { disciples: 1, stability: 5 },
  },
  defend: {
    name: 'Defend',
    nameChinese: '辩护',
    description: '为信仰辩护',
    staminaCost: 15,
    effect: { reputation: 3, persecution: -5 },
  },
  visitation: {
    name: 'Visitation',
    nameChinese: '探访',
    description: '探访信徒，关心软弱的弟兄',
    staminaCost: 12,
    effect: { stability: 8, morale: 5 },
  },
  logistics: {
    name: 'Logistics',
    nameChinese: '后勤',
    description: '管理物资和后勤',
    staminaCost: 10,
    effect: { provision: 10, stamina: 5 },
  },
  assist_writing: {
    name: 'Assist Writing',
    nameChinese: '协助写作',
    description: '协助撰写书信',
    staminaCost: 10,
    effect: { reputation: 3 },
  },
  rest: {
    name: 'Rest',
    nameChinese: '休息',
    description: '休息恢复体力',
    staminaCost: 0,
    effect: { stamina: 20, morale: 5 },
  },
};

export {
  INITIAL_RESOURCES,
  CITY_CONFIG,
  ACTIONS,
  COMPANION_TASKS,
};
