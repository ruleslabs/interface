import { createAction } from '@reduxjs/toolkit'
import { SupportedLocale } from 'src/constants/locales'

export const updateUserLocale = createAction<{ userLocale: SupportedLocale | null }>('user/updateUserLocale')
