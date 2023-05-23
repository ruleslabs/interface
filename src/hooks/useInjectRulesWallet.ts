import { starknetWindowObject } from '@/lib/rulesWallet/starknetWindowObject'
import { useCallback, useEffect } from 'react'

const INJECT_NAMES = ['starknet', 'starknet_rules']

export default function useInjectRulesWallet() {
  const inject = useCallback(() => {
    INJECT_NAMES.forEach((name) => {
      // we need 2 different try catch blocks because we want to execute both even if one of them fails
      try {
        delete (window as any)[name]
      } catch (e) {
        // ignore
      }
      try {
        // set read only property to window
        Object.defineProperty(window, name, {
          value: starknetWindowObject,
          writable: false,
        })
      } catch {
        // ignore
      }
      try {
        ;(window as any)[name] = starknetWindowObject
      } catch {
        // ignore
      }
    })
  }, [])

  const injectHandler = useCallback(() => {
    inject()
    setTimeout(inject, 100)
  }, [inject])

  useEffect(() => {
    injectHandler()
    window.addEventListener('load', injectHandler)
    document.addEventListener('DOMContentLoaded', injectHandler)
    document.addEventListener('readystatechange', injectHandler)
  })
}
