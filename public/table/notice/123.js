const data =  [
    {
      date: '2021年1月31日',
      verification: '未確認',
      type: '承認依頼',
      content: '(JSON)XXさんから、年間計画の承認依頼があります。対象：令和?年度',
      url: '/approvals',
    },
    {
      date: '2021年1月28日',
      verification: '確認済',
      type: 'レビュー依頼',
      content: '(JSON)XXさんから、課題のレビュー依頼があります。課題名：XXXXX',
      url: '/reviews/new',
    },
    {
      date: '2021年1月22日',
      verification: '確認済',
      type: 'アラート',
      content: '(JSON)課題の対応期限が過ぎています。課題名：XXXXX',
      url: '/taskRegistration/main',
    },
    {
      date: '2021年1月20日',
      verification: '確認済',
      type: '課題オーナー',
      content: '(JSON)課題オーナーに設定されました。課題名：XXXXX',
      url: '/taskRegistration/main',
    },
    {
      date: '2021年1月15日',
      verification: '確認済',
      type: '施策責任者',
      content: '(JSON)施策責任者に設定されました。施策名：XXXXX',
      url: '/measures/main',
    },
    {
      date: '2021年1月7日',
      verification: '確認済',
      type: 'システム',
      content: {
        detail:"(JSON)詳細な内容です",
        text : '(JSON)1月8日 20:00～21:00の時間帯は、利用出来ません'
      },
      url: '/measures/main',
    },
    {
      date: '2021年1月5日',
      verification: '確認済',
      type: 'その他',
      content: {
        detail:"(JSON)詳細な内容です",
        text : '(JSON)X付X日に契約終了日を迎えます。必要な手続きを行って下さい。'
      },
      url: '/measures/main',
    },
  ]

export default data;
