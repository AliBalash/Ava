import { useEffect, useMemo, useState } from 'react'

import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  loadArchiveRequestDetail,
  loadArchiveRequests,
  removeArchiveRequest,
  searchArchiveRequests,
  setArchiveQuery,
  setArchiveTranscriptView,
  setExpandedRequestId,
} from '../features/archive/archiveSlice'
import { buildSimpleTranscript, fileExtension, formatProcessedDate } from '../utils/format'

const ITEMS_PER_PAGE = 8

function buildPagination(totalPages: number, currentPage: number): Array<number | 'dots'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'dots', totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [1, 'dots', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, 'dots', currentPage - 1, currentPage, currentPage + 1, 'dots', totalPages]
}

export function ArchivePage() {
  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const {
    items,
    status,
    error,
    query,
    expandedRequestId,
    transcriptView,
    details,
    detailStatus,
    deletingIds,
  } = useAppSelector((state) => state.archive)

  useEffect(() => {
    dispatch(loadArchiveRequests())
  }, [dispatch])

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
      dispatch(setExpandedRequestId(null))
    }
  }, [currentPage, dispatch, totalPages])

  const rows = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return items.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, items])

  const paginationItems = useMemo(() => buildPagination(totalPages, currentPage), [currentPage, totalPages])

  const onSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      dispatch(loadArchiveRequests())
      setCurrentPage(1)
      dispatch(setExpandedRequestId(null))
      return
    }

    dispatch(searchArchiveRequests(trimmedQuery))
    setCurrentPage(1)
    dispatch(setExpandedRequestId(null))
  }

  const onToggleExpand = (requestId: string) => {
    const nextValue = expandedRequestId === requestId ? null : requestId
    dispatch(setExpandedRequestId(nextValue))

    if (nextValue && !details[requestId]) {
      dispatch(loadArchiveRequestDetail(requestId))
    }
  }

  return (
    <section className="archive-page">
      <header className="archive-header">
        <h1 className="archive-title">آرشیو من</h1>

        <form className="archive-search" onSubmit={onSearchSubmit}>
          <input
            type="search"
            value={query}
            onChange={(event) => dispatch(setArchiveQuery(event.target.value))}
            placeholder="جستجو در آرشیو..."
          />
          <button type="submit">جستجو</button>
        </form>
      </header>

      <div className="archive-card">
        <div className="archive-head-row">
          <span>نام فایل</span>
          <span>تاریخ بارگذاری</span>
          <span>نوع فایل</span>
          <span>مدت زمان</span>
          <span>عملیات</span>
        </div>

        {status === 'loading' ? <p className="archive-status">در حال دریافت لیست...</p> : null}
        {status === 'failed' && error ? <p className="archive-status archive-error">{error}</p> : null}

        {rows.map((item) => {
          const isExpanded = expandedRequestId === item.id
          const detail = details[item.id] ?? item
          const segments = detail.segments ?? []
          const isDeleting = deletingIds.includes(item.id)

          return (
            <div className="archive-row-wrap" key={item.id}>
              <div
                className="archive-row"
                role="button"
                tabIndex={0}
                onClick={() => onToggleExpand(item.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onToggleExpand(item.id)
                  }
                }}
              >
                <span className="archive-file-name">{item.filename || item.media_url}</span>
                <span>{formatProcessedDate(item.processed)}</span>
                <span>{fileExtension(item.filename)}</span>
                <span>{item.duration || '-'}</span>
                <span className="archive-actions">
                  <a
                    href={item.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="icon-action"
                    onClick={(event) => event.stopPropagation()}
                    title="لینک فایل"
                  >
                    🔗
                  </a>

                  <button
                    type="button"
                    className="icon-action"
                    onClick={(event) => {
                      event.stopPropagation()
                      navigator.clipboard
                        .writeText(item.media_url)
                        .catch(() => window.prompt('لینک فایل را کپی کنید:', item.media_url))
                    }}
                    title="کپی لینک"
                  >
                    ⧉
                  </button>

                  <a
                    href={item.media_url}
                    target="_blank"
                    rel="noreferrer"
                    className="icon-action"
                    onClick={(event) => event.stopPropagation()}
                    title="دانلود"
                  >
                    ⬇
                  </a>

                  <button
                    type="button"
                    className="icon-action icon-danger"
                    disabled={isDeleting}
                    onClick={(event) => {
                      event.stopPropagation()

                      if (window.confirm('این مورد از آرشیو حذف شود؟')) {
                        dispatch(removeArchiveRequest(item.id))
                      }
                    }}
                    title="حذف"
                  >
                    🗑
                  </button>
                </span>
              </div>

              {isExpanded ? (
                <div className="archive-expanded" role="region" aria-label={`جزئیات ${item.filename}`}>
                  <div className="archive-expanded-tabs">
                    <button
                      type="button"
                      className={transcriptView === 'timed' ? 'result-tab result-tab-active' : 'result-tab'}
                      onClick={() => dispatch(setArchiveTranscriptView('timed'))}
                    >
                      متن زمان‌بندی شده
                    </button>
                    <button
                      type="button"
                      className={transcriptView === 'simple' ? 'result-tab result-tab-active' : 'result-tab'}
                      onClick={() => dispatch(setArchiveTranscriptView('simple'))}
                    >
                      متن ساده
                    </button>
                  </div>

                  {detailStatus[item.id] === 'loading' ? (
                    <p className="archive-status">درحال دریافت جزئیات...</p>
                  ) : transcriptView === 'simple' ? (
                    <p className="result-simple-text">{buildSimpleTranscript(segments)}</p>
                  ) : (
                    <ul className="result-timeline">
                      {segments.map((segment, index) => (
                        <li key={`${segment.start}-${segment.end}-${index}`}>
                          <span className="time-pill">{segment.start}</span>
                          <span className="segment-text">{segment.text || '---'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          )
        })}

        {status !== 'loading' && rows.length === 0 ? (
          <p className="archive-status">نتیجه‌ای برای نمایش پیدا نشد.</p>
        ) : null}

        {totalPages > 1 ? (
          <div className="archive-pagination">
            <button
              type="button"
              className="pagination-nav-btn"
              onClick={() => {
                setCurrentPage((prev) => Math.max(1, prev - 1))
                dispatch(setExpandedRequestId(null))
              }}
              disabled={currentPage === 1}
              aria-label="صفحه قبل"
            >
              قبلی
            </button>

            {paginationItems.map((item, index) => {
              if (item === 'dots') {
                return (
                  <span key={`dots-${index}`} className="pagination-dots">
                    ...
                  </span>
                )
              }

              const isActive = item === currentPage

              return (
                <button
                  key={item}
                  type="button"
                  className={isActive ? 'pagination-page-btn active-page' : 'pagination-page-btn'}
                  onClick={() => {
                    setCurrentPage(item)
                    dispatch(setExpandedRequestId(null))
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item}
                </button>
              )
            })}

            <button
              type="button"
              className="pagination-nav-btn"
              onClick={() => {
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                dispatch(setExpandedRequestId(null))
              }}
              disabled={currentPage === totalPages}
              aria-label="صفحه بعد"
            >
              بعدی
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
