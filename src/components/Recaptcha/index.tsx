import { Trans } from '@lingui/macro'
import React from 'react'
import GoogleReCAPTCHA from 'react-google-recaptcha'
import Link from 'src/components/Link'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

const REACT_APP_RECAPTCHA_V2_KEY = process.env.REACT_APP_RECAPTCHA_V2_KEY
if (!REACT_APP_RECAPTCHA_V2_KEY) {
  throw 'env REACT_APP_RECAPTCHA_V2_KEY not provided'
}

const ReCAPTCHA = React.forwardRef<GoogleReCAPTCHA>((_props, ref) => {
  return <GoogleReCAPTCHA ref={ref} size="invisible" sitekey={REACT_APP_RECAPTCHA_V2_KEY} />
})

ReCAPTCHA.displayName = 'ReCAPTCHA'

export default ReCAPTCHA

const StyledRecaptchaPolicy = styled(TYPE.subtitle)`
  font-size: 12px;
  opacity: 0.7;

  a {
    font-size: 12px;
  }
`

export function RecaptchaPolicy() {
  return (
    <StyledRecaptchaPolicy>
      <Trans>
        This site is protected by reCAPTCHA. The Google
        <span> </span>
        <Link href="https://policies.google.com/privacy" target="_blank" underline>
          Privacy Policy
        </Link>
        <span> </span>
        and
        <span> </span>
        <Link href="https://policies.google.com/terms" target="_blank" underline>
          Terms of Service
        </Link>
        <span> </span>
        apply.
      </Trans>
    </StyledRecaptchaPolicy>
  )
}
