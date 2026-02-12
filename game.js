// 游戏主逻辑
let currentScene = null;
let selectedSearchVerses = [];
let memoryWords = [];
let memorySelectedWords = [];

// ==================== 资源管理系统 ====================

// 检查资源是否足够
function hasEnoughResources(cost) {
    const res = GameState.resources;
    return (!cost.faith || res.faith >= cost.faith) &&
           (!cost.supplies || res.supplies >= cost.supplies) &&
           (!cost.influence || res.influence >= cost.influence);
}

// 消耗资源
function consumeResources(cost) {
    if (!hasEnoughResources(cost)) return false;
    
    if (cost.faith) GameState.resources.faith -= cost.faith;
    if (cost.supplies) GameState.resources.supplies -= cost.supplies;
    if (cost.influence) GameState.resources.influence -= cost.influence;
    
    // 检查Faith归零
    if (GameState.resources.faith <= 0) {
        triggerFastingPrayer();
        return 'fasting';
    }
    
    updateResourceDisplay();
    saveGame();
    return true;
}

// 增加资源
function addResources(rewards) {
    if (rewards.faith) GameState.resources.faith = Math.min(100, GameState.resources.faith + rewards.faith);
    if (rewards.supplies) GameState.resources.supplies = Math.min(100, GameState.resources.supplies + rewards.supplies);
    if (rewards.influence) GameState.resources.influence = Math.min(100, GameState.resources.influence + rewards.influence);
    
    updateResourceDisplay();
    saveGame();
}

// 更新资源显示
function updateResourceDisplay() {
    // 如果在地图界面，更新资源条
    const resourceBar = document.getElementById('resource-bar');
    if (resourceBar) {
        resourceBar.innerHTML = `
            <div class="resource-item">
                <span class="resource-icon">✝</span>
                <span class="resource-value">${GameState.resources.faith}</span>
                <span class="resource-label">信念</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">🍞</span>
                <span class="resource-value">${GameState.resources.supplies}</span>
                <span class="resource-label">供给</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">👥</span>
                <span class="resource-value">${GameState.resources.influence}</span>
                <span class="resource-label">影响力</span>
            </div>
        `;
    }
}

// ==================== 经文装备系统 ====================

// 应用经文效果
function applyVerseEffects(effects) {
    if (effects.faith) addResources({ faith: effects.faith });
    if (effects.supplies) addResources({ supplies: effects.supplies });
    if (effects.influence) addResources({ influence: effects.influence });
    
    // 特殊效果
    if (effects.enemy_resistance && GameState.battleState) {
        GameState.battleState.enemyCurrentResistance += effects.enemy_resistance;
    }
    
    // Phase 2: 福音饱和度效果
    if (effects.gospel_saturation) {
        const currentCityKey = GameData.scenes[currentScene].city;
        if (currentCityKey) {
            const actualIncrease = GameData.gospelSaturationSystem.increaseSaturation(
                currentCityKey, 
                effects.gospel_saturation
            );
            if (actualIncrease > 0) {
                showHint(`${GameData.cities[currentCityKey].name}的福音饱和度增加了${actualIncrease}点！`);
            }
        }
    }
}

// 检查经文是否可用
function canUseVerse(verseKey) {
    const verse = GameData.verses[verseKey];
    if (!verse) return false;
    
    // 检查是否已收藏
    if (!GameState.collectedVerses.includes(verseKey)) return false;
    
    // 检查使用次数
    if (!verse.consume) return true;
    
    const used = GameState.verseUsage?.[verseKey] || 0;
    return used < (verse.maxUses || 1);
}

// 使用经文
function useVerse(verseKey) {
    if (!canUseVerse(verseKey)) return false;
    
    const verse = GameData.verses[verseKey];
    
    // 记录使用次数
    if (verse.consume) {
        GameState.verseUsage = GameState.verseUsage || {};
        GameState.verseUsage[verseKey] = (GameState.verseUsage[verseKey] || 0) + 1;
    }
    
    // 应用效果
    if (verse.effect) {
        applyVerseEffects(verse.effect);
    }
    
    saveGame();
    return verse;
}

// 获取可用的经文列表（用于当前场景）
function getAvailableVersesForScene(sceneKey) {
    const scene = GameData.scenes[sceneKey];
    if (!scene) return [];
    
    // 获取所有已收集的经文
    const collectedVerses = GameState.collectedVerses || [];
    
    // 过滤出当前场景可用的经文
    return collectedVerses.filter(verseKey => {
        const verse = GameData.verses[verseKey];
        if (!verse) return false;
        
        // 检查使用次数
        if (!canUseVerse(verseKey)) return false;
        
        // 检查是否适用于当前场景类型
        if (scene.type === 'spiritual_battle' && scene.gameData?.battleEnemy) {
            // 在属灵争战中，检查经文是否适用于此敌人
            const enemy = GameData.spiritualBattles[scene.gameData.battleEnemy];
            if (enemy) {
                // 如果经文有特定的适用场景，检查是否匹配
                if (verse.usedIn && verse.usedIn.length > 0) {
                    return verse.usedIn.some(tag => 
                        tag.includes(scene.gameData.battleEnemy) ||
                        tag.includes(scene.city)
                    );
                }
            }
        }
        
        return true;
    });
}

// 渲染经文选择界面
function renderVerseSelector(availableVerses, onSelect, context = 'battle') {
    const container = document.createElement('div');
    container.className = 'verse-selector';
    container.innerHTML = `
        <div class="verse-selector-header">
            <h3>📖 选择经文作为论据</h3>
            <p class="verse-selector-hint">选择最合适的经文来回应当前的挑战</p>
        </div>
        <div class="verse-list">
            ${availableVerses.length === 0 ? 
                '<div class="verse-empty">你还没有收藏适合此场景的经文。继续前进，收集更多经文！</div>' :
                availableVerses.map(verseKey => {
                    const verse = GameData.verses[verseKey];
                    const typeInfo = GameData.verseTypes[verse.type];
                    const usesLeft = verse.consume ? 
                        `${(verse.maxUses || 1) - (GameState.verseUsage?.[verseKey] || 0)}/${verse.maxUses || 1}` : 
                        '∞';
                    
                    return `
                        <div class="verse-card ${!canUseVerse(verseKey) ? 'disabled' : ''}" data-verse="${verseKey}">
                            <div class="verse-card-header">
                                <span class="verse-icon">${typeInfo?.icon || '📖'}</span>
                                <span class="verse-type">${typeInfo?.name || verse.type}</span>
                                <span class="verse-uses">使用次数: ${usesLeft}</span>
                            </div>
                            <div class="verse-text">"${verse.text.substring(0, 50)}..."</div>
                            <div class="verse-reference">${verse.reference}</div>
                            <div class="verse-description">${verse.description}</div>
                            <div class="verse-effects">
                                ${verse.effect?.faith ? `<span class="effect-tag faith">+${verse.effect.faith}信念</span>` : ''}
                                ${verse.effect?.influence ? `<span class="effect-tag influence">+${verse.effect.influence}影响力</span>` : ''}
                                ${verse.effect?.enemy_resistance ? `<span class="effect-tag damage">${verse.effect.enemy_resistance}抵抗力</span>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')
            }
        </div>
        <div class="verse-selector-footer">
            <button id="btn-cancel-verse" class="btn-secondary">不使用经文</button>
        </div>
    `;
    
    // 绑定选择事件
    container.querySelectorAll('.verse-card:not(.disabled)').forEach(card => {
        card.addEventListener('click', () => {
            const verseKey = card.dataset.verse;
            onSelect(verseKey);
        });
    });
    
    // 绑定取消按钮
    const cancelBtn = container.querySelector('#btn-cancel-verse');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            onSelect(null);
        });
    }
    
    return container;
}

// ==================== 技能系统 ====================

// 获取技能当前属性（根据等级计算）
function getSkillStats(skillName) {
    const skill = GameState.skills[skillName];
    const config = GameData.skillConfig[skillName];
    const level = skill.level;
    
    return {
        name: config.name,
        description: config.description,
        cost: {
            faith: config.baseCost.faith + (config.scaling.cost * (level - 1)),
            supplies: config.baseCost.supplies + (config.scaling.cost * (level - 1)),
            influence: config.baseCost.influence + (config.scaling.cost * (level - 1))
        },
        damage: config.baseDamage + (config.scaling.damage * (level - 1)),
        chance: Math.min(0.99, config.baseChance + (level - 1) * 0.02),
        heal: config.heal ? {
            faith: config.heal.faith + ((config.scaling.heal || 0) * (level - 1))
        } : null,
        level: level,
        exp: skill.exp,
        maxExp: skill.maxExp
    };
}

// 增加技能经验
function addSkillExp(skillName, amount) {
    const skill = GameState.skills[skillName];
    skill.exp += amount;
    
    // 检查升级
    if (skill.exp >= skill.maxExp) {
        skill.level++;
        skill.exp = skill.exp - skill.maxExp;
        skill.maxExp = Math.floor(skill.maxExp * 1.5);
        showHint(`${GameData.skillConfig[skillName].name}技能升级到 ${skill.level} 级！`);
    }
    
    saveGame();
}

// ==================== 旅行事件系统 ====================

// 触发旅行事件
function triggerTravelEvent(fromCity, toCity) {
    // 计算动态难度
    const targetDifficulty = GameData.difficultySystem.calculateTargetDifficulty(
        GameState.skills, 
        GameState.currentCityIndex
    );
    
    // Phase 2: 获取目标城市的福音饱和度
    const toCityData = GameData.cities[toCity];
    const citySaturation = toCityData ? (toCityData.gospel_saturation || 0) : 0;
    
    // 获取所有事件并计算概率 - 现在考虑福音饱和度
    const events = Object.values(GameData.travelEvents);
    const weightedEvents = events.map(event => ({
        ...event,
        currentProbability: GameData.difficultySystem.calculateEventProbability(
            event, GameState.skills, GameState.resources, toCity
        )
    }));
    
    // 根据概率选择事件
    const totalWeight = weightedEvents.reduce((sum, e) => sum + e.currentProbability, 0);
    let random = Math.random() * totalWeight;
    
    let selectedEvent = weightedEvents[0];
    for (const event of weightedEvents) {
        random -= event.currentProbability;
        if (random <= 0) {
            selectedEvent = event;
            break;
        }
    }
    
    // 检查是否能应对（资源是否足够）
    const canHandle = !selectedEvent.requires || hasEnoughResources(selectedEvent.requires);
    
    // Phase 2: 显示福音饱和度信息
    if (citySaturation > 0) {
        const satInfo = GameData.gospelSaturationSystem.getSaturationLevel(citySaturation);
        console.log(`前往${toCityData.name}，福音饱和度：${satInfo.name} (${citySaturation}%)`);
    }
    
    // 显示旅行事件
    showTravelEventModal(selectedEvent, canHandle, toCity, citySaturation);
}

// 显示旅行事件弹窗
function showTravelEventModal(event, canHandle, nextScene, citySaturation = 0) {
    const modal = document.createElement('div');
    modal.id = 'travel-event-modal';
    modal.className = 'modal active';
    
    // Phase 2: 显示福音饱和度信息
    let saturationHTML = '';
    if (citySaturation > 0) {
        const satInfo = GameData.gospelSaturationSystem.getSaturationLevel(citySaturation);
        const effects = GameData.gospelSaturationSystem.getSaturationEffects(citySaturation);
        saturationHTML = `
            <div style="background: ${satInfo.color}15; border-left: 4px solid ${satInfo.color}; padding: 12px; border-radius: 4px; margin-bottom: 15px;">
                <p style="margin: 0; color: ${satInfo.color}; font-weight: bold;">
                    📊 福音状况：${satInfo.name} (${citySaturation}%)
                </p>
                ${effects.length > 0 ? `
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                        效果：${effects.join('、')}
                    </p>
                ` : ''}
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <h2 style="color: #8b4513; margin-bottom: 20px;">${event.name}</h2>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">${event.description}</p>
            ${saturationHTML}
            <div style="background: #f5f5dc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>预计影响：</strong></p>
                ${event.effect.faith ? `<p style="margin: 5px 0;">信念：${event.effect.faith > 0 ? '+' : ''}${event.effect.faith}</p>` : ''}
                ${event.effect.supplies ? `<p style="margin: 5px 0;">供给：${event.effect.supplies > 0 ? '+' : ''}${event.effect.supplies}</p>` : ''}
                ${event.effect.influence ? `<p style="margin: 5px 0;">影响力：${event.effect.influence > 0 ? '+' : ''}${event.effect.influence}</p>` : ''}
            </div>
            ${!canHandle ? '<p style="color: #c41e3a; margin-bottom: 15px;">⚠️ 资源不足，无法完全应对这次事件！</p>' : ''}
            <div class="modal-buttons" style="display: flex; gap: 10px; justify-content: center;">
                <button id="btn-accept-event" class="btn-primary">依靠信心前行</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 绑定事件
    document.getElementById('btn-accept-event').addEventListener('click', () => {
        // 应用事件效果
        addResources(event.effect);
        
        // 移除弹窗
        modal.remove();
        
        // 继续前往下一个场景
        loadScene(nextScene);
    });
}

// ==================== 经文对决系统 ====================

// 初始化经文对决（替代原有的属灵争战）
function initScriptureDebate(enemyId) {
    const enemyTemplate = GameData.spiritualBattles[enemyId];
    const targetDifficulty = GameData.difficultySystem.calculateTargetDifficulty(
        GameState.skills,
        GameState.currentCityIndex
    );
    
    // Phase 2: 获取当前城市key
    const currentCityKey = GameData.scenes[currentScene]?.city;
    
    // 根据动态难度缩放敌人 - 现在考虑福音饱和度
    const enemy = GameData.difficultySystem.scaleEnemy(enemyTemplate, targetDifficulty, currentCityKey);
    
    GameState.battleState = {
        enemy: enemy,
        enemyCurrentResistance: enemy.resistance,
        turn: 1,
        log: [],
        usedVerses: [],  // 本对决中使用过的经文
        awaitingVerse: true,  // 等待玩家选择经文
        cityKey: currentCityKey  // Phase 2: 记录城市key
    };
    
    // Phase 2: 显示城市福音饱和度信息
    if (currentCityKey) {
        const city = GameData.cities[currentCityKey];
        if (city && city.gospel_saturation > 0) {
            const satInfo = GameData.gospelSaturationSystem.getSaturationLevel(city.gospel_saturation);
            GameState.battleState.log.push(`📊 ${city.name}福音状况：${satInfo.name} (${city.gospel_saturation}%)`);
        }
    }
    
    renderScriptureDebateScreen();
}

// 渲染经文对决界面
function renderScriptureDebateScreen() {
    const battle = GameState.battleState;
    const container = document.getElementById('puzzle-game');
    
    // 获取当前可用的经文
    const availableVerses = getAvailableVersesForScene(currentScene);
    
    container.innerHTML = `
        <div class="debate-container" style="padding: 20px;">
            <h2 style="color: #8b4513; margin-bottom: 20px;">📖 经文对决</h2>
            <div class="debate-context" style="background: #f5f5dc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0;">${battle.enemy.name}</h3>
                <p style="margin: 5px 0; font-size: 14px; color: #666;">${battle.enemy.description}</p>
                <div class="resistance-bar" style="margin-top: 10px;">
                    <div style="background: #ddd; height: 20px; border-radius: 10px; overflow: hidden;">
                        <div style="background: #c41e3a; height: 100%; width: ${Math.max(0, (battle.enemyCurrentResistance / battle.enemy.resistance) * 100)}%; transition: width 0.3s;"></div>
                    </div>
                    <p style="text-align: center; margin: 5px 0; font-size: 12px;">说服力：${Math.max(0, battle.enemyCurrentResistance)}/${battle.enemy.resistance}</p>
                </div>
            </div>
            
            <div class="player-status" style="display: flex; justify-content: space-around; margin-bottom: 20px; font-size: 14px; background: #fff; padding: 10px; border-radius: 8px;">
                <span>✝ ${GameState.resources.faith}/100</span>
                <span>🍞 ${GameState.resources.supplies}</span>
                <span>👥 ${GameState.resources.influence}</span>
            </div>
            
            <div class="verse-selection-area" style="margin-bottom: 20px;">
                <h3 style="margin-bottom: 15px; color: #5c4033;">选择经文作为论据：</h3>
                <div class="verse-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; max-height: 300px; overflow-y: auto;">
                    ${availableVerses.length === 0 ? 
                        `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
                            <p>📚 你还没有收集到适合此场景的经文</p>
                            <p style="font-size: 12px; margin-top: 10px;">继续旅程，在游戏中收集更多经文</p>
                            <button id="btn-no-verse" class="btn-secondary" style="margin-top: 15px;">凭信心回应</button>
                        </div>` :
                        availableVerses.map(verseKey => {
                            const verse = GameData.verses[verseKey];
                            const typeInfo = GameData.verseTypes[verse.type];
                            const usesLeft = verse.consume ? 
                                (verse.maxUses || 1) - (GameState.verseUsage?.[verseKey] || 0) : 
                                '∞';
                            const isExhausted = verse.consume && usesLeft <= 0;
                            
                            return `
                                <div class="verse-card ${isExhausted ? 'disabled' : ''}" 
                                     data-verse="${verseKey}" 
                                     style="background: ${isExhausted ? '#f0f0f0' : '#fff'}; 
                                            border: 2px solid ${isExhausted ? '#ddd' : '#d4a574'}; 
                                            border-radius: 8px; 
                                            padding: 12px; 
                                            cursor: ${isExhausted ? 'not-allowed' : 'pointer'};
                                            opacity: ${isExhausted ? 0.6 : 1};
                                            transition: all 0.2s;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                        <span style="font-size: 18px;">${typeInfo?.icon || '📖'}</span>
                                        <span style="font-size: 11px; color: #666; background: #f5f5dc; padding: 2px 6px; border-radius: 4px;">${typeInfo?.name}</span>
                                    </div>
                                    <div style="font-size: 13px; color: #5c4033; margin-bottom: 6px; line-height: 1.4; height: 36px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                                        "${verse.text.substring(0, 40)}..."
                                    </div>
                                    <div style="font-size: 11px; color: #8b7355; margin-bottom: 8px;">${verse.reference}</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div style="display: flex; gap: 5px;">
                                            ${verse.effect?.faith ? `<span style="font-size: 10px; background: #e8f5e9; color: #2e7d32; padding: 2px 5px; border-radius: 3px;">+${verse.effect.faith}信念</span>` : ''}
                                            ${verse.effect?.influence ? `<span style="font-size: 10px; background: #e3f2fd; color: #1565c0; padding: 2px 5px; border-radius: 3px;">+${verse.effect.influence}影响力</span>` : ''}
                                            ${verse.effect?.enemy_resistance ? `<span style="font-size: 10px; background: #ffebee; color: #c62828; padding: 2px 5px; border-radius: 3px;">${verse.effect.enemy_resistance}说服</span>` : ''}
                                        </div>
                                        <span style="font-size: 10px; color: #999;">剩余: ${usesLeft}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')
                    }
                </div>
            </div>
            
            <div class="debate-log" style="background: #fff; padding: 10px; border-radius: 8px; max-height: 120px; overflow-y: auto; font-size: 13px; line-height: 1.5; border: 1px solid #e0e0e0;">
                ${battle.log.length === 0 ? 
                    '<p style="color: #999; text-align: center; margin: 0;">对决即将开始...选择合适的经文来回应挑战</p>' :
                    battle.log.map(entry => `<p style="margin: 4px 0;">${entry}</p>`).join('')
                }
            </div>
        </div>
    `;
    
    // 绑定经文选择事件
    container.querySelectorAll('.verse-card:not(.disabled)').forEach(card => {
        card.addEventListener('click', () => {
            const verseKey = card.dataset.verse;
            executeScriptureDebateTurn(verseKey);
        });
    });
    
    // 绑定"凭信心回应"按钮（无经文时）
    const noVerseBtn = container.querySelector('#btn-no-verse');
    if (noVerseBtn) {
        noVerseBtn.addEventListener('click', () => {
            executeScriptureDebateTurn(null);
        });
    }
    
    showScreen('puzzle-game');
}

// 执行经文对决回合
function executeScriptureDebateTurn(verseKey) {
    const battle = GameState.battleState;
    const enemy = battle.enemy;
    
    if (verseKey) {
        // 使用经文
        const verse = useVerse(verseKey);
        if (!verse) {
            showHint('经文使用失败！');
            return;
        }
        
        // 记录使用
        battle.usedVerses.push(verseKey);
        
        // 计算说服力伤害
        let damage = verse.strength || 20;
        
        // 检查是否击中敌人弱点（经文类型匹配）
        let isWeaknessHit = false;
        if (enemy.weakness && enemy.weakness.includes(verse.type)) {
            damage = Math.floor(damage * 1.5);
            isWeaknessHit = true;
        }
        
        // 构建效果描述
        let effectDesc = [];
        if (verse.effect?.faith) effectDesc.push(`恢复${verse.effect.faith}信念`);
        if (verse.effect?.influence) effectDesc.push(`增加${verse.effect.influence}影响力`);
        
        // 添加战斗日志
        if (isWeaknessHit) {
            battle.log.push(`✨ <strong>完美引用！</strong> "${verse.reference}" 直接击中对方的盲点！造成 ${damage} 点说服伤害${effectDesc.length ? '，' + effectDesc.join('、') : ''}。`);
        } else {
            battle.log.push(`✓ 你引用 "${verse.reference}" 来回应。造成 ${damage} 点说服伤害${effectDesc.length ? '，' + effectDesc.join('、') : ''}。`);
        }
        
        battle.enemyCurrentResistance -= damage;
        
    } else {
        // 没有使用经文，凭自己回应
        const damage = 5;  // 基础伤害很低
        const faithCost = 10;  // 消耗信念
        
        GameState.resources.faith -= faithCost;
        battle.log.push(`⚠️ 你尝试凭自己的智慧回应，但说服力不足（-${faithCost}信念，仅造成${damage}点伤害）。`);
        battle.enemyCurrentResistance -= damage;
        
        updateResourceDisplay();
    }
    
    // 检查是否说服成功
    if (battle.enemyCurrentResistance <= 0) {
        battle.log.push(`🎉 <strong>说服成功！</strong> 对方被你的论证折服。`);
        
        // 获得奖励
        const rewards = enemy.rewards;
        if (rewards) {
            battle.log.push(`💎 获得 ${rewards.exp || 20} 经验值和 ${rewards.influence || 10} 影响力！`);
            addResources({ influence: rewards.influence || 10 });
            
            // 增加技能经验
            addSkillExp('debate', rewards.exp || 20);
            
            // Phase 2: 增加福音饱和度
            if (battle.cityKey && rewards.gospelSaturation) {
                const actualIncrease = GameData.gospelSaturationSystem.increaseSaturation(
                    battle.cityKey, 
                    rewards.gospelSaturation
                );
                if (actualIncrease > 0) {
                    const city = GameData.cities[battle.cityKey];
                    const newSaturation = city.gospel_saturation;
                    const satInfo = GameData.gospelSaturationSystem.getSaturationLevel(newSaturation);
                    battle.log.push(`📈 ${city.name}的福音状况提升至 ${satInfo.name} (${newSaturation}%)！`);
                }
            }
        }
        
        saveGame();
        
        // 延迟后进入下一个场景
        setTimeout(() => {
            GameState.battleState = null;
            const scene = GameData.scenes[currentScene];
            if (scene.gameData && scene.gameData.next) {
                loadScene(scene.gameData.next);
            } else {
                showScreen('map-screen');
            }
        }, 2500);
        return;
    }
    
    // 敌人反击
    setTimeout(() => {
        const enemyAttack = Math.floor(8 + Math.random() * 12);
        GameState.resources.faith -= enemyAttack;
        battle.log.push(`💔 ${enemy.name}提出质疑！你的信念受到冲击（-${enemyAttack}信念）。`);
        
        // 检查信念归零
        if (GameState.resources.faith <= 0) {
            GameState.resources.faith = 0;
            saveGame();
            battle.log.push(`⚠️ 你的信念动摇了...需要禁食祷告重新得力。`);
            
            setTimeout(() => {
                triggerFastingPrayer();
            }, 1500);
            return;
        }
        
        battle.turn++;
        saveGame();
        updateResourceDisplay();
        
        // 重新渲染界面（刷新可用经文状态）
        renderScriptureDebateScreen();
    }, 1000);
}

// ==================== 禁食祷告系统 ====================

// 触发禁食祷告
function triggerFastingPrayer() {
    const tasks = GameData.fastingPrayer.tasks;
    const selectedTask = tasks[Math.floor(Math.random() * tasks.length)];
    
    GameState.fastingState = {
        task: selectedTask,
        startTime: Date.now(),
        completed: false
    };
    
    showFastingPrayerModal();
}

// 显示禁食祷告界面
function showFastingPrayerModal() {
    const fasting = GameState.fastingState;
    const task = fasting.task;
    
    const modal = document.createElement('div');
    modal.id = 'fasting-modal';
    modal.className = 'modal active';
    
    let taskHTML = '';
    if (task.type === 'memory_verse') {
        taskHTML = `
            <p style="font-size: 18px; margin-bottom: 20px;">${task.description}</p>
            <input type="text" id="fasting-answer" placeholder="请输入答案..." style="padding: 10px; font-size: 16px; width: 200px;">
            <button id="btn-submit-fasting" class="btn-primary" style="margin-left: 10px;">确认</button>
        `;
    } else if (task.type === 'click_prayer') {
        taskHTML = `
            <p style="font-size: 18px; margin-bottom: 20px;">${task.description}</p>
            <button id="btn-prayer-click" class="btn-primary" style="padding: 20px 40px; font-size: 18px;">
                🙏 祷告 (<span id="prayer-count">0</span>/${task.clicks})
            </button>
        `;
    } else if (task.type === 'quiet_wait') {
        taskHTML = `
            <p style="font-size: 18px; margin-bottom: 20px;">${task.description}</p>
            <div style="font-size: 48px; color: #8b4513;" id="fasting-timer">${task.duration}</div>
            <p style="margin-top: 10px; color: #666;">请保持安静，等待倒计时结束...</p>
        `;
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <h2 style="color: #c41e3a; margin-bottom: 20px;">禁食祷告</h2>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                你的信念已经耗尽，需要通过禁食祷告重新得力。
                <br>完成以下任务来恢复你的信念：
            </p>
            <div style="background: #f5f5dc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #8b4513;">${task.name}</h3>
                ${taskHTML}
            </div>
            <p style="color: #666; font-size: 14px;">完成后将恢复 ${GameData.fastingPrayer.baseRecovery.faith} 点信念</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 绑定任务交互
    if (task.type === 'memory_verse') {
        document.getElementById('btn-submit-fasting').addEventListener('click', () => {
            const answer = document.getElementById('fasting-answer').value.trim();
            if (answer === task.answer) {
                completeFastingPrayer();
            } else {
                alert('答案不正确，请再想一想。提示：使徒行传14:22');
            }
        });
    } else if (task.type === 'click_prayer') {
        let count = 0;
        const btn = document.getElementById('btn-prayer-click');
        btn.addEventListener('click', () => {
            count++;
            document.getElementById('prayer-count').textContent = count;
            if (count >= task.clicks) {
                completeFastingPrayer();
            }
        });
    } else if (task.type === 'quiet_wait') {
        let timeLeft = task.duration;
        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('fasting-timer').textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                completeFastingPrayer();
            }
        }, 1000);
    }
}

// 完成禁食祷告
function completeFastingPrayer() {
    GameState.fastingState.completed = true;
    
    // 恢复资源
    addResources(GameData.fastingPrayer.baseRecovery);
    
    // 移除弹窗
    const modal = document.getElementById('fasting-modal');
    if (modal) modal.remove();
    
    showHint('禁食祷告完成！你的信念已经恢复，可以继续前行了。');
    
    // 如果之前有战斗，返回战斗；否则返回地图
    if (GameState.battleState) {
        renderBattleScreen();
    } else {
        showScreen('map-screen');
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    initGame();
});

function initGame() {
    // 绑定按钮事件
    bindButtonEvents();
    
    // 检查存档
    if (hasSaveData()) {
        document.getElementById('btn-continue').style.display = 'inline-block';
    }
    
    // 更新地图进度
    updateMapProgress();
}

function bindButtonEvents() {
    // 主菜单按钮
    document.getElementById('btn-new-game').addEventListener('click', startNewGame);
    document.getElementById('btn-continue').addEventListener('click', continueGame);
    document.getElementById('btn-notes').addEventListener('click', showNotes);
    document.getElementById('btn-help').addEventListener('click', showHelp);
    
    // 帮助界面
    document.getElementById('btn-help-back').addEventListener('click', () => showScreen('title-screen'));
    
    // 笔记界面
    document.getElementById('btn-notes-back').addEventListener('click', () => showScreen('title-screen'));
    
    // 地图界面
    document.getElementById('btn-save').addEventListener('click', () => {
        saveGame();
        showHint('游戏已保存！');
    });
    document.getElementById('btn-menu').addEventListener('click', showMenuModal);
    document.getElementById('btn-hint').addEventListener('click', showCurrentHint);
    
    // 场景界面
    document.getElementById('btn-next').addEventListener('click', handleNextClick);
    document.getElementById('btn-back-map').addEventListener('click', () => showScreen('map-screen'));
    document.getElementById('btn-scene-menu').addEventListener('click', showMenuModal);
    document.getElementById('btn-collect-verse').addEventListener('click', handleCollectVerse);
    
    // 经文搜索游戏
    document.getElementById('btn-search-hint').addEventListener('click', showSearchHint);
    document.getElementById('btn-search-skip').addEventListener('click', skipSearchGame);
    
    // 记忆游戏
    document.getElementById('btn-show-verse').addEventListener('click', showMemoryVerse);
    document.getElementById('btn-start-test').addEventListener('click', startMemoryTest);
    document.getElementById('btn-check-memory').addEventListener('click', checkMemoryAnswer);
    
    // 解谜游戏
    document.getElementById('btn-check-puzzle').addEventListener('click', checkPuzzleAnswer);
    document.getElementById('puzzle-answer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPuzzleAnswer();
        }
    });
    
    // 测验界面
    document.getElementById('btn-next-question').addEventListener('click', nextQuizQuestion);
    
    // 完成界面
    document.getElementById('btn-replay').addEventListener('click', () => {
        clearSaveData();
        startNewGame();
    });
    document.getElementById('btn-main-menu').addEventListener('click', () => showScreen('title-screen'));
    
    // 菜单弹窗
    document.getElementById('modal-save').addEventListener('click', () => {
        saveGame();
        showHint('游戏已保存！');
        closeModal('menu-modal');
    });
    document.getElementById('modal-notes').addEventListener('click', () => {
        closeModal('menu-modal');
        showNotes();
    });
    document.getElementById('modal-help').addEventListener('click', () => {
        closeModal('menu-modal');
        showHelp();
    });
    document.getElementById('modal-exit').addEventListener('click', () => {
        closeModal('menu-modal');
        showScreen('title-screen');
    });
    document.getElementById('modal-close').addEventListener('click', () => closeModal('menu-modal'));
    
    // 关闭弹窗
    document.querySelector('.close').addEventListener('click', () => closeModal('hint-modal'));
    
    // 地图城市点击
    document.querySelectorAll('.city-marker').forEach(marker => {
        marker.addEventListener('click', () => {
            const cityKey = marker.getAttribute('data-city');
            handleCityClick(cityKey);
        });
    });
}

// 显示指定屏幕
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// 开始新游戏
function startNewGame() {
    clearSaveData();
    showScreen('map-screen');
    updateMapProgress();
    showHint('欢迎来到保罗的宣教之旅！点击安提阿开始你的旅程。');
}

// 继续游戏
function continueGame() {
    loadGame();
    showScreen('map-screen');
    updateMapProgress();
    showHint('欢迎回来！继续你的宣教旅程。');
}

// 显示帮助
function showHelp() {
    showScreen('help-screen');
}

// 显示笔记
function showNotes() {
    const container = document.getElementById('verses-collection');
    const emptyMsg = document.getElementById('verses-empty');
    
    container.innerHTML = '';
    
    if (GameState.collectedVerses.length === 0) {
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';
        GameState.collectedVerses.forEach(verseKey => {
            const verse = GameData.verses[verseKey];
            if (verse) {
                const item = document.createElement('div');
                item.className = 'verse-item';
                item.innerHTML = `
                    <p>"${verse.text}"</p>
                    <p>— ${verse.reference}</p>
                `;
                container.appendChild(item);
            }
        });
    }
    
    showScreen('notes-screen');
}

// 更新地图进度
function updateMapProgress() {
    const totalCities = 7;
    const completed = GameState.completedCities.length;
    document.getElementById('progress-text').textContent = `进度: ${completed}/${totalCities}`;
    
    // 更新城市标记状态
    document.querySelectorAll('.city-marker').forEach(marker => {
        const cityKey = marker.getAttribute('data-city');
        marker.classList.remove('visited', 'current');
        
        if (GameState.completedCities.includes(cityKey)) {
            marker.classList.add('visited');
        }
    });
    
    // 高亮当前场景对应的城市
    if (currentScene) {
        const cityKey = GameData.scenes[currentScene].city;
        const currentMarker = document.querySelector(`[data-city="${cityKey}"]`);
        if (currentMarker && !GameState.completedCities.includes(cityKey)) {
            currentMarker.classList.add('current');
        }
    }
    
    // 更新资源显示
    updateResourceDisplay();
}

// 显示城市百科卡片
function showCityLoreCard(cityKey, canEnter) {
    const city = GameData.cities[cityKey];
    if (!city) return;
    
    const saturation = city.gospel_saturation || 0;
    const satInfo = GameData.gospelSaturationSystem.getSaturationLevel(saturation);
    const effects = GameData.gospelSaturationSystem.getSaturationEffects(saturation);
    
    const modal = document.createElement('div');
    modal.id = 'city-lore-modal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
            <div style="border-bottom: 2px solid #d4a574; padding-bottom: 15px; margin-bottom: 20px;">
                <h2 style="color: #5c4033; margin: 0;">${city.name} <span style="font-size: 0.6em; color: #8b7355;">${city.nameEn}</span></h2>
                <p style="color: #8b7355; margin: 5px 0 0 0; font-size: 14px;">${city.description}</p>
            </div>
            
            <!-- 福音饱和度 -->
            <div style="background: ${satInfo.color}15; border-left: 4px solid ${satInfo.color}; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="color: ${satInfo.color}; font-weight: bold;">📊 福音状况：${satInfo.name}</span>
                    <span style="font-size: 20px; font-weight: bold; color: ${satInfo.color};">${saturation}%</span>
                </div>
                <div style="background: #ddd; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 10px;">
                    <div style="background: ${satInfo.color}; height: 100%; width: ${saturation}%; transition: width 0.3s;"></div>
                </div>
                ${effects.length > 0 ? `
                    <p style="margin: 0; font-size: 12px; color: #666;">
                        ✨ ${effects.join('、')}
                    </p>
                ` : '<p style="margin: 0; font-size: 12px; color: #999;">继续传福音以提升状况...</p>'}
            </div>
            
            <!-- 城市特性 -->
            <div style="background: #f5f5dc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #5c4033; margin: 0 0 10px 0; font-size: 16px;">🌍 城市特性</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                    <div>
                        <span style="color: #8b7355;">民性：</span>
                        <span>${getTemperamentName(city.traits.people_temperament)}</span>
                    </div>
                    <div>
                        <span style="color: #8b7355;">敌对等级：</span>
                        <span>${'★'.repeat(city.traits.opposition_level)}${'☆'.repeat(5 - city.traits.opposition_level)}</span>
                    </div>
                    <div style="grid-column: 1/-1;">
                        <span style="color: #8b7355;">宗教背景：</span>
                        <span>${getReligiousBackgroundName(city.traits.religious_background)}</span>
                    </div>
                </div>
            </div>
            
            <!-- 民俗百科 -->
            <div style="margin-bottom: 20px;">
                <h3 style="color: #5c4033; margin: 0 0 15px 0; font-size: 16px;">📚 民俗百科</h3>
                
                <div style="margin-bottom: 15px;">
                    <h4 style="color: #8b4513; margin: 0 0 5px 0; font-size: 14px;">📍 地理位置</h4>
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #5c4033;">${city.lore.location}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <h4 style="color: #8b4513; margin: 0 0 5px 0; font-size: 14px;">🏛️ 风俗习惯</h4>
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #5c4033;">${city.lore.customs}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <h4 style="color: #8b4513; margin: 0 0 5px 0; font-size: 14px;">📖 历史背景</h4>
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #5c4033;">${city.lore.historical_note}</p>
                </div>
                
                <div style="background: #fff3e0; padding: 12px; border-radius: 6px; border-left: 3px solid #ff9800;">
                    <h4 style="color: #e65100; margin: 0 0 5px 0; font-size: 14px;">⚠️ 宣教挑战</h4>
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #5c4033;">${city.lore.challenge}</p>
                </div>
            </div>
            
            <!-- 按钮 -->
            <div style="display: flex; gap: 10px; justify-content: center; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                ${canEnter ? 
                    `<button id="btn-enter-city" class="btn-primary">进入城市</button>` :
                    `<button class="btn-secondary" disabled>需要先完成前置城市</button>`
                }
                <button id="btn-close-lore" class="btn-secondary">返回地图</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 绑定事件
    if (canEnter) {
        document.getElementById('btn-enter-city').addEventListener('click', () => {
            modal.remove();
            enterCityScene(cityKey);
        });
    }
    
    document.getElementById('btn-close-lore').addEventListener('click', () => {
        modal.remove();
    });
}

// 辅助函数：获取民性名称
function getTemperamentName(temperament) {
    const names = {
        'open': '开放包容',
        'mixed': '复杂多元',
        'curious': '好奇求知',
        'divided': '分裂对立',
        'fickle': '善变多疑',
        'receptive': '虚心受教',
        'welcoming': '热情欢迎'
    };
    return names[temperament] || temperament;
}

// 辅助函数：获取宗教背景名称
function getReligiousBackgroundName(background) {
    const names = {
        'jewish_christian': '犹太-基督教背景',
        'pagan_jewish': '异教-犹太混合',
        'jewish_godfearer': '犹太教与敬畏神者',
        'mixed': '多元宗教',
        'pagan': '异教背景',
        'open': '开放宗教环境',
        'christian': '基督教环境'
    };
    return names[background] || background;
}

// 处理城市点击
function handleCityClick(cityKey) {
    // 检查是否可以进入该城市
    const cityOrder = ['antioch', 'cyprus', 'pisidian', 'iconium', 'lystra', 'derbe', 'return'];
    const cityIndex = cityOrder.indexOf(cityKey);
    
    // 检查前置城市是否已完成
    let canEnter = true;
    for (let i = 0; i < cityIndex; i++) {
        if (!GameState.completedCities.includes(cityOrder[i])) {
            canEnter = false;
            break;
        }
    }
    
    // Phase 2: 先显示城市百科卡片
    showCityLoreCard(cityKey, canEnter || cityKey === 'antioch');
}

// 进入城市场景
function enterCityScene(cityKey) {
    const sceneKey = cityKey + '_start';
    if (GameData.scenes[sceneKey]) {
        loadScene(sceneKey);
    } else {
        // 如果没有start场景，找第一个该城市的场景
        for (let key in GameData.scenes) {
            if (GameData.scenes[key].city === cityKey) {
                loadScene(key);
                break;
            }
        }
    }
}

// 加载场景
function loadScene(sceneId) {
    currentScene = sceneId;
    const scene = GameData.scenes[sceneId];
    
    if (!scene) {
        console.error('Scene not found:', sceneId);
        return;
    }
    
    // 保存当前场景
    GameState.currentScene = sceneId;
    saveGame();
    
    // 根据场景类型处理
    switch(scene.type) {
        case 'dialog':
            loadDialogScene(scene);
            break;
        case 'search':
            loadSearchGame(scene);
            break;
        case 'memory':
            loadMemoryGame(scene);
            break;
        case 'puzzle':
            // 将解谜改为经文对决
            if (scene.gameData && scene.gameData.battleEnemy) {
                initScriptureDebate(scene.gameData.battleEnemy);
            } else {
                // 兼容旧版，使用原有解谜
                loadPuzzleGame(scene);
            }
            break;
        case 'spiritual_battle':
            // 经文对决类型
            initScriptureDebate(scene.gameData.battleEnemy);
            break;
        case 'quiz':
            startQuiz();
            break;
        default:
            loadDialogScene(scene);
    }
}

// 加载对话场景
function loadDialogScene(scene) {
    document.getElementById('location-name').textContent = scene.title;
    document.getElementById('dialog-text').textContent = scene.text;
    
    // 显示经文
    const verseBox = document.getElementById('verse-display');
    if (scene.verse && GameData.verses[scene.verse]) {
        const verse = GameData.verses[scene.verse];
        document.getElementById('verse-text').textContent = verse.text;
        document.getElementById('verse-reference').textContent = verse.reference;
        verseBox.style.display = 'block';
        
        // 检查是否已收藏
        const collectBtn = document.getElementById('btn-collect-verse');
        if (GameState.collectedVerses.includes(scene.verse)) {
            collectBtn.textContent = '已收藏';
            collectBtn.disabled = true;
        } else {
            collectBtn.textContent = '收藏经文';
            collectBtn.disabled = false;
        }
    } else {
        verseBox.style.display = 'none';
    }
    
    // 生成选项
    const choicesContainer = document.getElementById('choices-container');
    choicesContainer.innerHTML = '';
    
    scene.choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => handleChoice(choice));
        choicesContainer.appendChild(btn);
    });
    
    // 显示继续按钮（如果没有选项）
    const nextBtn = document.getElementById('btn-next');
    if (scene.choices.length === 0) {
        nextBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'none';
    }
    
    showScreen('scene-screen');
}

// 处理选项
function handleChoice(choice) {
    // 增加分数
    if (choice.score) {
        GameState.totalScore += choice.score;
    }
    
    // 检查是否前往下一个城市
    const currentSceneData = GameData.scenes[currentScene];
    const currentCity = currentSceneData.city;
    const nextScene = GameData.scenes[choice.next];
    
    if (nextScene && nextScene.city !== currentCity) {
        // 在城市间移动，触发旅行事件
        completeCity(currentCity);
        updateMapProgress();
        
        // 更新城市索引
        const cityOrder = ['antioch', 'cyprus', 'pisidian', 'iconium', 'lystra', 'derbe', 'return'];
        GameState.currentCityIndex = cityOrder.indexOf(nextScene.city);
        
        // 触发旅行事件
        triggerTravelEvent(currentCity, choice.next);
    } else {
        // 同城市内移动，直接加载场景
        loadScene(choice.next);
    }
}

// 处理下一步
function handleNextClick() {
    // 根据当前场景找到下一步
    // 这里简化处理，实际应该根据场景逻辑
    showScreen('map-screen');
}

// 收藏经文
function handleCollectVerse() {
    const scene = GameData.scenes[currentScene];
    if (scene && scene.verse) {
        if (collectVerse(scene.verse)) {
            document.getElementById('btn-collect-verse').textContent = '已收藏';
            document.getElementById('btn-collect-verse').disabled = true;
            showHint('经文已收藏到灵修笔记！');
        }
    }
}

// 加载经文搜索游戏
function loadSearchGame(scene) {
    const gameData = scene.gameData;
    document.getElementById('search-question').textContent = gameData.question;
    
    // 生成可选经文
    const textContainer = document.getElementById('search-text-content');
    textContainer.innerHTML = '';
    selectedSearchVerses = [];
    
    // 解析经文段落
    const lines = GameData.searchText.acts13.split('\n');
    lines.forEach((line, index) => {
        const span = document.createElement('span');
        span.className = 'verse-selectable';
        span.textContent = line + ' ';
        span.dataset.index = index;
        span.addEventListener('click', () => toggleVerseSelection(span, index));
        textContainer.appendChild(span);
    });
    
    // 保存游戏数据
    GameState.gameData.search = gameData;
    
    showScreen('search-game');
}

// 切换经文选择
function toggleVerseSelection(element, index) {
    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
        selectedSearchVerses = selectedSearchVerses.filter(i => i !== index);
    } else {
        element.classList.add('selected');
        selectedSearchVerses.push(index);
    }
    
    // 检查是否选对
    checkSearchAnswer();
}

// 检查搜索答案
function checkSearchAnswer() {
    const gameData = GameState.gameData.search;
    // 简化：检查是否选择了目标经文附近的行
    // 实际应该更精确地检查
    
    const feedback = document.getElementById('search-feedback');
    
    // 这里简化处理，假设选中任何经文都算作学习
    if (selectedSearchVerses.length > 0) {
        feedback.textContent = '很好！你正在探索经文。';
        feedback.className = 'feedback hint';
        
        // 3秒后自动通过
        setTimeout(() => {
            feedback.textContent = gameData.passText;
            feedback.className = 'feedback success';
            
            setTimeout(() => {
                // 标记当前城市完成
                const currentCity = GameData.scenes[currentScene].city;
                completeCity(currentCity);
                updateMapProgress();
                
                // 继续下一步
                loadScene(gameData.next);
            }, 2000);
        }, 3000);
    }
}

// 显示搜索提示
function showSearchHint() {
    showHint('仔细阅读经文，寻找关键词如"保罗"、"圣灵"、"说"等。');
}

// 跳过搜索游戏
function skipSearchGame() {
    const gameData = GameState.gameData.search;
    const currentCity = GameData.scenes[currentScene].city;
    completeCity(currentCity);
    updateMapProgress();
    loadScene(gameData.next);
}

// 加载记忆游戏
function loadMemoryGame(scene) {
    const gameData = scene.gameData;
    const verse = GameData.verses[gameData.verse];
    
    document.getElementById('memory-text').textContent = verse.text;
    document.getElementById('memory-ref').textContent = verse.reference;
    
    document.getElementById('memory-verse-display').style.display = 'block';
    document.getElementById('memory-test').style.display = 'none';
    document.getElementById('btn-show-verse').style.display = 'inline-block';
    document.getElementById('btn-start-test').style.display = 'none';
    document.getElementById('btn-check-memory').style.display = 'none';
    
    // 准备测试数据
    prepareMemoryTest(verse.text);
    
    // 保存游戏数据
    GameState.gameData.memory = gameData;
    
    showScreen('memory-game');
}

// 显示经文
function showMemoryVerse() {
    document.getElementById('memory-verse-display').style.display = 'block';
    document.getElementById('btn-show-verse').style.display = 'none';
    document.getElementById('btn-start-test').style.display = 'inline-block';
}

// 准备记忆测试
function prepareMemoryTest(verseText) {
    // 将经文分成单词/短语
    const words = verseText.split(/[，。、；：]/).filter(w => w.trim().length > 0);
    memoryWords = words.slice(0, 6); // 取前6个片段
    memorySelectedWords = new Array(memoryWords.length).fill(null);
    
    // 打乱顺序的选项
    const shuffledWords = [...memoryWords].sort(() => Math.random() - 0.5);
    
    // 创建填空
    const blanksContainer = document.getElementById('memory-blanks');
    blanksContainer.innerHTML = '';
    memoryWords.forEach((word, index) => {
        const blank = document.createElement('div');
        blank.className = 'word-blank';
        blank.dataset.index = index;
        blank.addEventListener('click', () => clearBlank(index));
        blanksContainer.appendChild(blank);
    });
    
    // 创建选项
    const optionsContainer = document.getElementById('memory-options');
    optionsContainer.innerHTML = '';
    shuffledWords.forEach((word, index) => {
        const option = document.createElement('button');
        option.className = 'word-option';
        option.textContent = word;
        option.dataset.word = word;
        option.addEventListener('click', () => selectWord(word, option));
        optionsContainer.appendChild(option);
    });
}

// 开始测试
function startMemoryTest() {
    document.getElementById('memory-verse-display').style.display = 'none';
    document.getElementById('memory-test').style.display = 'block';
    document.getElementById('btn-start-test').style.display = 'none';
    document.getElementById('btn-check-memory').style.display = 'inline-block';
}

// 选择单词
function selectWord(word, optionElement) {
    // 找到第一个空白的填空
    const emptyIndex = memorySelectedWords.findIndex(w => w === null);
    if (emptyIndex !== -1) {
        memorySelectedWords[emptyIndex] = word;
        
        // 更新填空显示
        const blank = document.querySelector(`.word-blank[data-index="${emptyIndex}"]`);
        blank.textContent = word;
        blank.classList.add('filled');
        
        // 标记选项已使用
        optionElement.classList.add('used');
    }
}

// 清除填空
function clearBlank(index) {
    if (memorySelectedWords[index]) {
        const word = memorySelectedWords[index];
        memorySelectedWords[index] = null;
        
        // 更新填空
        const blank = document.querySelector(`.word-blank[data-index="${index}"]`);
        blank.textContent = '';
        blank.classList.remove('filled');
        
        // 恢复选项
        const option = document.querySelector(`.word-option[data-word="${word}"]`);
        if (option) {
            option.classList.remove('used');
        }
    }
}

// 检查记忆答案
function checkMemoryAnswer() {
    const isCorrect = memorySelectedWords.every((word, index) => word === memoryWords[index]);
    
    const gameData = GameState.gameData.memory;
    
    if (isCorrect) {
        showHint('太棒了！你记住了这段经文。');
        
        // 收藏经文
        collectVerse(gameData.verse);
        
        setTimeout(() => {
            // 标记当前城市完成
            const currentCity = GameData.scenes[currentScene].city;
            completeCity(currentCity);
            updateMapProgress();
            
            loadScene(gameData.next);
        }, 2000);
    } else {
        showHint('再试试看！顺序可能不对。');
    }
}

// 加载解谜游戏
function loadPuzzleGame(scene) {
    const gameData = scene.gameData;
    
    // 显示问题
    let storyHTML = '';
    if (gameData.question) {
        storyHTML += `<h3 style="color: #5c4033; margin-bottom: 15px;">${gameData.question}</h3>`;
    }
    storyHTML += `<p>${gameData.story}</p>`;
    document.getElementById('puzzle-story').innerHTML = storyHTML;
    
    const cluesContainer = document.getElementById('puzzle-clues');
    cluesContainer.innerHTML = '<h4>思考线索：</h4>';
    gameData.clues.forEach((clue, index) => {
        const clueItem = document.createElement('div');
        clueItem.className = 'clue-item';
        clueItem.innerHTML = `<strong>线索 ${index + 1}：</strong>${clue}`;
        cluesContainer.appendChild(clueItem);
    });
    
    // 添加提示和跳过按钮
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = 'display: flex; gap: 10px; justify-content: center; margin-top: 15px;';
    controlsDiv.innerHTML = `
        <button id="btn-puzzle-hint" class="btn-secondary">需要提示</button>
        <button id="btn-puzzle-skip" class="btn-secondary">跳过此题</button>
    `;
    
    // 移除旧的控制按钮（如果存在）
    const oldControls = cluesContainer.querySelector('.puzzle-controls');
    if (oldControls) oldControls.remove();
    
    controlsDiv.className = 'puzzle-controls';
    cluesContainer.appendChild(controlsDiv);
    
    // 绑定按钮事件
    document.getElementById('btn-puzzle-hint').addEventListener('click', showPuzzleHint);
    document.getElementById('btn-puzzle-skip').addEventListener('click', skipPuzzleGame);
    
    document.getElementById('puzzle-answer').value = '';
    document.getElementById('puzzle-answer').placeholder = '请输入你的答案...';
    document.getElementById('puzzle-feedback').textContent = '';
    document.getElementById('puzzle-feedback').className = 'feedback';
    
    // 保存游戏数据
    GameState.gameData.puzzle = gameData;
    
    showScreen('puzzle-game');
}

// 检查解谜答案
function checkPuzzleAnswer() {
    const userAnswer = document.getElementById('puzzle-answer').value.trim();
    const gameData = GameState.gameData.puzzle;
    const feedback = document.getElementById('puzzle-feedback');
    
    if (!userAnswer) {
        feedback.textContent = '请输入答案后再提交。';
        feedback.className = 'feedback hint';
        return;
    }
    
    // 准备答案列表（支持单答案或多答案）
    const possibleAnswers = gameData.answers || [gameData.answer];
    
    // 检查答案（不区分大小写，允许部分匹配）
    let isCorrect = false;
    for (let answer of possibleAnswers) {
        const normalizedUser = userAnswer.toLowerCase().replace(/\s+/g, '');
        const normalizedAnswer = answer.toLowerCase().replace(/\s+/g, '');
        
        if (normalizedUser === normalizedAnswer ||
            normalizedUser.includes(normalizedAnswer) ||
            normalizedAnswer.includes(normalizedUser) ||
            calculateSimilarity(normalizedUser, normalizedAnswer) > 0.6) {
            isCorrect = true;
            break;
        }
    }
    
    if (isCorrect) {
        feedback.textContent = gameData.passText;
        feedback.className = 'feedback success';
        
        setTimeout(() => {
            // 标记当前城市完成
            const currentCity = GameData.scenes[currentScene].city;
            completeCity(currentCity);
            updateMapProgress();
            
            loadScene(gameData.next);
        }, 2000);
    } else {
        // 根据尝试次数给出不同的反馈
        const attemptCount = (GameState.gameData.puzzleAttempt || 0) + 1;
        GameState.gameData.puzzleAttempt = attemptCount;
        
        if (attemptCount === 1) {
            feedback.textContent = '答案不太对，再看看上面的线索提示。';
        } else if (attemptCount === 2) {
            feedback.textContent = '还是不对哦。可以点击"需要提示"按钮获得帮助。';
        } else {
            feedback.textContent = `已经尝试了${attemptCount}次。如果实在答不上来，可以点击"跳过此题"。`;
        }
        feedback.className = 'feedback error';
    }
}

// 计算字符串相似度（简单的编辑距离算法）
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const costs = [];
    for (let i = 0; i <= shorter.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= longer.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (shorter[i - 1] !== longer[j - 1]) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[longer.length] = lastValue;
    }
    
    return (longer.length - costs[longer.length]) / longer.length;
}

// 显示解谜提示
function showPuzzleHint() {
    const gameData = GameState.gameData.puzzle;
    if (gameData.hint) {
        showHint(gameData.hint);
    } else {
        showHint('仔细想想经文中的描述，答案就在使徒行传14章里。');
    }
}

// 跳过解谜游戏
function skipPuzzleGame() {
    if (confirm('确定要跳过这个谜题吗？你将错过这部分的学习内容，但不会影响游戏进度。')) {
        const gameData = GameState.gameData.puzzle;
        
        // 显示答案
        const feedback = document.getElementById('puzzle-feedback');
        feedback.innerHTML = `<strong>正确答案：</strong>${gameData.answers ? gameData.answers[0] : gameData.answer}<br>${gameData.passText}`;
        feedback.className = 'feedback hint';
        
        setTimeout(() => {
            // 标记当前城市完成
            const currentCity = GameData.scenes[currentScene].city;
            completeCity(currentCity);
            updateMapProgress();
            
            loadScene(gameData.next);
        }, 3000);
    }
}

// 开始测验
function startQuiz() {
    GameState.currentQuizIndex = 0;
    GameState.quizScore = 0;
    loadQuizQuestion();
}

// 加载测验题目
function loadQuizQuestion() {
    const question = GameData.quiz[GameState.currentQuizIndex];
    
    document.getElementById('quiz-progress').textContent = 
        `${GameState.currentQuizIndex + 1}/${GameData.quiz.length}`;
    document.getElementById('quiz-question').textContent = question.question;
    
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = option;
        btn.addEventListener('click', () => handleQuizAnswer(index));
        optionsContainer.appendChild(btn);
    });
    
    document.getElementById('quiz-feedback').textContent = '';
    document.getElementById('quiz-feedback').className = 'quiz-feedback';
    document.getElementById('btn-next-question').style.display = 'none';
    
    showScreen('quiz-screen');
}

// 处理测验答案
function handleQuizAnswer(selectedIndex) {
    const question = GameData.quiz[GameState.currentQuizIndex];
    const options = document.querySelectorAll('.quiz-option');
    const feedback = document.getElementById('quiz-feedback');
    
    // 禁用所有选项
    options.forEach(opt => opt.classList.add('disabled'));
    
    if (selectedIndex === question.correct) {
        options[selectedIndex].classList.add('correct');
        feedback.textContent = '正确！' + question.explanation;
        feedback.className = 'quiz-feedback success';
        GameState.quizScore++;
        GameState.totalScore += 20;
    } else {
        options[selectedIndex].classList.add('wrong');
        options[question.correct].classList.add('correct');
        feedback.textContent = '错误。' + question.explanation;
        feedback.className = 'quiz-feedback error';
    }
    
    // 显示下一题按钮
    document.getElementById('btn-next-question').style.display = 'inline-block';
}

// 下一题
function nextQuizQuestion() {
    GameState.currentQuizIndex++;
    
    if (GameState.currentQuizIndex < GameData.quiz.length) {
        loadQuizQuestion();
    } else {
        // 测验完成
        showCompletionScreen();
    }
}

// 显示完成界面
function showCompletionScreen() {
    const stats = document.getElementById('stats-display');
    stats.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${GameState.quizScore}/${GameData.quiz.length}</div>
            <div class="stat-label">测验得分</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${GameState.totalScore}</div>
            <div class="stat-label">总分数</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${GameState.collectedVerses.length}</div>
            <div class="stat-label">收藏经文</div>
        </div>
    `;
    
    showScreen('complete-screen');
    
    // 清除存档
    localStorage.removeItem(SAVE_KEY);
}

// 显示提示
function showHint(text) {
    document.getElementById('hint-text').textContent = text;
    showModal('hint-modal');
}

// 显示当前提示
function showCurrentHint() {
    if (currentScene) {
        const scene = GameData.scenes[currentScene];
        if (scene && scene.city) {
            const city = GameData.cities[scene.city];
            showHint(city.description);
        }
    }
}

// 显示菜单弹窗
function showMenuModal() {
    showModal('menu-modal');
}

// 显示弹窗
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

// 关闭弹窗
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}
