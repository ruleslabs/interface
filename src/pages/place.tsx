import { useRef, useEffect, useState } from 'react'
import styled from 'styled-components'

import { RowCenter } from '@/components/Row'
import Link from '@/components/Link'
import { TYPE } from '@/styles/theme'

const PIXEL_SIZE = 30
const PIXEL_GAP = 3
const OFFSET_X = 290
const OFFSET_Y = 100

const palette = ['#00000000', '#000000', '#4a2799', '#dbaffa']
const colorNames = {
  '#000000': 'Noir',
  '#4a2799': 'Violet Foncé',
  '#dbaffa': 'Rose Pale',
}

const map = [
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1],
  [1, 1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 2, 2, 3, 3, 3, 2, 1, 1],
  [1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 2, 3, 3, 3, 3, 2, 1, 1],
  [1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 2, 3, 3, 3, 3, 2, 1, 1],
  [1, 1, 2, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 2, 1, 1, 2, 3, 3, 3, 3, 2, 1, 1],
  [1, 1, 2, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 2, 1, 1, 2, 3, 3, 3, 3, 2, 1, 1],
  [1, 1, 2, 3, 3, 3, 3, 2, 1, 1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 2, 3, 3, 3, 3, 2, 1, 1],
  [1, 1, 2, 3, 3, 3, 3, 2, 1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 2, 3, 3, 3, 3, 2, 1, 1],
  [1, 1, 2, 3, 3, 3, 3, 2, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1, 1, 2, 3, 3, 3, 3, 2, 1, 1],
  [1, 1, 2, 3, 3, 3, 3, 2, 1, 1, 2, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 3, 3, 3, 3, 2, 1, 1],
  [1, 1, 2, 3, 3, 3, 3, 2, 1, 1, 2, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 1, 1],
  [1, 1, 2, 3, 3, 3, 3, 2, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1],
  [1, 1, 2, 3, 3, 3, 3, 2, 1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1],
  [1, 1, 2, 3, 3, 3, 3, 2, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1, 1],
  [1, 1, 2, 3, 3, 3, 3, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1],
  [1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1],
  [1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
]

const postdraw = (ctx: any) => {
  ctx.restore()
}

const predraw = (ctx: any, canvas: any) => {
  ctx.save()
  canvas.width = PIXEL_SIZE * map[0].length + (map[0].length - 1) * PIXEL_GAP
  canvas.height = PIXEL_SIZE * map.length + (map.length - 1) * PIXEL_GAP
  resizeCanvas(ctx, canvas)
  const { width, height } = ctx.canvas
  ctx.clearRect(0, 0, width, height)
}

function resizeCanvas(ctx: any, canvas: any) {
  const { width, height } = canvas.getBoundingClientRect()

  if (canvas.width !== width || canvas.height !== height) {
    const { devicePixelRatio: ratio = 1 } = window
    canvas.width = width * ratio
    canvas.height = height * ratio
    ctx.scale(ratio, ratio)
    return true
  }

  return false
}

const CanvasWrapper = styled.div`
  margin-top: 96px;
  max-width: 100%;
  width: 100%;
  overflow: scroll;
  padding-bottom: 78px;

  & canvas {
    margin: 0 auto;
    display: block;
  }
`

const PositionWrapper = styled(RowCenter)`
  justify-content: center;
  gap: 24px;
  position: fixed;
  top: 16px;
  left: 32px;
  right: 32px;
  height: 64px;
  background: ${({ theme }) => theme.bg5};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 4px;
`

const ZplaceWrapper = styled(RowCenter)`
  justify-content: center;
  position: fixed;
  bottom: 16px;
  left: 32px;
  right: 32px;
  background: ${({ theme }) => theme.bg5};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 4px;
  padding: 12px 0;

  & a {
    text-decoration: underline;
  }
`

const SelectedColor = styled.div<{ color: string }>`
  width: 32px;
  height: 32px;
  background: ${({ color }) => color};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 4px;
`

function Place() {
  const canvasRef = useRef(null)

  const [selectedPixel, setSelectedPixel] = useState<any | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current as any
    const ctx = canvas?.getContext('2d')

    if (!ctx || !canvas) return

    let selectedX = -1
    let selectedY = -1

    const draw = (e?: any) => {
      predraw(ctx, canvas)

      const cRect = canvas.getBoundingClientRect()
      const [mouseX, mouseY] = e ? [Math.round(e.clientX - cRect.left), Math.round(e.clientY - cRect.top)] : [-1, -1]

      if (e?.type === 'click') [selectedX, selectedY] = [mouseX, mouseY]

      let foundSelected = false

      for (const [i, row] of map.entries()) {
        for (const [j, col] of row.entries()) {
          if (col) {
            ctx.beginPath()
            ctx.fillStyle = palette[col]

            const x = j * PIXEL_SIZE + j * PIXEL_GAP
            const y = i * PIXEL_SIZE + i * PIXEL_GAP

            ctx.rect(x, y, PIXEL_SIZE, PIXEL_SIZE)
            ctx.fill()

            if (x <= mouseX && x + PIXEL_SIZE >= mouseX && y <= mouseY && y + PIXEL_SIZE >= mouseY) {
              ctx.strokeStyle = '#fff'
              ctx.lineWidth = PIXEL_GAP
              ctx.stroke()
            }

            if (x <= selectedX && x + PIXEL_SIZE >= selectedX && y <= selectedY && y + PIXEL_SIZE >= selectedY) {
              foundSelected = true
              ctx.strokeStyle = '#f00'
              ctx.lineWidth = PIXEL_GAP * 2
              ctx.stroke()
              if (e?.type === 'click') setSelectedPixel({ x: j, y: i, color: palette[col] })
            }
          }
        }
      }

      if (e?.type === 'click' && !foundSelected) setSelectedPixel(null)

      postdraw(ctx)
    }

    draw()

    // add event listeners
    canvas.addEventListener('mousemove', draw, true)
    canvas.addEventListener('click', draw, true)

    return () => {
      canvas.removeEventListener('mousemove', draw, true)
      canvas.removeEventListener('click', draw, true)
    }
  }, [])

  return (
    <>
      <PositionWrapper>
        {selectedPixel ? (
          <>
            <TYPE.medium textAlign="center">
              x: {selectedPixel.x + OFFSET_X} y: {selectedPixel.y + OFFSET_Y}
            </TYPE.medium>
            <RowCenter gap={12}>
              <SelectedColor color={selectedPixel.color} />
              <TYPE.medium textAlign="center">{colorNames[selectedPixel.color as keyof typeof colorNames]}</TYPE.medium>
            </RowCenter>
          </>
        ) : (
          <TYPE.medium textAlign="center">Aucun pixel sélectionné.</TYPE.medium>
        )}
      </PositionWrapper>

      <CanvasWrapper>
        <canvas ref={canvasRef} />
      </CanvasWrapper>

      <ZplaceWrapper>
        <TYPE.body>
          Aller sur le&nbsp;
          <Link href="https://place.zevent.fr" color="text1" target="_blank" underline>
            ZPlace
          </Link>
        </TYPE.body>
      </ZplaceWrapper>
    </>
  )
}

Place.getLayout = (page: JSX.Element) => {
  return page
}

export default Place
