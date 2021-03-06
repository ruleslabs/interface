import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { useQuery, gql, ApolloError } from '@apollo/client'

import { PrimaryButton } from '@/components/Button'
import PackOpeningLayout from '@/components/Layout/PackOpening'
import { TYPE } from '@/styles/theme'
import Section from '@/components/Section'
import { BackButton } from '@/components/Button'
import { usePackOpeningMutation, useAudioLoop } from '@/state/packOpening/hooks'
import { Sound } from '@/state/packOpening/actions'
import PackOpeningCards from '@/components/PackOpeningCards'
import Loader from '@/components/Loader'
import Column from '@/components/Column'

import SoundOn from '@/images/sound-on.svg'
import SoundOff from '@/images/sound-off.svg'

const PACK_QUERY = gql`
  query ($slug: String!) {
    pack(slug: $slug) {
      id
      displayName
      pictureUrl(derivative: "width=512")
    }
  }
`

const ControlsSection = styled(Section)`
  margin-top: 90px;
  display: flex;
  justify-content: space-between;
`

const MainSection = styled(Section)`
  margin-top: 32px;
`

const Title = styled(TYPE.large)`
  width: 100%;
  text-align: center;
`

const PackImage = styled.img`
  width: 265px;
  margin: 32px auto 0;
  display: block;
  animation: float 3s ease-in-out infinite;

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
`

const OpenPackButton = styled(PrimaryButton)`
  padding-left: 38px;
  padding-right: 38px;
  margin: 0 auto;
  display: block;
`

const StyledSoundSwitch = styled.div`
  cursor: pointer;
`

const StyledLoader = styled(Loader)`
  margin: 0 auto;
`

const StyledPackOpeningCards = styled(PackOpeningCards)`
  margin: 168px auto 0;
`

interface SoundSwitchProps {
  on: boolean
  toggleSound: () => void
}

const SoundSwitch = ({ on, toggleSound }: SoundSwitchProps) => {
  return <StyledSoundSwitch onClick={toggleSound}>{on ? <SoundOn /> : <SoundOff />}</StyledSoundSwitch>
}

function PackOpening() {
  const router = useRouter()
  const { packSlug } = router.query

  // sound mgmt
  const { mute, unmute, loop, fx, latestLoopSound, isMute } = useAudioLoop()

  useEffect(() => loop(Sound.BEFORE_PACK_OPENING), [])

  const toggleSound = useCallback(() => {
    isMute ? unmute() : mute()
  }, [mute, unmute, isMute])

  // Get pack data
  const packQuery = useQuery(PACK_QUERY, { variables: { slug: packSlug }, skip: !packSlug })

  const pack = packQuery.data?.pack
  const isValid = !packQuery.error && pack
  const isLoading = packQuery.loading

  // open pack mutation
  const [packOpeningMutation] = usePackOpeningMutation()
  const [cards, setCards] = useState<any[]>([])

  // approve pack opening
  const [waiting, setWaiting] = useState(false)
  const openPack = useCallback(() => {
    setWaiting(true)
    loop(Sound.DURING_PACK_OPENING)

    setTimeout(() => {
      packOpeningMutation({ variables: { packId: pack.id } })
        .then((res: any) => {
          if (res.data?.openPack?.cards) setCards(res.data.openPack.cards)
          else console.error(res.data?.openPack?.error) // TODO handle error
          setWaiting(false)
        })
        .catch((packOpeningError: ApolloError) => {
          console.error(packOpeningError)
          setWaiting(false)
        })
    }, 5000) // dopamine optimization ??_??
  }, [pack?.id, setCards, setWaiting, loop])

  useEffect(() => {
    if (cards && cards?.length > 0 && latestLoopSound === Sound.DURING_PACK_OPENING) {
      loop(Sound.OPENED_PACK)
      fx(Sound.FX_PACK_OPENING)
    }
  }, [cards?.length, loop, latestLoopSound])

  return (
    <>
      <ControlsSection>
        <BackButton onClick={router.back} />
        <SoundSwitch on={!isMute} toggleSound={toggleSound} />
      </ControlsSection>

      <MainSection>
        {isLoading ? (
          <TYPE.body textAlign="center">Loading...</TYPE.body>
        ) : !isValid ? (
          <TYPE.body textAlign="center">
            <Trans>An error has occured</Trans>
          </TYPE.body>
        ) : (
          <>
            <Trans id={pack.displayName} render={({ translation }) => <Title>{translation}</Title>} />
            {cards?.length ? (
              <StyledPackOpeningCards cards={cards} />
            ) : (
              <Column gap={80}>
                <PackImage src={pack.pictureUrl} />
                {waiting ? (
                  <StyledLoader />
                ) : (
                  <OpenPackButton onClick={openPack} large>
                    <Trans>Open pack</Trans>
                  </OpenPackButton>
                )}
              </Column>
            )}
          </>
        )}
      </MainSection>
    </>
  )
}

PackOpening.getLayout = (page: JSX.Element) => {
  return <PackOpeningLayout>{page}</PackOpeningLayout>
}

export default PackOpening
