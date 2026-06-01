import { Navigate, Route, Routes } from 'react-router-dom'

import { AppFrame } from './layout/AppFrame'
import { ArchivePage } from './pages/ArchivePage'
import { SpeechPage } from './pages/SpeechPage'

function App() {
  return (
    <AppFrame>
      <Routes>
        <Route path="/" element={<SpeechPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppFrame>
  )
}

export default App
