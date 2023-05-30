import { MutationFunction } from '@apollo/client'

export type GenieError = { message: string; id: string | null; render: () => React.ReactNode } | null

export interface GenieStatus {
  loading: boolean
  error?: GenieError
}

export type FormatedMutationFunction<TData, TVariables, TFormatedData> = (
  options: Parameters<MutationFunction<TData, TVariables>>[0]
) => Promise<NonNullable<TFormatedData>>

export type ModalContents<TEnum extends string | number | symbol> = {
  [key in TEnum]: {
    Component: () => JSX.Element
    title?: string
    previous?: TEnum
  }
}

/* Operations */

export type OperationType = 'transfer' | 'offerCreation' | 'offerCancelation' | 'offerAcceptance'

export interface Operation {
  tokenId: string
  type: OperationType
  quantity: number
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
}

/* badges */

export enum Badge {
  LOW_SERIAL,
  CARDS_COUNT_LEVEL_1,
  CARDS_COUNT_LEVEL_2,
  CARDS_COUNT_LEVEL_3,
  CARDS_COUNT_LEVEL_4,
}
