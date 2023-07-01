import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Trans } from '@lingui/macro'

// import Image from 'src/theme/components/Image'
import Box from 'src/theme/components/Box'
import { PaginationSpinner } from 'src/components/Spinner'
import EmptyLayout from 'src/components/Layout/Empty'
import * as styles from './style.css'
import * as Text from 'src/theme/components/Text'
import { PrimaryButton } from 'src/components/Button'
import { Column, Row } from 'src/theme/components/Flex'
import useWindowSize from 'src/hooks/useWindowSize'
import { useAuthModalToggle } from 'src/state/application/hooks'
import { useSetAuthMode } from 'src/state/auth/hooks'
import { AuthMode } from 'src/state/auth/actions'
import AuthModal from 'src/components/AuthModal'

import { ReactComponent as Logo } from 'src/images/logo.svg'
import { useReferentQuery } from 'src/graphql/data/__generated__/types-and-hooks'
import Avatar from 'src/components/Avatar'
import Image from 'src/theme/components/Image'

function Newcomer() {
  // get referent
  const { referentSlug } = useParams()

  // auth modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  const toggleSignUpModal = useCallback(() => {
    setAuthMode(AuthMode.SIGN_UP)
    toggleAuthModal()
  }, [toggleAuthModal])

  // sample query
  const { data, loading, error } = useReferentQuery({ variables: { slug: referentSlug ?? '' }, skip: !referentSlug })
  const referent = data?.user
  const rookiePack = data?.lastRookiePack

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
            referent && (
              <Box className={styles.infoPageContainer}>
                <Row className={styles.imagesContainer}>
                  <Avatar
                    className={styles.avatar}
                    src={referent.profile.pictureUrl}
                    fallbackSrc={referent.profile.fallbackUrl}
                  />
                  <Image className={styles.packImage} src={rookiePack?.pictureUrl} />
                </Row>

                <Column className={styles.infoContainer}>
                  <Text.HeadlineMedium textAlign={'center'}>
                    <Trans>{referent.username} offers you a pack of cards !</Trans>
                  </Text.HeadlineMedium>

                  <Text.Body>
                    <Trans>A Rookie pack offered if you buy a starter pack to start your collection</Trans>
                  </Text.Body>

                  <PrimaryButton onClick={toggleSignUpModal} large>
                    <Trans>Start</Trans>
                  </PrimaryButton>
                </Column>
              </Box>
            )
          )}
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
