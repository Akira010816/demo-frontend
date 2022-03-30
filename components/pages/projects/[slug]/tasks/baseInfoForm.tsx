import { ChangeEvent, FC, useEffect } from 'react'
import debounce from 'lodash.debounce'
import { Input, Select, Radio, Space } from 'antd'
import { displaySetting, taskStatusLabels, taskTypes } from '~/lib/displaySetting'
import FormItem from '~/components/form/FormItem'
import { FormInstance } from 'antd/es/form'
import { skipEnter } from '~/lib/keyDown'

const PAGE_ID = 'taskBaseInfoForm'

export type TaskBaseInfoFormProps = {
  form: FormInstance
  slug: Task['project_id']
  data: Pick<Task, 'name' | 'code' | 'taskType' | 'taskStatus'>
  onChange: (
    baseInfo: Partial<Pick<Task, 'name' | 'code' | 'taskType' | 'taskStatus'>>
  ) => Promise<void> | void
}

const TaskBaseInfoForm: FC<TaskBaseInfoFormProps> = ({ form, data, onChange }) => {
  useEffect(() => {
    form.setFieldsValue({ ...data })
  }, [data, form])

  return (
    <>
      <FormItem
        pageId={PAGE_ID}
        itemId={'taskCode'}
        wrapperCol={{ span: 6 }}
        initialValue={data.code}
        name={'code'}
      >
        <Input onKeyDown={skipEnter} size="middle" disabled={true} />
      </FormItem>
      <FormItem pageId={PAGE_ID} itemId={'taskName'} initialValue={data.name} name={'name'}>
        <Input
          onKeyDown={skipEnter}
          size="middle"
          name="name"
          onChange={debounce(
            (e: ChangeEvent<HTMLInputElement>) =>
              onChange({
                name: e.target.value,
              }),
            500
          )}
        />
      </FormItem>

      <FormItem
        pageId={PAGE_ID}
        itemId={'taskStatus'}
        wrapperCol={{ span: 4 }}
        initialValue={data.taskStatus}
        name={'taskStatus'}
      >
        <Select
          onKeyDown={skipEnter}
          size="middle"
          allowClear={true}
          onChange={(e) => onChange({ taskStatus: e?.toString() })}
        >
          {Object.entries(taskStatusLabels).map(([key, value]) => (
            <Select.Option key={key} value={key}>
              {value}
            </Select.Option>
          ))}
        </Select>
      </FormItem>
      <FormItem
        pageId={PAGE_ID}
        itemId={'taskType'}
        labelCol={{ span: 24 }}
        description={displaySetting[PAGE_ID].labelConfig.taskTypeDescription ?? ''}
        name={'taskType'}
      >
        <Radio.Group onChange={(e) => onChange({ taskType: e.target.value as Task['taskType'] })}>
          <Space direction="vertical">
            {Object.values(taskTypes).map((type, index) => (
              <Radio key={index} value={type.id}>
                {type.label}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </FormItem>
    </>
  )
}

export default TaskBaseInfoForm
