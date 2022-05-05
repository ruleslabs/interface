import { useCallback } from 'react'
import styled from 'styled-components'

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
  // modal
  const isOpen = useModalOpen(ApplicationModal.AUTH)
  const toggleAuthModal = useAuthModalToggle()

  const authMode = useAuthMode()

  // Current user
  const queryCurrentUser = useQueryCurrentUser()
  const onSuccessfulConnexion = useCallback(
    async (accessToken?: string) => {
      storeAccessToken(accessToken ?? '')
      const currentUser = await queryCurrentUser()

      if (!!currentUser) toggleAuthModal()
      else window.location.reload()
    },
    [queryCurrentUser, toggleAuthModal]
  )

  const renderModal = (authMode: AuthMode | null) => {
    switch (authMode) {
      case AuthMode.SIGN_IN:
        return <SignInForm onSuccessfulConnexion={onSuccessfulConnexion} />
      case AuthMode.SIGN_UP:
        return <SignUpForm />
      case AuthMode.EMAIL_VERIFICATION:
        return <EmailVerificationForm onSuccessfulConnexion={onSuccessfulConnexion} />
    }
    return null
  }

  return (
    <Modal onDismiss={toggleAuthModal} isOpen={isOpen}>
      <StyledAuthModal gap={26}>{renderModal(authMode)}</StyledAuthModal>
    </Modal>
  )
}
