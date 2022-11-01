import { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { ApolloError } from '@apollo/client'

import { PrimaryButton } from '@/components/Button'
import { TYPE } from '@/styles/theme'
import { usePackOpeningMutation, useAudioLoop } from '@/state/packOpening/hooks'
import { Sound } from '@/state/packOpening/actions'
import Column, { ColumnCenter } from '@/components/Column'
import { PACK_OPENING_DURATION, PACK_OPENING_FLASH_DURATION } from '@/constants/misc'
import ProgressBar from '@/components/ProgressBar'

const PackImage = styled.img<{ opened: boolean }>`
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
  id?: string
  onOpening(cards: any[]): void
  onError(error: string): void
  isOpen: boolean
}

export default function PackOpeningPack({ pictureUrl, id, onOpening, onError, isOpen }: PackOpeningPackProps) {
  // sound mgmt
  const { loop, fx, latestLoopSound } = useAudioLoop()

  // open pack mutation
  const [packOpeningMutation] = usePackOpeningMutation()

  // opening state
  const [opening, setOpening] = useState(false)
  const [opened, setOpened] = useState(false)

  // approve pack opening
  const openPack = useCallback(() => {
    if (!id) return

    setOpening(true)
    loop(Sound.DURING_PACK_OPENING)

    setTimeout(() => {
      packOpeningMutation({ variables: { packId: id } })
        .then((res: any) => {
          if (res.data?.openPack?.cards) {
            setTimeout(() => onOpening(res.data.openPack.cards), PACK_OPENING_FLASH_DURATION)
            setOpened(true)
          } else {
            onError('Failed to open pack')
          }
        })
        .catch((packOpeningError: ApolloError) => {
          const error = packOpeningError?.graphQLErrors?.[0]
          onError(error?.message ?? 'Failed to open pack')

          console.error(error)
        })
    }, PACK_OPENING_DURATION) // dopamine optimization è_é
  }, [id, loop])

  useEffect(() => {
    if (opened && latestLoopSound === Sound.DURING_PACK_OPENING) {
      loop(Sound.OPENED_PACK)
      fx(Sound.FX_PACK_OPENING)
    }
  }, [opened, loop, latestLoopSound])

  if (!isOpen) return null

  return (
    <Column gap={80}>
      <PackImage src={pictureUrl} opened={opened} />
      {opening ? (
        <ColumnCenter gap={12}>
          <TYPE.body>
            <Trans>Creating cards</Trans>
          </TYPE.body>
          <ProgressBar duration={PACK_OPENING_DURATION} maxWidth={200} />
        </ColumnCenter>
      ) : (
        <OpenPackButton onClick={openPack} large>
          <Trans>See my cards</Trans>
        </OpenPackButton>
      )}
    </Column>
  )
}
