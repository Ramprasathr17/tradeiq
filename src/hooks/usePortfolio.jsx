import { useState, useEffect, useCallback, useRef } from 'react'
import { kite, DEMO } from '../lib/kite'
import { getHoldings, getPositions, getSnapshots, upsertHoldings, upsertPositions } from '../lib/supabase'
import { useAuth } from './useAuth.jsx'
import toast from 'react-hot-toast'

export function usePortfolio() {
  const { isDemo, userId, isAuthenticated } = useAuth()
  const [holdings,  setHoldings]  = useState([])
  const [positions, setPositions] = useState([])
  const [margins,   setMargins]   = useState(null)
  const [snapshots, setSnapshots] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [lastSync,  setLastSync]  = useState(null)
  const pollRef = useRef(null)

  const stats = {
    totalInvested: holdings.reduce((s,h) => s + h.average_price * Math.abs(h.quantity||0), 0),
    totalCurrent:  holdings.reduce((s,h) => s + h.last_price   * Math.abs(h.quantity||0), 0),
    totalPnl:      holdings.reduce((s,h) => s + (h.pnl||0), 0),
    optionsPnl:    positions.reduce((s,p) => s + (p.pnl||0), 0),
    openPositions: positions.filter(p => p.quantity !== 0).length,
    marginUsed:    margins?.equity?.used || 0,
    marginAvail:   margins?.equity?.available || 0,
    marginNet:     margins?.equity?.net || 0,
  }

  const fetchLive = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      if (isDemo) {
        setHoldings(DEMO.holdings)
        setPositions(DEMO.positions)
        setMargins(DEMO.margins)
        setSnapshots(DEMO.snapshots)
        setLastSync(new Date())
        return
      }

      if (!kite.isAuthenticated()) return

      const [h, pos, mar] = await Promise.all([
        kite.holdings(),
        kite.positions(),
        kite.margins(),
      ])

      const allPos = [...(pos?.net || []), ...(pos?.day || [])]
      setHoldings(h || [])
      setPositions(allPos)
      setMargins(mar)
      setLastSync(new Date())

      if (userId) {
        await Promise.all([
          upsertHoldings(userId, h || []),
          upsertPositions(userId, allPos),
        ])
        const snaps = await getSnapshots(userId, 30)
        setSnapshots(snaps)
      }
    } catch (err) {
      if (userId) {
        try {
          const [h, pos, snaps] = await Promise.all([
            getHoldings(userId),
            getPositions(userId),
            getSnapshots(userId, 30),
          ])
          setHoldings(h)
          setPositions(pos)
          setSnapshots(snaps)
          toast.error('Live fetch failed — showing cached data')
        } catch (_) {
          toast.error('Could not load portfolio')
        }
      } else {
        toast.error('Failed: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, isDemo, userId])

  const loadCached = useCallback(async () => {
    if (!userId || isDemo) return
    try {
      const [h, pos, snaps] = await Promise.all([
        getHoldings(userId),
        getPositions(userId),
        getSnapshots(userId, 30),
      ])
      if (h.length) setHoldings(h)
      if (pos.length) setPositions(pos)
      if (snaps.length) setSnapshots(snaps)
    } catch (_) {}
  }, [userId, isDemo])

  useEffect(() => {
    loadCached().then(fetchLive)

    const isMarketHours = () => {
      const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
      const mins = ist.getHours() * 60 + ist.getMinutes()
      return mins >= 555 && mins <= 930 && ist.getDay() > 0 && ist.getDay() < 6
    }

    if (isMarketHours() && !isDemo) {
      pollRef.current = setInterval(() => {
        if (isMarketHours()) fetchLive()
      }, 60000)
    }
    return () => clearInterval(pollRef.current)
  }, [fetchLive, loadCached])

  return { holdings, positions, margins, snapshots, stats, loading, lastSync, refresh: fetchLive }
}