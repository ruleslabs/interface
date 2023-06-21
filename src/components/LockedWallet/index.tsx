import { constants } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import useCurrentUser from 'src/hooks/useCurrentUser'
import { ErrorCard, InfoCard } from '../Card'
import * as Text from 'src/theme/components/Text'
import { Column } from 'src/theme/components/Flex'
import SignerEscape from './SignerEscape'

export default function LockedWallet() {
  const { currentUser } = useCurrentUser()
  const { lockingReason } = currentUser?.starknetWallet ?? {}

  // returns

  switch (lockingReason) {
    case undefined:
      return null

    case constants.StarknetWalletLockingReason.FORCED_UPGRADE:
      return (
        <InfoCard>
          <Trans>
            We are performing a manual upgrade of your wallet. For this purpose, your wallet has to be locked. Your
            access will be recovered in a few days.
          </Trans>
        </InfoCard>
      )

    case constants.StarknetWalletLockingReason.SIGNER_ESCAPE:
      return <SignerEscape />

    case constants.StarknetWalletLockingReason.MAINTENANCE:
      return (
        <InfoCard>
          <Column gap={'24'}>
            <Text.HeadlineSmall>
              <Trans>We are improving Rules !</Trans>
            </Text.HeadlineSmall>

            <Text.Body>
              <Trans>Your wallet is in maintenance, it will be resolved very soon</Trans>
            </Text.Body>
          </Column>
        </InfoCard>
      )

    default:
      return (
        <ErrorCard>
          <Trans>Your wallet is locked for an unknown reason, please contact support on discord</Trans>
        </ErrorCard>
      )
  }
}
