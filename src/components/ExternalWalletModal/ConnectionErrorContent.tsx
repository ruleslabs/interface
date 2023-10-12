import { t } from '@lingui/macro'

import { PrimaryButton, SecondaryButton } from '../Button'
import * as Text from 'src/theme/components/Text'
import { ActivationStatus } from 'src/zustand/l1Wallet'
import noop from 'src/utils/noop'
import { Column } from 'src/theme/components/Flex'
import { useL1ActivationState } from 'src/hooks/useL1WalletActivation'
import { ModalBody } from 'src/components/Modal/Classic'
import { ModalHeader } from 'src/components/Modal'
import { useEthereumWalletConnectModalToggle } from 'src/state/application/hooks'

// TODO(cartcrom): move this to a top level modal, rather than inline in the drawer
export default function ConnectionErrorContent() {
  // modal
  const toggleEthereumWalletConnectModal = useEthereumWalletConnectModalToggle()

  // wallet activation
  const { activationState, tryActivation, cancelActivation } = useL1ActivationState()

  if (activationState.status !== ActivationStatus.ERROR || !activationState.connection) return null

  // idk why ts cannot detect that connection cannot be null at this point of the code :/
  const retry = () => activationState.connection && tryActivation(activationState.connection, noop)

  return (
    <>
      <ModalHeader title={t`Error connecting`} onDismiss={toggleEthereumWalletConnectModal} />

      <ModalBody>
        <Column>
          <Text.Body marginBottom={'24'} textAlign={'center'}>
            The connection attempt failed. Please click try again and follow the steps to connect in your wallet.
          </Text.Body>

          <PrimaryButton onClick={retry} marginBottom={'12'}>
            Try Again
          </PrimaryButton>

          <SecondaryButton onClick={cancelActivation}>Back to wallet selection</SecondaryButton>
        </Column>
      </ModalBody>
    </>
  )
}
