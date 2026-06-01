import { configureStore } from '@reduxjs/toolkit'

import { archiveReducer } from '../features/archive/archiveSlice'
import { transcriptionReducer } from '../features/transcription/transcriptionSlice'
import { uiReducer } from '../features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    archive: archiveReducer,
    transcription: transcriptionReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
