import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import HintModal from '@/components/Modal/Hint'
import { useModalOpen, useNavModalDesktopToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { TYPE } from '@/styles/theme'
import Column from '../Column'
import { TooltipCaret } from '../Tooltip'
import Link from '../Link'
import { useRevokeSessionMutation } from '@/state/auth/hooks'
import { useCallback } from 'react'
import { useCurrentUser, useRemoveCurrentUser } from '@/state/user/hooks'
import { storeAccessToken } from '@/utils/accessToken'
import { useRouter } from 'next/router'

const StyledNavModalDesktop = styled.div`
  z-index: 100;
  width: 200px;
  position: absolute;
  top: 42px;
  right: -16px;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 4px;
  padding: 8px 0;
  box-shadow: 0 0 20px ${({ theme }) => theme.black}80;
`

const FillTooltipCaret = styled(TooltipCaret)`
  top: -3px;
  right: 37px;
  left: unset;

  svg {
    fill: ${({ theme }) => theme.bg2};
    width: 12px;
  }
`

const BorderTooltipCaret = styled(TooltipCaret)`
  top: -5px;
  right: 37px;
  left: unset;

  svg {
    fill: ${({ theme }) => theme.bg3};
    width: 12px;
  }
`

const MenuButton = styled(TYPE.body)`
  width: 100%;
  padding: 6px 8px 6px 16px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.primary1};
  }
`

const StyledHr = styled.div`
  margin: 6px 0;
  background: ${({ theme }) => theme.bg3};
  height: 1px;
  width: 100%;
`

export default function NavModalDesktop() {
  // router
  const router = useRouter()

  // current user
  const currentUser = useCurrentUser()

  // modal
  const toggleNavModalDesktop = useNavModalDesktopToggle()
  const isOpen = useModalOpen(ApplicationModal.NAV_DESKTOP)

  // logout
  const [revokeSessionMutation] = useRevokeSessionMutation()
  const removeCurrentUser = useRemoveCurrentUser()
  const logout = useCallback(() => {
    revokeSessionMutation({ variables: { payload: null } })
      .catch((error) => console.error(error))
      .finally(() => {
        storeAccessToken('')
        toggleNavModalDesktop()
        removeCurrentUser()
        router.replace('/')
      })
  }, [storeAccessToken, toggleNavModalDesktop, removeCurrentUser, revokeSessionMutation, router.replace])

  if (!currentUser) return null

  return (
    <HintModal onDismiss={toggleNavModalDesktop} isOpen={isOpen}>
      <StyledNavModalDesktop>
        <BorderTooltipCaret direction="top" />
        <FillTooltipCaret direction="top" />

        <Column>
          <Column>
            <Link href={`/user/${currentUser.slug}/cards`}>
              <MenuButton>
                <Trans>Your cards</Trans>
              </MenuButton>
            </Link>

            <Link href={`/user/${currentUser.slug}/packs`}>
              <MenuButton>
                <Trans>Your packs</Trans>
              </MenuButton>
            </Link>

            <Link href={`/user/${currentUser.slug}/ruledex`}>
              <MenuButton>
                <Trans>Your Rulédex</Trans>
              </MenuButton>
            </Link>

            <Link href={`/user/${currentUser.slug}/activity`}>
              <MenuButton>
                <Trans>Your activity</Trans>
              </MenuButton>
            </Link>
          </Column>

          <StyledHr />

          <MenuButton>
            <Trans>Upgrade wallet</Trans>
          </MenuButton>

          <StyledHr />

          <Column>
            <Link href="/settings/profile">
              <MenuButton>
                <Trans>Settings</Trans>
              </MenuButton>
            </Link>
            <MenuButton onClick={logout}>Logout</MenuButton>
          </Column>
        </Column>
      </StyledNavModalDesktop>
    </HintModal>
  )
}
