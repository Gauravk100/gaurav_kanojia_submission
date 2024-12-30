import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {Popup,MaangPopup} from './App.tsx'
import { ThemeProvider } from './providers/theme.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider> 
      {
        <MaangPopup/>
      }
    </ThemeProvider>
  </StrictMode>
)
