import { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { useSpring, animated, interpolate } from 'react-spring'

import useCardsBackPictureUrl from '@/hooks/useCardsBackPictureUrl'
import { round } from '@/utils/math'

const CardTranslator = styled.div`
  width: fit-content;
  cursor: pointer;
  height: 100%;
  perspective: 1000px;
  touch-action: none;

  & * {
    border-radius: 4.44% / 3.17%;
  }
`

const CardRotator = styled.div`
  display: block;
  position: relative;
  transform-style: preserve-3d;
  height: 100%;
  width: fit-content;
  box-shadow: 0 0 3px 0 #00000080;
`

const CardFrontVideo = styled.video<{ width?: number }>`
  display: block;
  height: 100%;
  ${({ width }) => width && `width: ${width}px;`}
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
`

const CardBackImage = styled.img`
  display: block;
  position: absolute;
  z-index: -1;
  width: 100%;
  border-radius: 4.44% / 3.17%;
  transform: rotateY(180deg);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
`

const HoloWrapper = styled.div`
  mix-blend-mode: color-dodge;
  position: absolute;
  top: 0;
  width: 100%;
  bottom: 0;
`

const Holo = styled.div`
  transform-style: preserve-3d;
  transform: translateZ(1px);
  position: absolute;
  top: 0;
  width: 100%;
  bottom: 0;
  z-index: 2;

  background-blend-mode: exclusion, hue, hard-light, exclusion;
  background-size: 50%, 200% 700%, 300% 100%, 200% 100%;
`

const HoloAfter = styled.div`
  transform-style: preserve-3d;
  transform: translateZ(1px);
  position: absolute;
  top: 0;
  width: 100%;
  bottom: 0;
  z-index: 2;

  mix-blend-mode: exclusion;

  background-blend-mode: exclusion, hue, hard-light, exclusion;
  background-size: 50%, 200% 400%, 147% 100%, 200% 100%;
`

const Glare = styled.div`
  transform-style: preserve-3d;
  transform: translateZ(1px);
  z-index: 4;
  mix-blend-mode: overlay;
  position: absolute;
  top: 0;
  width: 100%;
  bottom: 0;
`

const INITIAL_SPRING_VALUES = {
  rotation: [0, 0],
  touch: [50, 50],
  holo: [50, 50, 0],
  opacity: 0,
  transaltion: [0, 0],
}

interface CardProps {
  scarcityName: string
  videoUrl: string
  revealed: boolean
  width?: number
}

export default function Card({ videoUrl, width, revealed }: CardProps) {
  // get back picture
  const backPictureUrl = useCardsBackPictureUrl(512)

  // react spring
  const [styles, api] = useSpring(() => ({
    ...INITIAL_SPRING_VALUES,
    rotation: [0, revealed ? 0 : 180],
    config: { mass: 5, tension: 200, friction: 30 },
  }))

  // onPointerMove
  const onPointerMove = useCallback(
    (event) => {
      // get targetRect and pointer position
      const targetRect = event.currentTarget.getBoundingClientRect()
      const pointerPosition = {
        x: event.clientX ?? event.touches?.[0]?.clientX,
        y: event.clientY ?? event.touches?.[0]?.clientY,
      }

      if (!targetRect.height || !targetRect.width || !pointerPosition.x || !pointerPosition.y) return

      // mouse position
      const relativeMousePosition = {
        x: pointerPosition.x - Math.floor(targetRect.x),
        y: pointerPosition.y - Math.floor(targetRect.y),
      }
      const percentPosition = {
        x: round((100 * relativeMousePosition.x) / targetRect.width),
        y: round((100 * relativeMousePosition.y) / targetRect.height),
      }
      const percentCenterPosition = {
        x: percentPosition.x - 50,
        y: percentPosition.y - 50,
      }

      // rotation
      const rotation = [percentCenterPosition.y / 2, percentCenterPosition.x / -3.5 + (revealed ? 0 : 180)]

      // touch
      const touch = [percentPosition.x, percentPosition.y]

      // holo ~ 3:2 ratio
      // x = 50 +/- 12.5
      // y = 50 +/- 33.3
      const holo = [
        round(percentPosition.x / 4 + 37.5, 1),
        round(percentPosition.y / 3 + 33.3, 1),
        round(
          (Math.abs(percentCenterPosition.x) + Math.abs(percentCenterPosition.y)) / 50 -
            Math.abs(percentCenterPosition.x * percentCenterPosition.y) / 4000,
          1
        ),
      ]

      api({ rotation, touch, holo, opacity: 1 })
    },
    [api, revealed]
  )

  // onPointerLeave
  const onPointerLeave = useCallback(
    () => api({ ...INITIAL_SPRING_VALUES, rotation: [0, revealed ? 0 : 180] }),
    [api, revealed]
  )

  // on revealed update
  useEffect(() => {
    api({ ...INITIAL_SPRING_VALUES, rotation: [0, revealed ? 0 : 180] })
  }, [api, revealed])

  // interpolations
  // rotation
  const rotationInterpolation = useCallback(
    (rx, ry) => `
      rotateX(${round(rx, 1)}deg)
      rotateY(${round(ry, 1)}deg)
    `,
    []
  )
  // touch
  const glarePositionInterpolation = useCallback(
    (mx, my) => `
      radial-gradient(
        farthest-corner circle at ${round(mx, 1)}% ${round(my, 1)}%,
        rgba(255, 255, 255, 0.8) 10%,
        rgba(255, 255, 255, 0.65) 20%,
        rgba(0, 0, 0, 0.5) 90%
      )
    `,
    []
  )
  // holo
  const holoBackgroundImageInterpolation = useCallback(
    (mx, my) => `
      url(/assets/illusion.jpg),
      repeating-linear-gradient(
        0deg,
        hsl(0deg, 100%, 70%) 5%,
        hsl(60deg, 100%, 70%) 10%,
        hsl(120deg, 100%, 70%) 15%,
        hsl(180deg, 100%, 70%) 20%,
        hsl(240deg, 100%, 70%) 25%,
        hsl(300deg, 100%, 70%) 30%,
        hsl(360deg, 100%, 70%) 35%
      ),
      repeating-linear-gradient(
        125deg,
        hsl(227deg, 53%, 12%) 0%,
        hsl(180deg, 10%, 60%) 4%,
        hsl(180deg, 29%, 66%) 4.5%,
        hsl(180deg, 10%, 60%) 5%,
        hsl(227deg, 53%, 12%) 10%,
        hsl(227deg, 53%, 12%) 12%
      ),
      radial-gradient(
        farthest-corner circle
        at ${round(mx, 1)}% ${round(my, 1)}%,
        rgba(0, 0, 0, 0.1) 12%,
        rgba(0, 0, 0, 0.15) 20%,
        rgba(0, 0, 0, 0.25) 120%
      )
    `,
    []
  )
  const holoBackgroundInterpolation = useCallback((posx, posy) => {
    // round with 1 decimal precision
    posx = round(posx, 1)
    posy = round(posy, 1)

    return `center, 0% ${posy}%, ${posx}% ${posy}%`
  }, [])
  const holoFilterInterpolation = useCallback(
    (_posx, _posy, hyp) => `
      brightness(${round(hyp, 2) * 0.3 + 0.4}) contrast(2) saturate(1.5)
    `,
    []
  )
  const holoAfterBackgroundInterpolation = useCallback((posx, posy) => {
    // round with 1 decimal precision
    posx = round(posx, 1)
    posy = round(posy, 1)

    return `center, 0% ${posy}%, -${posx}% -${posy}%`
  }, [])
  const holoAfterFilterInterpolation = useCallback(
    (_posx, _posy, hyp) => `
      brightness(${round(hyp, 2) * 0.5 + 0.7}) contrast(1.6) saturate(1.4)
    `,
    []
  )
  // opacity
  const opacityInterpolation = useCallback((opacity) => round(opacity, 2), [])
  // translation
  const translationInterpolation = useCallback(
    (tx, ty) => `
      translate(0)
    `,
    []
  )
  // holo opacity
  // disable holo effect on the back of the card
  const holoOpacityInterpolation = useCallback((opacity, rotation) => (rotation[1] >= 90 ? 0 : opacity), [])

  return (
    <CardTranslator as={animated.div} style={{ transform: styles.transaltion.to(translationInterpolation) }}>
      <CardRotator
        as={animated.div}
        style={{ transform: styles.rotation.to(rotationInterpolation) }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onTouchMove={onPointerMove}
      >
        <CardBackImage src={backPictureUrl} alt="card-back" />
        <CardFrontVideo src={videoUrl} width={width} playsInline loop autoPlay muted />
        <HoloWrapper
          as={animated.div}
          style={{
            filter: styles.holo.to(holoFilterInterpolation),
            opacity: interpolate([styles.opacity, styles.rotation], holoOpacityInterpolation),
          }}
        >
          <Holo
            as={animated.div}
            style={{
              backgroundImage: styles.touch.to(holoBackgroundImageInterpolation),
              backgroundPosition: styles.holo.to(holoBackgroundInterpolation),
            }}
          />
          <HoloAfter
            as={animated.div}
            style={{
              backgroundImage: styles.touch.to(holoBackgroundImageInterpolation),
              backgroundPosition: styles.holo.to(holoAfterBackgroundInterpolation),
              filter: styles.holo.to(holoAfterFilterInterpolation),
            }}
          />
        </HoloWrapper>
        <Glare
          as={animated.div}
          style={{
            backgroundImage: styles.touch.to(holoBackgroundImageInterpolation),
            background: styles.touch.to(glarePositionInterpolation),
            opacity: styles.opacity.to(opacityInterpolation),
          }}
        />
      </CardRotator>
    </CardTranslator>
  )
}
