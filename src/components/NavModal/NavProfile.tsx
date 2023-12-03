import React from 'react'
import Avatar from 'src/components/Avatar'
import Column from 'src/components/Column'
import { RowCenter } from 'src/components/Row'
import useCurrentUser from 'src/hooks/useCurrentUser'
import useParsedCScore from 'src/hooks/useParsedCScore'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

const ProfileRow = styled(RowCenter)`
  gap: 8px;
  padding: 8px;
  border-radius: 6px;

  & img {
    width: 48px;
    height: 48px;
  }

  &.active {
    background: ${({ theme }) => theme.bg3}40;
  }

  & * {
    word-break: break-all;
  }
`

export default function NavProfile(props: React.HTMLAttributes<HTMLDivElement>) {
  // current user
  const { currentUser } = useCurrentUser()

  // parsed cScore
  const parsedCScore = useParsedCScore(currentUser?.cScore, { rounded: false })

  if (!currentUser) return null

  return (
    <ProfileRow {...props}>
      <Avatar src={currentUser.profile.pictureUrl} fallbackSrc={currentUser.profile.fallbackUrl} />

      <Column gap={4}>
        <TYPE.body fontWeight={500}>{currentUser.username}</TYPE.body>
        <TYPE.subtitle>{parsedCScore}</TYPE.subtitle>
      </Column>
    </ProfileRow>
  )
}
