import InfiniteScroll, { Props } from 'react-infinite-scroll-component'

import LoadingAssets from './CollectionAssetsLoading'
import * as styles from './CollectionNfts.css'

interface CollectionNftsProps {
  children: React.ReactNode
  hasNext: boolean
  next?: () => void
  dataLength?: number
  scrollableTarget?: Props['scrollableTarget']
}

export default function CollectionNfts({
  children,
  hasNext,
  next = () => {},
  dataLength = 0,
  ...props
}: CollectionNftsProps) {
  return (
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
