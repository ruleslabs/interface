import { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { uint256HexFromStrHex, getStarknetCardId, ScarcityName } from '@rulesorg/sdk-core'
import { ApolloError } from '@apollo/client'
import { Call, Signature } from 'starknet'

import { ModalHeader } from '@/components/Modal'
import ClassicModal, { ModalContent } from '@/components/Modal/Classic'
import { useModalOpened, useOfferModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import UsersSearchBar from '@/components/UsersSearchBar'
import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import { ErrorCard } from '@/components/Card'
import LockedWallet from '@/components/LockedWallet'
import StarknetSigner from '@/components/StarknetSigner'
import { RULES_TOKENS_ADDRESSES } from '@/constants/addresses'
import { useTransferCardMutation } from '@/state/wallet/hooks'
import { networkId } from '@/constants/networks'
import CardBreakdown from '@/components/MarketplaceModal/CardBreakdown'

import Arrow from '@/images/arrow.svg'
import Avatar from '../Avatar'

const TransferSummary = styled(RowCenter)`
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}80;
  border-radius: 3px;
  padding: 16px 12px;
  gap: 16px;

  & img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  & > div:first-child,
  & > div:last-child {
    flex: 1;
  }
`

const ArrowWrapper = styled(Column)`
  width: 26px;
  height: 26px;
  background: ${({ theme }) => theme.bg5};
  box-shadow: 0px 0px 5px ${({ theme }) => theme.bg1};
  justify-content: center;
  border-radius: 50%;
  position: relative;

  & svg {
    margin: 0 auto;
    width: 16px;
    height: 16px;
    fill: ${({ theme }) => theme.text1};
  }

  ::before,
  ::after {
    content: '';
    width: 1px;
    background: ${({ theme }) => theme.text1}20;
    left: 13px;
    position: absolute;
    display: block;
  }

  ::before {
    top: -16px;
    bottom: 26px;
  }

  ::after {
    top: 26px;
    bottom: -16px;
  }
`

interface GiftModalProps {
  artistName: string
  season: number
  scarcityName: string
  serialNumber: number
  pictureUrl: string
  onSuccess(): void
}

export default function GiftModal({
  artistName,
  season,
  scarcityName,
  serialNumber,
  pictureUrl,
  onSuccess,
}: GiftModalProps) {
  // current user
  const currentUser = useCurrentUser()

  // token id
  const tokenId: string = useMemo(
    () => getStarknetCardId(artistName, season, ScarcityName.indexOf(scarcityName), serialNumber),
    [artistName, season, scarcityName, serialNumber]
  )

  // modal
  const isOpen = useModalOpened(ApplicationModal.OFFER)
  const toggleOfferModal = useOfferModalToggle()

  // generate calls
  const [recipient, setRecipient] = useState<any | null>(null)
  const [calls, setCalls] = useState<Call[] | null>(null)

  const handleConfirmation = useCallback(() => {
    if (!currentUser?.starknetWallet.address || !recipient?.starknetWallet.address) return

    const uint256TokenId = uint256HexFromStrHex(tokenId)

    setCalls([
      {
        contractAddress: RULES_TOKENS_ADDRESSES[networkId],
        entrypoint: 'safeTransferFrom',
        calldata: [
          currentUser.starknetWallet.address,
          recipient.starknetWallet.address,
          uint256TokenId.low,
          uint256TokenId.high,
          1, // amount.low
          0, // amount.high
          1, // data len
          0, // data
        ],
      },
    ])
  }, [tokenId, currentUser?.starknetWallet.address, recipient?.starknetWallet.address])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // signature
  const [transferCardMutation] = useTransferCardMutation()
  const [txHash, setTxHash] = useState<string | null>(null)

  const onSignature = useCallback(
    (signature: Signature, maxFee: string, nonce: string) => {
      if (!recipient?.starknetWallet.address) return

      transferCardMutation({
        variables: {
          tokenId,
          recipientAddress: recipient.starknetWallet.address,
          maxFee,
          nonce,
          signature: JSON.stringify(signature),
        },
      })
        .then((res?: any) => {
          const hash = res?.data?.transferCard?.hash
          if (!hash) {
            onError('Transaction not received')
            return
          }

          setTxHash(hash)
          onSuccess()
        })
        .catch((transferCardError: ApolloError) => {
          const error = transferCardError?.graphQLErrors?.[0]
          onError(error?.message ?? 'Transaction not received')

          console.error(error)
        })
    },
    [recipient?.starknetWallet.address, tokenId, onSuccess]
  )

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setCalls(null)
      setTxHash(null)
      setError(null)
      setRecipient(null)
    }
  }, [isOpen])

  if (!currentUser) return null

  return (
    <ClassicModal onDismiss={toggleOfferModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleOfferModal} title={calls ? undefined : t`Offer this card`} />

        <StarknetSigner
          confirmationText={t`Your card is on its way`}
          transactionText={t`card transfer.`}
          calls={calls ?? undefined}
          txHash={txHash ?? undefined}
          error={error ?? undefined}
          onSignature={onSignature}
          onError={onError}
        >
          <Column gap={24}>
            <CardBreakdown
              pictureUrl={pictureUrl}
              season={season}
              artistName={artistName}
              serialNumbers={[serialNumber]}
              scarcityName={scarcityName}
            />

            {currentUser.starknetWallet.lockingReason ? (
              <ErrorCard>
                <LockedWallet />
              </ErrorCard>
            ) : (
              <>
                <RowCenter gap={16}>
                  <TYPE.body style={{ whiteSpace: 'nowrap' }}>
                    <Trans>Send to</Trans>
                  </TYPE.body>
                  <UsersSearchBar onSelect={setRecipient} selfSearchAllowed={false} />
                </RowCenter>

                <Column gap={12}>
                  <TransferSummary>
                    <RowCenter gap={12}>
                      <Avatar src={currentUser.profile.pictureUrl} fallbackSrc={currentUser.profile.fallbackSrc} />
                      <TYPE.body fontSize={14}>
                        <Trans>My account</Trans>
                      </TYPE.body>
                    </RowCenter>

                    <ArrowWrapper>
                      <Arrow />
                    </ArrowWrapper>

                    <RowCenter gap={12}>
                      {recipient && (
                        <>
                          <Avatar src={recipient.profile.pictureUrl} fallbackSrc={recipient.profile.fallbackSrc} />
                          <TYPE.body fontSize={14}>{recipient.username}</TYPE.body>
                        </>
                      )}
                    </RowCenter>
                  </TransferSummary>

                  {recipient && !recipient.starknetWallet.address && (
                    <TYPE.body color="error">
                      <Trans>This user does not have a wallet yet, please try again in a few hours.</Trans>
                    </TYPE.body>
                  )}
                </Column>
              </>
            )}

            <PrimaryButton onClick={handleConfirmation} disabled={!recipient?.starknetWallet.address} large>
              <Trans>Next</Trans>
            </PrimaryButton>
          </Column>
        </StarknetSigner>
      </ModalContent>
    </ClassicModal>
  )
}
