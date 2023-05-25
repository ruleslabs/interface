import { useCallback } from 'react'
import { Trans, t } from '@lingui/macro'

import useCurrentUser from 'src/hooks/useCurrentUser'
import useRampSdk from 'src/hooks/useRampSdk'
import { CardButton } from 'src/components/Button'
import Separator from 'src/components/Text/Separator'
import { useSetWalletModalMode } from 'src/state/wallet/hooks'
import { WalletModalMode } from 'src/state/wallet/actions'
import { ModalBody } from '../Modal/Classic'
import * as Icons from 'src/theme/components/Icons'
import Column from '../Column'
import { useWalletModalToggle } from 'src/state/application/hooks'

export default function Deposit() {
  // current user
  const { currentUser } = useCurrentUser()

  // modal mode
  const toggleWalletModal = useWalletModalToggle()
  const setWalletModalMode = useSetWalletModalMode()
  const onStarkgateDeposit = useCallback(() => setWalletModalMode(WalletModalMode.STARKGATE_DEPOSIT), [])

  // Ramp
  const rampSdk = useRampSdk({ email: currentUser?.email, address: currentUser?.starknetWallet.address })
  const openRamp = useCallback(() => {
    toggleWalletModal()
    rampSdk?.show()
  }, [toggleWalletModal, rampSdk?.show])

  return (
    <ModalBody>
      <Column gap={24}>
        <CardButton
          title="Credit card or bank transfer"
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
