import React, { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import Card from '@/components/Card'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Column from '@/components/Column'
import Row from '@/components/Row'
import Input from '@/components/Input'
import {
  useCurrentUser,
  useEditProfileMutation,
  useQueryCurrentUser,
  useConnectDiscordAccountMutation,
  useDisconnectDiscordAccountMutation,
} from '@/state/user/hooks'
import Link from '@/components/Link'

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

const DiscordStatusWrapper = styled.div`
  width: 100%;
  height: 100px;
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
  const router = useRouter()
  const discordCode = router?.query?.code

  const [modified, setModified] = useState(false)

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

  useEffect(() => {
    setModified(
      (currentUser?.profile?.instagramUsername ?? '') !== instagramUsername ||
        (currentUser?.profile?.twitterUsername ?? '') !== twitterUsername
    )
  }, [
    setModified,
    currentUser?.profile?.instagramUsername,
    currentUser?.profile?.twitterUsername,
    instagramUsername,
    twitterUsername,
  ])

  // edit social links
  const [loading, setLoading] = useState(false)
  const [editProfileMutation] = useEditProfileMutation()

  const queryCurrentUser = useQueryCurrentUser()
  const saveChanges = useCallback(() => {
    setLoading(true)

    editProfileMutation({ variables: { twitterUsername, instagramUsername } })
      .then((res: any) => {
        queryCurrentUser()
        setLoading(false)
      })
      .catch((editProfileError: ApolloError) => {
        console.error(editProfileError) // TODO: handle error
        setLoading(false)
      })
  }, [editProfileMutation, queryCurrentUser, setLoading, twitterUsername, instagramUsername])

  // discord
  const [discordLoading, setDiscordLoading] = useState(!!discordCode || !!currentUser?.profile?.discordId)
  const [connectDiscordAccountMutation] = useConnectDiscordAccountMutation()
  const [disconnectDiscordAccountMutation] = useDisconnectDiscordAccountMutation()
  const [discordUser, setDiscordUser] = useState<any | null>(currentUser?.profile?.discordUser)

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

  if (!currentUser) return null

  return (
    <StyledProfileEditor>
      <Column gap={16}>
        <Column gap={16}>
          <TYPE.large>Discord</TYPE.large>
          <DiscordStatusWrapper>
            {discordUser?.username && discordUser?.discriminator ? (
              <Row gap={24}>
                <TYPE.body spanColor="text2">
                  Connected as {discordUser.username}
                  <span>#{discordUser.discriminator}</span>
                </TYPE.body>
                {discordLoading ? (
                  <TYPE.subtitle>Loading ...</TYPE.subtitle>
                ) : (
                  <DiscordDisconnect onClick={handleDiscordDisconnect} clickable>
                    Disconnect
                  </DiscordDisconnect>
                )}
              </Row>
            ) : (
              <Link href={discordOAuthRedirectUrl}>
                <DiscordConnect disabled={discordLoading} large>
                  {discordLoading ? 'Loading ...' : 'Connect my account'}
                </DiscordConnect>
              </Link>
            )}
          </DiscordStatusWrapper>
        </Column>

        <SocialLinksWrapper>
          <TYPE.large>Social networks</TYPE.large>

          <Column gap={12}>
            <TYPE.body>Instagram</TYPE.body>
            <Input value={instagramUsername} onUserInput={handleInstagramInput} prefix="@" />
          </Column>

          <Column gap={12}>
            <TYPE.body>Twitter</TYPE.body>
            <Input value={twitterUsername} onUserInput={handleTiwtterInput} prefix="@" />
          </Column>

          <PrimaryButton disabled={!modified || loading} onClick={saveChanges} large>
            {loading ? 'Loading ...' : 'Save changes'}
          </PrimaryButton>
        </SocialLinksWrapper>
      </Column>
    </StyledProfileEditor>
  )
}
