import { useMemo } from 'react'

export default function useReduceHash(hash: string) {
  return useMemo(() => `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`, [hash])
}
