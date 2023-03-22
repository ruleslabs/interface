import { useCallback } from 'react'
import { Trans, t } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import useRampSdk from '@/hooks/useRampSdk'
import { ThirdPartyButton } from '@/components/Button'
import Separator from '@/components/Text/Separator'
import { useSetWalletModalMode } from '@/state/wallet/hooks'
import { WalletModalMode } from '@/state/wallet/actions'

import RampIcon from '@/images/ramp.svg'
import MetamaskIcon from '@/images/metamask.svg'

export default function DepositModal() {
  // current user
  const currentUser = useCurrentUser()

  // modal mode
  const setWalletModalMode = useSetWalletModalMode()
  const onStarkgateDeposit = useCallback(() => setWalletModalMode(WalletModalMode.STARKGATE_DEPOSIT), [])

  // Ramp
  const rampSdk = useRampSdk({ email: currentUser?.email, address: currentUser?.starknetWallet.address })

  return (
    <Column gap={32}>
      <Column gap={16}>
        <TYPE.medium>
          <Trans>From your bank account</Trans>
        </TYPE.medium>

        <ThirdPartyButton
          title="Ramp"
          subtitle={t`Buy ETH with your credit card or a bank transfer`}
          onClick={rampSdk?.show}
          disbaled={!rampSdk?.show}
        >
          <RampIcon />
        </ThirdPartyButton>
      </Column>

      <Separator>
        <Trans>or</Trans>
      </Separator>

      <Column gap={16}>
        <TYPE.medium>
          <Trans>From your Ethereum wallet</Trans>
        </TYPE.medium>

        <ThirdPartyButton
          title={t`Metamask`}
          subtitle={t`Deposit ETH from your Ethereum wallet`}
          onClick={onStarkgateDeposit}
        >
          <MetamaskIcon />
        </ThirdPartyButton>
      </Column>
    </Column>
  )
}
