import React from 'react'

import { StarknetContext } from './context'
import { useStarknetManager } from './manager'

interface StarknetLibraryProviderProps {
  children: React.ReactNode
  network?: string
}

export function StarknetLibraryProvider({ children }: StarknetLibraryProviderProps) {
  const state = useStarknetManager()

  return <StarknetContext.Provider value={state}>{children}</StarknetContext.Provider>
}
