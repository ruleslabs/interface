import { useState, useCallback, useEffect } from 'react'

import Modal from '@/components/Modal'
import { useModalOpen, useWithdrawModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import ComingSoon, { WHITELIST } from '@/components/MarketplaceModal/ComingSoon'
import { useCurrentUser } from '@/state/user/hooks'

import Withdraw from './Withdraw'
import L1Claim from './L1Claim'

export default function AuthModal() {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpen(ApplicationModal.WITHDRAW)
  const toggleWithdrawModal = useWithdrawModalToggle()

  // L1
  const [l1Claim, setL1Claim] = useState(false)
  const toggleL1Claim = useCallback(() => setL1Claim(!l1Claim), [l1Claim])

  useEffect(() => {
    if (isOpen) {
      setL1Claim(false)
    }
  }, [isOpen])

  if (!WHITELIST.includes(currentUser?.slug)) return <ComingSoon onDismiss={toggleWithdrawModal} isOpen={isOpen} />

  return (
    <Modal onDismiss={toggleWithdrawModal} isOpen={isOpen}>
      {l1Claim ? <L1Claim onDismiss={toggleL1Claim} /> : <Withdraw onL1Claim={toggleL1Claim} />}
    </Modal>
  )
}
