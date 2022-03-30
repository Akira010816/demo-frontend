const plus = '<a style="margin-right: 1rem;"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="plus" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path><path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path></svg></a>'
const minus = '<a><svg viewBox="64 64 896 896" focusable="false" className="" data-icon="minus" width="1em" height="1em" fill="currentColor" aria-hidden="true"> <path d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"></path></svg></a>'

const data = {
    planTree:  [
        {
          title: '中長期計画  (JSON)XXXXXX',
          key: '0-0',
          children: [
            {
              title: '年間計画  (JSON)XXXX',
              key: '0-0-0',
              children: [
                {
                  title: '課題　(JSON)XXXXX',
                  key: '0-0-0-1',
                  children: [
                    {
                      title: '対策1　(JSON)XXXXX',
                      key: '0-0-0-0-1',
                      children: [
                        { title: '調達1　(JSON)XXXXX', key: '0-0-0-0-1-1' },
                        { title: '調達2　(JSON)XXXXX', key: '0-0-0-0-1-2' },
                      ],
                    },
                    {
                      title: '対策2　(JSON)XXXXX',
                      key: '0-0-0-0-2',
                      children: [
                        {
                          title: '調達1 [未登録]　(JSON)XXXXX',
                          key: '0-0-0-0-2-1',
                        },
                      ],
                    },
                  ],
                },
                { title: '課題　(JSON)XXXXX', key: '0-0-0-1-2' },
              ],
            },
          ],
        },
      ],
    baseInfo: {
        id: "1234567890",
        name: "予兆診断の条件追加",
        abstract: "予兆診断の条件を追加する。（センサーAの値＞センサーB）",
        startCondition: "",
        solutionCondition: "センサーAの値＞センサーBの値となった時にアラートが表示されること。",
        milestone: [{
            date: "2021-07-31",
            explain: "予兆診断システムを改修する場合の期限（8月から大型改修を控えているため）"
        }],
    },
    policy: [{
        measure_nm: "予兆診断システムの改修（アラート条件追加）",
        adopt: "する",
        effect: "あり",
        consistent: "一致",
        prerequisites: "前提条件",
        solve_cond: [{
                text: "条件Aの時にアラートが表示されること",
                check: true
            },
            {
                text: "部品１が原因だと特定出来ること",
                check: false
            },
        ],
        effectMeasurementMethod: "効果の確認方法",
        means: "既存システム改修",
        target: [{
            text: "XXXX-1",
            check: true
        }, {
            text: "XXXX-2",
            check: false
        }, {
            text: "XXXX-3",
            check: true
        }],
        technology: "technology--A",
        cooperation: "次工程の装置への通知を行う"
    },
    {
        measure_nm: "アラート条件に対応したソフトウェア購入",
        adopt: "する",
        effect: "あり",
        consistent: "一致",
        prerequisites: "前提条件",
        solve_cond: [{
                text: "条件Aの時にアラートが表示されること",
                check: true
            },
            {
                text: "部品１が原因だと特定出来ること",
                check: false
            },
        ],
        effectMeasurementMethod: "効果の確認方法",
        means: "既存システム改修",
        target: [{
            text: "XXXX-1",
            check: true
        }, {
            text: "XXXX-2",
            check: false
        }, {
            text: "XXXX-3",
            check: true
        }],
        technology: "technology--A",
        cooperation: "次工程の装置への通知を行う"
    },
    {
        measure_nm: "新しいセンサーを追加",
        adopt: "しない",
            effect: "あり",
                consistent: "不一致",
                    prerequisites: "前提条件",
                        solve_cond: [{
                            text: "条件Aの時にアラートが表示されること",
                            check: true
                        },
                        {
                            text: "部品１が原因だと特定出来ること",
                            check: false
                        },
                        ],
                            effectMeasurementMethod: "効果の確認方法",
                                means: "既存システム改修",
                                    target: [{
                                        text: "XXXX-1",
                                        check: true
                                    }, {
                                        text: "XXXX-2",
                                        check: false
                                    }, {
                                        text: "XXXX-3",
                                        check: true
                                    }],
                                        technology: "technology--A",
                                            cooperation: "次工程の装置への通知を行う"
    }
    ],
    policyDirection: {
        policy: "新しいセンサーは、設置場所の確保が困難なので、センサー以外の対応にする。",
        policies: [{
            measure_nm: "予兆診断システムの改修（アラート条件追加）",
            adopt: "する",
            effect: "あり",
            consistent: "一致",
        },
        {
            measure_nm: "アラート条件に対応したソフトウェア購入",
            adopt: "する",
            effect: "あり",
            consistent: "一致",
        },
        {
            measure_nm: "新しいセンサーを追加",
            adopt: "しない",
            effect: "あり",
            consistent: "不一致",
        }]
    },
    measuresAnalysis: {
        nodes: [{
                id: "0",
                label: "来社UP (JSON)",
                x: 85,
                y: 400,
                shape: "model-card",
            },
            {
                id: "1",
                label: "CV数を増やす",
                x: 300,
                y: 400,
                shape: "model-card",
            },
            {
                id: "2",
                label: "CVRを下げる",
                x: 515,
                y: 400,
                shape: "model-card",
            },
            {
                id: "3",
                label: "入札を上げる",
                x: 800,
                y: 400 - 400,
                shape: "model-card",
            },
            {
                id: "4",
                label: "広告文を絞る",
                x: 800,
                y: 400 - 300,
                shape: "model-card",
            },
            {
                id: "5",
                label: "LPを絞る",
                x: 800,
                y: 400 - 200,
                shape: "model-card",
            },
            {
                id: "6",
                label: "リンク先の変更",
                x: 800,
                y: 400 - 100,
                shape: "model-card",
            },
            {
                id: "7",
                label: "サイトリンク\n\nの絞り込み",
                x: 800,
                y: 400,
                shape: "model-card",
            },
            {
                id: "8",
                label: "リマーケティング\n\nの絞り込み",
                x: 800,
                y: 400 + 100,
                shape: "model-card",
            },
            {
                id: "9",
                label: "CVKWの追加",
                x: 800,
                y: 400 + 200,
                shape: "model-card",
            },
            {
                id: "10",
                label: "CVKWの\n\n関連KW追加",
                x: 800,
                y: 400 + 300,
                shape: "model-card",
            },
            {
                id: "11",
                label: "LP作成",
                x: 800,
                y: 400 + 400,
                shape: "model-card",
            },

        ],
        edges: [{
                label: "",
                source: "0",
                target: "1"
            },
            {
                label: "",
                source: "1",
                target: "2"
            },
            {
                label: "",
                source: "2",
                target: "3",
                sourceAnchor: 3,
                targetAnchor: 2
            },
            {
                label: "",
                source: "2",
                target: "4",
                sourceAnchor: 3,
                targetAnchor: 2
            },
            {
                label: "",
                source: "2",
                target: "5",
                sourceAnchor: 3,
                targetAnchor: 2
            },
            {
                label: "",
                source: "2",
                target: "6",
                sourceAnchor: 3,
                targetAnchor: 2,
            },
            {
                label: "",
                source: "2",
                target: "7",
                sourceAnchor: 3,
                targetAnchor: 2,
            },
            {
                label: "",
                source: "2",
                target: "8",
                sourceAnchor: 3,
                targetAnchor: 2,
            },
            {
                label: "",
                source: "2",
                target: "9",
                sourceAnchor: 3,
                targetAnchor: 2,
            },
            {
                label: "",
                source: "2",
                target: "10",
                sourceAnchor: 3,
                targetAnchor: 2,
            },
            {
                label: "",
                source: "2",
                target: "11",
                sourceAnchor: 3,
                targetAnchor: 2,
            }
        ]
    },
    RFIpreparation: {
        plans: {
            items: ["予兆診断システムの改修（アラート条件追加）", "アラート条件に対応したソフトウェア購入"],
            select: 1
        },
        documents: [{
                name: "製品Aの情報提供依頼",
                requestDestination: "サンプルA社"
            },
            {
                name: "製品Bの情報提供依頼",
                requestDestination: "サンプルB社"
            },
        ]
    },
    RFIquestion: [
        ["1", "2020/11/1", "丸太 茂雄", "最初にXXXとありますが、これはYYYしてからZZするという解釈でよろしいか", "2-2", "2020/11/2", "OKです"],
        ["2", "2020/11/2", "丸太 規雄", "次にXXXとありますが、これはYYYしてからZZするという解釈でよろしいか", "2-2", "2020/11/3", "OKです"],
    ],
    RFIresult: {
        files: [
            ["アラート条件に対応したソフトウェア購入", "サンプルA社", "未登録"],
            ["アラート条件に対応したソフトウェア購入", "サンプルB社", "登録済"]
        ],
        embodiment: [
            "予兆診断システムの改修（アラート条件追加）", "アラート条件に対応したソフトウェア購入",
        ],
    },
    evalution: [{
        compairReason: "",
        adoptReason: "",
        proposals: [{
                adopt: true,
                name: "予兆診断システムの改修（アラート条件追加）",
                term: "10",
                level: "10",
                cost: "10",
                total: "30"
            },
            {
                adopt: false,
                name: "アラート条件に対応したソフトウェア購入",
                term: "5",
                level: "5",
                cost: "5",
                total: "15"
            },
        ],
        reason: "費用対効果に最も優れているため",
    },
    {
        compairReason: "",
        adoptReason: "",
        proposals: [{
                adopt: false,
                name: "最速PCの導入",
                term: "5",
                level: "5",
                cost: "5",
                total: "15"
            },
            {
                adopt: true,
                name: "コスパPCの導入",
                term: "5",
                level: "5",
                cost: "5",
                total: "15"
            },
            {
                adopt: false,
                name: "低消費電力PCの導入",
                term: "5",
                level: "5",
                cost: "5",
                total: "15"
            },
        ],
        reason: "費用対効果に最も優れているため",
    }],
    decision: {
        policy: "新しいセンサーは、設置場所の確保が困難なので、センサー以外の対応にする。",
        measures: [{
            name: "予兆診断システムの改修（アラート条件追加）",
                adopt: true,
                effect: true,
                consistent: true
            },
            {
                name: "アラート条件に対応したソフトウェア購入",
                adopt: false,
                effect: false,
                consistent: true
            },
        ],
        result: [
            [true, "予兆診断システムの改修（アラート条件追加）", "10", "10", "10", "30"],
            [false, "アラート条件に対応したソフトウェア購入", "5", "5", "5", "15"],
        ],
        comparison: {
            table: [
                [false, "高負荷動作可能な装置導入", "★★", "★★", "★", "★★★★★"],
                [true, "高速回転装置導入", "★★", "★★", "★★", "★★★★★★"],
                [false, "全自動装置導入", "★", "★★", "★★", "★★★★★"],
            ],
            reason: "費用対効果に最も優れているため",
        }

    },
    responsiblePerson: "一ノ瀬 太郎",
    enforcementPreparation: {
        documents: ["プロジェクト計画書", "WBS"],
        gantt: {
            data: [{
                    id: 1,
                    text: "[課題] 予兆診断で検知出来ない故障の増加",
                    uid: "0123456789",
                    title: "XXXXXXXXX",
                    plus_minus: `${minus}`,
                    start_date: "2020-7-30 00:00",
                    parent: 0,
                    progress: 0,
                    open: true,
                    action: `${plus}${minus}`,
                    type: 'project'
                },
                {
                    id: 2,
                    text: "[問題] 故障の予兆を検知するシステムで、検知出来ない故障が増加している。",
                    uid: "0123456789",
                    title: "XXXXXXXXX",
                    plus_minus: "",
                    start_date: "2020-7-30 00:00",
                    parent: 1,
                    progress: 1,
                    type: 'project'
                },
                {
                    id: 3,
                    text: "[原因] センサーの数値は正常だが、センサーAの値＞センサーBの値となった時に故障が発生する。",
                    uid: "0123456789",
                    title: "XXXXXXXXX",
                    plus_minus: `${plus}${minus}`,
                    start_date: "2020-7-30 00:00",
                    parent: 2,
                    progress: 0.5,
                    type: 'yearly'
                },
                {
                    id: 4,
                    text: "[対策] 予兆診断の条件追加",
                    uid: "0123456789",
                    title: "XXXXXXXXX",
                    plus_minus: `${plus}${minus}`,
                    start_date: "2020-7-30 00:00",
                    parent: 3,
                    progress: 0.8,
                    open: true,
                    type: 'yearly'
                },
                {
                    id: 5,
                    text: "[施策] 予兆診断システムの改修（アラート条件追加）",
                    uid: "0123456789",
                    title: "XXXXXXXXX",
                    procurement: true,
                    plus_minus: "",
                    start_date: "2020-7-30 00:00",
                    parent: 4,
                    progress: 0.8,
                    open: true,
                    type: 'yearly'
                },
            ]
        }
    },

    schedule: {
        startDate: "2021/01/01",
        unit: "月",
        term: "11ヶ月",
        gantt: {
            data: [{
                    id: 1,
                text: "[マイルストーン] 予兆診断システムを改修する場合の期限（8月から大型改修を控えているため）",
                    start_date: "2021-07-31 00:00",
                    type: 'milestone',
                    parent: 0
                },
                {
                    id: 2,
                    text: "[課題] 予兆診断で検知出来ない故障の増加",
                    start_date: "2021-01-01 00:00",
                    parent: 0,
                    duration: 365,
                    overdue: true
                },
                {
                    id: 10,
                    text: "[対策] 予兆診断の条件追加",
                    start_date: "2021-02-01 00:00",
                    duration: 30,
                    parent: 2,
                    progress: 0,
                    type: 'measure'
                },
                {
                    id: 11,
                    text: "[施策] 予兆診断システムの改修（アラート条件追加）",
                    start_date: "2021-04-01 00:00",
                    duration: 90,
                    parent: 10,
                    progress: 0,
                    type: 'procurement'
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
            contents: {
                budget: false,
                monhour: true,
            },
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
