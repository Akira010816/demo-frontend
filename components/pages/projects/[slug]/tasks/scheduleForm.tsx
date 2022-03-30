import React, { FC, useEffect } from 'react'
import moment from 'moment'
import { DatePicker } from 'antd'
import { FormInstance } from 'antd/es/form'
import FormItem from '~/components/form/FormItem'
import { dateFormat, displaySetting } from '~/lib/displaySetting'

export type TaskScheduleFormProps = {
  projectId: Task['project_id']
  data: {
    startDate: Task['startDate']
    endDate: Task['endDate']
  }
  form: FormInstance
  onChange: ({ startDate, endDate }: Partial<Pick<Task, 'startDate' | 'endDate'>>) => void
}

const PAGE_ID = 'taskSchedule'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const TaskScheduleForm: FC<TaskScheduleFormProps> = ({ form, onChange, data }) => {
  useEffect(() => {
    form.setFieldsValue({
      startDate: moment(data.startDate, dateFormat),
      endDate: moment(data.endDate, dateFormat),
    })
  }, [data.endDate, data.startDate, form])

  return (
    <>
      <FormItem name="startDate" pageId={PAGE_ID} itemId="startDate">
        <DatePicker
          placeholder={labelConfig.startDatePlaceholder}
          format={dateFormat}
          value={moment(data.startDate, dateFormat)}
          onChange={(e) => {
            e &&
              onChange({
                startDate: e.format(dateFormat),
              })
          }}
        />
      </FormItem>
      <FormItem name="endDate" pageId={PAGE_ID} itemId="endDate">
        <DatePicker
          placeholder={labelConfig.endDatePlaceholder}
          format={dateFormat}
          value={moment(data.endDate, dateFormat)}
          onChange={(e) => {
            e &&
              onChange({
                endDate: e.format(dateFormat),
              })
          }}
        />
      </FormItem>
    </>
  )
}

export default TaskScheduleForm
