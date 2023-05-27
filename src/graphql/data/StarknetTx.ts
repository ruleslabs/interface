import gql from 'graphql-tag'

gql`
  query StarknetTransaction($hash: String!) {
    starknetTransaction(filter: { hash: $hash }) {
      status
    }
  }
`
