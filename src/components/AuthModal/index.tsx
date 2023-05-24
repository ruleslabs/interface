import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'

import ClassicModal, { ModalContent } from '@/components/Modal/Classic'
import { useModalOpened, useAuthModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import { storeAccessToken } from '@/utils/accessToken'

import EmailVerificationForm from './EmailVerificationForm'
import SignUpForm from './SignUpForm'
import SignInForm from './SignInForm'
import UpdatePasswordForm from './UpdatePasswordForm'
import RemoveTwoFactorAuthSecret from './RemoveTwoFactorAuthSecret'
import RequestPasswordUpdateForm from './RequestPasswordUpdateForm'
import RequestTwoFactorAuthSecretUpdateForm from './RequestTwoFactorAuthSecretUpdateForm'
import TwoFactorAuthForm from './TwoFactorAuthForm'
import useCurrentUser from '@/hooks/useCurrentUser'
import { OnSuccessfulConnectionResponse } from './types'

export default function AuthModal() {
  const router = useRouter()

  // modal
  const isOpen = useModalOpened(ApplicationModal.AUTH)
  const toggleAuthModal = useAuthModalToggle()

  const authMode = useAuthMode()

  // Current user
  const { refreshCurrentUser } = useCurrentUser()
  const onSuccessfulConnection = useCallback(
    ({ accessToken, closeModal = true }: OnSuccessfulConnectionResponse) => {
      storeAccessToken(accessToken)
      refreshCurrentUser()

      if (closeModal) {
        toggleAuthModal()
      }

      // onboard if user is new
      if (authMode === AuthMode.EMAIL_VERIFICATION) {
        router.push('/onboard')
      }
    },
    [refreshCurrentUser, storeAccessToken, router, authMode, toggleAuthModal]
  )

  const modalContent = useMemo(() => {
    switch (authMode) {
      case AuthMode.SIGN_IN:
        return <SignInForm onSuccessfulConnection={onSuccessfulConnection} />

      case AuthMode.SIGN_UP:
        return <SignUpForm />

      case AuthMode.EMAIL_VERIFICATION:
        return <EmailVerificationForm onSuccessfulConnection={onSuccessfulConnection} />

      case AuthMode.REQUEST_PASSWORD_UPDATE:
        return <RequestPasswordUpdateForm />

      case AuthMode.REQUEST_TWO_FACTOR_AUTH_UPDATE:
        return <RequestTwoFactorAuthSecretUpdateForm />

      case AuthMode.UPDATE_PASSWORD:
        return <UpdatePasswordForm onSuccessfulConnection={onSuccessfulConnection} />

      case AuthMode.REMOVE_TWO_FACTOR_AUTH_SECRET:
        return <RemoveTwoFactorAuthSecret onSuccessfulConnection={onSuccessfulConnection} />

      case AuthMode.TWO_FACTOR_AUTH:
        return <TwoFactorAuthForm onSuccessfulConnection={onSuccessfulConnection} />
    }
    return null
  }, [authMode, onSuccessfulConnection])

  return (
    <ClassicModal onDismiss={toggleAuthModal} isOpen={isOpen}>
      <ModalContent>{modalContent}</ModalContent>
    </ClassicModal>
  )
}
