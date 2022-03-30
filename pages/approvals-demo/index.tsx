import React, { FC } from 'react'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import { approvalCategorySlugs } from '~/lib/displaySetting'
import Button from '~/components/Button'
import { Layout, Col } from 'antd'
import { useRouter } from 'next/router'
import Heading from '~/components/Heading'

const ApprovalsDemo: FC = () => {
  const router = useRouter()

  return (
    <PageTitleContext.Provider value={'承認呼出元 (デモ画面)'}>
      <MainLayout>
        <Layout style={{ marginLeft: '2rem' }}>
          <Heading.H1 title={'呼び出し元の承認区分'} />
          {Object.entries(approvalCategorySlugs).map(
            ([, { label, slug }], index) =>
              // 一旦 承認区分が「事業計画」のもののみ表示
              slug === approvalCategorySlugs.plan.slug && (
                <Col key={index} style={{ marginBottom: '1rem' }}>
                  <Button
                    type="primary"
                    onClick={async () => await router.push(`/approvalRequests?category=${slug}`)}
                  >
                    {label}
                  </Button>
                </Col>
              )
          )}
        </Layout>
      </MainLayout>
    </PageTitleContext.Provider>
  )
}

export default ApprovalsDemo
