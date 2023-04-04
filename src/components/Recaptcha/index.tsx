import React from 'react'
import styled from 'styled-components'
import GoogleReCAPTCHA from 'react-google-recaptcha'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Link from '@/components/Link'

const ReCAPTCHA = React.forwardRef<GoogleReCAPTCHA>((_props, ref) => {
  return <GoogleReCAPTCHA ref={ref} size="invisible" sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_KEY!} />
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
