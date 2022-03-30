import React, { FC, useState } from 'react'
import { useRouter } from 'next/router'
import { Layout, Row, Col, Input, Form, Select, Divider, message } from 'antd'
import { useMutation, useQuery } from '@apollo/react-hooks'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import { title } from '~/pages/style'
import FormItem from '~/components/form/FormItem'
import Button from '~/components/Button'
import SelectDepartment from '~/components/department/selectDepartment'
import UserSelectModal from '~/components/user/userSelectModal'
import { Project } from '~/graphhql/queries/findAllProjects'
import { FIND_PROJECT_BY_ID } from '~/graphhql/queries/findProjectById'
import {
  UPDATE_PROJECT,
  UpdateProjectBaseInfoRequestTypes,
} from '~/graphhql/mutations/updateProject'
import AddableInput, { ADDABLE_INPUT_INDEX_PLACEHOLDER } from '~/components/input/addableInput'
import { displaySetting, priorityLabels, projectStatusLabels } from '~/lib/displaySetting'
import { skipEnter } from '~/lib/keyDown'

const PAGE_ID = 'projectUpdateBaseInfo'

const ProjectEditForm: FC = () => {
  const [visibleRaisedUserSelectModal, setVisibleRaisedUserSelectModal] = useState<boolean>(false)
  const router = useRouter()
  const [form] = Form.useForm()
  const { slug } = router.query
  const [update] = useMutation<Project, UpdateProjectBaseInfoRequestTypes>(UPDATE_PROJECT, {
    onCompleted: async () => {
      await Promise.all([
        message.success(displaySetting[PAGE_ID].labelConfig.updateSuccess),
        router.push(`/projects/${slug}`),
      ])
    },
    onError: async (error) => {
      await message.error(`${displaySetting[PAGE_ID].labelConfig.updateError}
      ${error.message}`)
    },
  })
  const [achievementConditions, setAchievementConditions] = useState<string[]>()
  const [defaultRaisedUserId, setDefaultRaisedUserId] = useState<number>()
  const [projectVersion, setProjectVersion] = useState<number>()
  useQuery(FIND_PROJECT_BY_ID, {
    variables: { id: Number(slug) },
    skip: !slug,
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
      const project = data.findProjectById
      if (!project) {
        return
      }
      form.setFieldsValue({
        projectCode: project.projectCode,
        projectName: project.name,
        status: project.status,
        description: project.description,
        premiseCondition: project.premiseCondition,
        impact: project.impact,
        raised_department_id: project.raisedDepartment?.id?.toString(),
        raisedUserId: project.raisedUser?.id,
        raisedUser: project.raisedUser?.name,
        priority: project.priority,
        achievementConditions: project.achievementConditions.map(
          (ac: AchievementCondition) => ac.description
        ),
      })
      setProjectVersion(project.version)
      setAchievementConditions(
        project.achievementConditions.map((ac: AchievementCondition) => ac.description)
      )
      setDefaultRaisedUserId(project.raisedUser?.id)
    },
  })

  const onFinish = async (values: any): Promise<void> => {
    const params: UpdateProjectBaseInfoRequestTypes['projectInput'] = {
      id: Number(slug),
      status: values.status,
      description: values.description,
      premiseCondition: values.premiseCondition,
      impact: values.impact,
      name: values.projectName,
      raised_department_id: Number(values.raised_department_id),
      raised_user_id: Number(values.raisedUserId),
      priority: values.priority,
      achievementConditions: values.achievementConditions.map((achievementCondition: string) => ({
        description: achievementCondition,
      })),
      version: projectVersion || 0,
    }
    await update({ variables: { projectInput: params } })
  }

  return (
    <PageTitleContext.Provider value={displaySetting[PAGE_ID]?.labelConfig.pageTitle}>
      <MainLayout>
        <Layout style={{ paddingLeft: '2rem' }}>
          <Row>
            <Col offset={20} span={2}>
              <Button type={'primary'} onClick={() => router.push(`/projects/${slug}`)}>
                企画へ戻る
              </Button>
            </Col>
          </Row>
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
            <FormItem pageId={PAGE_ID} itemId={'projectCode'} wrapperCol={{ span: 6 }}>
              <Input size="middle" disabled={true} />
            </FormItem>

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

            <FormItem pageId={PAGE_ID} itemId={'status'} wrapperCol={{ span: 4 }}>
              <Select onKeyDown={skipEnter} size="middle" key={'priority'} allowClear={true}>
                {Object.entries(projectStatusLabels).map(([key, value]) => (
                  <Select.Option value={key} key={key}>
                    {value}
                  </Select.Option>
                ))}
              </Select>
            </FormItem>

            <FormItem pageId={PAGE_ID} itemId={'description'}>
              <Input.TextArea
                size="middle"
                rows={4}
                name="ta-abstract"
                placeholder="なぜこの企画を立案したのか&#13;&#10;この企画の目的（目標）"
              />
            </FormItem>

            <FormItem pageId={PAGE_ID} itemId={'premiseCondition'}>
              <Input.TextArea
                size="middle"
                rows={4}
                name="ta-abstract"
                placeholder="費用や要員、期限厳守、段階実施など、企画を対応する上での制約事項"
              />
            </FormItem>

            <FormItem pageId={PAGE_ID} itemId={'impact'}>
              <Input.TextArea
                size="middle"
                rows={4}
                name="ta-abstract"
                placeholder="企画の目標が達成されないことによる影響"
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

            <FormItem pageId={PAGE_ID} itemId={'priority'} wrapperCol={{ span: 2 }}>
              <Select onKeyDown={skipEnter} size="middle" key={'priority'} allowClear={true}>
                {Object.entries(priorityLabels).map(([key, value]) => (
                  <Select.Option value={key} key={key}>
                    {value}
                  </Select.Option>
                ))}
              </Select>
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
                    pageId={PAGE_ID}
                    itemId={''}
                    name={['achievementConditions', ADDABLE_INPUT_INDEX_PLACEHOLDER]}
                    defaultInput={''}
                    placeholder={''}
                    inputs={achievementConditions}
                    updateInput={(input, text) => text}
                    inputToString={(achievementCondition) => achievementCondition}
                    form={form}
                    onChange={(_, __, inputs) => {
                      form.setFieldsValue({ achievementConditions: inputs })
                    }}
                    onAdd={(inputs) => {
                      form.setFieldsValue({ achievementConditions: inputs })
                    }}
                    onDelete={(_, inputs) => {
                      form.setFieldsValue({ achievementConditions: inputs })
                    }}
                  />
                </FormItem>
              </Col>
            </Row>

            <Divider />
            <Row justify={'center'}>
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

export default ProjectEditForm
