import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { useQuery, gql, ApolloError } from '@apollo/client'

import { PrimaryButton } from '@/components/Button'
import PackOpeningLayout from '@/components/Layout/PackOpening'
import { TYPE } from '@/styles/theme'
import Section from '@/components/Section'
import { BackButton } from '@/components/Button'
import { useStarknetSignerModalToggle } from '@/state/application/hooks'
import StarknetSignerModal from '@/components/StarknetSignerModal'
import { usePackOpeningMutation } from '@/state/packOpening/hooks'

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
`

const OpenPackButton = styled(PrimaryButton)`
  padding-left: 38px;
  padding-right: 38px;
  margin: 90px auto 0;
  display: block;
`

const StyledSoundSwitch = styled.div`
  cursor: pointer;
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

  // toggle sound
  const [soundOn, setSoundOn] = useState(true)
  const toggleSound = useCallback(() => setSoundOn(!soundOn), [setSoundOn, soundOn])

  // Get pack data
  const packQuery = useQuery(PACK_QUERY, { variables: { slug: packSlug }, skip: !packSlug })

  const pack = packQuery.data?.pack
  const isValid = !packQuery.error && pack
  const isLoading = packQuery.loading

  // open pack mutation
  const [packOpeningMutation] = usePackOpeningMutation()

  // approve pack opening
  const toggleStarknetSignerModal = useStarknetSignerModalToggle()
  const approvePackOpeningCallback = useCallback(
    (tx: string) => {
      console.log(`Wait for TX ${tx}`) // TODO
      console.log('Tx is valid') // TODO
      packOpeningMutation({ variables: { packId: pack.id } })
        .then((res: any) => {
          console.log(res)
        })
        .catch((packOpeningError: ApolloError) => {
          console.error(packOpeningError)
        })
    },
    [pack?.id]
  )

  return (
    <>
      <ControlsSection>
        <BackButton onClick={router.back} />
        <SoundSwitch on={soundOn} toggleSound={toggleSound} />
      </ControlsSection>
      <MainSection>
        {!isValid ? (
          <TYPE.body textAlign="center">
            <Trans>An error has occured</Trans>
          </TYPE.body>
        ) : isLoading ? (
          <TYPE.body textAlign="center">Loading...</TYPE.body>
        ) : (
          <>
            <Trans id={pack.displayName} render={({ translation }) => <Title>{translation}</Title>} />
            <PackImage src={pack.pictureUrl} />
            <OpenPackButton onClick={toggleStarknetSignerModal} large>
              <Trans>Open pack</Trans>
            </OpenPackButton>
          </>
        )}
      </MainSection>
      <StarknetSignerModal
        transaction={{ title: 'Approve pack openning', action: 'Approve' }}
        callback={approvePackOpeningCallback}
      />
    </>
  )
}

PackOpening.getLayout = (page: JSX.Element) => {
  return <PackOpeningLayout>{page}</PackOpeningLayout>
}

export default PackOpening
