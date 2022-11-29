import { useMemo } from 'react'
import styled from 'styled-components'

import useTheme from '@/hooks/useTheme'
import { TYPE } from '@/styles/theme'

const StyledStatus = styled(TYPE.body)<{ color: string }>`
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 3px;
  background: ${({ color }) => color}20;
  border: 1px solid ${({ color }) => color}80;
  color: ${({ color }) => color};
  border-radius: 3px;
`

interface StatusProps {
  status: string
}

export default function Status({ status }: StatusProps) {
  const theme = useTheme()

  // status = 'pending'

  const [statusText, color] = useMemo(() => {
    let color = theme.text2

    switch (status) {
      case 'pending':
        color = theme.green1
        break

      case 'accepted-on-l2':
        color = theme.green2
        break

      case 'accepted-on-l1':
        color = theme.primary1
        break

      case 'rejected':
        color = theme.error
        break
    }

    return [status.toUpperCase().replace(/-/g, ' '), color]
  }, [status])

  return <StyledStatus color={color}>{statusText}</StyledStatus>
}
