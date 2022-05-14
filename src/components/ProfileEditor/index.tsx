import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'

import Card from '@/components/Card'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { useCurrentUser, useEditProfileMutation, useQueryCurrentUser } from '@/state/user/hooks'

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

  const [modified, setModified] = useState(false)

  const [instagramUsername, setInstagramUsername] = useState(currentUser.profile.instagramUsername ?? '')
  const [twitterUsername, setTwitterUsername] = useState(currentUser.profile.twitterUsername ?? '')

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
    console.log(currentUser.profile)
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
  }, [editProfileMutation, setLoading, twitterUsername, instagramUsername])

  if (!currentUser) return null

  return (
    <StyledProfileEditor>
      <SocialLinksWrapper>
        <Column gap={16}>
          <TYPE.large>Discord</TYPE.large>
          <DiscordStatusWrapper>
            <DiscordConnect large>Connect my account</DiscordConnect>
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

          <PrimaryButton disabled={!modified} onClick={saveChanges} large>
            {loading ? 'Loading ...' : 'Save changes'}
          </PrimaryButton>
        </Column>
      </SocialLinksWrapper>
    </StyledProfileEditor>
  )
}
