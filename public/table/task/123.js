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
        id: "123",
        name: "予兆診断で検知出来ない故障の増加",
        overview: "予兆診断で検知出来ない故障が増加している。",
        files: [{
            name: "AAAA.xlsx",
            title: "売上推移",
            remarks: "2020年1月～４月"
        }, {
            name: "BBBBB.xlsx",
            title: "見取り図",
            remarks: "構内の設備、動線、原材料などの見取り図"
        }],
        department: "情報システム部",
        mentioner: "デモ用ユーザー",
        taskType: [0, 1],
        milestone: [{
            date: "2021-09-30",
            explain: "課題の解決期限"
        }],
        contentType: [0],
    },
    detailInfluence: {
        text: "予兆診断で検知できない故障が年々増加しており、今年度は前年比5%(12件)増加。",
        files: [{
            name: "AAAA.xlsx",
            title: "売上推移",
            remarks: "2020年1月～４月"
        }],
        annualPlan: {
            achievementConditionList: [{
                id: 0,
                text: "売上高増加 10%"
            }, {
                id: 1,
                text: "コスト削減 20%"
            }],
            selectAchievementCondition: [0],
        },
        effect: {
            text: "設備が故障してからの対応となるため、修復するまでシステムが利用出来ない。稼働率の低下。",
            files: [{
            name: "AAAA.xlsx",
            title: "売上推移",
            remarks: "2020年1月～４月"
        }],
        },
        solve_cond: ["検知出来ない故障を10%削減"]
    },
    problemCause: [{
        text: "故障の予兆を検知するシステムで、検知出来ない故障が増加している。",
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
            {key:'1', department:'人事部', name:'赤城信二'},
            {key:'2', department:'システム部', name:'六田五郎'}
        ]
    },
    schedule: {
        startDate: "2021/01/01",
        unit: "月",
        term: "12ヶ月",
        gantt : {
            data: [
              { id: 101, text: "[マイルストーン] 課題の解決期限", type: 'milestone', start_date: "2021-9-30 00:00" },
                { id: 1, text: "[課題] 予兆診断で検知出来ない故障の増加", start_date: "2021-01-01 00:00", duration: 270, parent: 0, progress: 0, open: true, type: 'yearly' },
            ]
          }
    },
    resource: {
        contents:{
            budget : true,
            manhour : false,
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
            startYear : "2020",
            startMonth: "4",
            endYear : "2021",
            endMonth: "3",
            data: [
                [2, 40, 50, 60, 70, 80, 90, 100, 110, 120, 10, 20, 30]
            ]
        }
    }
}
export default data;
