import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, exchangeKiteToken, signOut, signInWithEmail, signUpWithEmail } from '../lib/supabase'
import { kite, DEMO } from '../lib/kite'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [supaUser, setSupaUser]       = useState(null)
  const [kiteUser, setKiteUser]       = useState(null)
  const [isDemo, setIsDemo]           = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupaUser(session?.user ?? null)
      const saved = kite.getUser()
      if (saved) setKiteUser(saved)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupaUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

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
      toast.success('Welcome, ' + user.user_name + '!')
      return user
    } catch (err) {
      toast.error('Kite login failed: ' + err.message)
      throw err
    }
  }, [])

  const enableDemo = () => {
    setIsDemo(true)
    setKiteUser(DEMO.profile)
    toast.success('Demo mode active — using simulated data')
  }

  const logout = async () => {
    kite.clearSession()
    setKiteUser(null)
    setIsDemo(false)
    await signOut()
    toast.success('Logged out')
  }

  const isAuthenticated = isDemo || !!kiteUser || !!supaUser

  const value = {
    supaUser,
    kiteUser,
    isDemo,
    authLoading,
    isAuthenticated,
    userId: supaUser?.id || null,
    loginEmail,
    signupEmail,
    loginKite,
    handleKiteCallback,
    enableDemo,
    logout,
  }

  return AuthContext.Provider({ value, children })
}

export const useAuth = () => useContext(AuthContext)