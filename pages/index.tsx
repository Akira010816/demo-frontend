import React, { FC } from 'react'
import Login from './login'
import { useAuth } from '../hooks/useAuth'
import { Layout } from 'antd'
import MainLayout, { PageTitleContext } from '~/layouts/main'

const Home: FC = () => {
  const { isLoggedIn } = useAuth()
  return (
    <>
      {(isLoggedIn == false && <Login />) ||
        (isLoggedIn && (
          <PageTitleContext.Provider value={''}>
            <MainLayout>
              <Layout />
            </MainLayout>
          </PageTitleContext.Provider>
        )) ||
        null}
    </>
  )
}

export default Home
