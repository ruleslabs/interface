import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { t, Trans } from '@lingui/macro'

import { ActiveLink } from '@/components/Link'
import Section from '@/components/Section'
import { TYPE } from '@/styles/theme'
import { RowBetween, RowCenter } from '@/components/Row'
import { ColumnCenter } from '@/components/Column'
import { TabButton } from '@/components/Button'
import { useSearchUser, useCurrentUser } from '@/state/user/hooks'
import DiscordMember from '@/components/DiscordStatus/DiscordMember'
import AvatarEditModal from '@/components/AvatarEditModal'
import { useDefaultAvatarIdFromUrl } from '@/hooks/useDefaultAvatarUrls'
import Avatar from '@/components/Avatar'
import { CertifiedBadge } from '@/components/User/Badge'
import UserRank from '@/components/User/Rank'
import { useCScoreRank } from '@/hooks/useCScore'
import { useAvatarEditModalToggle } from '@/state/application/hooks'

import Instagram from '@/images/instagram-color.svg'
import Twitter from '@/images/twitter-color.svg'

const Gradient = styled.div`
  background: ${({ theme }) => theme.gradient1};
  box-shadow: inset 0 -5px 5px -5px rgb(0 0 0 / 50%);
  height: 140px;
  width: 100%;
`

const UserWrapper = styled(RowBetween)`
  z-index: 2;
  margin-top: -104px;
  justify-content: space-between;

  ${({ theme }) => theme.media.small`
    flex-direction: column;
    align-items: center;
  `}
`

const AvatarWrapper = styled.div`
  position: relative;
  width: 170px;

  img {
    width: 100%;
    border: 10px solid ${({ theme }) => theme.bg1};
  }
`

const AvatarEditButton = styled(RowCenter)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  justify-content: center;
  background: ${({ theme }) => theme.bg1}a0;
  opacity: 0;
  border-radius: 50%;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`

const SocialLink = styled.a`
  svg {
    width: 24px;
    height: 24px;
  }
`

const TabBarSection = styled(Section)`
  display: flex;
  width: 100%;
  justify-content: center;
  gap: 12px 32px;
  flex-wrap: wrap;
  border-color: ${({ theme }) => theme.bg3}80;
  border-style: solid;
  border-width: 0 0 1px;

  ${({ theme }) => theme.media.extraSmall`
    padding: 0;
  `}
`

const StyledDiscordMember = styled(DiscordMember)`
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
  { name: 'Rulédex', link: '/ruledex' },
  { name: t`Activity`, link: '/activity' },
] // TODO: move it somewhere else as a single source of truth

export default function ProfileLayout({ children }: { children: React.ReactElement }) {
  const router = useRouter()
  const { username } = router.query
  const userSlug = typeof username === 'string' ? username.toLowerCase() : undefined

  const currentUser = useCurrentUser()
  const { searchedUser, error } = useSearchUser(userSlug, currentUser?.slug === userSlug)

  const user = currentUser?.slug === userSlug ? currentUser : searchedUser

  const defaultAvatarId = useDefaultAvatarIdFromUrl(user?.profile.pictureUrl)

  // pp edit modal
  const toggleAvatarEditModal = useAvatarEditModalToggle()

  // cScore rank
  const rank = useCScoreRank(user?.cScore ?? 0)

  // TODO: clean this ugly code bruh
  if (error) return <TYPE.body>User not found</TYPE.body>
  else if (!user) return null

  return (
    <>
      <Gradient />

      <Section>
        <UserWrapper>
          <ColumnCenter gap={8} style={{ width: 'fit-content' }}>
            <AvatarWrapper>
              <Avatar src={user.profile.pictureUrl} fallbackSrc={user.profile.fallbackUrl} />

              {userSlug === currentUser?.slug && (
                <AvatarEditButton onClick={toggleAvatarEditModal}>
                  <TYPE.medium>
                    <Trans>Edit</Trans>
                  </TYPE.medium>
                </AvatarEditButton>
              )}
            </AvatarWrapper>

            <RowCenter gap={4}>
              <TYPE.body>{user.username}</TYPE.body>

              {user.profile.certified && <CertifiedBadge />}
              <UserRank rank={rank} />
            </RowCenter>

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

          {user.profile.discordMember && (
            <StyledDiscordMember
              username={user.profile.discordMember.username}
              discriminator={user.profile.discordMember.discriminator}
            />
          )}
        </UserWrapper>
      </Section>

      <TabBarSection>
        {tabLinks.map((tabLink, index: number) => (
          <ActiveLink key={`tab-link-${index}`} href={`/user/${userSlug}${tabLink.link}`} perfectMatch>
            <TabButton>
              <Trans id={tabLink.name} render={({ translation }) => <>{translation}</>} />
            </TabButton>
          </ActiveLink>
        ))}
      </TabBarSection>

      {React.cloneElement(children, {
        userId: user?.id,
        address: user?.starknetWallet?.address,
        publicKey: user?.starknetWallet?.publicKey,
      })}

      <AvatarEditModal currentAvatarId={defaultAvatarId} customAvatarUrl={user.profile.customAvatarUrl} />
    </>
  )
}
