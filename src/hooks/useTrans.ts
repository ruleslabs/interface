import { useLingui } from '@lingui/react'
import { useCallback } from 'react'
import { msg } from '@lingui/macro'

import { OperationType } from 'src/types'
import { ScarcityName } from '@rulesorg/sdk-core'
import { StxAction } from 'src/types/starknetTx'

type Prefix = 'operation' | 'liveReward' | 'scarcity' | 'stxActionDesc' | 'stxActionSuccess' | 'stxActionConfirm'

const prefix = (obj: Messages, prefix: Prefix) =>
  Object.keys(obj).reduce<Messages>((acc, e) => {
    acc[`${prefix}.${e}`] = obj[e]
    return acc
  }, {})

type MessageDescriptor = any
type Messages = { [id: string]: MessageDescriptor }

/**
 * Pending operations
 */

const pendingOperationsMessage: { [id in OperationType]: MessageDescriptor } = {
  transfer: msg`Transfer in progress...`,
  offerAcceptance: msg`Transfer in progress...`,
  offerCancelation: msg`Sale canceling in progress...`,
  offerCreation: msg`Sale in progress...`,
  deployment: msg`Wallet deployment...`,
}

/**
 * Starknet TX Actions
 */

const stxActionDesc: { [id in StxAction]: MessageDescriptor } = {
  transfer: msg`Transfer in progress...`,
  offerAcceptance: msg`Transfer in progress...`,
  offerCancelation: msg`Sale canceling in progress...`,
  offerCreation: msg`Sale in progress...`,
  walletDeployment: msg`Wallet deployment...`,
  ethTransfer: msg`ETH transfer in progress...`,
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
  offerAcceptance: msg`Your purchase will be accetped very soon.`,
  offerCancelation: msg`Your offer will be canceled very soon.`,
  offerCreation: msg`Your offer will be created very soon.`,
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
}

/**
 * Live rewards
 */

const liveReward: Messages = {}

/**
 * Merge
 */

const messages: Messages = {
  ...prefix(pendingOperationsMessage, 'operation'),

  ...prefix(stxActionDesc, 'stxActionDesc'),
  ...prefix(stxActionConfirm, 'stxActionConfirm'),
  ...prefix(stxActionSuccess, 'stxActionSuccess'),

  ...prefix(scarcities, 'scarcity'),

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
