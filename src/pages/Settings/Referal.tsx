import { Trans, t } from '@lingui/macro'
import { useMemo } from 'react'

import DefaultLayout from 'src/components/Layout'
import SettingsLayout from 'src/components/Layout/Settings'
import LongString from 'src/components/Text/LongString'
import Title from 'src/components/Text/Title'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { Column } from 'src/theme/components/Flex'
import * as Text from 'src/theme/components/Text'

function ReferalSettings() {
  // current user
  const { currentUser } = useCurrentUser()

  // referal link
  const referalLink = useMemo(() => `${process.env.PUBLIC_URL}/r/${currentUser?.slug}`, [currentUser?.slug])

  return (
    <Column gap={'48'} width={'full'}>
      <Column gap={'24'}>
        <Title value={t`Invite your friends on Rules and win a pack`} />

        <Text.Body>
          <Trans>
            Share your referal link with your friends and receive a rookie pack for each invitee who buy a pack
          </Trans>
        </Text.Body>

        <LongString value={referalLink} copiable />
      </Column>
    </Column>
  )
}

ReferalSettings.withLayout = () => (
  <DefaultLayout>
    <SettingsLayout>
      <ReferalSettings />
    </SettingsLayout>
  </DefaultLayout>
)

export default ReferalSettings
