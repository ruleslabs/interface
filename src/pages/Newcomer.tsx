import { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'

import * as Text from 'src/theme/components/Text'
import Image from 'src/theme/components/Image'
import Box from 'src/theme/components/Box'
import ms from 'ms.macro'
import Section from 'src/components/Section'
import { PaginationSpinner } from 'src/components/Spinner'
import Carousel from 'src/components/Carousel'
import EmptyLayout from 'src/components/Layout/Empty'

const ALL_CARD_MODELS_QUERY = gql`
  query {
    allCardModels {
      id
      pictureUrl(derivative: "width=512")
    }
  }
`

function Newcomer() {
  const { data, loading, error } = useQuery(ALL_CARD_MODELS_QUERY)
  const cardModels: any[] = data?.allCardModels

  const items = useMemo(() => {
    if (!cardModels) return []

    return cardModels.slice(0, 5).map((cardModel) => (
      <Box key={cardModel.id} width={'full'}>
        <Image src={cardModel.pictureUrl} display={'block'} width={'full'} />
      </Box>
    ))
  }, [cardModels])

  if (error) return null

  return (
    <Section>
      {loading ? (
        <PaginationSpinner loading />
      ) : (
        <>
          <Text.Body>HI</Text.Body>
          <Box overflow={'hidden'}>
            <Carousel items={items} itemWith={'256'} interval={ms('1.5s')} />
          </Box>
        </>
      )}
    </Section>
  )
}

Newcomer.withLayout = () => (
  <EmptyLayout>
    <Newcomer />
  </EmptyLayout>
)

export default Newcomer
