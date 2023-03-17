import { useState, useCallback, useEffect } from 'react'
import { ApolloError } from '@apollo/client'
import { t } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { useCurrentUser, useQueryCurrentUser, useSetSocialLinksMutation } from '@/state/user/hooks'

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
    <Column gap={16}>
      <Column gap={12}>
        <TYPE.body>Instagram</TYPE.body>
        <Input value={instagramUsername} onUserInput={handleInstagramInput} prefix="@" />
      </Column>

      <Column gap={12}>
        <TYPE.body>Twitter</TYPE.body>
        <Input value={twitterUsername} onUserInput={handleTiwtterInput} prefix="@" />
      </Column>

      <PrimaryButton onClick={saveChanges} disabled={!socialLinksModified || setSocialLinksLoading} large>
        {setSocialLinksLoading ? 'Loading ...' : socialLinksModified ? t`Save changes` : t`No changes to save`}
      </PrimaryButton>
    </Column>
  )
}
