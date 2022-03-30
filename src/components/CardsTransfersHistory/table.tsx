import { useRouter } from 'next/router'
import styled from 'styled-components'
import moment from 'moment'
import { WeiAmount } from '@rulesorg/sdk-core'

import { TYPE } from '@/styles/theme'
import Table from '@/components/Table'
import Link from '@/components/Link'
import { useEtherEURPrice } from '@/hooks/useFiatPrice'

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
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
  const { asPath } = useRouter()

  const etherEURprice = useEtherEURPrice()

  return (
    <Table>
      <thead>
        <tr>
          <td />
          <td>
            <TYPE.medium>Acheteur</TYPE.medium>
          </td>
          <td>
            <TYPE.medium>Vendeur</TYPE.medium>
          </td>
          <td>
            <TYPE.medium>Date</TYPE.medium>
          </td>
          {showSerialNumber && (
            <td>
              <TYPE.medium>Serial</TYPE.medium>
            </td>
          )}
          <td>
            <TYPE.medium>Prix</TYPE.medium>
          </td>
        </tr>
      </thead>
      <tbody>
        {transfers.length && Object.keys(usersTable).length ? (
          transfers.map((transfer, index) => (
            <tr key={`rule-nft-history-${index}`}>
              <td>
                <Link href={`/${usersTable[transfer.toUserId].slug}`}>
                  <Avatar src={usersTable[transfer.toUserId].profile.pictureUrl} />
                </Link>
              </td>
              <td>
                <Link href={`/${usersTable[transfer.toUserId].slug}`}>
                  <TYPE.body clickable>{usersTable[transfer.toUserId].username}</TYPE.body>
                </Link>
              </td>
              <td>
                {!!transfer.fromUserId ? (
                  <Link href={`/${usersTable[transfer.fromUserId].slug}`}>
                    <TYPE.body clickable>{usersTable[transfer.fromUserId].username}</TYPE.body>
                  </Link>
                ) : (
                  <TYPE.body>{transfer.airdrop ? 'Offert par Rules' : 'Ouverture de pack'}</TYPE.body>
                )}
              </td>
              <td>
                <TYPE.body>{moment(transfer.date).format('DD/MM/YYYY')}</TYPE.body>
              </td>
              {showSerialNumber && (
                <td>
                  <Link href={`${asPath}/${transfer.serialNumber}`}>
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
    </Table>
  )
}
