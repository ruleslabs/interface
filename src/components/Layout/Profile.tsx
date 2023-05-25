import React from 'react'
import styled from 'styled-components/macro'
import { t, Trans } from '@lingui/macro'

import { ActiveLink } from 'src/components/Link'
import Section from 'src/components/Section'
import { TYPE } from 'src/styles/theme'
import { RowBetween, RowCenter } from 'src/components/Row'
import { ColumnCenter } from 'src/components/Column'
import { TabButton } from 'src/components/Button'
import { useSearchUser } from 'src/state/user/hooks'
import DiscordMember from 'src/components/DiscordStatus/DiscordMember'
import AvatarEditModal from 'src/components/AvatarEditModal'
import { useDefaultAvatarIdFromUrl } from 'src/hooks/useDefaultAvatarUrls'
import Avatar from 'src/components/Avatar'
import { CertifiedBadge } from 'src/components/User/Badge'
import UserRank from 'src/components/User/Rank'
import { useCScoreRank } from 'src/hooks/useCScore'
import { useAvatarEditModalToggle } from 'src/state/application/hooks'
import * as Icons from 'src/theme/components/Icons'
import useCurrentUser from 'src/hooks/useCurrentUser'
import useLocationQuery from 'src/hooks/useLocationQuery'

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
    background-color: ${({ theme }) => theme.bg1};
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
  color: ${({ theme }) => theme.text2};

  &:hover {
    color: ${({ theme }) => theme.text1};
  }

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
  const query = useLocationQuery()
  const username = query.get('username')
  const userSlug = typeof username === 'string' ? username.toLowerCase() : undefined

  const { currentUser } = useCurrentUser()
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
          <ColumnCenter gap={12} style={{ width: 'fit-content' }}>
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

            <RowCenter gap={12}>
              {user?.profile?.instagramUsername && (
                <SocialLink target="_blank" href={`https://instagram.com/${user.profile.instagramUsername}`}>
                  <Icons.Instagram />
                </SocialLink>
              )}
              {user?.profile?.twitterUsername && (
                <SocialLink target="_blank" href={`https://twitter.com/${user.profile.twitterUsername}`}>
                  <Icons.Twitter />
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
              <Trans id={tabLink.name}>{tabLink.name}</Trans>
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
