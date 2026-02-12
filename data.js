// 游戏数据 - 使徒行传13-14章内容
const GameData = {
    // 经文数据
    verses: {
        acts13_1: {
            text: "在安提阿的教会中，有几位先知和教师，就是巴拿巴和称呼尼结的西面、古利奈人路求，与分封之王希律同养的马念，并扫罗。他们事奉主、禁食的时候，圣灵说：要为我分派巴拿巴和扫罗，去做我召他们所做的工。",
            reference: "使徒行传 13:1-2"
        },
        acts13_3: {
            text: "于是禁食祷告，按手在他们头上，就打发他们去了。",
            reference: "使徒行传 13:3"
        },
        acts13_9: {
            text: "扫罗又名保罗，被圣灵充满，定睛看他，说：你这充满各样诡诈奸恶，魔鬼的儿子，众善的仇敌，你混乱主的正道还不止住吗？",
            reference: "使徒行传 13:9-10"
        },
        acts13_11: {
            text: "现在主的手加在你身上，你要瞎眼，暂且不见日光。他的眼睛立刻昏蒙黑暗，四下里求人拉着手领他。",
            reference: "使徒行传 13:11"
        },
        acts13_16: {
            text: "保罗站起来，举手，说：以色列人和一切敬畏神的人，请听。",
            reference: "使徒行传 13:16"
        },
        acts13_38: {
            text: "所以弟兄们，你们当晓得：赦罪的道是由这人传给你们的。你们靠摩西的律法，在一切不得称义的事上信靠这人，就都得称义了。",
            reference: "使徒行传 13:38-39"
        },
        acts14_8: {
            text: "路司得城里坐着一个两脚无力的人，生来是瘸腿的，从来没有走过。",
            reference: "使徒行传 14:8"
        },
        acts14_9: {
            text: "他听保罗讲道，保罗定睛看他，见他有信心，可得痊愈，就大声说：你起来，两脚站直！那人就跳起来，而且行走。",
            reference: "使徒行传 14:9-10"
        },
        acts14_11: {
            text: "众人看见保罗所做的事，就用吕高尼的话大声说：有神借着人形降临在我们中间了。",
            reference: "使徒行传 14:11"
        },
        acts14_15: {
            text: "诸君，为什么做这事呢？我们也是人，性情和你们一样。我们传福音给你们，是叫你们离弃这些虚妄，归向那创造天、地、海和其中万物的永生神。",
            reference: "使徒行传 14:15"
        },
        acts14_19: {
            text: "但有些犹太人从安提阿和以哥念来，挑唆众人，就用石头打保罗，以为他是死了，便拖到城外。",
            reference: "使徒行传 14:19"
        },
        acts14_20: {
            text: "门徒正围着他，他就起来，走进城去。第二天，同巴拿巴往特庇去。",
            reference: "使徒行传 14:20"
        },
        acts14_22: {
            text: "坚固门徒的心，劝他们恒守所信的道；又说：我们进入神的国，必须经历许多艰难。",
            reference: "使徒行传 14:22"
        }
    },

    // 城市数据
    cities: {
        antioch: {
            name: "安提阿",
            nameEn: "Antioch",
            description: "叙利亚的安提阿是保罗宣教旅程的起点。这里是早期基督教的重要中心，门徒被称为基督徒就是从这城里开始的。",
            scripture: "acts13_1",
            completed: false
        },
        cyprus: {
            name: "塞浦路斯",
            nameEn: "Cyprus",
            description: "保罗和巴拿巴首先来到塞浦路斯岛的撒拉米，在犹太人的各会堂里传讲神的道。随后去到帕弗，在那里遇到方伯士求保罗。",
            scripture: "acts13_9",
            completed: false
        },
        pisidian: {
            name: "彼西底安提阿",
            nameEn: "Pisidian Antioch",
            description: "保罗在这里的会堂中发表了著名的讲道，从以色列的历史讲起，见证耶稣就是基督。",
            scripture: "acts13_16",
            completed: false
        },
        iconium: {
            name: "以哥念",
            nameEn: "Iconium",
            description: "在以哥念，保罗和巴拿巴进入犹太人的会堂，放胆讲道，叫一大群犹太人和希腊人都信了主。",
            scripture: "acts13_38",
            completed: false
        },
        lystra: {
            name: "路司得",
            nameEn: "Lystra",
            description: "在路司得，保罗医治了一个生来瘸腿的人，但众人却误以为保罗和巴拿巴是神。后来有些犹太人挑唆众人用石头打保罗。",
            scripture: "acts14_9",
            completed: false
        },
        derbe: {
            name: "特庇",
            nameEn: "Derbe",
            description: "保罗和巴拿巴在特庇传福音，使很多人作了门徒。之后他们返回去坚固之前建立的教会。",
            scripture: "acts14_22",
            completed: false
        },
        return: {
            name: "返回安提阿",
            nameEn: "Return to Antioch",
            description: "保罗和巴拿巴完成了第一次宣教旅程，回到叙利亚的安提阿，向教会报告神所行的一切事。",
            scripture: "acts14_22",
            completed: false
        }
    },

    // 场景数据 - 第一次宣教旅程
    scenes: {
        // 安提阿 - 旅程起点
        antioch_start: {
            id: "antioch_start",
            city: "antioch",
            title: "圣灵差派",
            text: "你现在是使徒保罗。在安提阿的教会中，有几位先知和教师正在事奉主。当你和巴拿巴禁食祷告时，突然感到圣灵的感动...",
            verse: "acts13_1",
            choices: [
                { text: "顺服圣灵的呼召", next: "antioch_pray", score: 10 },
                { text: "询问更多细节", next: "antioch_question", score: 5 }
            ],
            type: "dialog"
        },
        antioch_question: {
            id: "antioch_question",
            city: "antioch",
            title: "寻求确认",
            text: "巴拿巴对你说：'扫罗，我也感到圣灵的印证。这是神的时候，我们要为主去！' 会众 fasting 祷告后，按手在你们头上，差派你们出去。",
            verse: "acts13_3",
            choices: [
                { text: "接受差派", next: "cyprus_arrive", score: 10 }
            ],
            type: "dialog"
        },
        antioch_pray: {
            id: "antioch_pray",
            city: "antioch",
            title: "接受差派",
            text: "会众禁食祷告，按手在你们头上，就打发你们去了。你和巴拿巴带着主的托付，开始了宣教旅程。",
            verse: "acts13_3",
            choices: [
                { text: "启程前往塞浦路斯", next: "cyprus_arrive", score: 10 }
            ],
            type: "dialog"
        },

        // 塞浦路斯
        cyprus_arrive: {
            id: "cyprus_arrive",
            city: "cyprus",
            title: "来到塞浦路斯",
            text: "你们从西流基坐船来到塞浦路斯，先在撒拉米传讲神的道。随后去到帕弗，在那里遇到方伯士求保罗。他是一个聪明人，请巴拿巴和你说说神的道。但有一个假先知巴耶稣（又名以吕马）抵挡你们。",
            verse: null,
            choices: [
                { text: "开始寻找经文挑战", next: "cyprus_search_game", score: 0 }
            ],
            type: "dialog"
        },
        cyprus_search_game: {
            id: "cyprus_search_game",
            city: "cyprus",
            title: "经文搜索挑战",
            text: "保罗被圣灵充满，面对假先知的抵挡。请从使徒行传13章中找到保罗对方伯说的话。",
            verse: null,
            choices: [],
            type: "search",
            gameData: {
                question: "保罗被圣灵充满时，对假先知巴耶稣说了什么？",
                targetVerse: "acts13_9",
                passText: "你找到了！保罗说：'你这充满各样诡诈奸恶，魔鬼的儿子，众善的仇敌...'",
                next: "cyprus_miracle"
            }
        },
        cyprus_miracle: {
            id: "cyprus_miracle",
            city: "cyprus",
            title: "神迹发生",
            text: "因为你的话，方伯士求保罗立刻眼睛昏蒙黑暗，四下里求人拉着手领他。方伯看见所做的事，很稀奇主的道，就信了主。",
            verse: "acts13_11",
            choices: [
                { text: "继续前行", next: "pisidian_arrive", score: 10 }
            ],
            type: "dialog"
        },

        // 彼西底安提阿
        pisidian_arrive: {
            id: "pisidian_arrive",
            city: "pisidian",
            title: "彼西底安提阿",
            text: "你们来到彼西底的安提阿。安息日，你们进了会堂坐下。读完了律法和先知的书，管会堂的叫人过去，对他们说：'二位兄台，若有什么劝勉众人的话，请说。'",
            verse: null,
            choices: [
                { text: "站起来讲道", next: "pisidian_sermon", score: 10 }
            ],
            type: "dialog"
        },
        pisidian_sermon: {
            id: "pisidian_sermon",
            city: "pisidian",
            title: "会堂讲道",
            text: "你站起来，从以色列民在埃及寄居的历史讲起，讲到士师、先知，直到神兴起大卫王。然后你见证：'从这孩子后裔中，神已经照着所应许的，为以色列人立了一位救主，就是耶稣。'",
            verse: "acts13_16",
            choices: [
                { text: "继续讲述救恩", next: "pisidian_gospel", score: 10 }
            ],
            type: "dialog"
        },
        pisidian_gospel: {
            id: "pisidian_gospel",
            city: "pisidian",
            title: "赦罪的道",
            text: "你告诉众人：'赦罪的道是由这人传给你们的。你们靠摩西的律法，在一切不得称义的事上信靠这人，就都得称义了。' 众人走的时候，切切地求你们下个安息日再讲这话给他们听。",
            verse: "acts13_38",
            choices: [
                { text: "接受邀请", next: "pisidian_memory_game", score: 10 }
            ],
            type: "dialog"
        },
        pisidian_memory_game: {
            id: "pisidian_memory_game",
            city: "pisidian",
            title: "经文记忆挑战",
            text: "这段经文非常重要，让我们记住它！",
            verse: "acts13_38",
            choices: [],
            type: "memory",
            gameData: {
                verse: "acts13_38",
                next: "iconium_arrive"
            }
        },

        // 以哥念
        iconium_arrive: {
            id: "iconium_arrive",
            city: "iconium",
            title: "以哥念的果效",
            text: "到了以哥念，你们像以前一样进入犹太人的会堂，放胆讲道，叫一大群犹太人和希腊人都信了主。但那些不顺从的犹太人耸动外邦人，叫他们心里恼恨弟兄。",
            verse: null,
            choices: [
                { text: "面对逼迫", next: "iconium_persecution", score: 10 }
            ],
            type: "dialog"
        },
        iconium_persecution: {
            id: "iconium_persecution",
            city: "iconium",
            title: "坚定信心",
            text: "你们住了多日，倚靠主放胆讲道；主借他们的手施行神迹奇事，证明他的恩道。城中的众人就分裂了，有附从犹太人的，有附从使徒的。外邦人和犹太人同他们的官长要凌辱使徒，用石头打他们。",
            verse: null,
            choices: [
                { text: "逃往路司得", next: "lystra_arrive", score: 10 }
            ],
            type: "dialog"
        },

        // 路司得
        lystra_arrive: {
            id: "lystra_arrive",
            city: "lystra",
            title: "来到路司得",
            text: "你们来到路司得。城里坐着一个两脚无力的人，生来是瘸腿的，从来没有走过。他听保罗讲道，保罗定睛看他...",
            verse: "acts14_8",
            choices: [
                { text: "观察他的信心", next: "lystra_puzzle", score: 10 }
            ],
            type: "dialog"
        },
        lystra_puzzle: {
            id: "lystra_puzzle",
            city: "lystra",
            title: "解谜挑战",
            text: "保罗看见这个瘸腿的人有信心，决定医治他。但这个场景有几个关键要素，你能找出来吗？",
            verse: null,
            choices: [],
            type: "puzzle",
            gameData: {
                question: "医治后，这个瘸腿的人做了什么动作？",
                story: "保罗在路司得遇见一个生来瘸腿的人，这人从来没有走过路。保罗对他说：'你起来，两脚站直！'",
                clues: [
                    "保罗对他说了什么？（提示：两个字）",
                    "那人听了之后立刻做出什么反应？（提示：向上）",
                    "之后他就能做什么了？（提示：移动）"
                ],
                answers: ["跳起来行走", "跳起来", "起来行走", "行走", "站起来行走", "起来走"],
                hint: "答案包含两个连续的动作：先向上跳起，然后开始行走。参考使徒行传14:10",
                passText: "正确！保罗说：'你起来，两脚站直！'那人就跳起来，而且行走。",
                next: "lystra_crowd"
            }
        },
        lystra_crowd: {
            id: "lystra_crowd",
            city: "lystra",
            title: "群众的反应",
            text: "众人看见所做的事，就用吕高尼的话大声说：'有神借着人形降临在我们中间了。' 于是称巴拿巴为宙斯，称保罗为赫尔墨斯，因为保罗是带头的说话者。城外的宙斯庙的祭司牵着牛，拿着花圈来到门前，要同众人向使徒献祭。",
            verse: "acts14_11",
            choices: [
                { text: "撕裂衣服阻止他们", next: "lystra_correct", score: 10 }
            ],
            type: "dialog"
        },
        lystra_correct: {
            id: "lystra_correct",
            city: "lystra",
            title: "纠正错误",
            text: "你和巴拿巴听见，就撕开衣裳，跳进众人中间，喊着说：'诸君，为什么做这事呢？我们也是人，性情和你们一样。我们传福音给你们，是叫你们离弃这些虚妄，归向那创造天、地、海和其中万物的永生神。'",
            verse: "acts14_15",
            choices: [
                { text: "继续坚固信徒", next: "lystra_stoning", score: 10 }
            ],
            type: "dialog"
        },
        lystra_stoning: {
            id: "lystra_stoning",
            city: "lystra",
            title: "被石头打",
            text: "但有些犹太人从安提阿和以哥念来，挑唆众人，就用石头打保罗，以为他是死了，便拖到城外。门徒正围着他，他就起来，走进城去。",
            verse: "acts14_19",
            choices: [
                { text: "第二天前往特庇", next: "derbe_arrive", score: 10 }
            ],
            type: "dialog"
        },

        // 特庇
        derbe_arrive: {
            id: "derbe_arrive",
            city: "derbe",
            title: "来到特庇",
            text: "第二天，你们同巴拿巴往特庇去。在那里传福音，使很多人作了门徒。",
            verse: null,
            choices: [
                { text: "坚固门徒", next: "derbe_return", score: 10 }
            ],
            type: "dialog"
        },
        derbe_return: {
            id: "derbe_return",
            city: "derbe",
            title: "坚固教会",
            text: "然后你们回到路司得、以哥念、安提阿，坚固门徒的心，劝他们恒守所信的道；又说：'我们进入神的国，必须经历许多艰难。'",
            verse: "acts14_22",
            choices: [
                { text: "推选长老", next: "return_journey", score: 10 }
            ],
            type: "dialog"
        },

        // 返回
        return_journey: {
            id: "return_journey",
            city: "return",
            title: "返回安提阿",
            text: "二人在各教会中选立了长老，又禁食祷告，就把他们交托所信的主。他们从别加往前行，来到亚大利，从那里坐船来到安提阿。",
            verse: null,
            choices: [
                { text: "向教会报告", next: "final_report", score: 10 }
            ],
            type: "dialog"
        },
        final_report: {
            id: "final_report",
            city: "return",
            title: "宣教报告",
            text: "到了那里，聚集了会众，就述说神借他们所行的一切事，并神怎样为外邦人开了信心的门。众人就在那里住了多日。",
            verse: "acts14_22",
            choices: [
                { text: "完成第一章测验", next: "quiz_start", score: 10 }
            ],
            type: "dialog"
        },

        // 测验
        quiz_start: {
            id: "quiz_start",
            city: "return",
            title: "第一章测验",
            text: "准备好接受测验了吗？这将检验你对保罗第一次宣教旅程的了解。",
            verse: null,
            choices: [],
            type: "quiz"
        }
    },

    // 测验题目
    quiz: [
        {
            question: "保罗第一次宣教旅程的起点是哪里？",
            options: ["耶路撒冷", "安提阿", "塞浦路斯", "大马色"],
            correct: 1,
            explanation: "正确！使徒行传13:1记载，保罗和巴拿巴从叙利亚的安提阿出发。"
        },
        {
            question: "在塞浦路斯，保罗用什么方式证明真道，使方伯信了主？",
            options: ["医治瘸腿的", "叫假先知瞎眼", "行大风暴","叫死人复活"],
            correct: 1,
            explanation: "正确！保罗被圣灵充满，叫抵挡真道的假先知巴耶稣瞎了眼（徒13:11）。"
        },
        {
            question: "在路司得，保罗医治了生来瘸腿的人后，群众认为他们是什么？",
            options: ["先知", "天使", "神", "魔鬼"],
            correct: 2,
            explanation: "正确！众人以为有神借着人形降临在他们中间，称巴拿巴为宙斯，保罗为赫尔墨斯（徒14:11-12）。"
        },
        {
            question: "保罗在第一次宣教旅程中对门徒说：'我们进入神的国，必须经历什么？'",
            options: ["许多艰难", "很多金钱", "高等教育", "政治权力"],
            correct: 0,
            explanation: "正确！使徒行传14:22记载：'我们进入神的国，必须经历许多艰难。'"
        },
        {
            question: "保罗第一次宣教旅程主要去了哪个地区？",
            options: ["欧洲", "亚洲", "加拉太地区", "埃及"],
            correct: 2,
            explanation: "正确！保罗主要在小亚细亚的加拉太地区传道，包括彼西底安提阿、以哥念、路司得、特庇等城市。"
        }
    ],

    // 经文搜索游戏文本
    searchText: {
        acts13: `13:1 在安提阿的教会中，有几位先知和教师，就是巴拿巴和称呼尼结的西面、古利奈人路求，与分封之王希律同养的马念，并扫罗。
13:2 他们事奉主、禁食的时候，圣灵说：要为我分派巴拿巴和扫罗，去做我召他们所做的工。
13:3 于是禁食祷告，按手在他们头上，就打发他们去了。
13:4 他们既被圣灵差遣，就下到西流基，从那里坐船往塞浦路斯去。
13:5 到了撒拉米，就在犹太人各会堂里传讲神的道，也有约翰作他们的帮手。
13:6 经过全岛，直到帕弗，在那里遇见一个有法术、假充先知的犹太人，名叫巴耶稣。
13:7 这人常和方伯士求保罗同在。士求保罗是个通达人，他请了巴拿巴和扫罗来，要听神的道。
13:8 只是那行法术的以吕马（这名翻出来就是行法术的意思）抵挡使徒，要叫方伯不信真道。
13:9 扫罗又名保罗，被圣灵充满，定睛看他，
13:10 说：你这充满各样诡诈奸恶，魔鬼的儿子，众善的仇敌，你混乱主的正道还不止住吗？
13:11 现在主的手加在你身上，你要瞎眼，暂且不见日光。他的眼睛立刻昏蒙黑暗，四下里求人拉着手领他。`,
        
        acts14: `14:8 路司得城里坐着一个两脚无力的人，生来是瘸腿的，从来没有走过。
14:9 他听保罗讲道，保罗定睛看他，见他有信心，可得痊愈，
14:10 就大声说：你起来，两脚站直！那人就跳起来，而且行走。
14:11 众人看见保罗所做的事，就用吕高尼的话大声说：有神借着人形降临在我们中间了。
14:12 于是称巴拿巴为宙斯，称保罗为赫尔墨斯，因为他说话领首。
14:13 城外的宙斯庙的祭司牵着牛，拿着花圈来到门前，要同众人向使徒献祭。
14:14 巴拿巴、保罗二使徒听见，就撕开衣裳，跳进众人中间，喊着说：
14:15 诸君，为什么做这事呢？我们也是人，性情和你们一样。我们传福音给你们，是叫你们离弃这些虚妄，归向那创造天、地、海和其中万物的永生神。`
    }
};

// 游戏状态管理
const GameState = {
    currentScene: 'antioch_start',
    completedCities: [],
    collectedVerses: [],
    quizScore: 0,
    currentQuizIndex: 0,
    totalScore: 0,
    gameData: {}
};

// 本地存储键名
const SAVE_KEY = 'paulJourney_saveData_chapter1';

// 保存游戏
function saveGame() {
    const saveData = {
        currentScene: GameState.currentScene,
        completedCities: GameState.completedCities,
        collectedVerses: GameState.collectedVerses,
        totalScore: GameState.totalScore,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
}

// 加载游戏
function loadGame() {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (saveData) {
        const data = JSON.parse(saveData);
        GameState.currentScene = data.currentScene || 'antioch_start';
        GameState.completedCities = data.completedCities || [];
        GameState.collectedVerses = data.collectedVerses || [];
        GameState.totalScore = data.totalScore || 0;
        return true;
    }
    return false;
}

// 检查是否有存档
function hasSaveData() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

// 清空存档
function clearSaveData() {
    localStorage.removeItem(SAVE_KEY);
    GameState.currentScene = 'antioch_start';
    GameState.completedCities = [];
    GameState.collectedVerses = [];
    GameState.totalScore = 0;
}

// 收藏经文
function collectVerse(verseKey) {
    if (!GameState.collectedVerses.includes(verseKey)) {
        GameState.collectedVerses.push(verseKey);
        saveGame();
        return true;
    }
    return false;
}

// 标记城市完成
function completeCity(cityKey) {
    if (!GameState.completedCities.includes(cityKey)) {
        GameState.completedCities.push(cityKey);
        saveGame();
    }
}
