# 状态栏UI重构方案

## 📊 重构范围分析

### 当前状态

你要将**原始状态栏**转变为**团队形式**的新UI：

**旧形式**（分散）:

```
保罗的状态
信心、体力、声望、教会、门徒、物资、稳定、逼迫、士气
+ 同工团队（分别列出）
```

**新形式**（紧凑团队):

```
┌═══════════════════════════════════════════════════════╗
║  📍 安提阿       │  1/4回合   ║
╠═══════════════════════════════════════════════════════╣
║  团队状态:
║  🍞 物资 100 / 150   ⛪ 稳定  55 / 100
║  🔥 逼迫  15/100   ⭐ 名声  70/200
╠═══════════════════════════════════════════════════════╣
║  同工:
║  保罗[领袖] 💪80  😊90%
║  提摩太[教导者] 💪90  😊75%
║  巴拿巴[劝慰者] 💪100 😊80%
╚═══════════════════════════════════════════════════════╝
```

---

## 🔧 需要重构的代码部分

### 1️⃣ **Player类** - 需要添加团队视图方法

**文件**: `player.ts`

**当前方法**:

- `getStatus()` - 详细状态（9行）
- `getCompactStatus()` - 紧凑状态（2行）

**需要添加**:

- `getTeamViewStatus()` - **新的团队视图**（只显示团队相关资源）
  - 显示: 体力、物资、稳定、逼迫、名声（团队关键指标）
  - 格式: 表格格式，适配状态栏

---

### 2️⃣ **Companion类** - 需要调整显示格式

**文件**: `companion.ts`

**当前方法**:

- `getUltraCompactStatus()` - "保罗[领袖] 体:███░░░ 士:90% 🟢"

**需要修改**:

- 改为: "保罗[领袖] 💪80 😊90%"
- 去掉进度条，改为直接数值显示

---

### 3️⃣ **主游戏循环** - 显示逻辑

**文件**: `main.ts`

**当前函数**:

- `displayStatusWithAction()` - 已存在，需要改造
- `displayActionOptions()` - 保持
- `displayCompanionTaskOptions()` - 保持

**需要修改**:

- `displayStatusWithAction()` - 整合团队信息显示
- 调整同工显示格式

---

## 💻 具体代码修改清单

### A. Player类新增方法

```typescript
// 团队视图状态 - 简洁显示关键资源
getTeamViewStatus(): {
  stamina: string;
  provision: string;
  stability: string;
  persecution: string;
  reputation: string;
} {
  return {
    stamina: `${this.stamina}/${this.maxStamina}`,
    provision: `${this.provision}/150`,
    stability: `${this.stability}/100`,
    persecution: `${this.persecution}/100`,
    reputation: `${this.reputation}/200`,
  };
}
```

### B. Companion类修改显示

```typescript
// 修改getUltraCompactStatus()格式
getTeamViewStatus(): string {
  const efficiency = Math.round(this.getEfficiency() * 100);
  return `${this.nameChinese}[${this.specialtyName}] 💪${this.stamina}  😊${this.morale}%`;
}
```

### C. main.ts修改displayStatusWithAction()

```typescript
function displayStatusWithAction(
  game: GameEngine,
  currentAction: string = "",
  companionTasks: string = "",
): void {
  const p = game.player;
  const city = game.currentCity;
  const status = p.getTeamViewStatus();

  console.log("\n╔═══════════════════════════════════════════════════════╗");

  // 城市和回合信息
  const actionText = currentAction ? ` → ${currentAction}` : "";
  console.log(
    `║  📍 ${(city?.nameChinese || "").padEnd(8)}       │  ${String(city?.currentTurn || 1).padStart(2)}/${city?.maxTurns || 5}回合${actionText}`,
  );

  console.log("╠═══════════════════════════════════════════════════════╣");
  console.log("║  团队状态:");
  console.log(
    `║  🍞 物资 ${status.provision.padStart(10)}   ⛪ 稳定 ${status.stability.padStart(10)}`,
  );
  console.log(
    `║  🔥 逼迫 ${status.persecution.padStart(10)}   ⭐ 名声 ${status.reputation.padStart(10)}`,
  );

  if (game.companions.length > 0) {
    console.log("╠═══════════════════════════════════════════════════════╣");
    console.log("║  同工:");
    game.companions.forEach((c) => {
      if (c.isActive) {
        console.log(`║  ${c.getTeamViewStatus()}`);
      }
    });
  }

  console.log("╚═══════════════════════════════════════════════════════╝");
}
```

---

## 📋 修改清单（按优先级）

| 优先级 | 文件           | 修改内容                                | 复杂度 |
| ------ | -------------- | --------------------------------------- | ------ |
| 🔴     | player.ts      | 添加 `getTeamViewStatus()` 方法         | 简单   |
| 🔴     | companion.ts   | 添加 `getTeamViewStatus()` 方法         | 简单   |
| 🔴     | main.ts        | 修改 `displayStatusWithAction()` 函数   | 中等   |
| 🟡     | main.ts        | 调整 `displayStatusWithAction()` 调用处 | 简单   |
| 🟡     | game-engine.ts | 可选：添加 `getTeamViewStatus()` 方法   | 简单   |

---

## 🎨 新UI特点分析

1. **紧凑性**: 显示面积减少，关键信息不变
2. **团队焦点**: 强调保罗+同工的团队概念
3. **对齐**: 使用表格对齐，数值右对齐
4. **可读性**: 清晰的分段（城市 → 状态 → 同工）

---

## ✅ 预期效果

修改后，游戏界面会：

1. ✓ 显示城市和回合数
2. ✓ 显示团队关键资源（物资、稳定、逼迫、名声）
3. ✓ 显示保罗及所有同工的体力和士气
4. ✓ 保持紧凑，便于在小屏幕显示
