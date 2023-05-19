import { useUpgradeWalletModalToggle } from '@/state/application/hooks'
import { useLogout } from '@/state/user/hooks'
import { useMemo } from 'react'

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
        { name: 'Packs', link: '/packs' },
        { name: 'Marketplace', link: '/marketplace' },
        { name: 'Community', link: '/community' },
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
  const logoutHanlder = useLogout()

  // wallet upgrade
  const toggleUpgradeWalletModal = useUpgradeWalletModalToggle()

  return useMemo(() => {
    if (!userSlug) return null

    return {
      profile: {
        name: 'Profile',
        links: [
          { name: 'Cards', link: `/user/${userSlug}/cards` },
          { name: 'Packs', link: `/user/${userSlug}/packs` },
          { name: 'Rulédex', link: `/user/${userSlug}/ruledex` },
          { name: 'Activity', link: `/user/${userSlug}/activity` },
        ],
      },
      wallet: {
        name: 'Wallet',
        links: [{ name: 'Upgrade wallet', handler: toggleUpgradeWalletModal }],
      },
      misc: {
        links: [
          { name: 'Settings', link: '/settings/profile' },
          { name: 'Logout', handler: logoutHanlder },
        ],
      },
    }
  }, [userSlug])
}
