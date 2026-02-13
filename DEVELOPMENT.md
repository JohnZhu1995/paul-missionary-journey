# 保罗旅行布道 - 开发文档

**版本**: v2.0.0  
**类型**: 文字策略经营游戏原型  
**开发语言**: TypeScript  
**核心哲学**: 在既定历史轨道（结局固定）中，通过管理有限资源完成使命

**v2.0 新增系统**: 👥 同工团队协作 + ✉️ 书信跨越时空治理

---

## 目录

1. [项目概述](#一项目概述)
2. [v2.0 新系统概览](#二v20-新系统概览)
3. [架构设计](#三架构设计)
4. [核心数据结构](#四核心数据结构)
5. [游戏系统详解](#五游戏系统详解)
6. [事件系统设计](#六事件系统设计)
7. [评分系统](#七评分系统)
8. [扩展指南](#八扩展指南)
9. [API 参考](#九api-参考)

---

## 一、项目概述

### 1.1 游戏设计理念

**主题**: 系统化使命张力（Systematic Mission Tension）

**核心机制**:
- **资源管理**: 在有限资源下做忠心的管家
- **历史轨道**: 结局固定，玩家不是改变历史，而是在既定轨道上展现忠心的程度
- **张力体验**: 压力环境下的决策考验

**资源体系**:
| 资源 | 符号 | 初始值 | 说明 |
|------|------|--------|------|
| 体力 | Stamina | 100 | 执行行动的基础 |
| 物资 | Provision | 100 | 生存和行动消耗 |
| 教会健康 | Stability | 0 | 教会的成熟程度 |
| 逼迫指数 | Persecution | 0 | 外界敌对程度 |
| 名声 | Reputation | 0 | 影响事件触发 |
| 同工士气 | Morale | 50 | 团队状态 |

### 1.2 技术栈

```
- TypeScript 5.3+
- Node.js 18+
- tsx (TypeScript 执行器)
- Vitest (测试框架，可选)
```

### 1.3 项目结构（v2.0模块化重构）

**重构后文件组织**：

```
paul-missionary-journey/
├── src/                          # 源代码目录（可选）
│   ├── types.ts                  # 类型定义
│   ├── constants.ts              # 配置常量
│   ├── events.ts                 # 事件库
│   ├── companion.ts              # 同工系统
│   ├── letter.ts                 # 书信系统
│   ├── player.ts                 # 玩家类
│   ├── city.ts                   # 城市类
│   └── game-engine.ts            # 游戏引擎
├── main.ts                       # 主入口（简化版）
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript 配置
├── DEVELOPMENT.md                # 开发文档
├── README.md                     # 用户手册
└── main.ts.backup               # 原始备份文件
```

**模块化架构优势**：
- ✅ **单一职责**：每个文件负责一个独立系统
- ✅ **可维护性**：修改某个系统不会影响其他文件
- ✅ **可测试性**：可单独测试每个类
- ✅ **可扩展性**：新增功能只需添加新模块

**文件依赖关系**：
```
main.ts
├── types.ts (基础类型)
├── constants.ts (配置常量)
├── companion.ts → types.ts
├── letter.ts → types.ts, constants.ts
├── player.ts → types.ts, constants.ts
├── city.ts → types.ts, constants.ts
├── events.ts → types.ts
└── game-engine.ts → 所有上述模块
```

---

## 二、v2.0 新系统概览

### 2.1 同工系统：团队与效能管理 (The Companion Ensemble)

**核心理念**: 同工不再是静态背景，而是你的**"行动倍增器"**

#### 👥 同工招募（历史锚点）

| 同工 | 解锁城市 | 专长 | 特性效果 |
|------|----------|------|----------|
| **巴拿巴** | 安提阿（初始） | 【劝慰者】 | 提升探访效率和士气恢复速度 |
| **西拉** | 腓立比 | 【坚韧者】 | 降低逼迫带来的体力损耗，增强教导能力 |
| **提摩太** | 以弗所 | 【忠心代笔者】 | 协助撰写书信，体力消耗减半 |

#### 🎯 任务分配（槽位管理）

每个城市回合，玩家需要为同工分配任务：

| 任务类型 | 体力消耗 | 效果 | 适用场景 |
|----------|----------|------|----------|
| **教导** | -15 | 教会健康度+12 | 需要快速建立教会 |
| **探访** | -12 | 逼迫-8, 健康+3 | 逼迫过高时缓解压力 |
| **后勤** | -10 | 物资+20 | 物资匮乏时补充 |
| **协助写作** | -8 | 降低保罗写信消耗 | 需要写信给前城市 |
| **休息** | +15 | 恢复体力 | 同工业力不足时 |

#### 📊 士气与效率公式

```typescript
if (morale >= 70): 效率 = 120%  // 高士气：超额完成任务
if (morale >= 40): 效率 = 100%  // 正常：标准效果
if (morale >= 20): 效率 = 70%   // 低士气：效果打折
if (morale < 20):  拒绝工作    // 士气崩溃：触发分歧事件
```

**士气影响因素**:
- 物资充足 → 士气上升
- 长期高压 → 士气下降
- 历史性争执（如保罗与巴拿巴争论马可）→ 士气大幅下降

### 2.2 书信系统：跨越时空的治理 (The Epistle Legacy)

**核心理念**: 书信是连接"已过城市"和"未来结局"的桥梁

#### ✉️ 触发时机

1. **被动触发**: 当之前城市的健康度跌破临界点，收到急信
2. **主动选择**: 在休息回合选择"撰写书信"

#### 📝 书信效果

| 书信类型 | 体力消耗 | 效果 | 后续影响 |
|----------|----------|------|----------|
| **神学论证** | -25 | 教会健康度+15 | 大幅改善目标城市，但消耗极大 |
| **生活问安** | -15 | 同工士气+10, 健康+5 | 温和提升，维持团队稳定 |

#### 🏆 收集要素（The Canon）

**新约书信架**:
- 每写成一封书信（如《腓立比书》），图标亮起
- 收集完整书信集可解锁**【至死忠心】评价的隐藏加成**
- 书信对最终评分的贡献最高+15分

**可收集书信**:
```
✓ 安提阿书    ○ 加拉太书    ○ 腓立比书
○ 哥林多前书  ○ 哥林多后书  ○ 以弗所书
○ 歌罗西书    ○ 帖撒罗尼迦前书  ○ 帖撒罗尼迦后书
○ 提摩太前书  ○ 提摩太后书  ○ 提多书
○ 腓利门书
```

### 2.3 系统整合示例

**场景**: 你在以弗所感到压力巨大

**策略组合**:
```
👤 保罗: 推喇奴学房教导（高消耗高收益）
👥 西拉: 后勤（保证物资供应）
👥 提摩太: 协助写作（写信给腓立比）
```

**效果**:
- 福音传遍亚细亚（教会健康度大幅提升）
- 物资不断补充（维持生存）
- 写信体力消耗减半（提摩太代笔加成）
- 书信完成后腓立比教会稳固（后续评分加成）

### 2.4 游戏平衡调整（v2.0）

为适应新系统复杂性，调整了以下参数：

| 城市 | 回合数(v1.0) | 回合数(v2.0) | 调整原因 |
|------|-------------|-------------|----------|
| 安提阿 | 3 | 4 | 引入同工系统，需要更多决策回合 |
| 腓立比 | 3 | 5 | 增加西拉招募和磨合时间 |
| 以弗所 | 3 | 6 | 推喇奴学房模式+书信撰写需要更长期经营 |

---

## 三、架构设计

### 3.1 类图（v2.0更新版）

```
┌─────────────────────────────────────────────┐
│              GameEngine                     │
├─────────────────────────────────────────────┤
│ - player: Player                            │
│ - cities: City[]                            │
│ - currentCity: City                         │
│ - companions: Companion[]          [v2.0新增]│
│ - letterSystem: LetterSystem       [v2.0新增]│
│ - gameOver: boolean                         │
│ - victory: boolean                          │
│ - eventHistory: string[]                    │
│ - tyrannusMode: boolean                     │
│ - 评分追踪数据                               │
├─────────────────────────────────────────────┤
│ + handleAction(action, companionActions)    │
│ + triggerEvent()                            │
│ + recruitCompanionForCity()        [v2.0]   │
│ + calculateFinalScore()                     │
│ + displayEvaluation()                       │
└──────────┬────────────────┬─────────────────┘
           │                │
     ┌─────┴─────┐   ┌─────┴──────┐
     ▼           ▼   ▼            ▼
┌────────┐  ┌────────┐  ┌─────────────┐  ┌─────────────┐
│ Player │  │ City   │  │ Companion   │  │LetterSystem │
└────────┘  └────────┘  │  [v2.0新增] │  │  [v2.0新增] │
                        └─────────────┘  └─────────────┘
```

**v2.0 架构变化**:
- 新增 `Companion` 类管理同工团队
- 新增 `LetterSystem` 类管理书信收集和效果
- `GameEngine.handleAction()` 现在接受 `companionActions` 参数
- 新增 `recruitCompanionForCity()` 方法处理同工招募

### 3.2 数据流向（v2.0更新版）

```
回合开始
    ↓
显示同工状态 ← Companion.getStatus()
    ↓
玩家分配同工任务 → companionActions: Map<companionId, taskType>
    ↓
玩家选择保罗行动 → handleAction(action, companionActions)
    ↓
并行处理:
    ├── 保罗行动效果 → Player.applyChange()
    ├── 同工任务效果 → Companion.assignTask() → Player.applyChange()
    └── 忠心点数计算（高压下传福音加分）
    ↓
回合推进 → City.nextRound()
    ↓
回合结算 → endOfRoundSettlement()
    ├── 逼迫增长
    ├── 特殊机制（推喇奴学房-10体力）[以弗所]
    └── 同工体力恢复 → Companion.recoverStamina()
    ↓
检查事件触发 → triggerEvent()
    ├── 历史性事件
    ├── 同工招募事件        [v2.0]
    ├── 同工争执事件        [v2.0]
    └── 书信触发事件        [v2.0]
    ↓
检查游戏结束条件
    ↓
是 → 最终评分 calculateFinalScore()
    ├── 教会成熟度 (35%)
    ├── 使命韧性 (15%)
    ├── 资源管家 (15%)
    ├── 忠心指数 (20%)
    └── 书信贡献 (+15)      [v2.0]
    ↓
显示评分面板 + 书信收集状态   [v2.0]
```

---

## 三、核心数据结构

### 3.1 类型定义

```typescript
// 资源变化类型
type ResourceChange = {
  stamina?: number;
  provision?: number;
  stability?: number;
  persecution?: number;
  reputation?: number;
  morale?: number;
};

// 行动类型（v2.0新增 write_letter）
type ActionType = 'preach' | 'tentmaking' | 'disciple' | 'rest' | 'write_letter';

// v2.0新增：同工任务类型
type CompanionTaskType = 'teaching' | 'visitation' | 'logistics' | 'assist_writing' | 'rest';

// v2.0新增：同工专长类型
type SpecialtyType = 'counselor' | 'resilient' | 'scribe' | 'none';

// 事件类型（v2.0新增 'companion' | 'letter'）
interface GameEvent {
  id: string;
  name: string;
  description: string;
  text: string;
  effect: ResourceChange;
  type: 'historical' | 'negative' | 'positive' | 'decision' | 'companion' | 'letter';
}

// v2.0新增：书信效果接口
interface LetterEffect {
  targetCity: string;
  stabilityBoost: number;
  moraleBoost: number;
  staminaCost: number;
  requiresCompanion: boolean;
}

interface DecisionEvent extends GameEvent {
  type: 'decision';
  choices: {
    label: string;
    description: string;
    effect: ResourceChange;
  }[];
}
```

### 3.2 Player 类

**职责**: 维护玩家所有资源状态

```typescript
class Player {
  stamina: number;      // 体力 (0-100)
  provision: number;    // 物资 (0-150)
  stability: number;    // 教会健康度 (0-100)
  persecution: number;  // 逼迫指数 (0-100)
  reputation: number;   // 名声 (0-100)
  morale: number;       // 同工士气 (0-100)

  constructor() {
    // 初始化所有资源
    this.stamina = 100;
    this.provision = 100;
    this.stability = 0;
    this.persecution = 0;
    this.reputation = 0;
    this.morale = 50;
  }

  // 应用资源变化
  applyChange(change: ResourceChange): void {
    if (change.stamina !== undefined) this.stamina += change.stamina;
    // ... 其他资源
    this.clampResources(); // 确保在边界内
  }

  // 检查资源边界
  clampResources(): void {
    this.stamina = Math.max(0, Math.min(100, this.stamina));
    // ... 其他资源
  }

  // 检查生存状态
  isAlive(): boolean {
    return this.stamina > 0 && this.provision > 0;
  }
}

### 3.3 Companion 类 [v2.0新增]

**职责**: 管理同工状态和任务分配

```typescript
class Companion {
  id: string;                    // 唯一标识
  name: string;                  // 英文名
  nameChinese: string;           // 中文名
  stamina: number;               // 体力 (0-80)
  maxStamina: number;            // 最大体力
  morale: number;                // 士气 (0-100)
  specialty: SpecialtyType;      // 专长类型
  specialtyName: string;         // 专长名称（显示用）
  specialtyDescription: string;  // 专长描述
  isActive: boolean;             // 是否活跃
  currentTask: CompanionTaskType | null; // 当前任务

  constructor(id, name, nameChinese, specialty, specialtyName, specialtyDescription) {
    this.id = id;
    this.name = name;
    this.nameChinese = nameChinese;
    this.stamina = 80;
    this.maxStamina = 80;
    this.morale = 60;
    this.specialty = specialty;
    this.specialtyName = specialtyName;
    this.specialtyDescription = specialtyDescription;
    this.isActive = true;
    this.currentTask = null;
  }

  // 应用专长加成
  applySpecialtyEffect(taskType: CompanionTaskType): ResourceChange {
    const bonus: ResourceChange = {};
    switch (this.specialty) {
      case 'counselor': // 巴拿巴
        if (taskType === 'visitation') {
          bonus.stability = 5;
          bonus.morale = 3;
        }
        break;
      case 'resilient': // 西拉
        if (taskType === 'teaching') {
          bonus.stability = 8;
        }
        break;
      case 'scribe': // 提摩太
        // 效果在写信时计算
        break;
    }
    return bonus;
  }

  // 计算效率（基于士气）
  getEfficiency(): number {
    if (this.morale >= 70) return 1.2;  // 120%
    if (this.morale >= 40) return 1.0;  // 100%
    if (this.morale >= 20) return 0.7;  // 70%
    return 0.0; // 拒绝工作
  }

  // 分配任务（核心方法）
  assignTask(taskType: CompanionTaskType): { 
    success: boolean; 
    message: string; 
    effect: ResourceChange 
  } {
    // 1. 检查士气（<20拒绝工作）
    // 2. 检查体力
    // 3. 计算效率加成
    // 4. 应用专长加成
    // 5. 返回效果和消息
  }

  // 每回合恢复体力
  recoverStamina(): void {
    const baseRecovery = 10;
    const moraleBonus = this.morale >= 60 ? 5 : 0;
    this.stamina = Math.min(this.maxStamina, 
      this.stamina + baseRecovery + moraleBonus);
  }
}
```

### 3.4 LetterSystem 类 [v2.0新增]

**职责**: 管理书信撰写、收集和跨城市影响

```typescript
class LetterSystem {
  // 新约书信收集状态
  epistleCollection: Map<string, { 
    written: boolean; 
    targetCity: string; 
    effect: LetterEffect 
  }>;
  
  // 书信对已访问城市的影响
  cityLetterEffects: Map<string, { 
    stabilityBoost: number; 
    moraleBoost: number; 
    letterId: string 
  }[]>;
  
  // 书信对最终评分的贡献
  letterScore: number;

  constructor() {
    this.epistleCollection = new Map();
    this.cityLetterEffects = new Map();
    this.letterScore = 0;
    this.initializeEpistles();
  }

  // 初始化可收集的书信（12封）
  private initializeEpistles(): void {
    const epistles = [
      { id: 'Galatians', name: '加拉太书', targetCity: 'Galatia' },
      { id: 'Philippians', name: '腓立比书', targetCity: 'Philippi' },
      { id: 'Corinthians1', name: '哥林多前书', targetCity: 'Corinth' },
      { id: 'Ephesians', name: '以弗所书', targetCity: 'Ephesus' },
      // ... 共12封
    ];
    // 初始化每封书信的状态
  }

  // 检查是否可以写信给某城市
  canWriteLetter(targetCity: string, currentCity: string): {
    canWrite: boolean;
    availableEpistles: string[];
  }

  // 撰写书信（核心方法）
  writeLetter(epistleId: string, hasScribeCompanion: boolean): {
    success: boolean;
    message: string;
    effect: ResourceChange;
  } {
    // 1. 检查书信是否可写
    // 2. 计算体力消耗（有代笔者减半）
    // 3. 标记为已写
    // 4. 增加最终评分（+500分）
    // 5. 存储对目标城市的影响
  }

  // 获取收集状态（用于UI显示）
  getCollectionStatus(): string {
    // 返回：📚 新约书信收集: 3/12
    //       ✓ Galatians  ✓ Philippians  ○ Ephesians ...
  }

  // 应用书信效果到城市（当回到该城市或结算时）
  applyLetterEffectsToCity(cityName: string): ResourceChange

  // 检查是否收集完整（隐藏结局条件）
  isCompleteCollection(): boolean
}

### 3.5 City 类

**职责**: 管理城市状态和回合流转

```typescript
class City {
  name: string;              // 英文名
  nameChinese: string;       // 中文名
  description: string;       // 描述
  basePersecutionRate: number; // 基础逼迫增长率
  maxRounds: number;         // 最大回合数（v2.0调整：安提阿4、腓立比5、以弗所6）
  currentRound: number;      // 当前回合

  hasMoreRounds(): boolean {
    return this.currentRound < this.maxRounds;
  }

  nextRound(): void {
    this.currentRound++;
  }
}
```

### 3.6 GameEngine 类 [v2.0大幅更新]

**职责**: 游戏主控制器，协调所有子系统

**核心属性**:
```typescript
class GameEngine {
  // 基础系统
  player: Player;
  cities: City[];
  currentCityIndex: number;
  currentCity: City;
  gameOver: boolean;
  victory: boolean;
  eventHistory: string[];     // 已触发事件记录
  tyrannusMode: boolean;      // 以弗所特殊模式
  
  // v2.0新增：同工系统
  companions: Companion[];              // 同工团队
  companionLimit: number;               // 同工人数上限（默认2人）
  
  // v2.0新增：书信系统
  letterSystem: LetterSystem;           // 书信管理
  
  // 评分追踪数据
  totalFaithfulnessPoints: number;      // 忠心点数
  cityStabilityRecords: Map<string, number>; // 城市稳定性记录
  totalPersecutionReceived: number;     // 累计逼迫
  totalStabilityLost: number;           // 累计健康损失
  
  // v2.0核心方法
  handleAction(actionType: ActionType, companionActions?: Map<string, CompanionTaskType>): string;
  recruitCompanionForCity(): void;      // 根据城市招募同工
  addCompanion(companion: Companion): boolean;
  getActiveCompanions(): Companion[];
  hasScribeCompanion(): boolean;        // 检查是否有代笔者
}
```

---

## 四、游戏系统详解

### 4.1 行动系统 (Action Mapping)

**五种基础行动（v2.0新增撰写书信）**:

| 行动 | 体力 | 物资 | 教会健康 | 逼迫 | 描述 |
|------|------|------|----------|------|------|
| 公开讲道 | -20 | 0 | +15 | +20 | 高风险高收益，建立教会 |
| 织帐棚 | -15 | +30 | -2 | 0 | 赚取物资，维持生存 |
| 私下门训 | -10 | 0 | +5 | +2 | 低风险低收益，稳健发展 |
| 休息 | +20 | -10 | 0 | 0 | 恢复体力，消耗物资 |
| **撰写书信** | **-25** | **0** | **0** | **0** | **写信给之前的城市，跨越时空治理** |

**代码实现**:
```typescript
const ACTIONS: Record<ActionType, Action> = {
  preach: {
    name: '公开讲道',
    description: '在会堂或广场上宣讲福音',
    effect: { stamina: -20, stability: 15, persecution: 20 },
  },
  tentmaking: {
    name: '织帐棚',
    description: '通过手艺赚取生活所需',
    effect: { stamina: -15, provision: 30, stability: -2 },
  },
  disciple: {
    name: '私下门训',
    description: '在信徒家中一对一教导',
    effect: { stamina: -10, stability: 5, persecution: 2 },
  },
  rest: {
    name: '休息',
    description: '恢复体力，但消耗物资',
    effect: { stamina: 20, provision: -10 },
  },
  write_letter: {  // v2.0新增
    name: '撰写书信',
    description: '写信给之前的教会，给予教导和劝勉',
    effect: { stamina: -25 },  // 基础消耗，有代笔者减半
  },
};
```

**行动处理流程（v2.0更新版）**:
```typescript
handleAction(
  actionType: ActionType, 
  companionActions?: Map<string, CompanionTaskType>  // v2.0新增
): string {
  // 1. 检查资源是否足够
  if (!this.canPerformAction(action)) {
    return '资源不足';
  }

  // 2. 记录忠心点数（高压下的公开讲道）
  if (actionType === 'preach' && this.player.persecution > 70) {
    this.totalFaithfulnessPoints += 10;
  }

  // 3. v2.0新增：处理同工任务
  if (companionActions) {
    for (const [companionId, taskType] of companionActions) {
      const companion = this.companions.find(c => c.id === companionId);
      if (companion) {
        const result = companion.assignTask(taskType);
        if (result.success) {
          this.player.applyChange(result.effect);  // 应用同工任务效果
        }
      }
    }
  }

  // 4. 应用保罗的行动效果
  this.player.applyChange(action.effect);
  
  // 5. 推进回合
  this.currentCity.nextRound();
  
  // 6. 回合结束结算
  this.endOfRoundSettlement();
  
  // 7. v2.0新增：恢复同工体力
  this.companions.forEach(c => c.recoverStamina());
  
  return result;
}
```

### 4.2 回合结算系统（v2.0更新版）

**每回合自动触发**:
1. **城市逼迫增长**: 根据城市特性自动增加逼迫指数
2. **特殊机制**（以弗所）: 推喇奴学房模式下额外-10体力
3. **v2.0新增：同工士气衰减** - 物资匮乏或高压环境会降低同工士气
4. **危机事件检查**:
   - 逼迫 > 70: 触发暴动事件（体力-15, 教会健康-10）
   - 教会健康 < 30: 触发分裂风险（教会健康-5）
   - 士气 < 20: 触发同工分歧事件

```typescript
private endOfRoundSettlement(): void {
  // 累计逼迫值追踪
  this.totalPersecutionReceived += this.currentCity.basePersecutionRate;
  
  // 城市固有逼迫增长
  this.player.applyChange({
    persecution: this.currentCity.basePersecutionRate,
  });
  
  // 以弗所特殊机制（推喇奴学房）
  if (this.currentCity.name === 'Ephesus' && this.tyrannusMode) {
    this.player.applyChange({ stamina: -10 });
    console.log('\n📚 【推喇奴学房】每日的辩论与教导消耗了你的体力（-10）');
  }
  
  // v2.0新增：同工士气影响
  this.companions.forEach(companion => {
    if (this.player.provision < 30) {
      companion.morale -= 5;  // 物资匮乏降低士气
    }
    if (this.player.persecution > 60) {
      companion.morale -= 3;  // 高压环境降低士气
    }
    companion.morale = Math.max(0, companion.morale);
  });

  this.checkCrisisEvents();
}
```

### 4.3 城市流转逻辑（v2.0调整）

**三城路线（回合数增加以容纳新系统）**:

| 城市 | v1.0回合 | v2.0回合 | 逼迫增长率 | 调整原因 |
|------|---------|---------|-----------|---------|
| **安提阿** | 3 | **4** | 3 | 同工系统引入，需要磨合时间 |
| **腓立比** | 3 | **5** | 5 | 招募西拉+监禁事件链+深夜赞美 |
| **以弗所** | 3 | **6** | 8 | 推喇奴学房模式+书信撰写+银龛匠骚乱 |

**城市切换时自动招募同工**:

```typescript
private moveToNextCity(): void {
  // 记录当前城市数据用于评分
  this.cityStabilityRecords.set(
    this.currentCity.name, 
    this.player.stability
  );
  
  this.currentCityIndex++;
  
  if (this.currentCityIndex >= this.cities.length) {
    this.gameOver = true;
    this.victory = true;
  } else {
    this.currentCity = this.cities[this.currentCityIndex];
    
    // v2.0新增：根据城市招募新同工
    this.recruitCompanionForCity();
  }
}

// v2.0新增：城市特定同工招募
private recruitCompanionForCity(): void {
  // 腓立比招募西拉
  if (this.currentCity.name === 'Philippi' && 
      !this.companions.some(c => c.id === 'sila')) {
    const sila = new Companion(
      'sila',
      'Sila',
      '西拉',
      'resilient',
      '坚韧者',
      '降低逼迫带来的体力损耗，增强教导能力'
    );
    if (this.addCompanion(sila)) {
      console.log(`\n👥 【同工加入】${sila.nameChinese}加入了团队！`);
      console.log(`   特性：${sila.specialtyName} - ${sila.specialtyDescription}`);
    }
  }
  
  // 以弗所招募提摩太
  if (this.currentCity.name === 'Ephesus' && 
      !this.companions.some(c => c.id === 'timothy')) {
    const timothy = new Companion(
      'timothy',
      'Timothy',
      '提摩太',
      'scribe',
      '忠心代笔者',
      '协助撰写书信，体力消耗减半'
    );
    if (this.addCompanion(timothy)) {
      console.log(`\n👥 【同工加入】${timothy.nameChinese}加入了团队！`);
      console.log(`   特性：${timothy.specialtyName} - ${timothy.specialtyDescription}`);
    }
  }
}
```

---

## 五、事件系统设计

### 5.1 事件架构

**事件库结构**:
```typescript
const CITY_EVENTS: Record<string, GameEvent | DecisionEvent> = {
  'event_id': {
    id: 'event_id',
    name: '事件名称',
    description: '事件描述',
    type: 'historical' | 'negative' | 'positive' | 'decision',
    text: '事件文案',
    effect: { ... },  // 资源变化
    choices?: [...]   // 决策事件特有
  }
};
```

**事件触发器**:
```typescript
triggerEvent(): { event, message } {
  // 根据当前城市和回合检查触发条件
  // 返回事件对象和显示消息
}
```

### 5.2 安提阿事件库

**历史性事件**:
```typescript
'christian_name': {
  name: '信徒的称呼',
  type: 'historical',
  text: '在安提阿，门徒被称为"基督徒"是从这时候开始的...',
  effect: { stability: 10, reputation: 5, persecution: 5 },
  // 触发条件: 第2回合自动触发
}
```

**随机事件**:
```typescript
// 负面事件：会堂辩论
'synagogue_dispute': {
  type: 'negative',
  effect: { stamina: -15, persecution: 10, stability: -5 },
  // 触发条件: 逼迫>40时30%概率
}

// 正面事件：巴拿巴慷慨
'barnabas_encouragement': {
  type: 'positive', 
  effect: { provision: 40, morale: 15, stamina: 5 },
  // 触发条件: 物资<30时40%概率
}
```

**决策事件**:
```typescript
'gentile_inquiry': {
  type: 'decision',
  text: '一群外邦人渴望听福音，但你已精疲力竭...',
  choices: [
    {
      label: 'A. 竭力教导',
      effect: { stability: 15, stamina: -20, persecution: 10 }
    },
    {
      label: 'B. 保守应对', 
      effect: { stamina: 5, persecution: -5, stability: -5 }
    }
  ]
}
```

### 5.3 腓立比事件流

**强剧情转折设计**: "从丰盛到患难，再到神迹"

| 回合 | 事件 | 类型 | 效果 |
|------|------|------|------|
| 第1回合 | 吕底亚接待 | 自动 | 物资+30, 体力+10, 教会健康+5 |
| 第2回合 | 被囚的使女 | 决策(80%) | A: 教会健康+15, 逼迫+40<br>B: 体力-10, 教会健康-10, 逼迫+5 |
| 第3回合 | 棍打与监禁 | 强制 | **阶梯计算**:<br>• 逼迫>60: 体力-50, 教会健康-15<br>• 逼迫≤60: 体力-30, 教会健康-5<br>逼迫清零 |
| 监禁后 | 深夜的赞美 | 自动衔接 | 教会健康+20, 名声+15, 士气+20<br>→ 自动离开城市 |

**特殊实现**:
```typescript
private triggerPhilippiPrisonEvent(): { event, message } {
  // 阶梯计算伤害
  if (this.player.persecution > 60) {
    staminaLoss = -50;
    stabilityLoss = -15;
  } else {
    staminaLoss = -30;
    stabilityLoss = -5;
  }
  
  // 应用效果并触发深夜赞美
  this.player.applyChange({ persecution: -100 }); // 清零
  // ...
}

triggerMidnightPraise(): { event, message } {
  // 应用逆转效果
  // 自动调用 autoCompleteCity() 离开
}
```

### 5.4 以弗所事件流

**长期经营 + 文化冲突爆发**

| 回合/条件 | 事件 | 类型 | 效果 |
|-----------|------|------|------|
| 第1回合 | 推喇奴学房 | 自动 | 教会健康+20, 名声+15<br>**开启持续消耗模式** |
| 随机 | 士基瓦七子 | 决策(25%) | A: 体力-10, 教会健康+15, 逼迫+5<br>B: 体力+5, 名声-5 |
| 健康>50 | 焚烧邪术书 | 条件 | 物资-20, 教会健康+25, 逼迫+30 |
| 第3回合 | 银龛匠骚乱 | 强制 | **资源清算**:<br>• 逼迫>80: 体力-40, 物资-30<br>• 逼迫≤80: 体力-20, 物资-10<br>→ 自动离开 |

**持续消耗机制**:
```typescript
// 标记推喇奴学房模式
this.tyrannusMode = true;

// 每回合结算时额外消耗
private endOfRoundSettlement(): void {
  if (this.currentCity.name === 'Ephesus' && this.tyrannusMode) {
    this.player.applyChange({ stamina: -10 });
    console.log('📚 【推喇奴学房】每日的辩论与教导消耗了你的体力（-10）');
  }
}
```

---

## 六、评分系统

### 6.1 使命忠心度评估算法

**设计理念**: 平衡"成果"与"过程"，多维度评估管家忠心程度

**四维评分体系**:

| 维度 | 权重 | 计算逻辑 | 含义 |
|------|------|----------|------|
| 教会成熟度 | 40% | 所有城市 `stability` 平均值 | 宣教行动的最终果子 |
| 使命韧性 | 20% | `(总逼迫 / 健康下降比)` | 逆境中维持稳定能力 |
| 资源管家指数 | 15% | `(剩余体力+物资) / 初始总量` | 资源管理效率 |
| 忠心指数 | 25% | 基础50分 + 高压决策加分 | 逼迫>70时公开讲道 |

### 6.2 计算公式

```typescript
calculateFinalScore(): {
  // 1. 教会成熟度 (40%)
  const totalStability = sum(all city stability values);
  const churchMaturity = totalStability / cityCount;
  
  // 2. 使命韧性 (20%)
  let resilience = 100;
  if (totalStabilityLost > 0) {
    resilience = max(0, 100 - (totalStabilityLost / totalPersecutionReceived) * 100);
  }
  
  // 3. 资源管家指数 (15%)
  const staminaRatio = stamina / 100;
  const provisionRatio = provision / 150;
  const stewardship = ((staminaRatio + provisionRatio) / 2) * 100;
  
  // 4. 忠心指数 (25%)
  const faithfulness = min(100, 50 + totalFaithfulnessPoints);
  
  // 加权总分
  const totalScore = 
    (churchMaturity * 0.40) +
    (resilience * 0.20) +
    (stewardship * 0.15) +
    (faithfulness * 0.25);
}
```

### 6.3 结局评价体系

**评分等级**:

| 分数 | 评价等级 | 文案描述 |
|------|----------|----------|
| 90-100 | 【至死忠心的使徒】 | "你到达了罗马，身上带着基督的印记。建立的教会稳固如磐石，同工们视你为榜样。你打过了那美好的仗。" |
| 70-89 | 【劳苦的福音先锋】 | "尽管路途艰辛，身体衰弱，但你成功地在关键城市扎下了真理的根。书信成为了你留给后世最宝贵的财富。" |
| 40-69 | 【疲惫的守望者】 | "你到达了罗马，但心中充满了忧虑。部分城市的教会因缺乏教导而动摇。你尽力了，但资源匮乏让你步履维艰。" |
| 0-39 | 【被围困的独行者】 | "你几乎是孤身一人到达罗马。虽然完成了旅程，但身后的教会网络支离破碎。这趟旅程对你而言是一场惨烈的生还。" |

### 6.4 追踪数据实现

```typescript
class GameEngine {
  // 评分追踪数据
  totalFaithfulnessPoints: number;      // 忠心点数
  cityStabilityRecords: Map<string, number>;  // 城市稳定性记录
  totalPersecutionReceived: number;     // 累计逼迫值
  totalStabilityLost: number;           // 累计健康损失

  handleAction(actionType: ActionType): void {
    // 记录忠心点数：高压下的公开讲道
    if (actionType === 'preach' && this.player.persecution > 70) {
      this.totalFaithfulnessPoints += 10;
    }
    
    // 追踪教会健康度变化
    const prevStability = this.player.stability;
    this.player.applyChange(action.effect);
    const stabilityLoss = prevStability - this.player.stability;
    if (stabilityLoss > 0) {
      this.totalStabilityLost += stabilityLoss;
    }
  }
}
```

---

## 七、扩展指南

### 7.1 添加新城市

**步骤**:
1. 在 `cities` 数组中添加新城市实例
2. 创建对应的事件库（参考 `ANTIOCH_EVENTS`）
3. 在 `triggerEvent()` 中添加该城市的事件流逻辑

**示例**:
```typescript
// 1. 创建城市
new City('Corinth', '哥林多', '亚该亚的哥林多，商贸繁荣的希腊城市。', 6, 3),

// 2. 创建事件库
const CORINTH_EVENTS: Record<string, GameEvent | DecisionEvent> = {
  // 添加事件...
};

// 3. 在 triggerEvent() 中添加
if (this.currentCity.name === 'Corinth') {
  // 触发逻辑...
}
```

### 7.2 添加新事件

**模板**:
```typescript
'event_id': {
  id: 'event_id',
  name: '事件名称',
  description: '简短描述',
  type: 'historical', // 或 'negative' | 'positive' | 'decision'
  text: '事件文案描述...',
  effect: {
    stamina: ±n,
    provision: ±n,
    stability: ±n,
    persecution: ±n,
    // ...
  },
  // 如果是决策事件
  choices: [
    {
      label: 'A. 选项A',
      description: '选项描述',
      effect: { ... }
    },
    {
      label: 'B. 选项B',
      description: '选项描述', 
      effect: { ... }
    }
  ]
}
```

### 7.3 添加新行动

**步骤**:
1. 扩展 `ActionType` 类型
2. 在 `ACTIONS` 对象中添加新行动
3. 在 `handleAction()` 中添加特殊逻辑（如需要）

### 7.4 扩展评分维度

**示例**: 添加"同工网络"维度
```typescript
// 1. 添加追踪数据
activeCoworkers: number;
coworkerEfficiency: number;

// 2. 在 calculateFinalScore() 中添加计算
const coworkerScore = (this.activeCoworkers * this.coworkerEfficiency) * 0.10;

// 3. 调整权重
const totalScore = 
  (churchMaturity * 0.35) +      // 调整为35%
  (resilience * 0.15) +          // 调整为15%
  (stewardship * 0.15) +
  (faithfulness * 0.25) +
  (coworkerScore);               // 新增10%
```

### 7.5 未来扩展计划

**同工系统**:
- 招募巴拿巴、西拉等同工
- 分配任务（教导、探访、后勤）
- 同工士气和效率管理

**书信系统**:
- 在特定时机写书信给各地教会
- 书信内容影响后续事件
- 收集完整的新约书信

**神迹事件**:
- 医治病人
- 逃脱监狱
- 地震等超自然干预

**更复杂的危机**:
- 不同城市有不同挑战类型
- 连锁事件系统
- 长期后果追踪

---

## 八、API 参考

### 8.1 GameEngine 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `handleAction(actionType)` | `ActionType` | `string` | 处理玩家行动 |
| `triggerEvent()` | - | `{event, message}` | 触发当前可用事件 |
| `handleDecision(eventId, choiceIndex)` | `string, number` | `string` | 处理决策事件选择 |
| `calculateFinalScore()` | - | `ScoreResult` | 计算最终评分 |
| `displayEvaluation()` | - | `string` | 生成评分面板显示 |
| `getGameState()` | - | `string` | 获取当前游戏状态 |

### 8.2 配置常量

```typescript
// 初始资源
INITIAL_RESOURCES = {
  stamina: 100,
  provision: 100,
  stability: 0,
  persecution: 0,
  reputation: 0,
  morale: 50,
};

// 城市配置
CITIES = [
  { name: 'Antioch', basePersecutionRate: 3, maxRounds: 3 },
  { name: 'Philippi', basePersecutionRate: 5, maxRounds: 3 },
  { name: 'Ephesus', basePersecutionRate: 8, maxRounds: 3 },
];
```

### 8.3 事件触发条件汇总

**安提阿**:
- 第2回合: 信徒的称呼（自动）
- 逼迫>40: 会堂辩论（30%概率）
- 物资<30: 巴拿巴慷慨（40%概率）
- 随机: 外邦人呼求（10%概率）

**腓立比**:
- 第1回合: 吕底亚接待（自动）
- 第2回合: 被囚的使女（80%概率）
- 第3回合: 棍打与监禁（强制）
- 监禁后: 深夜的赞美（自动衔接）

**以弗所**:
- 第1回合: 推喇奴学房（自动，开启持续消耗）
- 随机: 士基瓦七子（25%概率）
- 健康>50: 焚烧邪术书（条件）
- 第3回合: 银龛匠骚乱（强制，资源清算）

---

## 附录

### A. 运行游戏

```bash
# 安装依赖
npm install

# 手动游玩
npm start

# 演示模式（AI自动游玩）
npm start -- --demo
```

### B. 游戏控制

**输入指令**:
- `1` - 公开讲道
- `2` - 织帐棚
- `3` - 私下门训
- `4` - 休息
- `q` - 退出游戏

**决策事件**: 输入 `1` 或 `2` 选择对应选项

### C. 开发团队笔记

**设计原则**:
1. **历史忠实性**: 事件基于使徒行传记载
2. **策略深度**: 资源管理 + 风险评估
3. **情感共鸣**: 通过文案营造历史氛围
4. **可扩展性**: 模块化事件系统

**注意事项**:
- 所有数值变化需在 `clampResources()` 限制范围内
- 事件触发需检查 `eventHistory` 避免重复
- 决策事件需在 `handleDecision()` 中支持所有事件库
- 城市切换时记录数据用于最终评分

---

## 九、代码架构与模块化

### 9.1 模块化重构说明

**重构时间**: v2.0  
**原始文件**: `main.ts` (约 1900+ 行)  
**重构方式**: 拆分为 9 个独立模块

### 9.2 文件职责详解

| 文件 | 职责 | 导出内容 | 依赖 |
|------|------|----------|------|
| **types.ts** | 定义所有 TypeScript 类型和接口 | `ResourceChange`, `ActionType`, `CompanionTaskType`, `SpecialtyType`, `Action`, `LetterEffect`, `GameEvent`, `DecisionEvent` | 无 |
| **constants.ts** | 游戏配置常量 | `INITIAL_RESOURCES`, `CITY_CONFIG`, `ACTIONS`, `COMPANION_TASKS` | types.ts |
| **events.ts** | 城市事件库 | `ANTIOCH_EVENTS`, `PHILIPPI_EVENTS`, `EPHESUS_EVENTS`, `LETTER_EVENTS` | types.ts |
| **companion.ts** | 同工系统 | `Companion` 类 | types.ts, constants.ts |
| **letter.ts** | 书信系统 | `LetterSystem` 类 | types.ts, constants.ts |
| **player.ts** | 玩家类 | `Player` 类 | types.ts, constants.ts |
| **city.ts** | 城市类 | `City` 类 | types.ts, constants.ts |
| **game-engine.ts** | 游戏核心引擎 | `GameEngine` 类 | 所有上述模块 |
| **main.ts** | 程序入口 | `main()` 函数, 演示模式, 交互模式 | game-engine.ts |

### 9.3 模块导入示例

```typescript
// main.ts 中的导入
import { ResourceChange, ActionType, GameEvent } from './types';
import { INITIAL_RESOURCES, ACTIONS } from './constants';
import { ANTIOCH_EVENTS, PHILIPPI_EVENTS } from './events';
import { Companion } from './companion';
import { LetterSystem } from './letter';
import { Player } from './player';
import { City } from './city';
import { GameEngine } from './game-engine';
```

### 9.4 重构优势

**可维护性**:
- 每个文件 100-500 行，易于阅读和理解
- 修改某个系统不会影响其他文件
- 使用 ES Module 导出/导入，代码更清晰

**可测试性**:
```typescript
// 可以单独测试每个类
import { Companion } from './companion';
const barnabas = new Companion('barnabas', 'Barnabas', '巴拿巴', ...);
const result = barnabas.assignTask('teach');
// 测试 result.success, result.effect 等
```

**可扩展性**:
- 添加新城市 → 修改 `events.ts` 和 `game-engine.ts`
- 添加新同工 → 修改 `companion.ts`
- 添加新事件 → 修改对应城市的事件库

### 9.5 向后兼容性

在 `main.ts` 中重新导出所有类型，保持向后兼容：

```typescript
// main.ts
export {
  // 类型
  ResourceChange, ActionType, CompanionTaskType,
  GameEvent, DecisionEvent, LetterEffect,
  // 常量
  INITIAL_RESOURCES, CITY_CONFIG, ACTIONS, COMPANION_TASKS,
  // 事件
  ANTIOCH_EVENTS, PHILIPPI_EVENTS, EPHESUS_EVENTS, LETTER_EVENTS,
  // 类
  Companion, LetterSystem, Player, City, GameEngine,
};
```

### 9.6 重构检查清单

**重构前**:
- [x] 备份原文件 (`main.ts.backup`)
- [x] 分析代码结构，确定拆分方案
- [x] 识别依赖关系

**重构中**:
- [x] 按职责拆分文件
- [x] 添加正确的导入/导出语句
- [x] 确保类型定义先行
- [x] 解决循环依赖问题

**重构后**:
- [x] 验证 `npm start` 正常运行
- [x] 验证 `npm start -- --demo` 正常运行
- [x] 更新开发文档
- [x] 测试所有功能完整

---

**文档版本**: 2.0.0  
**最后更新**: 2026-02-13  
**重构作者**: Development Team
