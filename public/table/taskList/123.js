const data =  [
  {
    text: '[課題] (JSON)XXXXXX',
    type: 'task',
    children: [
      {
        text: '[問題] (JSON)XXXXXX',
        type: 'problem',
        children: [
          {
            text: '[原因] (JSON)XXXXXX',
            type: 'cause',
            children: [
              {
                text: '[施策] (JSON)XXXXXX',
                type: 'measures',
                children: [
                  {
                    type: 'procurement',
                    text: '[調達] (JSON)XXXXXX',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    text: '[課題] (JSON)XXXXXX',
    type: 'task',
    info: 'warn',
  },
  {
    text: '[課題] (JSON)XXXXXX',
    type: 'task',
  },
]
export default data;
