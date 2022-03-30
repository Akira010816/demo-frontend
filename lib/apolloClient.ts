import { useMemo } from 'react'
import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  ApolloClientOptions,
  createHttpLink,
  from,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'
import auth from '../components/auth/authService'
import { useLogout } from '~/hooks/useLogout'

let apolloClient: ApolloClient<NormalizedCacheObject>

function createApolloClient(logout?: any) {
  let uri = process.env.NEXT_PUBLIC_API_URI

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const { getCurrentToken } = auth()
    const token = getCurrentToken()
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    }
  })

  const httpLink = () => {
    // TODO herokuを利用しなくなったタイミングで削除
    if (!uri) {
      uri =
        process.env.NODE_ENV === 'development'
          ? '/api/'
          : 'https://morning-hamlet-75876.herokuapp.com/api/'
    }

    return createHttpLink({
      uri: uri + 'graphql',
    })
  }

  // TODO Unauthorizedが返ってきたときのハンドリングを行う
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      console.log(graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        if (message === 'Unauthorized' || message === 'Authorization header not found.') {
          logout()
        }
      })
    }
    if (networkError) console.log(`[Network error]: ${networkError}`)
  })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined', // set to true for SSR
    link: from([errorLink, authLink.concat(httpLink())]),
    cache: new InMemoryCache({
      addTypename: false,
      typePolicies: {
        Query: {
          fields: {
            findAllProjects: {
              merge(existing, incoming) {
                return incoming
              },
            },
          },
        },
      },
    }),
  })
}

export function initializeApollo(initialState?: any, logout?: any) {
  const _apolloClient = apolloClient || createApolloClient(logout)
  if (initialState) {
    const existingCache = _apolloClient.extract()
    // Restore the cache using the data passed from
    // getStaticProps/getServerSideProps combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState })
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient
  return _apolloClient
}

export function useApollo(initialState: ApolloClientOptions<any>) {
  const logout = useLogout()
  const store = useMemo(() => initializeApollo(initialState, logout), [initialState])
  return store
}
