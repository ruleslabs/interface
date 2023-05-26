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
