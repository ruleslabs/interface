import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components/macro'
import { Trans, t } from '@lingui/macro'
import { useParams } from 'react-router-dom'

import { ActiveLink } from 'src/components/Link'
import Section from 'src/components/Section'
import { TYPE } from 'src/styles/theme'
import { RowBetween, RowCenter } from 'src/components/Row'
import { TabButton } from 'src/components/Button'
import { useSearchUser } from 'src/state/user/hooks'
import AvatarEditModal from 'src/components/AvatarEditModal'
import { useDefaultAvatarIdFromUrl } from 'src/hooks/useDefaultAvatarUrls'
import Avatar from 'src/components/Avatar'
import { CertifiedBadge } from 'src/components/User/Badge'
import UserRank from 'src/components/User/Rank'
import { useAvatarEditModalToggle } from 'src/state/application/hooks'
import * as Icons from 'src/theme/components/Icons'
import useCurrentUser from 'src/hooks/useCurrentUser'
import useSearchedUser from 'src/hooks/useSearchedUser'
import { Column, Row } from 'src/theme/components/Flex'
import * as Text from 'src/theme/components/Text'
import * as styles from './Profile.css'
import useParsedCScore from 'src/hooks/useParsedCScore'
import { GenieBadge } from 'src/types'
import { BadgeIcon } from '../Badges'

const Gradient = styled.div`
  background: ${({ theme }) => theme.gradient1};
  box-shadow: inset 0 -5px 5px -5px rgb(0 0 0 / 50%);
  height: 140px;
  width: 100%;

  ${({ theme }) => theme.media.small`
    height: 85px;
  `}
`

const UserWrapper = styled(RowBetween)`
  z-index: 2;
  margin-top: -124px;
  justify-content: space-between;

  ${({ theme }) => theme.media.small`
    flex-direction: column;
    align-items: center;
  `}

  ${({ theme }) => theme.media.small`
    margin-top: -90px;
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

  ${({ theme }) => theme.media.small`
    width: 116px;
  `}
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
  color: ${({ theme }) => theme.text1};

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

export default function ProfileLayout({ children }: { children: React.ReactElement }) {
  // tabPaths
  const tabsNav = useMemo(
    () => [
      { name: t`Deck`, path: '' },
      { name: t`Cards`, path: 'cards' },
      { name: t`Packs`, path: 'packs' },
      { name: t`Rulédex`, path: 'ruledex' },
      { name: t`Activity`, path: 'activity' },
    ],
    []
  )

  // get username
  const { userSlug } = useParams()

  // search query
  const { currentUser } = useCurrentUser()
  const { searchedUser, error } = useSearchUser(userSlug)

  // format user
  const isCurrentUser = currentUser?.slug === userSlug
  const user = isCurrentUser ? currentUser : searchedUser
  const formatedSearchedUser = useMemo(
    () =>
      user
        ? {
            slug: user.slug as string,
            address: user.starknetWallet.address as string | undefined,
            publicKey: user.starknetWallet.publicKey as string,
            id: user.id as string,
            isCurrentUser,
          }
        : null,
    [user, isCurrentUser]
  )

  // save searched user
  const [, setUser] = useSearchedUser()
  useEffect(() => {
    setUser(formatedSearchedUser)
  }, [formatedSearchedUser?.slug])

  const defaultAvatarId = useDefaultAvatarIdFromUrl(user?.profile.pictureUrl)

  // pp edit modal
  const toggleAvatarEditModal = useAvatarEditModalToggle()

  // parsed cScore
  const parsedCScore = useParsedCScore(user?.cScore)

  // badges
  const badges: GenieBadge[] = user?.badges ?? []
  const badgesCount = useMemo(
    () => badges.reduce<number>((acc, { quantity }) => acc + (quantity ?? 1), 0),
    [badges.length]
  )

  // badges component
  const badgesComponent = useMemo(() => {
    return (
      <>
        {badges.map((badge) => (
          <Row key={`${badge.type}-${badge.level}`} gap={'4'}>
            <BadgeIcon badge={badge} width={'18'} />
            <Text.Body>
              <strong>{badge.quantity}</strong>
            </Text.Body>
          </Row>
        ))}
      </>
    )
  }, [badges.length])

  // TODO: clean this ugly code bruh
  if (error) return <TYPE.body>User not found</TYPE.body>
  else if (!user || !userSlug) return null

  return (
    <>
      <Gradient />

      <Section>
        <Row className={styles.profileContainer}>
          <UserWrapper>
            <Column style={{ width: 'fit-content' }}>
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

              <Row gap={'4'}>
                <Text.HeadlineMedium>{user.username}</Text.HeadlineMedium>

                {user.profile.certified && <CertifiedBadge />}
                <UserRank rank={user.rank} />
              </Row>

              <Column marginTop={'16'} gap={'6'}>
                <Text.Body>
                  Rules Score <strong>{parsedCScore}</strong>
                </Text.Body>

                <Text.Body>
                  Badges <strong>{badgesCount}</strong>
                </Text.Body>

                <Row gap={'12'}>{badgesComponent}</Row>
              </Column>
            </Column>
          </UserWrapper>

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
            {user?.profile?.discordMember && (
              <SocialLink target="_blank" href={`https://discordapp.com/users/${user?.profile?.discordMember.id}`}>
                <Icons.Discord />
              </SocialLink>
            )}
          </RowCenter>
        </Row>
      </Section>

      <TabBarSection>
        {tabsNav.map((tab) => (
          <ActiveLink key={tab.path} href={`/user/${userSlug}/${tab.path}`} perfectMatch>
            <TabButton>{tab.name}</TabButton>
          </ActiveLink>
        ))}
      </TabBarSection>

      {children}

      <AvatarEditModal currentAvatarId={defaultAvatarId} customAvatarUrl={user.profile.customAvatarUrl} />
    </>
  )
}
