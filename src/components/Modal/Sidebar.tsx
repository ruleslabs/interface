import '@reach/dialog/styles.css'

import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import { animated, useTransition } from 'react-spring'

import useCloseModalOnNavigation from '@/hooks/useCloseModalOnNavigation'
import { round } from '@/utils/math'
import { MEDIA_QUERIES_BREAKPOINTS, TYPE } from '@/styles/theme'
import { IconButton } from '@/components/Button'
import { RowBetween } from '@/components/Row'
import Column from '@/components/Column'
import useWindowSize from '@/hooks/useWindowSize'

import CloseIcon from '@/images/close.svg'

const DEFAULT_SIDEBAR_WIDTH = 280

const SidebarDialogOverlay = styled(animated(DialogOverlay))`
  &[data-reach-dialog-overlay] {
    z-index: 9999;
  }
`

const SidebarDialogContent = styled(animated(DialogContent))<{ width: number }>`
  background: transparent;
  width: fit-content;
  padding: 0;
  margin: 0;
  position: fixed;
  box-shadow: -10px 4px 20px ${({ theme }) => theme.black}40;
  top: 0;
  bottom: 0;

  & > div {
    width: ${({ width }) => width}px;
  }
`

interface SidebarModalProps {
  children: React.HTMLAttributes<HTMLDivElement>['children']
  isOpen: boolean
  onDismiss: () => void
  position?: 'left' | 'right'
  width?: number
  fullscreen?: boolean
}

/**
 * Sidebar modal component
 * @param fullscreen  - fullscreen modal on small devices when true
 **/

export default function SidebarModal({
  children,
  isOpen,
  onDismiss,
  position = 'right',
  width = DEFAULT_SIDEBAR_WIDTH,
  fullscreen = false,
}: SidebarModalProps) {
  const windowSize = useWindowSize()

  width = useMemo(() => {
    if (fullscreen && windowSize.width && windowSize.width <= MEDIA_QUERIES_BREAKPOINTS.small) return windowSize.width
    else return width
  }, [fullscreen, width, windowSize.width])

  const transitions = useTransition(isOpen, {
    config: { duration: 150 },
    from: { y: -width, opacity: 0 },
    enter: { y: 0, opacity: 0.5 },
    leave: { y: -width, opacity: 0 },
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
                width={width}
              >
                {children}
              </SidebarDialogContent>
            </SidebarDialogOverlay>
          )
      )}
    </>
  )
}

// MODAL CONTENT

const StyledModalContent = styled.div<{ windowHeight?: number }>`
  height: ${({ windowHeight = 0 }) => windowHeight}px;
  background: ${({ theme }) => theme.bg1};
  position: relative;
  width: 280px;
`

export function ModalContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const windowSize = useWindowSize()

  return (
    <StyledModalContent windowHeight={windowSize.height} {...props}>
      {children}
    </StyledModalContent>
  )
}

// MODAL HEADER

const StyledModalHeader = styled(RowBetween)`
  height: 64px;
  align-items: center;
  padding: 0 8px;
  border-style: solid;
  border-color: ${({ theme }) => theme.bg3}80;
  border-width: 0 0 1px;

  & > div {
    min-width: 32px;
  }
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
      <div />

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
`
