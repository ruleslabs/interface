import { useMemo } from 'react'

import * as Text from 'src/theme/components/Text'
import * as styles from './style.css'
import Box, { BoxProps } from 'src/theme/components/Box'
import SizingImage from 'src/images/sizingImage.png'
import { NftPlayableMedia } from './media'
import { Badge, NftAsset } from 'src/types'
import { Column, Row } from 'src/theme/components/Flex'
import Image from 'src/theme/components/Image'
import { useActiveLocale } from 'src/hooks/useActiveLocale'
import useAssetsSelection from 'src/hooks/useAssetsSelection'
import { useAssetHref } from 'src/hooks/useAssetHref'
import Link from 'src/components/Link'
import Badges from 'src/components/Badges'

interface NftCardDisplay {
  primaryInfo: string
  secondaryInfo?: string
  subtitle?: string
  status?: 'inDelivery' | 'onSale'
}

interface NftCardProps {
  asset: NftAsset
  display: NftCardDisplay
  onCardClick?: () => void
  badges?: Badge[]
}

/**
 * NftCard is a component that displays an NFT asset.
 */
export const NftCard = ({ asset, display, onCardClick, badges }: NftCardProps) => {
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

  const href = useAssetHref(asset.tokenId)

  return (
    <Container
      className={styles.container({ selected: selectionModeEnabled ? selected : undefined })}
      href={selectionModeEnabled || onCardClick ? undefined : href}
      onClick={
        selectionModeEnabled
          ? (e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleTokenIdSelection(asset.tokenId)
            }
          : onCardClick
      }
    >
      <Box className={styles.mediaContainer({ scarcity: asset.scarcity })}>
        <NftPlayableMedia
          src={asset.imageUrl}
          mediaSrc={selectionModeEnabled ? undefined : asset.animationUrl}
          tokenId={asset.tokenId}
        />

        <Badges badges={badges} />

        {statusComponent}
      </Box>

      <Box className={styles.detailsContainer}>
        <Column gap={'8'}>
          <Row gap={'4'} justifyContent={'space-between'}>
            <Text.Body className={styles.primaryInfo}>{primaryInfo}</Text.Body>
            {secondaryInfo && <Text.Small className={styles.secondaryInfo}>{secondaryInfo}</Text.Small>}
          </Row>

          {subtitle && <Text.Subtitle>{subtitle}</Text.Subtitle>}
        </Column>
      </Box>
    </Container>
  )
}

export const Container = ({ children, href, ...props }: BoxProps) => (
  <Box {...props}>{href ? <Link href={href}>{children}</Link> : children}</Box>
)

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
