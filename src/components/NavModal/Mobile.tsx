import React from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import SidebarModal, { ModalHeader, ModalBody } from '@/components/Modal/Sidebar'
import { RowCenter } from '@/components/Row'
import { useNavModalMobileToggle, useModalOpen } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import LanguageSelector from '@/components/LanguageSelector'
import { SidebarNavButton } from '@/components/Button'
import useWindowSize from '@/hooks/useWindowSize'
import { useNavLinks } from '@/hooks/useNav'
import Actionable from './Actionable'
import Divider from '@/components/Divider'

import ExternalLinkIcon from '@/images/external-link.svg'

const StyledNavModalMobile = styled.div<{ windowHeight?: number }>`
  height: ${({ windowHeight = 0 }) => windowHeight}px;
  width: 280px;
  background: ${({ theme }) => theme.bg1};
  position: relative;
`

const StyledLanguageSelector = styled(LanguageSelector)`
  margin: 16px 0;
`

const StyledExternalLinkIcon = styled(ExternalLinkIcon)`
  width: 12px;
  height: 12px;
  fill: ${({ theme }) => theme.text2};
`

export default function NavModalMobile() {
  // modal
  const toggleNavModalMobile = useNavModalMobileToggle()
  const isOpen = useModalOpen(ApplicationModal.NAV_MOBILE)

  // window size
  const windowSize = useWindowSize()

  // nav links
  const navLinks = useNavLinks()

  return (
    <SidebarModal onDismiss={toggleNavModalMobile} isOpen={isOpen} position="left">
      <StyledNavModalMobile windowHeight={windowSize.height}>
        <ModalHeader onDismiss={toggleNavModalMobile} />

        <ModalBody gap={8}>
          {navLinks.map((navLinks) => (
            <>
              {navLinks.map((navLink) => (
                <Actionable
                  key={navLink.name}
                  link={navLink.link}
                  handler={navLink.handler}
                  target={navLink.external ? '_blank' : undefined}
                >
                  <SidebarNavButton>
                    <RowCenter gap={4}>
                      <Trans id={navLink.name} render={({ translation }) => <>{translation}</>} />

                      {navLink.external && <StyledExternalLinkIcon />}
                    </RowCenter>
                  </SidebarNavButton>
                </Actionable>
              ))}

              <Divider />
            </>
          ))}

          <StyledLanguageSelector />
        </ModalBody>
      </StyledNavModalMobile>
    </SidebarModal>
  )
}
