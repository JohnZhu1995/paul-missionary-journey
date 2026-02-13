// ============================================
// 保罗传道旅程 - 事件库模块
// 职责：定义游戏中所有城市和书信相关的事件
// ============================================

import { GameEvent, DecisionEvent } from './types.js';

const ANTIOCH_EVENTS: Record<string, GameEvent | DecisionEvent> = {
  christian_name: {
    id: 'christian_name',
    name: '基督徒的称呼',
    type: 'event',
    description: '门徒称为基督徒是从安提阿起首',
    text: '在安提阿的教会中，信徒们被外人称为"基督徒"，这个名字成为了信仰的标志。',
    effect: { reputation: 10, faith: 5 },
  },
  paul_barnabas_dispute: {
    id: 'paul_barnabas_dispute',
    name: '保罗与巴拿巴的争执',
    type: 'decision',
    description: '关于是否带马可同行的问题',
    text: '巴拿巴想要带称呼马可的约翰同去，但保罗以为不带他同去为宜，因为马可从前在旁非利亚离开他们。',
    choices: [
      { label: '坚持己见', description: '保罗认为马可不够忠心，不能同行', effect: { morale: -20, stability: -5 } },
      { label: '让步', description: '尊重巴拿巴的意见，允许马可同行', effect: { morale: 10, faith: 5 } },
    ],
  } as DecisionEvent,
  synagogue_dispute: {
    id: 'synagogue_dispute',
    name: '会堂争论',
    type: 'event',
    description: '在会堂中与人辩论',
    text: '每逢安息日，你们在会堂里与人辩论，劝化众人。',
    effect: { reputation: 5, persecution: 10 },
  },
  barnabas_encouragement: {
    id: 'barnabas_encouragement',
    name: '巴拿巴的鼓励',
    type: 'event',
    description: '劝慰子巴拿巴的鼓励',
    text: '巴拿巴用信心和鼓励坚固众人。',
    effect: { morale: 15, faith: 10, provision: 10 },
  },
  gentile_inquiry: {
    id: 'gentile_inquiry',
    name: '外邦人的询问',
    type: 'decision',
    description: '外邦人来询问救恩之道',
    text: '有几个外邦人来到，要听主的道。',
    choices: [
      { label: '热情接待', description: '向外邦人传讲福音', effect: { disciples: 2, reputation: 5 } },
      { label: '谨慎对待', description: '先观察他们的动机', effect: { faith: 5 } },
    ],
  } as DecisionEvent,
};

const PHILIPPI_EVENTS: Record<string, GameEvent | DecisionEvent> = {
  lydia_meeting: {
    id: 'lydia_meeting',
    name: '遇见吕底亚',
    type: 'event',
    description: '卖紫色布匹的妇人吕底亚信主',
    text: '在河边祷告时，你们遇见卖紫色布匹的妇人吕底亚，她敞开心门接受了福音。',
    effect: { disciples: 1, faith: 10, reputation: 5 },
  },
  sila_recruitment: {
    id: 'sila_recruitment',
    name: '西拉加入',
    type: 'event',
    description: '西拉成为同工',
    text: '西拉加入了你们的宣教团队，他是一个坚韧的人。',
    effect: { morale: 10, stability: 5 },
  },
  python_spirit: {
    id: 'python_spirit',
    name: '巫鬼的吵嚷',
    type: 'decision',
    description: '使女被巫鬼所附',
    text: '有一个使女被巫鬼所附，她跟随你们喊叫说："这些人是至高神的仆人。"',
    choices: [
      { label: '赶出鬼去', description: '奉耶稣的名赶出污鬼', effect: { reputation: 10, persecution: 20 } },
      { label: '暂时忍耐', description: '暂时忍耐几天，寻找合适时机', effect: { stamina: -10 } },
    ],
  } as DecisionEvent,
  philippi_prison: {
    id: 'philippi_prison',
    name: '被囚与地震',
    type: 'event',
    description: '被打并被投入狱中',
    text: '因赶鬼引起骚动，保罗和西拉被打并被投入狱中。半夜地大震动，牢门全开。',
    effect: { persecution: -50, reputation: 20 },
  },
  midnight_praise: {
    id: 'midnight_praise',
    name: '半夜唱诗祷告',
    type: 'event',
    description: '在狱中祷告唱诗赞美神',
    text: '约在半夜，保罗和西拉祷告唱诗赞美神，众囚犯也侧耳而听。',
    effect: { stability: 20, reputation: 15, morale: 20 },
  },
};

const EPHESUS_EVENTS: Record<string, GameEvent | DecisionEvent> = {
  tyrannus_school: {
    id: 'tyrannus_school',
    name: '推喇奴学房',
    type: 'event',
    description: '在推喇奴学房辩论',
    text: '你们进推喇奴学房辩论，如此有两年之久。',
    effect: { disciples: 5, reputation: 10, stamina: -10 },
  },
  timothy_recruitment: {
    id: 'timothy_recruitment',
    name: '提摩太加入',
    type: 'event',
    description: '提摩太成为同工',
    text: '提摩太加入了团队，他是一个忠心的代笔者。',
    effect: { morale: 15, stability: 5 },
  },
  sceva_sons: {
    id: 'sceva_sons',
    name: '士基瓦的儿子们',
    type: 'decision',
    description: '有人擅自奉保罗所传的耶稣赶鬼',
    text: '有几个游方赶鬼的犹太人，擅自奉保罗所传的耶稣赶鬼，结果恶鬼反而制服了他们。',
    choices: [
      { label: '澄清真理', description: '向众人说明真道', effect: { faith: 10, stability: 10 } },
      { label: '保持沉默', description: '让事件自然平息', effect: { persecution: -5 } },
    ],
  } as DecisionEvent,
  burning_scrolls: {
    id: 'burning_scrolls',
    name: '焚烧邪术书卷',
    type: 'event',
    description: '信徒焚烧邪术书卷',
    text: '那已经信的人，多有来承认诉说自己所行的事，焚烧邪术书卷。',
    effect: { faith: 20, stability: 15, reputation: 10 },
  },
  silversmith_riot: {
    id: 'silversmith_riot',
    name: '银匠暴乱',
    type: 'event',
    description: '银匠底米丢聚集众人反对',
    text: '银匠底米丢聚集众人反对保罗，说保罗搅乱了以弗所全城。',
    effect: { stamina: -20, provision: -10 },
  },
};

const LETTER_EVENTS: GameEvent[] = [
  {
    id: 'letter_galatians',
    name: '加拉太书的启示',
    type: 'event',
    description: '你感受到圣灵的感动，要为加拉太的教会写一封信',
    text: '要为加拉太的教会写信，澄清因信称义的真理。',
    effect: { faith: 20, reputation: 10 },
  },
  {
    id: 'letter_philippians',
    name: '腓立比书的喜乐',
    type: 'event',
    description: '想念腓立比教会的同工们',
    text: '想写信鼓励他们无论在什么景况都要喜乐。',
    effect: { faith: 15, reputation: 8 },
  },
  {
    id: 'letter_ephesians',
    name: '以弗所书的奥秘',
    type: 'event',
    description: '神启示教会的奥秘',
    text: '神启示你教会的奥秘——外邦人在基督耶稣里，藉着福音，得以同为后嗣。',
    effect: { faith: 25, reputation: 12 },
  },
];

export {
  ANTIOCH_EVENTS,
  PHILIPPI_EVENTS,
  EPHESUS_EVENTS,
  LETTER_EVENTS,
};
