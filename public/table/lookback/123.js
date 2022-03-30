const data =
{
  occur_problem:'新たに発生した問題はXXXXXです',
  resolutionStatus:[{ text: "(JSON)AAAAAAA", check: false }, { text: "(JSON)BBBBBBB", check: false }],
  problem: [{
    text: "(JSON)故障の予兆を検知するシステムで、検知出来ない故障が増加している。",
    status: 0,
    frequency: 1,
    frequencyRemark: "週5回",
    cause: [
      {
        text: "(JSON)センサーの数値は正常だが、センサーAの値＞センサーBの値となった時に故障が発生する。",
        accuracy: 0,
        condition: "(JSON)センサーAの値＞センサーBの値となった時にアラートが表示されること。",
        correspondenceList: [{
          text: "条件1 XXXXXXXX",
          check: true
        }, {
          text: "条件2 YYYYYYYY",
          check: false
        }],
        lookback: {
          status: 1,
          effect: '効果はXXXX',
          unresolvedSituation: '未解決の状況はXXXXXX',
          introspectionImprovement: '反省・改善点はXXXXXX',
        }
      },
      {
        text: "(JSON)装置の動作異常発生",
        accuracy: 1,
        condition: "メーカに修理をしてもらう",
        correspondenceList: [{
          text: "条件1 XXXXXXXX",
          check: true
        }, {
          text: "条件2 YYYYYYYY",
          check: false
        }],
        lookback: {
          status: 2,
          effect: '効果はYYYYYY',
          unresolvedSituation: '未解決の状況はZZZZZZ',
          introspectionImprovement: '反省・改善点はZZZZZZZ',
        }
      },
    ],
  }]
}
export default data;
