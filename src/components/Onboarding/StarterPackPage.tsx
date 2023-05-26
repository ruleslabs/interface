import { gql, useQuery } from '@apollo/client'
import { Trans } from '@lingui/macro'

import Column from 'src/components/Column'
import Link from 'src/components/Link'
import Box from 'src/theme/components/Box'
import * as styles from './style.css'
import * as Text from 'src/theme/components/Text'
import Image from 'src/theme/components/Image'
import { PrimaryButton } from '../Button'

const LAST_STARTER_PACK = gql`
  query {
    lastStarterPack {
      slug
      pictureUrl(derivative: "width=512")
      price
    }
  }
`

export default function StarterPackPage() {
  const lastStarterPackQuery = useQuery(LAST_STARTER_PACK)
  const pack = lastStarterPackQuery.data?.lastStarterPack

  return (
    <Box className={styles.infoPageContainer}>
      <Image className={styles.illustration} src={pack?.pictureUrl} marginBottom={'32'} />

      <Column className={styles.infoContainer}>
        <Text.HeadlineLarge textAlign={'center'}>
          <Trans>Get your first pack</Trans>
        </Text.HeadlineLarge>

        <Text.Body>
          <Trans>
            RULES cards can be found in packs. Packs are available in limited quantity drops. Don&apos;t panic! We have
            have locked a Starter Pack for you. This pack contains 3 common cards that will get you started.
          </Trans>
        </Text.Body>

        <Link href={pack ? `/pack/${pack?.slug}` : ''}>
          <PrimaryButton width={'full'} disabled={!pack} large>
            {pack ? <Trans>Buy - {(pack.price / 100).toFixed(2)}€</Trans> : 'Loading ...'}
          </PrimaryButton>
        </Link>
      </Column>
    </Box>
  )
}
