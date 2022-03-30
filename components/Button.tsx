import { Button as ADButton } from 'antd'
import { ButtonProps as ADButtonProps } from 'antd/lib/button/button'
import { FC } from 'react'

// 基本はantd-custom.lessを修正して基本UIパーツのスタイリングを行う
// type: ButtonTypes: ["default", "primary", "ghost", "dashed", "link", "text"];
// danger? : boolean
// 上記で対応できない場合は以下のように独自のvariantを追加する
/*
const whiteButtonStyle = {
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  color: '#000',
}

type P2ButtonProps = ButtonProps & {
  variant?: 'primary' | 'white' | 'grey'
}
 */

type ButtonProps = { warning?: boolean } & ADButtonProps

const warningButtonStyle = {
  backgroundColor: '#f77c34',
  borderColor: '#f77c34',
  color: '#fff',
}

const Button: FC<ButtonProps> = ({ warning, ...props }) => {
  return (
    <ADButton {...props} style={{ ...props?.style, ...(warning ? warningButtonStyle : {}) }}>
      {props.children}
    </ADButton>
  )
}
export default Button
