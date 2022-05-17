import { useRouter } from 'next/router'
import styled from 'styled-components'
import moment from 'moment'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Trans, t } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Table from '@/components/Table'
import Link from '@/components/Link'
import { useEtherEURPrice } from '@/hooks/useFiatPrice'

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
`

const StyledTable = styled(Table)`
  margin-top: 22px;

  ${({ theme }) => theme.media.small`
    td:first-child {
      display: none;
    }
  `}
`

interface TransfersTableProps {
  transfers: any[]
  usersTable: { [key: string]: any }
  loading: boolean
  error: boolean
  showSerialNumber: boolean
}

export default function TransfersTable({
  transfers,
  usersTable,
  loading,
  error,
  showSerialNumber,
}: TransfersTableProps) {
  const router = useRouter()

  console.log(router)

  const etherEURprice = useEtherEURPrice()

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
          {showSerialNumber && (
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
        {transfers.length && Object.keys(usersTable).length ? (
          transfers.map((transfer, index) => (
            <tr key={`rule-nft-history-${index}`}>
              <td>
                <Link href={`/user/${usersTable[transfer.toUserId].slug}`}>
                  <Avatar src={usersTable[transfer.toUserId].profile.pictureUrl} />
                </Link>
              </td>
              <td>
                <Link href={`/user/${usersTable[transfer.toUserId].slug}`}>
                  <TYPE.body clickable>{usersTable[transfer.toUserId].username}</TYPE.body>
                </Link>
              </td>
              <td>
                {!!transfer.fromUserId ? (
                  <Link href={`/user/${usersTable[transfer.fromUserId].slug}`}>
                    <TYPE.body clickable>{usersTable[transfer.fromUserId].username}</TYPE.body>
                  </Link>
                ) : (
                  <TYPE.body>{transfer.airdrop ? t`Offered by Rules` : t`Pack opening`}</TYPE.body>
                )}
              </td>
              <td>
                <TYPE.body>{moment(transfer.date).format('DD/MM/YYYY')}</TYPE.body>
              </td>
              {showSerialNumber && (
                <td>
                  <Link href={`/card/${router.query.cardModelSlug}/${transfer.serialNumber}`}>
                    <TYPE.body clickable>#{transfer.serialNumber}</TYPE.body>
                  </Link>
                </td>
              )}
              <td>
                <TYPE.body>
                  {!!transfer.price && etherEURprice
                    ? `${WeiAmount.fromEtherAmount(transfer.price).multiply(Math.round(etherEURprice)).toFixed(2)}€`
                    : '-'}
                </TYPE.body>
              </td>
            </tr>
          ))
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
