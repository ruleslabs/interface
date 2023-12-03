import { t } from '@lingui/macro'
import { useMemo } from 'react'
import { useMigrateCollectionModalToggle } from 'src/state/application/hooks'

import useLogout from './useLogout'

export interface NavLink {
  name: string
  link?: string
  handler?: () => void
  external?: boolean
}

type MenuLinks = NavLink[][]

export function useNavLinks(): MenuLinks {
  return useMemo(
    () => [
      [
        {
          name: t`Marketplace`,
          link: 'https://element.market/collections/rulesart?search%5Btoggles%5D[0]=BUY_NOW',
          external: true,
        },
      ],
      [{ name: 'Discord', link: 'https://discord.gg/rulesart', external: true }],
    ],
    []
  )
}

export interface NavUserSublinks {
  name?: string
  links: NavLink[]
}

interface NavUserLinks {
  profile: NavUserSublinks
  wallet: NavUserSublinks
  misc: NavUserSublinks
}

export function useNavUserLinks(userSlug?: string): NavUserLinks | null {
  // logout
  const [logout] = useLogout()

  // wallet upgrade
  const toggleMigrateCollectionModal = useMigrateCollectionModalToggle()

  return useMemo(() => {
    if (!userSlug) return null

    return {
      profile: {
        name: t`Profile`,
        links: [
          { name: t`Cards`, link: `/user/${userSlug}/cards` },
          { name: t`Packs`, link: `/user/${userSlug}/packs` },
        ],
      },
      wallet: {
        name: t`Wallet`,
        links: [{ name: t`Migrate collection`, handler: toggleMigrateCollectionModal }],
      },
      misc: {
        links: [
          { name: t`Settings`, link: '/settings/starknet' },
          { name: t`Logout`, handler: logout },
        ],
      },
    }
  }, [userSlug])
}
