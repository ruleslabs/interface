import { useState, useCallback, useEffect } from 'react'

import Modal from '@/components/Modal'
import { useModalOpen, useWithdrawModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'

import Withdraw from './Withdraw'
import Retrieve from './Retrieve'

export default function AuthModal() {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpen(ApplicationModal.WITHDRAW)
  const toggleWithdrawModal = useWithdrawModalToggle()

  // L1
  const [retrieve, setRetrieve] = useState(false)
  const toggleRetrieve = useCallback(() => setRetrieve(!retrieve), [retrieve])

  useEffect(() => {
    if (isOpen) {
      setRetrieve(false)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={toggleWithdrawModal} isOpen={isOpen}>
      {retrieve ? <Retrieve onDismiss={toggleRetrieve} /> : <Withdraw onRetrieve={toggleRetrieve} />}
    </Modal>
  )
}
