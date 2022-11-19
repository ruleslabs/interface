import React from 'react'
import styled from 'styled-components'

import DiscordLogo from '@/images/discord.svg'
import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'

const StyledDiscordMember = styled(RowCenter)`
  background: ${({ theme }) => theme.bg3};
  height: 36px;
  border-radius: 4px;
  overflow: hidden;

  & > div {
    margin: 0 6px;
  }
`

const StyledDiscordLogo = styled(DiscordLogo)`
  background: ${({ theme }) => theme.bg1};
  width: 36px;
  height: 36px;
  padding: 9px 6px;

  * {
    fill: ${({ theme }) => theme.text1};
  }
`

interface DiscordMemberProps extends React.HTMLAttributes<HTMLDivElement> {
  username: string
  discriminator: string
}

export default function DiscordMember({ username, discriminator, ...props }: DiscordMemberProps) {
  return (
    <StyledDiscordMember {...props}>
      <StyledDiscordLogo />
      <TYPE.body spanColor="text2">
        {username}
        <span>#{discriminator}</span>
      </TYPE.body>
    </StyledDiscordMember>
  )
}
