import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { Trans } from '@lingui/macro'

import { ActiveLink } from '@/components/Link'
import Section from '@/components/Section'
import { TYPE } from '@/styles/theme'
import Row, { RowCenter } from '@/components/Row'
import { ColumnCenter } from '@/components/Column'
import User from '@/components/User'
import { TabButton } from '@/components/Button'
import { useSearchUser, useCurrentUser } from '@/state/user/hooks'
import DiscordUser from '@/components/DiscordStatus/DiscordUser'

import Instagram from '@/images/instagram-color.svg'
import Twitter from '@/images/twitter-color.svg'

const StyledSection = styled(Section)`
  background: ${({ theme }) => theme.bg2};
  height: 397px;
  position: relative;
  display: inline-block;

  ${({ theme }) => theme.media.medium`
    margin-bottom: 28px;
  `}

  ${({ theme }) => theme.media.small`
    height: 463px;
  `}
`

const UserSection = styled(Section)`
  z-index: 2;
  margin-top: -104px;
  display: flex;
  justify-content: space-between;

  ${({ theme }) => theme.media.small`
    width: fit-content;
    flex-direction: column;
  `}
`

const Gradient = styled.div`
  background: ${({ theme }) => theme.gradient1};
  box-shadow: inset 0 -5px 5px -5px rgb(0 0 0 / 50%);
  height: 183px;
  width: 100%;
`

const SocialLink = styled.a`
  svg {
    width: 24px;
    height: 24px;
  }
`

const TabBar = styled(Row)`
  position: absolute;
  justify-content: center;
  bottom: 0;
  left: 0;
  right: 0;
  gap: 32px;
`

const StyledDiscordUser = styled(DiscordUser)`
  margin-top: 128px; // 208px / 2 + 24px

  ${({ theme }) => theme.media.small`
    margin: 16px auto;
    width: fit-content;
  `}
`

export const tabLinks = [
  { name: 'Deck', link: '' },
  { name: 'Cards', link: '/cards' },
  { name: 'Packs', link: '/packs' },
  { name: 'Ruledex', link: '/ruledex' },
] // TODO: move it somewhere else as a single source of truth

export default function ProfileLayout({ children }: { children: React.ReactElement }) {
  const router = useRouter()
  const { username } = router.query
  const userSlug = typeof username === 'string' ? username.toLowerCase() : undefined

  const currentUser = useCurrentUser()
  const { searchedUser, loading, error } = useSearchUser(userSlug, currentUser?.slug === userSlug)

  const user = currentUser?.slug === userSlug ? currentUser : searchedUser

  if (error || (!user && !loading)) return <TYPE.body>User not found</TYPE.body>
  else if (!user) return null

  const discordUser = user?.profile?.discordUser

  return (
    <>
      <StyledSection size="max">
        <Gradient />
        <UserSection>
          <ColumnCenter gap={8} style={{ width: 'fit-content' }}>
            <User
              username={`${user.username}`}
              pictureUrl={user.profile.pictureUrl}
              certified={user.profile.certified}
              certifiedPictureUrl={user.profile.certifiedPictureUrl}
              size="lg"
              canEdit={userSlug === currentUser?.slug}
            />
            <RowCenter gap={8}>
              {user?.profile?.instagramUsername && (
                <SocialLink target="_blank" href={`https://instagram.com/${user.profile.instagramUsername}`}>
                  <Instagram />
                </SocialLink>
              )}
              {user?.profile?.twitterUsername && (
                <SocialLink target="_blank" href={`https://twitter.com/${user.profile.twitterUsername}`}>
                  <Twitter />
                </SocialLink>
              )}
            </RowCenter>
          </ColumnCenter>
          {user.profile.discordUser && user.profile.isDiscordVisible && (
            <StyledDiscordUser
              username={user.profile.discordUser.username}
              discriminator={user.profile.discordUser.discriminator}
            />
          )}
        </UserSection>
        <TabBar>
          {tabLinks.map((tabLink, index: number) => (
            <ActiveLink key={`tab-link-${index}`} href={`/user/${userSlug}${tabLink.link}`} perfectMatch>
              <TabButton>
                <Trans id={tabLink.name} render={({ translation }) => <>{translation}</>} />
              </TabButton>
            </ActiveLink>
          ))}
        </TabBar>
      </StyledSection>
      {React.cloneElement(children, { userId: user.id })}
    </>
  )
}
