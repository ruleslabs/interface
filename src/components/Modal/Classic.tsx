import React, { useCallback } from 'react'
import styled from 'styled-components/macro'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import { animated, useTransition } from '@react-spring/web'

import Column from 'src/components/Column'
import useCloseModalOnNavigation from 'src/hooks/useCloseModalOnNavigation'
import { round } from 'src/utils/math'
import useWindowSize from 'src/hooks/useWindowSize'

const DEFAULT_MODAL_WIDTH = 540

// overlay

const ClassicDialogOverlay = styled(animated(DialogOverlay))`
  &[data-reach-dialog-overlay] {
    z-index: 9999;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${({ theme }) => theme.black}a0;
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

const StyledModalContent = styled(Column)<{ width: number; height?: number; fullscreen: boolean }>`
  width: ${({ width }) => width}px;
  ${({ height }) => height && `height: ${height}px;`}
  background: ${({ theme }) => theme.bg1};

  ${({ theme, fullscreen }) =>
    fullscreen
      ? `
        & > div {
          overflow: scroll;
        }
      `
      : `
        border: 1px solid ${theme.bg3}80;
        box-shadow: 0 4px 8px ${theme.black}40;
        border-radius: 10px;
      `}

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
    border-radius: 0;
    overflow-y: scroll;
    overflow-x: hidden;
    border: none;
  `}
`

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number
  fullscreen?: boolean
}

export function ModalContent({ children, width = DEFAULT_MODAL_WIDTH, fullscreen = false }: ModalContentProps) {
  const windowSize = useWindowSize()

  return (
    <StyledModalContent
      width={fullscreen ? windowSize.width ?? 0 : width}
      height={fullscreen ? windowSize.height : undefined}
      fullscreen={fullscreen}
    >
      {children}
    </StyledModalContent>
  )
}

// MODAL BODY

export const ModalBody = styled.div`
  width: 100%;
  padding: 24px;
`
