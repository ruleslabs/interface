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

export default function Deposit() {
  // current user
  const { currentUser } = useCurrentUser()

  // modal mode
  const closeModal = useCloseModal()
  const setWalletModalMode = useSetWalletModalMode()
  const onStarkgateDeposit = useCallback(() => setWalletModalMode(WalletModalMode.STARKGATE_DEPOSIT), [])

  // Ramp
  const rampSdk = useRampSdk({ email: currentUser?.email, address: currentUser?.starknetWallet.address, flow: 'on' })
  const openRamp = useCallback(() => {
    closeModal()
    rampSdk?.show()
  }, [closeModal, rampSdk?.show])

  return (
    <ModalBody>
      <Column gap={24}>
        <CardButton
          title={t`Credit card or bank transfer`}
          subtitle={t`might take a few days`}
          onClick={openRamp}
          disabled={!rampSdk?.show}
          icon={() => <Icons.CreditCard />}
        />

        <Separator>
          <Trans>or</Trans>
        </Separator>

        <CardButton
          title={t`Ethereum`}
          subtitle={t`a few minutes`}
          onClick={onStarkgateDeposit}
          icon={() => <Icons.Ethereum />}
        />
      </Column>
    </ModalBody>
  )
}
