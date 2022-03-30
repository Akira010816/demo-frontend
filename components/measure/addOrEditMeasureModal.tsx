import { FC, useEffect, useState } from 'react'
import { Form, Layout, Menu as ADMenu, message } from 'antd'
import { MenuItemProps } from 'antd/es/menu/MenuItem'
import { AddOrEditMeasureModalProps } from './types'
import BaseInfoForm from './baseInfoForm'
import ImplementationTaskForm from './measureImplementationTaskForm'
import { ScheduleForm } from './scheduleForm'
import Modal from '~/components/modal'
import { SaveOrCancel } from '~/components/SaveOrCancel'
import { useMutation } from '@apollo/react-hooks'
import { costUnitLabels, displaySetting } from '~/lib/displaySetting'
import {
  CREATE_MEASURE,
  CreateMeasureRequestVars,
  CreateMeasureResponse,
  generateCreateMeasureInputFromEntity,
} from '~/graphhql/mutations/createMeasure'
import {
  generateUpdateMeasureInputFromEntity,
  UPDATE_MEASURE,
  UpdateMeasureRequestVars,
  UpdateMeasureResponse,
} from '~/graphhql/mutations/updateMeasure'
import { FIND_ALL_MEASURES } from '~/graphhql/queries/findAllMeasures'
import { ModalProps } from 'antd/es/modal'
import { ValidateErrorEntity } from '../../types/exception'

import MeasureImplementationEffectForm from '~/components/measure/measureImplementationEffectForm'

const ACTIVE_TABS = {
  OVERVIEW: {
    key: 'overview',
    label: '概要',
  },
  IMPLEMENTATION_TASK: {
    key: 'task',
    label: '実施タスク',
  },
  IMPLEMENTATION_EFFECT: {
    key: 'effect',
    label: '実施効果',
  },
  SCHEDULE: {
    key: 'schedule',
    label: 'スケジュール',
  },
}

const PAGE_ID = 'addOrEditMeasureModal'
const labelConfig = displaySetting[PAGE_ID].labelConfig

/**
 * 施策の追加/編集モーダル
 */
export const AddOrEditMeasureModal: FC<AddOrEditMeasureModalProps> = (props) => {
  const [form] = Form.useForm()
  const [activeTabKey, setActiveTabKey] = useState<string>(ACTIVE_TABS.OVERVIEW.key)

  const [measure, setMeasure] = useState<Measure>({
    name: '',
    overview: '',
    costUnit: costUnitLabels[0],
    measureImplementationTasks: [],
    measureImplementationEffects: [],
    causeConditions: [],
    links: [],
  })

  useEffect(() => {
    setMeasure(props.counterColumn?.measure?.entity ?? {})
  }, [props.counterColumn?.measure])

  const [createMeasure] = useMutation<CreateMeasureResponse, CreateMeasureRequestVars>(
    CREATE_MEASURE,
    {
      refetchQueries: [{ query: FIND_ALL_MEASURES }],
      onCompleted: async () => {
        message.success(labelConfig.createMeasureSuccess)
      },
      onError: async () => {
        message.error(labelConfig.createMeasureFailure)
      },
    }
  )

  const [updateMeasure] = useMutation<UpdateMeasureResponse, UpdateMeasureRequestVars>(
    UPDATE_MEASURE,
    {
      refetchQueries: [{ query: FIND_ALL_MEASURES }],
      onCompleted: async () => {
        message.success(labelConfig.updateMeasureSuccess)
      },
      onError: async (error) => {
        const textMessage = error.message ?? labelConfig.updateMeasureFailure
        message.error(textMessage)
      },
    }
  )

  const onTabClick: MenuItemProps['onClick'] = ({ key }) => {
    setActiveTabKey(key.toString())
  }

  const onSave = async (): Promise<void> => {
    try {
      // validate all fields first
      await form.validateFields()
      if (props.counterColumn?.measure.isAddMeasure) {
        const { data } = await createMeasure({
          variables: { createMeasureInput: generateCreateMeasureInputFromEntity(measure) },
        })
        if (data?.createMeasure) {
          props.onSave?.(props.counterColumn, data.createMeasure, false)
        }
      } else {
        const { data } = await updateMeasure({
          variables: { updateMeasureInput: generateUpdateMeasureInputFromEntity(measure) },
        })
        if (data?.updateMeasure) {
          props.onSave?.(props.counterColumn, data.updateMeasure, true)
        }
      }

      setActiveTabKey(ACTIVE_TABS.OVERVIEW.key)
    } catch (err) {
      const error = err as ValidateErrorEntity
      if (error && error.errorFields && error.errorFields.length) {
        for (const errorField of error.errorFields) {
          const firstErrorName = errorField.name[0]

          if (firstErrorName === 'name') {
            setActiveTabKey(ACTIVE_TABS.OVERVIEW.key)
            break
          }

          if (firstErrorName === 'measureImplementationTasks') {
            setActiveTabKey(ACTIVE_TABS.IMPLEMENTATION_TASK.key)
            break
          }

          if (
            firstErrorName === 'measureImplementationEffects' ||
            firstErrorName === 'causeConditions'
          ) {
            setActiveTabKey(ACTIVE_TABS.IMPLEMENTATION_EFFECT.key)
            break
          }
        }
      }
    }
  }

  const onCancel: ModalProps['onCancel'] = (e) => {
    props.onCancel?.(e)
    setActiveTabKey(ACTIVE_TABS.OVERVIEW.key)
  }

  return (
    <Modal.Normal
      {...props}
      /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      footer={[<SaveOrCancel key={'modal-footer'} onCancel={onCancel} onSave={onSave} />]}
      onCancel={onCancel}
    >
      <Layout className={'content-root'}>
        <Layout.Sider
          style={{
            backgroundColor: 'rgba(255,255,255,1.0)',
            borderRight: '1px solid rgba(230,230,230,1.0)',
          }}
        >
          <ADMenu
            defaultSelectedKeys={[ACTIVE_TABS.OVERVIEW.key]}
            mode="inline"
            selectedKeys={[activeTabKey]}
            activeKey={activeTabKey}
          >
            {Object.entries(ACTIVE_TABS).map(([, { key, label }]) => (
              <ADMenu.Item key={key} onClick={onTabClick}>
                {label}
              </ADMenu.Item>
            ))}
          </ADMenu>
        </Layout.Sider>

        <Form
          form={form}
          layout="horizontal"
          validateMessages={{ required: '${name}は必須項目です' }}
          style={{ width: '100%', overflow: 'hidden' }}
          component="div"
        >
          <div style={{ display: activeTabKey === ACTIVE_TABS.OVERVIEW.key ? 'block' : 'none' }}>
            <BaseInfoForm
              form={form}
              baseInfo={{ code: measure.code, name: measure.name, overview: measure.overview }}
              onChange={(baseInfo) => {
                setMeasure({ ...measure, ...baseInfo })
              }}
            />
          </div>

          <div
            style={{
              display: activeTabKey === ACTIVE_TABS.IMPLEMENTATION_TASK.key ? 'block' : 'none',
            }}
          >
            <ImplementationTaskForm
              measureImplementationTasks={measure.measureImplementationTasks ?? []}
              onChange={({ measureImplementationTasks }) => {
                setMeasure({ ...measure, measureImplementationTasks: measureImplementationTasks })
              }}
            />
          </div>

          <div
            style={{
              display: activeTabKey === ACTIVE_TABS.IMPLEMENTATION_EFFECT.key ? 'block' : 'none',
            }}
          >
            <MeasureImplementationEffectForm
              form={form}
              costUnit={measure.costUnit}
              measureImplementationEffects={measure.measureImplementationEffects ?? []}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              causeConditions={props.counterColumn?.proposal?.entity?.causeConditions ?? []}
              measureCauseConditions={measure.causeConditions ?? []}
              onChange={({ measureImplementationEffects, measureCauseConditions, costUnit }) => {
                setMeasure({
                  ...measure,
                  measureImplementationEffects:
                    measureImplementationEffects ?? measure.measureImplementationEffects,
                  causeConditions: measureCauseConditions ?? measure.causeConditions,
                  costUnit: costUnit ?? measure.costUnit,
                })
              }}
            />
          </div>

          <div style={{ display: activeTabKey === ACTIVE_TABS.SCHEDULE.key ? 'block' : 'none' }}>
            <ScheduleForm
              form={form}
              links={measure.links || []}
              measureImplementationTasks={measure.measureImplementationTasks ?? []}
              onChange={({ measureImplementationTasks, links }) => {
                setMeasure({
                  ...measure,
                  measureImplementationTasks,
                  links: links,
                })
              }}
            />
          </div>
        </Form>
      </Layout>
    </Modal.Normal>
  )
}
