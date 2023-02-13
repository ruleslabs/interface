import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import { Certified } from '@/components/User/Badge'
import Link from '@/components/Link'

const UserLogin = styled(RowCenter)`
  margin 4px 0 32px;
  gap: 4px;

  svg {
    width: 18px;
  }
`

interface CardModelBreakdownProps {
  artistName: string
  artistUsername?: string
  season: number
  scarcityName: string
  maxSupply: number
  serial?: number
  slug: string
}

export default function CardModelBreakdown({
  artistName,
  artistUsername,
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
        {artistUsername ? (
          <Link href={`/user/${artistUsername}`}>
            <TYPE.body clickable>{artistUsername}</TYPE.body>
          </Link>
        ) : (
          <TYPE.body>
            <Trans>Official card</Trans>
          </TYPE.body>
        )}
        <Certified />
      </UserLogin>

      <Column gap={8}>
        <TYPE.body>
          <Trans>Season {season}</Trans>
        </TYPE.body>
        <Trans id={`${scarcityName} card`} render={({ translation }) => <TYPE.body>{translation}</TYPE.body>} />
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
