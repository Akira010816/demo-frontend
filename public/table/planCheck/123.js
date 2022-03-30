const randomValue = () => { return Math.random() * 100 }
const randomValue2 = () => {
    let v1 = randomValue();
    let v2 = randomValue();
    return [Math.floor(v1), Math.floor(v2)]
}
const createRandomMonthValue = () => {
    let s1 = 0;
    let s2 = 0;

    let obj = {}
    let mv = [...Array(12).keys()].map((key) => {
        let m = 'm' + (key + 1).toString();
        let values = randomValue2();
        s1 += values[0];
        s2 += values[1];
        obj[m] = values[0] + ',' + values[1];
    });
    obj['sum'] = s1.toString() + ','+s2.toString()
    return obj;
}

const data =  {
  disp_start_date: '2020/4/8',
  input_content: 2,
  date_disp_unit_nm: '月',
  date_disp_term_nm: '12ヶ月',
  disp_target: "2",
  filter_raised_dept_nm: '部署A',
  filter_status: '（すべて）',
  filter_task_owner: '（すべて）',
  table:[
    {
      key: 1,
      class_nm: ' (JSON)中長期',
      general_id: 'MDLG-60',
      title: 'XXXXXXXXXXX-1',
      ...createRandomMonthValue(),
      children: [
          {
              key: 11,
              class_nm: '(JSON)年間',
              general_id: 'ANL-61',
              title: 'XXXXXXXXXXX-1',
              ...createRandomMonthValue(),
              children: [
                  {
                      key: 12,
                      class_nm: '(JSON)課題',
                      general_id: 'TK-10261',
                      title: 'XXXXXXXXXXX-1',
                      ...createRandomMonthValue(),
                      children: [
                          {
                              key: 121,
                              class_nm: '(JSON)施策',
                              general_id: 'MES-10261',
                              title: 'XXXXXXXXXXX-1',
                              ...createRandomMonthValue(),
                          },
                          {
                              key: 122,
                              class_nm: '(JSON)施策',
                              general_id: 'MES-10161',
                              title: 'XXXXXXXXXXX-1',
                              ...createRandomMonthValue(),
                              children: [
                                  {
                                      key: 122,
                                      class_nm: '(JSON)調達',
                                      general_id: 'MES-20261',
                                      title: 'XXXXXXXXXXX-1',
                                      ...createRandomMonthValue(),
                                  }
                              ]
                          },
                      ],
                  },
                  {
                      key: 13,
                      class_nm: '(JSON)課題',
                      general_id: 'MES-20261',
                      title: 'XXXXXXXXXXX-1',
                      ...createRandomMonthValue(),
                      children: [
                          {
                              key: 131,
                              class_nm: '(JSON)課題',
                              general_id: 'MES-10291',
                              title: 'XXXXXXXXXXX-1',
                              ...createRandomMonthValue(),
                              children: [
                                  {
                                      key: 1311,
                                      class_nm: '(JSON)施策',
                                      general_id: 'MES-40261',
                                      title: 'XXXXXXXXXXX-1',
                                      ...createRandomMonthValue(),
                                  },
                                  {
                                      key: 1312,
                                      class_nm: '(JSON)施策',
                                      general_id: 'MES-10161',
                                      title: 'XXXXXXXXXXX-1',
                                      ...createRandomMonthValue(),
                                  },
                              ],
                          },
                          {
                              key: 132,
                              class_nm: '(JSON)課題',
                              general_id: 'MES-10221',
                              title: 'XXXXXXXXXXX-1',
                              ...createRandomMonthValue(),
                          }
                      ],
                  },
              ],
          }
      ]
  },
  {
      key: 2,
      class_nm: '(JSON)年間',
      general_id: 'MES-10261',
      title: 'XXXXXXXXXXX-1',
      ...createRandomMonthValue(),
  },
  {
      key: 3,
      class_nm: '(JSON)年間',
      general_id: 'MES-10261',
      title: 'XXXXXXXXXXX-1',
      ...createRandomMonthValue(),
  },
]
}
export default data;
