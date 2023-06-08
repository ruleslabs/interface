import { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components/macro'
import { t, Trans } from '@lingui/macro'
import { gql, useQuery } from '@apollo/client'
import { constants } from '@rulesorg/sdk-core'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import { useModalOpened, useOfferModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import UsersSearchBar from 'src/components/UsersSearchBar'
import useCurrentUser from 'src/hooks/useCurrentUser'
import Column from 'src/components/Column'
import { RowCenter } from 'src/components/Row'
import { TYPE } from 'src/styles/theme'
import { PrimaryButton } from 'src/components/Button'
import { ErrorCard } from 'src/components/Card'
import LockedWallet from 'src/components/LockedWallet'
import StarknetSigner, { StarknetSignerDisplayProps } from 'src/components/StarknetSigner'
import CardBreakdown from 'src/components/MarketplaceModal/CardBreakdown'
import Avatar from 'src/components/Avatar'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import useRulesAccount from 'src/hooks/useRulesAccount'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { Operation } from 'src/types'
import { useOperations } from 'src/hooks/usePendingOperations'

import { ReactComponent as Arrow } from 'src/images/arrow.svg'
import { uint256 } from 'starknet'

const MAX_CARD_MODEL_BREAKDOWNS_WITHOUT_SCROLLING = 2

const TransferSummary = styled(RowCenter)`
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}80;
  border-radius: 6px;
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
  background: ${({ theme }) => theme.bg4};
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

  &::before,
  &::after {
    content: '';
    width: 1px;
    background: ${({ theme }) => theme.text1}20;
    left: 13px;
    position: absolute;
    display: block;
  }

  &::before {
    top: -16px;
    bottom: 26px;
  }

  &::after {
    top: 26px;
    bottom: -16px;
  }
`

const CardBreakdownsWrapper = styled.div<{ needsScroll: boolean }>`
  & > div {
    gap: 16px;
  }

  ${({ theme, needsScroll }) =>
    needsScroll &&
    `
    border-radius: 6px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(0deg, ${theme.bg1} 0, ${theme.bg1}00 150px);
      pointer-events: none;
    }

    & > div {
      max-height: 250px;
      overflow: scroll;
      padding: 0 0 64px;
    }
  `}
`

const CARDS_QUERY = gql`
  query ($tokenIds: [String!]!) {
    cardsByTokenIds(tokenIds: $tokenIds) {
      serialNumber
      tokenId
      cardModel {
        id
        pictureUrl(derivative: "width=256")
        season
        scarcity {
          name
        }
        artist {
          displayName
        }
      }
    }
  }
`

const display: StarknetSignerDisplayProps = {
  confirmationText: t`Your card is on its way`,
  transactionText: t`card transfer.`,
}

interface GiftModalProps {
  tokenIds: string[]
}

export default function GiftModal({ tokenIds }: GiftModalProps) {
  const [recipient, setRecipient] = useState<any | null>(null)

  // current user
  const { currentUser } = useCurrentUser()

  // starknet account
  const { address } = useRulesAccount()

  // modal
  const isOpen = useModalOpened(ApplicationModal.OFFER)
  const toggleOfferModal = useOfferModalToggle()

  // cards query
  const cardsQuery = useQuery(CARDS_QUERY, { variables: { tokenIds }, skip: !isOpen })
  const cards = cardsQuery.data?.cardsByTokenIds ?? []
  const cardModelsMap = useMemo(
    () =>
      (cards as any[]).reduce<any>((acc, card) => {
        acc[card.cardModel.id] = acc[card.cardModel.id] ?? {
          pictureUrl: card.cardModel.pictureUrl,
          artistName: card.cardModel.artist.displayName,
          season: card.cardModel.season,
          scarcityName: card.cardModel.scarcity.name,
          serialNumbers: [],
        }

        acc[card.cardModel.id].serialNumbers.push(card.serialNumber)

        return acc
      }, {}),
    [cards.length]
  )

  // pending operation
  const { pushOperation, cleanOperations } = useOperations()

  // starknet tx
  const { setCalls, resetStarknetTx, signing, setSigning } = useStarknetTx()

  const handleConfirmation = useCallback(() => {
    const rulesTokensAddress = constants.RULES_TOKENS_ADDRESSES[rulesSdk.networkInfos.starknetChainId]
    if (!currentUser?.starknetWallet.address || !recipient?.starknetWallet.address || !rulesTokensAddress) return

    // save operations
    pushOperation(...tokenIds.map((tokenId): Operation => ({ tokenId, type: 'transfer', quantity: 1 })))

    // save calls
    setCalls([
      {
        contractAddress: rulesTokensAddress,
        entrypoint: 'safeBatchTransferFrom',
        calldata: [
          currentUser.starknetWallet.address,
          recipient.starknetWallet.address,

          tokenIds.length, // ids len
          ...tokenIds.flatMap((tokenId) => {
            const u256TokenId = uint256.bnToUint256(tokenId)
            return [u256TokenId.low, u256TokenId.high]
          }), // ids

          tokenIds.length, // amounts len
          ...tokenIds.flatMap(() => [1, 0]), // amount.low, amount.high

          1, // data len
          0, // data
        ],
      },
    ])

    setSigning(true)
  }, [tokenIds.length, address, recipient?.starknetWallet.address, setSigning, setCalls])

  // on modal status update
  useEffect(() => {
    if (isOpen) {
      setRecipient(null)
      resetStarknetTx()
      cleanOperations()
    }
  }, [isOpen])

  if (!currentUser) return null

  return (
    <ClassicModal onDismiss={toggleOfferModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleOfferModal} title={signing ? undefined : t`Offer this card`} />

        <ModalBody>
          <StarknetSigner display={display}>
            <Column gap={24}>
              <CardBreakdownsWrapper
                needsScroll={Object.keys(cardModelsMap).length > MAX_CARD_MODEL_BREAKDOWNS_WITHOUT_SCROLLING}
              >
                <Column>
                  {Object.keys(cardModelsMap).map((cardModelId) => (
                    <CardBreakdown
                      key={cardModelId}
                      pictureUrl={cardModelsMap[cardModelId].pictureUrl}
                      season={cardModelsMap[cardModelId].season}
                      artistName={cardModelsMap[cardModelId].artistName}
                      serialNumbers={cardModelsMap[cardModelId].serialNumbers}
                      scarcityName={cardModelsMap[cardModelId].scarcityName}
                    />
                  ))}
                </Column>
              </CardBreakdownsWrapper>

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
                        <Avatar src={currentUser.profile.pictureUrl} fallbackSrc={currentUser.profile.fallbackUrl} />
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
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
