import React from 'react'
import ReactDOM from 'react-dom/client'
// --- NEW: Import BrowserRouter ---
import { BrowserRouter } from 'react-router-dom'
import App from './App' // Your App.tsx file
import './index.css'
import { ThemeProvider } from '@/components/ui/theme-provider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* --- NEW: Wrap your entire app in BrowserRouter --- */}
    <BrowserRouter>
  <ThemeProvider>
    <App />
  </ThemeProvider>
</BrowserRouter>

  </React.StrictMode>,
)