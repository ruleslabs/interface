import { useCallback, useEffect, useState } from 'react'
import { gql, useMutation } from '@apollo/client'

const OPEN_PACK_MUTATION = gql`
  mutation ($packId: ID!) {
    openPack(input: { packId: $packId }) {
      error {
        code
        message
        path
      }
      cards {
        slug
        serialNumber
        cardModel {
          videoUrl
          season
          scarcity {
            name
            maxSupply
          }
          artist {
            displayName
            user {
              username
              slug
            }
          }
        }
      }
    }
  }
`

export function usePackOpeningMutation() {
  return useMutation(OPEN_PACK_MUTATION)
}

export function useAudioLoop(src: string) {
  const [actx, setActx] = useState(null)
  useEffect(() => setActx(new (window.AudioContext || window.webkitAudioContext)()), [])

  const [fetching, setFetching] = useState(false)
  const [srcNode, setSrcNode] = useState(null)
  const [encodedAudioData, setEncodedAudioData] = useState(null)
  const [audioData, setAudioData] = useState(null)

  const playLoop = useCallback(
    (buffer) => {
      if (!actx || (!audioData && !buffer)) return

      if (!audioData) setAudioData(buffer) // create a reference for control buttons
      const newSrcNode = actx.createBufferSource() // create audio source
      newSrcNode.buffer = buffer // use decoded buffer
      newSrcNode.connect(actx.destination) // create output
      newSrcNode.loop = true // takes care of perfect looping
      newSrcNode.start()
      setSrcNode(newSrcNode)
    },
    [actx, setAudioData, setSrcNode]
  )

  const play = useCallback(() => {
    if (!actx || !audioData) return

    if (actx.state === 'suspended') actx.resume().then(() => !srcNode && playLoop(audioData))
    else playLoop(audioData)
  }, [actx, audioData, playLoop, srcNode])

  const pause = useCallback(() => {
    srcNode?.stop()
    setSrcNode(null)
    actx.suspend()
  }, [srcNode, setSrcNode, actx])

  const decode = useCallback(
    (buffer) => {
      actx?.decodeAudioData(buffer, playLoop, (err) => console.log(err))
    },
    [playLoop, actx]
  )

  useEffect(() => {
    if (encodedAudioData || fetching || !actx) return

    setFetching(true)

    fetch('/sounds/before-pack-opening.wav', { mode: 'cors' })
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        setEncodedAudioData(buffer)
        decode(buffer)
        setFetching(false)
      })
  }, [setEncodedAudioData, decode, setFetching, fetching, actx])

  return [play, pause]
}
