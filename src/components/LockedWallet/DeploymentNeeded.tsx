import { useCallback, useMemo } from 'react'
import { Trans } from '@lingui/macro'

import { WalletModalMode } from 'src/state/wallet/actions'
import { ApplicationModal } from 'src/state/application/actions'
import { useSetWalletModalMode } from 'src/state/wallet/hooks'
import { useOpenModal } from 'src/state/application/hooks'
import { Column } from 'src/theme/components/Flex'
import * as Text from 'src/theme/components/Text'
import { PrimaryButton, SecondaryButton } from '../Button'

interface DeploymentNeededProps {
  priority?: 'primary' | 'secondary'
}

export default function DeploymentNeeded({ priority = 'primary' }: DeploymentNeededProps) {
  // deploy modal
  const openModal = useOpenModal(ApplicationModal.WALLET)
  const setWalletModalMode = useSetWalletModalMode()

  const openDeployModal = useCallback(() => {
    openModal()
    setWalletModalMode(WalletModalMode.DEPLOY)
  }, [])

  // button
  const Button = useMemo(() => {
    switch (priority) {
      case 'primary':
        return PrimaryButton

      case 'secondary':
        return SecondaryButton
    }
  }, [priority])

  return (
    <Column gap={'24'}>
      <Text.HeadlineSmall>
        <Trans>Your wallet is not deployed, you need to deploy it to interact with other users on Rules.</Trans>
      </Text.HeadlineSmall>

      <Button onClick={openDeployModal} large>
        <Trans>Deploy</Trans>
      </Button>
    </Column>
  )
}
