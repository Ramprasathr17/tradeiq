import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { loginEmail, signupEmail, loginKite, enableDemo } = useAuth()
  const [mode,     setMode]     = useState('login')   // login | signup
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { toast.error('Enter email and password'); return }
    setLoading(true)
    try {
      if (mode === 'login') await loginEmail(email, password)
      else await signupEmail(email, password)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:'100vh', background:'var(--bg)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'2rem'
    }}>
      {/* Background glow */}
      <div style={{
        position:'fixed', top:'20%', left:'50%', transform:'translateX(-50%)',
        width:600, height:600, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(0,212,170,.04) 0%, transparent 70%)',
        pointerEvents:'none'
      }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <div style={{
            width:60, height:60,
            background:'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 1rem', fontSize:28, boxShadow:'0 8px 32px rgba(0,212,170,.2)'
          }}>
            <i className="ti ti-chart-candle" style={{ color:'#fff' }}></i>
          </div>
          <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:'-.5px' }}>
            Trade<span style={{ color:'var(--accent)' }}>IQ</span>
          </h1>
          <p style={{ color:'var(--text2)', marginTop:'.4rem', fontSize:14 }}>
            Your options & portfolio command centre
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding:'2rem' }}>
          {/* Kite login */}
          <button onClick={loginKite} style={{
            width:'100%', background:'linear-gradient(135deg,#387ed1,#1a4f9c)',
            color:'#fff', border:'none', borderRadius:'var(--radius-sm)',
            padding:'.9rem', fontSize:14, fontWeight:600,
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            cursor:'pointer', marginBottom:'1.25rem', transition:'opacity .2s'
          }}
            onMouseEnter={e=>e.currentTarget.style.opacity='.9'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}
          >
            <i className="ti ti-brand-zerodha" style={{ fontSize:20 }}></i>
            Continue with Zerodha Kite
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1.25rem' }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }}></div>
            <span style={{ fontSize:12, color:'var(--text3)' }}>or use email</span>
            <div style={{ flex:1, height:1, background:'var(--border)' }}></div>
          </div>

          {/* Email/password */}
          <div style={{ display:'flex', flexDirection:'column', gap:'.6rem', marginBottom:'1rem' }}>
            <input
              className="input" placeholder="Email address" type="email"
              value={email} onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
            />
            <input
              className="input" placeholder="Password (min 6 chars)" type="password"
              value={password} onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
            />
          </div>

          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}
            style={{ width:'100%', justifyContent:'center', padding:'.8rem', marginBottom:'.75rem' }}>
            {loading ? <span className="spinner-sm"></span> : null}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <button onClick={()=>setMode(m=>m==='login'?'signup':'login')}
            style={{ width:'100%', fontSize:13, color:'var(--text2)', padding:'.4rem', textAlign:'center' }}>
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>

          <div style={{ margin:'1.25rem 0', height:1, background:'var(--border)' }}></div>

          <button onClick={enableDemo} style={{
            width:'100%', background:'var(--surface2)', color:'var(--text)',
            border:'1px solid var(--border2)', borderRadius:'var(--radius-sm)',
            padding:'.75rem', fontSize:13, fontWeight:500,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer'
          }}>
            <i className="ti ti-play" style={{ color:'var(--accent)', fontSize:16 }}></i>
            Try Demo Mode — no login needed
          </button>
        </div>

        {/* Trust badges */}
        <div style={{
          display:'flex', justifyContent:'center', gap:'1.5rem',
          marginTop:'1.5rem', color:'var(--text3)', fontSize:12
        }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-shield-check" style={{ color:'var(--green)' }}></i> OAuth 2.0
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-database" style={{ color:'var(--accent2)' }}></i> Supabase RLS
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-brand-github" style={{ color:'var(--text2)' }}></i> Open source
          </span>
        </div>
      </div>
    </div>
  )
}
