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
  type: 'status' | 'origin'
  value: any
}

export default function Status({ type, value }: StatusProps) {
  const theme = useTheme()

  // status = 'pending'

  const [valueText, color] = useMemo(() => {
    switch (type) {
      case 'status':
        const valueText = value.toUpperCase().replace(/_/g, ' ')

        switch (value) {
          case 'PENDING':
            return [valueText, theme.green1]

          case 'ACCEPTED_ON_L2':
            return [valueText, theme.green2]

          case 'ACCEPTED_ON_L1':
            return [valueText, theme.primary1]

          case 'RECEIVED':
            return [valueText, theme.text2]

          default:
            return [valueText, theme.error]
        }

      case 'origin':
        return value ? ['IN', theme.pink] : ['OUT', theme.purple]
    }
  }, [status, type])

  return <StyledStatus color={color}>{valueText}</StyledStatus>
}
