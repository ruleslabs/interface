import { useCallback, useEffect } from 'react'
import { constants } from '@rulesorg/sdk-core'
import { Trans, t } from '@lingui/macro'

import { useModalOpened, useUpgradeWalletModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import useCurrentUser from 'src/hooks/useCurrentUser'
import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import StarknetSigner from 'src/components/StarknetSigner/Transaction'
import { TYPE } from 'src/styles/theme'
import useRulesAccount from 'src/hooks/useRulesAccount'
import useStarknetTx from 'src/hooks/useStarknetTx'
import ClassicModal, { ModalBody, ModalContent } from '../Modal/Classic'
import { ModalHeader } from '../Modal'

export default function UpgradeWalletModal() {
  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const isOpen = useModalOpened(ApplicationModal.UPGRADE_WALLET)
  const toggleUpgradeWalletModal = useUpgradeWalletModalToggle()

  // starknet account
  const { address } = useRulesAccount()

  // starknet tx
  const { setCalls, resetStarknetTx, setSigning, signing } = useStarknetTx()

  // call
  const handleConfirmation = useCallback(() => {
    if (!address) return

    setCalls([
      {
        contractAddress: address,
        entrypoint: 'upgrade',
        calldata: [constants.ACCOUNT_CLASS_HASH],
      },
    ])
    setSigning(true)
  }, [address, setCalls, setSigning])

  // on close modal
  useEffect(() => {
    if (isOpen) {
      resetStarknetTx()
    }
  }, [isOpen])

  if (!currentUser) return null

  return (
    <ClassicModal onDismiss={toggleUpgradeWalletModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleUpgradeWalletModal} title={signing ? undefined : t`Wallet upgrade`} />

        <ModalBody>
          {currentUser.starknetWallet.needsUpgrade ? (
            <StarknetSigner action={'walletDeployment'}>
              <Column gap={32}>
                <Column gap={16}>
                  <TYPE.large>
                    <Trans>Your wallet needs to be upgraded.</Trans>
                  </TYPE.large>

                  <TYPE.body>
                    <Trans>
                      Starknet released a new update to improve the network, and it implies some changes for your
                      wallet. To keep on working, your wallet needs to be upgraded as soon as possible.
                      <br />
                      <br />
                      If you don&apos;t perform the upgrade on time, your wallet will be temporarily locked.
                    </Trans>
                  </TYPE.body>
                </Column>

                <PrimaryButton onClick={handleConfirmation} large>
                  <Trans>Upgrade</Trans>
                </PrimaryButton>
              </Column>
            </StarknetSigner>
          ) : (
            <TYPE.large textAlign="center">
              <Trans>Your wallet is up-to-date 🎉</Trans>
            </TYPE.large>
          )}
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
