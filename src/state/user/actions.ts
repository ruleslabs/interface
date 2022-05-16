import { createAction } from '@reduxjs/toolkit'

import { SupportedLocale } from '@/constants/locales'

export const setCurrentUser = createAction<{ user: any | null }>('user/setCurrentUser')
export const updateUserLocale = createAction<{ userLocale: SupportedLocale | null }>('user/updateUserLocale')
