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
                  title: '課題 (JSON)XXXXX',
                  key: '0-0-0-1',
                  children: [
                    {
                      title: '対策1 (JSON)XXXXX',
                      key: '0-0-0-0-1',
                      children: [
                        { title: '調達1 (JSON)XXXXX', key: '0-0-0-0-1-1' },
                        { title: '調達2 (JSON)XXXXX', key: '0-0-0-0-1-2' },
                      ],
                    },
                    {
                      title: '対策2 (JSON)XXXXX',
                      key: '0-0-0-0-2',
                      children: [
                        {
                          title: '調達1 [未登録] (JSON)XXXXX',
                          key: '0-0-0-0-2-1',
                        },
                      ],
                    },
                  ],
                },
                { title: '課題 (JSON)XXXXX', key: '0-0-0-1-2' },
              ],
            },
          ],
        },
      ],
    baseInfo: {
        id: "1234567890",
        name: "予兆診断システムの構築",
        implementation: 0,
        milestone: [{
            date: "2021-12-01",
            explain: "システム稼働開始"
        }],
    },
    RFP: {
        document: [{
                documentName: "予兆診断システム開発提案依頼書1",
                templateType: "システム再構築",
                items: [{
                        label: "資料名",
                        type: "input",
                        value: "予兆診断システム開発提案依頼書-JSON1"
                    },
                    {
                        label: "",
                        type: "divider",
                    },

                    {
                        label: "1 プロジェクト概要",
                        type: "none",
                        level: 1,
                    },
                    {
                        label: "1.1 プロジェクトの背景",
                        type: "text",
                        level: 2,
                        value: "事業企画部門と共通業務部門の集約による業務合理化／企画機能高度化を目指し、コスト削減／顧客満足度向上を実現する。                   経営の意志決定に資する経営情報管理・分析機能の強化を目指し、意思決定の迅速化を実現する"
                    },
                    {
                        label: "1.2 プロジェクトの目的",
                        type: "text",
                        level: 2,
                        value: "事業計画／中長期システム戦略概要に立脚した経営支援システムの再構築を実施し、企業価値を向上させることを目的とする。"
                    },
                    {
                        label: "1.3 プロジェクトの前提条件",
                        type: "none",
                        level: 2
                    },

                    {
                        label: "品質目標（Q）",
                        type: "text",
                        level: 3,
                        value: "別紙 「品質要件」に記載してある要件を満たすこと"
                    },
                    {
                        label: "目標金額（C）",
                        type: "text",
                        level: 3,
                        value: "システム設計・ソフト開発・システムテスト工程作業の目標金額は、XXX 円である。（ハードは含まない）"
                    },
                    {
                        label: "スケジュール目標（D）",
                        type: "text",
                        level: 3,
                        value: "本プロジェクトの期間は、20XX 年XX 月～20XX 年XX 月とする。"
                    },

                    {
                        label: "2 システム概要",
                        type: "none",
                        level: 1
                    },
                    {
                        label: "2.1 システム全体図",
                        type: "none",
                        level: 2
                    },
                    {
                        label: "2.2 システム化機能一覧",
                        type: "none",
                        level: 2
                    },
                    {
                        label: "2.3 システムの使用者",
                        type: "none",
                        level: 2
                    },
                ]
            },
            {
                documentName: "予兆診断システム開発-別紙",
                templateType: "システム再構築",
                items: [{
                        label: "資料名",
                        type: "input",
                        value: "XXシステム開発提案依頼書-JSON2"
                    },
                    {
                        label: "",
                        type: "divider",
                    },

                    {
                        label: "1 プロジェクト概要",
                        type: "none",
                        level: 1,
                    },
                    {
                        label: "1.1 プロジェクトの背景",
                        type: "text",
                        level: 2,
                        value: "事業企画部門と共通業務部門の集約による業務合理化／企画機能高度化を目指し、コスト削減／顧客満足度向上を実現する。                   経営の意志決定に資する経営情報管理・分析機能の強化を目指し、意思決定の迅速化を実現する"
                    },
                    {
                        label: "1.2 プロジェクトの目的",
                        type: "text",
                        level: 2,
                        value: "事業計画／中長期システム戦略概要に立脚した経営支援システムの再構築を実施し、企業価値を向上させることを目的とする。"
                    },
                    {
                        label: "1.3 プロジェクトの前提条件",
                        type: "none",
                        level: 2
                    },

                    {
                        label: "品質目標（Q）",
                        type: "text",
                        level: 3,
                        value: "別紙 「品質要件」に記載してある要件を満たすこと"
                    },
                    {
                        label: "目標金額（C）",
                        type: "text",
                        level: 3,
                        value: "システム設計・ソフト開発・システムテスト工程作業の目標金額は、XXX 円である。（ハードは含まない）"
                    },
                    {
                        label: "スケジュール目標（D）",
                        type: "text",
                        level: 3,
                        value: "本プロジェクトの期間は、20XX 年XX 月～20XX 年XX 月とする。"
                    },

                    {
                        label: "2 システム概要",
                        type: "none",
                        level: 1
                    },
                    {
                        label: "2.1 システム全体図",
                        type: "none",
                        level: 2
                    },
                    {
                        label: "2.2 システム化機能一覧",
                        type: "none",
                        level: 2
                    },
                    {
                        label: "2.3 システムの使用者",
                        type: "none",
                        level: 2
                    },
                ]
            }

        ],
        requestDestination: [
            "株式会社AAAAAA",
            "株式会社BBBBBB",
            "株式会社CCCCCC"
        ],

    },
    question: [
        ["1", "2020/11/1", "ユーザー１", "最初にXXXとありますが、これはYYYしてからZZするという解釈でよろしいか", "2-2", "2020/11/2", "OKです"],
        ["2", "2020/11/2", "ユーザー２", "次にXXXとありますが、これはYYYしてからZZするという解釈でよろしいか", "2-2", "2020/11/3", "OKです"],
    ],

    proposal: [
        ["株式会社AAAAAA", "登録済"],
        ["株式会社BBBBBB", "登録済"],
        ["株式会社CCCCCC", "未登録"]
    ],

    evalution: {
        table: [
            [false, "株式会社AAAAAA", "5", "5", "5", "15"],
            [true, "株式会社BBBBBB", "10", "10", "10", "30"],
            [false, "株式会社CCCCCC", "8", "8", "8", "24"],
        ],
        reason: "費用が一番低いため",
    },

    contract: {
        contractor:"株式会社BBBBBB",
        contractDocument:
        [
            "基本契約書", "個別契約書A",
        ]
    },

    schedule: {
        startDate: "2021/01/01",
        unit: "月",
        term: "12ヶ月",
        gantt : {
            data: [
                {id:1, text:"[マイルストーン] システム稼働開始", start_date:"2021-12-01 00:00", type: 'milestone',   parent:0},
                {id: 2, text: "[課題] 予兆診断で検知出来ない故障の増加",start_date: "2021-01-01 00:00", parent:0, duration:365,  overdue: true},
                {id: 10, text: "[対策] 予兆診断の条件追加", start_date: "2021-02-01 00:00", duration:30, parent:2, progress: 0, type: 'measure'},
                {id: 11, text: "[施策] 予兆診断システムの改修（アラート条件追加）", start_date: "2021-04-01 00:00", duration: 90, parent: 10, progress: 0, type: 'measure'},
                {id: 12, text: "[調達] 予兆診断システムの構築", start_date: "2021-04-10 00:00", duration: 10, parent: 11, progress: 0, type: 'procurement'},
              ]
        }
    },
    resource:{
        budgetRegistration:true,
        budgetValue:100,
        unit:'万円'
    }
}
export default data;
