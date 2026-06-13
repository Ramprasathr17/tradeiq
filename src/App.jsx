import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { usePortfolio } from './hooks/usePortfolio'
import Sidebar    from './components/Layout/Sidebar'
import Topbar     from './components/Layout/Topbar'
import TickerTape from './components/Layout/TickerTape'
import LoginPage  from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import Dashboard  from './pages/Dashboard'
import Portfolio  from './pages/Portfolio'
import Watchlist  from './pages/Watchlist'
import Options    from './pages/Options'
import Strategy   from './pages/Strategy'
import Learning   from './pages/Learning'
import News       from './pages/News'
import Journal    from './pages/Journal'
import Settings   from './pages/Settings'

export default function App() {
  const auth = useAuth()
  const portfolio = usePortfolio()
  const [page, setPage] = useState('dashboard')

  if (auth.authLoading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:'1rem' }}>
        <div className="spinner"></div>
        <p className="muted" style={{ fontSize:14 }}>Loading TradeIQ…</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={
        !auth.isAuthenticated
          ? <LoginPage />
          : (
            <div style={{ display:'flex', minHeight:'100vh' }}>
              <Sidebar page={page} onNav={setPage} />
              <div style={{ marginLeft:'var(--sidebar-w)', flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
                <TickerTape holdings={portfolio.holdings} />
                <Topbar auth={auth} portfolio={portfolio} page={page} />
                <main style={{ flex:1, padding:'1.75rem 2rem', animation:'fadeIn .2s ease' }}>
                  {page === 'dashboard' && <Dashboard portfolio={portfolio} auth={auth} />}
                  {page === 'portfolio' && <Portfolio portfolio={portfolio} />}
                  {page === 'watchlist' && <Watchlist auth={auth} />}
                  {page === 'options'   && <Options auth={auth} />}
                  {page === 'strategy' && <Strategy />}
                  {page === 'learning' && <Learning />}
                  {page === 'news'     && <News />}
                  {page === 'journal'  && <Journal auth={auth} />}
                  {page === 'settings' && <Settings auth={auth} />}
                </main>
              </div>
            </div>
          )
      } />
    </Routes>
  )
}
