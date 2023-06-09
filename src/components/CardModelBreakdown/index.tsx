import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { TYPE } from 'src/styles/theme'
import { RowCenter } from 'src/components/Row'
import Column from 'src/components/Column'
import { CertifiedBadge } from 'src/components/User/Badge'
import Link from 'src/components/Link'

const UserLogin = styled(RowCenter)`
  margin 4px 0 32px;
  gap: 4px;
`

interface CardModelBreakdownProps {
  artistName: string
  season: number
  scarcityName: string
  maxSupply: number
  serial?: number
  slug: string
}

export default function CardModelBreakdown({
  artistName,
  season,
  scarcityName,
  maxSupply,
  serial,
  slug,
}: CardModelBreakdownProps) {
  return (
    <>
      <Link href={`/card/${slug}`}>
        <TYPE.medium fontSize={28} fontWeight={700} clickable>
          {artistName}
        </TYPE.medium>
      </Link>

      <UserLogin>
        <TYPE.body>
          <Trans>Official card</Trans>
        </TYPE.body>
        <CertifiedBadge />
      </UserLogin>

      <Column gap={8}>
        <TYPE.body>
          <Trans>Season {season}</Trans>
        </TYPE.body>
        <TYPE.body>
          <Trans id={`${scarcityName} card`}>{`${scarcityName} card`}</Trans>
        </TYPE.body>
        {serial ? (
          <TYPE.body spanColor="text2">
            #{serial}
            <span> / {maxSupply}</span>
          </TYPE.body>
        ) : (
          <TYPE.subtitle>
            {scarcityName === 'Common' ? <Trans>Currently edited</Trans> : <Trans>Limited edition</Trans>}
          </TYPE.subtitle>
        )}
      </Column>
    </>
  )
}
