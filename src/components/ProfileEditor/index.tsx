import { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ApolloError } from '@apollo/client'
import { Trans, t } from '@lingui/macro'

import Card from '@/components/Card'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Column from '@/components/Column'
import Input from '@/components/Input'
import {
  useCurrentUser,
  useQueryCurrentUser,
  useSetSocialLinksMutation,
  useSetDiscordVisibilityMutation,
  useRefreshDiscordRolesMutation,
} from '@/state/user/hooks'
import Checkbox from '@/components/Checkbox'
import DiscordStatus from '@/components/DiscordStatus'

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
  height: 140px;
  gap: 16px;

  button {
    width: 300px;
  }
`

const DiscordRefresh = styled(PrimaryButton)`
  margin-bottom: 16px;
`

export default function ProfileEditor() {
  const currentUser = useCurrentUser()
  const queryCurrentUser = useQueryCurrentUser()

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
  const [discordLoading, setDiscordLoading] = useState(false)
  const [refreshDiscordRolesMutation] = useRefreshDiscordRolesMutation()
  const [setDiscordVisibilityMutation] = useSetDiscordVisibilityMutation()

  const [isDiscordVisible, setIsDiscordVisible] = useState<boolean>(currentUser?.profile?.isDiscordVisible ?? false)

  const toggleDiscordVisibility = useCallback(() => setIsDiscordVisible(!isDiscordVisible), [isDiscordVisible])

  const handleDiscordRefresh = useCallback(() => {
    setDiscordLoading(true)

    refreshDiscordRolesMutation()
      .then((res: any) => {
        setDiscordLoading(false)
      })
      .catch((refreshDiscordAccountError: ApolloError) => {
        console.error(refreshDiscordAccountError) // TODO: handle error
        setDiscordLoading(false)
      })
  }, [refreshDiscordRolesMutation, setDiscordLoading])

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
            <DiscordStatus redirectPath="/settings/profile" connectionText={t`Connect my account`} />
            {currentUser?.profile?.discordMember && (
              <Column gap={24}>
                <Checkbox value={isDiscordVisible} onChange={toggleDiscordVisibility}>
                  <TYPE.body>
                    <Trans>Public</Trans>
                  </TYPE.body>
                </Checkbox>
                <DiscordRefresh onClick={handleDiscordRefresh} disabled={discordLoading} large>
                  {discordLoading ? 'Loading ...' : t`Refresh channels access`}
                </DiscordRefresh>
              </Column>
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
