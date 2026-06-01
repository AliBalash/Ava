# Ava (Goftar UI)

Ava is a React + TypeScript single-page app for Speech-to-Text workflows.
This project includes:

- Pixel-implemented UI from design
- Routing with `react-router-dom`
- State management with Redux Toolkit
- Backend API integration for transcription and archive
- File upload transcription (`multipart/form-data`)
- Archive search, pagination, detail view, and delete

## Tech Stack

- React 19
- TypeScript
- Vite
- Redux Toolkit + React Redux
- React Router
- ESLint

## Pages

- `/` : Speech to text page
  - Modes: record (UI), upload file, direct link
  - Language select (FA/EN)
  - Shows simple text and timed segments
- `/archive` : Archive page
  - Search in archive
  - Pagination
  - Expand row for transcript details
  - Copy/download/delete actions

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Create environment file

Create `.env` in project root:

```env
VITE_API_BASE_URL=https://harf.roshan-ai.ir/api
VITE_API_TOKEN=YOUR_TOKEN_HERE
VITE_DEMO_MEDIA_URL=http://harf.roshan-ai.ir/media/cache/6d/f6/5822ffc36d9b6e6b61fb88bd0b96509cc62db0afae1a1c935616.mp3
# optional (if you want to set full auth header manually)
# VITE_API_AUTH_HEADER=Bearer YOUR_TOKEN_HERE
```

### 3) Run development server

```bash
npm run dev
```

### 4) Build production

```bash
npm run build
```

### 5) Preview production build

```bash
npm run preview
```

### 6) Lint

```bash
npm run lint
```

## Important Notes

- `.env` is ignored by git.
- For real upload mode, backend expects `media` field in `multipart/form-data`.
- If search by filename returns empty from backend, frontend fallback search still works on local archive items.
- Node warning may appear with `v20.18.1`; Vite recommends `20.19+` or `22.12+`.

## Project Structure

```text
src/
  api/
    client.ts
    harfApi.ts
    types.ts
  app/
    store.ts
    hooks.ts
  components/
    UserMenu.tsx
  features/
    archive/
      archiveSlice.ts
    transcription/
      transcriptionSlice.ts
    ui/
      uiSlice.ts
  layout/
    AppFrame.tsx
    SideNav.tsx
  pages/
    SpeechPage.tsx
    ArchivePage.tsx
  utils/
    format.ts
  App.tsx
  main.tsx
  index.css
```

## Commit Style Used In This Repo

Small, incremental commits with simple messages were used to keep history easy to follow.
