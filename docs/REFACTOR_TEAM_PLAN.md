# 🏗️ 完整架构重构：Player → Team

## 目标

彻底分离关注点：

- **Team** = 团队层（资源、成员管理、结算）
- **Companion** = 个人层（体力、士气、专长）
- **GameEngine** = 游戏逻辑层

## 重构步骤

### Step 1: 创建team.ts（从player.ts改造）

- 重命名类：Player → Team
- 属性明确：leader + members（而不是paul + companions）
- 方法清晰化

### Step 2: 更新GameEngine

- 搜索替换：this.player → this.team
- player属性引用 → team属性引用

### Step 3: 更新main.ts

- game.player → game.team
- 显示逻辑保持不变

### Step 4: 更新types.ts

- Player接口 → Team接口

### Step 5: 更新导入/导出

- import { Player } → import { Team }
- 所有文件的导入声明

### Step 6: 删除/文件处理

- 保留或删除player.ts

---

## 预期效果

**团队架构清晰化**：

```
GameEngine.team (Team instance)
├─ leader: Companion (保罗)
├─ members: Companion[] (所有成员)
├─ resources: {
│   provision, stability, persecution, reputation,
│   faith, churches, disciples
│ }
└─ methods: manage team, settle resources, etc.
```

**代码可读性提升**：

```typescript
// 改前
this.player.paul.stamina;
this.player.provision;

// 改后
this.team.leader.stamina;
this.team.provision;
```

---

## 需要修改的文件

1. ✅ team.ts (新建或改名)
2. ✅ game-engine.ts
3. ✅ main.ts
4. ✅ types.ts
5. ✅ constants.ts (导入)
6. ✅ index.ts/导出文件

---

## 风险评估

**低风险**：

- 主要是查找替换
- 结构逻辑变化不大
- 功能行为不变

**需要仔细处理**：

- GameEngine中的循环遍历（getAllTeamMembers等）
- 结算系统中的资源计算
- 类型系统的一致性
