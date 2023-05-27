import { useLingui } from '@lingui/react'
import { useCallback } from 'react'
import { msg } from '@lingui/macro'

import { OperationType } from 'src/types'

const prefix = (obj: Messages, prefix: string) =>
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
    (id: string) => {
      return messages[id] ? i18n._(messages[id]) : id
    },
    [i18n]
  )
}
