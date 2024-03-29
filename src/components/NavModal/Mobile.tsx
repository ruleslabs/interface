import { Trans } from '@lingui/macro'
import React from 'react'
import { SidebarNavButton } from 'src/components/Button'
import Column from 'src/components/Column'
import Divider from 'src/components/Divider'
import LanguageSelector from 'src/components/LanguageSelector'
import SidebarModal, { ModalBody, ModalContent } from 'src/components/Modal/Sidebar'
import { RowCenter } from 'src/components/Row'
import { useNavLinks } from 'src/hooks/useNav'
import { ReactComponent as ExternalLinkIcon } from 'src/images/external-link.svg'
import { ApplicationSidebarModal } from 'src/state/application/actions'
import { useNavModalMobileToggle, useSidebarModalOpened } from 'src/state/application/hooks'
import styled from 'styled-components/macro'

import Actionable from '../Actionable'
import { ModalHeader } from '../Modal'

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

        <ModalBody gap="8">
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
                      <Trans id={navLink.name}>{navLink.name}</Trans>

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
