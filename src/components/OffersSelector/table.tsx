import { useRouter } from 'next/router'
import styled from 'styled-components'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Table from '@/components/Table'
import { RadioButton } from '@/components/Button'
import Caret from '@/components/Caret'
import Link from '@/components/Link'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'

const StyledTable = styled(Table)`
  margin-top: 22px;

  ${({ theme }) => theme.media.medium`
    thead td:last-child {
      display: none;
    }
  `}
`

const StyledCaret = styled(Caret)`
  width: 10px;
  height: 10px;
  margin-left: 8px;
`

const RadioButtonWrapper = styled.td`
  width: 72px;

  ${({ theme }) => theme.media.medium`
    width: 48px;
  `}

  ${({ theme }) => theme.media.small`
    padding-left: 12px !important;
    padding-right: 8px !important;
  `}
`

const Price = styled.div`
  display: flex;
  gap: 8px;

  div {
    white-space: nowrap;
  }

  ${({ theme }) => theme.media.small`
    flex-direction: column;
    gap: 4px;
    padding-right: 12px;
  `}
`

interface OffersTableProps {
  offers: any[]
  usersTable: { [key: string]: any }
  loading: boolean
  error: boolean
  selectedOffer: any | null
  selectOffer: (offer: any | null) => void
  sortDesc: boolean
  toggleSort: () => void
}

export default function OffersTable({
  offers,
  usersTable,
  loading,
  error,
  selectedOffer,
  selectOffer,
  sortDesc,
  toggleSort,
}: OffersTableProps) {
  const { asPath } = useRouter()

  const weiAmountToEURValue = useWeiAmountToEURValue()

  return (
    <StyledTable>
      <thead>
        <tr>
          <td />
          <td>
            <TYPE.medium onClick={toggleSort} style={{ cursor: 'pointer' }}>
              <Trans>Price</Trans>
              <StyledCaret direction={sortDesc ? 'bottom' : 'top'} filled />
            </TYPE.medium>
          </td>
          <td>
            <TYPE.medium>
              <Trans>Serial</Trans>
            </TYPE.medium>
          </td>
          <td>
            <TYPE.medium>
              <Trans>Seller</Trans>
            </TYPE.medium>
          </td>
          <td style={{ width: '100px' }} />
        </tr>
      </thead>
      <tbody>
        {offers.length && Object.keys(usersTable).length ? (
          offers.map((offer: any, index) => {
            const weiAmount = offer.price ? WeiAmount.fromEtherAmount(offer.price) : null
            const priceEUR = weiAmount ? weiAmountToEURValue(weiAmount) : null
            const priceETH = weiAmount ? +weiAmount.toFixed(4) : null
            const offerToSelect = { serialNumber: offer.serialNumber, priceEUR }

            return (
              <tr key={`offer-${index}`}>
                <RadioButtonWrapper>
                  <RadioButton
                    selected={offer.serialNumber === selectedOffer?.serialNumber}
                    onChange={() => selectOffer(offerToSelect)}
                  />
                </RadioButtonWrapper>
                <td onClick={() => selectOffer(offerToSelect)}>
                  <Price>
                    <TYPE.body fontWeight={700}>{priceETH ? `${priceETH} ETH` : '-'}</TYPE.body>
                    <TYPE.body color="text2">{priceEUR ? `${priceEUR} €` : null}</TYPE.body>
                  </Price>
                </td>
                <td>
                  <Link href={`${asPath.replace(/buy$/, offer.serialNumber)}`}>
                    <TYPE.body clickable>#{offer.serialNumber}</TYPE.body>
                  </Link>
                </td>
                <td>
                  <Link href={`/user/${usersTable[offer.sellerUserId].slug}`}>
                    <TYPE.body clickable>{usersTable[offer.sellerUserId].username}</TYPE.body>
                  </Link>
                </td>
              </tr>
            )
          })
        ) : (
          <tr>
            <td>
              <TYPE.body>{error ? 'Error' : loading ? 'Loading' : ''}</TYPE.body>
            </td>
          </tr>
        )}
      </tbody>
    </StyledTable>
  )
}
