import { useEffect, useRef } from 'react'

import Box from 'src/theme/components/Box'
import * as styles from './media.css'
import * as Icons from 'src/theme/components/Icons'
import { Row } from 'src/theme/components/Flex'
import Image from 'src/theme/components/Image'
import useAssetPlayingMedia from 'src/hooks/useAssetPlayingMedia'

interface NftPlayableMediaProps {
  src?: string
  mediaSrc?: string
  tokenId: string
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
        <Image className={styles.image({ hidden: shouldPlay })} src={src} draggable={false} />
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
              <Box as={'video'} className={styles.video} ref={mediaRef} loop playsInline>
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
