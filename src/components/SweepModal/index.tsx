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
import { useListingsToSweep, useMaxListedSerialNumber } from 'src/graphql/data/CardListings'
import { Column } from 'src/theme/components/Flex'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import { PrimaryButton } from '../Button'
import Slider from '../Slider'
import CardBreakdown from '../MarketplaceModal/CardBreakdown'
import { useGetWalletConstructorCallData } from 'src/hooks/useCreateWallet'
import { Operation } from 'src/types/common'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { PaginationSpinner } from '../Spinner'
import { useETHBalance } from 'src/state/wallet/hooks'
import { TYPE } from 'src/styles/theme'

const MAX_CARD_MODEL_BREAKDOWNS_WITHOUT_SCROLLING = 2

const MIN_MAX_SERIAL = 1

const MIN_ITEMS_COUNT = 1
const MAX_ITEMS_COUNT = 80

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
  const [maxSerial, setMaxSerial] = useState(MIN_MAX_SERIAL)
  const [debouncedMaxSerial, setDebouncedMaxSerial] = useState(MIN_MAX_SERIAL)
  const [itemsCount, setItemsCount] = useState(MIN_ITEMS_COUNT)
  const [debouncedItemsCount, setDebouncedItemsCount] = useState(MIN_ITEMS_COUNT)

  // current user
  const { currentUser } = useCurrentUser()

  // starknet account
  const { address } = useRulesAccount()

  // modal
  const isOpen = useModalOpened(ApplicationModal.SWEEP)
  const toggleOfferModal = useSweepModalToggle()

  // get max serial listed
  const { data: absoluteMaxSerial, ...maxSerialQuery } = useMaxListedSerialNumber(!isOpen)

  useEffect(() => {
    if (!absoluteMaxSerial) return

    setMaxSerial(absoluteMaxSerial)
    setDebouncedMaxSerial(absoluteMaxSerial)
  }, [absoluteMaxSerial])

  // get listings
  const { data: cardListings, ...listingsQuery } = useListingsToSweep(
    debouncedMaxSerial,
    debouncedItemsCount,
    !absoluteMaxSerial // skip
  )

  // card models map
  const cardModelsMap = useMemo(
    () =>
      (cardListings ?? []).reduce<any>((acc, { card }) => {
        acc[card.cardModel.slug] ??= {
          pictureUrl: card.cardModel.pictureUrl,
          artistName: card.cardModel.artistName,
          season: card.cardModel.season,
          scarcityName: card.cardModel.scarcity.name,
          serialNumbers: [],
        }

        acc[card.cardModel.slug].serialNumbers.push(card.serialNumber)

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

  // maxSerial
  const debounceMaxSerial = useCallback(() => setDebouncedMaxSerial(maxSerial), [maxSerial])
  const setAndDebounceMaxSerial = useCallback((value: number) => {
    setMaxSerial(value)
    setDebouncedMaxSerial(value)
  }, [])

  // itemsCount
  const debounceItemsCount = useCallback(() => setDebouncedItemsCount(itemsCount), [itemsCount])
  const setAndDebounceItemsCount = useCallback((value: number) => {
    setItemsCount(value)
    setDebouncedItemsCount(value)
  }, [])

  // can pay for card
  const balance = useETHBalance(address)
  const canPayForCard = useMemo(() => {
    if (!balance) return true // we avoid displaying error message if not necessary

    return !balance.lessThan(parsedTotalPrice)
  }, [balance, parsedTotalPrice])

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
        const offererPublicKey = offerer.user?.starknetWallet.currentPublicKey
        const isOwnerDeployed = offerer.user?.starknetWallet.deployed ?? true

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

  // loading
  const loading = maxSerialQuery.loading || listingsQuery.loading

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
                value={maxSerial}
                min={MIN_MAX_SERIAL}
                max={absoluteMaxSerial ?? MIN_MAX_SERIAL + 1}
                onSlidingChange={setMaxSerial}
                onInputChange={setAndDebounceMaxSerial}
                onSliderRelease={debounceMaxSerial}
                unit={t`Max serial`}
                unitWidth={100}
                loading={!absoluteMaxSerial}
              />

              <Slider
                value={itemsCount}
                min={MIN_ITEMS_COUNT}
                max={MAX_ITEMS_COUNT}
                onSlidingChange={setItemsCount}
                onInputChange={setAndDebounceItemsCount}
                onSliderRelease={debounceItemsCount}
                unit={t`Cards`}
                unitWidth={100}
              />

              <Column gap={'8'}>
                {!canPayForCard && balance && (
                  <TYPE.body color="error">
                    <Trans>Insufficient ETH balance</Trans>
                  </TYPE.body>
                )}

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
            </Column>
          </StarknetSigner>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
