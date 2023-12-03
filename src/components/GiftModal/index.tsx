import { gql, useQuery } from '@apollo/client'
import { t, Trans } from '@lingui/macro'
import { constants } from '@rulesorg/sdk-core'
import { useAccount } from '@starknet-react/core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Avatar from 'src/components/Avatar'
import { PrimaryButton } from 'src/components/Button'
import Column from 'src/components/Column'
import CardBreakdown from 'src/components/MarketplaceModal/CardBreakdown'
import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import { RowCenter } from 'src/components/Row'
import StarknetSigner from 'src/components/StarknetSigner/Transaction'
import UsersSearchBar from 'src/components/UsersSearchBar'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { useOperations } from 'src/hooks/usePendingOperations'
import useRulesAccount from 'src/hooks/useRulesAccount'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { ReactComponent as Arrow } from 'src/images/arrow.svg'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { ApplicationModal } from 'src/state/application/actions'
import { useModalOpened, useOfferModalToggle } from 'src/state/application/hooks'
import { TYPE } from 'src/styles/theme'
import { Operation } from 'src/types'
import { Call, uint256 } from 'starknet'
import styled from 'styled-components/macro'

import { StarknetStatus } from '../Web3Status'

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
    padding: 0 8px;
    position: relative;
    border-width: 1px 0;
    border-style: solid;
    border-color: ${theme.bg3}80;
    overflow: scroll;

    & > div {
      max-height: 300px;
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
        artistName
      }
      voucherSigningData {
        signature {
          r
          s
        }
        salt
      }
    }
  }
`

interface GiftModalProps {
  tokenIds: string[]
}

export default function GiftModal({ tokenIds }: GiftModalProps) {
  const [external, setExternal] = useState(false)
  const [rulesRecipient, setRulesRecipient] = useState<any | null>(null)

  // current user
  const { currentUser } = useCurrentUser()

  // starknet account
  const { address } = useRulesAccount()

  // external account
  const { address: externalRecipient } = useAccount()

  // toggle external
  const toggleExternal = useCallback(() => setExternal((state) => !state), [])

  // modal
  const isOpen = useModalOpened(ApplicationModal.OFFER)
  const toggleOfferModal = useOfferModalToggle()

  // cards query
  const cardsQuery = useQuery(CARDS_QUERY, { variables: { tokenIds }, skip: !isOpen })
  const cards = cardsQuery.data?.cardsByTokenIds ?? []

  // card models map
  const cardModelsMap = useMemo(
    () =>
      (cards as any[]).reduce<any>((acc, card) => {
        acc[card.cardModel.id] ??= {
          pictureUrl: card.cardModel.pictureUrl,
          artistName: card.cardModel.artistName,
          season: card.cardModel.season,
          scarcityName: card.cardModel.scarcity.name,
          serialNumbers: [],
        }

        acc[card.cardModel.id].serialNumbers.push(card.serialNumber)

        return acc
      }, {}),
    [cards.length]
  )

  // voucher signing data map
  const vouchersSigningDataMap = useMemo(
    () =>
      (cards as any[]).reduce<any>((acc, card) => {
        acc[card.tokenId] = card.voucherSigningData
        return acc
      }, {}),
    [cards.length]
  )

  // pending operation
  const { pushOperation, cleanOperations } = useOperations()

  // starknet tx
  const { setCalls, resetStarknetTx, signing, setSigning } = useStarknetTx()

  const handleConfirmation = useCallback(
    (recipient?: string) => {
      if (!address || !recipient) return

      const rulesTokensAddress = constants.RULES_TOKENS_ADDRESSES[rulesSdk.networkInfos.starknetChainId]

      // save operations
      pushOperation(...tokenIds.map((tokenId): Operation => ({ tokenId, action: 'transfer', quantity: 1 })))

      const voucherRedeemCalls = tokenIds
        .map((tokenId) =>
          vouchersSigningDataMap[tokenId]
            ? rulesSdk.getVoucherRedeemCall(
                address,
                tokenId,
                1,
                vouchersSigningDataMap[tokenId].salt,
                vouchersSigningDataMap[tokenId].signature
              )
            : null
        )
        .filter((call): call is Call => !!call)

      // save calls
      setCalls([
        ...voucherRedeemCalls,
        {
          contractAddress: rulesTokensAddress,
          entrypoint: 'batch_transfer_from',
          calldata: [
            { from: address },
            { to: recipient },

            { idsLen: tokenIds.length },
            ...tokenIds.flatMap((tokenId) => {
              const u256TokenId = uint256.bnToUint256(tokenId)
              return [u256TokenId.low, u256TokenId.high]
            }), // ids

            { amountsLent: tokenIds.length },
            ...tokenIds.flatMap(() => [1, 0]), // amount.low, amount.high
          ],
        },
      ])

      setSigning(true)
    },
    [tokenIds.length, address, setSigning, setCalls, vouchersSigningDataMap]
  )

  // on modal status update
  useEffect(() => {
    if (isOpen) {
      setRulesRecipient(null)
      resetStarknetTx()
      cleanOperations()
    }
  }, [isOpen])

  if (!currentUser || !address) return null

  return (
    <ClassicModal onDismiss={toggleOfferModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleOfferModal} title={signing ? undefined : t`Offer this card`} />

        <ModalBody>
          <StarknetSigner action="transfer">
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

              {external ? (
                <>
                  <StarknetStatus>
                    <PrimaryButton onClick={() => handleConfirmation(externalRecipient)} large>
                      <Trans>Next</Trans>
                    </PrimaryButton>
                  </StarknetStatus>
                  <TYPE.subtitle onClick={toggleExternal} clickable>
                    <Trans>Transfer to a Rules user</Trans>
                  </TYPE.subtitle>
                </>
              ) : (
                <>
                  <RowCenter gap={16}>
                    <TYPE.body style={{ whiteSpace: 'nowrap' }}>
                      <Trans>Send to</Trans>
                    </TYPE.body>
                    <UsersSearchBar onSelect={setRulesRecipient} selfSearchAllowed={false} />
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
                        {rulesRecipient && (
                          <>
                            <Avatar
                              src={rulesRecipient.profile.pictureUrl}
                              fallbackSrc={rulesRecipient.profile.fallbackSrc}
                            />
                            <TYPE.body fontSize={14}>{rulesRecipient.username}</TYPE.body>
                          </>
                        )}
                      </RowCenter>
                    </TransferSummary>

                    <TYPE.subtitle onClick={toggleExternal} clickable>
                      <Trans>Transfer to an external wallet</Trans>
                    </TYPE.subtitle>
                  </Column>

                  <PrimaryButton
                    onClick={() => handleConfirmation(rulesRecipient?.starknetWallet.address)}
                    disabled={!rulesRecipient}
                    large
                  >
                    <Trans>Next</Trans>
                  </PrimaryButton>
                </>
              )}
            </Column>
          </StarknetSigner>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
