import '@reach/dialog/styles.css'

import React, { useCallback } from 'react'
import styled from 'styled-components'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import { animated, useTransition } from 'react-spring'

import useCloseModalOnNavigation from '@/hooks/useCloseModalOnNavigation'
import { round } from '@/utils/math'
import { TYPE } from '@/styles/theme'
import { IconButton } from '@/components/Button'
import { RowBetween } from '@/components/Row'
import Column from '@/components/Column'

import CloseIcon from '@/images/close.svg'

const SidebarDialogOverlay = styled(animated(DialogOverlay))`
  &[data-reach-dialog-overlay] {
    z-index: 9999;
  }
`

const SidebarDialogContent = styled(animated(DialogContent))`
  background: transparent;
  width: fit-content;
  padding: 0;
  margin: 0;
  position: fixed;
  box-shadow: -10px 4px 20px ${({ theme }) => theme.black}40;
  top: 0;
  bottom: 0;
`

interface SidebarModalProps {
  children: React.HTMLAttributes<HTMLDivElement>['children']
  isOpen: boolean
  onDismiss: () => void
  position?: 'left' | 'right'
}

export default function SidebarModal({ children, isOpen, onDismiss, position = 'right' }: SidebarModalProps) {
  const transitions = useTransition(isOpen, {
    config: { duration: 150 },
    from: { y: -340, opacity: 0 },
    enter: { y: 0, opacity: 0.5 },
    leave: { y: -340, opacity: 0 },
  })

  const translationInterpolation = useCallback((y) => `${round(y)}px`, [])
  const backgroundOpacityInterpolation = useCallback((opacity) => `rgba(0, 0, 0, ${opacity})`, [])

  // close modal if current url change
  useCloseModalOnNavigation({ isOpen, onDismiss })

  return (
    <>
      {transitions(
        (styles, isOpen) =>
          isOpen && (
            <SidebarDialogOverlay
              onDismiss={onDismiss}
              style={{ backgroundColor: styles.opacity.to(backgroundOpacityInterpolation) }}
            >
              <SidebarDialogContent
                aria-label="dialog content"
                style={{ [position]: styles.y.to(translationInterpolation) }}
              >
                {children}
              </SidebarDialogContent>
            </SidebarDialogOverlay>
          )
      )}
    </>
  )
}

// MODAL HEADER

const StyledModalHeader = styled(RowBetween)`
  height: 64px;
  align-items: center;
  padding: 0 16px;
`

const CloseButton = styled(IconButton)`
  cursor: pointer;
`

interface ModalHeaderProps {
  onDismiss: () => void
  title?: string
}

export function ModalHeader({ title, onDismiss }: ModalHeaderProps) {
  return (
    <StyledModalHeader>
      <TYPE.medium>{title}</TYPE.medium>

      <CloseButton onClick={onDismiss}>
        <CloseIcon />
      </CloseButton>
    </StyledModalHeader>
  )
}

// MODAL BODY

export const ModalBody = styled(Column)`
  width: 100%;
  padding: 8px;
  border-style: solid;
  border-color: ${({ theme }) => theme.bg3}80;
  border-width: 1px 0 0;
`
