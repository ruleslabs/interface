import gql from 'graphql-tag'

gql`
  query CardTransfers($tokenId: String!, $sort: CardTransfersSort!) {
    cardTransfers(filter: { tokenId: $tokenId }, sort: $sort) {
      id
      fromOwner {
        user {
          slug
          username
        }
      }
      toOwner {
        user {
          slug
          username
          profile {
            pictureUrl(derivative: "width=128")
            fallbackUrl(derivative: "width=128")
          }
        }
      }
      price
      kind
      date
    }
  }
`

gql`
  query CardModelSaleTransfers($cardModelId: ID!, $sort: CardTransfersSort!) {
    cardModelSaleTransfers(filter: { cardModelId: $cardModelId }, sort: $sort) {
      id
      fromOwner {
        user {
          slug
          username
        }
      }
      toOwner {
        user {
          slug
          username
          profile {
            pictureUrl(derivative: "width=128")
            fallbackUrl(derivative: "width=128")
          }
        }
      }
      card {
        serialNumber
      }
      price
      date
    }
  }
`
