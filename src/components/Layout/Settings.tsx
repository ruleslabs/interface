import React from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { TYPE } from 'src/styles/theme'
import Section from 'src/components/Section'
import { ActiveLink } from 'src/components/Link'
import { RowCenter } from 'src/components/Row'
import useCurrentUser from 'src/hooks/useCurrentUser'

import { ReactComponent as UserIcon } from 'src/images/user.svg'
import { ReactComponent as EthereumIcon } from 'src/images/ethereum-plain.svg'
import { ReactComponent as ShieldIcon } from 'src/images/shield.svg'
import { ReactComponent as SessionsIcon } from 'src/images/sessions.svg'
import { ReactComponent as StarknetIcon } from 'src/images/starknet.svg'
import { ReactComponent as TicketIcon } from 'src/images/ticket.svg'

const StyledSection = styled(Section)`
  margin-top: 64px;
  display: flex;
  gap: 64px;
  justify-content: start;

  ${({ theme }) => theme.media.medium`
    gap: 32px;
  `}

  ${({ theme }) => theme.media.small`
  margin-top: 32px;
    flex-direction: column;
  `}
`

const Article = styled.article`
  max-width: 786px;
  width: 100%;
`

const AsideSettings = styled.aside`
  min-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const SettingsCategoryButton = styled(RowCenter)`
  gap: 6px;
  border-radius: 6px;
  padding: 8px;
  position: relative;
  margin-left: 12px;

  svg {
    fill: ${({ theme }) => theme.bg3};
    width: 16px;
    height: 16px;
  }

  &.active {
    background: ${({ theme }) => theme.bg3}40;

    &::after {
      content: '';
      background: ${({ theme }) => theme.primary1};
      display: block;
      position: absolute;
      top: 1px;
      bottom: 1px;
      width: 5px;
      border-radius: 6px;
      left: -12px;
    }
  }

  &:not(.active):hover {
    background: ${({ theme }) => theme.bg3}20;
  }
`

const categories = [
  {
    name: 'Profile',
    slug: 'profile',
    icon: <UserIcon />,
  },
  {
    name: 'Security',
    slug: 'security',
    icon: <ShieldIcon />,
  },
  {
    name: 'Sessions',
    slug: 'sessions',
    icon: <SessionsIcon />,
  },
  {
    name: 'Starknet',
    slug: 'starknet',
    icon: <StarknetIcon />,
  },
  {
    name: 'Ethereum',
    slug: 'ethereum',
    icon: <EthereumIcon />,
  },
  {
    name: 'Live events',
    slug: 'live-events',
    icon: <TicketIcon />,
  },
] // TODO: move it somewhere else as a single source of truth

export default function SettingsLayout({ children }: React.HTMLAttributes<HTMLDivElement>) {
  // current user
  const { currentUser } = useCurrentUser()

  if (!currentUser) return null

  return (
    <StyledSection>
      <AsideSettings>
        {categories.map((category) => (
          <ActiveLink key={category.slug} href={`/settings/${category.slug}`} perfectMatch>
            <SettingsCategoryButton>
              {category.icon}
              <TYPE.body>
                <Trans id={category.name}>{category.name}</Trans>
              </TYPE.body>
            </SettingsCategoryButton>
          </ActiveLink>
        ))}
      </AsideSettings>

      <Article>{children}</Article>
    </StyledSection>
  )
}
