import { ApolloClient, InMemoryCache, HttpLink, Observable } from '@apollo/client'
import fetch from 'isomorphic-unfetch'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { relayStylePagination } from '@apollo/client/utilities'

import refreshToken from '@/utils/refreshToken'
import { storeAccessToken, getAccessToken } from '@/utils/accessToken'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URI
if (!GRAPHQL_URL) {
  throw new Error('GRAPHQL URI MISSING FROM ENVIRONMENT')
}

const httpLink = new HttpLink({
  uri: GRAPHQL_URL, // must be absolute
  credentials: 'include',
  fetch,
})

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (!graphQLErrors) return

  for (const error of graphQLErrors) {
    switch (error.extensions.code) {
      // Apollo Server sets code to UNAUTHENTICATED
      // when an AuthenticationError is thrown in a resolver
      case 'UNAUTHENTICATED':
        return new Observable((observer) => {
          refreshToken()
            ?.then((refreshResponse) => {
              operation.setContext(({ headers = {} }) => {
                const token = refreshResponse?.data?.refreshToken
                storeAccessToken(token)

                return {
                  headers: {
                    ...headers,
                    Authorization: token ? `Bearer ${token}` : '',
                  },
                }
              })
            })
            .then(() => {
              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              }

              // Retry last failed request
              forward(operation).subscribe(subscriber)
            })
            .catch((error) => {
              // No refresh or client token available, we force user to login
              observer.error(error)
            })
        })
    }
  }
  return
})

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = getAccessToken() || null
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  }
})

export const apolloClient = new ApolloClient({
  connectToDevTools: true,
  uri: GRAPHQL_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  link: authLink.concat(errorLink.concat(httpLink)),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          assets: relayStylePagination(),
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})
