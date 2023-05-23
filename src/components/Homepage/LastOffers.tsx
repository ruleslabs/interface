import 'moment/locale/fr'

import React, { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useLazyQuery, gql } from '@apollo/client'
import { WeiAmount, constants } from '@rulesorg/sdk-core'
import moment from 'moment'

import shortenUsername from '@/utils/shortenUsername'
import { TYPE } from '@/styles/theme'
import { useSearchOffers } from '@/state/search/hooks'
import { PaginationSpinner } from '@/components/Spinner'
import Card from '@/components/Card'
import Link from '@/components/Link'
import Row, { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import Avatar from '@/components/Avatar'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import { useActiveLocale } from '@/hooks/useActiveLocale'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'

const OFFERS_QUERY = gql`
  query ($cardModelIds: [ID!]!, $starknetAddresses: [String!]!) {
    cardModelsByIds(ids: $cardModelIds) {
      id
      slug
      pictureUrl(derivative: "width=512")
      scarcity {
        maxSupply
        name
      }
      artist {
        displayName
      }
    }
    usersByStarknetAddresses(starknetAddresses: $starknetAddresses) {
      username
      slug
      profile {
        pictureUrl(derivative: "width=128")
        fallbackUrl(derivative: "width=128")
      }
      starknetWallet {
        address
      }
    }
  }
`

const StyledLastOffers = styled(Row)`
  flex-wrap: wrap;
  gap: 32px;
`

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

interface OfferCardProps {
  innerRef?: (node: any) => void
  cardId: string
  cardModel: any
  user: any
  serialNumber: number
  price: string
  timestamp: string
}

const MemoizedOfferCardPropsEqualityCheck = (prevProps: OfferCardProps, nextProps: OfferCardProps) =>
  prevProps.cardId === nextProps.cardId

const MemoizedOfferCard = React.memo(function OfferCards({
  innerRef,
  cardModel,
  user,
  serialNumber,
  price,
  timestamp,
}: OfferCardProps) {
  // parsed price
  const parsedPriced = useMemo(() => WeiAmount.fromRawAmount(`0x${price}`), [price])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // get locale
  const locale = useActiveLocale()

  // offer age
  const offerAge = useMemo(() => {
    if (!timestamp) return

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

    return moment(timestamp).locale(locale).fromNow()
  }, [timestamp, locale])

  // shorten username
  const shortArtistName = useMemo(
    () => (cardModel?.artist.displayName ? shortenUsername(cardModel?.artist.displayName) : null),
    [cardModel?.artist.displayName]
  )

  return (
    <OfferCard>
      <Row gap={16} ref={innerRef}>
        <Link href={`/card/${cardModel.slug}/${serialNumber}`}>
          <CardImage src={cardModel?.pictureUrl} />
        </Link>

        <InfosWrapper gap={12}>
          <Link href={`/card/${cardModel.slug}/${serialNumber}`}>
            <ArtistName clickable>{cardModel.artist.displayName}</ArtistName>
            <ShortArtistName clickable>{shortArtistName}</ShortArtistName>
          </Link>

          <TYPE.body spanColor="text2">
            #{serialNumber}
            <span>
              {' '}
              /{cardModel.scarcity.maxSupply}
              {cardModel.scarcity.name === constants.ScarcityName[0] && '+'}
            </span>
          </TYPE.body>

          <TYPE.body spanColor="text2">
            {parsedPriced.toSignificant(4)} ETH
            <span> {weiAmountToEURValue(parsedPriced)}€</span>
          </TYPE.body>

          <ProfileWrapper>
            <Column alignItems="end" gap={2}>
              <Link href={`/user/${user.slug}`}>
                <TYPE.body clickable>{user.username}</TYPE.body>
              </Link>

              <TYPE.body color="text2">{offerAge}</TYPE.body>
            </Column>

            <Link href={`/user/${user.slug}`}>
              <StyledAvatar src={user.profile.pictureUrl} fallbackSrc={user.profile.fallbackUrl} />
            </Link>
          </ProfileWrapper>
        </InfosWrapper>
      </Row>
    </OfferCard>
  )
},
MemoizedOfferCardPropsEqualityCheck)

export default function LastOffers() {
  // hits
  const [offersHits, setOffersHits] = useState<any[]>([])
  const [pendingHits, setPendingHits] = useState<any[]>([])

  // tables
  const [usersTable, setUsersTable] = useState<{ [key: string]: any }>({})
  const [cardModelsTable, setCardModelsTable] = useState<{ [key: string]: any }>({})

  // query offers data
  const onOffersQueryCompleted = useCallback(
    (data: any) => {
      setUsersTable({
        ...usersTable,
        ...(data.usersByStarknetAddresses as any[]).reduce<{ [key: string]: any }>((acc, user) => {
          acc[user.starknetWallet.address] = user
          return acc
        }, {}),
      })

      setCardModelsTable({
        ...cardModelsTable,
        ...(data.cardModelsByIds as any[]).reduce<{ [key: string]: any }>((acc, cardModel) => {
          acc[cardModel.id] = cardModel
          return acc
        }, {}),
      })

      setOffersHits(offersHits.concat(pendingHits))
    },
    [Object.keys(usersTable).length, Object.keys(cardModelsTable).length, offersHits.length, pendingHits]
  )
  const [queryOffersData, offersQuery] = useLazyQuery(OFFERS_QUERY, { onCompleted: onOffersQueryCompleted })

  // search offers
  const onPageFetched = useCallback(
    (hits: any) => {
      queryOffersData({
        variables: {
          cardModelIds: hits.map((hit: any) => hit.cardModelId),
          starknetAddresses: hits.map((hit: any) => hit.sellerStarknetAddress),
        },
      })
      setPendingHits(hits)
    },
    [queryOffersData]
  )
  const offersSearch = useSearchOffers({ sortingKey: 'txIndexDesc', onPageFetched })

  // loading
  const isLoading = offersSearch.loading || offersQuery.loading

  // infinite scroll
  const lastTxRef = useInfiniteScroll({ nextPage: offersSearch.nextPage, loading: isLoading })

  return (
    <>
      <StyledLastOffers>
        {offersHits
          .filter((hit) => cardModelsTable[hit.cardModelId] && usersTable[hit.sellerStarknetAddress])
          .map((hit, index) => (
            <MemoizedOfferCard
              key={hit.cardId}
              innerRef={index + 1 === offersHits.length ? lastTxRef : undefined}
              cardId={hit.cardId}
              cardModel={cardModelsTable[hit.cardModelId]}
              user={usersTable[hit.sellerStarknetAddress]}
              serialNumber={hit.serialNumber}
              price={hit.price}
              timestamp={hit.date}
            />
          ))}
      </StyledLastOffers>

      <PaginationSpinner loading={isLoading} />
    </>
  )
}
