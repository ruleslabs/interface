import { useLingui } from '@lingui/react'
import { useCallback } from 'react'
import { msg } from '@lingui/macro'

import { ScarcityName } from '@rulesorg/sdk-core'
import { StxAction } from 'src/types/starknetTx'

type Prefix = 'liveReward' | 'scarcity' | 'stxActionDesc' | 'stxActionSuccess' | 'stxActionConfirm' | 'scarcityCard'

const prefix = (obj: Messages, prefix: Prefix) =>
  Object.keys(obj).reduce<Messages>((acc, e) => {
    acc[`${prefix}.${e}`] = obj[e]
    return acc
  }, {})

type MessageDescriptor = any
type Messages = { [id: string]: MessageDescriptor }

/**
 * Starknet TX Actions
 */

const stxActionDesc: { [id in StxAction]: MessageDescriptor } = {
  transfer: msg`Card transfer...`,
  offerAcceptance: msg`Card purchase...`,
  offerCancelation: msg`Sale canceling...`,
  offerCreation: msg`Sale listing...`,
  walletDeployment: msg`Wallet deployment...`,
  ethTransfer: msg`ETH transfer...`,
}

const stxActionConfirm: { [id in StxAction]: MessageDescriptor } = {
  transfer: msg`Confirm transfer`,
  offerAcceptance: msg`Confirm purchase`,
  offerCancelation: msg`Confirm offer cancelation`,
  offerCreation: msg`Confirm offer creation`,
  walletDeployment: msg`Confirm deployment`,
  ethTransfer: msg`Confrim transfer`,
}

const stxActionSuccess: { [id in StxAction]: MessageDescriptor } = {
  transfer: msg`Your card is on its way !`,
  offerAcceptance: msg`Your purchase will be accepted very soon.`,
  offerCancelation: msg`Your offer will be canceled very soon.`,
  offerCreation: msg`Your card has been listed on the marketplace.`,
  walletDeployment: msg`Your wallet deployment is on its way !`,
  ethTransfer: msg`Your ETH is on its way !`,
}

/**
 * Scarcities
 */

const scarcities: { [id in ScarcityName]: MessageDescriptor } = {
  common: msg`Common`,
  platinium: msg`Platinium`,
  halloween: msg`Halloween`,
  holographic: msg`Holographic`,
}

const scarcitiesCards: { [id in ScarcityName]: MessageDescriptor } = {
  common: msg`Common card`,
  platinium: msg`Platinium card`,
  halloween: msg`Halloween card`,
  holographic: msg`Holographic card`,
}

/**
 * Live rewards
 */

const liveReward: Messages = {}

/**
 * Merge
 */

const messages: Messages = {
  ...prefix(stxActionDesc, 'stxActionDesc'),
  ...prefix(stxActionConfirm, 'stxActionConfirm'),
  ...prefix(stxActionSuccess, 'stxActionSuccess'),

  ...prefix(scarcities, 'scarcity'),
  ...prefix(scarcitiesCards, 'scarcityCard'),

  ...prefix(liveReward, 'liveReward'),
}

/**
 * useTrans hook
 */

export default function useTrans() {
  const { i18n } = useLingui()

  return useCallback(
    (prefix: Prefix, id: string) => {
      const prefixedId = `${prefix}.${id}`
      return messages[prefixedId] ? i18n._(messages[prefixedId]) : id
    },
    [i18n]
  )
}
