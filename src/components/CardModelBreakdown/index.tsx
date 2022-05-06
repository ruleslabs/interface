import styled from 'styled-components'

import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import Certified from '@/images/certified.svg'
import Link from '@/components/Link'

const UserLogin = styled(RowCenter)`
  margin 4px 0 32px;
  gap: 4px;

  svg {
    width: 18px;
  }
`

const Serial = styled(TYPE.body)`
  & span {
    opacity: 0.5;
  }
`

interface CardModelBreakdownProps {
  artistName: string
  artistUsername: string
  artistUserSlug: string
  season: number
  scarcity: string
  maxSupply: number
  serial?: number
}

export default function CardModelBreakdown({
  artistName,
  artistUsername,
  artistUserSlug,
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
        <Link href={`/${artistUsername}`}>
          <TYPE.body clickable>{artistUsername}</TYPE.body>
        </Link>
        <Certified width="18px" />
      </UserLogin>
      <Column gap={8}>
        <TYPE.body>Season {season}</TYPE.body>
        <TYPE.body>{scarcity} Card</TYPE.body>
        {serial ? (
          <Serial>
            #{serial}
            <span> /{maxSupply ?? ' +'}</span>
          </Serial>
        ) : (
          <Serial>
            {maxSupply ? `${maxSupply} ex.` : ''}
            <span color="text2"> Serie {maxSupply ? 'limitée' : 'illimitée'}</span>
          </Serial>
        )}
      </Column>
    </>
  )
}
