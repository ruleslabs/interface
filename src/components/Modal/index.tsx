import '@reach/dialog/styles.css'

import React, { useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import { animated, useTransition } from 'react-spring'
import { useRouter } from 'next/router'
import { BackButton } from '@/components/Button'

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
  position: fixed;

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
        top: ${theme.size.headerHeightMedium};
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
  autoClose?: boolean
}

export default function Modal({ children, isOpen, onDismiss, sidebar = false, autoClose = true }: ModalProps) {
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

  const router = useRouter()

  useEffect(() => {
    if (!autoClose || !isOpen) return
    onDismiss()
  }, [router])

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

const StyledModalHeader = styled(RowCenter)`
  justify-content: center;
  min-height: 16px;
`

const StyledBackButton = styled(BackButton)`
  position: absolute;
  top: 16px;
  left: 16px;
`

const ModalTitle = styled(TYPE.large)`
  ${({ theme }) => theme.media.medium`
    width: 100%;
    text-align: center;
  `}
`

const ModalHeaderWrapper = styled.div`
  margin: 8px 0;
`

const StyledClose = styled(Close)`
  width: 20px;
  height: 20px;
  cursor: pointer;
  position: absolute;
  top: 16px;
  right: 16px;

  ${({ theme }) => theme.media.medium`
    display: none;
  `}
`

interface ModalHeaderProps {
  onDismiss: () => void
  onBack?: () => void
  children?: React.ReactNode
}

export const ModalHeader = ({ children, onDismiss, onBack }: ModalHeaderProps) => {
  return (
    <StyledModalHeader>
      {onBack && <StyledBackButton onClick={onBack} />}
      {children ? (
        <ModalHeaderWrapper>
          {typeof children === 'string' ? <ModalTitle>{children}</ModalTitle> : children}
        </ModalHeaderWrapper>
      ) : (
        <div />
      )}
      <StyledClose onClick={onDismiss} />
    </StyledModalHeader>
  )
}
