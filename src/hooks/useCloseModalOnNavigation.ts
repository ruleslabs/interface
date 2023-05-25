import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import usePrevious from './usePrevious'

interface CloseModalOnNavigationProps {
  isOpen: boolean
  onDismiss: () => void
}

export default function useCloseModalOnNavigation({ isOpen, onDismiss }: CloseModalOnNavigationProps) {
  const { pathname } = useLocation()

  const previousRouterPath = usePrevious(pathname)

  useEffect(() => {
    // dismiss if open and path user navigated
    if (isOpen && previousRouterPath && previousRouterPath !== pathname) onDismiss()
  }, [previousRouterPath, pathname, onDismiss, isOpen])
}
