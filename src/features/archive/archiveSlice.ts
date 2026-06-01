import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { deleteRequest, fetchRequestDetail, fetchRequests, searchRequests } from '../../api/harfApi'
import type { RootState } from '../../app/store'
import type { ArchiveRequestItem } from '../../api/types'
import type { TranscriptView } from '../transcription/transcriptionSlice'

type PendingRemovalItem = {
  item: ArchiveRequestItem
  itemsIndex: number
  allItemsIndex: number
}

function normalizeForSearch(value: string): string {
  return value.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function filterByFileNameOrUrl(items: ArchiveRequestItem[], query: string): ArchiveRequestItem[] {
  const normalizedQuery = normalizeForSearch(query)

  if (!normalizedQuery) {
    return items
  }

  return items.filter((item) => {
    const searchable = `${item.filename ?? ''} ${item.media_url ?? ''}`
    return normalizeForSearch(searchable).includes(normalizedQuery)
  })
}

function mergeUniqueById(
  primary: ArchiveRequestItem[],
  secondary: ArchiveRequestItem[]
): ArchiveRequestItem[] {
  const map = new Map<number, ArchiveRequestItem>()

  for (const item of primary) {
    map.set(item.id, item)
  }

  for (const item of secondary) {
    if (!map.has(item.id)) {
      map.set(item.id, item)
    }
  }

  return Array.from(map.values())
}

type ArchiveState = {
  allItems: ArchiveRequestItem[]
  items: ArchiveRequestItem[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  query: string
  expandedRequestId: number | null
  transcriptView: TranscriptView
  details: Record<number, ArchiveRequestItem>
  detailStatus: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>
  deletingIds: number[]
  pendingRemovals: Record<number, PendingRemovalItem>
}

const initialState: ArchiveState = {
  allItems: [],
  items: [],
  status: 'idle',
  error: null,
  query: '',
  expandedRequestId: null,
  transcriptView: 'simple',
  details: {},
  detailStatus: {},
  deletingIds: [],
  pendingRemovals: {},
}

export const loadArchiveRequests = createAsyncThunk<ArchiveRequestItem[], void, { rejectValue: string }>(
  'archive/loadRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchRequests()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'خطا در دریافت آرشیو.'
      return rejectWithValue(message)
    }
  }
)

export const searchArchiveRequests = createAsyncThunk<
  ArchiveRequestItem[],
  string,
  { state: RootState; rejectValue: string }
>('archive/searchRequests', async (query, { rejectWithValue, getState }) => {
  const localItems = filterByFileNameOrUrl(getState().archive.allItems, query)

  try {
    const apiItems = await searchRequests(query)
    return mergeUniqueById(localItems, apiItems)
  } catch (error) {
    if (localItems.length > 0) {
      return localItems
    }

    const message = error instanceof Error ? error.message : 'خطا در جستجوی آرشیو.'
    return rejectWithValue(message)
  }
})

export const loadArchiveRequestDetail = createAsyncThunk<
  ArchiveRequestItem,
  number,
  { rejectValue: string }
>('archive/loadRequestDetail', async (requestId, { rejectWithValue }) => {
  try {
    return await fetchRequestDetail(requestId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت جزئیات فایل.'
    return rejectWithValue(message)
  }
})

export const removeArchiveRequest = createAsyncThunk<number, number, { rejectValue: string }>(
  'archive/removeRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      await deleteRequest(requestId)
      return requestId
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حذف فایل با خطا مواجه شد.'
      return rejectWithValue(message)
    }
  }
)

const archiveSlice = createSlice({
  name: 'archive',
  initialState,
  reducers: {
    setArchiveQuery(state, action: PayloadAction<string>) {
      state.query = action.payload
    },
    setExpandedRequestId(state, action: PayloadAction<number | null>) {
      state.expandedRequestId = action.payload
    },
    setArchiveTranscriptView(state, action: PayloadAction<TranscriptView>) {
      state.transcriptView = action.payload
    },
    clearArchiveError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadArchiveRequests.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadArchiveRequests.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.allItems = action.payload
        state.items = action.payload
      })
      .addCase(loadArchiveRequests.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'خطا در دریافت لیست.'
      })

      .addCase(searchArchiveRequests.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(searchArchiveRequests.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(searchArchiveRequests.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'جستجو با خطا مواجه شد.'
      })

      .addCase(loadArchiveRequestDetail.pending, (state, action) => {
        state.detailStatus[action.meta.arg] = 'loading'
      })
      .addCase(loadArchiveRequestDetail.fulfilled, (state, action) => {
        state.details[action.payload.id] = action.payload
        state.detailStatus[action.payload.id] = 'succeeded'
      })
      .addCase(loadArchiveRequestDetail.rejected, (state, action) => {
        state.detailStatus[action.meta.arg] = 'failed'
        state.error = action.payload ?? 'جزئیات فایل دریافت نشد.'
      })

      .addCase(removeArchiveRequest.pending, (state, action) => {
        const requestId = action.meta.arg

        if (!state.deletingIds.includes(requestId)) {
          state.deletingIds.push(requestId)
        }

        const itemsIndex = state.items.findIndex((item) => item.id === requestId)
        const allItemsIndex = state.allItems.findIndex((item) => item.id === requestId)
        const snapshot = allItemsIndex !== -1 ? state.allItems[allItemsIndex] : null

        if (snapshot) {
          state.pendingRemovals[requestId] = {
            item: snapshot,
            itemsIndex,
            allItemsIndex,
          }
        }

        if (itemsIndex !== -1) {
          state.items.splice(itemsIndex, 1)
        }

        if (allItemsIndex !== -1) {
          state.allItems.splice(allItemsIndex, 1)
        }

        delete state.details[requestId]
        delete state.detailStatus[requestId]

        if (state.expandedRequestId === requestId) {
          state.expandedRequestId = null
        }
      })
      .addCase(removeArchiveRequest.fulfilled, (state, action) => {
        const requestId = action.payload
        state.deletingIds = state.deletingIds.filter((id) => id !== requestId)
        delete state.pendingRemovals[requestId]
        state.items = state.items.filter((item) => item.id !== requestId)
        state.allItems = state.allItems.filter((item) => item.id !== requestId)
        delete state.details[requestId]
        delete state.detailStatus[requestId]

        if (state.expandedRequestId === requestId) {
          state.expandedRequestId = null
        }
      })
      .addCase(removeArchiveRequest.rejected, (state, action) => {
        const requestId = action.meta.arg
        state.deletingIds = state.deletingIds.filter((id) => id !== requestId)

        const removed = state.pendingRemovals[requestId]

        if (removed) {
          const safeAllIndex = Math.max(0, Math.min(removed.allItemsIndex, state.allItems.length))
          state.allItems.splice(safeAllIndex, 0, removed.item)

          if (removed.itemsIndex !== -1) {
            const safeItemsIndex = Math.max(0, Math.min(removed.itemsIndex, state.items.length))
            state.items.splice(safeItemsIndex, 0, removed.item)
          }

          delete state.pendingRemovals[requestId]
        }

        state.error = action.payload ?? 'حذف فایل ناموفق بود.'
      })
  },
})

export const { setArchiveQuery, setExpandedRequestId, setArchiveTranscriptView, clearArchiveError } =
  archiveSlice.actions

export const archiveReducer = archiveSlice.reducer
