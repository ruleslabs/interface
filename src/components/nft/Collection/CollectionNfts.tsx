import InfiniteScroll, { Props } from 'react-infinite-scroll-component'

import LoadingAssets from './CollectionAssetsLoading'
import * as styles from './CollectionNfts.css'
import Box from 'src/theme/components/Box'

interface CollectionNftsProps {
  children: React.ReactNode
  hasNext: boolean
  next?: () => void
  dataLength?: number
  scrollableTarget?: Props['scrollableTarget']
  loading?: boolean
}

export default function CollectionNfts({
  children,
  hasNext,
  next = () => {},
  dataLength = 0,
  loading = false,
  ...props
}: CollectionNftsProps) {
  return loading ? (
    <Box className={styles.assetsGrid}>
      <LoadingAssets />
    </Box>
  ) : (
    <InfiniteScroll
      next={next}
      hasMore={hasNext}
      dataLength={dataLength}
      loader={hasNext && <LoadingAssets />}
      className={styles.assetsGrid}
      {...props}
    >
      {children}
    </InfiniteScroll>
  )
}
