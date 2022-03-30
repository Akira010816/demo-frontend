const data = {
    result: 2,
    baseInfo: {
        name: {
            value: "納期遅延",
            state: "warning",
            comment: [{date:"2020/2/22 18:42:08", name:"山田 大輔1", value:"AAAAA"},{date:"2020/2/23", name:"山田 大輔7", value:"BBBBB"}]
        },
        text: {
            value: "新商品「XXXXX」を売り出した直後から注文が急増し、生産が追いつかず、また設備トラブルなどにより、納期遅延を繰り返し起こしている",
            state: "ok",
            comment: [{date:"2020/2/22 18:42:08", name:"山田 大輔2", value:"AAAAA"},{date:"2020/2/23", name:"山田 大輔8", value:"BBBBB"}]
        },
        department: {
            value: "情報システム部",
            state: "none",
            comment: [{date:"2020/2/22 18:42:08", name:"山田 大輔3", value:"AAAAA"},{date:"2020/2/23", name:"山田 大輔9", value:"BBBBB"}]
        },
        mentioner: {
            value: "青田秀樹",
            state: "warning",
            comment: [{date:"2020/2/22 18:42:08", name:"山田 大輔4", value:"AAAAA"},{date:"2020/2/23", name:"山田 大輔10", value:"BBBBB"}]
        },
        taskType: {
            value: [0, 1],
            state: "none",
            comment: [{date:"2020/2/22 18:42:08", name:"山田 大輔5", value:"AAAAA"},{date:"2020/2/23", name:"山田 大輔11", value:"BBBBB"}]
        },
        contentType: {
            value: [1, 2],
            state: "none",
            comment: [{date:"2020/2/22 18:42:08", name:"山田 大輔6", value:"AAAAA"},{date:"2020/2/23", name:"山田 大輔12", value:"BBBBB"}]
        }
    },
    detailInfluence: {
        text: "納品先A社をはじめ、数社からの納期遅れによりクレームが発生した。また不良製品による、エンドユーザからのクレームも数１００回報告されている",
        files: [{
            name: "AAAA",
            title: "クレーム推移",
            remarks: "2020年１月から１０月までのクレーム推移"
        }, {
            name: "BBBBB",
            title: "クレーム分析",
            remarks: "クレームを深堀し、状態を把握した"
        }],

        annualPlan: {
            treeList: [
                [{
                    key: 1,
                    id: 12,
                    type: "midlong",
                    name: "1.中長期"
                }, {
                    key: 2,
                    id: 16,
                    type: "annual",
                    parent: 1,
                    name: "計画ABC"
                }, {
                    key: 3,
                    id: 203,
                    type: "annual",
                    parent: 1,
                    name: "計画ABC"
                }]
            ],
            selectTree: 16,
            achievementConditionList: [{
                id: 0,
                text: "達成条件1 : 全製品不良品率0.001%"
            }, {
                id: 1,
                text: "達成条件2 : CO2排出率10%減"
            }],
            selectAchievementCondition: [0],
        },
        effect: {
            text: "取引先の信頼低下により、ひどければ取引停止になり、最終的に社会的信用の損失",
            files: [],
        },
        solve_cond: ["５カ月連続で不良品率0.01％の達成", "良品の月産１万個以上"]
    },
    problemCause: [{
        text: "故障の予兆を検知しるシステムで、検知出来ない故障が増加している。",
        status: 0,
        frequency: 1,
        frequencyRemark: "週5回",
        cause: [{
                text: "センサーの数値は正常だが、センサーAの値＞センサーBの値となった時に故障が発生する。",
                accuracy: 0,
                condition: "センサーAの値＞センサーBの値となった時にアラートが表示されること。",
                correspondenceList: [{
                    text: "条件1 XXXXXXXX",
                    check: true
                }, {
                    text: "条件2 YYYYYYYY",
                    check: false
                }],
            },
            {
                text: "装置の動作異常発生",
                accuracy: 1,
                condition: "メーカに修理をしてもらう",
                correspondenceList: [{
                    text: "条件1 XXXXXXXX",
                    check: true
                }, {
                    text: "条件2 YYYYYYYY",
                    check: false
                }],
            },
        ]
    }],
    targets: [{
        id: 0,
        text: "11111"
    }, {
        id: 1,
        text: "22222"
    }],
    todos: [{
        id: 0,
        text: "AAAA"
    }, {
        id: 1,
        text: "BBBB"
    }],
    considerationResult: [{
        id: 0,
        text: "DDDD"
    }, {
        id: 1,
        text: "EEEE"
    }],
    owner: {
        name: "青木新之助",
        member: [
            ["人事部", "赤城信二"],
            ["システム部", "六田五郎"]
        ]
    },
    schedule: {
        startDate: "2015/01/01",
        unit: "月",
        term: "12ヶ月",
        gantt: {
            data: [{
                    id: 101,
                    text: "[マイルストーン] 日付の説明",
                    type: 'milestone',
                    start_date: "2020-7-30 00:00"
                },
                {
                    id: 102,
                    text: "[マイルストーン] 日付の説明",
                    type: 'milestone',
                    start_date: "2020-11-30 00:00"
                },
                {
                    id: 1,
                    text: "[課題] 課題名",
                    start_date: "2020-05-10 00:00",
                    duration: 290,
                    parent: 0,
                    progress: 0,
                    open: true,
                    type: 'yearly'
                },
            ]
        }
    },
    resource: {
        contents: {
            budget: true,
            manhour: false,
        },
        budget: {
            unit: "千円",
            inputMethod: 1,
            startYear: "2020",
            startMonth: "4",
            endYear: "2021",
            endMonth: "3",
            data: [
                [2, 40, 50, 60, 70, 80, 90, 100, 110, 120, 10, 20, 30],
                [3, 402, 502, 602, 702, 802, 902, 1002, 1102, 1202, 102, 202, 302],
            ]
        },
        manhour: {
            inputMethodTerm: 0,
            inputMethodOrg: 1,
            startYear: "2020",
            endYear: "2021",
            data: [
                [2, 1, 2, 3, 4, 0]
            ]
        }
    }
}
export default data;
