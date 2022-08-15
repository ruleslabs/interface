import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import UsersSearchBar from '@/components/UsersSearchBar'
import { useCurrentUser } from '@/state/user/hooks'
import Column, { ColumnCenter } from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import User from '@/components/User'

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
`

const TransferSummary = styled(ColumnCenter)`
  gap: 16px;
`

interface OfferProps {
  onError(error: string): void
  onConfirmation(recipientAddress: string): void
}

export default function Offer({ onError, onConfirmation }: OfferProps) {
  const currentUser = useCurrentUser()

  const [recipient, setRecipient] = useState<any | null>(null)
  const handleConfirmation = useCallback(() => {
    if (!recipient) return // to enforce recipient typing
    onConfirmation(recipient.starknetAddress)
  }, [recipient])

  return (
    <Column gap={24}>
      <RowCenter gap={16}>
        <TYPE.body style={{ whiteSpace: 'nowrap' }}>
          <Trans>Send to</Trans>
        </TYPE.body>
        <UsersSearchBar onSelect={setRecipient} />
      </RowCenter>

      {recipient && (
        <TransferSummary>
          <TYPE.body textAlign="center">Your card will be offered to</TYPE.body>
          <User
            username={recipient.username}
            pictureUrl={recipient.profile.pictureUrl}
            certified={recipient.profile.certified}
            size="sm"
          />
        </TransferSummary>
      )}

      <PrimaryButton onClick={handleConfirmation} disabled={!recipient?.starknetAddress} large>
        <Trans>Offer</Trans>
      </PrimaryButton>
    </Column>
  )
}
