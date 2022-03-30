import React from 'react'

import { StarknetLibraryProvider } from './starknet'

interface StarknetProviderProps {
  children: React.ReactNode
  network?: string
}

export function StarknetProvider({ children, network }: StarknetProviderProps) {
  return <StarknetLibraryProvider network={network}>{children}</StarknetLibraryProvider>
}
