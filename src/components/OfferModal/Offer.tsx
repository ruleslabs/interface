import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import UsersSearchBar from '@/components/UsersSearchBar'
import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import ErrorCard from '@/components/ErrorCard'
import LockedWallet from '@/components/LockedWallet'

import Arrow from '@/images/arrow.svg'

const CardBreakdown = styled(RowCenter)`
  gap: 16px;
  background: ${({ theme }) => theme.bg5};
  width: 100%;
  padding: 12px;

  & img {
    width: 64px;
    border-radius: 4px;
  }
`

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
`

const TransferSummary = styled(RowCenter)`
  background: ${({ theme }) => theme.bg5};
  padding: 16px 12px;
  gap: 16px;

  & img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  & > div:first-child,
  & > div:last-child {
    flex: 1;
  }
`

const ArrowWrapper = styled(Column)`
  width: 26px;
  height: 26px;
  background: ${({ theme }) => theme.bg5};
  box-shadow: 0px 0px 5px ${({ theme }) => theme.bg1};
  justify-content: center;
  border-radius: 50%;
  position: relative;

  & svg {
    margin: 0 auto;
    width: 16px;
    height: 16px;
    fill: ${({ theme }) => theme.text1};
  }

  ::before,
  ::after {
    content: '';
    width: 1px;
    background: ${({ theme }) => theme.text1}20;
    left: 13px;
    position: absolute;
    display: block;
  }

  ::before {
    top: -16px;
    bottom: 26px;
  }

  ::after {
    top: 26px;
    bottom: -16px;
  }
`

interface OfferProps {
  onRecipientSelected(recipientAddress: string): void
  artistName: string
  season: number
  scarcityName: string
  scarcityMaxSupply?: number
  serialNumber: number
  pictureUrl: string
}

export default function Offer({
  onRecipientSelected,
  artistName,
  season,
  scarcityName,
  scarcityMaxSupply,
  serialNumber,
  pictureUrl,
}: OfferProps) {
  const currentUser = useCurrentUser()

  const [recipient, setRecipient] = useState<any | null>(null)
  const handleConfirmation = useCallback(() => {
    if (!recipient) return // to enforce recipient typing
    onRecipientSelected(recipient.starknetWallet.address)
  }, [recipient])

  return (
    <Column gap={24}>
      <CardBreakdown>
        <img src={pictureUrl} />
        <Column gap={4}>
          <TYPE.body spanColor="text2">
            {artistName} S{season}&nbsp;
            <Trans id={scarcityName} render={({ translation }) => <>{translation}</>} />
          </TYPE.body>
          <TYPE.subtitle>
            #{serialNumber} / {scarcityMaxSupply ?? '4000'}
          </TYPE.subtitle>
        </Column>
      </CardBreakdown>

      {currentUser?.starknetWallet.needsSignerPublicKeyUpdate ? (
        <ErrorCard>
          <LockedWallet />
        </ErrorCard>
      ) : (
        <>
          <RowCenter gap={16}>
            <TYPE.body style={{ whiteSpace: 'nowrap' }}>
              <Trans>Send to</Trans>
            </TYPE.body>
            <UsersSearchBar onSelect={setRecipient} />
          </RowCenter>

          <TransferSummary>
            <RowCenter gap={12}>
              <img src={currentUser.profile.pictureUrl} />
              <TYPE.body fontSize={14}>
                <Trans>My account</Trans>
              </TYPE.body>
            </RowCenter>

            <ArrowWrapper>
              <Arrow />
            </ArrowWrapper>

            <RowCenter gap={12}>
              {recipient && (
                <>
                  <img src={recipient.profile.pictureUrl} />
                  <TYPE.body fontSize={14}>{recipient.username}</TYPE.body>
                </>
              )}
            </RowCenter>
          </TransferSummary>
        </>
      )}

      <PrimaryButton onClick={handleConfirmation} disabled={!recipient?.starknetWallet.address} large>
        <Trans>Next</Trans>
      </PrimaryButton>
    </Column>
  )
}
