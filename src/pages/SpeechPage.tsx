import { useMemo, useState } from 'react'

import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  resetResult,
  setLanguage,
  setMediaLink,
  setMode,
  setSelectedView,
  setSpeechError,
  setUploadedFileName,
  submitTranscription,
  toggleRecording,
  type InputMode,
} from '../features/transcription/transcriptionSlice'
import { buildSimpleTranscript } from '../utils/format'

const DEMO_MEDIA_URL =
  (import.meta.env.VITE_DEMO_MEDIA_URL as string | undefined)?.trim() ||
  'http://harf.roshan-ai.ir/media/cache/6d/f6/5822ffc36d9b6e6b61fb88bd0b96509cc62db0afae1a1c935616.mp3'

const hints: Record<InputMode, string> = {
  record: 'برای شروع به صحبت، دکمه میکروفون را بزنید. متن پیاده‌سازی شده اینجا نمایش داده می‌شود.',
  upload: 'فایل صوتی/تصویری انتخاب کنید تا همان فایل مستقیما به API ارسال و تبدیل شود.',
  link: 'نشانی مستقیم فایل گفتاری (صوتی/تصویری) را وارد و تبدیل را شروع کنید.',
}

export function SpeechPage() {
  const dispatch = useAppDispatch()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const {
    mode,
    mediaLink,
    language,
    uploadedFileName,
    result,
    selectedView,
    isRecording,
    status,
    error,
  } = useAppSelector((state) => state.transcription)

  const simpleText = useMemo(() => buildSimpleTranscript(result?.segments ?? []), [result])

  const onSubmit = () => {
    dispatch(setSpeechError(null))

    const link = mediaLink.trim()
    const languageCode = language === 'انگلیسی' ? 'en' : 'fa'

    if (mode === 'upload') {
      if (!selectedFile) {
        dispatch(setSpeechError('لطفا ابتدا یک فایل برای بارگذاری انتخاب کنید.'))
        return
      }

      dispatch(submitTranscription({ mediaFile: selectedFile, language: languageCode }))
      return
    }

    if (mode === 'link') {
      if (!link) {
        dispatch(setSpeechError('لطفا لینک فایل را وارد کنید.'))
        return
      }
      dispatch(submitTranscription({ mediaUrl: link, language: languageCode }))
      return
    }

    dispatch(submitTranscription({ mediaUrl: DEMO_MEDIA_URL, language: languageCode }))
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    setSelectedFile(selectedFile ?? null)
    dispatch(setUploadedFileName(selectedFile ? selectedFile.name : ''))
  }

  return (
    <section className="speech-page">
      <header className="speech-page-header">
        <h1 className="speech-title">تبدیل گفتار به متن</h1>
        <p className="speech-subtitle">
          آوا با استفاده از هزاران ساعت گفتار با صدای افراد مختلف، زبان فارسی را یاد گرفته است و
          می‌تواند متن صحبت‌ها را بنویسد.
        </p>
      </header>

      <div className="speech-card">
        <div className="mode-switch">
          <button
            type="button"
            className={mode === 'record' ? 'mode-btn mode-btn-active' : 'mode-btn'}
            onClick={() => dispatch(setMode('record'))}
          >
            ضبط صدا
          </button>
          <button
            type="button"
            className={mode === 'upload' ? 'mode-btn mode-btn-active' : 'mode-btn'}
            onClick={() => dispatch(setMode('upload'))}
          >
            بارگذاری فایل
          </button>
          <button
            type="button"
            className={mode === 'link' ? 'mode-btn mode-btn-active' : 'mode-btn'}
            onClick={() => dispatch(setMode('link'))}
          >
            لینک
          </button>
        </div>

        {result ? (
          <div className="speech-result-box">
            <div className="result-toolbar">
              <button
                type="button"
                className={selectedView === 'timed' ? 'result-tab result-tab-active' : 'result-tab'}
                onClick={() => dispatch(setSelectedView('timed'))}
              >
                متن زمان‌بندی شده
              </button>
              <button
                type="button"
                className={selectedView === 'simple' ? 'result-tab result-tab-active' : 'result-tab'}
                onClick={() => dispatch(setSelectedView('simple'))}
              >
                متن ساده
              </button>
              <button type="button" className="restart-btn" onClick={() => dispatch(resetResult())}>
                شروع دوباره
              </button>
            </div>

            <div className="result-body">
              {selectedView === 'simple' ? (
                <p className="result-simple-text">{simpleText}</p>
              ) : (
                <ul className="result-timeline">
                  {(result.segments ?? []).map((segment, index) => (
                    <li key={`${segment.start}-${segment.end}-${index}`}>
                      <span className="time-pill">{segment.start}</span>
                      <span className="segment-text">{segment.text || '---'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="result-meta">مدت پردازش: {result.duration || '-'}</div>
          </div>
        ) : (
          <div className="speech-empty">
            {mode === 'record' ? (
              <button type="button" className="mic-circle" onClick={() => dispatch(toggleRecording())}>
                {isRecording ? '■' : '🎤'}
              </button>
            ) : null}

            {mode === 'upload' ? (
              <label className="upload-picker" htmlFor="upload-file-input">
                انتخاب فایل
              </label>
            ) : null}

            {mode === 'upload' ? (
              <input
                id="upload-file-input"
                type="file"
                accept="audio/*,video/*"
                onChange={onFileChange}
                className="hidden-file-input"
              />
            ) : null}

            {mode === 'link' ? (
              <input
                className="speech-link-input"
                type="url"
                value={mediaLink}
                onChange={(event) => dispatch(setMediaLink(event.target.value))}
                placeholder="https://example.com/sample.mp3"
              />
            ) : null}

            <p className="speech-hint">{hints[mode]}</p>
            {uploadedFileName ? <p className="upload-name">فایل انتخاب‌شده: {uploadedFileName}</p> : null}
          </div>
        )}

        <div className="speech-bottom-row">
          <button type="button" className="primary-action" onClick={onSubmit} disabled={status === 'loading'}>
            {status === 'loading' ? 'درحال پردازش...' : 'شروع تبدیل'}
          </button>

          <div className="language-select-wrap">
            <span>زبان گفتار:</span>
            <select
              value={language}
              onChange={(event) => dispatch(setLanguage(event.target.value as 'فارسی' | 'انگلیسی'))}
            >
              <option value="فارسی">فارسی</option>
              <option value="انگلیسی">انگلیسی</option>
            </select>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
      </div>
    </section>
  )
}
