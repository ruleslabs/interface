import { createAction } from '@reduxjs/toolkit'

import { SupportedLocale } from '@/constants/locales'

export const updateUserLocale = createAction<{ userLocale: SupportedLocale | null }>('user/updateUserLocale')
