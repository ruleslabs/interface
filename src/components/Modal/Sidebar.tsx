import '@reach/dialog/styles.css'

import React, { useCallback } from 'react'
import styled from 'styled-components'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import { animated, useTransition } from 'react-spring'

import useCloseModalOnNavigation from '@/hooks/useCloseModalOnNavigation'
import { round } from '@/utils/math'

const SidebarDialogOverlay = styled(DialogOverlay)`
  &[data-reach-dialog-overlay] {
    z-index: 99;
    background-color: transparent;
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
}

export default function SidebarModal({ children, isOpen, onDismiss }: SidebarModalProps) {
  const transitions = useTransition(isOpen, {
    config: { duration: 150 },
    from: { y: -340 },
    enter: { y: 0 },
    leave: { y: -340 },
  })

  const translationInterpolation = useCallback((y) => `${round(y)}px`, [])

  // close modal if current url change
  useCloseModalOnNavigation({ isOpen, onDismiss })

  return (
    <>
      {transitions(
        (styles, isOpen) =>
          isOpen && (
            <SidebarDialogOverlay onDismiss={onDismiss}>
              <SidebarDialogContent
                aria-label="dialog content"
                style={{ right: styles.y.to(translationInterpolation) }}
              >
                {children}
              </SidebarDialogContent>
            </SidebarDialogOverlay>
          )
      )}
    </>
  )
}
