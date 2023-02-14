import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useLazyQuery, gql } from '@apollo/client'
import { ScarcityName, WeiAmount } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { useSearchTransfers } from '@/state/search/hooks'
import { PaginationSpinner } from '@/components/Spinner'
import Card from '@/components/CardModel3D/Card'
import Link from '@/components/Link'
import { ColumnCenter } from '@/components/Column'
import Row from '@/components/Row'
import { NULL_PRICE } from '@/constants/misc'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import Avatar from '@/components/Avatar'

import LongArrow from '@/images/long-arrow.svg'

const TRANSFERS_QUERY = gql`
  query ($cardModelId: ID!, $starknetAddresses: [String!]!) {
    cardModelsByIds(ids: [$cardModelId]) {
      id
      slug
      videoUrl
      pictureUrl(derivative: "width=1024")
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

const StyledLive = styled.div`
  video {
    width: 100%;
  }
`

const TradePlaceholder = styled(ColumnCenter)`
  gap: 2px;
  width: 100%;
  border: solid 1px ${({ theme }) => theme.text2};
  border-radius: 2px;
  padding: 4px 0;

  div {
    color: ${({ theme }) => theme.text2};
  }

  span {
    font-weight: 700;
  }
`

const TradeUsers = styled(Row)`
  width: 100%;
  justify-content: space-around;
`

const UserWrapper = styled.div`
  flex: 1;

  div {
    margin: 8px auto 0;
  }
`

const StyledAvatar = styled(Avatar)`
  width: 48px;
  height: 48px;
  margin: 0 auto;
  display: block;
`

const AnimatedLongArrow = styled(LongArrow)`
  height: 14px;
  margin-top: 17px;
  animation: move 2s linear infinite;

  @keyframes move {
    0% {
      transform: translatey(0px);
    }

    15% {
      transform: translatex(8px);
    }

    30% {
      transform: translatex(0px);
    }

    45% {
      transform: translatex(8px);
    }

    60% {
      transform: translatex(0px);
    }
  }
`

export default function Live() {
  // hit
  const [transferHit, setTransferHit] = useState<any | null>(null)

  // tables
  const [fromUser, setFromUser] = useState<any | null>(null)
  const [toUser, setToUser] = useState<any | null>(null)
  const [cardModel, setCardModel] = useState<any | null>(null)

  // query offers data
  const onTransfersQueryCompleted = useCallback(
    (data: any) => {
      for (const user of data.usersByStarknetAddresses) {
        if (user.starknetWallet.address === transferHit.fromStarknetAddress) setFromUser(user)
        else if (user.starknetWallet.address === transferHit.toStarknetAddress) setToUser(user)
      }

      setCardModel(data.cardModelsByIds[0] ?? null)
    },
    [!!transferHit]
  )
  const [queryTransferData, transferQuery] = useLazyQuery(TRANSFERS_QUERY, { onCompleted: onTransfersQueryCompleted })

  // search transfer
  const onPageFetched = useCallback(
    (hits: any) => {
      setTransferHit(hits[0])
      queryTransferData({
        variables: {
          cardModelId: hits[0].cardModelId,
          starknetAddresses: [hits[0].fromStarknetAddress, hits[0].toStarknetAddress],
        },
      })
    },
    [queryTransferData]
  )
  const transferSearch = useSearchTransfers({
    sortingKey: 'txIndexDesc',
    hitsPerPage: 1,
    noMinting: true,
    onPageFetched,
  })

  // parsed price
  const parsedPrice = useMemo(
    () => (transferHit?.price ? WeiAmount.fromRawAmount(`0x${transferHit.price}`) : null),
    [transferHit?.price]
  )

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // loading
  const isLoading = transferSearch.loading || transferQuery.loading

  return (
    <StyledLive>
      {transferHit && cardModel && fromUser && toUser && parsedPrice && (
        <ColumnCenter gap={16}>
          <Card
            videoUrl={cardModel.videoUrl}
            pictureUrl={cardModel.pictureUrl}
            scarcityName={cardModel.scarcity.name}
            revealed
          />

          <TradePlaceholder>
            <Link href={`/card/${cardModel.slug}/${transferHit.serialNumber}`}>
              <TYPE.body clickable>
                {cardModel.artist.displayName} #{transferHit.serialNumber} /{cardModel.scarcity.maxSupply}
                {cardModel.scarcity.name === ScarcityName[0] && '+'}
              </TYPE.body>
            </Link>

            <TYPE.body>
              {transferHit.price === NULL_PRICE ? (
                <Trans>Card offered</Trans>
              ) : (
                <>
                  <span>{parsedPrice?.toSignificant(6)} ETH</span> ({weiAmountToEURValue(parsedPrice)}€)
                </>
              )}
            </TYPE.body>
          </TradePlaceholder>

          <TradeUsers justify="space-around">
            <UserWrapper>
              <Link href={`/user/${fromUser.slug}`}>
                <StyledAvatar src={fromUser.profile.pictureUrl} fallbackSrc={fromUser.profile.fallbackUrl} />
              </Link>

              <Link href={`/user/${fromUser.slug}`}>
                <TYPE.body clickable>{fromUser.username}</TYPE.body>
              </Link>
            </UserWrapper>

            <AnimatedLongArrow />

            <UserWrapper>
              <Link href={`/user/${toUser.slug}`}>
                <StyledAvatar src={toUser.profile.pictureUrl} fallbackSrc={toUser.profile.fallbackUrl} />
              </Link>

              <Link href={`/user/${toUser.slug}`}>
                <TYPE.body clickable>{toUser.username}</TYPE.body>
              </Link>
            </UserWrapper>
          </TradeUsers>
        </ColumnCenter>
      )}

      <PaginationSpinner loading={isLoading} />
    </StyledLive>
  )
}
