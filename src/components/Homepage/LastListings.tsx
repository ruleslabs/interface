import 'moment/locale/fr'

import React, { useMemo } from 'react'
import styled from 'styled-components/macro'
import { WeiAmount, constants } from '@rulesorg/sdk-core'
import moment from 'moment'

import shortenUsername from 'src/utils/shortenUsername'
import { TYPE } from 'src/styles/theme'
import { PaginationSpinner } from 'src/components/Spinner'
import Card from 'src/components/Card'
import Link from 'src/components/Link'
import Row, { RowCenter } from 'src/components/Row'
import Column from 'src/components/Column'
import Avatar from 'src/components/Avatar'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import { useActiveLocale } from 'src/hooks/useActiveLocale'
import { useCardListings } from 'src/graphql/data/CardListings'
import { CardListingsSortingType, SortingOption } from 'src/graphql/data/__generated__/types-and-hooks'
import * as styles from './LastListings.css'
import InfiniteScroll from 'react-infinite-scroll-component'

const OfferCard = styled(Card)`
  padding: 16px;
  position: relative;
  min-width: 400px;
  flex: 1;

  ${({ theme }) => theme.media.small`
    min-width: unset;
  `}
`

const CardImage = styled.img`
  height: 156px;
  border-radius: 4.7% / 3.35%;
`

const InfosWrapper = styled(Column)`
  flex: 1;
`

const ArtistName = styled(TYPE.large)`
  ${({ theme }) => theme.media.small`
    display: none;
  `}
`

const ShortArtistName = styled(TYPE.large)`
  display: none;

  ${({ theme }) => theme.media.small`
    display: block;
  `}
`

const ProfileWrapper = styled(RowCenter)`
  gap: 8px;
  margin-top: auto;
  margin-left: auto;
`

const StyledAvatar = styled(Avatar)`
  width: 46px;
  height: 46px;
  display: block;
`

export default function LastListings() {
  const {
    data: cardListings,
    hasNext,
    loadMore,
  } = useCardListings({
    sort: { type: CardListingsSortingType.Date, direction: SortingOption.Desc },
    filter: {},
  })

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // get locale
  const locale = useActiveLocale()

  const cardListingsComponents = useMemo(() => {
    if (!cardListings) return null

    moment.locale('en', {
      relativeTime: {
        past: '%s ago',
        s: '1 second',
        ss: '%s seconds',
        m: '1 min',
        mm: '%d min',
        h: '1h',
        hh: '%dh',
        d: '1 day',
        dd: '%d days',
      },
    })

    moment.locale('fr', {
      relativeTime: {
        past: 'il y a %s',
        s: '1 seconde',
        ss: '%s secondes',
        m: '1 min',
        mm: '%d min',
        h: '1h',
        hh: '%dh',
        d: '1 jour',
        dd: '%d jours',
      },
    })

    moment.relativeTimeThreshold('s', 60)
    moment.relativeTimeThreshold('m', 60)
    moment.relativeTimeThreshold('h', 24)
    moment.relativeTimeThreshold('d', 100_000_000) // any number big enough

    return cardListings.map((cardListing) => {
      const card = cardListing.card
      const cardModel = cardListing.cardModel
      const parsedPriced = WeiAmount.fromRawAmount(cardListing.price)
      const offerer = cardListing.offerer

      const offerAge = moment(cardListing.createdAt).locale(locale).fromNow()

      // shorten username
      const shortArtistName = shortenUsername(cardModel.artistName)

      return (
        <OfferCard key={cardListing.orderSigningData.salt}>
          <Row gap={16}>
            <Link href={`/card/${cardModel.slug}/${card.serialNumber}`}>
              <CardImage src={cardModel.imageUrl} />
            </Link>

            <InfosWrapper gap={12}>
              <Link href={`/card/${cardModel.slug}/${card.serialNumber}`}>
                <ArtistName clickable>{cardModel.artistName}</ArtistName>
                <ShortArtistName clickable>{shortArtistName}</ShortArtistName>
              </Link>

              <TYPE.body spanColor="text2">
                #{card.serialNumber}
                <span>
                  {' '}
                  /{cardModel.scarcityMaxSupply}
                  {cardModel.scarcityName === constants.Seasons[cardModel.season][0].name && '+'}
                </span>
              </TYPE.body>

              <TYPE.body spanColor="text2">
                {parsedPriced.toSignificant(4)} ETH
                <span> {weiAmountToEURValue(parsedPriced)}€</span>
              </TYPE.body>

              <ProfileWrapper>
                <Column alignItems="end" gap={2}>
                  <Link href={`/user/${offerer.profile.slug}`}>
                    <TYPE.body clickable>{offerer.profile.username}</TYPE.body>
                  </Link>

                  <TYPE.body color="text2">{offerAge}</TYPE.body>
                </Column>

                <Link href={`/user/${offerer.profile.slug}`}>
                  <StyledAvatar src={offerer.profile.imageUrl} fallbackSrc={offerer.profile.fallbackUrl} />
                </Link>
              </ProfileWrapper>
            </InfosWrapper>
          </Row>
        </OfferCard>
      )
    })
  }, [cardListings, locale, weiAmountToEURValue])

  return (
    <InfiniteScroll
      next={loadMore}
      hasMore={hasNext ?? false}
      dataLength={cardListings?.length ?? 0}
      loader={hasNext && <PaginationSpinner loading />}
      className={styles.listingsGrid}
    >
      {cardListingsComponents}
    </InfiniteScroll>
  )
}
