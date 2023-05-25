import styled from 'styled-components/macro'
import { Trans, t } from '@lingui/macro'
import { Trans as TransReact } from '@lingui/react'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from 'src/components/Modal/Classic'
import { useLiveRewardDetailsModalToggle, useModalOpened } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import { TYPE } from 'src/styles/theme'
import { LiveReward } from 'src/components/Settings/LiveReward'
import Column from 'src/components/Column'
import { RowCenter } from 'src/components/Row'
import useFormatedDate from 'src/hooks/useFormatedDate'
import CardBreakdown from 'src/components/MarketplaceModal/CardBreakdown'

import { ReactComponent as PinIcon } from 'src/images/pin.svg'
import { ReactComponent as CalendarIcon } from 'src/images/calendar.svg'

const InformationRow = styled(RowCenter)`
  gap: 12px;

  & * {
    font-weight: 300;
  }

  svg {
    width: 24px;
    height: 24px;
    fill: ${({ theme }) => theme.text2};
  }
`

const Requirements = styled(Column)`
  gap: 16px;

  & > * {
    padding: 8px 12px;
    border-radius: 6px;
    background: ${({ theme }) => theme.bg3}40;
    border: 1px solid ${({ theme }) => theme.bg3}80;
  }
`

const ELIGIBILITY_DESCRIPTION: { [key: string]: string } = {
  packOrdersCount: t`Purchased packs`,
}

interface LiveRewardDetailsModalProps {
  liveReward?: LiveReward
}

export default function LiveRewardDetailsModal({ liveReward }: LiveRewardDetailsModalProps) {
  const toggleLiveRewardDetailsModal = useLiveRewardDetailsModalToggle()
  const isOpen = useModalOpened(ApplicationModal.LIVE_REWARD_DETAILS)

  // date
  const formatedDate = useFormatedDate(liveReward?.date)

  if (!liveReward) return null

  return (
    <ClassicModal onDismiss={toggleLiveRewardDetailsModal} isOpen={isOpen}>
      <ModalContent>
        <TransReact
          id={liveReward.displayName}
          render={({ translation }) => (
            <ModalHeader onDismiss={toggleLiveRewardDetailsModal} title={translation as string} />
          )}
        />

        <ModalBody>
          <Column gap={24}>
            <TYPE.medium>
              <Trans>PRACTICAL INFORMATION</Trans>
            </TYPE.medium>
            <InformationRow>
              <CalendarIcon />
              <TYPE.body>{formatedDate}</TYPE.body>
            </InformationRow>

            <InformationRow>
              <PinIcon />
              <TYPE.body>{liveReward.location}</TYPE.body>
            </InformationRow>

            <div />

            <TYPE.medium>
              <Trans>ELIGIBILITY REQUIREMENTS</Trans>
            </TYPE.medium>

            <Requirements>
              {liveReward.eligibility
                .filter(({ key }) => !!ELIGIBILITY_DESCRIPTION[key])
                .map(({ key, value }) => (
                  <RowCenter key={key} gap={8}>
                    <TYPE.subtitle>{ELIGIBILITY_DESCRIPTION[key]}</TYPE.subtitle>
                    <TYPE.subtitle>-</TYPE.subtitle>
                    <TYPE.medium>x{value}</TYPE.medium>
                  </RowCenter>
                ))}
            </Requirements>

            <div />

            <TYPE.medium>
              <Trans>REWARD</Trans>
            </TYPE.medium>

            <CardBreakdown
              pictureUrl={liveReward.cardModelReward.pictureUrl}
              season={liveReward.cardModelReward.season}
              artistName={liveReward.cardModelReward.artist.displayName}
              scarcityName={liveReward.cardModelReward.scarcity.name}
              serialNumbers={[]}
            />
          </Column>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
