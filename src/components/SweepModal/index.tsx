import { useCallback, useEffect, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { Trans, t } from '@lingui/macro'
import { Unit, WeiAmount, constants } from '@rulesorg/sdk-core'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import { useModalOpened, useSweepModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import useCurrentUser from 'src/hooks/useCurrentUser'
import StarknetSigner from 'src/components/StarknetSigner/Transaction'
import useRulesAccount from 'src/hooks/useRulesAccount'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { useOperations } from 'src/hooks/usePendingOperations'
import { useCardListings } from 'src/graphql/data/CardListings'
import { CardListingsSortingType, SortingOption } from 'src/graphql/data/__generated__/types-and-hooks'
import { Column } from 'src/theme/components/Flex'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import { PrimaryButton } from '../Button'
import Slider from '../Slider'
import CardBreakdown from '../MarketplaceModal/CardBreakdown'
import { useGetWalletConstructorCallData } from 'src/hooks/useCreateWallet'
import { Operation } from 'src/types/common'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { PaginationSpinner } from '../Spinner'

const MAX_CARD_MODEL_BREAKDOWNS_WITHOUT_SCROLLING = 2

const MIN_ITEMS_COUNT = 1
const MAX_ITEMS_COUNT = 50

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

export default function SweepModal() {
  const [itemsCount, setItemsCount] = useState(MIN_ITEMS_COUNT)
  const [debouncedItemsCount, setDebouncedItemsCount] = useState(MIN_ITEMS_COUNT)

  // current user
  const { currentUser } = useCurrentUser()

  // starknet account
  const { address } = useRulesAccount()

  // modal
  const isOpen = useModalOpened(ApplicationModal.SWEEP)
  const toggleOfferModal = useSweepModalToggle()

  // get listings
  const { data: cardListings, loading } = useCardListings({
    sort: { type: CardListingsSortingType.Price, direction: SortingOption.Asc },
    first: debouncedItemsCount,
  })

  // card models map
  const cardModelsMap = useMemo(
    () =>
      (cardListings ?? []).reduce<any>((acc, { card, cardModel }) => {
        acc[cardModel.slug] ??= {
          pictureUrl: cardModel.imageUrl,
          artistName: cardModel.artistName,
          season: cardModel.season,
          scarcityName: cardModel.scarcityName,
          serialNumbers: [],
        }

        acc[cardModel.slug].serialNumbers.push(card.serialNumber)

        return acc
      }, {}),
    [cardListings?.length]
  )

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // total price
  const parsedTotalPrice = useMemo(
    () =>
      cardListings?.reduce<WeiAmount>((acc, { price }) => acc.add(WeiAmount.fromRawAmount(price)), WeiAmount.ZERO) ??
      WeiAmount.ZERO,
    [cardListings?.length]
  )

  // itemsCount
  const debounceItemsCount = useCallback(() => setDebouncedItemsCount(itemsCount), [itemsCount])
  const setAndDebounceItemsCount = useCallback((value: number) => {
    setItemsCount(value)
    setDebouncedItemsCount(value)
  }, [])

  // pending operation
  const { pushOperation, cleanOperations } = useOperations()

  // starknet tx
  const { setCalls, resetStarknetTx, signing, setSigning, increaseTxValue } = useStarknetTx()

  // undeployed offerer
  const getWalletConstructorCallData = useGetWalletConstructorCallData()

  // call
  const handleConfirmation = useCallback(() => {
    if (!cardListings) return

    // save operations
    pushOperation(
      ...cardListings.map(({ card }): Operation => ({ tokenId: card.tokenId, action: 'offerAcceptance', quantity: 1 }))
    )

    increaseTxValue(parsedTotalPrice)

    // save calls
    setCalls([
      {
        contractAddress: constants.ETH_ADDRESSES[rulesSdk.networkInfos.starknetChainId],
        entrypoint: 'increaseAllowance',
        calldata: [
          constants.MARKETPLACE_ADDRESSES[rulesSdk.networkInfos.starknetChainId],
          parsedTotalPrice.toUnitFixed(Unit.WEI),
          0,
        ],
      },
      ...cardListings.map(({ card, offerer, ...listing }) => {
        const offererPublicKey = offerer.currentPublicKey
        const isOwnerDeployed = offerer.deployed ?? true

        return card.voucherSigningData
          ? rulesSdk.getVoucherReedemAndOrderFulfillCall(
              offerer.starknetAddress,
              card.tokenId,
              1,
              listing.price,
              card.voucherSigningData.salt,
              card.voucherSigningData.signature,
              listing.orderSigningData.salt,
              listing.orderSigningData.signature,
              offererPublicKey && !isOwnerDeployed ? getWalletConstructorCallData(offererPublicKey) : undefined
            )
          : rulesSdk.getOrderFulfillCall(
              offerer.starknetAddress,
              card.tokenId,
              1,
              listing.price,
              listing.orderSigningData.salt,
              listing.orderSigningData.signature
            )
      }),
    ])

    setSigning(true)
  }, [cardListings?.length, parsedTotalPrice, getWalletConstructorCallData])

  // on modal status update
  useEffect(() => {
    if (isOpen) {
      resetStarknetTx()
      cleanOperations()
    }
  }, [isOpen])

  if (!currentUser || !address) return null

  return (
    <ClassicModal onDismiss={toggleOfferModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleOfferModal} title={signing ? undefined : t`Sweep floor`} />

        <ModalBody>
          <StarknetSigner action={'offerAcceptance'}>
            <Column gap={'32'}>
              {loading ? (
                <PaginationSpinner loading />
              ) : (
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
              )}

              <Slider
                value={itemsCount}
                min={MIN_ITEMS_COUNT}
                max={MAX_ITEMS_COUNT}
                onSlidingChange={setItemsCount}
                onInputChange={setAndDebounceItemsCount}
                onSliderRelease={debounceItemsCount}
                unit={t`Cards`}
              />

              <PrimaryButton onClick={handleConfirmation} disabled={loading} large>
                {loading ? (
                  <Trans>Loading</Trans>
                ) : (
                  <Trans>
                    Buy - {+parsedTotalPrice.toFixed(6)} ETH ({weiAmountToEURValue(parsedTotalPrice) ?? 0}€)
                  </Trans>
                )}
              </PrimaryButton>
            </Column>
          </StarknetSigner>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
