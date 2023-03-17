import { t } from '@lingui/macro'

import Column from '@/components/Column'
import DiscordStatus from '@/components/DiscordStatus'
import { Title } from './SubComponents'

export default function DiscordSettings() {
  return (
    <Column gap={16}>
      <Title value={t`Discord`} />
      <DiscordStatus redirectPath="/settings/profile" />
    </Column>
  )
}
