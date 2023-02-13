import { useMemo } from 'react'

const IMAGES_DOMAIN = process.env.NEXT_PUBLIC_ASSETS_DOMAIN
const BUCKET = process.env.NEXT_PUBLIC_ASSETS_BUCKET

export default function useDefaultAvatarUrls(width: number) {
  return useMemo(
    () =>
      Array(5)
        .fill(0)
        .map(
          (_, index: number) =>
            `https://${IMAGES_DOMAIN}/${btoa(
              JSON.stringify({
                bucket: BUCKET,
                key: `users/default-avatar-${index + 1}.jpg`,
                edits: { resize: { width, fit: 'contain' } },
              })
            )}`
        ),
    [width]
  )
}

export function useDefaultAvatarIdFromUrl(url?: string): number {
  let params: any | undefined

  if (!url) return 0

  try {
    params = JSON.parse(atob(url.replace(`https://${IMAGES_DOMAIN}/`, '')))
  } catch {
    return 0
  }

  const id = params.key.match(/users\/default-avatar-([\d]*)\.jpg/)?.[1]
  return id ? +id : 0
}
