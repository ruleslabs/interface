import { MutationFunction } from '@apollo/client'
import { StxAction } from './starknetTx'

export type GenieError = { message: string; id: string | null; render: () => React.ReactNode } | null

export interface GenieStatus {
  loading: boolean
  error?: GenieError
}

export type FormatedMutationFunction<TData, TVariables, TFormatedData> = (
  options: Parameters<MutationFunction<TData, TVariables>>[0]
) => Promise<NonNullable<TFormatedData>>

export interface ModalContentProps<TEnum> {
  setModalMode?: (mode: TEnum) => void
}

export type ModalContents<TEnum extends string | number | symbol> = {
  [key in TEnum]: {
    Component: (props: ModalContentProps<TEnum>) => JSX.Element | null
    title?: string
    previous?: TEnum
  }
}

/* Operations */

export interface Operation {
  tokenId: string
  action: StxAction
  quantity: string | number
}

export interface PendingOperation extends Operation {
  txHash: string
}

export type PendingOperations = {
  [tokenId: string]: {
    [txHash: string]: Omit<Operation, 'tokenId'>
  }
}

/* Owner profile */
export interface OwnerUser {
  slug: string
  username: string
  profile: {
    pictureUrl: string
    fallbackUrl: string
  }
}

/* txs */

export interface ExecutedTx {
  hash: string
  success: boolean
  action: string
}

export type ExecutedOrPendingTx = ExecutedTx & {
  success?: ExecutedTx['success']
  loading?: boolean
}
