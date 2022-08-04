import { useCallback } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import Modal from '@/components/Modal'
import Column from '@/components/Column'
import { useModalOpen, useAuthModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import { storeAccessToken } from '@/utils/accessToken'
import { useQueryCurrentUser } from '@/state/user/hooks'

import EmailVerificationForm from './EmailVerificationForm'
import SignUpForm from './SignUpForm'
import SignInForm from './SignInForm'
import UpdatePasswordForm from './UpdatePasswordForm'
import RemoveTwoFactorAuthSecret from './RemoveTwoFactorAuthSecret'
import RequestPasswordUpdateForm from './RequestPasswordUpdateForm'
import RequestTwoFactorAuthSecretUpdateForm from './RequestTwoFactorAuthSecretUpdateForm'
import TwoFactorAuthForm from './TwoFactorAuthForm'

const StyledAuthModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

export default function AuthModal() {
  const router = useRouter()

  // modal
  const isOpen = useModalOpen(ApplicationModal.AUTH)
  const toggleAuthModal = useAuthModalToggle()

  const authMode = useAuthMode()

  // Current user
  const queryCurrentUser = useQueryCurrentUser()
  const onSuccessfulConnection = useCallback(
    async (accessToken?: string, onboard = false, toggleModal = true) => {
      storeAccessToken(accessToken ?? '')
      const currentUser = await queryCurrentUser()

      if (currentUser) {
        if (onboard) router.push('/onboard')
        if (toggleModal) toggleAuthModal()
      } else window.location.reload()
    },
    [queryCurrentUser, toggleAuthModal, router]
  )

  const renderModal = (authMode: AuthMode | null) => {
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
  }

  return (
    <Modal onDismiss={toggleAuthModal} isOpen={isOpen} autoClose={false}>
      <StyledAuthModal gap={26}>{renderModal(authMode)}</StyledAuthModal>
    </Modal>
  )
}
