// TickerTape.jsx
import React from 'react'

export default function TickerTape({ holdings = [] }) {
  const base = [
    {sym:'NIFTY',price:'24,615',chg:'+0.84%',up:true},
    {sym:'SENSEX',price:'81,203',chg:'-0.12%',up:false},
    {sym:'BANKNIFTY',price:'52,840',chg:'+1.2%',up:true},
    {sym:'VIX',price:'12.45',chg:'-0.8%',up:false},
    {sym:'USDINR',price:'83.62',chg:'+0.04%',up:true},
  ]
  const fromHoldings = holdings.slice(0,8).map(h=>({
    sym: h.tradingsymbol,
    price: '₹'+(h.last_price||0).toLocaleString('en-IN'),
    chg: ((h.day_change_percentage||0)>=0?'+':'')+(h.day_change_percentage||0).toFixed(2)+'%',
    up: (h.day_change_percentage||0)>=0,
  }))
  const items = [...base,...fromHoldings]

  return (
    <div style={{
      background:'var(--surface)', borderBottom:'1px solid var(--border)',
      padding:'.32rem 0', overflow:'hidden', flexShrink:0
    }}>
      <div style={{ display:'flex', animation:'ticker 38s linear infinite', width:'max-content' }}>
        {[...items,...items].map((x,i)=>(
          <div key={i} style={{
            display:'flex', alignItems:'center', gap:6, padding:'0 1.25rem',
            fontSize:11, fontFamily:'var(--mono)', whiteSpace:'nowrap', flexShrink:0
          }}>
            <span style={{ fontWeight:600, color:'var(--text)' }}>{x.sym}</span>
            <span style={{ color:'var(--text2)' }}>{x.price}</span>
            <span style={{ color:x.up?'var(--green)':'var(--red)' }}>{x.chg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
