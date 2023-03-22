import '@reach/dialog/styles.css'

import React, { useCallback } from 'react'
import styled from 'styled-components'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import { animated, useTransition } from 'react-spring'

import { BackButton, IconButton } from '@/components/Button'
import Column from '@/components/Column'
import useCloseModalOnNavigation from '@/hooks/useCloseModalOnNavigation'
import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'

import Close from '@/images/close.svg'
import { round } from '@/utils/math'

// overlay

const ClassicDialogOverlay = styled(animated(DialogOverlay))`
  &[data-reach-dialog-overlay] {
    z-index: 9999;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${({ theme }) => theme.black}80;
  }
`

// content

const ClassicDialogContent = styled(DialogContent)`
  background: transparent;
  width: fit-content;
  padding: 0;
  margin: 0;
  position: fixed;

  ${({ theme }) => theme.media.medium`
    top: 0;
    bottom: 0;
    width: 100%;
  `}
`

interface ClassicModalProps {
  children: React.HTMLAttributes<HTMLDivElement>['children']
  isOpen: boolean
  onDismiss: () => void
}

export default function ClassicModal({ children, isOpen, onDismiss }: ClassicModalProps) {
  const transitions = useTransition(isOpen, {
    config: { duration: 150 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  // close modal if current url change
  useCloseModalOnNavigation({ isOpen, onDismiss })

  const opacityInterpolation = useCallback((opacity) => round(opacity, 2), [])

  return (
    <>
      {transitions(
        (styles, isOpen) =>
          isOpen && (
            <ClassicDialogOverlay onDismiss={onDismiss} style={{ opacity: styles.opacity.to(opacityInterpolation) }}>
              <ClassicDialogContent aria-label="dialog content">{children}</ClassicDialogContent>
            </ClassicDialogOverlay>
          )
      )}
    </>
  )
}

// Modal content

export const ModalContent = styled(Column)<{ width?: number }>`
  width: ${({ width = 546 }) => width}px;
  padding: 26px;
  background: ${({ theme }) => theme.bg1};
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.bg3}80;
  box-shadow: 0 4px 8px ${({ theme }) => theme.black}40;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
    border-radius: 0;
    padding: 16px;
    overflow-y: scroll;
    overflow-x: hidden;
    border: none;
  `}
`

// Modal header

const StyledModalHeader = styled(RowCenter)`
  justify-content: center;
  min-height: 16px;
`

const StyledBackButton = styled(BackButton)`
  position: absolute;
  top: 16px;
  left: 16px;
`

const ModalHeaderWrapper = styled.div`
  margin: 32px 0 24px;
`

const CloseButton = styled(IconButton)`
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;

  svg {
    width: 16px;
    height: 16px;
  }
`

interface ModalHeaderProps {
  onDismiss?: () => void
  onBack?: () => void
  children?: React.ReactNode
}

export function ModalHeader({ children, onDismiss, onBack }: ModalHeaderProps) {
  return (
    <StyledModalHeader>
      {onBack && <StyledBackButton onClick={onBack} />}
      {children ? (
        <ModalHeaderWrapper>
          {typeof children === 'string' ? <TYPE.large>{children}</TYPE.large> : children}
        </ModalHeaderWrapper>
      ) : (
        <div />
      )}
      {onDismiss && (
        <CloseButton onClick={onDismiss}>
          <Close />
        </CloseButton>
      )}
    </StyledModalHeader>
  )
}
