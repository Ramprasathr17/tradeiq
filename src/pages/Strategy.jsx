// Strategy.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const STRATS=[
  {id:'iron_condor',icon:'🦋',name:'Iron Condor',bias:'Neutral',risk:'Low',desc:'Sell OTM CE+PE, buy further OTM. Profit in range.'},
  {id:'bull_call',icon:'🐂',name:'Bull Call Spread',bias:'Bullish',risk:'Low',desc:'Buy lower CE, sell higher CE. Capped profit.'},
  {id:'bear_put',icon:'🐻',name:'Bear Put Spread',bias:'Bearish',risk:'Low',desc:'Buy higher PE, sell lower PE. Profit on fall.'},
  {id:'short_straddle',icon:'⚡',name:'Short Straddle',bias:'Neutral',risk:'High',desc:'Sell ATM CE+PE. Profit when flat near expiry.'},
  {id:'covered_call',icon:'📈',name:'Covered Call',bias:'Bullish',risk:'Low',desc:'Hold equity, sell OTM CE. Monthly income.'},
  {id:'calendar',icon:'🗓',name:'Calendar Spread',bias:'Neutral',risk:'Low',desc:'Sell near-term, buy far-term. Profit from theta.'},
]
const BIAS_C={Bullish:'badge-green',Bearish:'badge-red',Neutral:'badge-purple'}
const RISK_C={Low:'badge-green',High:'badge-red'}

function payoff(id,spot){
  const s=24615
  if(id==='iron_condor'){const c=172;if(spot<=24000)return c-200;if(spot<=24200)return c-(24200-spot);if(spot<=24800)return c;if(spot<=25000)return c-(spot-24800);return c-200}
  if(id==='bull_call'){if(spot<=24600)return -73;if(spot<=24800)return spot-24600-73;return 127}
  if(id==='bear_put'){if(spot>=24600)return -70;if(spot>=24400)return 24600-spot-70;return 130}
  return Math.sin((spot-s)/s*10)*150
}

export function Strategy() {
  const [sel,setSel]=useState('iron_condor')
  const chartRef=useRef(null); const chartInst=useRef(null)
  const spot=24615
  const strikes=Array.from({length:81},(_,i)=>spot*0.9+i*spot*0.0025)
  const payoffs=strikes.map(s=>payoff(sel,s)*75)
  const maxP=Math.max(...payoffs), maxL=Math.min(...payoffs)

  useEffect(()=>{
    if(chartInst.current)chartInst.current.destroy()
    if(!chartRef.current)return
    chartInst.current=new Chart(chartRef.current,{
      type:'line',
      data:{labels:strikes.map(s=>s.toFixed(0)),datasets:[
        {label:'P&L',data:payoffs,borderColor:'#7c6dff',
          backgroundColor:(ctx)=>{const g=ctx.chart.ctx.createLinearGradient(0,0,0,300);g.addColorStop(0,'rgba(0,212,170,.1)');g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(255,77,109,.1)');return g},
          fill:true,tension:0.3,pointRadius:0,borderWidth:2},
        {data:strikes.map(()=>0),borderColor:'rgba(139,144,167,.3)',borderDash:[4,4],pointRadius:0,borderWidth:1}
      ]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
        scales:{
          x:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#8b90a7',font:{size:9},maxTicksLimit:8}},
          y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#8b90a7',font:{size:10},callback:v=>'₹'+Math.round(v).toLocaleString('en-IN')}}
        }}
    })
    return ()=>chartInst.current?.destroy()
  },[sel])

  const strat=STRATS.find(s=>s.id===sel)

  return (
    <div className="fade-in">
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:'.65rem',marginBottom:'1.75rem'}}>
        {STRATS.map(s=>(
          <div key={s.id} onClick={()=>setSel(s.id)} style={{
            background:'var(--surface)',border:`1px solid ${sel===s.id?'var(--accent)':'var(--border)'}`,
            borderRadius:'var(--radius)',padding:'.9rem',cursor:'pointer',transition:'all .2s',
            transform:sel===s.id?'translateY(-2px)':'none'
          }}>
            <div style={{fontSize:22,marginBottom:'.4rem'}}>{s.icon}</div>
            <div style={{fontSize:12,fontWeight:600,marginBottom:'.25rem'}}>{s.name}</div>
            <div style={{fontSize:11,color:'var(--text2)',lineHeight:1.4,marginBottom:'.5rem'}}>{s.desc}</div>
            <div style={{display:'flex',gap:'.3rem',flexWrap:'wrap'}}>
              <span className={`badge ${BIAS_C[s.bias]}`} style={{fontSize:9}}>{s.bias}</span>
              <span className={`badge ${RISK_C[s.risk]}`} style={{fontSize:9}}>{s.risk} Risk</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-equal-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><i className="ti ti-chart-area"></i>Payoff — {strat?.name}</div>
            <span className="badge badge-purple">At Expiry · 1 Lot</span>
          </div>
          <div className="chart-wrap" style={{height:250}}>
            <canvas ref={chartRef} role="img" aria-label={`${strat?.name} payoff diagram`}></canvas>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'.75rem',marginTop:'1.25rem'}}>
            <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--text2)',marginBottom:3}}>Max Profit</div><div style={{fontSize:17,fontWeight:700,fontFamily:'var(--mono)',color:'var(--green)'}}>+₹{Math.round(maxP).toLocaleString('en-IN')}</div></div>
            <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--text2)',marginBottom:3}}>Max Loss</div><div style={{fontSize:17,fontWeight:700,fontFamily:'var(--mono)',color:'var(--red)'}}>₹{Math.round(maxL).toLocaleString('en-IN')}</div></div>
            <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--text2)',marginBottom:3}}>Spot</div><div style={{fontSize:17,fontWeight:700,fontFamily:'var(--mono)'}}>24,615</div></div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><i className="ti ti-adjustments"></i>Greeks (Net Exposure)</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem',marginBottom:'1.25rem'}}>
            {[['Δ Delta','+0.04','Near delta-neutral'],['Γ Gamma','-0.002','Short gamma'],['Θ Theta','+₹380/day','Time works for you'],['V Vega','-₹120','Short volatility']].map(([g,v,d])=>(
              <div key={g} style={{background:'var(--surface2)',borderRadius:'var(--radius-sm)',padding:'.85rem 1rem'}}>
                <div style={{fontSize:11,color:'var(--text3)',marginBottom:.25}}>{g}</div>
                <div style={{fontSize:16,fontWeight:700,fontFamily:'var(--mono)'}}>{v}</div>
                <div style={{fontSize:10,color:'var(--text3)',marginTop:2}}>{d}</div>
              </div>
            ))}
          </div>
          {sel==='iron_condor'&&(
            <div style={{background:'var(--surface2)',borderRadius:'var(--radius-sm)',padding:'1rem'}}>
              <div style={{fontSize:11,color:'var(--text2)',marginBottom:'.75rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'1px'}}>Legs</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.5rem'}}>
                {[['SELL PUT','24,200 PE','₹42','var(--red)'],['BUY PUT','24,000 PE','₹28','var(--green)'],['BUY CALL','25,000 CE','₹84','var(--green)'],['SELL CALL','24,800 CE','₹142','var(--red)']].map(([a,s,p,c])=>(
                  <div key={s} style={{background:'var(--surface)',borderRadius:'var(--radius-sm)',padding:'.6rem .75rem',border:`1px solid ${c}30`}}>
                    <div style={{fontSize:10,color:c,fontWeight:700,marginBottom:2}}>{a}</div>
                    <div style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:700}}>{s}</div>
                    <div style={{fontSize:11,color:'var(--text2)'}}>{p}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:'.75rem',padding:'.6rem .8rem',background:'rgba(0,212,170,.06)',border:'1px solid rgba(0,212,170,.2)',borderRadius:'var(--radius-sm)',color:'var(--green)',fontWeight:600,fontSize:13}}>
                Net Credit: ₹172 × 75 = ₹12,900
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Strategy
