import { useMemo } from 'react'

const IMAGES_DOMAIN = process.env.REACT_APP_ASSETS_DOMAIN
const BUCKET = process.env.REACT_APP_ASSETS_BUCKET

export default function useCardsBackPictureUrl(width: number) {
  return useMemo(
    () =>
      `https://${IMAGES_DOMAIN}/${btoa(
        JSON.stringify({ bucket: BUCKET, key: 'card-models/back.png', edits: { resize: { width, fit: 'contain' } } })
      )}`,
    [width]
  )
}
