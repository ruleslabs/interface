import styled from 'styled-components/macro'
import { gql, useQuery } from '@apollo/client'
import { Trans } from '@lingui/macro'

import { TYPE } from 'src/styles/theme'
import { RowCenter } from 'src/components/Row'
import Column from 'src/components/Column'
import { PageBody, PageContent, PageWrapper, MainActionButton } from './SubComponents'
import Link from 'src/components/Link'

const PackPictureWrapper = styled(RowCenter)`
  width: 35%;
  justify-content: center;

  img {
    max-width: 256px;
    width: 100%;
    object-fit: contain;
  }
`

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
    <PageBody>
      <PageWrapper>
        <PackPictureWrapper>
          <img src={pack?.pictureUrl} />
        </PackPictureWrapper>
        <PageContent>
          <TYPE.large textAlign="center">
            <Trans>Get your first pack</Trans>
          </TYPE.large>
          <TYPE.body>
            <Trans>
              RULES cards can be found in packs. Packs are available in limited quantity drops. Don&apos;t panic! We
              have locked a Starter Pack for you. This pack contains 3 common cards that will get you started.
            </Trans>
          </TYPE.body>
          <Column gap={16}>
            {pack && (
              <Link href={`/pack/${pack.slug}`}>
                <MainActionButton large>
                  <Trans>Buy - {(pack.price / 100).toFixed(2)}€</Trans>
                </MainActionButton>
              </Link>
            )}
          </Column>
        </PageContent>
        <div />
      </PageWrapper>
    </PageBody>
  )
}
