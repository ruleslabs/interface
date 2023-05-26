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
