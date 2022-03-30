import React, { FC, useState } from 'react'
import { Image, Layout, Form, Input, Button, Typography, Row, Col } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import style from './login.module.css'
import { login_title } from './style'
import { useMutation } from '@apollo/react-hooks'
import { LOGIN } from '../graphhql/mutations/login'
import auth from '../components/auth/authService'
import { useLazyFindProfile } from '~/hooks/useLazyFindProfile'

type ValidateStatus = Parameters<typeof Form.Item>[0]['validateStatus']
const { storeToken, storeUserId, storeDepartmentId } = auth()
const { Text } = Typography
const { Header, Content, Footer } = Layout

const Login: FC = () => {
  // const { push } = useRouter()
  const [findProfile] = useLazyFindProfile(() => null)
  const [login, { loading }] = useMutation<LoginResponse, LoginRequestParams>(LOGIN, {
    //refetchQueries: [{ query: FIND_PROFILE }], と書くとstoreToken前にクエリが走ってUnauhorizedになる
    async onCompleted({ login: { accessToken, userId, departmentId } }) {
      await storeToken(accessToken)
      if (userId) await storeUserId(userId)
      if (departmentId) await storeDepartmentId(departmentId)
      findProfile()
    },
    onError({ graphQLErrors }) {
      const errorMessage: Array<GraphqlErrorMessage> = JSON.parse(graphQLErrors[0]?.message || '[]')
      /*
      const clientSlugError = errorMessage.filter(
        (error: GraphqlErrorMessage) => error.clientSlug
      )[0]?.clientSlug
      if (clientSlugError) {
        setClientSlug({
          value: clientSlug.value,
          errorMsg: clientSlugError.message,
          validateStatus: 'error',
        })
      }
      */
      const usernameError = errorMessage.filter((error: GraphqlErrorMessage) => error.username)[0]
        ?.username

      if (usernameError) {
        setUsername({
          value: username.value,
          errorMsg: usernameError.message,
          validateStatus: 'error',
        })
        setPassword({
          value: password.value,
          validateStatus: 'error',
        })
      }
    },
  })
  /*
  const [clientSlug, setClientSlug] = useState<{
    value: string
    validateStatus?: ValidateStatus
    errorMsg?: string | null
  }>({ value: '' })
   */
  const [username, setUsername] = useState<{
    value: string
    validateStatus?: ValidateStatus
    errorMsg?: string | null
  }>({ value: '' })
  const [password, setPassword] = useState<{
    value: string
    validateStatus?: ValidateStatus
    errorMsg?: string | null
  }>({ value: '' })

  const submit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    login({
      variables: {
        loginInput: {
          loginId: username.value,
          password: password.value,
          //clientSlug: clientSlug.value,
        },
      },
    })
  }

  return (
    <Layout className="layout">
      <Header>
        <Row>
          <Image
            style={{ width: '50px', margin: '10px' }}
            src={'/icon/XXX.png'}
            preview={false}
          />
          <Image
            src={'/icon/XXX.png'}
            style={{ width: '130px', height: '35px', float: 'left', margin: '8% 0' }}
            preview={false}
          />
        </Row>
      </Header>
      <Row justify="center">
        <Col style={{ width: '60%' }}>
          <div style={login_title}>ログイン</div>
        </Col>
      </Row>
      <Content style={{ margin: 'auto' }}>
        <div className={style.site_layout_content}>
          <Form style={{ marginTop: '50px' }} name="normal_login" className={style.login_form}>
            {/*
            <Form.Item
              validateStatus={error ? 'error' : undefined}
              label={
                <Text style={{ display: 'inline-block', width: '100px' }}>ログイン企業ID</Text>
              }
              name="clientSlug"
              help={clientSlug.errorMsg}
              rules={[
                {
                  message: 'ログイン企業IDを入力してください',
                },
              ]}
            >
              <Input
                placeholder="test_company_1"
                onChange={(event) => setClientSlug({ value: event.target.value })}
              />
              <span>.app.XXX.jp</span>
            </Form.Item>
            */}

            <Form.Item
              validateStatus={username.validateStatus}
              label={<Text style={{ display: 'inline-block', width: '100px' }}>ユーザーID</Text>}
              name="Username"
              help={username.errorMsg}
              rules={[
                {
                  message: 'ユーザーIDを入力してください',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="ユーザーID"
                onChange={(event) => setUsername({ value: event.target.value })}
              />
            </Form.Item>

            <Form.Item
              validateStatus={password.validateStatus}
              label={<Text style={{ display: 'inline-block', width: '100px' }}>パスワード</Text>}
              name="Password"
              rules={[
                {
                  message: 'パスワードを入力してください',
                },
              ]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                onChange={(event) => setPassword({ value: event.target.value })}
                placeholder="パスワード"
              />
            </Form.Item>
            {/*
            <Row justify="center" hidden={!postVisible}>
              <Col>
                <Link
                  style={{ color: '#1890ff', fontSize: '14px' }}
                  target="_blank"
                >
                  パスワードをお忘れの方はこちら
                </Link>
              </Col>
            </Row>
              */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={style.login_form_button}
                onSubmit={submit}
                onClick={submit}
                disabled={loading}
              >
                ログイン
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}></Footer>
    </Layout>
  )
}

export default Login
