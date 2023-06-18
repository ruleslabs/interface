import { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components/macro'
import { Plural, t, Trans } from '@lingui/macro'
import { useQuery, gql } from '@apollo/client'
import { Signature, Unit, WeiAmount, constants } from '@rulesorg/sdk-core'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import { useModalOpened, useCreateOfferModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import StarknetSigner from 'src/components/StarknetSigner/Messages'
import EtherInput from 'src/components/Input/EtherInput'
import tryParseWeiAmount from 'src/utils/tryParseWeiAmount'
import { SaleBreakdown, PurchaseBreakdown } from './PriceBreakdown'
import { BIG_INT_MIN_MARKETPLACE_OFFER_PRICE, BIG_INT_MAX_MARKETPLACE_OFFER_PRICE } from 'src/constants/misc'
import CardModelPriceStats from 'src/components/CardModelSales/CardModelPriceStats'
import CardBreakdown from './CardBreakdown'
import { PaginationSpinner } from 'src/components/Spinner'
import { TYPE } from 'src/styles/theme'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import useRulesAccount from 'src/hooks/useRulesAccount'
import useStarknetMessages from 'src/hooks/useStarknetMessages'
import { useListCards } from 'src/graphql/data/CardListings'
import { stark } from 'starknet'

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
        artistName
        lowestAsk
      }
    }
  }
`

interface CreateOfferModalProps {
  tokenIds: string[]
}

export default function ListCardMocal({ tokenIds }: CreateOfferModalProps) {
  const [cardIndex, setCardIndex] = useState(0)
  const [price, setPrice] = useState('')
  const [prices, setPrices] = useState<string[]>([])
  const [salts, setSalts] = useState<string[]>([])
  const [parsedPricesTotal, setParsedPricesTotal] = useState(WeiAmount.ZERO)

  // rules account
  const { address } = useRulesAccount()

  // modal
  const isOpen = useModalOpened(ApplicationModal.CREATE_OFFER)
  const toggleCreateOfferModal = useCreateOfferModalToggle()

  // cards query
  const { data, loading } = useQuery(CARDS_QUERY, { variables: { tokenIds }, skip: !isOpen })
  const cards = data?.cardsByTokenIds ?? []
  const card = cards[cardIndex]
  const tokenId = card?.tokenId

  // voucher signing data map
  const vouchersSigningDataMap = useMemo(
    () =>
      (cards as any[]).reduce<any>((acc, card) => {
        acc[card.tokenId] = card.voucherSigningData
        return acc
      }, {}),
    [cards.length]
  )

  // starknet tx
  const { pushMessages, resetStarknetTx, signing, setSigning } = useStarknetMessages()

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
  const handlePriceConfirmation = useCallback(async () => {
    const marketplaceAddress = constants.MARKETPLACE_ADDRESSES[rulesSdk.networkInfos.starknetChainId]
    if (!marketplaceAddress || !parsedPrice || !tokenId || !address) return

    const salt = stark.randomAddress()

    const weiPrice = parsedPrice.toUnitFixed(Unit.WEI)

    const hash = await rulesSdk.computeListingOrderHash(address, tokenId, 1, weiPrice, salt)

    console.log(hash)

    // push new price
    setPrices((prices) => [...prices, weiPrice])

    // push new salt
    setSalts((salts) => [...salts, salt])

    // save calls
    pushMessages(hash)

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
  }, [parsedPrice, tokenId, cards.length, vouchersSigningDataMap, address])

  // graphql mutations
  const [listCardsMutation, { error }] = useListCards()

  const onSignature = useCallback(
    async (signatures: Signature[], fullPublicKey: string) => {
      return listCardsMutation({
        variables: {
          cardListings: signatures.map((signature, index) => ({
            tokenId: cards[index].tokenId,
            price: prices[index],
            orderSigningData: { salt: salts[index], signature },
          })),
          fullPublicKey,
        },
      })
    },
    [cards.length, prices.length, salts.length, listCardsMutation]
  )

  // on close modal
  useEffect(() => {
    if (isOpen) {
      resetStarknetTx()
      setCardIndex(0)
      setPrice('')
      setPrices([])
      setSalts([])
    }
  }, [isOpen])

  return (
    <ClassicModal onDismiss={toggleCreateOfferModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader
          onDismiss={toggleCreateOfferModal}
          title={signing ? undefined : displayOverview ? t`Offers overview` : t`Enter an asking price`}
        />

        <ModalBody>
          <StarknetSigner onSignature={onSignature} action={'offerCreation'} error={error?.message}>
            {!!card && (
              <Column gap={32}>
                <CardBreakdownWrapper>
                  <CardBreakdown
                    pictureUrl={cards[cardIndex].cardModel.pictureUrl}
                    season={cards[cardIndex].cardModel.season}
                    artistName={cards[cardIndex].cardModel.artistName}
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
                  lowestAsk={cards[cardIndex].cardModel.lowestAsk}
                  averageSale={cards[cardIndex].cardModel.averageSale}
                />

                <Column gap={32}>
                  <EtherInput onUserInput={onPriceInput} value={price} placeholder="0.0" />
                  {parsedPrice && (
                    <SaleBreakdown
                      price={parsedPrice.quotient.toString()}
                      artistName={cards[cardIndex].cardModel.artistName}
                    />
                  )}
                </Column>

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

            <PaginationSpinner loading={loading} />
          </StarknetSigner>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
