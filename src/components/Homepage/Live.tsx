import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { WeiAmount, constants } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import { TYPE } from 'src/styles/theme'
import { PaginationSpinner } from 'src/components/Spinner'
import Card from 'src/components/CardModel3D/Card'
import Link from 'src/components/Link'
import { ColumnCenter } from 'src/components/Column'
import Row from 'src/components/Row'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import Avatar from 'src/components/Avatar'

import { ReactComponent as LongArrow } from 'src/images/long-arrow.svg'
import { useLastSaleOrGiftCardTransferQuery } from 'src/graphql/data/__generated__/types-and-hooks'

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
  // live query
  const { data, loading } = useLastSaleOrGiftCardTransferQuery()
  const cardTransfer = data?.lastSaleOrGiftCardTransfer

  // parsed price
  const parsedPrice = useMemo(
    () => (cardTransfer?.price ? WeiAmount.fromRawAmount(cardTransfer.price) : null),
    [cardTransfer?.price]
  )

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  return (
    <StyledLive>
      {cardTransfer && (
        <ColumnCenter gap={16}>
          <Card
            videoUrl={cardTransfer.cardModel.videoUrl}
            pictureUrl={cardTransfer.cardModel.pictureUrl}
            scarcityName={cardTransfer.cardModel.scarcity.name}
            revealed
          />

          <TradePlaceholder>
            <Link href={`/card/${cardTransfer.cardModel.slug}/${cardTransfer.card.serialNumber}`}>
              <TYPE.body clickable>
                {cardTransfer.cardModel.artistName} #{cardTransfer.card.serialNumber} /
                {cardTransfer.cardModel.scarcity.maxSupply}
                {cardTransfer.cardModel.scarcity.name === constants.Seasons[cardTransfer.cardModel.season][0].name &&
                  '+'}
              </TYPE.body>
            </Link>

            <TYPE.body>
              {parsedPrice ? (
                <>
                  <span>{parsedPrice?.toSignificant(6)} ETH</span> ({weiAmountToEURValue(parsedPrice)}€)
                </>
              ) : (
                <Trans>Card offered</Trans>
              )}
            </TYPE.body>
          </TradePlaceholder>

          <TradeUsers justify="space-around">
            <UserWrapper>
              <Link href={`/user/${cardTransfer.fromOwner.user?.slug}`}>
                <StyledAvatar
                  src={cardTransfer.fromOwner.user?.profile.pictureUrl ?? ''}
                  fallbackSrc={cardTransfer.fromOwner.user?.profile.fallbackUrl ?? ''}
                />
              </Link>

              <Link href={`/user/${cardTransfer.fromOwner.user?.slug}`}>
                <TYPE.body clickable>{cardTransfer.fromOwner.user?.username ?? ''}</TYPE.body>
              </Link>
            </UserWrapper>

            <AnimatedLongArrow />

            <UserWrapper>
              <Link href={`/user/${cardTransfer.toOwner.user?.slug}`}>
                <StyledAvatar
                  src={cardTransfer.toOwner.user?.profile.pictureUrl ?? ''}
                  fallbackSrc={cardTransfer.toOwner.user?.profile.fallbackUrl ?? ''}
                />
              </Link>

              <Link href={`/user/${cardTransfer.toOwner.user?.slug}`}>
                <TYPE.body clickable>{cardTransfer.toOwner.user?.username}</TYPE.body>
              </Link>
            </UserWrapper>
          </TradeUsers>
        </ColumnCenter>
      )}

      <PaginationSpinner loading={loading} />
    </StyledLive>
  )
}
