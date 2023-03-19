import { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ApolloError } from '@apollo/client'
import { t } from '@lingui/macro'

import { PrimaryButton } from '@/components/Button'
import Column from '@/components/Column'
import { SmallInput } from '@/components/Input'
import { useCurrentUser, useQueryCurrentUser, useSetSocialLinksMutation } from '@/state/user/hooks'
import { RowCenter } from '../Row'

import InstagramIcon from '@/images/instagram.svg'
import TwitterIcon from '@/images/twitter-color.svg'
import Subtitle from './Subtitle'

const InputWithIcon = styled(RowCenter)`
  gap: 8px;
  max-width: 400px;

  svg {
    width: 18px;
    height: 18px;
    fill: ${({ theme }) => theme.bg3};
  }

  & input {
    width: 100%;
  }
`

const SaveChangesButton = styled(PrimaryButton)`
  margin-top: 16px;
  max-width: 300px;
  width: 100%;

  ${({ theme }) => theme.media.extraSmall`
    max-width: unset;
  `}
`

export default function SocialAccountsSettings() {
  const currentUser = useCurrentUser()
  const queryCurrentUser = useQueryCurrentUser()

  // modified
  const [socialLinksModified, setSocialLinksModified] = useState(false)

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

  // save changes
  const [setSocialLinksLoading, setSetSocialLinksLoading] = useState(false)

  useEffect(() => {
    setSocialLinksModified(
      (currentUser?.profile?.instagramUsername ?? '') !== instagramUsername ||
        (currentUser?.profile?.twitterUsername ?? '') !== twitterUsername
    )
  }, [
    setSocialLinksModified,
    currentUser?.profile?.instagramUsername,
    currentUser?.profile?.twitterUsername,
    instagramUsername,
    twitterUsername,
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

  const saveChanges = useCallback(() => {
    if (socialLinksModified) saveSocialLinks()
  }, [socialLinksModified, saveSocialLinks])

  if (!currentUser) return null

  return (
    <Column gap={12}>
      <Subtitle value={t`Social accounts`} />

      <InputWithIcon>
        <InstagramIcon />
        <SmallInput value={instagramUsername} onUserInput={handleInstagramInput} placeholder={t`Instagram username`} />
      </InputWithIcon>

      <InputWithIcon>
        <TwitterIcon />
        <SmallInput value={twitterUsername} onUserInput={handleTiwtterInput} placeholder={t`Twitter username`} />
      </InputWithIcon>

      <SaveChangesButton onClick={saveChanges} disabled={!socialLinksModified || setSocialLinksLoading}>
        {setSocialLinksLoading ? 'Loading ...' : socialLinksModified ? t`Save changes` : t`No changes to save`}
      </SaveChangesButton>
    </Column>
  )
}
