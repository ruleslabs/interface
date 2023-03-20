export interface NavLink {
  name: string
  link: string
  external?: boolean
}

export const NAV_LINKS: NavLink[][] = [
  [
    { name: 'Packs', link: '/packs' },
    { name: 'Marketplace', link: '/marketplace' },
    { name: 'Community', link: '/community' },
  ],
  [{ name: 'Discord', link: 'https://discord.gg/DrfezKYUhH', external: true }],
]

export const NAV_USER_LINKS: NavLink[][] = [
  [
    { name: 'Your cards', link: '/user/{slug}/cards' },
    { name: 'Yout packs', link: '/user/{slug}/packs' },
    { name: 'Your Rulédex', link: '/user/{slug}/ruledex' },
    { name: 'Your Activity', link: '/user/{slug}/activity' },
  ],
  [{ name: 'Settings', link: '/settings/profile' }],
]
