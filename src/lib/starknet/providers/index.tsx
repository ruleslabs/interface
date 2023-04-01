import React from 'react'

import { StarknetLibraryProvider } from './starknet'

interface StarknetProviderProps {
  children: React.ReactNode
}

export function StarknetProvider({ children }: StarknetProviderProps) {
  return <StarknetLibraryProvider>{children}</StarknetLibraryProvider>
}
