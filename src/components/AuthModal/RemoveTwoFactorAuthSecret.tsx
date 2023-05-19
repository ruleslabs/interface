import { useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { useRouter } from 'next/router'

import { ModalHeader } from '@/components/Modal'
import { ModalContent, ModalBody } from '@/components/Modal/Classic'
import Column, { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { useAuthModalToggle } from '@/state/application/hooks'
import Link from '@/components/Link'
import { PrimaryButton } from '@/components/Button'

import Checkmark from '@/images/checkmark.svg'
import Close from '@/images/close.svg'
import { AuthFormProps } from './types'
import { useRemoveTwoFactorAuthSecret } from '@/graphql/data/Auth'

const StyledCheckmark = styled(Checkmark)`
  border-radius: 50%;
  overflow: visible;
  background: ${({ theme }) => theme.primary1};
  width: 108px;
  height: 108px;
  padding: 24px;
  margin: 0 auto;
  stroke: ${({ theme }) => theme.text1};
`

const StyledFail = styled(Close)`
  border-radius: 50%;
  overflow: visible;
  background: ${({ theme }) => theme.error};
  width: 108px;
  height: 108px;
  padding: 24px;
  margin: 0 auto;
  stroke: ${({ theme }) => theme.text1};
`

const Subtitle = styled(TYPE.body)`
  text-align: center;
  width: 100%;
  max-width: 420px;

  span {
    font-weight: 700;
  }
`

const ConfigureTwoFactorAuthButtonWrapper = styled(ColumnCenter)`
  width: 100%;
  gap: 16px;

  a {
    max-width: 380px;
    width: 100%;
  }

  button {
    height: 50px;
    width: 100%;
  }
`

export default function RemoveTwoFactorAuthSecretForm({ onSuccessfulConnection }: AuthFormProps) {
  // router
  const router = useRouter()
  const { token, email: encodedEmail } = router.query
  const email = useMemo(() => (encodedEmail ? decodeURIComponent(encodedEmail as string) : undefined), [encodedEmail])

  // modal
  const toggleAuthModal = useAuthModalToggle()

  // remove 2fa
  const [removeTwoFactorAuthSecretMutation, { data: accessToken, error }] = useRemoveTwoFactorAuthSecret()
  useEffect(() => {
    if (!email || typeof token !== 'string') {
      toggleAuthModal()
      return
    }

    removeTwoFactorAuthSecretMutation({ variables: { email, token } })
  }, [removeTwoFactorAuthSecretMutation, toggleAuthModal])

  // on access token retrieved
  useEffect(() => {
    if (accessToken) onSuccessfulConnection({ accessToken })
  }, [accessToken, onSuccessfulConnection])

  return (
    <ModalContent>
      <ModalHeader onDismiss={toggleAuthModal} />

      <ModalBody>
        <ColumnCenter gap={32}>
          {error ? (
            <Column gap={24}>
              <StyledFail />

              <Column gap={8}>
                <Subtitle>
                  <Trans>The Two-Factor Authentication has not been removed.</Trans>
                </Subtitle>

                {error?.render()}
              </Column>
            </Column>
          ) : accessToken && (
            <>
              <Column gap={24}>
                <StyledCheckmark />

                <Column gap={8}>
                  <Subtitle>
                    <Trans>The Two-Factor Authentication has been successfully removed.</Trans>
                  </Subtitle>
                </Column>
              </Column>

              <ConfigureTwoFactorAuthButtonWrapper>
                <Link href="/settings/security">
                  <PrimaryButton large>
                    <Trans>Setup a new one</Trans>
                  </PrimaryButton>
                </Link>
              </ConfigureTwoFactorAuthButtonWrapper>
            </>
          )}
        </ColumnCenter>
      </ModalBody>
    </ModalContent>
  )
}
