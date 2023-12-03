import { ASSETS_PAGE_SIZE } from 'src/state/search/hooks'

import { LoadingNftCard } from '../Card'

interface LoadingAssetsProps {
  count?: number
  height?: number
}

const LoadingAssets = ({ count = ASSETS_PAGE_SIZE }: LoadingAssetsProps) => (
  <>
    {Array.from(Array(count), (_, index) => (
      <LoadingNftCard key={index} />
    ))}
  </>
)

export default LoadingAssets
