import React, { useState, useEffect, useContext } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Icon, { UserOutlined, BellOutlined, SendOutlined } from '@ant-design/icons'
import { Route, MenuDataItem } from '@ant-design/pro-layout/lib/typings'
import { SiderMenuProps } from '@ant-design/pro-layout/lib/SiderMenu/SiderMenu'
import { Avatar, Menu, Dropdown, message, Badge } from 'antd'
import ChangeDepartmentModal from '../components/profile/changeDepartmentModal'
import logoIcon from '../public/icon/XXX.png'
import logoText from '../public/icon/XXX.png'
import menu01 from '../public/icon/menu01.svg'
import menu03 from '../public/icon/menu03.svg'
import { menuItem } from '~/pages/style'
import { useLogout } from '~/hooks/useLogout'
import { useLazyQuery } from '@apollo/react-hooks'
import { FIND_UNREAD_NOTIFICATION_NUMBER } from '~/graphhql/queries/findUnreadNotificationNumber'
import { Color } from '~/lib/styles'
import { useAuth } from '~/hooks/useAuth'
import { Profile } from '~/graphhql/queries/findProfile'
import { youCanDoIt } from '~/lib/handlePermission'
import { useApolloClient } from '@apollo/client'

const ProLayout = dynamic(() => import('@ant-design/pro-layout'), {
  ssr: false,
})

const menuHeaderRender = (
  logoDom: React.ReactNode,
  titleDom: React.ReactNode,
  props?: SiderMenuProps
): React.ReactNode => (
  <Link href="/">
    <a style={{ backgroundColor: 'white' }}>
      <img
        style={{ marginLeft: '19px', width: '45px', height: '30px' }}
        src={logoIcon}
        alt={'logo'}
      />
      {!props?.collapsed && (
        <img
          style={{ marginLeft: '10px', width: '110px', height: '30px' }}
          src={logoText}
          alt={'textLogo'}
        />
      )}
    </a>
  </Link>
)

const menuItemRender = (options: MenuDataItem, element: React.ReactNode): React.ReactNode =>
  options.onItemClick ? (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div onClick={options.onItemClick}>{element}</div>
  ) : (
    <Link href={options.path || ''}>
      <a>{element}</a>
    </Link>
  )

export const PageTitleContext = React.createContext('画面名初期値')

type Props = {
  children: React.ReactNode
}

const SwapImage = (): JSX.Element => (
  <img style={{ width: '2em', height: '2em' }} src={menu01} alt={'swap'} />
)
const SwapIcon = (): JSX.Element => <Icon component={SwapImage} />

const PlanImage = (): JSX.Element => (
  <img style={{ width: '2em', height: '2em', paddingBottom: '0.25em' }} src={menu03} alt={'plan'} />
)
const PlanIcon = (): JSX.Element => <Icon component={PlanImage} />

export default function Main(props: Props | undefined): React.ReactElement {
  const client = useApolloClient()
  const context = useContext(PageTitleContext)
  const [titles, setTitles] = useState<string[]>([])
  const [collapsed, setCollapse] = useState(false)
  const logout = useLogout()
  const { currentUserDepartmentId, profile } = useAuth()
  const [findUnreadNotificationNumber, { data }] = useLazyQuery(FIND_UNREAD_NOTIFICATION_NUMBER, {
    fetchPolicy: 'no-cache',
  })

  useEffect(() => {
    if (context) {
      setTitles(context.split(','))
    } else {
      setTitles([])
    }
  }, [context])

  useEffect(() => {
    findUnreadNotificationNumber()
  }, [currentUserDepartmentId, findUnreadNotificationNumber])

  const accountMenu = (
    <Menu>
      <Menu.Item
        className={menuItem}
        onClick={() =>
          logout().then(() => {
            client.resetStore()
            message.success('ログアウトしました')
          })
        }
      >
        ログアウト
      </Menu.Item>
    </Menu>
  )

  const checkRouterAvailable = (profile?: Profile): Route => {
    const routerAccepted: MenuDataItem[] = []
    const router: Pick<Required<Route>, 'path' | 'routes'> = {
      path: '/',
      routes: [],
    }

    router.routes.push({
      icon: <SwapIcon />,
      name: collapsed ? 'メニューを開く' : 'メニューを最小化',
      onItemClick: () => {
        setCollapse(!collapsed)
      },
      path: '#',
    })

    if (!profile || !profile.userDepartments) return router

    const currentUserDepartmentIdx = profile.userDepartments.findIndex(
      (userDpm) => userDpm.id == currentUserDepartmentId
    )

    if (currentUserDepartmentIdx == -1) return router

    if (youCanDoIt(profile, currentUserDepartmentId, 'businessPlanViewMode')) {
      const menuData: MenuDataItem = {
        icon: <SendOutlined />,
        name: '事業計画策定',
        path: 'plans',
      }
      routerAccepted.push(menuData)
    }

    if (youCanDoIt(profile, currentUserDepartmentId, 'planMeasureViewMode')) {
      const planMeasureMenuData: MenuDataItem = {
        icon: <SendOutlined />,
        name: '施策登録',
        path: 'planMeasures',
      }
      routerAccepted.push(planMeasureMenuData)
    }

    if (youCanDoIt(profile, currentUserDepartmentId, 'planMeasureConfirm')) {
      const menuData: MenuDataItem = {
        icon: <SendOutlined />,
        name: '施策決定',
        path: 'planMeasures/confirm',
      }
      routerAccepted.push(menuData)
    }

    if (youCanDoIt(profile, currentUserDepartmentId, 'planApprovalViewMode')) {
      const planApproveMenuData: MenuDataItem = {
        icon: <SendOutlined />,
        name: '事業計画承認',
        path: '/plans/approve',
      }
      routerAccepted.push(planApproveMenuData)
    }

    if (routerAccepted.length) {
      router.routes?.push({
        name: '事業計画',
        icon: <PlanIcon />,
        children: routerAccepted,
      })
    }

    return router
  }

  const renderRouter = (): Route => {
    return checkRouterAvailable(profile)
  }

  return (
    <ProLayout
      {...props}
      title="XXX"
      style={{ minHeight: '100vh' }}
      route={renderRouter()}
      logo={logoIcon}
      siderWidth={205}
      menuItemRender={menuItemRender}
      menuHeaderRender={menuHeaderRender}
      navTheme={'light'}
      collapsed={collapsed}
      onCollapse={() => null}
      bleakpoint={false}
      fixSiderbar={true}
      collapsedButtonRender={false}
      rightContentRender={() => (
        <div style={{ width: '100%', display: 'flex', maxHeight: '64px', overflow: 'hidden' }}>
          <div style={{ marginLeft: '24px', fontSize: '22px' }}>
            {titles.map((title, index) => {
              if (index != titles.length - 1) {
                return (
                  <React.Fragment key={`sub-title-${index}-${title}`}>
                    <span style={{ fontSize: 20, color: 'rgb(43,43,43)' }}>
                      {title}&nbsp;&nbsp;&gt;&nbsp;&nbsp;
                    </span>
                  </React.Fragment>
                )
              }
              return (
                <React.Fragment key={`main-title-${title}`}>
                  <span
                    style={{
                      color: 'rgb(26,119,212)',
                    }}
                  >
                    {title}
                  </span>
                </React.Fragment>
              )
            })}
          </div>
          <div style={{ marginLeft: 'auto', alignItems: 'center' }}>
            <Badge count={data?.findUnreadNotificationNumber?.unreadCount || 0} size="small">
              <a href="/notifications" style={{ color: Color.neutral.primary }}>
                <BellOutlined style={{ fontSize: 20, display: 'inline-block' }} />
              </a>
            </Badge>
            <Dropdown overlay={accountMenu} placement="bottomLeft">
              <button style={{ background: 'transparent', border: 'none', paddingLeft: 0 }}>
                <Avatar style={{ marginLeft: '2rem' }} icon={<UserOutlined />} />
              </button>
            </Dropdown>
            <ChangeDepartmentModal
              width={300}
              style={{ position: 'absolute', top: 44, right: 4 }}
            />
          </div>
        </div>
      )}
    >
      {props?.children}
    </ProLayout>
  )
}
