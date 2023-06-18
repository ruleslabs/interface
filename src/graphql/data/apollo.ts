import { ApolloClient, InMemoryCache, HttpLink, Observable, ApolloLink, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

import refreshToken from 'src/utils/refreshToken'
import { storeAccessToken, getAccessToken } from 'src/utils/accessToken'
import { relayStylePagination } from '@apollo/client/utilities'

const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URI
if (!GRAPHQL_URL) {
  throw new Error('GRAPHQL URI MISSING FROM ENVIRONMENT')
}

const httpLink = new HttpLink({
  uri: GRAPHQL_URL, // must be absolute
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
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

const authMiddleware = new ApolloLink((operation, forward) => {
  // get the authentication token from local storage if it exists
  const token = getAccessToken() || null

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  }))

  return forward(operation)
})

export const apolloClient = new ApolloClient({
  connectToDevTools: true,
  link: from([authMiddleware, errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          cardListings: relayStylePagination(),
          cardModels: relayStylePagination(),
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
