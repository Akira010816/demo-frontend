const data = {
  baseInfo: {
    measure_nm: 'AI導入施策-123',
    prerequisites: '前提条件123',
    solve_cond: [{
        text: "条件Aの時にアラートが表示されること",
        check: true
      },
      {
        text: "部品１が原因だと特定出来ること",
        check: false
      },
    ],
    effect_method: '効果測定方法',
  },
  imple_detail:{
    imple_mean: '新システム導入',
    use_tech:'AI',
    external_cooperation:'Google Cloud Platform',
  },
  schedule: {
    disp_start_date: "2021/01/01",
    unit: "月",
    term: "11ヶ月",
    gantt: {
      data: [{
        id: 1,
        text: "[マイルストーン] (JSON)予兆診断システムを改修する場合の期限（8月から大型改修を控えているため）",
        start_date: "2021-07-31 00:00",
        type: 'milestone',
        parent: 0
      },
      {
        id: 2,
        text: "[課題] (JSON)予兆診断で検知出来ない故障の増加",
        start_date: "2021-01-01 00:00",
        parent: 0,
        duration: 365,
        overdue: true
      },
      {
        id: 10,
        text: "[対策] (JSON)予兆診断の条件追加",
        start_date: "2021-02-01 00:00",
        duration: 30,
        parent: 2,
        progress: 0,
        type: 'measure'
      },
      {
        id: 11,
        text: "[施策] (JSON)予兆診断システムの改修（アラート条件追加）",
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
      unit: "千円",
      input_method: 1,
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
      input_method_term: 0,
      input_method_dept: 1,
      startYear: "2020",
      endYear: "2021",
      data: [
        [2, 1, 2, 3, 4]
      ]
    }
  }
}

//施策案名	MEASURE_NM	VARCHAR	200
//前提事項	PREREQUISITES	VARCHAR	2048
//解決条件	SOLVE_COND	VARCHAR	2048
//効果測定方法	EFFECT_METHOD	VARCHAR	2048

//実施手段	IMPLE_MEAN	VARCHAR	2048

//開始日	START_DATE	DATE
//日付表示単位	DATE_DISP_UNIT_NM	VARCHAR	20
//日付表示期間	DATE_DISP_TERM_NM	VARCHAR	20

//スケジュール

//登録内容
//予算の単位
//入力方法	INPUT_METHOD	CHAR	1
//テーブル

//工数の入力方法（期間）
//工数の入力方法（組織）
//テーブル

export default data;
