import { gql } from '@apollo/client'

gql`
  query Referent($slug: String!) {
    user(slug: $slug) {
      username
      slug
      profile {
        pictureUrl(derivative: "width=320")
        fallbackUrl(derivative: "width=320")
      }
    }
    lastRookiePack {
      pictureUrl(derivative: "width=512")
    }
  }
`
