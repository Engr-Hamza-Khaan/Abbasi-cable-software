import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import { setupAxiosDebug, installApiDebugHelpers } from './utils/axiosDebug'
import App from './App.jsx'

setupAxiosDebug(axios, 'HTTP')
installApiDebugHelpers()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
