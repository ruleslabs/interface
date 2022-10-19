import styled from 'styled-components'

import CertifiedIcon from '@/images/certified.svg'

const Certified = styled(CertifiedIcon)`
  width: 18px;

  path:first-child {
    fill: ${({ theme }) => theme.primary1};
  }
`

export default Certified
