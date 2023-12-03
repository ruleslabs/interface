import { useEffect, useRef } from 'react'
import useAssetPlayingMedia from 'src/hooks/useAssetPlayingMedia'
import Box from 'src/theme/components/Box'
import { Row } from 'src/theme/components/Flex'
import * as Icons from 'src/theme/components/Icons'
import Image from 'src/theme/components/Image'

import * as styles from './media.css'

interface NftPlayableMediaProps {
  src?: string
  mediaSrc?: string
  tokenId: string
  disabled?: boolean
}

export const NftPlayableMedia = ({ src, mediaSrc, tokenId }: NftPlayableMediaProps) => {
  const mediaRef = useRef<HTMLVideoElement>(null)

  // current asset playing media
  const [tokenIdPlayingMedia, setTokenIdPlayingMedia] = useAssetPlayingMedia()
  const shouldPlay = tokenIdPlayingMedia === tokenId

  useEffect(() => {
    if (shouldPlay && mediaRef.current) {
      mediaRef.current.play()
    } else if (!shouldPlay && mediaRef.current) {
      mediaRef.current.pause()
    }
  }, [shouldPlay])

  return (
    <>
      <Row>
        <Image className={styles.image} src={src} draggable={false} />
      </Row>
      {!!mediaSrc &&
        (shouldPlay ? (
          <>
            <Box
              className={styles.playbackButton({ pauseButton: true })}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setTokenIdPlayingMedia(null)
              }}
            >
              <Icons.Pause />
            </Box>

            <Row className={styles.innerMediaContainer}>
              <Box as="video" className={styles.video} ref={mediaRef} loop playsInline>
                <source src={mediaSrc} />
              </Box>
            </Row>
          </>
        ) : (
          <Box
            className={styles.playbackButton()}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setTokenIdPlayingMedia(tokenId)
            }}
          >
            <Icons.Play />
          </Box>
        ))}
    </>
  )
}
