/*
const data = {
  nodes: [
    {
      id: '0',
      label: '(JSON)解決すべき問題',
      x: 85,
      y: 55,
      color: '#FA8C16',
      shape: 'model-card',
    },
    {
      id: '1',
      label: '(JSON)問題はなぜ発生しましたか？',
      x: 355,
      y: 55,
      shape: 'model-card',
    },
    {
      id: '2',
      label: '(JSON)問題はなぜ発生しましたか？',
      x: 655,
      y: 55,
      shape: 'model-card',
    },
    {
      id: '3',
      label: '(JSON)問題はなぜ発生しましたか？',
      x: 655,
      y: 155,
      shape: 'model-card',
    },
  ],
  edges: [
    {
      source: '0',
      target: '1',
    },
    {
      source: '1',
      target: '2',
    },
    {
      source: '1',
      target: '3',
    },
  ],
}
*/

const data = {
  key:1,
  label: "解決すべき問題",
  children: [
    {
      key:2,
      label: "問題はなぜ発生しましたか？"
    },
    {
      key:3,
      label: "問題はなぜ発生しましたか？"
    },
    {
      key:4,
      label: "問題はなぜ発生しましたか？"
    }
  ]
};

export default data;
