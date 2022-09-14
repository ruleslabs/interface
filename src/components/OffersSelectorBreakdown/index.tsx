import { useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'
import { useQuery, gql } from '@apollo/client'

import { TYPE } from '@/styles/theme'
import Row from '@/components/Row'
import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import AcceptOfferModal from '@/components/AcceptOfferModal'
import { useAcceptOfferModalToggle } from '@/state/application/hooks'

const CardModelImage = styled.img`
  width: 84px;
  border-radius: 5px;
`

const OFFER_QUERY = gql`
  query ($id: ID!) {
    offerById(id: $id) {
      price
    }
  }
`

interface OffersSelectorBreakdownProps {
  artistName: string
  season: number
  scarcityName: string
  scarcityMaxSupply: number
  pictureUrl: string
  serialNumber?: number
  offerId?: string
}

export default function OffersSelectorBreakdown({
  artistName,
  season,
  scarcityName,
  scarcityMaxSupply,
  pictureUrl,
  serialNumber,
  offerId,
}: CardSelectorBreakdownProps) {
  // modal
  const toggleAcceptOfferModal = useAcceptOfferModalToggle()

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // on successful offer acceptance
  const onSuccessfulOfferAcceptance = useCallback(() => {
    console.log('done')
  }, [])

  // query offer
  const offerQuery = useQuery(OFFER_QUERY, { variables: { id: offerId }, skip: !offerId })

  const offer = offerQuery?.data?.offerById

  // price
  const parsedPrice = useMemo(() => (offer?.price ? WeiAmount.fromRawAmount(offer.price) : null), [offer?.price])

  return (
    <>
      <Column gap={32}>
        <Row gap={12}>
          <CardModelImage src={pictureUrl} />
          <Column gap={8}>
            <TYPE.body fontWeight={700}>{artistName}</TYPE.body>
            <TYPE.body>
              <Trans>Season {season}</Trans>
            </TYPE.body>
            <Trans id={scarcityName} render={({ translation }) => <TYPE.body>{translation}</TYPE.body>} />
          </Column>
        </Row>
        <PrimaryButton onClick={toggleAcceptOfferModal} disabled={!offer} large>
          {parsedPrice
            ? t`Buy - ${parsedPrice.toSignificant(6)} ETH (${weiAmountToEURValue(parsedPrice) ?? 0}€)`
            : t`Select a card`}
        </PrimaryButton>
      </Column>

      {offer?.price && (
        <AcceptOfferModal
          artistName={artistName}
          scarcityName={scarcityName}
          scarcityMaxSupply={scarcityMaxSupply}
          season={season}
          serialNumber={serialNumber}
          pictureUrl={pictureUrl}
          price={offer.price}
          onSuccess={onSuccessfulOfferAcceptance}
        />
      )}
    </>
  )
}
