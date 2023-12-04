import { t, Trans } from '@lingui/macro'
import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Avatar from 'src/components/Avatar'
import AvatarEditModal from 'src/components/AvatarEditModal'
import { TabButton } from 'src/components/Button'
import { ActiveLink } from 'src/components/Link'
import { RowBetween, RowCenter } from 'src/components/Row'
import Section from 'src/components/Section'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { useDefaultAvatarIdFromUrl } from 'src/hooks/useDefaultAvatarUrls'
import useSearchedUser from 'src/hooks/useSearchedUser'
import { useAvatarEditModalToggle } from 'src/state/application/hooks'
import { useSearchUser } from 'src/state/user/hooks'
import { TYPE } from 'src/styles/theme'
import { Column, Row } from 'src/theme/components/Flex'
import * as Text from 'src/theme/components/Text'
import styled from 'styled-components/macro'

import * as styles from './Profile.css'

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
      { name: t`Cards`, path: 'cards' },
      { name: t`Packs`, path: 'packs' },
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

              <Row gap="4">
                <Text.HeadlineMedium>{user.username}</Text.HeadlineMedium>
              </Row>
            </Column>
          </UserWrapper>

          <div />
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
