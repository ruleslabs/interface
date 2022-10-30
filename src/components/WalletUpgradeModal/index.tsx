import { useState, useCallback, useEffect } from 'react'
import { t, Trans } from '@lingui/macro'
import { ApolloError } from '@apollo/client'
import { Call, Signature } from 'starknet'
import styled from 'styled-components'

import Modal from '@/components/Modal'
import { useModalOpen, useUpgradeWalletModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'
import { ErrorCard, InfoCard } from '@/components/Card'
import LockedWallet from '@/components/LockedWallet'
import StarknetSigner from '@/components/StarknetSigner'
import { ACCOUNT_CLASS_HASH } from '@/constants/addresses'
import { useUpgradeWalletMutation } from '@/state/wallet/hooks'
import { TYPE } from '@/styles/theme'
import Link from '@/components/Link'

import Pumpkin from '@/images/pumpkin.svg'

const Badge = styled.div`
  width: 72px;
  height: 72px;
  border: 4px solid #f3900e;
  border-radius: 50%;
  justify-content: center;
  padding: 12px 14px 16px;
  background: ${({ theme }) => theme.bg1};
  margin: 16px auto 0;
  animation: badge-float 5s linear infinite;

  @keyframes badge-float {
    0% {
      transform: translatey(0px) scale(1.02);
    }

    50% {
      transform: translatey(10px) scale(1);
    }

    100% {
      transform: translatey(0px) scale(1.02);
    }
  }
`

interface UpgradeWalletModalProps {
  onSuccess(): void
}

export default function UpgradeWalletModal({ onSuccess }: UpgradeWalletModalProps) {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpen(ApplicationModal.UPGRADE_WALLET)
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
      upgradeWalletMutation({ variables: { maxFee, nonce, signature: JSON.stringify(signature) } })
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
    [onSuccess]
  )

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setCalls(null)
      setTxHash(null)
      setError(null)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={toggleUpgradeWalletModal} isOpen={isOpen}>
      <StarknetSigner
        modalHeaderChildren={t`Upgrade your wallet`}
        confirmationText={t`Your wallet will be upgraded`}
        confirmationActionText={t`Confirm wallet upgrade`}
        transactionText={t`wallet upgrade.`}
        calls={calls ?? undefined}
        txHash={txHash ?? undefined}
        error={error ?? undefined}
        onDismiss={toggleUpgradeWalletModal}
        onSignature={onSignature}
        onError={onError}
      >
        <Column gap={32}>
          <Column gap={16}>
            <TYPE.medium>
              <Trans>You need to update your wallet to keep your ETHs safe</Trans>
            </TYPE.medium>

            <TYPE.body>
              <Trans>
                <Link href="https://medium.com/starkware/starknet-alpha-0-10-0-923007290470" target="_blank" underline>
                  Starknet released the Alpha 0.10.0
                </Link>{' '}
                and it implies some changes for your wallet. If you don&apos;t hold ETHs, the upgrade is not mandatory
                but still recommended.
              </Trans>
            </TYPE.body>
          </Column>

          <InfoCard textAlign="center">
            <Trans>
              Don&apos;t panic, this upgrade comes with a surprise.
              <br />
              Upgrade your account and unlock an exclusive discord badge.
            </Trans>

            <Badge>
              <Pumpkin />
            </Badge>
          </InfoCard>

          {currentUser?.starknetWallet.needsSignerPublicKeyUpdate && (
            <ErrorCard>
              <LockedWallet />
            </ErrorCard>
          )}

          <PrimaryButton
            onClick={handleConfirmation}
            disabled={currentUser?.starknetWallet.needsSignerPublicKeyUpdate}
            large
          >
            <Trans>Upgrade</Trans>
          </PrimaryButton>
        </Column>
      </StarknetSigner>
    </Modal>
  )
}