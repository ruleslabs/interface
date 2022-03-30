import React from 'react'
import styled from 'styled-components'

const StyledRuleVideo = styled.video`
  width: 256px;
  object-fit: cover;
`

interface RuleVideoProps extends React.HTMLAttributes<HTMLVideoElement> {
  src: string
}

const RuleVideo = ({ src, ...props }: RuleVideoProps) => {
  return <StyledRuleVideo src={src} loop autoPlay muted {...props} />
}

export default RuleVideo
