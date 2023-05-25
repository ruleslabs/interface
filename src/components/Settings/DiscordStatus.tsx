import React, { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { Trans, t } from '@lingui/macro'

import Link from '@/components/Link'
import { PrimaryButton, SecondaryButton, CardButton } from '@/components/Button'
import Row, { RowBetween, RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import Avatar from '@/components/Avatar'
import Checkbox from '@/components/Checkbox'
import { PaginationSpinner } from '../Spinner'
import Column from '../Column'
import useCurrentUser from '@/hooks/useCurrentUser'
import * as Icons from 'src/theme/components/Icons'
import {
  useConnectDiscordAccount,
  useDisconnectDiscordAccount,
  useRefreshDiscordRoles,
  useSetDiscordAccountVisibility,
} from '@/graphql/data/Discord'
import useMergeGenieStatus from '@/hooks/useMergeGenieSatus'

const DiscordStatusWrapper = styled(Column)`
  gap: 16px;

  & label {
    width: fit-content;
  }

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
  border-radius: 6px;
`

interface DiscordStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  redirectPath: string
}

export default function DiscordStatus({ redirectPath, ...props }: DiscordStatusProps) {
  const [isDiscordVisible, setIsDiscordVisible] = useState(false)
  const [discordCode, setDiscordCode] = useState<string | null>(null)

  // current user
  const { currentUser, refreshCurrentUser } = useCurrentUser()

  const router = useRouter()

  // discord visibility
  useEffect(() => {
    setIsDiscordVisible(currentUser?.profile?.isDiscordVisible ?? false)
  }, [!!currentUser])

  useEffect(() => {
    const code = router?.query?.code
    if (typeof code !== 'string') return

    setDiscordCode(code)
  }, [])

  // mutation
  const [connectDiscordAccountMutation, connectDiscordAccountStatus] = useConnectDiscordAccount()
  const [disconnectDiscordAccountMutation, disconnectDiscordAccountStatus] = useDisconnectDiscordAccount()
  const [refreshDiscordRolesMutation, refreshDiscordRolesStatus] = useRefreshDiscordRoles()
  const [setDiscordAccountVisibilityMutation, setDiscordAccountVisibilityStatus] = useSetDiscordAccountVisibility()

  // loading / errors
  const { loading, error } = useMergeGenieStatus(
    connectDiscordAccountStatus,
    disconnectDiscordAccountStatus,
    refreshDiscordRolesStatus,
    setDiscordAccountVisibilityStatus
  )

  const discordOAuthRedirectUrl = useMemo(
    () =>
      `https://discord.com/api/oauth2/authorize?client_id=975024307044499456&redirect_uri=${encodeURIComponent(
        `${process.env.NEXT_PUBLIC_APP_URL}${redirectPath}`
      )}&response_type=code&scope=guilds.join%20identify`,
    [redirectPath]
  )

  // handle connection on code reception
  const onConnect = useCallback(
    async (code: string) => {
      router.replace(redirectPath, undefined, { shallow: true })
      const { username } = await connectDiscordAccountMutation({ variables: { code, redirectPath } })

      if (username) refreshCurrentUser()
    },
    [connectDiscordAccountMutation, refreshCurrentUser, redirectPath, router.replace]
  )

  // handle disconnection
  const onDisconnect = useCallback(async () => {
    const { discordId } = await disconnectDiscordAccountMutation({})

    if (discordId) refreshCurrentUser()
  }, [disconnectDiscordAccountMutation, refreshCurrentUser])

  // handle discord refresh
  const onRefresh = useCallback(async () => {
    const { success } = await refreshDiscordRolesMutation({})

    if (success) refreshCurrentUser()
  }, [refreshDiscordRolesMutation, refreshCurrentUser])

  // handle discord visibility
  const onVisibilityToggle = useCallback(async () => {
    const { visible } = await setDiscordAccountVisibilityMutation({ variables: { visible: !isDiscordVisible } })

    if (typeof visible === 'boolean') setIsDiscordVisible(visible)
  }, [isDiscordVisible, setDiscordAccountVisibilityMutation, refreshCurrentUser])

  // trigger connection on discord code reception
  useEffect(() => {
    if (discordCode) {
      onConnect(discordCode)
      setDiscordCode(null)
    }
  }, [discordCode, onConnect])

  // discord member object
  const discordMember = currentUser?.profile?.discordMember

  return (
    <Column gap={16} {...props}>
      {loading ? (
        <PaginationSpinner loading={loading} />
      ) : discordMember ? (
        <DiscordStatusWrapper gap={16}>
          <ConnectedDiscordWrapper>
            <RowCenter gap={12}>
              <DiscordAvatar src={discordMember.avatarUrl ?? ''} fallbackSrc={currentUser.profile.fallbackUrl} />

              <Column gap={4}>
                <TYPE.medium>{discordMember.username}</TYPE.medium>
                <TYPE.body color="text2">#{discordMember.discriminator}</TYPE.body>
              </Column>
            </RowCenter>

            <Row gap={16}>
              <PrimaryButton onClick={onRefresh}>
                <Trans>Refresh</Trans>
              </PrimaryButton>

              <SecondaryButton onClick={onDisconnect}>
                <Trans>Unlink</Trans>
              </SecondaryButton>
            </Row>
          </ConnectedDiscordWrapper>

          <Checkbox value={isDiscordVisible} onChange={onVisibilityToggle}>
            <TYPE.body>
              <Trans>Public</Trans>
            </TYPE.body>
          </Checkbox>
        </DiscordStatusWrapper>
      ) : (
        <Link href={discordOAuthRedirectUrl}>
          <CardButton
            title={t`Link Discord`}
            subtitle={t`Link your discord account to get access to exclusive channels`}
            icon={() => <Icons.Discord />}
          />
        </Link>
      )}

      {error?.render()}
    </Column>
  )
}
