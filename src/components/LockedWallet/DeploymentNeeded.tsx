import { Trans } from '@lingui/macro'
import { useCallback } from 'react'
import { ApplicationModal } from 'src/state/application/actions'
import { useOpenModal } from 'src/state/application/hooks'
import { WalletModalMode } from 'src/state/wallet/actions'
import { useSetWalletModalMode } from 'src/state/wallet/hooks'
import { Column } from 'src/theme/components/Flex'
import * as Text from 'src/theme/components/Text'

import { PrimaryButton } from '../Button'

export default function DeploymentNeeded() {
  // deploy modal
  const openModal = useOpenModal(ApplicationModal.WALLET)
  const setWalletModalMode = useSetWalletModalMode()

  const openDeployModal = useCallback(() => {
    openModal()
    setWalletModalMode(WalletModalMode.DEPLOY)
  }, [])

  return (
    <Column gap="24">
      <Text.HeadlineSmall>
        <Trans>Your wallet is not deployed, you need to deploy it to interact with other users on Rules.</Trans>
      </Text.HeadlineSmall>

      <PrimaryButton onClick={openDeployModal} large>
        <Trans>Deploy</Trans>
      </PrimaryButton>
    </Column>
  )
}
