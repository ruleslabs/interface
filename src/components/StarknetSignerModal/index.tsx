import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { Trans, t } from '@lingui/macro'

import Input from '@/components/Input'
import Modal, { ModalHeader } from '@/components/Modal'
import { useStarknetSignerModalToggle, useModalOpen } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { DecryptionError } from '@/utils/encryption'
import { decryptRulesPrivateKey } from '@/utils/wallet'
import { PrimaryButton } from '@/components/Button'

const PRIVATE_KEY_QUERY = gql`
  query {
    currentUser {
      rulesPrivateKey {
        encryptedPrivateKey
        iv
        salt
      }
    }
  }
`

const StyledStarknetSignerModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;
`

const SubmitButton = styled(PrimaryButton)`
  width: 100%;
  height: 55px;
  margin-top: 12px;
`

interface Transaction {
  title: string
  action: string
}

interface StarknetSignerModalProps {
  transaction: Transaction
  callback: (tx: string) => void
}

export default function StarknetSignerModal({ transaction, callback }: StarknetSignerModalProps) {
  const toggleStarknetSignerModal = useStarknetSignerModalToggle()
  const isOpen = useModalOpen(ApplicationModal.STARKNET_SIGNER)

  const [password, setPassword] = useState('')
  const onPasswordInput = useCallback((value: string) => setPassword(value), [setPassword])

  const rulesPrivateKeyQuery = useQuery(PRIVATE_KEY_QUERY)

  const rulesPrivateKey = rulesPrivateKeyQuery.data?.currentUser?.rulesPrivateKey
  const isValid = rulesPrivateKey && !rulesPrivateKeyQuery.error
  const isLoading = rulesPrivateKeyQuery.loading

  const signTransaction = useCallback(
    (event) => {
      event.preventDefault()

      decryptRulesPrivateKey(rulesPrivateKey, password)
        .then((res: string) => {
          console.log(res)
          console.log('sign transaction') // TODO
          toggleStarknetSignerModal()
          callback('0x00dead00')
        })
        .catch((error: DecryptionError) => {
          console.error(error)
        })
    },
    [password, rulesPrivateKey, toggleStarknetSignerModal]
  )

  return (
    <Modal onDismiss={toggleStarknetSignerModal} isOpen={isOpen && !!transaction}>
      <StyledStarknetSignerModal gap={26}>
        <Trans
          id={transaction.title}
          render={({ translation }) => <ModalHeader onDismiss={toggleStarknetSignerModal}>{translation}</ModalHeader>}
        />
        {isLoading ? (
          <TYPE.body textAlign="center">Loading...</TYPE.body>
        ) : !isValid ? (
          <TYPE.body textAlign="center">
            <Trans>An error has occured</Trans>
          </TYPE.body>
        ) : (
          <form onSubmit={signTransaction}>
            <Input
              id="password"
              value={password}
              placeholder={t`Password`}
              type="password"
              autoComplete="password"
              onUserInput={onPasswordInput}
              $valid={true}
            />
            <Trans
              id={transaction.action}
              render={({ translation }) => (
                <SubmitButton type="submit" large>
                  {translation}
                </SubmitButton>
              )}
            />
          </form>
        )}
      </StyledStarknetSignerModal>
    </Modal>
  )
}
