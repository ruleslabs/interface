import 'moment/locale/fr'

import React, { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useLazyQuery, gql } from '@apollo/client'
import { ScarcityName, WeiAmount } from '@rulesorg/sdk-core'
import moment from 'moment'

import { TYPE } from '@/styles/theme'
import { useSearchOffers } from '@/state/search/hooks'
import { PaginationSpinner } from '@/components/Spinner'
import Card from '@/components/Card'
import Link from '@/components/Link'
import Row, { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
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
`

const CardImage = styled.img`
  height: 156px;
  border-radius: 4.44%/3.17%;
`

const InfosWrapper = styled(Column)`
  flex: 1;
`

const ProfileWrapper = styled(RowCenter)`
  gap: 8px;
  margin-top: auto;
  margin-left: auto;
`

const AvatarImage = styled.img`
  border-radius: 50%;
  width: 46px;
  height: 46px;
`

interface MemoizedOfferCardProps {
  innerRef?: (node: any) => void
  cardId: string
  cardModel: any
  user: any
  serialNumber: number
  price: string
  timestamp: string
}

const MemoizedOfferCardPropsEqualityCheck = (prevProps: MemoizedOfferCardProps, nextProps: MemoizedOfferCardProps) =>
  prevProps.cardId === nextProps.cardId

const MemoizedOfferCard = React.memo(function OfferCards({
  innerRef,
  cardModel,
  user,
  serialNumber,
  price,
  timestamp,
}: TransactionRowProps) {
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
        h: '1 hour',
        hh: '%d hours',
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
        h: '1 heure',
        hh: '%d heures',
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

  return (
    <OfferCard>
      <Row gap={16} ref={innerRef}>
        <Link href={`/card/${cardModel.slug}/${serialNumber}`}>
          <CardImage src={cardModel?.pictureUrl} />
        </Link>

        <InfosWrapper gap={12}>
          <Link href={`/card/${cardModel.slug}/${serialNumber}`}>
            <TYPE.large>{cardModel.artist.displayName}</TYPE.large>
          </Link>

          <TYPE.body spanColor="text2">
            #{serialNumber}
            <span>
              {' '}
              /{cardModel.scarcity.maxSupply}
              {cardModel.scarcity.name === ScarcityName[0] && '+'}
            </span>
          </TYPE.body>

          <TYPE.body spanColor="text2">
            {parsedPriced.toSignificant(4)} ETH
            <span> {weiAmountToEURValue(parsedPriced)}€</span>
          </TYPE.body>

          <ProfileWrapper>
            <Column alignItems="end">
              <Link href={`/user/${user.slug}`}>
                <TYPE.body clickable>{user.username}</TYPE.body>
              </Link>

              <TYPE.body color="text2">{offerAge}</TYPE.body>
            </Column>

            <AvatarImage src={user.profile.pictureUrl} />
          </ProfileWrapper>
        </InfosWrapper>
      </Row>
    </OfferCard>
  )
},
MemoizedOfferCardPropsEqualityCheck)

export default function LastOffers() {
  // tables
  const [usersTable, setUsersTable] = useState<{ [key: string]: any }>({})
  const [cardModelsTable, setCardModelsTable] = useState<{ [key: string]: any }>({})

  // query offers data
  const onOffersQueryCompleted = useCallback(
    (data: any) => {
      setUsersTable({
        ...usersTable,
        ...data.usersByStarknetAddresses.reduce<{ [key: string]: any }>((acc, user) => {
          acc[user.starknetWallet.address] = user
          return acc
        }, {}),
      })

      setCardModelsTable({
        ...cardModelsTable,
        ...data.cardModelsByIds.reduce<{ [key: string]: any }>((acc, cardModel) => {
          acc[cardModel.id] = cardModel
          return acc
        }, {}),
      })
    },
    [Object.keys(usersTable).length, Object.keys(cardModelsTable).length]
  )
  const [queryOffersData, offersQuery] = useLazyQuery(OFFERS_QUERY, { onCompleted: onOffersQueryCompleted })

  // search offers
  const onPageFetch = useCallback((hits: any) => {
    queryOffersData({
      variables: {
        cardModelIds: hits.map((hit) => hit.cardModelId),
        starknetAddresses: hits.map((hit) => hit.sellerStarknetAddress),
      },
    })
  })
  const offersSearch = useSearchOffers({ sortingKey: 'txIndexDesc', onPageFetch })

  // loading
  const isLoading = offersSearch.loading || offersQuery.loading

  // infinite scroll
  const lastTxRef = useInfiniteScroll(offersSearch.nextPage, isLoading)

  return (
    <>
      <StyledLastOffers>
        {offersSearch.hits
          ?.filter((hit) => cardModelsTable[hit.cardModelId] && usersTable[hit.sellerStarknetAddress])
          ?.map((hit, index) => (
            <MemoizedOfferCard
              key={hit.cardId}
              innerRef={index + 1 === offersSearch.hits.length ? lastTxRef : undefined}
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
