import { Trans } from '@lingui/macro'
import { useCallback } from 'react'
import { ApplicationModal } from 'src/state/application/actions'
import { useOpenModal } from 'src/state/application/hooks'
import { WalletModalMode } from 'src/state/wallet/actions'
import { useSetWalletModalMode } from 'src/state/wallet/hooks'

import { ErrorCard } from '../Card'

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
