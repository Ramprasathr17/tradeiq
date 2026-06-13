import React, { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const fmt  = n => '₹'+(Math.abs(n||0)).toLocaleString('en-IN',{maximumFractionDigits:0})
const fmtK = n => n>=100000?'₹'+(n/100000).toFixed(1)+'L':fmt(n)

export default function Dashboard({ portfolio, auth }) {
  const { holdings, positions, stats, snapshots, loading, margins } = portfolio
  const lineRef  = useRef(null)
  const donutRef = useRef(null)
  const lineC    = useRef(null)
  const donutC   = useRef(null)

  useEffect(()=>{
    if(lineC.current) lineC.current.destroy()
    if(!lineRef.current) return
    const labels = snapshots.length
      ? snapshots.map(s=>new Date(s.recorded_at).toLocaleDateString('en-IN',{month:'short',day:'numeric'}))
      : ['Mon','Tue','Wed','Thu','Fri','Sat','Today']
    const data = snapshots.length
      ? snapshots.map(s=>s.total_value)
      : [800000,812000,808000,825000,818000,835000,stats.totalCurrent||842360]
    lineC.current = new Chart(lineRef.current,{
      type:'line',
      data:{ labels, datasets:[{
        data, borderColor:'#00d4aa',
        backgroundColor:'rgba(0,212,170,.06)',
        fill:true, tension:0.4, pointRadius:2,
        pointBackgroundColor:'#00d4aa', borderWidth:2
      }]},
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{display:false}},
        scales:{
          x:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#8b90a7',font:{size:10}}},
          y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#8b90a7',font:{size:10},callback:v=>'₹'+Math.round(v/1000)+'K'}}
        }
      }
    })
    return ()=>lineC.current?.destroy()
  },[snapshots, stats.totalCurrent])

  useEffect(()=>{
    if(donutC.current) donutC.current.destroy()
    if(!donutRef.current) return
    donutC.current = new Chart(donutRef.current,{
      type:'doughnut',
      data:{
        labels:['Equity','F&O','Cash'],
        datasets:[{data:[68,27,5],backgroundColor:['#00d4aa','#7c6dff','#4a4f6a'],borderWidth:0,hoverOffset:4}]
      },
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:'72%'}
    })
    return ()=>donutC.current?.destroy()
  },[])

  const pnlPct = stats.totalInvested>0?(stats.totalPnl/stats.totalInvested*100).toFixed(2):'0'

  return (
    <div className="fade-in">
      {auth.isDemo && (
        <div style={{
          background:'rgba(255,107,53,.06)', border:'1px solid rgba(255,107,53,.2)',
          borderRadius:'var(--radius-sm)', padding:'.6rem 1rem', marginBottom:'1.25rem',
          fontSize:13, color:'var(--accent3)', display:'flex', alignItems:'center', gap:8
        }}>
          <i className="ti ti-info-circle" style={{fontSize:15}}></i>
          Demo mode — connect your Kite account in Settings to see real data.
        </div>
      )}

      <div className="grid-4">
        <StatCard icon="ti-wallet"      color="var(--green)"  label="Portfolio Value"  value={fmtK(stats.totalCurrent||842360)} change={`${pnlPct}% total return`} up={stats.totalPnl>=0} />
        <StatCard icon="ti-chart-dots-3" color="var(--accent2)" label="Options P&L"     value={(stats.optionsPnl>=0?'+':'')+fmt(stats.optionsPnl||2350)} change="Across F&O positions" up={stats.optionsPnl>=0} />
        <StatCard icon="ti-coins"       color="var(--accent3)" label="Available Margin" value={fmtK(stats.marginAvail||38160)} change={`${margins?.equity ? ((stats.marginUsed/stats.marginNet)*100).toFixed(0) : 68}% utilised`} />
        <StatCard icon="ti-activity"    color="var(--red)"     label="Open Positions"   value={String(stats.openPositions||positions.length||7)} change={`${holdings.length} equity · ${positions.length} F&O`} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><i className="ti ti-chart-line"></i>Portfolio Performance</div>
            <span className="badge badge-green">30 days</span>
          </div>
          <div className="chart-wrap" style={{height:220}}>
            <canvas ref={lineRef} role="img" aria-label="Portfolio value over 30 days"></canvas>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><i className="ti ti-chart-donut"></i>Allocation</div>
            <span className="badge badge-green">Diversified</span>
          </div>
          <div className="chart-wrap" style={{height:170}}>
            <canvas ref={donutRef} role="img" aria-label="Portfolio allocation"></canvas>
          </div>
          <div style={{display:'flex',gap:'1rem',marginTop:'.85rem',flexWrap:'wrap'}}>
            {[['#00d4aa','Equity 68%'],['#7c6dff','F&O 27%'],['#4a4f6a','Cash 5%']].map(([c,l])=>(
              <span key={l} style={{fontSize:11,display:'flex',alignItems:'center',gap:4}}>
                <span style={{width:8,height:8,borderRadius:2,background:c,display:'inline-block'}}></span>{l}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><i className="ti ti-briefcase"></i>Top Holdings</div>
            <span style={{fontSize:12,color:'var(--accent)',cursor:'pointer'}}>{holdings.length} stocks</span>
          </div>
          {loading ? <div className="spinner"></div> : (
            <table className="data-table">
              <thead><tr><th>Stock</th><th>Qty</th><th>LTP</th><th>P&L</th><th>Chg%</th></tr></thead>
              <tbody>
                {holdings.slice(0,6).map(h=>(
                  <tr key={h.tradingsymbol}>
                    <td><div className="name-cell">{h.tradingsymbol}</div><div className="sub-cell">{h.exchange}</div></td>
                    <td>{h.quantity}</td>
                    <td>{fmt(h.last_price)}</td>
                    <td className={(h.pnl||0)>=0?'up':'down'}>{(h.pnl||0)>=0?'+':''}{fmt(h.pnl)}</td>
                    <td className={(h.day_change_percentage||0)>=0?'up':'down'}>
                      {((h.day_change_percentage||0)>=0?'+':'')}{(h.day_change_percentage||0).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><i className="ti ti-news"></i>Market Pulse</div>
            <span className="badge badge-live"><span className="dot-live" style={{width:5,height:5}}></span>Live</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'.6rem'}}>
            {PULSE.map((n,i)=>(
              <div key={i} style={{
                display:'flex',gap:10,padding:'.6rem .7rem',
                borderRadius:'var(--radius-sm)',border:'1px solid var(--border)',
                cursor:'pointer',transition:'background .15s'
              }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <div style={{
                  fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:1,
                  padding:'2px 6px',borderRadius:4,background:n.bg,color:n.color,
                  flexShrink:0,height:'fit-content',marginTop:2
                }}>{n.tag}</div>
                <div>
                  <div style={{fontSize:12,fontWeight:500,lineHeight:1.4,marginBottom:2}}>{n.title}</div>
                  <div style={{fontSize:10,color:'var(--text3)'}}>{n.time} · {n.src}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({icon,color,label,value,change,up}) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        <i className={`ti ${icon}`} style={{fontSize:13,color}}></i>{label}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-change" style={{color:up?'var(--green)':'var(--text2)'}}>
        {up!=null&&up&&<i className="ti ti-trending-up" style={{fontSize:11}}></i>}
        {change}
      </div>
    </div>
  )
}

const PULSE=[
  {tag:'BULL',bg:'rgba(0,212,170,.1)',color:'#00d4aa',title:'RBI holds repo rate; market up 0.8%',time:'2m',src:'Reuters'},
  {tag:'F&O',bg:'rgba(124,109,255,.1)',color:'#7c6dff',title:'NIFTY 24,600 CE OI surges 56L',time:'12m',src:'Moneycontrol'},
  {tag:'WARN',bg:'rgba(255,77,109,.1)',color:'#ff4d6d',title:'HDFC Bank FII net sell ₹1,240 Cr',time:'45m',src:'Bloomberg'},
  {tag:'RESULT',bg:'rgba(255,107,53,.1)',color:'#ff6b35',title:'Infosys Q1 beats by 2.1% — ₹38,994 Cr',time:'1h',src:'ET Markets'},
]
