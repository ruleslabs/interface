import styled from 'styled-components'

import { TYPE } from '@/styles/theme'
import { IconButton } from '@/components/Button'
import { RowBetween } from '@/components/Row'
import Caret from '@/components/Caret'

import CloseIcon from '@/images/close.svg'

// MODAL HEADER

const StyledModalHeader = styled(RowBetween)`
  min-height: 64px;
  align-items: center;
  padding: 0 8px;
  border-style: solid;
  border-color: ${({ theme }) => theme.bg3}80;
  border-width: 0 0 1px;

  & > div {
    min-width: 32px;
  }
`

const BackButton = styled(IconButton)`
  svg {
    margin-right: 2px; // needed to make it looks better centered
  }
`

interface ModalHeaderProps {
  onDismiss: () => void
  onBack?: () => void
  title?: string
}

export function ModalHeader({ title, onDismiss, onBack }: ModalHeaderProps) {
  return (
    <StyledModalHeader>
      {onBack ? (
        <BackButton onClick={onBack}>
          <Caret direction="left" />
        </BackButton>
      ) : (
        <div />
      )}

      <TYPE.medium>{title}</TYPE.medium>

      <IconButton onClick={onDismiss}>
        <CloseIcon />
      </IconButton>
    </StyledModalHeader>
  )
}
