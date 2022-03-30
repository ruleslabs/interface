import styled from 'styled-components'

import { TYPE } from '@/styles/theme'
import Row from '@/components/Row'
import { ColumnCenter } from '@/components/Column'
import Certified from '@/images/certified.svg'

type Size = 'md' | 'lg'

const UserAvatar = styled.img<{ size: Size }>`
  border-radius: 50%;
  width: ${({ size }) => (size === 'md' && '150px') || (size === 'lg' && '208px')};
  height: ${({ size }) => (size === 'md' && '150px') || (size === 'lg' && '208px')};
  margin-bottom: ${({ size }) => (size === 'md' && '10px') || (size === 'lg' && '12px')};
`

interface UserProps {
  username: string
  pictureUrl: string
  certified: boolean
  size?: Size
}

export default function User({ username, pictureUrl, certified, size = 'md' }: UserProps) {
  return (
    <ColumnCenter>
      <UserAvatar src={pictureUrl} size={size} />
      <Row gap={4}>
        <TYPE.body>{username}</TYPE.body>
        {certified && <Certified width="18px" />}
      </Row>
    </ColumnCenter>
  )
}
