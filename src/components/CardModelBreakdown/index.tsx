import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import Certified from '@/components/Certified'
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
  scarcity: string
  maxSupply: number
  serial?: number
}

export default function CardModelBreakdown({
  artistName,
  artistUsername,
  season,
  scarcity,
  maxSupply,
  serial,
}: CardModelBreakdownProps) {
  return (
    <>
      <TYPE.medium fontSize={28} fontWeight={700}>
        {artistName}
      </TYPE.medium>
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
        <Trans id={`${scarcity} card`} render={({ translation }) => <TYPE.body>{translation}</TYPE.body>} />
        {serial ? (
          <TYPE.body spanColor="text2">
            #{serial}
            <span> / {maxSupply ?? '4000'}</span>
          </TYPE.body>
        ) : (
          <TYPE.subtitle>{maxSupply ? <Trans>Limited edition</Trans> : <Trans>Currently edited</Trans>}</TYPE.subtitle>
        )}
      </Column>
    </>
  )
}
