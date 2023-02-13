import styled from 'styled-components'

import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import Link from '@/components/Link'
import { TYPE } from '@/styles/theme'

import LinkIcon from '@/images/link.svg'

const communityCreationsData = [
  {
    name: 'Rules Stats',
    link: 'https://rules-stats.quentinam.fr/',
  },
  {
    name: 'Rules Browser',
    link: 'https://rulesbrowser.quentinam.fr/',
  },
  {
    name: 'Market Watcher',
    link: 'https://julienmaille.github.io/rules-market-watcher',
  },
  {
    name: 'Rules ft.',
    link: 'https://rulesfeaturing.quentinam.fr/',
  },
  {
    name: 'Playlists streaming',
    link: 'https://multy.me/ljQNes',
  },
]

const LinkIconWrapper = styled(RowCenter)`
  width: 24px;
  height: 24px;
  background: ${({ theme }) => theme.bg1};
  border-radius: 50%;
  justify-content: center;

  svg {
    width: 14px;
    height: 14px;
  }
`

export default function CommunityCreations() {
  return (
    <Column gap={12}>
      {communityCreationsData.map((data, index) => (
        <Link key={index} href={data.link} target="_blank">
          <RowCenter gap={8}>
            <LinkIconWrapper>
              <LinkIcon />
            </LinkIconWrapper>

            <TYPE.body clickable>{data.name}</TYPE.body>
          </RowCenter>
        </Link>
      ))}
    </Column>
  )
}
