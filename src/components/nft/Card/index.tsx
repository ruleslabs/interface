import { useMemo } from 'react'

import * as Text from 'src/theme/components/Text'
import * as styles from './style.css'
import Box from 'src/theme/components/Box'
import SizingImage from 'src/images/sizingImage.png'
import { NftPlayableMedia } from './media'
import { NftAsset } from 'src/types'
import { Column, Row } from 'src/theme/components/Flex'
import Image from 'src/theme/components/Image'
import { useActiveLocale } from 'src/hooks/useActiveLocale'
import useAssetsSelection from 'src/hooks/useAssetsSelection'

interface NftCardDisplay {
  primaryInfo: string
  secondaryInfo?: string
  subtitle?: string
  status?: 'inDelivery' | 'onSale'
}

interface NftCardProps {
  asset: NftAsset
  display: NftCardDisplay
}

/**
 * NftCard is a component that displays an NFT asset.
 */
export const NftCard = ({ asset, display }: NftCardProps) => {
  const { primaryInfo, secondaryInfo, subtitle, status } = display

  // locale
  const locale = useActiveLocale()

  const statusComponent = useMemo(() => {
    switch (status) {
      case 'inDelivery':
        return <Image className={styles.inDelivery} src={`/assets/inDelivery.${locale}.png`} />

      case 'onSale':
        return <Image className={styles.onSale} src={`/assets/onSale.${locale}.png`} />

      default:
        return null
    }
  }, [status, locale])

  // selection
  const { selectionModeEnabled, toggleTokenIdSelection, selectedTokenIds } = useAssetsSelection()
  const selected = useMemo(() => selectedTokenIds.includes(asset.tokenId), [asset.tokenId, selectedTokenIds.length])

  return (
    <Box
      className={styles.container({ selected: selectionModeEnabled ? selected : undefined })}
      onClick={
        selectionModeEnabled
          ? (e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleTokenIdSelection(asset.tokenId)
            }
          : undefined
      }
    >
      <Box className={styles.mediaContainer({ scarcity: asset.scarcity })}>
        <NftPlayableMedia
          src={asset.imageUrl}
          mediaSrc={selectionModeEnabled ? undefined : asset.animationUrl}
          tokenId={asset.tokenId}
        />
        {statusComponent}
      </Box>

      <Box className={styles.detailsContainer}>
        <Column gap={'8'}>
          <Row justifyContent={'space-between'}>
            <Text.Body className={styles.primaryInfo}>{primaryInfo}</Text.Body>
            {secondaryInfo && <Text.Small className={styles.secondaryInfo}>{secondaryInfo}</Text.Small>}
          </Row>

          {subtitle && <Text.Subtitle>{subtitle}</Text.Subtitle>}
        </Column>
      </Box>
    </Box>
  )
}

export const LoadingNftCard = () => (
  <Box className={styles.container()} background={'bg2'} overflow={'hidden'}>
    <Box position={'relative'} width={'full'} loading={true}>
      <Box position={'absolute'} width={'full'} height={'full'} />
      <Box as={'img'} src={SizingImage} width={'full'} opacity={'0'} draggable={false} />
    </Box>

    <Box className={styles.detailsContainer}>
      <Text.Small loading={true} loadingWidth={'120'} />
    </Box>
  </Box>
)
