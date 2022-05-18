import React, { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { ApolloError } from '@apollo/client'
import { Trans, t } from '@lingui/macro'

import Card from '@/components/Card'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Column from '@/components/Column'
import Row from '@/components/Row'
import Input from '@/components/Input'
import {
  useCurrentUser,
  useQueryCurrentUser,
  useSetSocialLinksMutation,
  useConnectDiscordAccountMutation,
  useDisconnectDiscordAccountMutation,
  useSetDiscordVisibilityMutation,
} from '@/state/user/hooks'
import Link from '@/components/Link'
import Checkbox from '@/components/Checkbox'

const StyledProfileEditor = styled(Card)`
  margin: 0;
  padding: 64px;
  width: 100%;

  ${({ theme }) => theme.media.medium`
    height: 100%;
    padding: 28px;
  `}
`

const SocialLinksWrapper = styled(Column)`
  gap: 16px;
  width 300px;
`

const DiscordStatusWrapper = styled(Column)`
  width: 100%;
  height: 100px;
  gap: 16px;
`

const DiscordConnect = styled(PrimaryButton)`
  width: 300px;
`

const DiscordDisconnect = styled(TYPE.body)`
  color: ${({ theme }) => theme.error};
  font-weight: 700;
`

export default function ProfileEditor() {
  const currentUser = useCurrentUser()
  const queryCurrentUser = useQueryCurrentUser()

  const router = useRouter()
  const discordCode = router?.query?.code

  // modified
  const [socialLinksModified, setSocialLinksModified] = useState(false)
  const [discordVisibilityModified, setDiscordVisibilityModified] = useState(false)

  // social links
  const [setSocialLinksMutation] = useSetSocialLinksMutation()
  const [instagramUsername, setInstagramUsername] = useState(currentUser?.profile?.instagramUsername ?? '')
  const [twitterUsername, setTwitterUsername] = useState(currentUser?.profile?.twitterUsername ?? '')

  const handleInstagramInput = useCallback(
    (value) => {
      setInstagramUsername(value)
    },
    [setInstagramUsername]
  )

  const handleTiwtterInput = useCallback(
    (value) => {
      setTwitterUsername(value)
    },
    [setTwitterUsername]
  )

  // discord
  const [discordLoading, setDiscordLoading] = useState(!!discordCode || !!currentUser?.profile?.discordId)
  const [connectDiscordAccountMutation] = useConnectDiscordAccountMutation()
  const [disconnectDiscordAccountMutation] = useDisconnectDiscordAccountMutation()
  const [setDiscordVisibilityMutation] = useSetDiscordVisibilityMutation()

  const [discordUser, setDiscordUser] = useState<any | null>(currentUser?.profile?.discordUser)
  const [isDiscordVisible, setIsDiscordVisible] = useState<boolean>(currentUser?.profile?.isDiscordVisible ?? false)

  const toggleDiscordVisibility = useCallback(() => setIsDiscordVisible(!isDiscordVisible), [isDiscordVisible])

  useEffect(() => {
    if (!discordCode) return

    setDiscordLoading(true)

    router.replace('/settings/profile', undefined, { shallow: true })
    connectDiscordAccountMutation({ variables: { code: discordCode } })
      .then((res: any) => {
        setDiscordUser(res?.data?.connectDiscordAccount ?? null)

        queryCurrentUser()
        setDiscordLoading(false)
      })
      .catch((connectDiscordAccountError: ApolloError) => {
        console.error(connectDiscordAccountError) // TODO: handle error
        setDiscordLoading(false)
      })
  }, [discordCode, router, connectDiscordAccountMutation, queryCurrentUser, setDiscordLoading, setDiscordUser])

  const handleDiscordDisconnect = useCallback(() => {
    setDiscordLoading(true)

    disconnectDiscordAccountMutation()
      .then((res: any) => {
        setDiscordUser(null)
        queryCurrentUser()
        setDiscordLoading(false)
      })
      .catch((disconnectDiscordAccountError: ApolloError) => {
        console.error(disconnectDiscordAccountError) // TODO: handle error
        setDiscordLoading(false)
      })
  }, [disconnectDiscordAccountMutation, queryCurrentUser])

  const discordOAuthRedirectUrl = useMemo(
    () =>
      `https://discord.com/api/oauth2/authorize?client_id=975024307044499456&redirect_uri=${encodeURIComponent(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/profile`
      )}&response_type=code&scope=identify`,
    []
  )

  // save changes
  const [setDiscordVisibilityLoading, setSetDiscordVisibilityLoading] = useState(false)
  const [setSocialLinksLoading, setSetSocialLinksLoading] = useState(false)

  useEffect(() => {
    setSocialLinksModified(
      (currentUser?.profile?.instagramUsername ?? '') !== instagramUsername ||
        (currentUser?.profile?.twitterUsername ?? '') !== twitterUsername
    )
    setDiscordVisibilityModified((currentUser?.profile?.isDiscordVisible ?? false) !== isDiscordVisible)
  }, [
    setSocialLinksModified,
    currentUser?.profile?.instagramUsername,
    currentUser?.profile?.twitterUsername,
    currentUser?.profile?.isDiscordVisible,
    instagramUsername,
    twitterUsername,
    isDiscordVisible,
  ])

  const saveSocialLinks = useCallback(() => {
    setSetSocialLinksLoading(true)
    setSocialLinksMutation({ variables: { twitterUsername, instagramUsername } })
      .then((res: any) => {
        setSocialLinksModified(false)

        queryCurrentUser()
        setSetSocialLinksLoading(false)
      })
      .catch((editProfileError: ApolloError) => {
        console.error(editProfileError) // TODO: handle error
        setSetSocialLinksLoading(false)
      })
  }, [
    queryCurrentUser,
    setSocialLinksMutation,
    setSetSocialLinksLoading,
    setSocialLinksModified,
    twitterUsername,
    instagramUsername,
  ])
  const saveDiscordVisibility = useCallback(() => {
    setSetDiscordVisibilityLoading(true)
    setDiscordVisibilityMutation({ variables: { visible: isDiscordVisible } })
      .then((res: any) => {
        setDiscordVisibilityModified(false)

        queryCurrentUser()
        setSetDiscordVisibilityLoading(false)
      })
      .catch((setDiscordVisibilityError: ApolloError) => {
        console.error(setDiscordVisibilityError) // TODO: handle error
        setSetDiscordVisibilityLoading(false)
      })
  }, [
    queryCurrentUser,
    setDiscordVisibilityMutation,
    setSetDiscordVisibilityLoading,
    setDiscordVisibilityModified,
    isDiscordVisible,
  ])

  const saveChanges = useCallback(() => {
    if (socialLinksModified) saveSocialLinks()
    if (discordVisibilityModified) saveDiscordVisibility()
  }, [socialLinksModified, discordVisibilityModified, saveSocialLinks, saveDiscordVisibility])

  if (!currentUser) return null

  return (
    <StyledProfileEditor>
      <Column gap={16}>
        <Column gap={16}>
          <TYPE.large>Discord</TYPE.large>
          <DiscordStatusWrapper>
            {discordUser?.username && discordUser?.discriminator ? (
              <>
                <Row gap={24}>
                  <TYPE.body spanColor="text2">
                    <Trans>Connected as {discordUser.username}</Trans>
                    <span>#{discordUser.discriminator}</span>
                  </TYPE.body>
                  {discordLoading ? (
                    <TYPE.subtitle>Loading ...</TYPE.subtitle>
                  ) : (
                    <DiscordDisconnect onClick={handleDiscordDisconnect} clickable>
                      <Trans>Disconnect</Trans>
                    </DiscordDisconnect>
                  )}
                </Row>
                <Checkbox value={isDiscordVisible} onChange={toggleDiscordVisibility}>
                  <TYPE.body>
                    <Trans>Public</Trans>
                  </TYPE.body>
                </Checkbox>
              </>
            ) : (
              <Link href={discordOAuthRedirectUrl}>
                <DiscordConnect disabled={discordLoading} large>
                  {discordLoading ? 'Loading ...' : t`Connect my account`}
                </DiscordConnect>
              </Link>
            )}
          </DiscordStatusWrapper>
        </Column>

        <SocialLinksWrapper>
          <TYPE.large>
            <Trans>Social networks</Trans>
          </TYPE.large>

          <Column gap={12}>
            <TYPE.body>Instagram</TYPE.body>
            <Input value={instagramUsername} onUserInput={handleInstagramInput} prefix="@" />
          </Column>

          <Column gap={12}>
            <TYPE.body>Twitter</TYPE.body>
            <Input value={twitterUsername} onUserInput={handleTiwtterInput} prefix="@" />
          </Column>

          <PrimaryButton
            disabled={
              (!socialLinksModified && !discordVisibilityModified) ||
              setDiscordVisibilityLoading ||
              setSocialLinksLoading
            }
            onClick={saveChanges}
            large
          >
            {setDiscordVisibilityLoading || setSocialLinksLoading
              ? 'Loading ...'
              : discordVisibilityModified || socialLinksModified
              ? t`Save changes`
              : t`No changes to save`}
          </PrimaryButton>
        </SocialLinksWrapper>
      </Column>
    </StyledProfileEditor>
  )
}
