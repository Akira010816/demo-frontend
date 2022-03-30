import React, { FC } from 'react'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import { AddOrEditTask } from '~/components/task/addOrEditTask'
import { displaySetting } from '~/lib/displaySetting'

const PAGE_ID = 'taskNew'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const NewTask: FC = () => {
  return (
    <PageTitleContext.Provider value={labelConfig.pageTitle}>
      <MainLayout>
        <AddOrEditTask notFoundRedirection={true} />
      </MainLayout>
    </PageTitleContext.Provider>
  )
}

export default NewTask
