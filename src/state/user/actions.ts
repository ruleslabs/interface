import { createAction } from '@reduxjs/toolkit'

export const setCurrentUser = createAction<{ user: any | null }>('application/setCurrentUser')
