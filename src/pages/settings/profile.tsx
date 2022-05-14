import styled from 'styled-components'

import ProfileEditor from '@/components/ProfileEditor'
import Section from '@/components/Section'

const StyledSection = styled(Section)`
  margin-top: 64px;

  ${({ theme }) => theme.media.small`
    margin-top: 40px;
  `}
`

export default function Profile() {
  return (
    <StyledSection>
      <ProfileEditor />
    </StyledSection>
  )
}
