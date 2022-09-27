import { useMemo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import moment from 'moment'
import { useQuery, gql } from '@apollo/client'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Trans, t } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Table from '@/components/Table'
import Link from '@/components/Link'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'

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

const QUERY_TRANSFERS_USERS = gql`
  query ($ids: [ID!]!) {
    usersByIds(ids: $ids) {
      id
      slug
      username
      profile {
        pictureUrl(derivative: "width=128")
      }
    }
  }
`

interface TransfersTableProps {
  transfers?: any[]
  loading: boolean
  error: boolean
  showSerialNumber: boolean
}

export default function TransfersTable({ transfers, loading, error, showSerialNumber }: TransfersTableProps) {
  const router = useRouter()

  // user table
  const userIds = useMemo(
    () =>
      (transfers ?? []).reduce<string[]>((acc, hit: any) => {
        if (hit.fromUserId) acc.push(hit.fromUserId)
        if (hit.toUserId) acc.push(hit.toUserId)

        return acc
      }, []),
    [JSON.stringify(transfers)]
  )

  // usersData
  const usersQuery = useQuery(QUERY_TRANSFERS_USERS, { variables: { ids: userIds }, skip: !userIds.length })

  const usersTable = useMemo(
    () =>
      ((usersQuery?.data?.usersByIds ?? []) as any[]).reduce<{ [key: string]: string }>((acc, user: any) => {
        acc[user.id] = user
        return acc
      }, {}),
    [usersQuery?.data?.usersByIds]
  )

  // error
  error = error || !!usersQuery.error

  // loading
  loading = loading || !!usersQuery.loading

  // parsed price
  const parsedPrices = useMemo(
    () =>
      (transfers ?? []).map((transfer: any) =>
        transfer.price ? WeiAmount.fromRawAmount(`0x${transfer.price}`) : null
      ),
    [transfers]
  )

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

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
        {!loading && !error && transfers && usersTable ? (
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
                  {parsedPrices[index] ? `${weiAmountToEURValue(parsedPrices[index] ?? undefined)}€` : '-'}
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
