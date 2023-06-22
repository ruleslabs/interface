import { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'

import Image from 'src/theme/components/Image'
import Box from 'src/theme/components/Box'
import ms from 'ms.macro'
import Section from 'src/components/Section'
import { PaginationSpinner } from 'src/components/Spinner'
import Carousel from 'src/components/Carousel'
import EmptyLayout from 'src/components/Layout/Empty'
import * as styles from './style.css'
import * as Text from 'src/theme/components/Text'

import { ReactComponent as Logo } from 'src/images/logo.svg'
import { PrimaryButton } from 'src/components/Button'
import { Trans } from '@lingui/macro'
import { Column } from 'src/theme/components/Flex'

const CARD_MODELS_SAMPLE_QUERY = gql`
  query {
    currentSeasonCardModelsSample {
      id
      pictureUrl(derivative: "width=512")
    }
  }
`

function Newcomer() {
  const { data, loading, error } = useQuery(CARD_MODELS_SAMPLE_QUERY)
  const cardModels: any[] = data?.currentSeasonCardModelsSample

  const items = useMemo(() => {
    if (!cardModels) return []

    return cardModels.map((cardModel) => (
      <Box key={cardModel.id} width={'full'}>
        <Image src={cardModel.pictureUrl} display={'block'} width={'full'} borderRadius={'card'} />
      </Box>
    ))
  }, [cardModels])

  if (error) return null

  return (
    <Section className={styles.sectionContainer}>
      <div />

      <Box className={styles.logoContainer}>
        <Logo />
      </Box>

      {loading ? (
        <PaginationSpinner loading />
      ) : (
        <Box className={styles.carouselContainer}>
          <Carousel items={items} itemWith={'256'} interval={ms('1.5s')} />
        </Box>
      )}

      <Column gap={'16'} alignItems={'center'}>
        <Text.HeadlineMedium>
          <Trans>Start your collection</Trans>
        </Text.HeadlineMedium>

        <PrimaryButton width={'256'} large>
          <Trans>Start</Trans>
        </PrimaryButton>
      </Column>
    </Section>
  )
}

Newcomer.withLayout = () => (
  <EmptyLayout>
    <Newcomer />
  </EmptyLayout>
)

export default Newcomer
