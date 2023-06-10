import { useMemo } from 'react'
import styled from 'styled-components/macro'
import moment from 'moment'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'
import { useParams } from 'react-router-dom'

import { TYPE } from 'src/styles/theme'
import Table from 'src/components/Table'
import Avatar from 'src/components/Avatar'
import Link from 'src/components/Link'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import {
  CardModelSaleTransfersQueryResult,
  CardTransfersQueryResult,
} from 'src/graphql/data/__generated__/types-and-hooks'
import { PaginationSpinner } from '../Spinner'

const StyledAvatar = styled(Avatar)`
  width: 36px;
  height: 36px;
`

const StyledTable = styled(Table)`
  margin-top: 22px;

  ${({ theme }) => theme.media.small`
    td:first-child {
      display: none;
    }
  `}
`

type CardTransfers = NonNullable<CardTransfersQueryResult['data']>['cardTransfers']
type CardSaleTransfers = NonNullable<CardModelSaleTransfersQueryResult['data']>['cardModelSaleTransfers']

interface TransfersTableProps {
  transfers: CardTransfers | CardSaleTransfers
  loading: boolean
  withSerial?: boolean
}

export default function TransfersTable({ transfers, loading, withSerial = false }: TransfersTableProps) {
  // query
  const { cardModelSlug } = useParams()

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // row
  const rows = useMemo(() => {
    return (
      <>
        {transfers.map((transfer) => {
          const fromUser = transfer.fromOwner?.user
          const toUser = transfer.toOwner?.user

          const parsedPrice = transfer.price ? WeiAmount.fromRawAmount(transfer.price) : null

          return (
            <tr key={transfer.id}>
              <td>
                <Link href={`/user/${transfer.toOwner.user?.slug}`}>
                  <StyledAvatar
                    src={toUser?.profile.pictureUrl ?? ''}
                    fallbackSrc={toUser?.profile.fallbackUrl ?? ''}
                  />
                </Link>
              </td>

              <td>
                {toUser && (
                  <Link href={`/user/${toUser.slug}`}>
                    <TYPE.body clickable>{toUser.username}</TYPE.body>
                  </Link>
                )}
              </td>

              <td>
                {fromUser && (
                  <Link href={`/user/${fromUser.slug}`}>
                    <TYPE.body clickable>{fromUser.username}</TYPE.body>
                  </Link>
                )}
                {transfer.__typename === 'CardTransfer' && (
                  <>
                    {transfer.kind === 'airdrop' && (
                      <TYPE.body>
                        <Trans>Offered by Rules</Trans>
                      </TYPE.body>
                    )}
                    {transfer.kind === 'packOpening' && (
                      <TYPE.body>
                        <Trans>Pack opening</Trans>
                      </TYPE.body>
                    )}
                    {transfer.kind === 'liveReward' && (
                      <TYPE.body>
                        <Trans>Live reward</Trans>
                      </TYPE.body>
                    )}
                  </>
                )}
              </td>

              <td>
                <TYPE.body>{moment(transfer.date).format('DD/MM/YYYY')}</TYPE.body>
              </td>

              {withSerial && (
                <td>
                  {transfer.__typename === 'CardSaleTransfer' && (
                    <Link href={`/card/${cardModelSlug}/${transfer.card.serialNumber}`}>
                      <TYPE.body clickable>#{transfer.card.serialNumber}</TYPE.body>
                    </Link>
                  )}
                </td>
              )}

              <td>
                <TYPE.body>{parsedPrice ? `${weiAmountToEURValue(parsedPrice)}€` : '-'}</TYPE.body>
              </td>
            </tr>
          )
        })}
      </>
    )
  }, [transfers, weiAmountToEURValue, withSerial])

  return (
    <StyledTable>
      <thead>
        <tr>
          <td />

          <td>
            <TYPE.medium>
              <Trans>Buyer</Trans>
            </TYPE.medium>
          </td>

          <td>
            <TYPE.medium>
              <Trans>Seller</Trans>
            </TYPE.medium>
          </td>

          <td>
            <TYPE.medium>
              <Trans>Date</Trans>
            </TYPE.medium>
          </td>

          {withSerial && (
            <td>
              <TYPE.medium>
                <Trans>Serial</Trans>
              </TYPE.medium>
            </td>
          )}

          <td>
            <TYPE.medium>
              <Trans>Price</Trans>
            </TYPE.medium>
          </td>
        </tr>
      </thead>
      <tbody>
        {rows}
        <tr>
          <td>
            <PaginationSpinner loading={loading} />
          </td>
        </tr>
      </tbody>
    </StyledTable>
  )
}
