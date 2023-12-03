import { ApolloError, MutationFunction } from '@apollo/client'
import { FormatedMutationFunction, GenieError } from 'src/types'
import { formatError } from 'src/utils/error'
import noop from 'src/utils/noop'

export function formatApolloError(error?: ApolloError): GenieError {
  const grapqlError = error?.graphQLErrors?.[0]
  if (!grapqlError) return null

  const message = grapqlError.message ?? 'Unkown Error'
  const id = typeof grapqlError.extensions?.id === 'string' ? grapqlError.extensions.id : null

  return formatError(message, id)
}

export function formatMutationFunction<TData, TVariables, TFormatedData>(
  mutationFunction: MutationFunction<TData, TVariables>,
  formatResult: (data: TData) => TFormatedData
): FormatedMutationFunction<TData, TVariables, TFormatedData> {
  return async (options: Parameters<typeof mutationFunction>[0]) => {
    const res = await mutationFunction(options).catch(noop)
    return (res && res.data ? formatResult(res.data) : {}) as NonNullable<TFormatedData>
  }
}
