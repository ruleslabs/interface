import { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components/macro'
import { Plural, t, Trans } from '@lingui/macro'
import { useQuery, gql } from '@apollo/client'
import { WeiAmount, constants } from '@rulesorg/sdk-core'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import { useModalOpened, useCreateOfferModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import useCurrentUser from 'src/hooks/useCurrentUser'
import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import { ErrorCard } from 'src/components/Card'
import LockedWallet from 'src/components/LockedWallet'
import StarknetSigner, { StarknetSignerDisplayProps } from 'src/components/StarknetSigner'
import EtherInput from 'src/components/Input/EtherInput'
import tryParseWeiAmount from 'src/utils/tryParseWeiAmount'
import { SaleBreakdown, PurchaseBreakdown } from './PriceBreakdown'
import { BIG_INT_MIN_MARKETPLACE_OFFER_PRICE, BIG_INT_MAX_MARKETPLACE_OFFER_PRICE } from 'src/constants/misc'
import CardModelPriceStats from 'src/components/CardModelSales/CardModelPriceStats'
import CardBreakdown from './CardBreakdown'
import { PaginationSpinner } from 'src/components/Spinner'
import { useSearchCardModels } from 'src/state/search/hooks'
import { TYPE } from 'src/styles/theme'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { useOperations } from 'src/hooks/usePendingOperations'
import { uint256 } from 'starknet'

const CardBreakdownWrapper = styled.div`
  position: relative;
`

const StyledCardModelPriceStats = styled(CardModelPriceStats)`
  gap: 32px;
`

const CardsCount = styled(TYPE.body)`
  font-weight: 500;
  position: absolute;
  bottom: 8px;
  right: 16px;
`

const CARDS_QUERY = gql`
  query CardsByTokenIds($tokenIds: [String!]!) {
    cardsByTokenIds(tokenIds: $tokenIds) {
      serialNumber
      tokenId
      cardModel {
        id
        pictureUrl(derivative: "width=256")
        averageSale
        season
        scarcity {
          name
          maxSupply
        }
        artist {
          displayName
        }
      }
    }
  }
`

const display: StarknetSignerDisplayProps = {
  confirmationText: t`Your offer will be created`,
  confirmationActionText: t`Confirm offer creation`,
  transactionText: t`offer creation.`,
}

interface CreateOfferModalProps {
  tokenIds: string[]
}

export default function CreateOfferModal({ tokenIds }: CreateOfferModalProps) {
  const [cardIndex, setCardIndex] = useState(0)
  const [price, setPrice] = useState('')
  const [parsedPricesTotal, setParsedPricesTotal] = useState(WeiAmount.ZERO)

  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const isOpen = useModalOpened(ApplicationModal.CREATE_OFFER)
  const toggleCreateOfferModal = useCreateOfferModalToggle()

  // cards query
  const cardsQuery = useQuery(CARDS_QUERY, { variables: { tokenIds }, skip: !isOpen })
  const cards = cardsQuery.data?.cardsByTokenIds ?? []
  const card = cards[cardIndex]
  const tokenId = card?.tokenId

  // pending operation
  const { pushOperation, cleanOperations } = useOperations()

  // starknet tx
  const { pushCalls, resetStarknetTx, signing, setSigning } = useStarknetTx()

  // offers creation overview
  const handleOverviewConfirmation = useCallback(() => setSigning(true), [])
  const displayOverview = useMemo(() => cards.length > 1 && cardIndex === cards.length, [(tokenIds.length, cardIndex)])

  // price
  const parsedPrice = useMemo(() => tryParseWeiAmount(price), [price])

  const onPriceInput = useCallback((value: string) => setPrice(value), [])
  const isPriceValid = useMemo(() => {
    if (!parsedPrice) return false

    return (
      !parsedPrice.lessThan(BIG_INT_MIN_MARKETPLACE_OFFER_PRICE) &&
      !parsedPrice.greaterThan(BIG_INT_MAX_MARKETPLACE_OFFER_PRICE)
    )
  }, [parsedPrice])

  // prices confirmation
  const handlePriceConfirmation = useCallback(() => {
    const marketplaceAddress = constants.MARKETPLACE_ADDRESSES[rulesSdk.networkInfos.starknetChainId]
    if (!marketplaceAddress || !parsedPrice || !tokenId) return

    const u256TokenId = uint256.bnToUint256(tokenId)

    // save operations
    pushOperation({ tokenId, type: 'offerCreation', quantity: 1 })

    // save calls
    pushCalls({
      contractAddress: marketplaceAddress,
      entrypoint: 'createOffer',
      calldata: [u256TokenId.low, u256TokenId.high, parsedPrice.quotient.toString()],
    })

    if (cards.length === 1) {
      // if overview is not needed, just start signing process
      setSigning(true)
    } else {
      // increase total price for final overview
      setParsedPricesTotal((state) => state.add(parsedPrice))

      // move to the next card
      setCardIndex((state) => state + 1)

      // clean price input
      setPrice('')
    }
  }, [parsedPrice, tokenId, cards.length])

  // Lowest ask
  const [lowestAsks, setLowestAsks] = useState<{ [id: string]: string }>({})

  // card model search
  const cardModelsIds = useMemo(() => cards.map((card: any) => card.cardModel.id), [cards.length])

  const onPageFetched = useCallback((hits: any[]) => {
    setLowestAsks(
      hits.reduce<typeof lowestAsks>((acc, hit) => {
        acc[hit.objectID] = hit.lowestAsk
        return acc
      }, {})
    )
  }, [])
  const cardModelSearch = useSearchCardModels({
    facets: { cardModelId: cardModelsIds },
    skip: !cardModelsIds.length,
    hitsPerPage: cardModelsIds.length,
    onPageFetched,
  })

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setPrice('')
      setCardIndex(0)
      setLowestAsks({})
      resetStarknetTx()
      cleanOperations()
    }
  }, [isOpen])

  // loading
  const isLoading = cardsQuery.loading || cardModelSearch.loading

  return (
    <ClassicModal onDismiss={toggleCreateOfferModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader
          onDismiss={toggleCreateOfferModal}
          title={signing ? undefined : displayOverview ? t`Offers overview` : t`Enter an asking price`}
        />

        <ModalBody>
          <StarknetSigner display={display}>
            {!!(card && lowestAsks[card.cardModel.id]) && (
              <Column gap={32}>
                <CardBreakdownWrapper>
                  <CardBreakdown
                    pictureUrl={cards[cardIndex].cardModel.pictureUrl}
                    season={cards[cardIndex].cardModel.season}
                    artistName={cards[cardIndex].cardModel.artist.displayName}
                    serialNumbers={[cards[cardIndex].serialNumber]}
                    scarcityName={cards[cardIndex].cardModel.scarcity.name}
                  />

                  {cards.length > 1 && (
                    <CardsCount>
                      {cardIndex + 1} / {cards.length}
                    </CardsCount>
                  )}
                </CardBreakdownWrapper>

                <StyledCardModelPriceStats
                  lowestAsk={lowestAsks[cards[cardIndex].cardModel.id]}
                  averageSale={cards[cardIndex].cardModel.averageSale}
                />

                {currentUser?.starknetWallet.lockingReason ? (
                  <ErrorCard>
                    <LockedWallet />
                  </ErrorCard>
                ) : (
                  <Column gap={32}>
                    <EtherInput onUserInput={onPriceInput} value={price} placeholder="0.0" />
                    {parsedPrice && (
                      <SaleBreakdown
                        price={parsedPrice.quotient.toString()}
                        artistName={cards[cardIndex].cardModel.artist.displayName}
                      />
                    )}
                  </Column>
                )}

                <PrimaryButton onClick={handlePriceConfirmation} disabled={!isPriceValid} large>
                  <Trans>Next</Trans>
                </PrimaryButton>
              </Column>
            )}

            {displayOverview && (
              <Column gap={32}>
                <PurchaseBreakdown price={parsedPricesTotal.quotient.toString()}>
                  <Plural value={cards.length} _1="Total ({0} card)" other="Total ({0} cards)" />
                </PurchaseBreakdown>
                <SaleBreakdown price={parsedPricesTotal.quotient.toString()} />

                <PrimaryButton onClick={handleOverviewConfirmation} large>
                  <Trans>Next</Trans>
                </PrimaryButton>
              </Column>
            )}

            <PaginationSpinner loading={isLoading} />
          </StarknetSigner>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
