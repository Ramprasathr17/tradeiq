import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, exchangeKiteToken, getUser, signOut, signInWithEmail, signUpWithEmail } from '../lib/supabase'
import { kite, DEMO, isDemoMode } from '../lib/kite'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [supaUser, setSupaUser]       = useState(null)
  const [kiteUser, setKiteUser]       = useState(null)
  const [isDemo, setIsDemo]           = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  // Listen to Supabase auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupaUser(session?.user ?? null)
      // Restore Kite session if previously saved
      const saved = kite.getUser()
      if (saved) setKiteUser(saved)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupaUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Supabase email auth ─────────────────────────────────────────
  const loginEmail = async (email, password) => {
    const { error } = await signInWithEmail(email, password)
    if (error) throw error
    toast.success('Logged in!')
  }

  const signupEmail = async (email, password) => {
    const { error } = await signUpWithEmail(email, password)
    if (error) throw error
    toast.success('Account created! Check your email to confirm.')
  }

  // ── Kite Connect OAuth ──────────────────────────────────────────
  const loginKite = () => {
    window.location.href = kite.getLoginUrl()
  }

  const handleKiteCallback = useCallback(async (request_token) => {
    try {
      const { access_token, user } = await exchangeKiteToken(
        request_token,
        import.meta.env.VITE_KITE_API_KEY
      )
      kite.saveSession(access_token, user)
      setKiteUser(user)
      toast.success(`Welcome, ${user.user_name}!`)
      return user
    } catch (err) {
      toast.error('Kite login failed: ' + err.message)
      throw err
    }
  }, [])

  // ── Demo mode ───────────────────────────────────────────────────
  const enableDemo = () => {
    setIsDemo(true)
    setKiteUser(DEMO.profile)
    toast.success('Demo mode active — using simulated data')
  }

  // ── Logout ──────────────────────────────────────────────────────
  const logout = async () => {
    kite.clearSession()
    setKiteUser(null)
    setIsDemo(false)
    await signOut()
    toast.success('Logged out')
  }

  const isAuthenticated = isDemo || !!kiteUser || !!supaUser

  return (
    <AuthContext.Provider value={{
      supaUser, kiteUser, isDemo, authLoading,
      isAuthenticated,
      userId: supaUser?.id || null,
      loginEmail, signupEmail, loginKite, handleKiteCallback,
      enableDemo, logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
