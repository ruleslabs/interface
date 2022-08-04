import { useState, useMemo, useEffect } from 'react'
import { ApolloError } from '@apollo/client'
import { Trans, t } from '@lingui/macro'
import { useRouter } from 'next/router'

import { ModalHeader } from '@/components/Modal'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { useRemoveTwoFactorAuthSecretMutation } from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'

interface RemoveTwoFactorAuthSecretFormProps {
  onSuccessfulConnection: (accessToken?: string, onboard?: boolean) => void
}

export default function RemoveTwoFactorAuthSecretForm({ onSuccessfulConnection }: RemoveTwoFactorAuthSecretFormProps) {
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
        onSuccessfulConnection(res?.data?.removeTwoFactorAuthSecret?.accessToken, false, false)
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
    <>
      <ModalHeader onDismiss={toggleAuthModal}>{t`Remove Two-Factor Authentication`}</ModalHeader>

      <Column gap={26}>
        {error.message && (
          <Trans id={error.message} render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>} />
        )}

        {!error.message && !loading && <TYPE.body>Bravo ! (Je vais afficher un meilleur truc plus tard)</TYPE.body>}
      </Column>
    </>
  )
}
