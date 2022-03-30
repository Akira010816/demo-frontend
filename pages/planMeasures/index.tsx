import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useToggle } from 'react-use'
import {
  Layout,
  Tabs,
  Space,
  Row,
  Divider,
  Typography,
  Input,
  Col,
  Form,
  message,
  Affix,
} from 'antd'
import { ButtonProps } from 'antd/es/button'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import {
  SelectPlanMeasuresTable,
  SelectPlanMeasureTableProps,
} from '~/components/planMeasure/selectPlanMeasuresTable'
import { PlanMeasuresTotalTable } from '~/components/planMeasure/planMeasuresTotalTable'
import {
  NextYearPlanMeasuresTable,
  NextYearPlanMeasuresTableProps,
} from '~/components/planMeasure/nextYearPlanMeasuresTable'
import { displaySetting, priceUnits } from '~/lib/displaySetting'
import { PriceUnitProps, PriceUnits } from '~/components/priceUnit'
import Button from '~/components/Button'
import Modal from '~/components/modal'
import { ModalFuncProps } from 'antd/es/modal'
import FormItem from '~/components/form/FormItem'
import { useAuth } from '~/hooks/useAuth'
import { useLazyQuery, useQuery } from '@apollo/client'
import {
  FIND_PLAN_MEASURES_BY_DEPARTMENT_ID,
  FindPlanMeasuresByDepartmentIdRequestInput,
  FindPlanMeasuresByDepartmentIdResponse,
} from '~/graphhql/queries/findPlanMeasuresByDepartmentId'
import { generatePlanMeasureRows, PlanMeasureRow } from '~/components/planMeasure/planMeasuresTable'
import { useMutation } from '@apollo/react-hooks'
import {
  COPY_PLAN_MEASURES,
  CopyPlanMeasuresRequest,
  CopyPlanMeasuresResponse,
} from '~/graphhql/mutations/copyPlanMeasures'
import {
  COPY_PLAN_MEASURE,
  CopyPlanMeasureRequest,
  CopyPlanMeasureResponse,
} from '~/graphhql/mutations/copyPlanMeasure'
import {
  COMPLETE_REGISTRATION_PLAN_MEASURES,
  CompleteRegistrationPlanMeasuresRequestTypes,
  CompleteRegistrationPlanMeasuresResponse,
} from '~/graphhql/mutations/completeRegistrationPlanMeasures'
import {
  FIND_PLAN_BY_DEPARTMENT_ID_AND_BUSINESS_YEAR,
  FindPlanByDepartmentIdAndBusinessYearRequestTypes,
  FindPlanByDepartmentIdAndBusinessYearResponse,
} from '~/graphhql/queries/findPlanByDepartmentIdAndBusinessYear'
import {
  DELETE_PLAN_MEASURE,
  DeletePlanMeasureRequest,
  DeletePlanMeasureResponse,
} from '~/graphhql/mutations/deletePlanMeasure'
import {
  FIND_ALL_USER_DEPARTMENTS_WITH_CHILDREN,
  FindAllUserDepartmentsWithChildrenResponse,
} from '~/graphhql/queries/findAllUserDepartmentsWithChildren'
import {
  FIND_ALL_BUSINESS_YEARS,
  FindAllBusinessYearsResponse,
} from '~/graphhql/queries/findAllBusinessYears'
import { useWindowEvent } from '~/hooks/useWindowEvent'
import { FIND_PRICE_UNIT, FindPriceUnit } from '~/graphhql/queries/findPriceUnit'
import {
  FIND_ALL_DEPARTMENTS,
  FindAllDepartmentsResponse,
} from '~/graphhql/queries/findAllDepartments'
import { youCanDoIt } from '~/lib/handlePermission'
import { PlusCircleOutlined } from '@ant-design/icons'

const PAGE_ID = 'planMeasures'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const PlanMeasures: FC = () => {
  const { TabPane } = Tabs
  const [confirmModalVisible, toggleConfirmModalVisible] = useToggle(false)
  const [copyConfirmModalVisible, toggleCopyConfirmModalVisible] = useToggle(false)
  const [deleteConfirmModalVisible, toggleDeleteConfirmModalVisible] = useToggle(false)
  const [targetYear, setTargetYear] = useState<number>()
  const thisYear = useMemo(() => (targetYear != undefined ? targetYear - 1 : undefined), [
    targetYear,
  ])
  const YEAR_RANGE = 5 // 5年間分のデータを取得
  const endYearIncludingThisYear = useMemo(
    () => (thisYear != undefined ? thisYear + YEAR_RANGE - 1 : undefined),
    [thisYear]
  )
  const endYearIncludingNextYear = useMemo(
    () => (targetYear != undefined ? targetYear + YEAR_RANGE - 1 : undefined),
    [targetYear]
  )
  const [currentPriceUnit, setCurrentPriceUnit] = useState<PriceUnit>()
  const { currentDepartmentId, profile, currentUserDepartmentId } = useAuth()
  const [comment, setComment] = useState<string>('')

  const { data: { findAllDepartments } = {} } = useQuery<FindAllDepartmentsResponse>(
    FIND_ALL_DEPARTMENTS,
    { fetchPolicy: 'no-cache' }
  )

  const [findAllBusinessYears] = useLazyQuery<FindAllBusinessYearsResponse>(
    FIND_ALL_BUSINESS_YEARS,
    {
      fetchPolicy: 'no-cache',
      onCompleted: (data) => {
        const date = new Date()
        date.setFullYear(date.getFullYear() + 1)
        const businessYear = data.findAllBusinessYears.find((value) => {
          const startDate = new Date(value.startYear, value.startMonth - 1, value.startDate)
          const endDate = new Date(value.endYear, value.endMonth - 1, value.endDate)
          endDate.setDate(endDate.getDate() + 1)
          return startDate <= date && date < endDate
        })
        setTargetYear(businessYear != undefined ? businessYear.startYear : undefined)
      },
    }
  )
  useEffect(() => findAllBusinessYears(), [findAllBusinessYears])

  const [targetDepartmentId, setTargetDepartmentId] = useState<number>()
  useEffect(() => {
    if (currentDepartmentId != undefined) {
      setTargetDepartmentId(currentDepartmentId)
    }
  }, [currentDepartmentId])

  const [nextYearPlan, setNextYearPlan] = useState<FindPlanByDepartmentIdAndBusinessYearResponse>()

  useEffect(() => {
    if (
      findAllDepartments != undefined &&
      targetDepartmentId != undefined &&
      targetDepartmentId != 0
    ) {
      if (
        nextYearPlan != undefined &&
        nextYearPlan.findPlanByDepartmentIdAndBusinessYear == undefined
      ) {
        const department = findAllDepartments.find((value) => value.id == targetDepartmentId)
        if (department != undefined) {
          if (department.parent != undefined && department.parent.id != 0) {
            setTargetDepartmentId(department.parent.id)
          }
        }
      }
    }
    // targetDepartmentIdの循環依存を避ける為eslintの警告を抑制
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findAllDepartments, nextYearPlan])

  const [findPlanByDepartmentIdAndBusinessYear] = useLazyQuery<
    FindPlanByDepartmentIdAndBusinessYearResponse,
    FindPlanByDepartmentIdAndBusinessYearRequestTypes
  >(FIND_PLAN_BY_DEPARTMENT_ID_AND_BUSINESS_YEAR, {
    fetchPolicy: 'no-cache',
    onCompleted: (data) => setNextYearPlan(data),
  })
  useEffect(() => {
    if (targetDepartmentId != undefined && targetYear != undefined) {
      findPlanByDepartmentIdAndBusinessYear({
        variables: {
          findPlanByDepartmentIdAndBusinessYearInput: {
            departmentId: targetDepartmentId,
            businessYear: targetYear,
          },
        },
      })
    }
  }, [findPlanByDepartmentIdAndBusinessYear, targetDepartmentId, targetYear])

  const planMeasureRegistrationRequest = useMemo(
    () =>
      nextYearPlan?.findPlanByDepartmentIdAndBusinessYear?.planMeasureRegistrationRequests?.filter(
        (request) =>
          request.plan?.id
            ? request.plan.id === nextYearPlan?.findPlanByDepartmentIdAndBusinessYear?.id
            : false
      )?.[0],
    [nextYearPlan]
  )

  const requestedBy = useMemo(() => planMeasureRegistrationRequest?.requestedBy, [
    planMeasureRegistrationRequest,
  ])

  const findThisYearPlanMeasuresVariables: FindPlanMeasuresByDepartmentIdRequestInput = useMemo(() => {
    return {
      findPlanMeasuresByDepartmentIdInput: {
        departmentId: currentDepartmentId ?? 0,
        startBusinessYear: thisYear, // 今年度の施策を取得
        endBusinessYear: thisYear, // 今年度の施策を取得
        startAggregationBusinessYear: thisYear, // 今年度を含め5年度分の集計データを酒奥
        endAggregationBusinessYear: endYearIncludingThisYear, // 今年度を含め5年度分の集計データを酒奥
      },
    }
  }, [currentDepartmentId, thisYear, endYearIncludingThisYear])
  const [
    thisYearPlanMeasures,
    setThisYearPlanMeasures,
  ] = useState<FindPlanMeasuresByDepartmentIdResponse>()
  const [findThisYearPlanMeasures] = useLazyQuery<
    FindPlanMeasuresByDepartmentIdResponse,
    FindPlanMeasuresByDepartmentIdRequestInput
  >(FIND_PLAN_MEASURES_BY_DEPARTMENT_ID, {
    variables: findThisYearPlanMeasuresVariables,
    fetchPolicy: 'no-cache',
    onCompleted: (response) => setThisYearPlanMeasures(response),
  })
  const fetchThisYearPlanMeasures = useCallback(() => {
    if (currentDepartmentId != undefined) {
      findThisYearPlanMeasures()
    }
  }, [currentDepartmentId, findThisYearPlanMeasures])
  useEffect(() => fetchThisYearPlanMeasures(), [
    fetchThisYearPlanMeasures,
    findThisYearPlanMeasuresVariables,
  ])

  const findNextYearPlanMeasuresVariables: FindPlanMeasuresByDepartmentIdRequestInput = useMemo(() => {
    return {
      findPlanMeasuresByDepartmentIdInput: {
        departmentId: currentDepartmentId ?? 0,
        createdByMe: true, // 自分が作成した施策のみ取得
        startBusinessYear: targetYear, // 次年度の施策を取得
        endBusinessYear: targetYear, // 次年度の施策を取得
        startAggregationBusinessYear: targetYear, // 次年度を含め5年度分の集計データを酒奥
        endAggregationBusinessYear: endYearIncludingNextYear, // // 次年度を含め5年度分の集計データを酒奥
      },
    }
  }, [currentDepartmentId, targetYear, endYearIncludingNextYear])
  const [
    nextYearPlanMeasures,
    setNextYearPlanMeasures,
  ] = useState<FindPlanMeasuresByDepartmentIdResponse>()
  const [findNextYearPlanMeasures] = useLazyQuery<
    FindPlanMeasuresByDepartmentIdResponse,
    FindPlanMeasuresByDepartmentIdRequestInput
  >(FIND_PLAN_MEASURES_BY_DEPARTMENT_ID, {
    variables: findNextYearPlanMeasuresVariables,
    onCompleted: (response) => {
      if (response?.findPlanMeasuresByDepartmentId.length) {
        setActiveTabKey(TAB_KEYS.nextYear)
      }
      setNextYearPlanMeasures(response)
    },
    fetchPolicy: 'no-cache',
  })
  const fetchNextYearPlanMeasures = useCallback(() => {
    if (currentDepartmentId != undefined) {
      findNextYearPlanMeasures()
    }
  }, [currentDepartmentId, findNextYearPlanMeasures])
  useEffect(() => fetchNextYearPlanMeasures(), [
    fetchNextYearPlanMeasures,
    findNextYearPlanMeasuresVariables,
  ])

  const handleRefreshOnTabActive = useCallback(() => {
    if (localStorage.getItem('shouldRefreshPlanMeasures') === 'true') {
      localStorage.setItem('shouldRefreshPlanMeasures', 'false')
      fetchThisYearPlanMeasures()
      fetchNextYearPlanMeasures()
    }
  }, [fetchNextYearPlanMeasures, fetchThisYearPlanMeasures])

  useWindowEvent('focus', handleRefreshOnTabActive, [
    fetchNextYearPlanMeasures,
    fetchThisYearPlanMeasures,
  ])

  const TAB_KEYS = {
    thisYear: 'thisYear',
    nextYear: 'nextYear',
  } as const

  type TabKey = typeof TAB_KEYS[keyof typeof TAB_KEYS]

  const [activeTabKey, setActiveTabKey] = useState<TabKey>(TAB_KEYS.thisYear)

  const [selectedPlanMeasureIds, setSelectedPlanMeasureIds] = useState<
    Array<Exclude<PlanMeasure['id'], undefined>>
  >([])

  const [planMeasureDelete, setPlanMeasureDelete] = useState<PlanMeasureRow | undefined>()

  const { data: userDepartmentsData } = useQuery<FindAllUserDepartmentsWithChildrenResponse>(
    FIND_ALL_USER_DEPARTMENTS_WITH_CHILDREN,
    {
      fetchPolicy: 'no-cache',
    }
  )

  const planMeasureRowsFromThisYear = useMemo(
    () =>
      thisYearPlanMeasures?.findPlanMeasuresByDepartmentId.flatMap((planMeasure) =>
        generatePlanMeasureRows(
          planMeasure,
          userDepartmentsData?.findAllUserDepartmentsWithChildren ?? []
        )
      ) ?? [],
    [
      thisYearPlanMeasures?.findPlanMeasuresByDepartmentId,
      userDepartmentsData?.findAllUserDepartmentsWithChildren,
    ]
  )

  const planMeasureRowsFromNextYear = useMemo(
    () =>
      nextYearPlanMeasures?.findPlanMeasuresByDepartmentId.flatMap((planMeasure) =>
        generatePlanMeasureRows(
          planMeasure,
          userDepartmentsData?.findAllUserDepartmentsWithChildren ?? []
        )
      ) ?? [],
    [
      nextYearPlanMeasures?.findPlanMeasuresByDepartmentId,
      userDepartmentsData?.findAllUserDepartmentsWithChildren,
    ]
  )

  const onPriceUnitChange: PriceUnitProps['onChange'] = (_, priceUnit) => {
    setCurrentPriceUnit(priceUnit)
  }

  const onConfirm: ButtonProps['onClick'] = () => {
    toggleConfirmModalVisible()
  }

  const [completeRegistration] = useMutation<
    CompleteRegistrationPlanMeasuresResponse,
    CompleteRegistrationPlanMeasuresRequestTypes
  >(COMPLETE_REGISTRATION_PLAN_MEASURES, {
    onCompleted: async () => {
      toggleConfirmModalVisible()
      setComment('')
      notificationForm.setFieldsValue({ comment: '' })
      message.success(labelConfig.completeRegistrationPlanMeasuresSuccess)
    },
    onError: async () => {
      message.error(labelConfig.completeRegistrationPlanMeasuresError)
    },
  })

  const onNotify: ModalFuncProps['onOk'] = async () => {
    await completeRegistration({
      variables: {
        completeRegistrationPlanMeasuresInput: {
          planMeasureRegistrationRequestId: planMeasureRegistrationRequest?.id ?? 0,
          comment,
        },
      },
    })
  }

  const [copyPlanMeasures, { loading: copyingPlanMeasures }] = useMutation<
    CopyPlanMeasuresResponse,
    CopyPlanMeasuresRequest
  >(COPY_PLAN_MEASURES, {
    refetchQueries: [
      {
        query: FIND_PLAN_MEASURES_BY_DEPARTMENT_ID,
        variables: findNextYearPlanMeasuresVariables,
      },
    ],
    onCompleted: async () => {
      await message.success(labelConfig.copyPlanMeasuresSuccess)
    },
    onError: async () => {
      await message.error(labelConfig.copyPlanMeasuresError)
    },
  })

  const onCopyPlanMeasures: ModalFuncProps['onOk'] = async () => {
    try {
      if (thisYear != undefined && endYearIncludingThisYear != undefined) {
        await copyPlanMeasures({
          variables: {
            copyPlanMeasuresInput: {
              planMeasureIds: selectedPlanMeasureIds,
              startBusinessYear: thisYear,
              endBusinessYear: endYearIncludingThisYear,
              copyToNextYear: true,
            },
          },
        })
      }
    } finally {
      toggleCopyConfirmModalVisible()
    }
  }

  const [copyPlanMeasure, { loading: copyingPlanMeasure }] = useMutation<
    CopyPlanMeasureResponse,
    CopyPlanMeasureRequest
  >(COPY_PLAN_MEASURE, {
    refetchQueries: [
      {
        query: FIND_PLAN_MEASURES_BY_DEPARTMENT_ID,
        variables: findNextYearPlanMeasuresVariables,
      },
    ],
    onCompleted: async () => {
      findNextYearPlanMeasures()
      await message.success(labelConfig.copyPlanMeasureSuccess)
    },
    onError: async () => {
      await message.error(labelConfig.copyPlanMeasureError)
    },
  })

  const onCopyPlanMeasure: NextYearPlanMeasuresTableProps['onCopy'] = (
    planMeasureRow
  ) => async () => {
    if (targetYear != undefined && endYearIncludingNextYear != undefined) {
      await copyPlanMeasure({
        variables: {
          copyPlanMeasureInput: {
            planMeasureId: planMeasureRow.id,
            startBusinessYear: targetYear,
            endBusinessYear: endYearIncludingNextYear,
            copyToNextYear: false,
          },
        },
      })
    }
  }

  const [deletePlanMeasure, { loading: deletingPlanMeasurePrices }] = useMutation<
    DeletePlanMeasureResponse,
    DeletePlanMeasureRequest
  >(DELETE_PLAN_MEASURE, {
    // refetchQueries: [
    //   {
    //     query: FIND_PLAN_MEASURES_BY_DEPARTMENT_ID,
    //     variables: findNextYearPlanMeasuresVariables,
    //   },
    // ],
    onCompleted: async () => {
      findNextYearPlanMeasures()
      toggleDeleteConfirmModalVisible(false)
      setPlanMeasureDelete(undefined)
      await message.success(labelConfig.deletePlanMeasureSuccess)
    },
    onError: async () => {
      await message.error(labelConfig.deletePlanMeasureError)
    },
  })

  const onClickShowPopupDeleteConfirm: NextYearPlanMeasuresTableProps['onCopy'] = (
    planMeasureRow
  ) => async () => {
    setPlanMeasureDelete(planMeasureRow)
    toggleDeleteConfirmModalVisible(true)
  }

  const onDeletePlanMeasurePrices = async (): Promise<void> => {
    await deletePlanMeasure({
      variables: {
        deletePlanMeasureInput: {
          id: planMeasureDelete?.id,
          version: planMeasureDelete?.version || 1,
        },
      },
    })
  }

  const onSelectPlanMeasure: SelectPlanMeasureTableProps['onSelectPlanMeasure'] = (
    id,
    selectedPlanMeasureIds
  ) => {
    setSelectedPlanMeasureIds(selectedPlanMeasureIds)
  }

  const [notificationForm] = Form.useForm()
  const { data: defaultPriceUnit } = useQuery<FindPriceUnit>(FIND_PRICE_UNIT)
  useEffect(() => {
    if (defaultPriceUnit) {
      setCurrentPriceUnit(
        priceUnits.filter(
          (priceUnit) => priceUnit.digitLength === defaultPriceUnit.findPriceUnit?.digitLength
        )[0]
      )
    }
  }, [defaultPriceUnit])

  return (
    <PageTitleContext.Provider value={labelConfig.pageTitle} key={labelConfig.pageTitle}>
      <MainLayout>
        <Layout>
          <Row>
            <Button type="default" onClick={onConfirm}>
              {labelConfig.confirmButton}
            </Button>
            <Divider />
          </Row>

          <Modal.Confirm
            visible={copyConfirmModalVisible}
            onCancel={toggleCopyConfirmModalVisible}
            okText={labelConfig.copyPlanMeasuresButton}
            onOk={onCopyPlanMeasures}
            loading={copyingPlanMeasures}
          >
            <Typography.Text>{labelConfig.copyPlanMeasuresConfirmText}</Typography.Text>
          </Modal.Confirm>
          <Modal.Confirm
            visible={deleteConfirmModalVisible}
            onCancel={() => toggleDeleteConfirmModalVisible(false)}
            okText={labelConfig.deletePlanMeasuresButton}
            onOk={onDeletePlanMeasurePrices}
            loading={deletingPlanMeasurePrices}
          >
            <Typography.Text>{labelConfig.deletePlanMeasuresConfirmText}</Typography.Text>
          </Modal.Confirm>

          <Modal.Normal
            visible={confirmModalVisible}
            onCancel={toggleConfirmModalVisible}
            okText={labelConfig.notifyButton}
            cancelButtonProps={{ type: 'ghost' }}
            onOk={onNotify}
            cancelText={labelConfig.cancelBtn}
          >
            <Form form={notificationForm} component={'div'}>
              <Typography.Title level={5}>
                {labelConfig.planMeasureRegisteredNotification}
              </Typography.Title>
              <Divider />
              <Space direction={'vertical'} style={{ width: '100%' }}>
                <Col>
                  <Typography.Paragraph>
                    施策登録の完了を{requestedBy?.user.name}さんに通知します。
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                    コメントがある場合はコメントを入力してください。
                  </Typography.Paragraph>
                </Col>
                <Col style={{ marginTop: '1rem', width: '100%' }}>
                  <Typography.Paragraph>{labelConfig.comment}</Typography.Paragraph>
                  <FormItem
                    pageId={PAGE_ID}
                    itemId={''}
                    name={'comment'}
                    wrapperCol={{ span: 24 }}
                    labelCol={{ span: 0 }}
                    initialValue={comment}
                  >
                    <Input.TextArea
                      autoSize={{ minRows: 5, maxRows: 15 }}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </FormItem>
                </Col>
              </Space>
            </Form>
          </Modal.Normal>

          <Space direction={'vertical'}>
            <Row align={'middle'}>
              <Space>
                <Space>
                  <Typography.Text strong>{labelConfig.targetYear}: </Typography.Text>
                  <Typography.Text strong>{targetYear ?? ''}年度</Typography.Text>
                </Space>
              </Space>
            </Row>

            <Row style={{ maxHeight: 0, position: 'relative' }}>
              <Space style={{ position: 'absolute', left: '345px', top: '4px', zIndex: 100 }}>
                <Typography.Text>単位</Typography.Text>
                {currentPriceUnit && (
                  <PriceUnits defaultValue={currentPriceUnit.type} onChange={onPriceUnitChange} />
                )}
              </Space>
              <Tabs
                type="card"
                style={{ width: '100%' }}
                activeKey={activeTabKey}
                onChange={(key) => setActiveTabKey(key as TabKey)}
              >
                <TabPane tab={labelConfig.thisYearResultsTabName} key={TAB_KEYS.thisYear}>
                  <Space>
                    <Button
                      type="default"
                      onClick={toggleCopyConfirmModalVisible}
                      disabled={
                        !selectedPlanMeasureIds.length ||
                        !(profile
                          ? youCanDoIt(profile, currentUserDepartmentId, 'planMeasureEditMode')
                          : false)
                      }
                    >
                      {labelConfig.copyPlanMeasureButton}
                    </Button>
                    <Typography.Text>{labelConfig.copyPlanMeasureDesc}</Typography.Text>
                  </Space>
                  <Divider />
                  <SelectPlanMeasuresTable
                    startYear={thisYear ?? 0}
                    endYear={endYearIncludingThisYear ?? 0}
                    priceUnit={currentPriceUnit || priceUnits[0]}
                    planMeasureRows={planMeasureRowsFromThisYear}
                    onSelectPlanMeasure={onSelectPlanMeasure}
                    canCopy={
                      profile
                        ? youCanDoIt(profile, currentUserDepartmentId, 'planMeasureEditMode')
                        : false
                    }
                  />
                </TabPane>

                <TabPane tab={labelConfig.nextYearPlansTabName} key={TAB_KEYS.nextYear}>
                  <style jsx>{`
                    :global(.ant-affix) {
                      background-color: #f5f5f5;
                    }
                  `}</style>
                  <Affix offsetTop={0}>
                    <div>
                      <Space>
                        <Button
                          type="default"
                          onClick={() => window.open('planMeasures/new', 'createPlanMeasure')}
                          disabled={
                            !(profile
                              ? youCanDoIt(profile, currentUserDepartmentId, 'planMeasureEditMode')
                              : false)
                          }
                        >
                          <PlusCircleOutlined />
                          {labelConfig.addPlanMeasureButton}
                        </Button>
                        <Typography.Text>{labelConfig.addPlanMeasureDesc}</Typography.Text>
                      </Space>
                      <Divider />
                      <PlanMeasuresTotalTable
                        startYear={targetYear ?? 0}
                        endYear={endYearIncludingNextYear ?? 0}
                        priceUnit={currentPriceUnit || priceUnits[0]}
                        planMeasureRows={planMeasureRowsFromNextYear}
                        clickableName={false}
                      />
                      <Divider />
                    </div>
                  </Affix>
                  <NextYearPlanMeasuresTable
                    startYear={targetYear ?? 0}
                    endYear={endYearIncludingNextYear ?? 0}
                    priceUnit={currentPriceUnit || priceUnits[0]}
                    planMeasureRows={planMeasureRowsFromNextYear}
                    onCopy={onCopyPlanMeasure}
                    loading={copyingPlanMeasure || deletingPlanMeasurePrices}
                    onDelete={onClickShowPopupDeleteConfirm}
                  />
                </TabPane>
              </Tabs>
            </Row>
          </Space>
        </Layout>
      </MainLayout>
    </PageTitleContext.Provider>
  )
}
export default PlanMeasures
