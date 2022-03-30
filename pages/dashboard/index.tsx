import React, { FC } from 'react'
import { Layout } from 'antd'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import { displaySetting } from '~/lib/displaySetting'

const PAGE_ID = 'dashboard'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const Dashboard: FC = () => {
  return (
    <PageTitleContext.Provider value={'ダッシュボード'}>
      <MainLayout>
        <Layout>
          <div>{labelConfig.title}</div>
        </Layout>
      </MainLayout>
    </PageTitleContext.Provider>
  )
}
export default Dashboard
