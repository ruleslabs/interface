import { useCallback } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { CountUp } from 'use-count-up'

import { useETHBalances } from '@/state/wallet/hooks'
import Modal from '@/components/Modal'
import { useSettingsModalToggle, useModalOpen } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { IconButton } from '@/components/Button'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import Link from '@/components/Link'
import Caret from '@/components/Caret'
import useRampSdk from '@/hooks/useRampSdk'
import { useEtherEURPrice } from '@/hooks/useFiatPrice'
import MetamaskCard from '@/components/MetamaskCard'
import { storeAccessToken } from '@/utils/accessToken'
import { useRemoveCurrentUser } from '@/state/user/hooks'
import { useRevokeSessionMutation } from '@/state/auth/hooks'

const StyledSettingsModal = styled.div`
  width: 340px;
  padding: 12px 32px;
  background: ${({ theme }) => theme.bg2};
  height: 100%;
`

const Balance = styled(TYPE.body)`
  width: 100%;
  font-size: 30px;
  padding: 28px 0;
  text-align: center;
  background: ${({ theme }) => theme.bg3};
`

export default function SettingsModal({ currentUser }: { currentUser: any }) {
  const router = useRouter()

  const toggleSettingsModal = useSettingsModalToggle()
  const isOpen = useModalOpen(ApplicationModal.SETTINGS)
  const rampSdk = useRampSdk({ email: currentUser?.email, key: currentUser?.starknetAddress })

  const etherEURprice = useEtherEURPrice()
  const balance = useETHBalances([currentUser?.starknetAddress])[currentUser?.starknetAddress]

  const [revokeSessionMutation] = useRevokeSessionMutation()
  const removeCurrentUser = useRemoveCurrentUser()
  const logout = useCallback(() => {
    revokeSessionMutation({ variables: { payload: null } })
      .catch((error) => console.error(error))
      .finally(() => {
        storeAccessToken('')
        toggleSettingsModal()
        removeCurrentUser()
        router.replace('/')
      })
  }, [storeAccessToken, toggleSettingsModal, removeCurrentUser, revokeSessionMutation, router])

  return (
    <Modal onDismiss={toggleSettingsModal} isOpen={isOpen} sidebar>
      <StyledSettingsModal>
        <IconButton onClick={toggleSettingsModal}>
          <Caret direction="right" />
        </IconButton>
        <Column gap={32} style={{ marginTop: '32px' }}>
          <Column gap={16}>
            <TYPE.body>Solde du compte</TYPE.body>
            <Balance>
              <CountUp
                isCounting={!!etherEURprice && !!balance}
                start={0}
                end={etherEURprice && balance ? +balance.multiply(Math.round(etherEURprice)).toFixed(2) : 0}
                thousandsSeparator={','}
                duration={1}
              />
              €
            </Balance>
          </Column>
          <Column gap={16}>
            {rampSdk && (
              <TYPE.body clickable onClick={rampSdk.show}>
                Deposit
              </TYPE.body>
            )}
            <MetamaskCard />
            <Link href="/">
              <TYPE.body clickable>Retirer le solde</TYPE.body>
            </Link>
            <Link href="/">
              <TYPE.body clickable>Activité</TYPE.body>
            </Link>
            <Link href="/settings/security">
              <TYPE.body clickable>Sécurité</TYPE.body>
            </Link>
            <TYPE.body clickable onClick={logout}>
              Logout
            </TYPE.body>
          </Column>
        </Column>
      </StyledSettingsModal>
    </Modal>
  )
}
