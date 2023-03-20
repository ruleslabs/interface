import { useMemo } from 'react'

import Label from '@/components/Label'

interface StatusProps {
  type: 'status' | 'origin'
  value: any // TODO: better typing :|
}

export default function Status({ type, value }: StatusProps) {
  const [valueText, color] = useMemo(() => {
    switch (type) {
      case 'status':
        const valueText = value.toUpperCase().replace(/_/g, ' ')

        switch (value) {
          case 'PENDING':
            return [valueText, 'green1']

          case 'ACCEPTED_ON_L2':
            return [valueText, 'green2']

          case 'ACCEPTED_ON_L1':
            return [valueText, 'primary1']

          case 'RECEIVED':
            return [valueText, 'text2']

          default:
            return [valueText, 'error']
        }

      case 'origin':
        return value ? ['IN', 'pink'] : ['OUT', 'purple']
    }
  }, [type, value])

  return <Label color={color} value={valueText} />
}
