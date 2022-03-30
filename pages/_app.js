import './styles.global.css'
import 'antd/dist/antd.css'
import { useApollo } from '../lib/apolloClient'
import NProgress from 'nprogress'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
// eslint-disable-next-line no-unused-vars
import { ApolloProvider } from '@apollo/client'
// eslint-disable-next-line no-unused-vars
import { AuthProvider } from '../components/auth/authProvider'
// eslint-disable-next-line no-unused-vars
import { ConfigProvider } from 'antd'
import 'moment/locale/ja'
import locale from 'antd/lib/locale/ja_JP'

// eslint-disable-next-line no-unused-vars
export default function App({ Component, pageProps }) {
  const apolloClient = useApollo(pageProps.initialApolloState)
  const router = useRouter()

  useEffect(() => {
    router.events.on('routeChangeStart', () => NProgress.start())
    router.events.on('routeChangeComplete', () => NProgress.done())
    router.events.on('routeChangeError', () => NProgress.done())
  })

  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <ConfigProvider locale={locale}>
          <Component {...pageProps} />
        </ConfigProvider>
      </AuthProvider>
    </ApolloProvider>
  )
}
