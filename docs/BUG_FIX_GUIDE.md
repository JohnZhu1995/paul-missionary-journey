# 🔧 Bug修复方案

## 修复1: 统一游戏状态属性

### 当前问题

```typescript
// game-engine.ts 第18-22行
this.isGameOver = false;
this.isVictory = false;
// ...
this.gameOver = false; // ← 重复定义
this.victory = false; // ← 重复定义
```

### 修复方案

**删除重复属性，统一使用以下两个：**

- `isGameOver`（游戏是否结束）
- `isVictory`（是否胜利）

需要修改的地方：

1. 第21行删除：`this.gameOver = false;`
2. 第22行删除：`this.victory = false;`
3. `runDemo()`第899行：改为 `while (!this.isGameOver)`
4. `moveToNextCity()`第324行：改为 `this.isGameOver = true; this.isVictory = true;`
5. `checkCrisisEvents()`第308行：改为 `this.isGameOver = true; this.isVictory = false;`

---

## 修复2: 修复书信系统映射

### 问题分析

- 游戏中有3个城市：`Antioch`, `Philippi`, `Ephesus`
- 书信系统设置了5个书信，但使用了不匹配的ID

### 修复方案

**letter.ts中修改initializeEpistles():**

```typescript
initializeEpistles(): void {
    // 改为使用城市ID而不是书信名
    this.cityLetterEffects.set('Antioch', [{
      cityId: 'Antioch',
      effect: { faith: 20, reputation: 10, stability: 15 },
      description: 'Epistle to Galatians'
    }]);

    this.cityLetterEffects.set('Philippi', [{
      cityId: 'Philippi',
      effect: { faith: 25, reputation: 15, disciples: 2, stability: 10 },
      description: 'Epistle to Philippians'
    }]);

    this.cityLetterEffects.set('Ephesus', [{
      cityId: 'Ephesus',
      effect: { faith: 30, reputation: 20, churches: 1, stability: 20 },
      description: 'Epistle to Ephesians'
    }]);
}
```

**修改canWriteLetter():**

```typescript
canWriteLetter(cityId: string, player: Player): boolean {
    // 检查当前城市是否已写过信
    if (this.epistleCollection.get(cityId)) return false;

    // 检查门徒和信心要求
    if (player.disciples < 3) return false;
    if (player.faith < 30) return false;

    return true;  // 移除CITY_CONFIG检查
}
```

**修改isCompleteCollection():**

```typescript
isCompleteCollection(): boolean {
    const cities = ['Antioch', 'Philippi', 'Ephesus'];
    return cities.every(id => this.epistleCollection.get(id) === true);
}
```

---

## 修复3: 修复决策事件验证

### 当前问题

```typescript
// game-engine.ts 第547-548行
if (choiceIndex === 0 || choiceIndex === 1) {
  // ← 只允许2个选项
  // ...
}
```

### 修复方案

**game-engine.ts中修改handleDecision():**

```typescript
handleDecision(eventId: string, choiceIndex: number): string {
    const event = (ANTIOCH_EVENTS[eventId] || PHILIPPI_EVENTS[eventId] || EPHESUS_EVENTS[eventId]) as DecisionEvent;
    if (!event || event.type !== 'decision') {
      return '无效的事件或决策';
    }

    // 修改这里
    if (choiceIndex < 0 || choiceIndex >= event.choices.length) {
      return '无效的选择';
    }

    // ... 后续代码
}
```

**main.ts中修改handleDecisionEvent():**

```typescript
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
    // 修改这里 - 支持所有选项
    if (choiceIndex >= 0 && choiceIndex < event.choices.length) {
      const decisionResult = game.handleDecision(event.id, choiceIndex);
      console.log(decisionResult);
      validDecision = true;
    } else {
      console.log(`❌ 请输入 1-${event.choices.length}`);
    }
  }
}
```

---

## 修复4: 修复City实例重复创建

### 当前问题

```typescript
// game-engine.ts 第107行
startCity(cityId: string): boolean {
    this.currentCity = new City(cityId);  // ← 每次都重新创建，丢失数据
}
```

### 修复方案

**game-engine.ts中修改startCity():**

```typescript
startCity(cityId: string): boolean {
    if (!this.availableCities.includes(cityId)) {
      return false;
    }

    // 改为从已创建的城市列表中查找
    const city = this.cities.find(c => c.id === cityId);
    if (!city) {
      return false;
    }

    this.currentCity = city;
    this.player.currentCity = cityId;

    if (!this.player.visitedCities.includes(cityId)) {
      this.player.visitedCities.push(cityId);
    }

    this.addToLog(`抵达${this.currentCity.nameChinese}(${this.currentCity.name})`);
    this.addToLog(this.currentCity.description);

    // 触发城市事件
    this.triggerCityEvent(cityId);

    return true;
}
```

---

## 修复5: 增加currentTurn计数

### 当前问题

```typescript
// currentTurn初始化为0，但从未增加
this.currentTurn = 0;
```

### 修复方案

**game-engine.ts中修改handleAction():**
在第217行后面增加：

```typescript
handleAction(actionType: ActionType, companionActions?: Map<string, CompanionTaskType>): string {
    if (this.isGameOver) {
      return '游戏已结束。';
    }

    // ... 前面的代码 ...

    // 增加这一行：在回合推进后增加计数
    this.currentTurn++;  // ← 添加这行

    // 回合推进
    this.currentCity?.nextRound();

    // ... 后续代码 ...
}
```

---

## 修复6: 完善事件触发逻辑（可选）

### 建议

在game-engine.ts中扩展triggerEvent()方法，为所有事件添加触发条件：

```typescript
triggerEvent(): { event: GameEvent | DecisionEvent | null; message: string } {
    // 安提阿事件流
    if (this.currentCity?.name === 'Antioch') {
      if (this.currentCity.currentTurn === 2 && !this.eventHistory.includes('christian_name')) {
        return this.executeEvent(ANTIOCH_EVENTS['christian_name'] as GameEvent);
      }
      // ... 添加更多事件
    }

    // 腓立比事件流
    if (this.currentCity?.name === 'Philippi') {
      if (this.currentCity.currentTurn === 1 && !this.eventHistory.includes('lydia_meeting')) {
        return this.executeEvent(PHILIPPI_EVENTS['lydia_meeting'] as GameEvent);
      }
      // ... 添加更多事件
    }

    // 以弗所事件流（目前缺失）
    if (this.currentCity?.name === 'Ephesus') {
      if (this.currentCity.currentTurn === 1 && !this.eventHistory.includes('tyrannus_school')) {
        return this.executeEvent(EPHESUS_EVENTS['tyrannus_school'] as GameEvent);
      }
      // ... 添加更多事件
    }

    return { event: null, message: '' };
}
```

---

## 测试修复后的功能

### 测试清单

- [ ] `npm start -- --demo` 能正常完成演示
- [ ] 玩家成功到达所有3个城市
- [ ] 可以成功撰写书信
- [ ] 决策事件支持所有选项
- [ ] 同工属性在多个回合中保持一致
- [ ] 游戏结束时显示正确的评价
