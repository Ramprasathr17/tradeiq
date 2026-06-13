import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/tradeiq">
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#171b26',
              color: '#e8eaf0',
              border: '1px solid #252a40',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '13px',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#00d4aa', secondary: '#000' } },
            error:   { iconTheme: { primary: '#ff4d6d', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
