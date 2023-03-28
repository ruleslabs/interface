import React from 'react'
import styled from 'styled-components'

import useCloseModalOnNavigation from '@/hooks/useCloseModalOnNavigation'

const Overlay = styled.div`
  z-index: 99;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  cursor: default;
`

interface HintModalProps {
  children: React.HTMLAttributes<HTMLDivElement>['children']
  isOpen: boolean
  onDismiss: () => void
}

export default function HintModal({ children, isOpen, onDismiss }: HintModalProps) {
  // close modal if current url change
  useCloseModalOnNavigation({ isOpen, onDismiss })

  return (
    <>
      {isOpen && (
        <div>
          <Overlay onClick={onDismiss} />
          {children}
        </div>
      )}
    </>
  )
}