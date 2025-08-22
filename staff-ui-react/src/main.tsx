/**
 * 🚀 Application Entry Point
 * Main entry file for the Staff UI React application
 */

import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// 🎨 Import Global Styles
import './index.css'

// 🔍 Get root element
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

// 🚀 Initialize React Application
const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)

// 🌍 Development Hot Module Replacement
if (import.meta.hot) {
  import.meta.hot.accept()
}