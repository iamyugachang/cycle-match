import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

// Import base styles
import './styles/index.css'

// Import component styles - now consolidated
import './styles/components/Layout.css'
import './styles/components/TeacherForm.css'
import './styles/components/LocationSelector.css'
import './styles/components/MatchList.css'
import './styles/components/MatchCard.css'
import './styles/components/Modal.css'
import './styles/components/ControlPanel.css'
import './styles/components/TeacherProfile.css'
import './styles/components/AnnouncementBanner.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)