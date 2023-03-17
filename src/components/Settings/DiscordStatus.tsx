import React, { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { ApolloError } from '@apollo/client'
import { Trans, t } from '@lingui/macro'

import Link from '@/components/Link'
import { PrimaryButton, SecondaryButton, ThirdPartyButton } from '@/components/Button'
import Row, { RowBetween, RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import {
  useCurrentUser,
  useQueryCurrentUser,
  useConnectDiscordAccountMutation,
  useDisconnectDiscordAccountMutation,
  useRefreshDiscordRolesMutation,
  useSetDiscordVisibilityMutation,
} from '@/state/user/hooks'
import Avatar from '@/components/Avatar'
import Checkbox from '@/components/Checkbox'

import DiscordIcon from '@/images/discord.svg'
import { PaginationSpinner } from '../Spinner'
import Column from '../Column'

const DiscordStatusWrapper = styled(Column)`
  gap: 16px;

  ${({ theme }) => theme.media.small`
    max-width: 300px;
    margin: 0 auto;
  `}
`

const ConnectedDiscordWrapper = styled(RowBetween)`
  align-items: center;

  ${({ theme }) => theme.media.small`
    flex-direction: column;
    align-items: center;
    gap: 16px;

    & button {
      width: unset;
      flex-grow: 1;
    }

    & > * {
      width: 100%;
    }
  `}
`

const DiscordAvatar = styled(Avatar)`
  width: 48px;
  height: 48px;
  border-radius: 4px;
`

interface DiscordStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  redirectPath: string
}

export default function DiscordStatus({ redirectPath, ...props }: DiscordStatusProps) {
  const currentUser = useCurrentUser()
  const queryCurrentUser = useQueryCurrentUser()

  const router = useRouter()
  const discordCode = router?.query?.code

  // loading
  const [loading, setLoading] = useState(!!discordCode || !!currentUser?.profile?.discordId)

  // error
  const [error, setError] = useState<string | null>(null)

  // discord visibility
  const [isDiscordVisible, setIsDiscordVisible] = useState<boolean>(currentUser?.profile?.isDiscordVisible ?? false)

  // mutation
  const [connectDiscordAccountMutation] = useConnectDiscordAccountMutation()
  const [disconnectDiscordAccountMutation] = useDisconnectDiscordAccountMutation()
  const [refreshDiscordRolesMutation] = useRefreshDiscordRolesMutation()
  const [setDiscordVisibilityMutation] = useSetDiscordVisibilityMutation()

  const discordOAuthRedirectUrl = useMemo(
    () =>
      `https://discord.com/api/oauth2/authorize?client_id=975024307044499456&redirect_uri=${encodeURIComponent(
        `${process.env.NEXT_PUBLIC_APP_URL}${redirectPath}`
      )}&response_type=code&scope=guilds.join%20identify`,
    [redirectPath]
  )

  // handle connection on code reception
  useEffect(() => {
    if (!discordCode || !router.replace) return

    setLoading(true)
    setError(null)

    router.replace(redirectPath, undefined, { shallow: true })
    connectDiscordAccountMutation({ variables: { code: discordCode, redirectPath } })
      .then((res: any) => {
        queryCurrentUser()
        setLoading(false)
      })
      .catch((connectDiscordAccountError: ApolloError) => {
        console.error(connectDiscordAccountError)
        setError(connectDiscordAccountError.message ?? 'An error has occured, please contact support on Discord')

        setLoading(false)
      })
  }, [discordCode, connectDiscordAccountMutation, queryCurrentUser, redirectPath, router.replace])

  // handle disconnection
  const handleDiscordDisconnect = useCallback(() => {
    setLoading(true)
    setError(null)

    disconnectDiscordAccountMutation()
      .then((res: any) => {
        queryCurrentUser()
        setLoading(false)
      })
      .catch((disconnectDiscordAccountError: ApolloError) => {
        console.error(disconnectDiscordAccountError)
        setError(disconnectDiscordAccountError.message ?? 'An error has occured, please contact support on Discord')

        setLoading(false)
      })
  }, [disconnectDiscordAccountMutation, queryCurrentUser])

  // handle discord refresh
  const handleDiscordRefresh = useCallback(() => {
    setLoading(true)
    setError(null)

    refreshDiscordRolesMutation()
      .then((res: any) => {
        queryCurrentUser()
        setLoading(false)
      })
      .catch((refreshDiscordAccountError: ApolloError) => {
        console.error(refreshDiscordAccountError)
        setError(refreshDiscordAccountError.message ?? 'An error has occured, please contact support on Discord')

        setLoading(false)
      })
  }, [refreshDiscordRolesMutation, queryCurrentUser])

  // handle discord visibility
  const toggleDiscordVisibility = useCallback(() => {
    setIsDiscordVisible(!isDiscordVisible)

    setDiscordVisibilityMutation({ variables: { visible: !isDiscordVisible } })
      .then(() => {
        queryCurrentUser()
      })
      .catch((setDiscordVisibilityError: ApolloError) => {
        console.error(setDiscordVisibilityError) // TODO: handle error
      })
  }, [isDiscordVisible, setDiscordVisibilityMutation, queryCurrentUser])

  // discord member object
  const discordMember = currentUser?.profile?.discordMember

  return (
    <div {...props}>
      {!loading && (
        <>
          {discordMember ? (
            <DiscordStatusWrapper gap={16}>
              <ConnectedDiscordWrapper>
                <RowCenter gap={12}>
                  <DiscordAvatar
                    src={discordMember.guildAvatarUrl ?? discordMember.avatarUrl}
                    fallbackSrc={currentUser.profile.fallbackSrc}
                  />

                  <Column gap={4}>
                    <TYPE.medium>{discordMember.username}</TYPE.medium>
                    <TYPE.body color="text2">#{discordMember.discriminator}</TYPE.body>
                  </Column>
                </RowCenter>

                <Row gap={16}>
                  <PrimaryButton onClick={handleDiscordRefresh}>
                    <Trans>Refresh</Trans>
                  </PrimaryButton>

                  <SecondaryButton onClick={handleDiscordDisconnect}>
                    <Trans>Unlink</Trans>
                  </SecondaryButton>
                </Row>
              </ConnectedDiscordWrapper>

              <Checkbox value={isDiscordVisible} onChange={toggleDiscordVisibility}>
                <TYPE.body>
                  <Trans>Public</Trans>
                </TYPE.body>
              </Checkbox>
            </DiscordStatusWrapper>
          ) : (
            <Link href={discordOAuthRedirectUrl}>
              <ThirdPartyButton
                title={t`Link Discord`}
                subtitle={t`Link your discord account to get access to exclusive channels`}
              >
                <DiscordIcon />
              </ThirdPartyButton>
            </Link>
          )}
        </>
      )}

      {error && (
        <TYPE.body color="error">
          <Trans>
            Discord connection failed for the following reason:&nbsp;
            <strong>{error}</strong>
          </Trans>
        </TYPE.body>
      )}

      <PaginationSpinner loading={loading} />
    </div>
  )
}
