import React, { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import Card from '@/components/Card'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Column from '@/components/Column'
import Input from '@/components/Input'
import {
  useCurrentUser,
  useEditProfileMutation,
  useQueryCurrentUser,
  useConnectDiscordAccountMutation,
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
  width: 100%;
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
        console.error(editProfileError)
        setLoading(false)
      })
  }, [editProfileMutation, queryCurrentUser, setLoading, twitterUsername, instagramUsername])

  // discord
  const [discordLoading, setDiscordLoading] = useState(!!discordCode)
  const [connectDiscordAccountMutation] = useConnectDiscordAccountMutation()

  useEffect(() => {
    if (!discordCode) return

    router.replace('/settings/profile', undefined, { shallow: true })
    connectDiscordAccountMutation({ variables: { code: discordCode } })
      .then((res: any) => {
        console.log(res?.data?.connectDiscordAccount)
        queryCurrentUser()
        setDiscordLoading(false)
      })
      .catch((connectDiscordAccountError: ApolloError) => {
        console.error(connectDiscordAccountError)
        setDiscordLoading(false)
      })
  }, [discordCode, router, connectDiscordAccountMutation, queryCurrentUser, setDiscordLoading])

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
      <SocialLinksWrapper>
        <Column gap={16}>
          <TYPE.large>Discord</TYPE.large>
          <DiscordStatusWrapper>
            <Link href={discordOAuthRedirectUrl}>
              {currentUser.profile.discordId ? (
                <TYPE.body>{currentUser.profile.discordId}</TYPE.body>
              ) : (
                <DiscordConnect disabled={discordLoading} large>
                  {discordLoading ? 'Loading ...' : 'Connect my account'}
                </DiscordConnect>
              )}
            </Link>
          </DiscordStatusWrapper>
        </Column>

        <Column gap={16}>
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
        </Column>
      </SocialLinksWrapper>
    </StyledProfileEditor>
  )
}
