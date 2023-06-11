import { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { PrimaryButton } from 'src/components/Button'
import { TYPE } from 'src/styles/theme'
import { usePackOpeningMutation, useAudioLoop } from 'src/state/packOpening/hooks'
import { Sound } from 'src/state/packOpening/actions'
import Column, { ColumnCenter } from 'src/components/Column'
import { PACK_OPENING_DURATION, PACK_OPENING_FLASH_DURATION } from 'src/constants/misc'
import ProgressBar from 'src/components/ProgressBar'
import Image from 'src/theme/components/Image'

const PackImage = styled(Image)<{ opened: boolean }>`
  width: 265px;
  margin: 32px auto 0;
  display: block;
  animation: ${({ opened }) =>
    opened ? `flash ${PACK_OPENING_FLASH_DURATION}ms linear` : 'float 3s ease-in-out infinite'};

  @keyframes float {
    0% {
      transform: translatey(0px) scale(1.02);
    }

    50% {
      transform: translatey(10px) scale(1);
    }

    100% {
      transform: translatey(0px) scale(1.02);
    }
  }

  @keyframes flash {
    50% {
      transform: scale(8);
      opacity: 0.05;
    }

    100% {
      transform: scale(10);
      opacity: 0;
    }
  }
`

const OpenPackButton = styled(PrimaryButton)`
  padding-left: 38px;
  padding-right: 38px;
  margin: 0 auto;
  display: block;
`

interface PackOpeningPackProps {
  pictureUrl?: string
  tokenId?: string
  onOpening(cards: any[]): void
  onError(error: string): void
  isOpen: boolean
}

export default function PackOpeningPack({ pictureUrl, tokenId, onOpening, onError, isOpen }: PackOpeningPackProps) {
  // sound mgmt
  const { loop, fx, latestLoopSound } = useAudioLoop()

  // open pack mutation
  const [packOpeningMutation] = usePackOpeningMutation()

  // opening state
  const [opening, setOpening] = useState(false)
  const [cards, setCards] = useState([])
  const [opened, setOpened] = useState(false)

  const ready = !!cards.length && opened

  // approve pack opening
  const openPack = useCallback(async () => {
    if (!tokenId) return

    setOpening(true)
    loop(Sound.DURING_PACK_OPENING)

    try {
      const res = await packOpeningMutation({ variables: { tokenId } })
      if (res.data?.openPack?.cards) {
        setCards(res.data?.openPack?.cards)
      } else {
        onError('Failed to open pack')
      }
    } catch (packOpeningError) {
      const error = packOpeningError?.graphQLErrors?.[0]
      onError(error?.message ?? 'Failed to open pack')

      console.error(error)
    }

    setTimeout(() => {
      setOpened(true)
    }, PACK_OPENING_DURATION) // dopamine optimization è_é
  }, [tokenId, loop])

  useEffect(() => {
    if (ready && latestLoopSound === Sound.DURING_PACK_OPENING) {
      loop(Sound.OPENED_PACK)
      fx(Sound.FX_PACK_OPENING)
    }
  }, [ready, loop, latestLoopSound])

  useEffect(() => {
    if (ready) {
      setTimeout(() => onOpening(cards), PACK_OPENING_FLASH_DURATION)
    }
  }, [ready, onOpening])

  const componentContent = useMemo(() => {
    if (ready) return null

    if (opening) {
      return (
        <ColumnCenter gap={12}>
          <TYPE.body>
            <Trans>Creating cards</Trans>
          </TYPE.body>
          <ProgressBar duration={PACK_OPENING_DURATION} maxWidth={200} />
        </ColumnCenter>
      )
    }

    return (
      <OpenPackButton onClick={openPack} large>
        <Trans>Open pack</Trans>
      </OpenPackButton>
    )
  }, [openPack, ready, opening])

  if (!isOpen) return null

  return (
    <Column gap={80}>
      <PackImage src={pictureUrl} opened={ready} />

      {componentContent}
    </Column>
  )
}
