import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'

import { TYPE } from '@/styles/theme'
import Section from '@/components/Section'
import { BackButton } from '@/components/Button'
import { useAudioLoop } from '@/state/packOpening/hooks'
import { Sound } from '@/state/packOpening/actions'
import PackOpeningPack from '@/components/PackOpening/Pack'
import PackOpeningCards from '@/components/PackOpening/Cards'

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

const StyledSoundSwitch = styled.div`
  cursor: pointer;
`

const StyledPackOpeningCards = styled(PackOpeningCards)`
  margin: 15vh auto 0;
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
  const { mute, unmute, loop, isMute } = useAudioLoop()

  useEffect(() => loop(Sound.BEFORE_PACK_OPENING), [])

  const toggleSound = useCallback(() => {
    isMute ? unmute() : mute()
  }, [mute, unmute, isMute])

  // Get pack data
  const packQuery = useQuery(PACK_QUERY, { variables: { slug: packSlug }, skip: !packSlug })
  const pack = packQuery.data?.pack

  // loading
  const loading = packQuery.loading

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // opening
  const [cards, setCards] = useState<any[] | null>(null)
  const onOpening = useCallback((cards: any[]) => setCards(cards), [])

  if (loading || error || packQuery.error || !pack) return null

  return (
    <>
      <ControlsSection>
        <BackButton onClick={router.back} />
        <SoundSwitch on={!isMute} toggleSound={toggleSound} />
      </ControlsSection>

      <MainSection>
        <Title>{pack.displayName}</Title>
        {cards ? (
          <StyledPackOpeningCards cards={cards} />
        ) : (
          <PackOpeningPack id={pack.id} pictureUrl={pack.pictureUrl} onError={useRouter} onOpening={setCards} />
        )}
      </MainSection>
    </>
  )
}

PackOpening.getLayout = (page: JSX.Element) => page

export default PackOpening
