import { Form, Tag } from 'antd'
import { FormItemProps } from 'antd/lib/form'
import { displaySetting } from '~/lib/displaySetting'

export type P2FormItemProps = FormItemProps & {
  pageId: string
  itemId: string
  itemRequired?: boolean
  description?: string
  wrapperColSpan?: number
}

const FormItem = ({
  description,
  children,
  pageId,
  itemId,
  wrapperColSpan,
  itemRequired,
  ...props
}: P2FormItemProps) => {
  const label: string = displaySetting[pageId]?.labelConfig[itemId] ?? ''
  const visible: boolean = displaySetting[pageId]?.inputConfig?.[itemId]?.visible ?? true
  const require: boolean =
    itemRequired ?? displaySetting[pageId]?.inputConfig?.[itemId]?.require ?? false
  const maxlength: number | undefined = displaySetting[pageId]?.inputConfig?.[itemId]?.maxlength

  const p2rules: FormItemProps['rules'] = [
    { required: require, message: `必須項目です。入力してください。` },
  ]
  maxlength !== undefined &&
    p2rules.push({
      max: maxlength,
      message: `${maxlength}文字以内で入力してください。`,
    })

  return (
    <>
      {visible && (
        <Form.Item
          label={
            displaySetting[pageId]?.labelConfig[itemId] !== undefined && (
              <span
                style={{
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'break-spaces',
                  lineHeight: '1rem',
                }}
              >
                {label}
                {require && <Tag color="red">必須</Tag>}
                {description}
              </span>
            )
          }
          rules={p2rules}
          required={false}
          labelAlign="left"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: wrapperColSpan ?? 18 }}
          colon={false}
          validateTrigger={['onChange']}
          name={props.name ?? itemId}
          {...props}
        >
          {children}
        </Form.Item>
      )}
    </>
  )
}
export default FormItem
