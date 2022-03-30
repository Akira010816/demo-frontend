import Heading from '~/components/Heading'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import { Layout, Col, Row } from 'antd'
import { FC } from 'react'
import { Color } from '~/lib/styles'

const borderStyle = {
  borderColor: Color.neutral.grey,
  borderWidth: 1,
  borderStyle: 'solid',
  lineHeight: '2rem',
}
const NotificationDetailDemo: FC = () => (
  <PageTitleContext.Provider value={'お知らせ'}>
    <MainLayout>
      <Layout style={{ marginLeft: '2rem' }}>
        <Col>
          <Heading.H1 title={'お知らせ'} />
        </Col>
        <Row>2021年1月31日 15:37</Row>
        <Row style={{ fontSize: '1.3em', marginTop: '1rem' }}>
          メンテナンスのお知らせ（2021年5月20日）
        </Row>
        <Row style={{ minHeight: '2rem', marginTop: '2rem' }}>
          <Col
            span={3}
            style={{
              ...borderStyle,
              backgroundColor: Color.neutral.primary,
              color: Color.font.white,
            }}
          >
            日時
          </Col>
          <Col span={6} style={borderStyle}>
            2021年5月20日(木) 22時00分～23時00分
          </Col>
        </Row>
        <Row style={{ minHeight: '2rem' }}>
          <Col
            span={3}
            style={{
              ...borderStyle,
              backgroundColor: Color.neutral.primary,
              color: Color.font.white,
            }}
          >
            メンテナンス内容
          </Col>
          <Col span={6} style={borderStyle}>
            臨時メンテナンス
          </Col>
        </Row>
        <Row style={{ marginTop: '3rem' }}>上記時間帯で、P2Gear全ての機能をご利用頂けません。</Row>
      </Layout>
    </MainLayout>
  </PageTitleContext.Provider>
)

export default NotificationDetailDemo
