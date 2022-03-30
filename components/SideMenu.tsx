import { Menu } from 'antd'
import { menuItem } from '../pages/style'

interface SideMenuProps {
  taskList: { name: string; query: string }[]
  selectedKey: number
  handleClick: (arg0: number) => void
}

export default function SideMenu(props: SideMenuProps) {
  const items = props.taskList.map((task: any, index: number) => (
    <Menu.Item key={index + Math.random()} className={menuItem}>
      {task.name}
    </Menu.Item>
  ))

  const onClick = (e: any) => props.handleClick(Number(e.key))

  return (
    <Menu
      key={Math.random()}
      style={{ height: '100vh' }}
      defaultSelectedKeys={[props.selectedKey.toString()]}
      mode="inline"
      onClick={onClick}
    >
      {items}
    </Menu>
  )
}
