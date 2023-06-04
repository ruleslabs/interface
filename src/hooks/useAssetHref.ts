import { useMemo } from 'react'
import { Buffer } from 'buffer'
import { constants, slugify } from '@rulesorg/sdk-core'
import { encode } from 'starknet'

export function useAssetHref(tokenId: string) {
  return useMemo(() => {
    const tokenDetails = tokenId.match(/0x([0-9a-fA-F]{6})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{54})/)
    if (!tokenDetails) return `/card/${tokenId}`

    const [, serialNumber, season, scarcity, artist] = tokenDetails

    const intSeason = +encode.addHexPrefix(season)
    const intScarcity = +encode.addHexPrefix(scarcity)
    const intSerialNumber = +encode.addHexPrefix(serialNumber)

    const artistSlug = slugify(Buffer.from(artist, 'hex').toString())
    console.log(artist, artistSlug)
    const seasonSlug = `season-${intSeason}`
    const scarcitySlug = constants.Seasons[intSeason][intScarcity].name

    return `/card/${artistSlug}-${seasonSlug}-${scarcitySlug}/${intSerialNumber}`
  }, [tokenId])
}
