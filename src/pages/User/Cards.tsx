import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { useLazyQuery, useQuery, gql } from '@apollo/client'
import { t, Trans, Plural } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import DefaultLayout from 'src/components/Layout'
import ProfileLayout from 'src/components/Layout/Profile'
import Row, { RowBetween, RowCenter } from 'src/components/Row'
import Section from 'src/components/Section'
import { useSearchCards, CardsSortingKey } from 'src/state/search/hooks'
import { TYPE } from 'src/styles/theme'
import EmptyTab, { EmptyCardsTabOfCurrentUser } from 'src/components/EmptyTab'
import SortButton, { SortsData } from 'src/components/Button/SortButton'
import { PrimaryButton, SecondaryButton } from 'src/components/Button'
import CreateOfferModal from 'src/components/MarketplaceModal/CreateOffer'
import { useCreateOfferModalToggle, useOfferModalToggle } from 'src/state/application/hooks'
import GiftModal from 'src/components/GiftModal'
import useSearchedUser from 'src/hooks/useSearchedUser'
import { NftCard } from 'src/components/nft/Card'
import useAssetsSelection from 'src/hooks/useAssetsSelection'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import CollectionNfts from 'src/components/nft/Collection/CollectionNfts'

import { ReactComponent as Present } from 'src/images/present.svg'

// css

const CARDS_QUERY = gql`
  query ($ids: [ID!]!) {
    cardsByIds(ids: $ids) {
      id
      slug
      serialNumber
      currentOffer {
        price
      }
      starknetTokenId
      cardModel {
        slug
        pictureUrl(derivative: "width=1024")
        videoUrl
        season
        artist {
          displayName
        }
        scarcity {
          name
        }
      }
    }
  }
`

const CARDS_IN_DELIVERY_QUERY = gql`
  query ($userId: ID!) {
    cardsInDeliveryForUser(userId: $userId) {
      id
      slug
      serialNumber
      starknetTokenId
      cardModel {
        slug
        pictureUrl(derivative: "width=1024")
        season
        artist {
          displayName
        }
      }
    }
  }
`

const StyledPresent = styled(Present)`
  width: 16px;
  fill: ${({ theme }) => theme.text1};
`

const StickyWrapper = styled.div`
  margin: 16px 0;
  position: sticky;
  z-index: 1;
  top: ${({ theme }) => theme.size.headerHeight}px;
  background: ${({ theme }) => theme.bg1};
  box-shadow: 0 4px 4px ${({ theme }) => theme.bg1}80;

  ${({ theme }) => theme.media.medium`
    top: ${theme.size.headerHeightMedium}px;
  `}
`

const GridHeader = styled(RowBetween)`
  align-items: center;
  padding: 12px 16px;
`

const SelectionButtonWrapper = styled(RowCenter)`
  gap: 12px;

  ${({ theme }) => theme.media.extraSmall`
    flex-direction: column;
    gap: 6px
  `}
`

const SelectionButton = styled(SecondaryButton)`
  padding: 4px 12px;
  min-height: unset;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 400;
  background: ${({ theme }) => theme.bg3}80;

  &:hover {
    background: ${({ theme }) => theme.bg3};
  }
`

const SelectedCardsActionWrapper = styled(Row)<{ active: boolean }>`
  position: fixed;
  left: 16px;
  right: 16px;
  justify-content: center;
  z-index: 1;

  ${({ active }) =>
    active
      ? `
        bottom: 24px;
        transition: bottom 300ms cubic-bezier(0.3, 0.1, 0.5, 1.6);
      `
      : `
        bottom: -100px;
        transition: bottom 500ms cubic-bezier(1, -1.1, 0.5, 0.8);
      `}
`

const SelectedCardsAction = styled(RowCenter)`
  background: ${({ theme }) => theme.bg2};
  gap: 16px;
  padding: 8px 8px 8px 16px;
  border-radius: 6px;
  box-shadow: 0 0 8px ${({ theme }) => theme.black}80;

  ${({ theme }) => theme.media.small`
    flex-direction: column;
    padding: 12px;
  `}
`

const SelectedCardsButtonsWrapper = styled(Row)`
  gap: 8px;

  & > * {
    flex: 1;
    flex-basis: auto;
  }

  ${({ theme }) => theme.media.small`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  `}
`

const sortsData: SortsData<CardsSortingKey> = [
  { name: 'Newest', key: 'txIndexDesc', desc: true },
  { name: 'Oldest', key: 'txIndexAsc', desc: false },
  { name: 'Low serial', key: 'serialAsc', desc: false },
  { name: 'High serial', key: 'serialDesc', desc: true },
  { name: 'Price: low to high', key: 'lastPriceAsc', desc: false },
  { name: 'Price: high to low', key: 'lastPriceDesc', desc: true },
  { name: 'Alphabetical A-Z', key: 'artistAsc', desc: false },
  { name: 'Alphabetical Z-A', key: 'artistDesc', desc: true },
]

function UserCards() {
  const [deliveredCardsCount, setDeliveredCardsCount] = useState(0)
  const [cards, setCards] = useState<any[]>([])
  const [sortIndex, setSortIndex] = useState(0)

  // current user
  const [user] = useSearchedUser()

  // modals
  const toggleCreateOfferModal = useCreateOfferModalToggle()
  const toggleOfferModal = useOfferModalToggle()

  // query cards data
  const onCardsQueryCompleted = useCallback((data: any) => {
    const cards = (data.cardsByIds ?? []).map((card: any) => {
      const price = card.currentOffer?.price
      const parsedPrice = price ? WeiAmount.fromRawAmount(price) : undefined

      return {
        ...card,
        parsedPrice,
      }
    })

    setCards((state) => state.concat(cards))
  }, [])
  const [queryCardsData, cardsQuery] = useLazyQuery(CARDS_QUERY, {
    onCompleted: onCardsQueryCompleted,
    fetchPolicy: 'cache-and-network',
  })

  // query cards in delivery data
  const cardsInDeliveryQuery = useQuery(CARDS_IN_DELIVERY_QUERY, { variables: { userId: user?.id }, skip: !user?.id })
  const cardsInDelivery = cardsInDeliveryQuery.data?.cardsInDeliveryForUser ?? []

  // cards count
  const cardsCount = useMemo(
    () => deliveredCardsCount + cardsInDelivery.length,
    [cardsInDelivery.length, deliveredCardsCount]
  )

  // search cards
  const onPageFetched = useCallback(
    (hits, { pageNumber, totalHitsCount }) => {
      if (!pageNumber) setCards([])

      queryCardsData({ variables: { ids: hits.map((hit: any) => hit.objectID) } })

      setDeliveredCardsCount(totalHitsCount)
    },
    [queryCardsData]
  )
  const cardsSearch = useSearchCards({
    facets: { ownerStarknetAddress: user?.address },
    sortingKey: sortsData[sortIndex].key,
    skip: !user?.address,
    onPageFetched,
  })

  // loading
  const isLoading = cardsSearch.loading || cardsQuery.loading || cardsInDelivery.loading

  // cards selection
  const { selectedTokenIds, selectionModeEnabled, toggleSelectionMode } = useAssetsSelection()

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  const cardsInDeliveryComponent = useMemo(
    () =>
      cardsInDelivery.map((card: any) => (
        <NftCard
          key={card.slug}
          asset={{
            animationUrl: card.cardModel.videoUrl,
            imageUrl: card.cardModel.pictureUrl,
            tokenId: card.starknetTokenId,
            scarcity: card.cardModel.scarcity.name,
          }}
          display={{
            primaryInfo: card.cardModel.artist.displayName,
            secondaryInfo: `#${card.serialNumber}`,
            status: 'inDelivery',
          }}
        />
      )),
    [cardsInDelivery.length]
  )

  const cardsComponents = useMemo(
    () =>
      cards.map((card: any) => (
        <NftCard
          key={card.slug}
          asset={{
            animationUrl: card.cardModel.videoUrl,
            imageUrl: card.cardModel.pictureUrl,
            tokenId: card.starknetTokenId,
            scarcity: card.cardModel.scarcity.name,
          }}
          display={{
            primaryInfo: card.cardModel.artist.displayName,
            secondaryInfo: `#${card.serialNumber}`,
            subtitle: card.parsedPrice
              ? `${card.parsedPrice.toSignificant(6)} ETH (€${weiAmountToEURValue(card.parsedPrice)})`
              : undefined,
            status: card.parsedPrice ? 'onSale' : undefined,
          }}
        />
      )),
    [cards]
  )

  if (!user) return null

  return (
    <>
      <StickyWrapper>
        {cardsCount > 0 && (
          <Section marginBottom="0px">
            <GridHeader>
              <SelectionButtonWrapper>
                <TYPE.body>
                  <Plural value={cardsCount} _1="{cardsCount} card" other="{cardsCount} cards" />
                </TYPE.body>

                {user.isCurrentUser && (
                  <SelectionButton onClick={toggleSelectionMode}>
                    {selectionModeEnabled ? t`Cancel` : t`Select`}
                  </SelectionButton>
                )}
              </SelectionButtonWrapper>

              <SortButton sortsData={sortsData} onChange={setSortIndex} sortIndex={sortIndex} />
            </GridHeader>
          </Section>
        )}
      </StickyWrapper>

      <Section>
        <CollectionNfts
          next={cardsSearch.nextPage ?? (() => {})}
          hasNext={cardsSearch.hasNext}
          dataLength={(cards.length ?? 0) + (cardsInDelivery.length ?? 0)}
        >
          {cardsInDeliveryComponent}
          {cardsComponents}
        </CollectionNfts>

        {!isLoading &&
          !cardsCount &&
          (user.isCurrentUser ? <EmptyCardsTabOfCurrentUser /> : <EmptyTab emptyText={t`No cards`} />)}
      </Section>

      <SelectedCardsActionWrapper active={selectedTokenIds.length > 0}>
        <SelectedCardsAction>
          <TYPE.body>
            <Plural value={selectedTokenIds.length} _1="{0} card selected" other="{0} cards selected" />
          </TYPE.body>

          <SelectedCardsButtonsWrapper>
            <PrimaryButton onClick={toggleCreateOfferModal}>
              <Trans>Place for Sale</Trans>
            </PrimaryButton>

            <SecondaryButton onClick={toggleOfferModal}>
              <RowCenter justify="center" gap={4}>
                <StyledPresent />
                <Trans>Gift</Trans>
              </RowCenter>
            </SecondaryButton>
          </SelectedCardsButtonsWrapper>
        </SelectedCardsAction>
      </SelectedCardsActionWrapper>

      <CreateOfferModal tokenIds={selectedTokenIds} />
      <GiftModal tokenIds={selectedTokenIds} />
    </>
  )
}

UserCards.withLayout = () => (
  <DefaultLayout>
    <ProfileLayout>
      <UserCards />
    </ProfileLayout>
  </DefaultLayout>
)

export default UserCards
