import { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { ApolloError } from '@apollo/client'
import { Trans } from '@lingui/macro'
import { useRouter } from 'next/router'

import { ModalHeader } from '@/components/Modal'
import { ModalContent, ModalBody } from '@/components/Modal/Classic'
import Column, { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { useRemoveTwoFactorAuthSecretMutation } from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import Link from '@/components/Link'
import { PrimaryButton } from '@/components/Button'

import Checkmark from '@/images/checkmark.svg'
import Close from '@/images/close.svg'
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
  // Loading
  const [loading, setLoading] = useState(true)

  // router
  const router = useRouter()
  const { token, email: encodedEmail, username } = router.query
  const email = useMemo(() => (encodedEmail ? decodeURIComponent(encodedEmail as string) : undefined), [encodedEmail])

  // modal
  const toggleAuthModal = useAuthModalToggle()

  // errors
  const [error, setError] = useState<{ message?: string; id?: string }>({})

  // graphql mutations
  const [removeTwoFactorAuthSecretMutation] = useRemoveTwoFactorAuthSecretMutation()

  // remove 2fa
  useEffect(() => {
    removeTwoFactorAuthSecretMutation({ variables: { email, token } })
      .then((res: any) => {
        onSuccessfulConnection({ accessToken: res?.data?.removeTwoFactorAuthSecret?.accessToken })
        setLoading(false)
      })
      .catch((updatePasswordError: ApolloError) => {
        const error = updatePasswordError?.graphQLErrors?.[0]
        if (error) setError({ message: error.message, id: error.extensions?.id as string })
        else setError({ message: 'Unknown error' })

        setLoading(false)
        console.error(updatePasswordError)
      })
  }, [])

  return (
    <ModalContent>
      <ModalHeader onDismiss={toggleAuthModal} />

      <ModalBody>
        <ColumnCenter gap={32}>
          {error.message && (
            <Column gap={24}>
              <StyledFail />

              <Column gap={8}>
                <Subtitle>
                  <Trans>The Two-Factor Authentication has not been removed.</Trans>
                </Subtitle>
                <Trans
                  id={error.message}
                  render={({ translation }) => <Subtitle color="error">{translation}</Subtitle>}
                />
              </Column>
            </Column>
          )}
          {!error.message && !loading && (
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
