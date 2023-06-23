import { constants } from '@rulesorg/sdk-core'
import gql from 'graphql-tag'
import { useRuledexQuery } from './__generated__/types-and-hooks'

gql`
  query Ruledex($season: Int!, $slug: String!) {
    user(slug: $slug) {
      ruledex(filter: { season: $season }) {
        ruledexCardModels {
          cardModel {
            slug
            uid
            scarcity {
              id
            }
            pictureUrl(derivative: "width=256")
          }
          owned
          badges {
            type
            level
          }
        }
        ruledexScarcities {
          balance
          maxBalance
          scarcityId
        }
      }
    }
  }
`

export function useRuledex(season: keyof typeof constants.Seasons, userSlug?: string) {
  return useRuledexQuery({ variables: { slug: userSlug ?? '', season }, skip: !userSlug })
}
