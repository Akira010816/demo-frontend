const data =  {
  history:
      [{
          date: '2021/02/3',
          status: 'on',
          progress: 10,
          text: '(JSON)特に問題なし'
      },
      {
          date: '2021/03/4',
          status: 'behind',
          progress: 13,
          text: '(JSON)遅れが生じています'
      }
      ],
  reportDate: '2021/4/16',
  status: 1,
  progress: {
      previous: 30,
      current: 45,
  },
  text: '(JSON)ようやく、技術的なハードルをクリアしましたので、これからは問題なく進む予定です。',
  delayInputUnit : 2,
  delayText : '原因はXXXXXです'
}

export default data;
