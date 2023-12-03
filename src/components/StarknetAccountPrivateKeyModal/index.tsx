import { t, Trans } from '@lingui/macro'
import { useCallback, useEffect, useState } from 'react'
import { ErrorCard } from 'src/components/Card'
import Column from 'src/components/Column'
import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import PrivateKeyDecipherForm from 'src/components/StarknetSigner/PrivateKeyDecipherForm'
import LongString from 'src/components/Text/LongString'
import { ApplicationModal } from 'src/state/application/actions'
import { useModalOpened, useStarknetAccountPrivateKeyModalToggle } from 'src/state/application/hooks'
import styled from 'styled-components/macro'

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

              <LongString value={privateKey} copiable />
            </Column>
          ) : (
            <PrivateKeyDecipherForm onPrivateKeyDeciphered={handlePrivateKey} />
          )}
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
