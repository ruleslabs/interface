import { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components/macro'
import { useQuery, gql } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'

import { TYPE } from 'src/styles/theme'
import Section from 'src/components/Section'
import { BackButton } from 'src/components/Button'
import { useAudioLoop } from 'src/state/packOpening/hooks'
import { Sound } from 'src/state/packOpening/actions'
import PackOpeningPack from 'src/components/PackOpening/Pack'
import PackOpeningCards from 'src/components/PackOpening/Cards'

import { ReactComponent as SoundOn } from 'src/images/sound-on.svg'
import { ReactComponent as SoundOff } from 'src/images/sound-off.svg'
import EmptyLayout from 'src/components/Layout/Empty'

const PACK_QUERY = gql`
  query ($slug: String!) {
    pack(slug: $slug) {
      tokenId
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
  // query
  const { packSlug } = useParams()

  // nav
  const navigate = useNavigate()

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

  if (loading || error || packQuery.error || !pack) return null

  return (
    <>
      <ControlsSection>
        <BackButton onClick={() => navigate} />
        <SoundSwitch on={!isMute} toggleSound={toggleSound} />
      </ControlsSection>

      <MainSection>
        <Title>{pack.displayName}</Title>

        {cards && <StyledPackOpeningCards cards={cards} />}

        <PackOpeningPack
          tokenId={pack.tokenId}
          pictureUrl={pack.pictureUrl}
          onError={onError}
          onOpening={setCards}
          isOpen={!cards}
        />
      </MainSection>
    </>
  )
}

PackOpening.withLayout = () => (
  <EmptyLayout>
    <PackOpening />
  </EmptyLayout>
)

export default PackOpening
