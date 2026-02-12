// 游戏主逻辑
let currentScene = null;
let selectedSearchVerses = [];
let memoryWords = [];
let memorySelectedWords = [];

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
    
    if (!canEnter && cityKey !== 'antioch') {
        showHint('你需要按顺序完成前面的城市才能进入这里。');
        return;
    }
    
    // 进入城市场景
    enterCityScene(cityKey);
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
            loadPuzzleGame(scene);
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
    
    // 检查是否完成城市
    const currentCity = GameData.scenes[currentScene].city;
    const nextScene = GameData.scenes[choice.next];
    
    if (nextScene && nextScene.city !== currentCity) {
        completeCity(currentCity);
        updateMapProgress();
    }
    
    // 加载下一个场景
    loadScene(choice.next);
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
