import { globalStyle } from '@vanilla-extract/css'

import { rawTokens, vars } from './vars.css'

globalStyle('*', {
  fontFamily: "'Inter', sans-serif",
})

globalStyle('html, body', {
  margin: 0,
  padding: 0,
})

globalStyle('body', {
  backgroundAttachment: 'fixed',
  backgroundImage: `linear-gradient(180deg, ${rawTokens.color.accent}15 0, ${rawTokens.color.accent}00 300px)`,
  backgroundColor: rawTokens.color.bg1,
})

globalStyle('h1, h2, h3, h4, h5, h6, p, a, ul, li, ol, label, input, button, div', {
  color: rawTokens.color.text1,
})

globalStyle('html *', {
  boxSizing: 'border-box',
  WebkitBoxSizing: 'border-box',
  MozBoxSizing: 'border-box',
})

globalStyle('html', {
  fontSize: 16,
  fontVariant: 'none',
  color: 'black',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  height: '100%',
})

globalStyle('html, body, #root', {
  minHeight: '100%',
})

globalStyle('#root', {
  position: 'relative',
  width: '100%',
})

globalStyle('html', {
  backgroundColor: vars.color.bg1,
})

globalStyle('a', {
  textDecoration: 'none',
  color: vars.color.accent,
})

globalStyle('a:hover', {
  textDecoration: 'none',
})

globalStyle('button', {
  userSelect: 'none',
})

globalStyle('.grecaptcha-badge', {
  visibility: 'hidden',
})
