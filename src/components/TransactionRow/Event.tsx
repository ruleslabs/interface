import { useMemo } from 'react'
import styled from 'styled-components/macro'
import {
  WeiAmount,
  TransferEvent,
  TransferSingleEvent,
  OfferCreatedEvent,
  AccountInitializedEvent,
  constants,
  event as rsdkEvent,
} from '@rulesorg/sdk-core'
import { getChecksumAddress } from 'starknet'
import { t, Trans } from '@lingui/macro'

import { TYPE } from 'src/styles/theme'
import { RowCenter } from 'src/components/Row'
import Link from 'src/components/Link'
import { useMapUsersByAddress, useTokenAndAddressesQuery, useAddressesQuery } from 'src/state/transactions/hooks'

import { ReactComponent as EthereumIcon } from 'src/images/ethereum.svg'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'

// style

const StyledEvent = styled(RowCenter)`
  padding: 12px 20px;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg3}40;
  border: 1px solid ${({ theme }) => theme.bg3}80;
  gap: 16px;

  img,
  svg {
    height: 48px;
    max-width: 48px;
  }

  a,
  span {
    font-weight: 500;
  }

  & a:hover {
    text-decoration: underline;
  }
`

// PACK OPENING PREPARATION EVENT

interface PackOpeningPreparationEventProps {
  parsedEvent: TransferSingleEvent
}

function PackOpeningPreparationEvent({ parsedEvent }: PackOpeningPreparationEventProps) {
  // query data
  const query = useTokenAndAddressesQuery('pack', parsedEvent.tokenId, [parsedEvent.from])

  const pack = query.data?.packByStarknetTokenId
  const fromUser = query.data?.usersByStarknetAddresses?.[0]

  if (!pack) return null

  return (
    <StyledEvent>
      <img src={pack.pictureUrl} />

      <TYPE.body>
        <Trans>
          <Link href={`/user/${fromUser?.slug ?? parsedEvent.from}`}>{fromUser?.username ?? parsedEvent.from}</Link>
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

function TokenTransferEvent({ parsedEvent }: CardTransferEventProps) {
  // query data
  const query = useTokenAndAddressesQuery(parsedEvent.type, parsedEvent.tokenId, [parsedEvent.to, parsedEvent.from])

  // airdrop
  const airdrop = constants.ACCOUNTS[rulesSdk.networkInfos.starknetChainId][constants.RulesAccount.AIRDROP_MINTER]

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
  }, [!!query.data])

  // read users
  const usersTable = useMapUsersByAddress(query.data?.usersByStarknetAddresses)

  const toUser = usersTable[parsedEvent.to]
  const fromUser = usersTable[parsedEvent.from]

  if (!token) return null

  return (
    <StyledEvent>
      <img src={token.pictureUrl} />

      <TYPE.body>
        {parsedEvent.from === '0x0' ? (
          <span>Rules</span>
        ) : (
          <Link href={`/user/${fromUser?.slug ?? parsedEvent.from}`}>{fromUser?.username ?? parsedEvent.from}</Link>
        )}
        <br />

        {airdrop ? <Trans>offered</Trans> : <Trans>sent</Trans>}
        <span> </span>

        {parsedEvent.type === 'pack' ? `${parsedEvent.amount} ` : ''}
        <Link href={token.href}>{token.name}</Link>
        <span> </span>

        <Trans>to</Trans>
        <span> </span>

        <Link href={`/user/${toUser?.slug ?? parsedEvent.to}`}>{toUser?.username ?? parsedEvent.to}</Link>
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
  const query = useAddressesQuery([parsedEvent.from, parsedEvent.to])

  // read users
  const usersTable = useMapUsersByAddress(query.data?.usersByStarknetAddresses)

  const toUser = usersTable[parsedEvent.to]
  const fromUser = usersTable[parsedEvent.from]

  // parsed amount
  const parsedAmount = useMemo(() => WeiAmount.fromRawAmount(parsedEvent.value), [parsedEvent.value])

  // is marketplace tax
  const marketplaceTax = parsedEvent.to === constants.TAX_RESERVE_ADDRESSES[rulesSdk.networkInfos.starknetChainId]

  if (!query.data) return null

  return (
    <StyledEvent>
      <EthereumIcon />

      <TYPE.body>
        <Link href={`/user/${fromUser?.slug ?? parsedEvent.from}`}>{fromUser?.username ?? parsedEvent.from}</Link>
        <br />
        <Trans>sent</Trans>
        <span> </span>
        {parsedAmount.toSignificant(6)} ETH
        <span> </span>
        <Trans>to</Trans>
        <span> </span>
        {marketplaceTax ? (
          <span>
            <Trans>Rules (service fee + artists fee)</Trans>
          </span>
        ) : (
          <Link href={`/user/${toUser?.slug ?? parsedEvent.to}`}>{toUser?.username ?? parsedEvent.to}</Link>
        )}
      </TYPE.body>
    </StyledEvent>
  )
}

// OFFER CREATION

interface OfferCreationAndCancelEventProps {
  parsedEvent: OfferCreatedEvent
}

function OfferCreationAndCancelEvent({ parsedEvent }: OfferCreationAndCancelEventProps) {
  // query data
  const query = useTokenAndAddressesQuery('card', parsedEvent.tokenId, [parsedEvent.seller])

  // get token (pack/card) data
  const card = useMemo(() => {
    const card = query.data?.cardByStarknetTokenId
    if (!card) return null

    return {
      pictureUrl: card.cardModel.pictureUrl,
      href: `/card/${card.cardModel.slug}/${card.serialNumber}`,
      name: `${card.cardModel.artist.displayName} - ${t`Season`} ${card.cardModel.season} #${card.serialNumber}`,
    }
  }, [!!query.data])

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
        <Link href={`/user/${sellerUser?.slug ?? parsedEvent.seller}`}>
          {sellerUser?.username ?? parsedEvent.seller}
        </Link>
        <br />

        {parsedPrice ? <Trans>puts on sale</Trans> : <Trans>cancelled the sale of</Trans>}

        <span> </span>
        <Link href={card.href}>
          <>{card.name}</>
        </Link>

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
      case constants.EventKeys.ACCOUNT_INITIALIZED:
        return t`Wallet deployed`

      case constants.EventKeys.ACCOUNT_UPGRADED:
        return t`Wallet upgraded`

      case constants.EventKeys.SIGNER_ESCAPE_TRIGGERED:
        return t`Password update triggered`

      case constants.EventKeys.SIGNER_ESCAPED:
        return t`Password update completed`
    }

    return null
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
  publicKey: string
  $key: string
  $data: string[]
}

export default function Event({ address, publicKey, $key, $data }: EventProps) {
  const [parsedEvents, involvedAddresses] = useMemo(() => {
    const [parsedEvent, involvedAddresses] = rsdkEvent.parseEvent($key, $data)
    if (!parsedEvent || !involvedAddresses) return []

    const parsedEvents = Array.isArray(parsedEvent) ? parsedEvent : [parsedEvent]

    // fix events lack of informations
    if (parsedEvents[0]?.key === constants.EventKeys.OFFER_CANCELED) {
      ;(parsedEvents[0] as OfferCreatedEvent).seller = address
      involvedAddresses.push(address)
    } else if (
      parsedEvents[0]?.key === constants.EventKeys.ACCOUNT_INITIALIZED &&
      getChecksumAddress((parsedEvents[0] as AccountInitializedEvent).signerPublicKey) === publicKey
    ) {
      involvedAddresses.push(address)
    }

    return [parsedEvents, involvedAddresses]
  }, [$key, $data, publicKey, address])

  if (!parsedEvents) return <WalletEvent eventKey={$key} />

  if (!involvedAddresses?.includes(address)) return null

  return (
    <>
      {parsedEvents.map((parsedEvent, index) => {
        switch (parsedEvent.key) {
          case constants.EventKeys.TRANSFER_SINGLE:
            return +(parsedEvent as TransferSingleEvent).to ? (
              <TokenTransferEvent key={index} parsedEvent={parsedEvent as TransferSingleEvent} />
            ) : (
              <PackOpeningPreparationEvent key={index} parsedEvent={parsedEvent as TransferSingleEvent} />
            )

          case constants.EventKeys.TRANSFER:
            return <EtherTransferEvent key={index} parsedEvent={parsedEvent as TransferEvent} />

          case constants.EventKeys.OFFER_CREATED:
          case constants.EventKeys.OFFER_CANCELED:
            return <OfferCreationAndCancelEvent key={index} parsedEvent={parsedEvent as OfferCreatedEvent} />

          case constants.EventKeys.ACCOUNT_INITIALIZED:
            return <WalletEvent key={index} eventKey={$key} />
        }

        return null
      })}
    </>
  )
}
