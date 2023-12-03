import { Trans } from '@lingui/macro'
import { useEffect, useMemo, useState } from 'react'
import { PrimaryButton } from 'src/components/Button'
import Column, { ColumnCenter } from 'src/components/Column'
import Link from 'src/components/Link'
import { ModalHeader } from 'src/components/Modal'
import { ModalBody } from 'src/components/Modal/Classic'
import { useRemoveTwoFactorAuthSecret } from 'src/graphql/data/Auth'
import useLocationQuery from 'src/hooks/useLocationQuery'
import { ReactComponent as Checkmark } from 'src/images/checkmark.svg'
import { useAuthModalToggle } from 'src/state/application/hooks'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

import { PaginationSpinner } from '../Spinner'
import { AuthFormProps } from './types'

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
  // query
  const query = useLocationQuery()
  const token = query.get('token')
  const encodedEmail = query.get('email')
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
