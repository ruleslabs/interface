import { useLingui } from '@lingui/react'
import { useCallback } from 'react'
import { msg } from '@lingui/macro'

import { OperationType } from 'src/types'

type Prefix = 'operation'

const prefix = (obj: Messages, prefix: Prefix) =>
  Object.keys(obj).reduce<Messages>((acc, e) => {
    acc[`${prefix}.${e}`] = obj[e]
    return acc
  }, {})

type MessageDescriptor = any
type Messages = { [id: string]: MessageDescriptor }

const pendingOperationsMessage: { [id in OperationType]: MessageDescriptor } = {
  transfer: msg`Transfer in progress...`,
  offerAcceptance: msg`Transfer in progress...`,
  offerCancelation: msg`Sale canceling in progress...`,
  offerCreation: msg`Sale in progress...`,
}

const messages: Messages = {
  ...prefix(pendingOperationsMessage, 'operation'),
}

export default function useTrans() {
  const { i18n } = useLingui()

  return useCallback(
    (prefix: Prefix, id: string) => {
      const prefixedId = `${prefix}.${id}`
      return messages[prefixedId] ? i18n._(messages[prefixedId]) : prefixedId
    },
    [i18n]
  )
}
