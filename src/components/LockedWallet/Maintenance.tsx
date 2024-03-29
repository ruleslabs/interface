import { Trans } from '@lingui/macro'
import { Column } from 'src/theme/components/Flex'
import * as Text from 'src/theme/components/Text'

import { InfoCard } from '../Card'

export default function Maintenance() {
  return (
    <InfoCard>
      <Column gap="24">
        <Text.HeadlineSmall>
          <Trans>We are improving Rules !</Trans>
        </Text.HeadlineSmall>

        <Text.Body>
          <Trans>Your wallet is in maintenance, it will be resolved very soon</Trans>
        </Text.Body>
      </Column>
    </InfoCard>
  )
}
