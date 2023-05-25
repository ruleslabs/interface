import styled from 'styled-components/macro'

import { TYPE } from 'src/styles/theme'
import { IconButton } from 'src/components/Button'
import { RowBetween } from 'src/components/Row'
import Caret from 'src/components/Caret'

import { ReactComponent as CloseIcon } from 'src/images/close.svg'

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
    width: 16px;
    height: 16px;
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
