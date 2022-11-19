import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import Input from '@/components/Input'
import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
// import { PrimaryButton } from '@/components/Button'
import { ErrorCard } from '@/components/Card'
import PrivateKeyDecipherForm from '@/components/StarknetSigner/PrivateKeyDecipherForm'

const LongHexWrapper = styled.div`
  & > div {
    padding: 12px 8px;

    :focus-within {
      outline: none;
    }
  }

  input {
    height: unset;
  }
`

const PrivateKeyWarning = styled(ErrorCard)`
  font-weight: 700;
  font-size: 20px;
  padding: 16px 8px;

  span {
    font-weight: 500;
    font-size: 16px;
    text-decoration: none;
    cursor: unset;
  }

  ${({ theme }) => theme.before.alert``}
`

interface LongHexProps {
  children: string
}

const LongHex = ({ children }: LongHexProps) => (
  <LongHexWrapper>
    <Input value={children} onUserInput={() => {}} />
  </LongHexWrapper>
)

export default function AdvanceWalletSettings() {
  // current user
  const currentUser = useCurrentUser()

  // private key
  const [privateKey, setPrivateKey] = useState<string | null>(null)
  const handlePrivateKey = useCallback((privateKey: string) => setPrivateKey(privateKey), [])

  return (
    <Column gap={48}>
      <Column gap={8}>
        <TYPE.medium>
          <Trans>Wallet address</Trans>
        </TYPE.medium>
        <LongHex>{currentUser.starknetWallet.address}</LongHex>
      </Column>

      <Column gap={8}>
        <TYPE.medium>
          <Trans>Private key</Trans>
        </TYPE.medium>

        <PrivateKeyWarning>
          <Trans>
            DO NOT share your private key with anyone!
            <br />
            <span>it can be used to steal everything on your wallet (your packs, cards, and ETH)</span>
          </Trans>
        </PrivateKeyWarning>

        {privateKey ? (
          <LongHex>{privateKey}</LongHex>
        ) : (
          <>
            <div />
            <PrivateKeyDecipherForm
              confirmationActionText={t`Reveal the private key`}
              onPrivateKeyDeciphered={handlePrivateKey}
            />
          </>
        )}
      </Column>
    </Column>
  )
}
