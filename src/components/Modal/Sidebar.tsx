import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import { animated, useTransition } from '@react-spring/web'

import useCloseModalOnNavigation from 'src/hooks/useCloseModalOnNavigation'
import { round } from 'src/utils/math'
import { MEDIA_QUERIES_BREAKPOINTS } from 'src/styles/theme'
import Column from 'src/components/Column'
import useWindowSize from 'src/hooks/useWindowSize'

const DEFAULT_SIDEBAR_WIDTH = 280

const SidebarDialogOverlay = styled(animated(DialogOverlay))`
  &[data-reach-dialog-overlay] {
    z-index: 9998;
    background-color: ${({ theme }) => theme.black}a0;
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

// MODAL BODY

export const ModalBody = styled(Column)`
  width: 100%;
  padding: 16px;
`
