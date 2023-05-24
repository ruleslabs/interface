import { useMemo, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { useRouter } from 'next/router'

import { ModalHeader } from '@/components/Modal'
import { ModalBody } from '@/components/Modal/Classic'
import Column, { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { useAuthModalToggle } from '@/state/application/hooks'
import Link from '@/components/Link'
import { PrimaryButton } from '@/components/Button'

import Checkmark from '@/images/checkmark.svg'
import { AuthFormProps } from './types'
import { useRemoveTwoFactorAuthSecret } from '@/graphql/data/Auth'
import { PaginationSpinner } from '../Spinner'

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

  // success
  const [success, setSuccess] = useState(false)

  // modal
  const toggleAuthModal = useAuthModalToggle()

  // remove 2fa
  const [removeTwoFactorAuthSecretMutation, { loading, error }] = useRemoveTwoFactorAuthSecret()
  useEffect(() => {
    if (!email || typeof token !== 'string') return

    removeTwoFactorAuthSecretMutation({ variables: { email, token } }).then(({ accessToken }) => {
      if (accessToken) {
        onSuccessfulConnection({ accessToken, closeModal: false })
        setSuccess(true)
      }
    })
  }, []) // need state on mount

  return (
    <>
      <ModalHeader onDismiss={toggleAuthModal} />

      <ModalBody>
        <ColumnCenter gap={32}>
          {error?.render()}

          <PaginationSpinner loading={loading} />

          {success && (
            <>
              <Column gap={24}>
                <StyledCheckmark />

                <Column gap={8}>
                  <TYPE.body>
                    <Trans>The Two-Factor Authentication has been successfully removed.</Trans>
                  </TYPE.body>
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
    </>
  )
}
