import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { transcribeFromMediaFile, transcribeFromMediaUrl, type ApiLanguageCode } from '../../api/harfApi'
import type { TranscriptionSegment } from '../../api/types'

export type InputMode = 'record' | 'upload' | 'link'
export type TranscriptView = 'simple' | 'timed'

type TranscriptResult = {
  downloadUrl: string
  duration: string
  segments: TranscriptionSegment[]
}

type SpeechState = {
  mode: InputMode
  language: 'فارسی' | 'انگلیسی'
  mediaLink: string
  uploadedFileName: string
  isRecording: boolean
  result: TranscriptResult | null
  selectedView: TranscriptView
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: SpeechState = {
  mode: 'record',
  language: 'فارسی',
  mediaLink: '',
  uploadedFileName: '',
  isRecording: false,
  result: null,
  selectedView: 'simple',
  status: 'idle',
  error: null,
}

export const submitTranscription = createAsyncThunk<
  TranscriptResult,
  { mediaUrl?: string; mediaFile?: File; language: ApiLanguageCode },
  { rejectValue: string }
>('transcription/submit', async ({ mediaUrl, mediaFile, language }, { rejectWithValue }) => {
  try {
    const response = mediaFile
      ? await transcribeFromMediaFile(mediaFile, language)
      : await transcribeFromMediaUrl(mediaUrl ?? '', language)
    const firstResult = response[0]

    if (!firstResult) {
      return rejectWithValue('پاسخ معتبری از API دریافت نشد.')
    }

    if (firstResult.message && !firstResult.segments) {
      return rejectWithValue(firstResult.message)
    }

    return {
      downloadUrl: firstResult.download_url ?? mediaUrl ?? '',
      duration: firstResult.duration ?? '0:00:00',
      segments: firstResult.segments ?? [],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطای پیش‌بینی نشده رخ داد.'
    return rejectWithValue(message)
  }
})

const transcriptionSlice = createSlice({
  name: 'transcription',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<InputMode>) {
      state.mode = action.payload
      state.error = null
    },
    setLanguage(state, action: PayloadAction<'فارسی' | 'انگلیسی'>) {
      state.language = action.payload
    },
    setMediaLink(state, action: PayloadAction<string>) {
      state.mediaLink = action.payload
    },
    setUploadedFileName(state, action: PayloadAction<string>) {
      state.uploadedFileName = action.payload
    },
    toggleRecording(state) {
      state.isRecording = !state.isRecording
    },
    setSelectedView(state, action: PayloadAction<TranscriptView>) {
      state.selectedView = action.payload
    },
    setSpeechError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
      state.status = action.payload ? 'failed' : state.status
    },
    resetResult(state) {
      state.result = null
      state.selectedView = 'simple'
      state.error = null
      state.status = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitTranscription.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(submitTranscription.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.result = action.payload
        state.isRecording = false
      })
      .addCase(submitTranscription.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'ارسال فایل با خطا مواجه شد.'
      })
  },
})

export const {
  setMode,
  setLanguage,
  setMediaLink,
  setUploadedFileName,
  toggleRecording,
  setSelectedView,
  setSpeechError,
  resetResult,
} = transcriptionSlice.actions

export const transcriptionReducer = transcriptionSlice.reducer
