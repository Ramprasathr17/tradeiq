import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const { handleKiteCallback } = useAuth()
  const navigate  = useNavigate()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const params  = new URLSearchParams(window.location.search)
    const token   = params.get('request_token')
    const status  = params.get('status')

    if (status !== 'success' || !token) {
      toast.error('Kite login cancelled or failed')
      navigate('/', { replace: true })
      return
    }

    handleKiteCallback(token)
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/', { replace: true }))
  }, [])

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', flexDirection:'column', gap:'1.25rem',
      background:'var(--bg)'
    }}>
      <div style={{
        width:56, height:56,
        background:'linear-gradient(135deg,var(--accent),var(--accent2))',
        borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26
      }}>
        <i className="ti ti-chart-candle" style={{ color:'#fff' }}></i>
      </div>
      <div className="spinner"></div>
      <p style={{ color:'var(--text2)', fontSize:14 }}>Connecting to Kite…</p>
    </div>
  )
}
