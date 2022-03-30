import { ChangeEvent, FC, useEffect } from 'react'
import debounce from 'lodash.debounce'
import { Col, Layout, Input } from 'antd'
import { FormInstance } from 'antd/es/form'
import { H1 } from '~/components/Heading/H1'
import FormItem from '~/components/form/FormItem'
import { skipEnter } from '~/lib/keyDown'

type MeasureBaseInfo = {
  code: Measure['code']
  name: Measure['name']
  overview: Measure['overview']
}

export type BaseInfoFormProps = {
  form: FormInstance
  baseInfo?: MeasureBaseInfo
  onChange: (measureBaseInfo: MeasureBaseInfo) => Promise<void> | void
}

const PAGE_ID = 'measureBaseInfoForm'

const defaultBaseInfo = {
  code: '',
  name: '',
  overview: '',
}

const BaseInfoForm: FC<BaseInfoFormProps> = ({ form, onChange, baseInfo }) => {
  useEffect(() => {
    form.setFieldsValue({
      code: baseInfo?.code,
      name: baseInfo?.name,
      overview: baseInfo?.overview,
    })
  }, [baseInfo?.code, baseInfo?.name, baseInfo?.overview, form])

  return (
    <Layout>
      <Layout.Content style={{ padding: '2rem', paddingTop: '1rem' }}>
        <H1 title={'概要'} />
        <Col>
          <FormItem
            pageId={PAGE_ID}
            itemId={'code'}
            wrapperCol={{ span: 6 }}
            initialValue={baseInfo?.code}
          >
            <Input size="middle" disabled />
          </FormItem>
          <FormItem pageId={PAGE_ID} itemId={'name'} initialValue={baseInfo?.name}>
            <Input
              onKeyDown={skipEnter}
              size="middle"
              name="name"
              onChange={debounce((e: ChangeEvent<HTMLInputElement>) => {
                onChange(baseInfo ? { ...baseInfo, name: e.target.value } : defaultBaseInfo)
              }, 500)}
            />
          </FormItem>
          <FormItem pageId={PAGE_ID} itemId={'overview'} initialValue={baseInfo?.overview}>
            <Input.TextArea
              allowClear={true}
              size="middle"
              name="overview"
              autoSize={{ minRows: 3, maxRows: 10 }}
              onChange={debounce((e: ChangeEvent<HTMLTextAreaElement>) => {
                onChange(baseInfo ? { ...baseInfo, overview: e.target.value } : defaultBaseInfo)
              }, 500)}
            />
          </FormItem>
        </Col>
      </Layout.Content>
    </Layout>
  )
}
export default BaseInfoForm
