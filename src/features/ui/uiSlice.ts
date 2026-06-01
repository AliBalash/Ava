import { createSlice } from '@reduxjs/toolkit'

type UiState = {
  userMenuOpen: boolean
}

const initialState: UiState = {
  userMenuOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleUserMenu(state) {
      state.userMenuOpen = !state.userMenuOpen
    },
    closeUserMenu(state) {
      state.userMenuOpen = false
    },
  },
})

export const { toggleUserMenu, closeUserMenu } = uiSlice.actions
export const uiReducer = uiSlice.reducer
