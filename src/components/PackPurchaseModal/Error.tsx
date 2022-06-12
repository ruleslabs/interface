import { Trans } from '@lingui/macro'

import Row from '@/components/Row'
import ErrorCard from '@/components/ErrorCard'

interface ErrorProps {
  error: any
  onRetry: () => void
}

export default function Error({ error, onRetry }: ErrorProps) {
  return (
    <Row>
      <ErrorCard>
        <Trans>Your payment failed for the following reason:</Trans>
        <br />
        <br />
        <strong>{error}&nbsp;</strong>
        <span onClick={onRetry}>
          <Trans>Retry</Trans>
        </span>
      </ErrorCard>
    </Row>
  )
}
