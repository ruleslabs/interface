import React from 'react'
import styled from 'styled-components'

import useCurrentUser from '@/hooks/useCurrentUser'
import { RowCenter } from '@/components/Row'
import Avatar from '@/components/Avatar'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import useParsedCScore from '@/hooks/useParsedCScore'

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
