const data = {
    planTree: [
        {
            title: '中長期計画  (JSON)XXXXXX',
            key: '0-0',
        },
    ],
    base: {
        id: 1234,
        name: "既存事業の利益率向上",
        abstract: "AI技術の活用により製品競争力の強化や、多様なニーズへの対応を行う。",
        range: 1,
        department: ["製造部"],
        date: {
            start: "2021/04/01",
            end: "2024/03/31"
        },
        condition: ["売上高 1,000億円", "営業利益率 15%"],
        milestone: [{
            date: "2021/5/5",
            explain: "最初のまとめ"
        }],
        parentCondition: [{
            text: "XXXXXXXX-1",
            check: false
        }, {
            text: "XXXXXXXX-2",
            check: true
        }]
    },
    resource: {
        contents: {
            budget: 1,
            manhour: 0
        },
        columns: ["2020年上期", "2020年下期", "2021年上期", "2021年下期"],
        budget: {
            unit: "千円",
            termMethod: 1,
            subjectMethod: 0,
            departmentMethod: 1,

            data: [
                [1, 100, 200, 300, 400],
                [2, 500, 600, 700, 800]
            ]
        },
        manhour: {
            inputMethod: 1,
            data: [
                [1, 1000, 2000, 3000, 4000],
                [2, 5000, 6000, 7000, 8000]
            ]
        }
    }
}
export default data;
