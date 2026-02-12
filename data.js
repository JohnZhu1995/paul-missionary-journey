// 游戏数据 - 使徒行传13-14章内容
const GameData = {
    // 经文数据 - 属灵装备系统
    verses: {
        acts13_1: {
            text: "在安提阿的教会中，有几位先知和教师...圣灵说：要为我分派巴拿巴和扫罗，去做我召他们所做的工。",
            reference: "使徒行传 13:1-2",
            // 属灵装备属性
            type: "calling",           // 装备类型：呼召类
            power: "divine_mandate",   // 能力：神圣差派的权柄
            description: "当面对质疑你身份和权柄的人时，引用此经文证明你是被圣灵差派的。",
            usage: "在需要证明身份合法性或开启新事工时，引用此经文。",
            strength: 25,              // 属灵力量值
            consume: false,            // 是否消耗（核心经文不消耗）
            usedIn: ["antioch_debate", "authority_challenge"], // 适用场景
            effect: {                  // 使用效果
                faith: 15,             // 恢复信念
                influence: 10          // 增加影响力
            }
        },
        acts13_3: {
            text: "于是禁食祷告，按手在他们头上，就打发他们去了。",
            reference: "使徒行传 13:3",
            type: "preparation",       // 预备类
            power: "spiritual_ready",  // 能力：属灵预备
            description: "禁食祷告后的权柄，在面对艰难前使用，可获得额外力量。",
            usage: "在即将面临重大挑战或旅行前，引用此经文预备心灵。",
            strength: 15,
            consume: false,
            usedIn: ["before_battle", "before_travel"],
            effect: {
                faith: 20,
                supplies: 10
            }
        },
        acts13_9: {
            text: "扫罗又名保罗，被圣灵充满，定睛看他，说：你这充满各样诡诈奸恶，魔鬼的儿子，众善的仇敌...",
            reference: "使徒行传 13:9-10",
            type: "authority",         // 权柄类
            power: "rebuke_evil",      // 能力：斥责邪恶
            description: "面对假先知或抵挡真理的人时，引用此经文直接斥责。",
            usage: "在遭遇假先知、抵挡者或需要彰显属灵权柄时使用。",
            strength: 35,
            consume: true,             // 消耗型经文（使用次数有限）
            maxUses: 3,               // 最大使用次数
            usedIn: ["false_prophet", "spiritual_warfare"],
            effect: {
                influence: 20,
                enemy_resistance: -40  // 降低敌人抵抗力
            }
        },
        acts13_11: {
            text: "现在主的手加在你身上，你要瞎眼，暂且不见日光...",
            reference: "使徒行传 13:11",
            type: "judgment",          // 审判类
            power: "divine_judgment",  // 能力：神圣审判
            description: "当面对顽固抵挡真理的敌人时，引用此经文宣告审判。",
            usage: "对付极端顽固的抵挡者，但会消耗大量信念。",
            strength: 50,
            consume: true,
            maxUses: 2,
            usedIn: ["severe_opposition"],
            effect: {
                faith: -15,            // 消耗信念
                enemy_resistance: -80, // 大幅降低敌人抵抗
                influence: 30
            }
        },
        acts13_16: {
            text: "保罗站起来，举手，说：以色列人和一切敬畏神的人，请听。",
            reference: "使徒行传 13:16",
            type: "preaching",         // 讲道类
            power: "open_doors",       // 能力：开启听道之门
            description: "在会堂或公开场合开始传讲时引用，为话语铺路。",
            usage: "在犹太人会堂、公共集会或向陌生人传福音时使用。",
            strength: 20,
            consume: false,
            usedIn: ["synagogue", "public_preaching", "new_city"],
            effect: {
                influence: 15
            }
        },
        acts13_38: {
            text: "所以弟兄们，你们当晓得：赦罪的道是由这人传给你们的...",
            reference: "使徒行传 13:38-39",
            type: "gospel",            // 福音类
            power: "salvation_message", // 能力：救恩信息
            description: "传讲救恩核心时使用，这是最锋利的灵魂收割工具。",
            usage: "向寻求真理的人、犹太教徒或外邦人传福音时使用。",
            strength: 40,
            consume: true,
            maxUses: 5,
            usedIn: ["seeker", "jewish_audience", "gospel_moment"],
            effect: {
                faith: 25,
                influence: 30,
                gospel_saturation: 20   // 增加城市福音饱和度
            }
        },
        acts14_8: {
            text: "路司得城里坐着一个两脚无力的人，生来是瘸腿的，从来没有走过。",
            reference: "使徒行传 14:8",
            type: "observation",       // 观察类
            power: "discern_faith",    // 能力：辨别信心
            description: "在施行医治或神迹前，引用此经文观察对方的信心。",
            usage: "面对需要医治的人，先辨别其是否有信心。",
            strength: 15,
            consume: false,
            usedIn: ["healing_moment", "miracle_prep"],
            effect: {
                miracle_success: 0.2   // 增加神迹成功率
            }
        },
        acts14_9: {
            text: "...见他有信心，可得痊愈，就大声说：你起来，两脚站直！那人就跳起来，而且行走。",
            reference: "使徒行传 14:9-10",
            type: "miracle",           // 神迹类
            power: "healing",          // 能力：医治
            description: "施行医治神迹时使用，彰显神的大能。",
            usage: "面对瘸腿、病人或需要身体医治的人时使用。",
            strength: 45,
            consume: true,
            maxUses: 3,
            usedIn: ["healing", "miracle", "lystra"],
            effect: {
                faith: 20,
                influence: 40,
                gospel_saturation: 30
            }
        },
        acts14_11: {
            text: "众人看见保罗所做的事，就用吕高尼的话大声说：有神借着人形降临在我们中间了。",
            reference: "使徒行传 14:11",
            type: "warning",           // 警戒类
            power: "prevent_idolatry", // 能力：防止偶像崇拜
            description: "当人们要将你当作神时，引用此经文及时纠正。",
            usage: "在发生误解、人们要过度尊崇你时使用，防止偶像崇拜。",
            strength: 30,
            consume: true,
            maxUses: 2,
            usedIn: ["misunderstanding", "idolatry_risk", "lystra_crowd"],
            effect: {
                faith: 10,
                prevent_disaster: true  // 防止灾难性后果
            }
        },
        acts14_15: {
            text: "诸君，为什么做这事呢？我们也是人，性情和你们一样。我们传福音给你们，是叫你们离弃这些虚妄，归向那创造天、地、海...的永生神。",
            reference: "使徒行传 14:15",
            type: "correction",        // 纠正类
            power: "humility_witness", // 能力：谦卑见证
            description: "纠正误解、拒绝不当敬拜时，引用此经文表明身份。",
            usage: "在被当作神、拒绝献祭或需要表明人性和使命时使用。",
            strength: 35,
            consume: true,
            maxUses: 3,
            usedIn: ["correction", "reject_worship", "lystra"],
            effect: {
                faith: 15,
                influence: 20,
                gospel_saturation: 15
            }
        },
        acts14_19: {
            text: "但有些犹太人从安提阿和以哥念来，挑唆众人，就用石头打保罗，以为他是死了，便拖到城外。",
            reference: "使徒行传 14:19",
            type: "persecution",       // 逼迫类
            power: "endure_suffering", // 能力：忍受苦难
            description: "在遭受逼迫、打击时引用此经文，获得忍耐的力量。",
            usage: "面对石头、逼迫、被赶出城或被认为已死时使用。",
            strength: 30,
            consume: true,
            maxUses: 2,
            usedIn: ["stoning", "severe_persecution", "death_moment"],
            effect: {
                faith: 30,             // 大量恢复信念
                survival: true         // 生存标记
            }
        },
        acts14_20: {
            text: "门徒正围着他，他就起来，走进城去。第二天，同巴拿巴往特庇去。",
            reference: "使徒行传 14:20",
            type: "resurrection",      // 复活类
            power: "rise_again",       // 能力：重新站立
            description: "在死而复生、重新得力后引用此经文，继续使命。",
            usage: "禁食祷告后、从濒死状态恢复后，继续前行时使用。",
            strength: 40,
            consume: false,            // 关键转折经文不消耗
            usedIn: ["after_fasting", "recovery", "continue_journey"],
            effect: {
                faith: 50,             // 大量恢复
                supplies: 20,
                influence: 15
            }
        },
        acts14_22: {
            text: "坚固门徒的心，劝他们恒守所信的道；又说：我们进入神的国，必须经历许多艰难。",
            reference: "使徒行传 14:22",
            type: "exhortation",       // 劝勉类
            power: "strengthen_church", // 能力：坚固教会
            description: "在建立教会、坚固门徒时引用此经文，是最宝贵的牧养工具。",
            usage: "在建立教会、坚固信徒、劝勉门徒恒守真道时使用。",
            strength: 35,
            consume: true,
            maxUses: 4,
            usedIn: ["church_building", "disciple_making", "final_encouragement"],
            effect: {
                faith: 20,
                influence: 25,
                church_strength: 20    // 增加教会稳固度
            }
        }
    },

    // 城市数据 - 带民俗百科和福音饱和度
    cities: {
        antioch: {
            name: "安提阿",
            nameEn: "Antioch",
            description: "叙利亚的安提阿是保罗宣教旅程的起点。这里是早期基督教的重要中心，门徒被称为基督徒就是从这城里开始的。",
            scripture: "acts13_1",
            completed: false,
            gospel_saturation: 0,  // 福音饱和度 (0-100)
            traits: {
                people_temperament: "open",      // 民性：开放
                opposition_level: 1,             // 敌对等级
                religious_background: "jewish_christian"  // 宗教背景
            },
            lore: {
                location: "叙利亚的安提阿位于奥龙特斯河畔，是罗马帝国第三大城市。",
                customs: "这里汇集了希腊文化、犹太传统和东方神秘主义。市集上各种语言交织，商品琳琅满目。",
                historical_note: "安提阿的教会是外邦人基督徒的摇篮，也是第一次宣教旅程的策源地。",
                challenge: "这里的犹太会堂相对开放，但外邦人的偶像崇拜也十分盛行。"
            }
        },
        cyprus: {
            name: "塞浦路斯",
            nameEn: "Cyprus",
            description: "保罗和巴拿巴首先来到塞浦路斯岛的撒拉米，在犹太人的各会堂里传讲神的道。随后去到帕弗，在那里遇到方伯士求保罗。",
            scripture: "acts13_9",
            completed: false,
            gospel_saturation: 0,
            traits: {
                people_temperament: "mixed",
                opposition_level: 2,
                religious_background: "pagan_jewish"
            },
            lore: {
                location: "塞浦路斯是地中海东部的大岛，以铜矿闻名。",
                customs: "岛上居民崇拜阿佛洛狄忒女神，帕弗有著名的阿佛洛狄忒神庙。同时也有大量犹太侨民。",
                historical_note: "这里是巴拿巴的故乡。罗马总督方伯士求保罗是这里的最高行政长官。",
                challenge: "方伯虽然通情达理，但假先知巴耶稣（以吕马）却试图阻挡福音。"
            }
        },
        pisidian: {
            name: "彼西底安提阿",
            nameEn: "Pisidian Antioch",
            description: "保罗在这里的会堂中发表了著名的讲道，从以色列的历史讲起，见证耶稣就是基督。",
            scripture: "acts13_16",
            completed: false,
            gospel_saturation: 0,
            traits: {
                people_temperament: "curious",
                opposition_level: 3,
                religious_background: "jewish_godfearer"
            },
            lore: {
                location: "位于小亚细亚高原的彼西底地区，是重要的军事殖民地。",
                customs: "这里有许多敬畏神的外邦人（God-fearers），他们敬拜犹太人的神但不受割礼。安息日的会堂敬拜很热闹。",
                historical_note: "保罗在会堂中的讲道是从以色列历史到基督的完整救赎叙事，成为后世宣教讲道的模板。",
                challenge: "起初众人热情高涨，但随后犹太人的嫉妒引发了逼迫。"
            }
        },
        iconium: {
            name: "以哥念",
            nameEn: "Iconium",
            description: "在以哥念，保罗和巴拿巴进入犹太人的会堂，放胆讲道，叫一大群犹太人和希腊人都信了主。",
            scripture: "acts13_38",
            completed: false,
            gospel_saturation: 0,
            traits: {
                people_temperament: "divided",
                opposition_level: 4,
                religious_background: "mixed"
            },
            lore: {
                location: "吕高尼地区的重要城市，位于丝绸之路的要道上。",
                customs: "城中居民分为两派：附从犹太人的和附从使徒的。外邦人和犹太人之间的关系紧张。",
                historical_note: "保罗和巴拿巴在这里住了多日，神借他们手施行神迹奇事。",
                challenge: "城中的分裂最终演变成暴力威胁，官长也参与其中。"
            }
        },
        lystra: {
            name: "路司得",
            nameEn: "Lystra",
            description: "在路司得，保罗医治了一个生来瘸腿的人，但众人却误以为保罗和巴拿巴是神。后来有些犹太人挑唆众人用石头打保罗。",
            scripture: "acts14_9",
            completed: false,
            gospel_saturation: 0,
            traits: {
                people_temperament: "fickle",
                opposition_level: 5,
                religious_background: "pagan"
            },
            lore: {
                location: "位于吕高尼地区的一个小城镇，以农业为主。",
                customs: "当地居民使用吕高尼方言，崇拜宙斯和赫尔墨斯。城外有宙斯庙，祭司经常牵着牛来献祭。",
                historical_note: "保罗在这里经历了从被当作神敬拜到被石头打的极端起伏，是最戏剧性的城市。",
                challenge: "外邦人的迷信和犹太人的逼迫交织在一起，使这里成为最危险的宣教地。"
            }
        },
        derbe: {
            name: "特庇",
            nameEn: "Derbe",
            description: "保罗和巴拿巴在特庇传福音，使很多人作了门徒。之后他们返回去坚固之前建立的教会。",
            scripture: "acts14_22",
            completed: false,
            gospel_saturation: 0,
            traits: {
                people_temperament: "receptive",
                opposition_level: 2,
                religious_background: "open"
            },
            lore: {
                location: "位于路司得以东的边境城市，是这一带传福音的最后一站。",
                customs: "相比其他城市，这里的居民更加单纯、开放，对新的教导接受度较高。",
                historical_note: "保罗在这里建立了稳固的门徒群体，并在此建立了长老制度。",
                challenge: "虽然这里没有激烈的逼迫，但新信徒需要坚固，以免被假教师迷惑。"
            }
        },
        return: {
            name: "返回安提阿",
            nameEn: "Return to Antioch",
            description: "保罗和巴拿巴完成了第一次宣教旅程，回到叙利亚的安提阿，向教会报告神所行的一切事。",
            scripture: "acts14_22",
            completed: false,
            gospel_saturation: 0,
            traits: {
                people_temperament: "welcoming",
                opposition_level: 0,
                religious_background: "christian"
            },
            lore: {
                location: "回到宣教旅程的起点——叙利亚的安提阿。",
                customs: "这里的教会 eagerly 等待着保罗和巴拿巴的归来，准备听他们报告神借着他们在外邦人中所行的一切事。",
                historical_note: "这次报告标志着第一次宣教旅程的圆满结束，也为第二次旅程奠定了基础。",
                challenge: "尽管外邦人归主的消息令人兴奋，但也有人质疑保罗的做法，需要智慧来回应。"
            }
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
            text: "你们住了多日，倚靠主放胆讲道；主借他们的手施行神迹奇事，证明他的恩道。城中的众人就分裂了，有附从犹太人的，有附从使徒的。外邦人和犹太人同他们的官长要凌辱使徒，用石头打他们。一场属灵的争战正在酝酿...",
            verse: null,
            choices: [
                { text: "进入属灵争战", next: "iconium_battle", score: 10 }
            ],
            type: "dialog"
        },
        iconium_battle: {
            id: "iconium_battle",
            city: "iconium",
            title: "以哥念的逼迫",
            text: "面对犹太人的逼迫，保罗和巴拿巴必须运用智慧和忍耐来应对这场属灵争战。",
            verse: null,
            choices: [],
            type: "spiritual_battle",
            gameData: {
                battleEnemy: "persecution",
                next: "lystra_arrive"
            }
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
            title: "医治瘸腿的人",
            text: "保罗看见这个瘸腿的人有信心，决定医治他。但这件事引起了众人的误解，你需要用神迹和耐心来应对这突如其来的属灵争战。",
            verse: null,
            choices: [],
            type: "spiritual_battle",
            gameData: {
                battleEnemy: "idolatry",
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
            title: "被石头打的试炼",
            text: "但有些犹太人从安提阿和以哥念来，挑唆众人，就用石头打保罗。这是属灵旅程中最严峻的试炼，唯有忍耐和祷告才能度过。",
            verse: "acts14_19",
            choices: [
                { text: "进入属灵争战", next: "lystra_stoning_battle", score: 10 }
            ],
            type: "dialog"
        },
        lystra_stoning_battle: {
            id: "lystra_stoning_battle",
            city: "lystra",
            title: "石头的试炼",
            text: "石头如雨点般落下，这是最残酷的逼迫。保罗必须用忍耐承受，用信心得胜。",
            verse: null,
            choices: [],
            type: "spiritual_battle",
            gameData: {
                battleEnemy: "stoning",
                next: "derbe_arrive"
            }
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

    // 经文装备类型说明
    verseTypes: {
        calling: {
            name: "呼召",
            icon: "📜",
            description: "证明神圣差派的权柄，适用于开启新事工"
        },
        preparation: {
            name: "预备",
            icon: "🙏",
            description: "禁食祷告后的力量，适用于战前预备"
        },
        authority: {
            name: "权柄",
            icon: "⚔️",
            description: "斥责抵挡者的利刃，对假先知特别有效"
        },
        judgment: {
            name: "审判",
            icon: "⚡",
            description: "神圣审判的宣告，对顽固敌人有毁灭性效果"
        },
        preaching: {
            name: "讲道",
            icon: "📢",
            description: "开启听道之门的钥匙，适用于公开场合"
        },
        gospel: {
            name: "福音",
            icon: "✝️",
            description: "救恩的核心信息，传福音时最有力"
        },
        observation: {
            name: "观察",
            icon: "👁️",
            description: "辨别信心的慧眼，预备行神迹前使用"
        },
        miracle: {
            name: "神迹",
            icon: "✨",
            description: "彰显大能的工具，施行医治时使用"
        },
        warning: {
            name: "警戒",
            icon: "⚠️",
            description: "防止误入歧途的护栏，纠正误解时使用"
        },
        correction: {
            name: "纠正",
            icon: "🔄",
            description: "谦卑的见证，拒绝不当敬拜时使用"
        },
        persecution: {
            name: "逼迫",
            icon: "🪨",
            description: "忍受苦难的力量，在绝境中支撑"
        },
        resurrection: {
            name: "复活",
            icon: "🌅",
            description: "死而复生的见证，重新得力后使用"
        },
        exhortation: {
            name: "劝勉",
            icon: "💪",
            description: "坚固教会的工具，建立门徒时使用"
        }
    },

    // 经文使用追踪（每个存档独立）
    getVerseUsage: function(verseKey) {
        const usage = GameState.verseUsage || {};
        return usage[verseKey] || 0;
    },
    
    canUseVerse: function(verseKey) {
        const verse = this.verses[verseKey];
        if (!verse.consume) return true;  // 非消耗型永远可用
        
        const used = this.getVerseUsage(verseKey);
        return used < (verse.maxUses || 1);
    },
    
    useVerse: function(verseKey) {
        if (!this.canUseVerse(verseKey)) return false;
        
        const verse = this.verses[verseKey];
        if (verse.consume) {
            GameState.verseUsage = GameState.verseUsage || {};
            GameState.verseUsage[verseKey] = (GameState.verseUsage[verseKey] || 0) + 1;
            saveGame();
        }
        
        // 应用效果
        if (verse.effect) {
            applyVerseEffects(verse.effect);
        }
        
        return true;
    },

    // 旅行事件系统
    travelEvents: {
        smoothSailing: {
            id: 'smoothSailing',
            name: '顺风顺水',
            description: '圣灵赐下顺风，船只航行顺利。船员们士气高涨，你利用这段时间研读经文。',
            effect: { supplies: -5, faith: 5, influence: 0 },
            baseProbability: 0.35,
            difficulty: 1
        },
        gentleChallenge: {
            id: 'gentleChallenge',
            name: '小风浪',
            description: '途中遇到轻微风浪，船只颠簸不定。需要额外消耗供给来维持航行。',
            effect: { supplies: -12, faith: -3, influence: 0 },
            baseProbability: 0.25,
            difficulty: 2
        },
        storm: {
            id: 'storm',
            name: '海上风暴',
            description: '突如其来的风暴让船只陷入危险！船员们惊慌失措，需要你以坚定的信念稳定人心。',
            effect: { supplies: -20, faith: -15, influence: 0 },
            requires: { faith: 20 },
            baseProbability: 0.20,
            difficulty: 3
        },
        bandits: {
            id: 'bandits',
            name: '路遇强盗',
            description: '途中遭遇强盗拦路！他们要求交出所有财物，你需要运用智慧化解危机。',
            effect: { supplies: -25, faith: -5, influence: -10 },
            requires: { influence: 15 },
            baseProbability: 0.15,
            difficulty: 4
        },
        shipwreck: {
            id: 'shipwreck',
            name: '船只失事',
            description: '船只触礁！危急时刻，唯有祷告和强大的影响力才能带领众人脱险。',
            effect: { supplies: -35, faith: -25, influence: -15 },
            requires: { faith: 35, influence: 20 },
            baseProbability: 0.05,
            difficulty: 5
        }
    },

    // 属灵争战系统（替代解谜）
    spiritualBattles: {
        // 阻力类型敌人
        hardenedHearts: {
            id: 'hardenedHearts',
            name: '刚硬的心',
            description: '听众的心刚硬，不愿接受福音',
            baseResistance: 80,
            weakness: ['debate', 'miracle'],
            difficulty: 2
        },
        falseProphets: {
            id: 'falseProphets',
            name: '假先知',
            description: '有人抵挡真道，混乱主的正道',
            baseResistance: 120,
            weakness: ['miracle', 'debate'],
            difficulty: 3
        },
        persecution: {
            id: 'persecution',
            name: '犹太人的逼迫',
            description: '不顺从的犹太人耸动众人',
            baseResistance: 150,
            weakness: ['endurance'],
            difficulty: 4
        },
        idolatry: {
            id: 'idolatry',
            name: '偶像崇拜',
            description: '众人误以为你们是神，要向你献祭',
            baseResistance: 100,
            weakness: ['debate', 'endurance'],
            difficulty: 3
        },
        stoning: {
            id: 'stoning',
            name: '石头的试炼',
            description: '有人挑唆众人用石头打你',
            baseResistance: 180,
            weakness: ['endurance', 'miracle'],
            difficulty: 5
        }
    },

    // 技能配置
    skillConfig: {
        debate: {
            name: '辩论',
            description: '用智慧和圣经辩论，说服人心',
            baseCost: { supplies: 5, faith: 0, influence: 0 },
            baseDamage: 25,
            baseChance: 0.90,
            scaling: { damage: 8, cost: 1 }  // 每级增加8点伤害，1点消耗
        },
        miracle: {
            name: '神迹',
            description: '施行医治和神迹，彰显神的大能',
            baseCost: { supplies: 0, faith: 15, influence: 0 },
            baseDamage: 45,
            baseChance: 0.75,
            scaling: { damage: 12, cost: 2 }
        },
        endurance: {
            name: '忍耐',
            description: '以忍耐和温柔回应，坚固自己',
            baseCost: { supplies: 0, faith: 8, influence: 5 },
            baseDamage: 20,
            baseChance: 0.95,
            heal: { faith: 15 },
            scaling: { damage: 5, cost: 1, heal: 3 }
        }
    },

    // 动态难度算法 - Phase 2: 加入福音饱和度影响
    difficultySystem: {
        // 计算玩家技能点总和 S
        calculateSkillPoints: function(skills) {
            return Object.values(skills).reduce((total, skill) => {
                return total + skill.level;
            }, 0);
        },
        
        // 计算扰动项 σ（基于城市进度的随机波动）
        calculateSigma: function(cityIndex) {
            const baseSigma = 0.5;
            const progressFactor = cityIndex * 0.1;
            return baseSigma + progressFactor + (Math.random() * 0.5 - 0.25);
        },
        
        // 计算目标难度 D = S + σ
        calculateTargetDifficulty: function(skills, cityIndex) {
            const S = this.calculateSkillPoints(skills);
            const sigma = this.calculateSigma(cityIndex);
            return Math.max(1, S + sigma);
        },
        
        // 根据目标难度调整敌人属性 - 考虑福音饱和度
        scaleEnemy: function(enemy, targetDifficulty, cityKey) {
            const city = GameData.cities[cityKey];
            const saturation = city ? (city.gospel_saturation || 0) : 0;
            
            // 福音饱和度降低敌人抵抗力（最高降低30%）
            const saturationFactor = 1 - (saturation / 100) * 0.3;
            
            const scaleFactor = (targetDifficulty / enemy.difficulty) * saturationFactor;
            return {
                ...enemy,
                resistance: Math.floor(enemy.baseResistance * scaleFactor),
                rewards: {
                    exp: Math.floor(20 * scaleFactor),
                    influence: Math.floor(5 * scaleFactor),
                    gospelSaturation: Math.floor(5 * (1 + saturation / 100))  // 胜利后增加的饱和度
                }
            };
        },
        
        // 计算旅行事件概率（根据玩家技能、资源和福音饱和度动态调整）
        calculateEventProbability: function(event, skills, resources, cityKey) {
            const baseProb = event.baseProbability;
            const S = this.calculateSkillPoints(skills);
            
            // 技能越高，负面事件概率越低
            const skillFactor = Math.min(0.2, S * 0.02);
            
            // 供给充足时，风险事件概率降低
            const supplyFactor = resources.supplies > 50 ? -0.05 : 
                                resources.supplies < 20 ? 0.05 : 0;
            
            // Phase 2: 福音饱和度影响 - 饱和度高时，负面事件概率降低
            let saturationFactor = 0;
            if (cityKey) {
                const city = GameData.cities[cityKey];
                if (city) {
                    const saturation = city.gospel_saturation || 0;
                    // 饱和度每增加10，负面事件概率降低1%
                    saturationFactor = -(saturation / 100) * 0.1;
                }
            }
            
            if (event.difficulty <= 2) {
                // 正面事件：技能增加概率
                return Math.min(0.5, baseProb + skillFactor * 0.5 + saturationFactor * 0.5);
            } else {
                // 负面事件：技能和饱和度降低概率
                return Math.max(0.02, baseProb - skillFactor + supplyFactor + saturationFactor);
            }
        }
    },
    
    // 福音饱和度系统 - Phase 2
    gospelSaturationSystem: {
        // 增加城市福音饱和度
        increaseSaturation: function(cityKey, amount) {
            const city = GameData.cities[cityKey];
            if (!city) return 0;
            
            const oldSaturation = city.gospel_saturation || 0;
            const newSaturation = Math.min(100, oldSaturation + amount);
            city.gospel_saturation = newSaturation;
            
            // 保存游戏
            saveGame();
            
            return newSaturation - oldSaturation;  // 返回实际增加量
        },
        
        // 获取城市饱和度等级描述
        getSaturationLevel: function(saturation) {
            if (saturation >= 80) return { level: 5, name: "福音广传", color: "#2e7d32" };
            if (saturation >= 60) return { level: 4, name: "教会稳固", color: "#689f38" };
            if (saturation >= 40) return { level: 3, name: "信徒增长", color: "#9e9d24" };
            if (saturation >= 20) return { level: 2, name: "初有果效", color: "#f57f17" };
            return { level: 1, name: "刚刚起步", color: "#e65100" };
        },
        
        // 获取饱和度对游戏的影响描述
        getSaturationEffects: function(saturation) {
            const effects = [];
            if (saturation >= 20) effects.push("敌对势力抵抗力降低");
            if (saturation >= 40) effects.push("负面事件概率减少");
            if (saturation >= 60) effects.push("经文对决伤害增加");
            if (saturation >= 80) effects.push("获得额外影响力奖励");
            return effects;
        }
    },

    // 禁食祷告任务
    fastingPrayer: {
        duration: 30,  // 基础倒计时30秒
        tasks: [
            {
                type: 'memory_verse',
                name: '背诵经文',
                description: '保罗说："我们进入神的国，必须经历许多____。"',
                answer: '艰难',
                reward: { faith: 40 }
            },
            {
                type: 'click_prayer',
                name: '恒切祷告',
                description: '连续点击祷告按钮15次，表达你的信心',
                clicks: 15,
                reward: { faith: 50 }
            },
            {
                type: 'quiet_wait',
                name: '安静等候',
                description: '在主面前安静等候20秒',
                duration: 20,
                reward: { faith: 45 }
            }
        ],
        baseRecovery: { faith: 50, supplies: 10 }
    },

    // Phase 3: 教会稳固度评价系统
    churchHealthSystem: {
        // 4维度评价标准
        dimensions: {
            foundation: {
                name: "根基",
                description: "神学知识的扎实程度",
                icon: "📚",
                maxScore: 100,
                calculate: function(gameState) {
                    // 基于测验得分计算
                    const quizScore = gameState.quizScore || 0;
                    const maxQuiz = GameData.quiz.length;
                    return Math.min(100, (quizScore / maxQuiz) * 100);
                }
            },
            disciples: {
                name: "门徒",
                description: "建立的门徒群体规模",
                icon: "👥",
                maxScore: 100,
                calculate: function(gameState) {
                    // 基于转化的城市数 + 福音饱和度
                    let score = 0;
                    const completedCities = gameState.completedCities || [];
                    
                    // 完成城市基础分：每个城市10分
                    score += completedCities.length * 10;
                    
                    // 福音饱和度加分：每个城市饱和度/10
                    for (const cityKey of completedCities) {
                        const city = GameData.cities[cityKey];
                        if (city) {
                            score += (city.gospel_saturation || 0) / 10;
                        }
                    }
                    
                    return Math.min(100, score);
                }
            },
            elders: {
                name: "长老",
                description: "属灵装备的丰富程度",
                icon: "📖",
                maxScore: 100,
                calculate: function(gameState) {
                    // 基于收藏的经文数量和质量
                    const collectedVerses = gameState.collectedVerses || [];
                    const totalVerses = Object.keys(GameData.verses).length;
                    
                    // 基础分：收集比例
                    let score = (collectedVerses.length / totalVerses) * 60;
                    
                    // 加分项：使用经文进行对决的次数
                    const verseUsage = gameState.verseUsage || {};
                    let usageCount = 0;
                    for (const verseKey in verseUsage) {
                        usageCount += verseUsage[verseKey];
                    }
                    score += Math.min(40, usageCount * 2);
                    
                    return Math.min(100, score);
                }
            },
            perseverance: {
                name: "忍耐",
                description: "历经逼迫后的信念坚守",
                icon: "✊",
                maxScore: 100,
                calculate: function(gameState) {
                    // 基于最终信念值 + 禁食祷告经历
                    const finalFaith = gameState.resources?.faith || 0;
                    const fastingExperience = gameState.fastingExperience || 0;
                    
                    // 信念分：剩余信念比例 * 70
                    let score = (finalFaith / 100) * 70;
                    
                    // 禁食祷告经历加分：每次禁食+10分
                    score += Math.min(30, fastingExperience * 10);
                    
                    return Math.min(100, score);
                }
            }
        },
        
        // 计算总体教会稳固度
        calculateOverallHealth: function(gameState) {
            const dimensions = this.dimensions;
            let totalScore = 0;
            const scores = {};
            
            for (const key in dimensions) {
                const score = dimensions[key].calculate(gameState);
                scores[key] = Math.round(score);
                totalScore += score;
            }
            
            const averageScore = totalScore / 4;
            
            return {
                scores: scores,
                overall: Math.round(averageScore),
                level: this.getHealthLevel(averageScore),
                evaluation: this.getEvaluation(scores)
            };
        },
        
        // 根据总分获取等级
        getHealthLevel: function(score) {
            if (score >= 80) return {
                level: 4,
                name: "使徒级",
                title: " Apostle",
                description: "你建立了7个稳固的教会，成为外邦人的光。你的宣教工作堪称典范，门徒们都能恒守真道。",
                badge: "🏆",
                color: "#FFD700"
            };
            if (score >= 60) return {
                level: 3,
                name: "宣教士级",
                title: "Missionary",
                description: "你的足迹遍布加拉太，多人信了主。虽然过程艰难，但你建立了坚实的福音基础。",
                badge: "⭐",
                color: "#C0C0C0"
            };
            if (score >= 40) return {
                level: 2,
                name: "门徒级",
                title: "Disciple",
                description: "你完成了旅程，但还有更多要学习。继续努力，主的恩典够你用的。",
                badge: "📖",
                color: "#CD7F32"
            };
            return {
                level: 1,
                name: "逃遁级",
                title: "Fled",
                description: "在逼迫中逃离，需要重新得力。记住：我们进入神的国，必须经历许多艰难。",
                badge: "🏃",
                color: "#8B4513"
            };
        },
        
        // 获取详细评价
        getEvaluation: function(scores) {
            const evaluations = [];
            
            // 分析各维度表现
            if (scores.foundation >= 80) {
                evaluations.push("📚 神学根基扎实，对圣经有深刻理解");
            } else if (scores.foundation < 40) {
                evaluations.push("📚 需要加强圣经学习，加深对真理的认识");
            }
            
            if (scores.disciples >= 80) {
                evaluations.push("👥 建立了庞大的门徒群体，福音广传");
            } else if (scores.disciples < 40) {
                evaluations.push("👥 门徒数量有限，需要更积极地传福音");
            }
            
            if (scores.elders >= 80) {
                evaluations.push("📖 熟练运用经文，属灵装备丰富");
            } else if (scores.elders < 40) {
                evaluations.push("📖 经文收藏不足，需要多收集属灵装备");
            }
            
            if (scores.perseverance >= 80) {
                evaluations.push("✊ 经历逼迫依然坚守，信心稳固");
            } else if (scores.perseverance < 40) {
                evaluations.push("✊ 信心需要坚固，学习在逆境中依靠主");
            }
            
            // 特殊成就
            if (scores.foundation >= 90 && scores.elders >= 90) {
                evaluations.push("🎓 卓越的神学家！你对真理的理解令人钦佩");
            }
            if (scores.disciples >= 90 && scores.perseverance >= 90) {
                evaluations.push("🌟 真正的拓荒者！你建立了稳固的教会");
            }
            
            return evaluations;
        },
        
        // 获取改进建议
        getSuggestions: function(scores) {
            const suggestions = [];
            
            const dimensions = [
                { key: 'foundation', name: '根基', action: '认真完成每一章的测验' },
                { key: 'disciples', name: '门徒', action: '多传福音，提升城市福音饱和度' },
                { key: 'elders', name: '长老', action: '收集更多经文，在战斗中使用' },
                { key: 'perseverance', name: '忍耐', action: '保持信念，必要时禁食祷告' }
            ];
            
            // 找出最弱的维度
            const minScore = Math.min(...Object.values(scores));
            const weakDimensions = dimensions.filter(d => scores[d.key] === minScore);
            
            weakDimensions.forEach(d => {
                suggestions.push(`💡 加强${d.name}：${d.action}`);
            });
            
            return suggestions;
        }
    },

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
    gameData: {},
    
    // 资源管理系统
    resources: {
        faith: 100,        // 信念（生命值）
        supplies: 80,      // 供给（旅行消耗）
        influence: 20      // 影响力（解锁选项、应对事件）
    },
    
    // 技能系统（动态难度平衡的核心）
    skills: {
        debate: { level: 1, exp: 0, maxExp: 100 },      // 辩论
        miracle: { level: 1, exp: 0, maxExp: 100 },     // 神迹
        endurance: { level: 1, exp: 0, maxExp: 100 }    // 忍耐
    },
    
    // 当前战斗状态
    battleState: null,
    
    // 禁食祷告状态
    fastingState: null,
    
    // Phase 3: 禁食祷告经历次数（用于评价系统）
    fastingExperience: 0,
    
    // 当前所在城市索引（用于难度计算）
    currentCityIndex: 0,
    
    // 经文使用追踪
    verseUsage: {}
};

// 本地存储键名
const SAVE_KEY = 'paulJourney_saveData_chapter1_v2';
const SAVE_KEY_LEGACY = 'paulJourney_saveData_chapter1';

// 保存游戏
function saveGame() {
    // Phase 2: 收集城市福音饱和度数据
    const citySaturationData = {};
    for (const cityKey in GameData.cities) {
        const city = GameData.cities[cityKey];
        if (city.gospel_saturation && city.gospel_saturation > 0) {
            citySaturationData[cityKey] = city.gospel_saturation;
        }
    }
    
    const saveData = {
        currentScene: GameState.currentScene,
        completedCities: GameState.completedCities,
        collectedVerses: GameState.collectedVerses,
        totalScore: GameState.totalScore,
        resources: GameState.resources,
        skills: GameState.skills,
        currentCityIndex: GameState.currentCityIndex,
        verseUsage: GameState.verseUsage,
        citySaturation: citySaturationData,  // Phase 2: 保存城市福音饱和度
        fastingExperience: GameState.fastingExperience,  // Phase 3: 保存禁食祷告经历
        timestamp: new Date().toISOString(),
        version: '2.3'
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
}

// 加载游戏
function loadGame() {
    // 尝试加载新版本存档
    let saveData = localStorage.getItem(SAVE_KEY);
    
    // 如果没有新版本，尝试加载旧版本并迁移
    if (!saveData) {
        saveData = localStorage.getItem(SAVE_KEY_LEGACY);
        if (saveData) {
            // 迁移旧存档到新格式
            const oldData = JSON.parse(saveData);
            GameState.currentScene = oldData.currentScene || 'antioch_start';
            GameState.completedCities = oldData.completedCities || [];
            GameState.collectedVerses = oldData.collectedVerses || [];
            GameState.totalScore = oldData.totalScore || 0;
            // 新属性使用默认值
            GameState.resources = { faith: 100, supplies: 80, influence: 20 };
            GameState.skills = { debate: { level: 1, exp: 0, maxExp: 100 }, miracle: { level: 1, exp: 0, maxExp: 100 }, endurance: { level: 1, exp: 0, maxExp: 100 } };
            GameState.currentCityIndex = 0;
            // 保存为新格式
            saveGame();
            return true;
        }
        return false;
    }
    
    // 加载新版本存档
    const data = JSON.parse(saveData);
    GameState.currentScene = data.currentScene || 'antioch_start';
    GameState.completedCities = data.completedCities || [];
    GameState.collectedVerses = data.collectedVerses || [];
    GameState.totalScore = data.totalScore || 0;
    GameState.resources = data.resources || { faith: 100, supplies: 80, influence: 20 };
    GameState.skills = data.skills || { debate: { level: 1, exp: 0, maxExp: 100 }, miracle: { level: 1, exp: 0, maxExp: 100 }, endurance: { level: 1, exp: 0, maxExp: 100 } };
    GameState.currentCityIndex = data.currentCityIndex || 0;
    GameState.verseUsage = data.verseUsage || {};
    GameState.fastingExperience = data.fastingExperience || 0;  // Phase 3: 恢复禁食祷告经历
    
    // Phase 2: 恢复城市福音饱和度
    if (data.citySaturation) {
        for (const cityKey in data.citySaturation) {
            if (GameData.cities[cityKey]) {
                GameData.cities[cityKey].gospel_saturation = data.citySaturation[cityKey];
            }
        }
    }
    
    return true;
}

// 检查是否有存档
function hasSaveData() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

// 清空存档
function clearSaveData() {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SAVE_KEY_LEGACY);
    GameState.currentScene = 'antioch_start';
    GameState.completedCities = [];
    GameState.collectedVerses = [];
    GameState.totalScore = 0;
    GameState.resources = { faith: 100, supplies: 80, influence: 20 };
    GameState.skills = { debate: { level: 1, exp: 0, maxExp: 100 }, miracle: { level: 1, exp: 0, maxExp: 100 }, endurance: { level: 1, exp: 0, maxExp: 100 } };
    GameState.battleState = null;
    GameState.fastingState = null;
    GameState.currentCityIndex = 0;
    GameState.verseUsage = {};
    GameState.fastingExperience = 0;  // Phase 3: 清空禁食祷告经历
    
    // Phase 2: 清空城市福音饱和度
    for (const cityKey in GameData.cities) {
        GameData.cities[cityKey].gospel_saturation = 0;
    }
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
