import { useState, useCallback, useEffect } from 'react'
import { t, Trans } from '@lingui/macro'
import { ApolloError } from '@apollo/client'
import { Call, Signature, stark } from 'starknet'

import { ModalHeader } from '@/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from '@/components/Modal/Classic'
import { useModalOpened, useUpgradeWalletModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'
import { ErrorCard } from '@/components/Card'
import LockedWallet from '@/components/LockedWallet'
import StarknetSigner from '@/components/StarknetSigner'
import { ACCOUNT_CLASS_HASH } from '@/constants/addresses'
import { useUpgradeWalletMutation } from '@/state/wallet/hooks'
import { TYPE } from '@/styles/theme'

interface UpgradeWalletModalProps {
  onSuccess(): void
}

export default function UpgradeWalletModal({ onSuccess }: UpgradeWalletModalProps) {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpened(ApplicationModal.UPGRADE_WALLET)
  const toggleUpgradeWalletModal = useUpgradeWalletModalToggle()

  // call
  const [calls, setCalls] = useState<Call[] | null>(null)
  const handleConfirmation = useCallback(() => {
    setCalls([
      {
        contractAddress: currentUser.starknetWallet.address,
        entrypoint: 'upgrade',
        calldata: [ACCOUNT_CLASS_HASH],
      },
    ])
  }, [currentUser?.starknetWallet?.address])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // signature
  const [upgradeWalletMutation] = useUpgradeWalletMutation()
  const [txHash, setTxHash] = useState<string | null>(null)

  const onSignature = useCallback(
    (signature: Signature, maxFee: string, nonce: string) => {
      upgradeWalletMutation({ variables: { maxFee, nonce, signature: stark.signatureToDecimalArray(signature) } })
        .then((res?: any) => {
          const hash = res?.data?.upgradeWallet?.hash
          if (!hash) {
            onError('Transaction not received')
            return
          }

          onSuccess()
          setTxHash(hash)
        })
        .catch((upgradeWalletError: ApolloError) => {
          const error = upgradeWalletError?.graphQLErrors?.[0]
          onError(error?.message ?? 'Transaction not received')

          console.error(error)
        })
    },
    [onSuccess, onError]
  )

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setCalls(null)
      setTxHash(null)
      setError(null)
    }
  }, [isOpen])

  if (!currentUser) return null

  return (
    <ClassicModal onDismiss={toggleUpgradeWalletModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleUpgradeWalletModal} title={calls ? undefined : t`Wallet upgrade`} />

        {currentUser.needsUpgrade ? (
          <StarknetSigner
            confirmationText={t`Your wallet will be upgraded`}
            confirmationActionText={t`Confirm wallet upgrade`}
            transactionText={t`wallet upgrade.`}
            calls={calls ?? undefined}
            txHash={txHash ?? undefined}
            error={error ?? undefined}
            onSignature={onSignature}
            onError={onError}
          >
            <Column gap={32}>
              <Column gap={16}>
                <TYPE.large>
                  <Trans>Your wallet needs to be upgraded.</Trans>
                </TYPE.large>

                <TYPE.body>
                  <Trans>
                    Starknet released a new update to improve the network, and it implies some changes for your wallet.
                    To keep on working, your wallet needs to be upgraded as soon as possible.
                    <br />
                    <br />
                    If you don&apos;t perform the upgrade on time, your wallet will be temporarily locked.
                  </Trans>
                </TYPE.body>
              </Column>

              {!!currentUser?.starknetWallet.lockingReason && (
                <ErrorCard>
                  <LockedWallet />
                </ErrorCard>
              )}

              <PrimaryButton onClick={handleConfirmation} disabled={!!currentUser?.starknetWallet.lockingReason} large>
                <Trans>Upgrade</Trans>
              </PrimaryButton>
            </Column>
          </StarknetSigner>
        ) : (
          <ModalBody>
            <TYPE.large textAlign="center">
              <Trans>Your wallet is up-to-date 🎉</Trans>
            </TYPE.large>
          </ModalBody>
        )}
      </ModalContent>
    </ClassicModal>
  )
}
