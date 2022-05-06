import styled from 'styled-components'

import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'

import Spin from '@/images/spin.svg'

const StyledCardDisplaySelector = styled(Column)`
  gap: 12px;

  ${({ theme }) => theme.media.medium`
    flex-direction: row;
  `}

  div {
    border-radius: 3px;
    width: 32px;
    height: 32px;
    background: ${({ theme }) => theme.bg2};
    overflow: hidden;
    cursor: pointer;
  }

  img {
    margin: 8px auto 0;
    display: block;
    width: 22px;
  }
`

interface CardDisplaySelectorProps {
  pictureUrl: string
  backPictureUrl: string
  onFrontSelected: () => void
  onBackSelected: () => void
}

export default function CardDisplaySelector({
  pictureUrl,
  backPictureUrl,
  onFrontSelected,
  onBackSelected,
}: CardDisplaySelectorProps) {
  return (
    <StyledCardDisplaySelector>
      <div onClick={onFrontSelected}>
        <img src={pictureUrl} />
      </div>
      <div onClick={onBackSelected}>
        <img src={backPictureUrl} />
      </div>
      <RowCenter justify="center">
        <Spin />
      </RowCenter>
    </StyledCardDisplaySelector>
  )
}
