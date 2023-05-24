import { useCallback } from 'react'
import { Trans, t } from '@lingui/macro'

import useCurrentUser from '@/hooks/useCurrentUser'
import useRampSdk from '@/hooks/useRampSdk'
import { CardButton } from '@/components/Button'
import Separator from '@/components/Text/Separator'
import { useSetWalletModalMode } from '@/state/wallet/hooks'
import { WalletModalMode } from '@/state/wallet/actions'
import { ModalBody } from '../Modal/Classic'

import RampIcon from '@/images/ramp.svg'
import MetamaskIcon from '@/images/metamask.svg'
import Column from '../Column'

export default function Deposit() {
  // current user
  const { currentUser } = useCurrentUser()

  // modal mode
  const setWalletModalMode = useSetWalletModalMode()
  const onStarkgateDeposit = useCallback(() => setWalletModalMode(WalletModalMode.STARKGATE_DEPOSIT), [])

  // Ramp
  const rampSdk = useRampSdk({ email: currentUser?.email, address: currentUser?.starknetWallet.address })

  return (
    <ModalBody>
      <Column gap={24}>
        <CardButton
          title="Credit card or bank transfer"
          subtitle={t`might take a few days`}
          onClick={rampSdk?.show}
          disabled={!rampSdk?.show}
        >
          <RampIcon />
        </CardButton>

        <Separator>
          <Trans>or</Trans>
        </Separator>

        <CardButton title={t`Ethereum`} subtitle={t`a few minutes`} onClick={onStarkgateDeposit}>
          <MetamaskIcon />
        </CardButton>
      </Column>
    </ModalBody>
  )
}
