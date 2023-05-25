import { useRef } from 'react'
import styled from 'styled-components/macro'
import FocusLock from 'react-focus-lock'
import { RemoveScroll } from 'react-remove-scroll'

import Serial from './Serial'
import Card, { CardProps } from 'src/components/CardModel3D/Card'
import useCardModel3DFullscreen from 'src/hooks/useCardModel3DFullscreen'

import { ReactComponent as Close } from 'src/images/close.svg'

const StyledFullscreenableCard = styled.div<{ fullscreen: boolean }>`
  ${({ fullscreen }) => fullscreen && `z-index: 999999;`}
`

const CardWrapper = styled.div`
  height: 100%;
  width: fit-content;
`

const Veil = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.bg1}e6;
`

const StyledClose = styled(Close)`
  width: 20px;
  height: 20px;
  cursor: pointer;
  position: absolute;
`

interface FullscreenableCard extends Omit<CardProps, 'transform' | 'cardRef'> {
  fullscreen: boolean
  serialNumber: number
  onDismiss: () => void
}

export default function FullscreenableCard({ fullscreen, onDismiss, serialNumber, ...props }: FullscreenableCard) {
  // fullscreen bar position
  const cardRef = useRef<HTMLDivElement>(null)

  // fullscreen transform
  const { translation, scale, cardRect } = useCardModel3DFullscreen(fullscreen, cardRef?.current, {
    maxScale: 1.75,
    margin: [118, 32],
  })

  return (
    <StyledFullscreenableCard fullscreen={fullscreen}>
      {fullscreen && (
        <FocusLock>
          <RemoveScroll>
            <Veil onClick={onDismiss}>
              {cardRect && (
                <>
                  <StyledClose
                    style={{ right: `${cardRect.x + 8}px`, top: `${cardRect.y - 36}px` }}
                    onClick={onDismiss}
                  />
                  <Serial style={{ bottom: `${cardRect.y - 102}px` }}>#{serialNumber}</Serial>
                </>
              )}
            </Veil>
          </RemoveScroll>
        </FocusLock>
      )}

      <CardWrapper>
        <Card
          cardRef={cardRef}
          transform={{
            tx: translation.tx,
            ty: translation.ty,
            scale,
          }}
          {...props}
        />
      </CardWrapper>
    </StyledFullscreenableCard>
  )
}
