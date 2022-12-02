import { useMemo } from 'react'
import styled from 'styled-components'
import { gql, useQuery } from '@apollo/client'
import { parseEvent, EventKeys, TransferSingleEvent } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'
import Link from '@/components/Link'
import { networkId } from '@/constants/networks'
import { PACKS_OPENER_ADDRESSES, AIRDROP_MINTER_ADDRESSES } from '@/constants/addresses'

// queries

const CARD_AND_USERS_EVENT_QUERY = gql`
  query ($starknetTokenId: String!, $usersStarknetAddresses: [String!]!) {
    cardByStarknetTokenId(starknetTokenId: $starknetTokenId) {
      serialNumber
      cardModel {
        pictureUrl(derivative: "width=256")
        name
        slug
      }
    }
    usersByStarknetAddresses(starknetAddresses: $usersStarknetAddresses) {
      username
      slug
      starknetWallet {
        address
      }
    }
  }
`

const PACK_AND_USERS_EVENT_QUERY = gql`
  query ($starknetTokenId: String!, $usersStarknetAddresses: [String!]!) {
    packByStarknetTokenId(starknetTokenId: $starknetTokenId) {
      displayName
      pictureUrl(derivative: "width=256")
      slug
    }
    usersByStarknetAddresses(starknetAddresses: $usersStarknetAddresses) {
      username
      slug
      starknetWallet {
        address
      }
    }
  }
`

// style

const StyledEvent = styled(RowCenter)`
  padding: 12px 20px;
  border-radius: 3px;
  background: ${({ theme }) => theme.bg5};
  gap: 16px;

  img {
    height: 48px;
  }

  & a {
    font-weight: 700;
  }

  & a:hover {
    text-decoration: underline;
  }
`

// HOOKS

function useMapUsersByAddress(users?: any) {
  return useMemo(
    () =>
      (users ?? []).reduce<{ [address: string]: any }>((acc, user) => {
        acc[user.starknetWallet.address] = user
        return acc
      }, {}),
    [users?.length]
  )
}

// PACK OPENING PREPARATION EVENT

interface PackOpeningPreparationEventProps {
  parsedEvent: TransferSingleEvent
}

function PackOpeningPreparationEvent({ parsedEvent }: PackOpeningPreparationEventProps) {
  const query = useQuery(PACK_AND_USERS_EVENT_QUERY, {
    variables: { starknetTokenId: parsedEvent.tokenId, usersStarknetAddresses: [parsedEvent.from] },
  })

  const pack = query.data?.packByStarknetTokenId
  const fromUser = query.data?.usersByStarknetAddresses?.[0]

  if (!pack) return null

  return (
    <StyledEvent>
      <img src={pack.pictureUrl} />

      <TYPE.body>
        <Trans>
          <Link href={`/user/${fromUser.slug}`}>{fromUser?.username ?? parsedEvent.from}</Link>
          <span> </span>
          opened {parsedEvent.amount}
          <span> </span>
          <Link href={`/pack/${pack.slug}`}>{pack.displayName}</Link>
        </Trans>
      </TYPE.body>
    </StyledEvent>
  )
}

// CARD TRANSFER EVENT

interface CardTransferEventProps {
  parsedEvent: TransferSingleEvent
}

function TransferEvent({ parsedEvent }: CardTransferEventProps) {
  const gqlQuery = useMemo(() => {
    switch (parsedEvent.type) {
      case 'card':
        return CARD_AND_USERS_EVENT_QUERY

      case 'pack':
        return PACK_AND_USERS_EVENT_QUERY

      default:
        return ``
    }
  })

  const query = useQuery(gqlQuery, {
    variables: { starknetTokenId: parsedEvent.tokenId, usersStarknetAddresses: [parsedEvent.to, parsedEvent.from] },
    skip: !gqlQuery,
  })

  const airdrop = parsedEvent.operator === AIRDROP_MINTER_ADDRESSES[networkId]

  const token = useMemo(() => {
    const token = query.data?.cardByStarknetTokenId ?? query.data?.packByStarknetTokenId
    if (!token) return null

    switch (parsedEvent.type) {
      case 'card':
        return {
          pictureUrl: token.cardModel.pictureUrl,
          href: `/card/${token.cardModel.slug}/${token.serialNumber}`,
          name: `${token.cardModel.name} #${token.serialNumber}`,
        }

      case 'pack':
        return {
          pictureUrl: token.pictureUrl,
          href: `/pack/${token.slug}`,
          name: token.displayName,
        }
    }
  })
  const usersTable = useMapUsersByAddress(query.data?.usersByStarknetAddresses)

  const toUser = usersTable[parsedEvent.to]
  const fromUser = usersTable[parsedEvent.from]

  if (!token) return null

  return (
    <StyledEvent>
      <img src={token.pictureUrl} />

      <TYPE.body>
        <Trans>
          <Link href={`/user/${toUser?.slug ?? parsedEvent.to}`}>{toUser?.username ?? parsedEvent.to}</Link>
          <span> </span>
          received {parsedEvent.type === 'pack' ? `${parsedEvent.amount} ` : ''}
          <Link href={token.href}>{token.name}</Link>
        </Trans>

        {parsedEvent.from !== '0x0' && (
          <Trans>
            <span> </span>
            from&nbsp;
            <Link href={`/user/${fromUser.slug ?? parsedEvent.from}`}>{fromUser.username ?? parsedEvent.from}</Link>
          </Trans>
        )}

        {airdrop && (
          <Trans>
            <span> </span>
            gifted by Rules
          </Trans>
        )}
      </TYPE.body>
    </StyledEvent>
  )
}

// event manager

interface EventProps {
  address: string
  $key: string
  $data: string[]
}

export default function Event({ address, $key, $data }: EventProps) {
  const [parsedEvent, involvedAddresses] = useMemo(() => parseEvent($key, $data), [$key, $data])

  console.log(parsedEvent, involvedAddresses)

  if (!involvedAddresses.includes(address)) return null

  switch (parsedEvent.key) {
    case EventKeys.TRANSFER_SINGLE:
      return parsedEvent.to === PACKS_OPENER_ADDRESSES[networkId] ? (
        <PackOpeningPreparationEvent parsedEvent={parsedEvent} />
      ) : (
        <TransferEvent parsedEvent={parsedEvent} />
      )
  }

  return null
}
