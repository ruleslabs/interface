import { useUpgradeWalletModalToggle } from 'src/state/application/hooks'
import { useMemo } from 'react'
import useLogout from './useLogout'
import { t } from '@lingui/macro'

export interface NavLink {
  name: string
  link?: string
  handler?: () => void
  external?: boolean
}

export type MenuLinks = NavLink[][]

export function useNavLinks(): MenuLinks {
  return useMemo(
    () => [
      [
        { name: t`Packs`, link: '/packs' },
        { name: t`Marketplace`, link: '/marketplace' },
        { name: t`Community`, link: '/community' },
      ],
      [{ name: 'Discord', link: 'https://discord.gg/DrfezKYUhH', external: true }],
    ],
    []
  )
}

export interface NavUserSublinks {
  name?: string
  links: NavLink[]
}

export interface NavUserLinks {
  profile: NavUserSublinks
  wallet: NavUserSublinks
  misc: NavUserSublinks
}

export function useNavUserLinks(userSlug?: string): NavUserLinks | null {
  // logout
  const [logout] = useLogout()

  // wallet upgrade
  const toggleUpgradeWalletModal = useUpgradeWalletModalToggle()

  return useMemo(() => {
    if (!userSlug) return null

    return {
      profile: {
        name: t`Profile`,
        links: [
          { name: t`Cards`, link: `/user/${userSlug}/cards` },
          { name: t`Packs`, link: `/user/${userSlug}/packs` },
          { name: t`Rulédex`, link: `/user/${userSlug}/ruledex` },
          { name: t`Activity`, link: `/user/${userSlug}/activity` },
        ],
      },
      wallet: {
        name: t`Wallet`,
        links: [{ name: t`Upgrade wallet`, handler: toggleUpgradeWalletModal }],
      },
      misc: {
        links: [
          { name: t`Settings`, link: '/settings/profile' },
          { name: t`Logout`, handler: logout },
        ],
      },
    }
  }, [userSlug])
}
