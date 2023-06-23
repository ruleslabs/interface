import { useCallback, useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'

import Image from 'src/theme/components/Image'
import Box from 'src/theme/components/Box'
import ms from 'ms.macro'
import { PaginationSpinner } from 'src/components/Spinner'
import Carousel from 'src/components/Carousel'
import EmptyLayout from 'src/components/Layout/Empty'
import * as styles from './style.css'
import * as Text from 'src/theme/components/Text'

import { ReactComponent as Logo } from 'src/images/logo.svg'
import { PrimaryButton } from 'src/components/Button'
import { Trans } from '@lingui/macro'
import { Column } from 'src/theme/components/Flex'
import useWindowSize from 'src/hooks/useWindowSize'
import { useAuthModalToggle } from 'src/state/application/hooks'
import { useSetAuthMode } from 'src/state/auth/hooks'
import { AuthMode } from 'src/state/auth/actions'
import AuthModal from 'src/components/AuthModal'

const CARD_MODELS_SAMPLE_QUERY = gql`
  query {
    currentSeasonCardModelsSample {
      id
      pictureUrl(derivative: "width=512")
      scarcity {
        name
      }
    }
  }
`

function Newcomer() {
  // auth modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  const toggleSignUpModal = useCallback(() => {
    setAuthMode(AuthMode.SIGN_UP)
    toggleAuthModal()
  }, [toggleAuthModal])

  // sample query
  const { data, loading, error } = useQuery(CARD_MODELS_SAMPLE_QUERY)
  const cardModels: any[] = data?.currentSeasonCardModelsSample

  const items = useMemo(() => {
    if (!cardModels) return []

    return cardModels.map((cardModel) => (
      <Box key={cardModel.id} width={'full'}>
        <Image src={cardModel.pictureUrl} className={styles.cardImage({ scarcity: cardModel.scarcity.name })} />
      </Box>
    ))
  }, [cardModels])

  // window height
  const { height: windowHeight } = useWindowSize()

  if (!windowHeight) return null

  if (error) return null

  return (
    <>
      <Column as={'section'} style={{ height: `${windowHeight}px` }} className={styles.sectionContainer}>
        <Column className={styles.contentContainer}>
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

            <PrimaryButton width={'256'} onClick={toggleSignUpModal} large>
              <Trans>Start</Trans>
            </PrimaryButton>
          </Column>
        </Column>
      </Column>

      <AuthModal />
    </>
  )
}

Newcomer.withLayout = () => (
  <EmptyLayout>
    <Newcomer />
  </EmptyLayout>
)

export default Newcomer
