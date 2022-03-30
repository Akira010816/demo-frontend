import { Col, DatePicker, Divider, Form, Input, Layout, Row, Select, Tag } from 'antd'
import React, { FC, useEffect, useState } from 'react'
import MainLayout, { PageTitleContext } from '../../layouts/main'
import { title } from '../style'
import UserSelectModal from '../../components/user/userSelectModal'
import Button from '../../components/Button'
import { DivTableBody, DivTableHeader } from '~/components/divTable'
import SelectDepartment from '../../components/department/selectDepartment'
import FormItem from '../../components/form/FormItem'
import { dateFormat, displaySetting, priorityLabels } from '~/lib/displaySetting'
import MilestoneForm from '~/components/milestone/form'
import { CREATE_PROJECT, CreateProjectRequestTypes } from '~/graphhql/mutations/createProject'
import { Project } from '~/graphhql/queries/findAllProjects'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import { internalDateFormat } from '~/lib/date'
import { FIND_PROFILE, FindProfileResponse } from '~/graphhql/queries/findProfile'
import moment from 'moment'
import { skipEnter } from '~/lib/keyDown'
import AddableInput, { ADDABLE_INPUT_INDEX_PLACEHOLDER } from '~/components/input/addableInput'

const PAGE_ID = 'projectCreate'

const ProjectCreateForm: FC = () => {
  const [projectMembers, setProjectMembers] = useState<Array<ProjectMember>>()
  const [form] = Form.useForm()
  const [visibleOwnerSelectModal, setVisibleOwnerSelectModal] = useState<boolean>(false)
  const [visibleMemberSelectModal, setVisibleMemberSelectModal] = useState<boolean>(false)
  const [visibleRaisedUserSelectModal, setVisibleRaisedUserSelectModal] = useState<boolean>(false)
  const [defaultRaisedUserId, setDefaultRaisedUserId] = useState<number>()
  const [defaultOwner, setDefaultOwner] = useState<number>()
  const [defaultMembers, setDefaultMembers] = useState<Array<number>>()
  const [defaultInputOwner, setDefaultInputOwner] = useState<string>()

  const [create] = useMutation<Project, CreateProjectRequestTypes>(CREATE_PROJECT, {
    refetchQueries: ['findAllProjects'],
  })

  useQuery<FindProfileResponse>(FIND_PROFILE, {
    onCompleted: (data) => {
      const defaultOwnerValue = `${
        data?.findProfile?.userDepartments?.[0]?.department?.name || ''
      } / ${data?.findProfile?.name || ''}`
      form.setFieldsValue({
        raised_department_id: data?.findProfile?.userDepartments?.[0].department?.id.toString(),
        raisedUserId: data?.findProfile?.id.toString(),
        raisedUser: data?.findProfile?.name,
        owner_id: data?.findProfile?.userDepartments?.[0]?.id.toString(),
        owner: defaultOwnerValue,
      })
      setDefaultRaisedUserId(Number(data?.findProfile?.id))
      setDefaultOwner(Number(data?.findProfile?.id))
      setDefaultInputOwner(defaultOwnerValue)
    },
  })

  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (values: any): void => {
    const milestones: Array<Omit<Milestone, 'id'>> = [
      {
        type: 'projectEndDate',
        targetDate: values.endDateMilestone?.format(internalDateFormat),
        description: '施策実施完了の期限',
      },
      {
        type: 'decisionDueDate',
        targetDate: values.decisionDueDateMilestone?.format(internalDateFormat),
        description: '施策決定の期限',
      },
      ...values.otherMilestones,
    ]
    const params: CreateProjectRequestTypes['projectInput'] = {
      description: values.description,
      members: values.members,
      milestones: milestones,
      owner_id: Number(values.owner_id),
      startDate: values.startDate?.format(internalDateFormat),
      name: values.projectName,
      raised_department_id: Number(values.raised_department_id),
      raised_user_id: Number(values.raisedUserId),
      priority: values.priority,
      achievementConditions: values.achievementConditions.map((achievementCondition: string) => ({
        description: achievementCondition,
      })),
    }
    create({ variables: { projectInput: params } }).then(() => {
      router.push('/projects')
    })
  }

  useEffect(() => {
    form.setFieldsValue({
      priority: 'middle',
      startDate: moment(),
    })
  }, [form])

  return (
    <PageTitleContext.Provider value={displaySetting[PAGE_ID]?.labelConfig.pageTitle}>
      <MainLayout>
        <Layout style={{ paddingLeft: '2rem' }}>
          <Form
            form={form}
            layout="horizontal"
            validateMessages={{ required: '${name}は必須項目です。入力してください。' }}
            onFinish={onFinish}
          >
            <Row>
              <Col style={{ width: '95%' }}>
                <div style={title}>概要</div>
              </Col>
            </Row>
            <Row style={{ marginBottom: '1rem' }}>企画の概要を入力してください。</Row>
            <FormItem pageId={PAGE_ID} itemId={'projectName'}>
              <Input
                onKeyDown={skipEnter}
                size="middle"
                name="projectName"
                placeholder={
                  '対象(サービス、システム、商品など)と活動内容(検討、導入、改善など)を含む名称'
                }
              />
            </FormItem>

            <FormItem pageId={PAGE_ID} itemId={'description'}>
              <Input.TextArea
                size="middle"
                rows={4}
                name="ta-abstract"
                placeholder="なぜこの企画を立案したのか&#13;&#10;この企画の目的（目標）"
              />
            </FormItem>

            <FormItem wrapperCol={{ span: 5 }} pageId={PAGE_ID} itemId={'raised_department_id'}>
              <SelectDepartment name={'raisedDepartmentInput'} />
            </FormItem>

            <FormItem pageId={PAGE_ID} itemId={'raisedUserId'} style={{ display: 'none' }}>
              <Input type={'hidden'} />
            </FormItem>
            <Row>
              <Col span={8}>
                <FormItem
                  pageId={PAGE_ID}
                  itemId={'raisedUser'}
                  wrapperCol={{ span: 12 }}
                  labelCol={{ span: 12 }}
                >
                  <Input onKeyDown={skipEnter} size="middle" name={'raisedUserInput'} disabled />
                </FormItem>
              </Col>
              <Col style={{ paddingLeft: '5px' }}>
                <Button
                  type={'primary'}
                  onClick={() => {
                    setVisibleRaisedUserSelectModal(true)
                  }}
                >
                  一覧から選択
                </Button>
                <Button
                  type={'primary'}
                  style={{ marginLeft: '8px' }}
                  onClick={() => {
                    form.setFieldsValue({
                      raisedUser: null,
                      raisedUserId: null,
                    })
                    setDefaultRaisedUserId(undefined)
                  }}
                >
                  選択をクリア
                </Button>
                <UserSelectModal
                  title={displaySetting[PAGE_ID]?.labelConfig.raisedUser}
                  onSelected={(rows) => {
                    form.setFieldsValue({
                      raisedUser: rows[0].name,
                      raisedUserId: Number(rows[0].userId),
                    })
                    setDefaultRaisedUserId(Number(rows[0].userId))
                  }}
                  visible={visibleRaisedUserSelectModal}
                  defaultUserId={defaultRaisedUserId}
                  onOk={() => setVisibleRaisedUserSelectModal(false)}
                  onCancel={() => setVisibleRaisedUserSelectModal(false)}
                />
              </Col>
            </Row>

            <Row>
              <Col span={16}>
                <FormItem
                  pageId={PAGE_ID}
                  itemId={'priority'}
                  wrapperCol={{ span: 3 }}
                  labelCol={{ span: 6 }}
                >
                  <Select onKeyDown={skipEnter} size="middle" key={'priority'} allowClear={true}>
                    {Object.entries(priorityLabels).map(([key, value]) => (
                      <Select.Option value={key} key={key}>
                        {value}
                      </Select.Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <FormItem pageId={PAGE_ID} itemId={'startDate'} wrapperCol={{ span: 20 }}>
              <DatePicker
                name={'startDate'}
                placeholder={'日付を入力してください'}
                format={dateFormat}
              />
            </FormItem>
            <Row>
              <Col style={{ width: '95%' }}>
                <div style={title}>企画の達成条件</div>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  itemId={'achievementConditions'}
                  pageId={PAGE_ID}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  description={displaySetting[PAGE_ID].labelConfig.achievementConditionsDescription}
                >
                  <AddableInput
                    form={form}
                    pageId={PAGE_ID}
                    itemId={''}
                    defaultInput={'' as string}
                    name={['achievementConditions', ADDABLE_INPUT_INDEX_PLACEHOLDER]}
                    placeholder={''}
                    updateInput={(input, text) => text}
                    inputs={['']}
                    onChange={(_, __, inputs) => {
                      form.setFieldsValue({ achievementConditions: inputs })
                    }}
                    onAdd={(inputs) => {
                      form.setFieldsValue({ achievementConditions: inputs })
                    }}
                    onDelete={(_, inputs) => {
                      form.setFieldsValue({ achievementConditions: inputs })
                    }}
                    inputToString={(achievementCondition) => achievementCondition}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                  />
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col style={{ width: '95%' }}>
                <div style={title}>マイルストーン</div>
              </Col>
            </Row>
            <Row style={{ marginBottom: '1rem' }}>
              {displaySetting[PAGE_ID]?.inputConfig?.endDateMilestone.require && (
                <Tag color={'red'}>必須</Tag>
              )}
              {displaySetting[PAGE_ID]?.labelConfig.endDateMilestoneDescription}
            </Row>
            <Row>
              <Col span={4}>
                <FormItem
                  pageId={PAGE_ID}
                  itemId={'endDateMilestone'}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <DatePicker
                    name={'endDateMilestone'}
                    placeholder={'日付を入力してください'}
                    format={dateFormat}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item>
                  <Input size="middle" disabled value={'施策実施完了の期限'} />
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ marginBottom: '1rem' }}>
              {displaySetting[PAGE_ID]?.inputConfig?.decisionDueDateMilestone.require && (
                <Tag color={'red'}>必須</Tag>
              )}
              {displaySetting[PAGE_ID]?.labelConfig.decisionDueDateMilestoneDescription}
            </Row>
            <Row>
              <Col span={4}>
                <FormItem
                  pageId={PAGE_ID}
                  itemId={'decisionDueDateMilestone'}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <DatePicker
                    name={'decisionDueDateMilestone'}
                    placeholder={'日付を入力してください'}
                    format={dateFormat}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item>
                  <Input size="middle" disabled value={'施策決定の期限'} />
                </Form.Item>
              </Col>
            </Row>

            <MilestoneForm
              onChange={(values) =>
                form.setFieldsValue({
                  otherMilestones: values?.map((value) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...rest } = value
                    return rest
                  }),
                })
              }
            />

            <Row>
              <Col style={{ width: '95%' }}>
                <div style={title}>企画オーナー・メンバー</div>
              </Col>
            </Row>
            <Row>企画の主担当となるオーナーとメンバーを選択してください。</Row>
            <Row>
              <Col span={24}>
                <Row>
                  <Col span={16}>
                    <FormItem
                      pageId={PAGE_ID}
                      itemId={'owner'}
                      wrapperCol={{ span: 18 }}
                      labelCol={{ span: 6 }}
                    >
                      <Input size="middle" name="ownerInput" disabled value={defaultInputOwner} />
                    </FormItem>
                  </Col>
                  <Col span={7} style={{ whiteSpace: 'nowrap' }}>
                    <Button
                      type={'primary'}
                      style={{ marginLeft: '5px' }}
                      onClick={() => setVisibleOwnerSelectModal(true)}
                    >
                      一覧から選択
                    </Button>
                    <Button
                      type={'primary'}
                      style={{ marginLeft: '8px' }}
                      onClick={() => {
                        form.setFieldsValue({
                          owner_id: null,
                          owner: null,
                        })
                        setDefaultOwner(undefined)
                      }}
                    >
                      選択をクリア
                    </Button>
                    <UserSelectModal
                      title={'オーナー'}
                      onSelected={(row) => {
                        form.setFieldsValue({
                          owner_id: Number(row[0].id),
                          owner: `${row[0].department || ''} / ${row[0].name || ''}`,
                        })
                        setDefaultOwner(Number(row[0].id))
                      }}
                      visible={visibleOwnerSelectModal}
                      defaultValues={defaultOwner ? [defaultOwner] : undefined}
                      defaultUserId={defaultOwner}
                      onOk={() => setVisibleOwnerSelectModal(false)}
                      onCancel={() => setVisibleOwnerSelectModal(false)}
                    />
                  </Col>
                </Row>
                <Row style={{ display: 'none' }}>
                  <FormItem pageId={PAGE_ID} itemId={'owner_id'}>
                    <Input type={'hidden'} />
                  </FormItem>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={4}>
                <FormItem pageId={PAGE_ID} itemId={'members'} labelCol={{ span: 24 }}>
                  <Input name={'members'} type={'hidden'} />
                </FormItem>
              </Col>
              <Col span={18}>
                <Row style={{ whiteSpace: 'nowrap' }}>
                  <DivTableHeader span={10} style={{ width: '160%' }}>
                    部署
                  </DivTableHeader>
                  <DivTableHeader span={6}>氏名</DivTableHeader>
                  <Col style={{ paddingLeft: '8px' }} span={7}>
                    <Button type={'primary'} onClick={() => setVisibleMemberSelectModal(true)}>
                      一覧から選択
                    </Button>
                    <Button
                      type={'primary'}
                      style={{ marginLeft: '8px' }}
                      onClick={() => {
                        form.setFieldsValue({ members: [] })
                        setProjectMembers([])
                        setDefaultMembers([])
                      }}
                    >
                      選択をクリア
                    </Button>
                    <UserSelectModal
                      title={'メンバー'}
                      defaultValues={defaultMembers}
                      onSelected={(rows) => {
                        form.setFieldsValue({ members: rows.map((m) => ({ id: Number(m.id) })) })
                        setProjectMembers(rows)
                        setDefaultMembers(rows.map((m) => m.id))
                      }}
                      visible={visibleMemberSelectModal}
                      selectType={'checkbox'}
                      onOk={() => setVisibleMemberSelectModal(false)}
                      onCancel={() => setVisibleMemberSelectModal(false)}
                    />
                  </Col>
                </Row>
                {projectMembers?.map((member) => (
                  <Row key={member.id}>
                    <DivTableBody span={10}>{member.department}</DivTableBody>
                    <DivTableBody span={6}>{member.name}</DivTableBody>
                  </Row>
                ))}
              </Col>
            </Row>
            <Divider />
            <Row justify={'center'} style={{ marginTop: '32px', marginBottom: '32px' }}>
              <Button style={{ width: '200px' }} type={'primary'} htmlType={'submit'}>
                保存
              </Button>
              <Button
                style={{ width: '200px', marginLeft: '8px' }}
                type={'ghost'}
                onClick={() => router.back()}
              >
                キャンセル
              </Button>
            </Row>
          </Form>
        </Layout>
      </MainLayout>
    </PageTitleContext.Provider>
  )
}
export default ProjectCreateForm
