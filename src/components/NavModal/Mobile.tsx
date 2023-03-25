import React from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import SidebarModal, { ModalHeader, ModalBody, ModalContent } from '@/components/Modal/Sidebar'
import { RowCenter } from '@/components/Row'
import { useNavModalMobileToggle, useSidebarModalOpened } from '@/state/application/hooks'
import { ApplicationSidebarModal } from '@/state/application/actions'
import LanguageSelector from '@/components/LanguageSelector'
import { SidebarNavButton } from '@/components/Button'
import { useNavLinks } from '@/hooks/useNav'
import Actionable from './Actionable'
import Divider from '@/components/Divider'
import Column from '@/components/Column'

import ExternalLinkIcon from '@/images/external-link.svg'

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
  const isOpen = useSidebarModalOpened(ApplicationSidebarModal.NAV_MOBILE)

  // nav links
  const navLinks = useNavLinks()

  return (
    <SidebarModal onDismiss={toggleNavModalMobile} isOpen={isOpen} position="left">
      <ModalContent>
        <ModalHeader onDismiss={toggleNavModalMobile} />

        <ModalBody gap={8}>
          {navLinks.map((navLinks, index) => (
            <Column key={`nav-links-${index}`} gap={8}>
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
            </Column>
          ))}

          <StyledLanguageSelector />
        </ModalBody>
      </ModalContent>
    </SidebarModal>
  )
}
