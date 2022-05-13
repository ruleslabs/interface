import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'

import { AppState } from '@/state'
import { useAppSelector, useAppDispatch } from '@/state/hooks'
import { setOpenModal, ApplicationModal } from './actions'

export function useBlockNumber(): number | undefined {
  return useAppSelector((state: AppState) => state.application.blockNumber)
}

export function useEthereumBlockNumber(): number | undefined {
  const { chainId } = useWeb3React()
  return useAppSelector((state: AppState) => state.application.ethereumBlockNumber[chainId ?? -1])
}

export function useModalOpen(modal: ApplicationModal | null): boolean {
  const openModal = useAppSelector((state) => state.application.openModal)
  return openModal === modal
}

export function useCloseModal(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal({ modal: null })), [dispatch])
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal({ modal })), [dispatch, modal])
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal({ modal: open ? null : modal })), [dispatch, modal, open])
}

export function useSettingsModalToggle(): () => void {
  return useToggleModal(ApplicationModal.SETTINGS)
}

export function useAuthModalToggle(): () => void {
  return useToggleModal(ApplicationModal.AUTH)
}

export function useDeckInsertionModalToggle(): () => void {
  return useToggleModal(ApplicationModal.DECK_INSERTION)
}

export function usePackPurchaseModalToggle(): () => void {
  return useToggleModal(ApplicationModal.PACK_PURCHASE)
}

export function useNavModalToggle(): () => void {
  return useToggleModal(ApplicationModal.NAV)
}

export function useDepositModalToggle(): () => void {
  return useToggleModal(ApplicationModal.DEPOSIT)
}
