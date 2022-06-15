import { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { ApolloError } from '@apollo/client'
import { Trans, t } from '@lingui/macro'

import Link from '@/components/Link'
import { PrimaryButton } from '@/components/Button'
import Row from '@/components/Row'
import { TYPE } from '@/styles/theme'
import {
  useCurrentUser,
  useQueryCurrentUser,
  useConnectDiscordAccountMutation,
  useDisconnectDiscordAccountMutation,
} from '@/state/user/hooks'

const DiscordConnect = styled(PrimaryButton)`
  width: 100%;
`

const DiscordDisconnect = styled(TYPE.body)`
  color: ${({ theme }) => theme.error};
  font-weight: 700;
`

const DiscordDisconnectWrapper = styled(Row)`
  gap: 24px;
  width: fit-content;
  justify-content: center;
`

interface DiscordStatusProps {
  redirectPath: string
}

export default function DiscordStatus({ redirectPath }: DiscordStatusProps) {
  const currentUser = useCurrentUser()
  const queryCurrentUser = useQueryCurrentUser()

  const router = useRouter()
  const discordCode = router?.query?.code

  // loading
  const [discordLoading, setDiscordLoading] = useState(!!discordCode || !!currentUser?.profile?.discordId)

  // mutation
  const [connectDiscordAccountMutation] = useConnectDiscordAccountMutation()
  const [disconnectDiscordAccountMutation] = useDisconnectDiscordAccountMutation()

  const discordOAuthRedirectUrl = useMemo(
    () =>
      `https://discord.com/api/oauth2/authorize?client_id=975024307044499456&redirect_uri=${encodeURIComponent(
        `${process.env.NEXT_PUBLIC_APP_URL}${redirectPath}`
      )}&response_type=code&scope=identify`,
    [redirectPath]
  )

  const [discordUser, setDiscordUser] = useState<any | null>(currentUser?.profile?.discordUser)

  useEffect(() => {
    if (!discordCode) return

    setDiscordLoading(true)

    router.replace(redirectPath, undefined, { shallow: true })
    connectDiscordAccountMutation({ variables: { code: discordCode, redirectPath } })
      .then((res: any) => {
        setDiscordUser(res?.data?.connectDiscordAccount ?? null)

        queryCurrentUser()
        setDiscordLoading(false)
      })
      .catch((connectDiscordAccountError: ApolloError) => {
        console.error(connectDiscordAccountError) // TODO: handle error
        setDiscordLoading(false)
      })
  }, [
    discordCode,
    router,
    connectDiscordAccountMutation,
    queryCurrentUser,
    setDiscordLoading,
    setDiscordUser,
    redirectPath,
  ])

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

  return (
    <>
      {discordUser?.username && discordUser?.discriminator ? (
        <>
          <DiscordDisconnectWrapper>
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
          </DiscordDisconnectWrapper>
        </>
      ) : (
        <Link href={discordOAuthRedirectUrl}>
          <DiscordConnect disabled={discordLoading} large>
            {discordLoading ? 'Loading ...' : t`Connect my account`}
          </DiscordConnect>
        </Link>
      )}
    </>
  )
}
