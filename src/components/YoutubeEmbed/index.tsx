import React from 'react'
import styled from 'styled-components'

const YoutubeEmbedWrapper = styled.div`
  overflow: hidden;
  position: relative;
  height: 0;
  padding-bottom: 56.25%;

  & iframe {
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    position: absolute;
  }
`

interface YoutubeEmbedProps extends React.HTMLAttributes<HTMLDivElement> {
  embedId: string
}

export default function YoutubeEmbed({ embedId, ...props }: YoutubeEmbedProps) {
  return (
    <div {...props}>
      <YoutubeEmbedWrapper>
        <iframe
          width="640"
          height="360"
          src={`https://www.youtube.com/embed/${embedId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Embedded youtube"
        />
      </YoutubeEmbedWrapper>
    </div>
  )
}
