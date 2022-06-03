import styled from 'styled-components'

const Video = styled.video`
  position: absolute;
  top: 57px;
  height: calc(100% - 57px + 128px); // 100% - header + footer
  width: 100%;
  object-fit: cover;

  ${({ theme }) => theme.media.medium`
    top: 62px;
    height: calc(100% - 62px + 128px);
    object-position: left;
  `}
`

export default function Home() {
  return <Video src="https://videos.rules.art/mp4/homepage.mp4" playsInline loop autoPlay muted />
}
