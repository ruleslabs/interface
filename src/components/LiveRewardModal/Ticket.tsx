import styled, { DefaultTheme, useTheme } from 'styled-components/macro'
import { QRCodeSVG } from 'qrcode.react'
import { t } from '@lingui/macro'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from 'src/components/Modal/Classic'
import { useLiveRewardTicketModalToggle, useModalOpened } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import { LiveReward } from 'src/components/Settings/LiveRewards'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { TYPE } from 'src/styles/theme'
import { ColumnCenter } from 'src/components/Column'

import { ReactComponent as TicketBg } from 'src/images/ticket-bg.svg'

const Ticket = styled(ColumnCenter)`
  position: relative;
  z-index: 1;
  width: 300px;
  padding: 24px;
  gap: 29px; // 24px dotted line height (5px)
  margin: 0 auto;

  & > svg {
    z-index: -1;
    position: absolute;
    fill: ${({ theme }) => theme.bg3}40;
    stroke: ${({ theme }) => theme.bg3}80;
    display: block;
    width: 300px;
  }
`

const QRCodeWrapper = styled.div`
  & > svg {
    margin: 0 auto;
    display: block;
    height: 252px;
    width: 252px;
    margin-top: 24px;
  }
`

const TitleWrapper = styled(ColumnCenter)`
  padding: 16px 4px;
  height: 100px;
  width: 100%;
  justify-content: center;

  & > div {
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 1.2px;
    text-align: center;
    font-size: 24px;
  }
`

interface LiveRewardTicketModalProps {
  liveReward?: LiveReward
}

export default function LiveRewardTicketModal({ liveReward }: LiveRewardTicketModalProps) {
  // currentUser
  const { currentUser } = useCurrentUser()

  // theme
  const theme = useTheme() as DefaultTheme

  // modal
  const toggleLiveRewardTicketModal = useLiveRewardTicketModalToggle()
  const isOpen = useModalOpened(ApplicationModal.LIVE_REWARD_TICKET)

  if (!liveReward) return null

  return (
    <ClassicModal onDismiss={toggleLiveRewardTicketModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleLiveRewardTicketModal} title={t`Live reward | Ticket`} />

        <ModalBody>
          <Ticket>
            <TicketBg />

            <QRCodeWrapper>
              <QRCodeSVG
                value={`${process.env.PUBLIC_URL}/?action=claim-live-reward&userId=${currentUser?.id}&liveRewardId=${liveReward.id}`}
                bgColor={`transparent`}
                fgColor={theme.text1}
              />
            </QRCodeWrapper>

            <TitleWrapper>
              <TYPE.large>{liveReward.displayName}</TYPE.large>
            </TitleWrapper>
          </Ticket>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
