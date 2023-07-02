import { gql, useQuery } from '@apollo/client'
import { Trans } from '@lingui/macro'

import Column from 'src/components/Column'
import Link from 'src/components/Link'
import Box from 'src/theme/components/Box'
import * as styles from './style.css'
import * as Text from 'src/theme/components/Text'
import Image from 'src/theme/components/Image'
import { PrimaryButton } from '../Button'
import { Row } from 'src/theme/components/Flex'

const STARTER_PACK_PAGE_ONBOARDING_QUERY = gql`
  query {
    lastStarterPack {
      slug
      pictureUrl(derivative: "width=512")
      price
    }
    lastRookiePack {
      pictureUrl(derivative: "width=256")
    }
    currentUser {
      referent {
        username
      }
    }
  }
`

export default function StarterPackPage() {
  const { data } = useQuery(STARTER_PACK_PAGE_ONBOARDING_QUERY)

  const starterPack = data?.lastStarterPack
  const rookiePack = data?.lastRookiePack

  const referentUsername = data?.currentUser?.referent?.username

  return (
    <Box className={styles.infoPageContainer}>
      {referentUsername ? (
        <Row className={styles.illustration}>
          <Image className={styles.starterPack} src={starterPack?.pictureUrl} />

          <Text.HeadlineLarge>+</Text.HeadlineLarge>

          <Image className={styles.rookiePack} src={rookiePack?.pictureUrl} />
        </Row>
      ) : (
        <Image className={styles.illustration} src={starterPack?.pictureUrl} />
      )}

      <Column className={styles.infoContainer}>
        <Text.HeadlineLarge textAlign={'center'}>
          <Trans>Get your first pack</Trans>
        </Text.HeadlineLarge>

        <Text.Body>
          <Trans>
            RULES cards can be found in packs. Packs are available in limited quantity drops. Don&apos;t panic! We have
            locked a Starter Pack for you. This pack contains 3 common cards that will get you started.
          </Trans>
        </Text.Body>

        {referentUsername && (
          <Text.Body>
            <Trans>A 2nd pack (Rookie Pack) offered by {referentUsername} will be delivered with.</Trans>
          </Text.Body>
        )}

        <Link href={starterPack ? `/pack/${starterPack?.slug}` : ''}>
          <PrimaryButton width={'full'} disabled={!starterPack} marginTop={'16'} large>
            {starterPack ? <Trans>Buy - {(starterPack.price / 100).toFixed(2)}€</Trans> : 'Loading ...'}
          </PrimaryButton>
        </Link>
      </Column>
    </Box>
  )
}
