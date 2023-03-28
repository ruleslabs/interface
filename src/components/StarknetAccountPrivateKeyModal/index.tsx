import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import { ModalHeader } from '@/components/Modal'
import ClassicModal, { ModalBody, ModalContent } from '@/components/Modal/Classic'
import { useModalOpened, useStarknetAccountPrivateKeyModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import { ErrorCard } from '@/components/Card'
import LongHex from '@/components/Text/LongHex'
import PrivateKeyDecipherForm from '@/components/StarknetSigner/PrivateKeyDecipherForm'

const PrivateKeyWarning = styled(ErrorCard)`
  font-weight: 700;
  font-size: 20px;
  padding: 16px 8px;
  span {
    font-weight: 500;
    font-size: 16px;
    text-decoration: none;
    cursor: unset;
  }
  ${({ theme }) => theme.before.alert``}
`

export default function StarknetAccountPrivateKeyModal() {
  // modal
  const isOpen = useModalOpened(ApplicationModal.STARKNET_ACCOUNT_PRIVATE_KEY)
  const toggleStarknetAccountPrivateKeyModal = useStarknetAccountPrivateKeyModalToggle()

  // private key
  const [privateKey, setPrivateKey] = useState<string | null>(null)
  const handlePrivateKey = useCallback((privateKey: string) => setPrivateKey(privateKey), [])

  useEffect(() => {
    if (isOpen) {
      setPrivateKey(null)
    }
  }, [isOpen])

  return (
    <ClassicModal isOpen={isOpen} onDismiss={toggleStarknetAccountPrivateKeyModal}>
      <ModalContent>
        <ModalHeader title={t`Export your private key`} onDismiss={toggleStarknetAccountPrivateKeyModal} />

        <ModalBody>
          {privateKey ? (
            <Column gap={24}>
              <PrivateKeyWarning>
                <Trans>
                  DO NOT share your private key with anyone!
                  <br />
                  <span>it can be used to steal everything on your wallet (your packs, cards, and ETH)</span>
                </Trans>
              </PrivateKeyWarning>

              <LongHex value={privateKey} />
            </Column>
          ) : (
            <PrivateKeyDecipherForm onPrivateKeyDeciphered={handlePrivateKey} />
          )}
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
