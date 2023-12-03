import { t, Trans } from '@lingui/macro'
import { useCallback } from 'react'
import { CardButton } from 'src/components/Button'
import Separator from 'src/components/Text/Separator'
import useCurrentUser from 'src/hooks/useCurrentUser'
import useRampSdk from 'src/hooks/useRampSdk'
import { useCloseModal } from 'src/state/application/hooks'
import { WalletModalMode } from 'src/state/wallet/actions'
import { useSetWalletModalMode } from 'src/state/wallet/hooks'
import * as Icons from 'src/theme/components/Icons'

import Column from '../Column'
import { ModalBody } from '../Modal/Classic'

export default function Withdraw() {
  // current user
  const { currentUser } = useCurrentUser()

  // modal mode
  const closeModal = useCloseModal()
  const setWalletModalMode = useSetWalletModalMode()
  const onStarkgateWithdraw = useCallback(() => setWalletModalMode(WalletModalMode.STARKGATE_WITHDRAW), [])
  const onStarknetWithdraw = useCallback(() => setWalletModalMode(WalletModalMode.STARKNET_WITHDRAW), [])

  // Ramp
  const rampSdk = useRampSdk({ email: currentUser?.email, address: currentUser?.starknetWallet.address, flow: 'off' })
  const openRamp = useCallback(() => {
    closeModal()
    rampSdk?.show()
  }, [closeModal, rampSdk?.show])

  return (
    <ModalBody>
      <Column gap={24}>
        <CardButton
          title={t`Bank account`}
          subtitle={t`coming soon (maybe)`}
          onClick={openRamp}
          disabled={!rampSdk?.show || true}
          icon={() => <Icons.CreditCard />}
        />

        <Separator>
          <Trans>or</Trans>
        </Separator>

        <CardButton
          title={t`Ethereum`}
          subtitle={t`might take a few hours`}
          onClick={onStarkgateWithdraw}
          icon={() => <Icons.Ethereum />}
        />

        <Separator>
          <Trans>or</Trans>
        </Separator>

        <CardButton
          title={t`Starknet`}
          subtitle={t`a few seconds`}
          onClick={onStarknetWithdraw}
          icon={() => <Icons.Starknet />}
        />
      </Column>
    </ModalBody>
  )
}
