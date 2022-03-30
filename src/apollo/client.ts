import { NextPageContext } from 'next/types'
import { ApolloClient, InMemoryCache, NormalizedCacheObject, HttpLink, Observable } from '@apollo/client'
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries'
import { sha256 } from 'crypto-hash'
import fetch from 'isomorphic-unfetch'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

import refreshToken from '@/utils/refreshToken'
import { storeAccessToken, getAccessToken } from '@/utils/accessToken'

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI, // must be absolute
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
                    authorization: token ? `Bearer ${token}` : '',
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
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

export default function createApolloClient(initialState: NormalizedCacheObject = {}, ctx?: NextPageContext) {
  return new ApolloClient({
    ssrMode: Boolean(ctx),
    link: createPersistedQueryLink({ sha256 }).concat(authLink.concat(errorLink.concat(httpLink))),
    cache: new InMemoryCache().restore(initialState),
  })
}
