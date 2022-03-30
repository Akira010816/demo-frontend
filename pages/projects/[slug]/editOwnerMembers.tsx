import { title } from '../../style'
import FormItem from '../../../components/form/FormItem'
import Button from '../../../components/Button'
import UserSelectModal from '../../../components/user/userSelectModal'
import { DivTableBody, DivTableHeader } from '../../../components/divTable'
import MainLayout, { PageTitleContext } from '../../../layouts/main'
import React, { FC, useState } from 'react'
import { Col, Divider, Form, Input, Layout, Row, message } from 'antd'
import { Project } from '../../../graphhql/queries/findAllProjects'
import {
  UPDATE_PROJECT,
  UpdateProjectOwnerMembersRequestTypes,
} from '../../../graphhql/mutations/updateProject'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { FIND_PROJECT_BY_ID } from '../../../graphhql/queries/findProjectById'
import { useRouter } from 'next/router'
import { displaySetting } from '../../../lib/displaySetting'

const PAGE_ID = 'projectUpdateOwnerMembers'

const EditOwnerMembers: FC = () => {
  const router = useRouter()
  const [form] = Form.useForm()
  const { slug } = router.query
  const [projectMembers, setProjectMembers] = useState<Array<ProjectMember>>([])
  const [visibleOwnerSelectModal, setVisibleOwnerSelectModal] = useState<boolean>(false)
  const [visibleMemberSelectModal, setVisibleMemberSelectModal] = useState<boolean>(false)
  const [ownerName, setOwnerName] = useState<string>()
  const [ownerId, setOwnerId] = useState<number>()
  const [projectVersion, setProjectVersion] = useState<number>()
  const [update] = useMutation<Project, UpdateProjectOwnerMembersRequestTypes>(UPDATE_PROJECT, {
    onCompleted: () => {
      message.success(displaySetting[PAGE_ID].labelConfig.updateSuccess)
      router.push(`/projects/${slug}`)
    },
    onError: (error) => {
      message.error(`${displaySetting[PAGE_ID].labelConfig.updateError}
      ${error.message}`)
    },
  })

  useQuery(FIND_PROJECT_BY_ID, {
    variables: { id: Number(slug) },
    skip: !slug,
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
      const project = data.findProjectById
      const ownerName = `${project.owner?.department?.name || ''} / ${
        project.owner?.user?.name || ''
      }`
      setOwnerName(ownerName)
      setOwnerId(project.owner?.id)
      setProjectMembers(
        project.members.map((member: UserDepartment) => ({
          id: member.id,
          department: member.department.name,
          name: member.user.name,
        }))
      )
      setProjectVersion(project.version)
      form.setFieldsValue({
        owner_id: project.owner?.id,
        owner: ownerName,
        members: project.members?.map((member: { id: number }) => ({
          id: member.id,
        })),
      })
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (values: any): void => {
    const params: UpdateProjectOwnerMembersRequestTypes['projectInput'] = {
      id: Number(slug),
      members: values.members,
      owner_id: values.owner_id,
      version: projectVersion || 0,
    }
    update({ variables: { projectInput: params } })
  }

  return (
    <PageTitleContext.Provider
      value={displaySetting.projectUpdateOwnerMembers.labelConfig.pageTitle}
    >
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
                <div style={title}>企画オーナー</div>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Row>
                  <Col span={20}>
                    <FormItem
                      pageId={PAGE_ID}
                      itemId={'owner'}
                      wrapperCol={{ span: 23 }}
                      labelCol={{ span: 24 }}
                      description={
                        displaySetting.projectUpdateOwnerMembers.labelConfig.ownerDescription
                      }
                    >
                      <Row>
                        <Col span={15}>
                          <Input size="middle" name="ownerInput" disabled value={ownerName} />
                        </Col>
                        <Col span={7} offset={0} style={{ whiteSpace: 'nowrap' }}>
                          <Button
                            type={'primary'}
                            style={{ marginLeft: '8px' }}
                            onClick={() => setVisibleOwnerSelectModal(true)}
                          >
                            一覧から選択
                          </Button>
                          <Button
                            type={'primary'}
                            style={{ marginLeft: '8px' }}
                            onClick={() => {
                              setOwnerName('')
                              setOwnerId(undefined)
                              form.setFieldsValue({
                                owner_id: null,
                                owner: null,
                              })
                            }}
                          >
                            選択をクリア
                          </Button>
                        </Col>
                      </Row>
                    </FormItem>
                    <FormItem pageId={PAGE_ID} itemId={'owner_id'}>
                      <Input type={'hidden'} />
                    </FormItem>
                  </Col>
                  <Col style={{ paddingLeft: '5px' }}>
                    <UserSelectModal
                      key={'ownerModal'}
                      title={'オーナー'}
                      onSelected={(row) => {
                        setOwnerName(`${row[0].department || ''} / ${row[0].name || ''}`)
                        setOwnerId(Number(row[0].id))
                        form.setFieldsValue({
                          owner_id: Number(row[0].id),
                          owner: `${row[0].department || ''} / ${row[0].name || ''}`,
                        })
                      }}
                      visible={visibleOwnerSelectModal}
                      onOk={() => setVisibleOwnerSelectModal(false)}
                      onCancel={() => setVisibleOwnerSelectModal(false)}
                      defaultValues={ownerId ? [ownerId] : undefined}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col style={{ width: '95%' }}>
                <div style={title}>企画メンバー</div>
              </Col>
            </Row>
            <Row>
              <Col span={24} style={{ height: '32px', marginBottom: '8px' }}>
                <FormItem
                  pageId={PAGE_ID}
                  itemId={'members'}
                  wrapperCol={{ span: 20 }}
                  labelCol={{ span: 20 }}
                  label={displaySetting.projectUpdateOwnerMembers.labelConfig.membersDescription}
                >
                  <Input name={'members'} type={'hidden'} />
                </FormItem>
              </Col>
              <Col span={18}>
                <Row style={{ whiteSpace: 'nowrap' }}>
                  <DivTableHeader span={10}>部署</DivTableHeader>
                  <DivTableHeader span={6}>氏名</DivTableHeader>
                  <Col span={7}>
                    <Button
                      type={'primary'}
                      style={{ marginLeft: '8px' }}
                      onClick={() => setVisibleMemberSelectModal(true)}
                    >
                      一覧から選択
                    </Button>
                    <Button
                      type={'primary'}
                      style={{ marginLeft: '8px' }}
                      onClick={() => {
                        form.setFieldsValue({ members: [] })
                        setProjectMembers([])
                      }}
                    >
                      選択をクリア
                    </Button>
                    <UserSelectModal
                      key={'membersModal'}
                      title={'メンバー'}
                      onSelected={(rows) => {
                        form.setFieldsValue({ members: rows.map((m) => ({ id: Number(m.id) })) })
                        setProjectMembers(rows)
                      }}
                      visible={visibleMemberSelectModal}
                      selectType={'checkbox'}
                      onOk={() => setVisibleMemberSelectModal(false)}
                      onCancel={() => setVisibleMemberSelectModal(false)}
                      defaultValues={projectMembers.map((pm) => pm.id)}
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
export default EditOwnerMembers
