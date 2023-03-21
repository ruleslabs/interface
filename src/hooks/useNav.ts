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

export function useNavUserLinks(userSlug?: string): MenuLinks {
  // logout
  const logoutHanlder = useLogout()

  // wallet upgrade
  const toggleUpgradeWalletModal = useUpgradeWalletModalToggle()

  return useMemo(
    () => [
      [
        { name: 'Your cards', link: `/user/${userSlug}/cards` },
        { name: 'Yout packs', link: `/user/${userSlug}/packs` },
        { name: 'Your Rulédex', link: `/user/${userSlug}/ruledex` },
        { name: 'Your Activity', link: `/user/${userSlug}/activity` },
      ],
      [{ name: 'Upgrade wallet', handler: toggleUpgradeWalletModal }],
      [
        { name: 'Settings', link: '/settings/profile' },
        { name: 'Logout', handler: logoutHanlder },
      ],
    ],
    [userSlug]
  )
}
