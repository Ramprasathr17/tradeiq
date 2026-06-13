// ── Portfolio.jsx ─────────────────────────────────────────────────────────
import React, { useState } from 'react'

const fmt = n => '₹'+Math.abs(n||0).toLocaleString('en-IN',{maximumFractionDigits:0})

export function Portfolio({ portfolio }) {
  const { holdings, positions, stats, loading } = portfolio
  const [tab, setTab] = useState('holdings')

  const totalInvested = holdings.reduce((s,h)=>s+h.average_price*Math.abs(h.quantity||0),0)
  const totalCurrent  = holdings.reduce((s,h)=>s+h.last_price*Math.abs(h.quantity||0),0)
  const totalPnl      = totalCurrent - totalInvested
  const pnlPct        = totalInvested>0?(totalPnl/totalInvested*100).toFixed(2):'0'

  return (
    <div className="fade-in">
      <div className="grid-4">
        {[
          ['Invested',fmt(totalInvested),'var(--text2)','Across '+holdings.length+' stocks'],
          ['Current Value',fmt(totalCurrent),'var(--text)','Live prices'],
          ['Unrealised P&L',(totalPnl>=0?'+':'')+fmt(totalPnl),totalPnl>=0?'var(--green)':'var(--red)',pnlPct+'% return'],
          ['F&O Positions',String(positions.filter(p=>p.quantity!==0).length),'var(--accent2)',stats.optionsPnl>=0?'+'+fmt(stats.optionsPnl)+' P&L':fmt(stats.optionsPnl)+' P&L'],
        ].map(([lbl,val,col,ch])=>(
          <div key={lbl} className="stat-card">
            <div className="stat-label">{lbl}</div>
            <div className="stat-value" style={{color:col}}>{val}</div>
            <div className="stat-change">{ch}</div>
          </div>
        ))}
      </div>

      <div className="tab-bar">
        <button className={`tab ${tab==='holdings'?'active':''}`} onClick={()=>setTab('holdings')}>Holdings ({holdings.length})</button>
        <button className={`tab ${tab==='positions'?'active':''}`} onClick={()=>setTab('positions')}>F&O Positions ({positions.length})</button>
      </div>

      <div className="card">
        {loading ? <div className="spinner"></div> : tab==='holdings' ? (
          <table className="data-table">
            <thead><tr><th>Stock</th><th>Qty</th><th>Avg</th><th>LTP</th><th>Invested</th><th>Value</th><th>P&L</th><th>Day%</th></tr></thead>
            <tbody>
              {holdings.map(h=>{
                const inv=h.average_price*Math.abs(h.quantity||0)
                const cur=h.last_price*Math.abs(h.quantity||0)
                const pnl=h.pnl??(cur-inv)
                return (
                  <tr key={h.tradingsymbol}>
                    <td><div className="name-cell">{h.tradingsymbol}</div><div className="sub-cell">{h.exchange}</div></td>
                    <td>{h.quantity}</td>
                    <td>{fmt(h.average_price)}</td>
                    <td>{fmt(h.last_price)}</td>
                    <td>{fmt(inv)}</td>
                    <td>{fmt(cur)}</td>
                    <td className={pnl>=0?'up':'down'}>{pnl>=0?'+':''}{fmt(pnl)}</td>
                    <td className={(h.day_change_percentage||0)>=0?'up':'down'}>{((h.day_change_percentage||0)>=0?'+':'')}{(h.day_change_percentage||0).toFixed(2)}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead><tr><th>Symbol</th><th>Type</th><th>Product</th><th>Qty</th><th>Avg</th><th>LTP</th><th>P&L</th></tr></thead>
            <tbody>
              {positions.filter(p=>p.quantity!==0).map((p,i)=>(
                <tr key={i}>
                  <td><div className="name-cell">{p.tradingsymbol}</div><div className="sub-cell">{p.exchange}</div></td>
                  <td><span className={`badge ${p.instrument_type==='CE'?'badge-green':'badge-red'}`}>{p.instrument_type||'EQ'}</span></td>
                  <td><span className="badge badge-gray">{p.product}</span></td>
                  <td style={{color:p.quantity>0?'var(--green)':'var(--red)'}}>{p.quantity}</td>
                  <td>{fmt(p.average_price)}</td>
                  <td>{fmt(p.last_price)}</td>
                  <td className={(p.pnl||0)>=0?'up':'down'}>{(p.pnl||0)>=0?'+':''}{fmt(p.pnl)}</td>
                </tr>
              ))}
              {positions.filter(p=>p.quantity!==0).length===0&&(
                <tr><td colSpan={7}><div className="empty"><i className="ti ti-chart-dots-3"></i><p>No open F&O positions</p></div></td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Portfolio
