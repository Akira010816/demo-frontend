import React, { ChangeEvent, FC, useEffect, useMemo, useState } from 'react'
import update from 'immutability-helper'
import debounce from 'lodash.debounce'
import { Checkbox, Col, Divider, Input, Row, Select, Typography } from 'antd'
import Table from '../table'
import { FormInstance } from 'antd/es/form'
import { SelectProps, SelectValue } from 'antd/es/select'
import { ColumnsType } from 'antd/es/table'
import FormItem from '~/components/form/FormItem'
import {
  displaySetting,
  measureImplementationTaskParticipantScopeRoles,
  measureImplementationTaskTypes,
} from '~/lib/displaySetting'
import { useQuery } from '@apollo/client'
import { FIND_ALL_SYSTEMS, FindAllSystemsResponse } from '~/graphhql/queries/findAllSystems'
import {
  FIND_ALL_IT_ASSET_TYPES,
  FindAllItAssetTypesResponse,
} from '~/graphhql/queries/findAllItAssetTypes'
import { CheckboxValueType } from 'antd/es/checkbox/Group'
import Button from '~/components/Button'
import ChargeSelectModal from '~/components/charge/chargeSelectModal'
import { skipEnter } from '~/lib/keyDown'

export type ImplementationTaskDetailFormProps = {
  form: FormInstance<{ measureImplementationTasks: Array<MeasureImplementationTask> }>
  measureImplementationTask: MeasureImplementationTask
  onChange: (measureImplementationTask: MeasureImplementationTask) => Promise<void> | void
}

const PAGE_ID = 'measureImplementationTaskDetailForm'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const defaultParticipants = [{ name: '', role: '', location: '' }]
const defaultScopes = [{ name: '' }]
const defaultParticipantScopeRoles = [
  [measureImplementationTaskParticipantScopeRoles.manager.value],
]

const MeasureImplementationTaskDetailForm: FC<ImplementationTaskDetailFormProps> = ({
  onChange,
  ...props
}) => {
  const { data: systemsData } = useQuery<FindAllSystemsResponse>(FIND_ALL_SYSTEMS)
  const { data: itAssetTypesData } = useQuery<FindAllItAssetTypesResponse>(FIND_ALL_IT_ASSET_TYPES)

  const systems = systemsData?.findAllSystems ?? []
  const itAssetTypes = itAssetTypesData?.findAllItAssetTypes ?? []
  const defaultTargetSystem = systems[0]

  const measureImplementationTask: MeasureImplementationTask = useMemo(
    () => ({
      ...(props.measureImplementationTask ?? {}),
      type:
        props.measureImplementationTask?.type ??
        measureImplementationTaskTypes.introduceNewSystem.key,
      targetSystem: props.measureImplementationTask?.targetSystem ?? defaultTargetSystem,
      affectedSystems: props.measureImplementationTask?.affectedSystems ?? [],
      purchaseTargets: props.measureImplementationTask?.purchaseTargets ?? [],
      abandonmentTargets: props.measureImplementationTask?.abandonmentTargets ?? [],
      participants: props.measureImplementationTask?.participants ?? defaultParticipants,
      scopes: props.measureImplementationTask?.scopes ?? defaultScopes,
      participantScopeRoles:
        props.measureImplementationTask?.participantScopeRoles ?? defaultParticipantScopeRoles,
    }),
    [defaultTargetSystem, props.measureImplementationTask]
  )

  const onTypeChange: SelectProps<ImplementationTaskType>['onChange'] = (e) => {
    onChange(update(measureImplementationTask, { type: { $set: e } }))
  }

  const measureImplementationTaskId = props?.measureImplementationTask?.id ?? 0

  type RoleColumn = {
    rowKey: string
    name: string
    role: string
    location: string
  }

  const [showSelectChargeModal, setShowSelectChargeModal] = useState<boolean>(false)
  const [targetParticipantIndex, setTargetParticipantIndex] = useState<number>()

  const roleColumns: ColumnsType<RoleColumn> = useMemo(
    () => [
      {
        title: labelConfig.tableColumnMeasureParticipant,
        width: '40%',
        key: 'participants',
        dataIndex: 'name',
        render: (participant, column, index) => {
          return {
            children: (
              <Row>
                <Col span={12}>
                  <FormItem
                    wrapperColSpan={24}
                    pageId={PAGE_ID}
                    itemId={`measureImplementationTaskRoleParticipant`}
                    label={''}
                    name={[
                      'measureImplementationTasks',
                      measureImplementationTaskId,
                      'participants',
                      index,
                      'name',
                    ]}
                    style={{ marginBottom: 0 }}
                    initialValue={participant}
                  >
                    <Input
                      onKeyDown={skipEnter}
                      onChange={debounce((e: ChangeEvent<HTMLInputElement>) => {
                        onChange(
                          update(measureImplementationTask, {
                            participants: { [index]: { name: { $set: e.target.value } } },
                          })
                        )
                      }, 500)}
                    />
                  </FormItem>
                </Col>
                <Col span={4} offset={1}>
                  <Button
                    type={'primary'}
                    onClick={() => {
                      setTargetParticipantIndex(index)
                      setShowSelectChargeModal(!showSelectChargeModal)
                    }}
                  >
                    一覧から選択
                  </Button>
                </Col>
              </Row>
            ),
            props: {},
          }
        },
      },
      {
        title: labelConfig.tableColumnMeasureRole,
        width: '30%',
        key: 'roles',
        dataIndex: 'role',
        render: (role, column, index) => ({
          children: (
            <FormItem
              wrapperColSpan={24}
              pageId={PAGE_ID}
              itemId={`measureImplementationTaskRoleRole`}
              label={''}
              name={[
                'measureImplementationTasks',
                measureImplementationTaskId,
                'participants',
                index,
                'role',
              ]}
              style={{ marginBottom: 0 }}
              initialValue={role}
            >
              <Input
                onKeyDown={skipEnter}
                onChange={debounce(
                  (e: ChangeEvent<HTMLInputElement>) =>
                    onChange(
                      update(measureImplementationTask, {
                        participants: { [index]: { role: { $set: e.target.value } } },
                      })
                    ),
                  500
                )}
              />
            </FormItem>
          ),
          props: {},
        }),
      },
      {
        title: labelConfig.tableColumnMeasureLocation,
        width: '30%',
        key: 'locations',
        dataIndex: 'location',
        render: (location, colum, index) => ({
          children: (
            <FormItem
              wrapperColSpan={24}
              pageId={PAGE_ID}
              itemId={`measureImplementationTaskRoleLocation`}
              label={''}
              name={[
                'measureImplementationTasks',
                measureImplementationTaskId,
                'participants',
                index,
                'location',
              ]}
              style={{ marginBottom: 0 }}
              initialValue={location}
            >
              <Input
                onKeyDown={skipEnter}
                onChange={debounce(
                  (e: ChangeEvent<HTMLInputElement>) =>
                    onChange(
                      update(measureImplementationTask, {
                        participants: { [index]: { location: { $set: e.target.value } } },
                      })
                    ),
                  500
                )}
              />
            </FormItem>
          ),
          props: {},
        }),
      },
    ],
    [measureImplementationTask, measureImplementationTaskId, onChange]
  )

  const roleData = useMemo(
    () =>
      measureImplementationTask?.participants?.map((participant, index) => ({
        rowKey: `${measureImplementationTaskId}-role-column-${index}`,
        name: participant.name ?? '',
        role: participant.role ?? '',
        location: participant.location ?? '',
      })),
    [measureImplementationTask?.participants, measureImplementationTaskId]
  )

  type ScopeColumn = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    scope: string
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    rowKey: string
    [key: string]: number
  }

  const scopeColumns: ColumnsType<ScopeColumn> = useMemo(
    () => [
      {
        title: labelConfig.tableColumnMeasureScopeRole,
        key: 'scope',
        dataIndex: 'scope',
        render: (scope: ScopeColumn['scope'], column, index) => ({
          children: (
            <FormItem
              wrapperColSpan={24}
              pageId={PAGE_ID}
              itemId={`measureImplementationTaskScopeScope`}
              name={[
                'measureImplementationTasks',
                measureImplementationTaskId,
                'scopes',
                index,
                'name',
              ]}
              label={''}
              style={{ marginBottom: 0 }}
              initialValue={scope}
            >
              <Input
                onKeyDown={skipEnter}
                onChange={debounce((e: ChangeEvent<HTMLInputElement>) => {
                  onChange(
                    update(measureImplementationTask, {
                      scopes: { [index]: { name: { $set: e.target.value } } },
                    })
                  )
                }, 500)}
              />
            </FormItem>
          ),
        }),
      },
      ...(measureImplementationTask.participants?.map((participant, participantIndex) => ({
        title: participant.name,
        key: `participant-${participantIndex}`,
        dataIndex: `participant-${participantIndex}`,
        render: (scopeRole: ScopeColumn['participant-id'], column: ScopeColumn, index: number) => ({
          children: (
            <FormItem
              wrapperColSpan={24}
              pageId={PAGE_ID}
              itemId={`measureImplementationTaskScopeRole`}
              name={[
                'measureImplementationTasks',
                measureImplementationTaskId,
                'participantScopeRoles',
                index,
                participantIndex,
              ]}
              label={''}
              style={{ marginBottom: 0, textAlign: 'center' }}
              initialValue={scopeRole}
            >
              <Select
                onKeyDown={skipEnter}
                onChange={(e: SelectValue) => {
                  onChange(
                    update(measureImplementationTask, {
                      participantScopeRoles: {
                        [index]: {
                          [participantIndex]: {
                            $set: e as MeasureImplementationTaskParticipantScopeRole,
                          },
                        },
                      },
                    })
                  )
                }}
              >
                {Object.values(measureImplementationTaskParticipantScopeRoles).map(
                  (role, index) => (
                    <Select.Option
                      key={`implementation-task-scope-role-option-${index}-${participantIndex}`}
                      value={role.value}
                    >
                      {role.icon}
                    </Select.Option>
                  )
                )}
              </Select>
            </FormItem>
          ),
        }),
      })) ?? []),
    ],
    [measureImplementationTask, measureImplementationTaskId, onChange]
  )

  const scopeData = useMemo(
    () =>
      measureImplementationTask.scopes?.map(({ name }, scopeIndex) => ({
        rowKey: `${measureImplementationTaskId}-scope-column-${scopeIndex}`,
        scope: name,
        ...measureImplementationTask.participants?.reduce(
          (acc, current, participantIndex) =>
            Object.assign({}, acc, {
              [`participant-${participantIndex}`]: measureImplementationTask
                .participantScopeRoles?.[scopeIndex]?.[participantIndex],
            }),
          {}
        ),
      })) as Array<ScopeColumn>,
    [
      measureImplementationTask.participantScopeRoles,
      measureImplementationTask.participants,
      measureImplementationTask.scopes,
      measureImplementationTaskId,
    ]
  )

  useEffect(() => {
    props.form.setFieldsValue({
      measureImplementationTasks: update(props.form.getFieldValue('measureImplementationTasks'), {
        [measureImplementationTaskId]: {
          $set: {
            ...measureImplementationTask,
            targetSystem: measureImplementationTask.targetSystem?.id,
          },
        },
      }),
    })
  }, [
    measureImplementationTask,
    measureImplementationTaskId,
    props.form,
    props.measureImplementationTask,
  ])

  const AffectedSystems: FC = () => {
    return (
      <FormItem
        pageId={PAGE_ID}
        itemId={'affectedSystems'}
        name={['measureImplementationTasks', measureImplementationTaskId, 'affectedSystems']}
        initialValue={
          measureImplementationTask.affectedSystems?.map(
            (affectedSystem) => affectedSystem.id ?? 0
          ) ?? []
        }
        valuePropName={'checked'}
      >
        <Checkbox.Group
          options={systems.map((system) => ({
            label: system.name ?? '',
            value: system.id ?? -1,
          }))}
          value={
            measureImplementationTask.affectedSystems?.map(
              (affectedSystem) => affectedSystem.id ?? 0
            ) ?? []
          }
          onChange={(values: CheckboxValueType[]) => {
            onChange(
              update(measureImplementationTask, {
                affectedSystems: {
                  $set: systems.filter((system) => values.includes(system.id ?? -1)),
                },
              })
            )
          }}
        />
      </FormItem>
    )
  }

  const TargetSystems: FC = () => {
    return (
      <FormItem
        pageId={PAGE_ID}
        itemId={'targetSystem'}
        name={['measureImplementationTasks', measureImplementationTaskId, 'targetSystem']}
        initialValue={measureImplementationTask.targetSystem?.id}
      >
        <Select
          onKeyDown={skipEnter}
          onChange={(e) => {
            const targetSystem = systems.filter((system) => system.id === e)?.[0]
            onChange(
              update(measureImplementationTask, {
                targetSystem: { $set: targetSystem },
              })
            )
          }}
        >
          {systems.map((system) => (
            <Select.Option key={`target-system-${system.id}`} value={system.id ?? -1}>
              {system.name}
            </Select.Option>
          ))}
        </Select>
      </FormItem>
    )
  }

  const PurchaseTargets: FC = () => {
    return (
      <FormItem
        pageId={PAGE_ID}
        itemId={'purchaseTarget'}
        name={['measureImplementationTasks', measureImplementationTaskId, 'purchaseTargets']}
        valuePropName={'checked'}
      >
        <Checkbox.Group
          options={itAssetTypes.map((itAssetType) => ({
            label: itAssetType.code ?? '',
            value: itAssetType.id ?? -1,
          }))}
          value={
            measureImplementationTask.purchaseTargets?.map(
              (purchaseTarget) => purchaseTarget.id ?? -1
            ) ?? []
          }
          onChange={(values: CheckboxValueType[]) => {
            onChange(
              update(measureImplementationTask, {
                purchaseTargets: {
                  $set: itAssetTypes.filter((itAssetType) => values.includes(itAssetType.id ?? -1)),
                },
              })
            )
          }}
        />
      </FormItem>
    )
  }

  const AbandonmentTargets: FC = () => {
    return (
      <FormItem
        pageId={PAGE_ID}
        itemId={'abandonmentTarget'}
        name={['measureImplementationTasks', measureImplementationTaskId, 'abandonmentTargets']}
        valuePropName={'checked'}
        initialValue={
          measureImplementationTask.abandonmentTargets?.map(
            (abandonmentTarget) => abandonmentTarget.id ?? -1
          ) ?? []
        }
      >
        <Checkbox.Group
          options={itAssetTypes.map((itAssetType) => ({
            label: itAssetType.code ?? '',
            value: itAssetType.id ?? -1,
          }))}
          value={
            measureImplementationTask.abandonmentTargets?.map(
              (abandonmentTarget) => abandonmentTarget.id ?? -1
            ) ?? []
          }
          onChange={(values) => {
            onChange(
              update(measureImplementationTask, {
                abandonmentTargets: {
                  $set: itAssetTypes.filter((itAssetType) => values.includes(itAssetType.id ?? -1)),
                },
              })
            )
          }}
        />
      </FormItem>
    )
  }

  return (
    <Col>
      <FormItem
        pageId={PAGE_ID}
        itemId={'type'}
        initialValue={measureImplementationTask.type}
        name={['measureImplementationTasks', measureImplementationTaskId, 'type']}
      >
        <Select onChange={onTypeChange} onKeyDown={skipEnter}>
          {Object.values(measureImplementationTaskTypes).map((taskType, index) => (
            <Select.Option key={`implementation-task-type-${index}`} value={taskType.key}>
              {taskType.label}
            </Select.Option>
          ))}
        </Select>
      </FormItem>

      <Col>
        {(() => {
          switch (measureImplementationTask.type) {
            case measureImplementationTaskTypes.introduceNewSystem.key:
              return (
                <>
                  <FormItem
                    pageId={PAGE_ID}
                    itemId={'newSystemName'}
                    initialValue={measureImplementationTask.newSystemName}
                    name={[
                      'measureImplementationTasks',
                      measureImplementationTaskId,
                      'newSystemName',
                    ]}
                  >
                    <Input
                      onKeyDown={skipEnter}
                      onChange={debounce(
                        (e: ChangeEvent<HTMLInputElement>) =>
                          onChange(
                            update(measureImplementationTask, {
                              newSystemName: { $set: e.target.value },
                            })
                          ),
                        500
                      )}
                    />
                  </FormItem>
                  <FormItem
                    pageId={PAGE_ID}
                    itemId={'systemOverview'}
                    initialValue={measureImplementationTask.systemOverview}
                    name={[
                      'measureImplementationTasks',
                      measureImplementationTaskId,
                      'systemOverview',
                    ]}
                  >
                    <Input
                      onKeyDown={skipEnter}
                      onChange={debounce(
                        (e: ChangeEvent<HTMLInputElement>) =>
                          onChange(
                            update(measureImplementationTask, {
                              systemOverview: { $set: e.target.value },
                            })
                          ),
                        500
                      )}
                    />
                  </FormItem>
                  {systems.length ? <AffectedSystems /> : null}
                </>
              )

            case measureImplementationTaskTypes.rebuildExistingSystem.key:
              return (
                <>
                  {systems.length ? <TargetSystems /> : null}
                  {systems.length ? <AffectedSystems /> : null}
                </>
              )

            case measureImplementationTaskTypes.modifyExistingSystem.key:
              return (
                <>
                  {systems.length ? <TargetSystems /> : null}

                  <FormItem
                    pageId={PAGE_ID}
                    itemId={'modificationDescription'}
                    name={[
                      'measureImplementationTasks',
                      measureImplementationTaskId,
                      'modificationDescription',
                    ]}
                    initialValue={measureImplementationTask.modificationDescription}
                  >
                    <Input.TextArea
                      onChange={debounce((e: ChangeEvent<HTMLTextAreaElement>) => {
                        onChange(
                          update(measureImplementationTask, {
                            modificationDescription: { $set: e.target.value },
                          })
                        )
                      }, 500)}
                    />
                  </FormItem>

                  {systems.length ? <AffectedSystems /> : null}
                </>
              )

            case measureImplementationTaskTypes.purchase.key:
              return <>{itAssetTypes.length ? <PurchaseTargets /> : null}</>

            case measureImplementationTaskTypes.abandon.key:
              return <>{itAssetTypes.length ? <AbandonmentTargets /> : null}</>

            case measureImplementationTaskTypes.implementPoc.key:
              return (
                <>
                  <FormItem
                    pageId={PAGE_ID}
                    itemId={'implementationDetail'}
                    name={[
                      'measureImplementationTasks',
                      measureImplementationTaskId,
                      'implementationDetail',
                    ]}
                    initialValue={measureImplementationTask.implementationDetail}
                  >
                    <Input.TextArea
                      onChange={debounce((e: ChangeEvent<HTMLTextAreaElement>) => {
                        onChange(
                          update(measureImplementationTask, {
                            implementationDetail: { $set: e.target.value },
                          })
                        )
                      }, 500)}
                    />
                  </FormItem>
                </>
              )

            case measureImplementationTaskTypes.investigate.key:
              return (
                <>
                  <FormItem
                    pageId={PAGE_ID}
                    itemId={'investigationDetail'}
                    name={[
                      'measureImplementationTasks',
                      measureImplementationTaskId,
                      'investigationDescription',
                    ]}
                    initialValue={measureImplementationTask.investigationDescription}
                  >
                    <Input.TextArea
                      onChange={debounce((e: ChangeEvent<HTMLTextAreaElement>) => {
                        onChange(
                          update(measureImplementationTask, {
                            investigationDescription: { $set: e.target.value },
                          })
                        )
                      }, 500)}
                    />
                  </FormItem>
                </>
              )

            case measureImplementationTaskTypes.procure.key:
              return (
                <>
                  <FormItem
                    pageId={PAGE_ID}
                    itemId={'procurementDetail'}
                    name={[
                      'measureImplementationTasks',
                      measureImplementationTaskId,
                      'procurementDescription',
                    ]}
                    initialValue={measureImplementationTask.procurementDescription}
                  >
                    <Input.TextArea
                      onChange={debounce((e: ChangeEvent<HTMLTextAreaElement>) => {
                        onChange(
                          update(measureImplementationTask, {
                            procurementDescription: { $set: e.target.value },
                          })
                        )
                      }, 500)}
                    />
                  </FormItem>

                  <FormItem
                    pageId={PAGE_ID}
                    itemId={'procurementScope'}
                    name={[
                      'measureImplementationTasks',
                      measureImplementationTaskId,
                      'procurementScope',
                    ]}
                    initialValue={measureImplementationTask.procurementScope}
                  >
                    <Input.TextArea
                      onChange={debounce((e: ChangeEvent<HTMLTextAreaElement>) => {
                        onChange(
                          update(measureImplementationTask, {
                            procurementScope: { $set: e.target.value },
                          })
                        )
                      }, 500)}
                    />
                  </FormItem>
                </>
              )

            case measureImplementationTaskTypes.other.key:
              return (
                <>
                  <FormItem
                    pageId={PAGE_ID}
                    itemId={'implementTarget'}
                    name={[
                      'measureImplementationTasks',
                      measureImplementationTaskId,
                      'implementTarget',
                    ]}
                    initialValue={measureImplementationTask.implementTarget}
                  >
                    <Input.TextArea
                      onChange={debounce((e: ChangeEvent<HTMLTextAreaElement>) => {
                        onChange(
                          update(measureImplementationTask, {
                            implementTarget: { $set: e.target.value },
                          })
                        )
                      }, 500)}
                    />
                  </FormItem>
                </>
              )
          }
        })()}
      </Col>

      <Divider />

      <Row>
        <Col span={4}>
          <Typography.Paragraph>
            {labelConfig.tableColumnMeasureParticipantRoleLocationTitle}
          </Typography.Paragraph>
        </Col>
        <Col span={20}>
          <Row style={{ flexFlow: 'row' }}>
            <Table
              columns={roleColumns}
              dataSource={roleData}
              pagination={false}
              size={'small'}
              rowKey={'rowKey'}
              style={{ width: '100%', marginRight: '20px' }}
              addable={true}
              onAddRow={() => {
                onChange({
                  ...(measureImplementationTask ?? {}),
                  participants: [
                    ...(measureImplementationTask.participants ?? []),
                    ...defaultParticipants,
                  ],
                })
              }}
              onDeleteRow={(_, index) => {
                onChange({
                  ...(measureImplementationTask ?? {}),
                  participants:
                    measureImplementationTask.participants?.filter(
                      (participant, participantIndex) => index !== participantIndex
                    ) ?? [],
                })
              }}
            />
          </Row>
        </Col>
      </Row>

      <Divider />

      <Row justify={'end'}>
        {Object.values(measureImplementationTaskParticipantScopeRoles).map((role, index) => (
          <Row key={`role-icon-${role.value}`}>
            <Typography.Paragraph style={{ marginRight: '3px' }}>{role.icon}</Typography.Paragraph>
            <Typography.Paragraph
              style={{
                marginRight:
                  index === Object.keys(measureImplementationTaskParticipantScopeRoles).length - 1
                    ? 0
                    : '10px',
              }}
            >
              {role.label}
            </Typography.Paragraph>
          </Row>
        ))}
      </Row>
      <ChargeSelectModal
        visible={showSelectChargeModal}
        onSelected={(rows) => {
          let targetName = ''
          if (rows.user) {
            targetName = rows.user[0].name
          } else if (rows.company) {
            targetName = rows.company[0].name
          } else if (rows.department) {
            targetName = rows.department[0].name
          }
          if (targetParticipantIndex !== undefined) {
            onChange(
              update(measureImplementationTask, {
                participants: { [targetParticipantIndex]: { name: { $set: targetName } } },
              })
            )
            const current = props.form.getFieldsValue()
            if (
              current.measureImplementationTasks[current.measureImplementationTasks.length - 1]
                .participants?.[targetParticipantIndex].name !== undefined
            ) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              current.measureImplementationTasks[
                current.measureImplementationTasks.length - 1
              ].participants[targetParticipantIndex].name = targetName
            }
            props.form.setFieldsValue(current)
          }
          setShowSelectChargeModal(false)
        }}
        selectType={'radio'}
        onCancel={() => setShowSelectChargeModal(false)}
      />

      <Row>
        <Col span={4}>
          <Typography.Paragraph>{labelConfig.tableColumnMeasureScopeTitle}</Typography.Paragraph>
        </Col>
        <Col span={20}>
          <Row style={{ flexFlow: 'row' }}>
            <Table
              columns={scopeColumns}
              dataSource={scopeData}
              pagination={false}
              size={'small'}
              rowKey={'rowKey'}
              style={{ width: '100%', marginRight: '20px' }}
              addable={true}
              onAddRow={() => {
                onChange({
                  ...(measureImplementationTask ?? {}),
                  scopes: [...(measureImplementationTask.scopes ?? []), ...defaultScopes],
                  participantScopeRoles: [
                    ...(measureImplementationTask.participantScopeRoles ?? []),
                    ...defaultParticipantScopeRoles,
                  ],
                })
              }}
              onDeleteRow={(_, index) => {
                onChange({
                  ...(measureImplementationTask ?? {}),
                  scopes:
                    measureImplementationTask.scopes?.filter(
                      (_, scopeIndex) => index !== scopeIndex
                    ) ?? [],
                  participantScopeRoles:
                    measureImplementationTask.participantScopeRoles?.filter(
                      (_, roleIndex) => index !== roleIndex
                    ) ?? [],
                })
              }}
            />
          </Row>
        </Col>
      </Row>
    </Col>
  )
}

export default MeasureImplementationTaskDetailForm
