import { Trans } from '@lingui/macro'
import { TYPE } from 'src/styles/theme'
import { GenieError } from 'src/types'

export function formatError(message: string, id: string | null = null): GenieError {
  return {
    message,
    id,
    render: () =>
      message && (
        <TYPE.body color="error">
          <Trans id={message}>{message}</Trans>
        </TYPE.body>
      ),
  }
}
