import { useEffect } from 'react'
import { useRouter } from 'next/router'
import usePrevious from './usePrevious'

interface CloseModalOnNavigationProps {
  isOpen: boolean
  onDismiss: () => void
}

export default function useCloseModalOnNavigation({ isOpen, onDismiss }: CloseModalOnNavigationProps) {
  const router = useRouter()

  const previousRouterPath = usePrevious(router.asPath)

  useEffect(() => {
    // dismiss if open and path user navigated
    if (isOpen && previousRouterPath && previousRouterPath !== router.asPath) onDismiss()
  }, [previousRouterPath, router.asPath, onDismiss, isOpen])
}
