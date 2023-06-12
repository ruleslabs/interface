import { useCallback } from 'react'
import { Trans } from '@lingui/macro'

import { ErrorCard } from '../Card'
import { WalletModalMode } from 'src/state/wallet/actions'
import { ApplicationModal } from 'src/state/application/actions'
import { useSetWalletModalMode } from 'src/state/wallet/hooks'
import { useOpenModal } from 'src/state/application/hooks'

export default function DepositNeeded() {
  // deposit modal
  const openModal = useOpenModal(ApplicationModal.WALLET)
  const setWalletModalMode = useSetWalletModalMode()

  const openDesitModal = useCallback(() => {
    openModal()
    setWalletModalMode(WalletModalMode.DEPOSIT)
  }, [])

  return (
    <ErrorCard textAlign="center">
      <Trans>
        You do not have enough ETH in your Rules wallet to pay for network fees on Starknet.
        <br />
        <span onClick={openDesitModal}>Buy ETH or deposit from another wallet.</span>
      </Trans>
    </ErrorCard>
  )
}
