import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { GenieError } from '@/types'

export function formatError(message: string, id: string | null = null): GenieError {
  return {
    message,
    id,
    render: () => (
      message && <Trans id={message} render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>} />
    ),
  }
}
