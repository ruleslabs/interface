import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ClassicModal, { ModalContent } from 'src/components/Modal/Classic'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { ApplicationModal } from 'src/state/application/actions'
import { useAuthModalToggle, useModalOpened } from 'src/state/application/hooks'
import { AuthMode } from 'src/state/auth/actions'
import { useAuthMode } from 'src/state/auth/hooks'
import { storeAccessToken } from 'src/utils/accessToken'

import RemoveTwoFactorAuthSecret from './RemoveTwoFactorAuthSecret'
import RequestPasswordUpdateForm from './RequestPasswordUpdateForm'
import RequestTwoFactorAuthSecretUpdateForm from './RequestTwoFactorAuthSecretUpdateForm'
import SignInForm from './SignInForm'
import TwoFactorAuthForm from './TwoFactorAuthForm'
import { OnSuccessfulConnectionResponse } from './types'
import UpdatePasswordForm from './UpdatePasswordForm'

export default function AuthModal() {
  // nav
  const navigate = useNavigate()

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
        navigate('/onboard')
      }
    },
    [refreshCurrentUser, storeAccessToken, authMode, toggleAuthModal, navigate]
  )

  const modalContent = useMemo(() => {
    switch (authMode) {
      case AuthMode.SIGN_IN:
        return <SignInForm onSuccessfulConnection={onSuccessfulConnection} />

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
