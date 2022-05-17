import '@reach/dialog/styles.css'

import React, { useCallback } from 'react'
import styled from 'styled-components'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import { animated, useTransition } from 'react-spring'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'

import Close from '@/images/close.svg'

const AnimatedDialogOverlay = animated(DialogOverlay)

const StyledDialogOverlay = styled(AnimatedDialogOverlay)<{ $sidebar: boolean }>`
  &[data-reach-dialog-overlay] {
    z-index: 99;

    ${({ $sidebar, theme }) =>
      $sidebar
        ? `
          background-color: transparent;
        `
        : `
          position: fixed;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: ${theme.bg1}80;
        `}
  }
`

const AnimatedDialogContent = animated(DialogContent)

const StyledDialogContent = styled(AnimatedDialogContent)<{ $sidebar: boolean }>`
  background: transparent;
  width: fit-content;
  padding: 0;
  margin: 0;

  ${({ $sidebar, theme }) =>
    $sidebar
      ? `
        box-shadow: -10px 4px 20px ${theme.black}40;
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
      `
      : `
        box-shadow: 0 4px 8px ${theme.black}40;
      `}

  ${({ $sidebar, theme }) => theme.media.medium`
    ${
      !$sidebar &&
      `
        position: fixed;
        top: 62px;
        bottom: 0;
        width: 100%;
      `
    }
  `}
`

interface ModalProps {
  children: React.ReactNode
  isOpen: boolean
  onDismiss: () => void
  sidebar?: boolean
}

export default function Modal({ children, isOpen, onDismiss, sidebar = false }: ModalProps) {
  const transitionProperties = sidebar
    ? {
        config: { duration: 150 },
        from: { opacity: 0, y: -340 },
        enter: { opacity: 1, y: 0 },
        leave: { opacity: 0, y: -340 },
      }
    : {
        config: { duration: 150 },
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
      }
  const transitions = useTransition(isOpen, transitionProperties)

  const buildDialogContentStyle = useCallback((styles) => {
    return { right: styles.y.to((value: number) => `${value}px`) }
  }, [])

  return (
    <>
      {transitions(
        (styles, item) =>
          item && (
            <StyledDialogOverlay onDismiss={onDismiss} style={{ opacity: styles.opacity }} $sidebar={sidebar}>
              <StyledDialogContent
                aria-label="dialog content"
                style={sidebar ? buildDialogContentStyle(styles) : {}}
                $sidebar={sidebar}
              >
                {children}
              </StyledDialogContent>
            </StyledDialogOverlay>
          )
      )}
    </>
  )
}

const ModalTitle = styled(TYPE.large)`
  ${({ theme }) => theme.media.medium`
    width: 100%;
    text-align: center;
  `}
`

const StyledClose = styled(Close)`
  width: 20px;
  height: 20px;
  cursor: pointer;

  ${({ theme }) => theme.media.medium`
    display: none;
  `}
`

interface ModalHeaderProps {
  children: React.ReactNode
  toggleModal: () => void
}

export const ModalHeader = ({ children, toggleModal }: ModalHeaderProps) => {
  return (
    <RowCenter justify="space-between" style={{ padding: '0 8px' }}>
      {typeof children === 'string' ? (
        <Trans id={children} render={({ translation }) => <ModalTitle>{translation}</ModalTitle>} />
      ) : (
        children
      )}
      <StyledClose onClick={toggleModal} />
    </RowCenter>
  )
}
