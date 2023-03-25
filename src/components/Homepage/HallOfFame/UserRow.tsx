import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import shortenUsername from '@/utils/shortenUsername'
import Link from '@/components/Link'
import { RowCenter } from '@/components/Row'
import Avatar from '@/components/Avatar'
import { TYPE } from '@/styles/theme'
import Tooltip from '@/components/Tooltip'
import useParsedCScore from '@/hooks/useParsedCScore'

const StyledTooltip = styled(Tooltip)`
  width: 236px;
  right: -258px;
  bottom: 10px;
  box-shadow: 0 0 4px #00000020;
  transform: translateY(50%);
`

const CScore = styled(TYPE.body)`
  position: relative;

  &:hover > div {
    display: unset;
  }
`

const StyledUserRow = styled(RowCenter)`
  gap: 12px;
  position: relative;

  img {
    border-radius: 50%;
    width: 26px;
    height: 26px;
  }
`

const Medal = styled(TYPE.medium)`
  position: absolute;
  top: 8px;
  left: 14px;
`

const Rank = styled(RowCenter)`
  background: ${({ theme }) => theme.bg1};
  border-radius: 50%;
  width: 26px;
  height: 26px;

  * {
    width: 100%;
    text-align: center;
  }
`

interface UserRowProps {
  cScore: number
  username: string
  pictureUrl: string
  fallbackUrl: string
  slug: string
  rank?: number
}

const MemoizedUserRowPropsEqualityCheck = (prevProps: UserRowProps, nextProps: UserRowProps) =>
  prevProps.slug === nextProps.slug

const MemoizedUserRow = React.memo(function UserRow({
  cScore,
  username,
  pictureUrl,
  fallbackUrl,
  slug,
  rank = 0,
}: UserRowProps) {
  // shorten username
  const shortUsername = useMemo(() => shortenUsername(username), [username])

  // parsed C-Score
  const roundedParsedCScore = useParsedCScore(cScore)
  const fullParsedCScore = useParsedCScore(cScore, { rounded: false })

  return (
    <StyledUserRow>
      <Link href={`/user/${slug}`}>
        {rank <= 3 ? (
          <>
            <Avatar src={pictureUrl} fallbackSrc={fallbackUrl} />
            {!!rank && <Medal>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</Medal>}
          </>
        ) : (
          <Rank>
            <TYPE.body>{rank}.</TYPE.body>
          </Rank>
        )}
      </Link>

      <Link href={`/user/${slug}`}>
        <TYPE.body clickable>{shortUsername}</TYPE.body>
      </Link>

      <CScore>
        <TYPE.body color="text2">{roundedParsedCScore}</TYPE.body>

        <StyledTooltip direction="left">
          <TYPE.body>
            <Trans>Collection score: {fullParsedCScore}</Trans>
          </TYPE.body>
        </StyledTooltip>
      </CScore>
    </StyledUserRow>
  )
},
MemoizedUserRowPropsEqualityCheck)

export default MemoizedUserRow
