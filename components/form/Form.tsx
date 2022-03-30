//import { Form as ADForm } from 'antd'
import { FormInstance, FormProps } from 'antd/lib/form/Form'

declare const Form: <Values = any>(
  props: FormProps<Values> & {
    children?: React.ReactNode
  } & {
    ref?:
      | ((instance: FormInstance<Values> | null) => void)
      | React.RefObject<FormInstance<Values>>
      | null
      | undefined
  }
) => React.ReactElement

//<ADForm {...props}>{children}</ADForm>
export default Form
