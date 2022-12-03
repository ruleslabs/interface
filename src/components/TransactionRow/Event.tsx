import { useMemo } from 'react'
import styled from 'styled-components'
import { gql, useQuery } from '@apollo/client'
import { parseEvent, WeiAmount, EventKeys, TransferSingleEvent, OfferCreationEvent } from '@rulesorg/sdk-core'
import { t, Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'
import Link from '@/components/Link'
import { networkId } from '@/constants/networks'
import { PACKS_OPENER_ADDRESSES, AIRDROP_MINTER_ADDRESSES, TAX_RESERVE_ADDRESSES } from '@/constants/addresses'

import EthereumIcon from '@/images/ethereum.svg'

// queries

const USERS_QUERY_CONTENT = `
  usersByStarknetAddresses(starknetAddresses: $usersStarknetAddresses) {
    username
    slug
    starknetWallet {
      address
    }
  }
`

const CARD_AND_USERS_EVENT_QUERY = gql`
  query ($starknetTokenId: String!, $usersStarknetAddresses: [String!]!) {
    cardByStarknetTokenId(starknetTokenId: $starknetTokenId) {
      serialNumber
      cardModel {
        pictureUrl(derivative: "width=128")
        season
        slug
        artist {
          displayName
        }
      }
    }
    ${USERS_QUERY_CONTENT}
  }
`

const PACK_AND_USERS_EVENT_QUERY = gql`
  query ($starknetTokenId: String!, $usersStarknetAddresses: [String!]!) {
    packByStarknetTokenId(starknetTokenId: $starknetTokenId) {
      displayName
      pictureUrl(derivative: "width=128")
      slug
    }
    ${USERS_QUERY_CONTENT}
  }
`

const USERS_EVENT_QUERY = gql`
  query ($usersStarknetAddresses: [String!]!) {
    ${USERS_QUERY_CONTENT}
  }
`

// style

const StyledEvent = styled(RowCenter)`
  padding: 12px 20px;
  border-radius: 3px;
  background: ${({ theme }) => theme.bg5};
  gap: 16px;

  img,
  svg {
    height: 48px;
  }

  a,
  span {
    font-weight: 500;
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
          <br />
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
  // get gql query base on token type
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

  // query data
  const query = useQuery(gqlQuery, {
    variables: { starknetTokenId: parsedEvent.tokenId, usersStarknetAddresses: [parsedEvent.to, parsedEvent.from] },
    skip: !gqlQuery,
  })

  // airdrop
  const airdrop = parsedEvent.operator === AIRDROP_MINTER_ADDRESSES[networkId]

  // get token (pack/card) data
  const token = useMemo(() => {
    const token = query.data?.cardByStarknetTokenId ?? query.data?.packByStarknetTokenId
    if (!token) return null

    switch (parsedEvent.type) {
      case 'card':
        return {
          pictureUrl: token.cardModel.pictureUrl,
          href: `/card/${token.cardModel.slug}/${token.serialNumber}`,
          name: `${token.cardModel.artist.displayName} - ${t`Season`} ${token.cardModel.season} #${token.serialNumber}`,
        }

      case 'pack':
        return {
          pictureUrl: token.pictureUrl,
          href: `/pack/${token.slug}`,
          name: token.displayName,
        }
    }
  })

  // read users
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
          <br />
          received {parsedEvent.type === 'pack' ? `${parsedEvent.amount} ` : ''}
          <Link href={token.href}>{token.name}</Link>
        </Trans>

        {parsedEvent.from !== '0x0' && (
          <Trans>
            <span> </span>
            from&nbsp;
            <Link href={`/user/${fromUser?.slug ?? parsedEvent.from}`}>{fromUser?.username ?? parsedEvent.from}</Link>
          </Trans>
        )}

        {airdrop && (
          <Trans>
            <span> </span>
            gifted by <span>Rules</span>
          </Trans>
        )}
      </TYPE.body>
    </StyledEvent>
  )
}

// ETHER TRANSFER

interface EtherTransferEventProps {
  parsedEvent: TransferEvent
}

function EtherTransferEvent({ parsedEvent }: EtherTransferEventProps) {
  // query data
  const query = useQuery(USERS_EVENT_QUERY, {
    variables: { usersStarknetAddresses: [parsedEvent.from, parsedEvent.to] },
  })

  // read users
  const usersTable = useMapUsersByAddress(query.data?.usersByStarknetAddresses)

  const toUser = usersTable[parsedEvent.to]
  const fromUser = usersTable[parsedEvent.from]

  // parsed amount
  const parsedAmount = useMemo(() => WeiAmount.fromRawAmount(parsedEvent.value), [parsedEvent.value])

  // is marketplace tax
  const marketplaceTax = parsedEvent.to === TAX_RESERVE_ADDRESSES[networkId]

  if (!query.data) return null

  return (
    <StyledEvent>
      <EthereumIcon />

      <TYPE.body>
        <Trans>
          {marketplaceTax ? (
            <TYPE.body fontWeight="500">Rules</TYPE.body>
          ) : (
            <>
              <Link href={`/user/${toUser?.slug ?? parsedEvent.to}`}>{toUser?.username ?? parsedEvent.to}</Link>
              <br />
            </>
          )}
          received {parsedAmount.toSignificant(6)} ETH
        </Trans>

        {parsedEvent.from !== '0x0' && (
          <Trans>
            <span> </span>
            from&nbsp;
            <Link href={`/user/${fromUser?.slug ?? parsedEvent.from}`}>{fromUser?.username ?? parsedEvent.from}</Link>
          </Trans>
        )}
      </TYPE.body>
    </StyledEvent>
  )
}

// OFFER CREATION

interface OfferCreationAndCancelEventProps {
  parsedEvent: OfferCreationEvent
}

function OfferCreationAndCancelEvent({ parsedEvent }: OfferCreationAndCancelEventProps) {
  const query = useQuery(CARD_AND_USERS_EVENT_QUERY, {
    variables: { starknetTokenId: parsedEvent.tokenId, usersStarknetAddresses: [parsedEvent.seller] },
  })

  // get token (pack/card) data
  const card = useMemo(() => {
    const card = query.data?.cardByStarknetTokenId
    if (!card) return null

    return {
      pictureUrl: card.cardModel.pictureUrl,
      href: `/card/${card.cardModel.slug}/${card.serialNumber}`,
      name: `${card.cardModel.artist.displayName} - ${t`Season`} ${card.cardModel.season} #${card.serialNumber}`,
    }
  })

  // get seller
  const sellerUser = query.data?.usersByStarknetAddresses?.[0]

  // parsed amount
  const parsedPrice = useMemo(
    () => (parsedEvent.price ? WeiAmount.fromRawAmount(parsedEvent.price) : null),
    [parsedEvent.price]
  )

  if (!card) return null

  return (
    <StyledEvent>
      <img src={card.pictureUrl} />

      <TYPE.body>
        <Trans>
          <Link href={`/user/${sellerUser?.slug ?? parsedEvent.seller}`}>
            {sellerUser?.username ?? parsedEvent.seller}
          </Link>
          <br />
        </Trans>

        {parsedPrice ? <Trans>puts on sale</Trans> : <Trans>cancelled the sale of</Trans>}

        <span> </span>
        <Link href={card.href}>{card.name}</Link>

        {parsedPrice && (
          <Trans>
            <span> </span>
            for {parsedPrice.toSignificant(6)} ETH
          </Trans>
        )}
      </TYPE.body>
    </StyledEvent>
  )
}

// WALLET DEPLOYMENT EVENT

interface WalletEventProps {
  eventKey: string
}

function WalletEvent({ eventKey }: WalletEventProps) {
  const eventText = useMemo(() => {
    switch (eventKey) {
      case EventKeys.ACCOUNT_INITIALIZED:
        return t`Wallet deployed`

      case EventKeys.ACCOUNT_UPGRADED:
        return t`Wallet upgraded`

      case EventKeys.SIGNER_ESCAPE_TRIGGERED:
        return t`Password update triggered`

      case EventKeys.SIGNER_ESCAPED:
        return t`Password update completed`
    }
  }, [eventKey])

  if (!eventKey) return null

  return (
    <StyledEvent>
      <EthereumIcon />

      <TYPE.body>{eventText}</TYPE.body>
    </StyledEvent>
  )
}

// EVENT MGMT

interface EventProps {
  address: string
  $key: string
  $data: string[]
}

export default function Event({ address, $key, $data }: EventProps) {
  const [parsedEvent, involvedAddresses] = useMemo(() => parseEvent($key, $data), [$key, $data])
  const parsedEvents = Array.isArray(parsedEvent) ? parsedEvent : [parsedEvent]

  if (!parsedEvent) return <WalletEvent eventKey={$key} />

  // fix events lack of informations
  if (parsedEvents[0]?.key === EventKeys.OFFER_CANCELED) {
    parsedEvents[0].seller = address
  } else if (!involvedAddresses?.includes(address)) return null

  return (
    <>
      {parsedEvents.map((parsedEvent, index) => {
        switch (parsedEvent.key) {
          case EventKeys.TRANSFER_SINGLE:
            return parsedEvent.to === PACKS_OPENER_ADDRESSES[networkId] ? (
              <PackOpeningPreparationEvent key={index} parsedEvent={parsedEvent} />
            ) : (
              <TransferEvent key={index} parsedEvent={parsedEvent} />
            )

          case EventKeys.TRANSFER:
            return <EtherTransferEvent key={index} parsedEvent={parsedEvent} />

          case EventKeys.OFFER_CREATED:
          case EventKeys.OFFER_CANCELED:
            return <OfferCreationAndCancelEvent key={index} parsedEvent={parsedEvent as OfferCreationEvent} />
        }

        return null
      })}
    </>
  )
}
