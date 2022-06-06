import { useState, useCallback } from 'react'

export default function useCheckbox(value: boolean) {
  const [checked, setChecked] = useState(value)
  const toggleCheckbox = useCallback(() => setChecked(!checked), [setChecked, checked])

  return [checked, toggleCheckbox]
}
