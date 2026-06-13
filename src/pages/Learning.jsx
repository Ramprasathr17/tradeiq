// Learning.jsx
import React, { useState } from 'react'

const COURSES={
  Beginner:[
    {icon:'📊',title:'Options 101: Calls & Puts',duration:'25 min',lessons:8,progress:100,tags:['Basics','Essential']},
    {icon:'🎯',title:'Understanding Greeks: Δ Θ Γ V',duration:'40 min',lessons:12,progress:65,tags:['Greeks','Must Know']},
    {icon:'📋',title:'Reading an Options Chain',duration:'20 min',lessons:6,progress:30,tags:['Practical']},
    {icon:'💡',title:'Intrinsic vs Extrinsic Value',duration:'18 min',lessons:5,progress:0,tags:['Basics']},
    {icon:'⚖️',title:'Risk Management Fundamentals',duration:'30 min',lessons:9,progress:0,tags:['Risk','Essential']},
    {icon:'📅',title:'Expiry Cycles & F&O Basics',duration:'22 min',lessons:7,progress:0,tags:['NSE','Basics']},
  ],
  Intermediate:[
    {icon:'🦋',title:'Iron Condor — Complete Guide',duration:'35 min',lessons:10,progress:20,tags:['Strategy','Neutral']},
    {icon:'🐂',title:'Bull & Bear Spreads',duration:'30 min',lessons:9,progress:0,tags:['Directional']},
    {icon:'⚡',title:'IV Rank & Percentile Trading',duration:'45 min',lessons:11,progress:0,tags:['Volatility']},
    {icon:'📈',title:'Technical Analysis: S&R, Trends',duration:'50 min',lessons:15,progress:0,tags:['Charts']},
    {icon:'🌀',title:'Calendar & Diagonal Spreads',duration:'38 min',lessons:11,progress:0,tags:['Theta']},
    {icon:'🧮',title:'Position Sizing & Kelly Criterion',duration:'28 min',lessons:8,progress:0,tags:['Risk','Math']},
  ],
  Advanced:[
    {icon:'🧠',title:'Delta Hedging & Gamma Scalping',duration:'55 min',lessons:14,progress:0,tags:['Hedging']},
    {icon:'💹',title:'Backtesting Options Strategies',duration:'60 min',lessons:16,progress:0,tags:['Quant']},
    {icon:'📡',title:'Algo Trading with Kite Connect',duration:'90 min',lessons:20,progress:0,tags:['API','Code']},
  ],
}
const GLOSSARY=[
  {term:'ATM',def:'At The Money — strike equals current spot price.'},
  {term:'OTM',def:'Out of The Money — no intrinsic value; CE above spot, PE below spot.'},
  {term:'ITM',def:'In The Money — has intrinsic value; CE below spot, PE above spot.'},
  {term:'IV', def:'Implied Volatility — market's expectation of future movement, priced into premiums.'},
  {term:'Theta',def:'Time decay — rate at which an option loses value as expiry approaches.'},
  {term:'Delta',def:'Rate of change of option price per ₹1 move in underlying. Range: 0 to ±1.'},
  {term:'PCR',def:'Put-Call Ratio — high PCR (>1.2) is bullish; low PCR (<0.7) is bearish.'},
  {term:'OI', def:'Open Interest — total outstanding option contracts in the market.'},
  {term:'Max Pain',def:'Strike where most options expire worthless — acts as expiry magnet.'},
  {term:'Gamma',def:'Rate of change of Delta per ₹1 move. High near ATM, especially near expiry.'},
]

export function Learning() {
  const [tab,setTab]=useState('Beginner')
  const [section,setSection]=useState('courses')
  const courses=COURSES[tab]||[]
  const done=courses.filter(c=>c.progress===100).length

  return (
    <div className="fade-in">
      <div style={{display:'flex',gap:'1rem',marginBottom:'1.5rem',alignItems:'center',flexWrap:'wrap'}}>
        <div className="tab-bar" style={{marginBottom:0}}>
          <button className={`tab ${section==='courses'?'active':''}`} onClick={()=>setSection('courses')}>📚 Courses</button>
          <button className={`tab ${section==='glossary'?'active':''}`} onClick={()=>setSection('glossary')}>📖 Glossary</button>
        </div>
        {section==='courses'&&(
          <div className="tab-bar" style={{marginBottom:0}}>
            {Object.keys(COURSES).map(l=><button key={l} className={`tab ${tab===l?'active':''}`} onClick={()=>setTab(l)}>{l}</button>)}
          </div>
        )}
        {section==='courses'&&done>0&&<span className="badge badge-green" style={{marginLeft:'auto'}}>{done} completed</span>}
      </div>

      {section==='courses'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
          {courses.map((c,i)=>(
            <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',overflow:'hidden',cursor:'pointer',transition:'all .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent2)';e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='none'}}>
              <div style={{height:80,display:'flex',alignItems:'center',justifyContent:'center',fontSize:34,background:'var(--surface2)'}}>{c.icon}</div>
              <div style={{padding:'1rem 1.2rem'}}>
                <div style={{fontSize:13,fontWeight:600,lineHeight:1.35,marginBottom:'.35rem'}}>{c.title}</div>
                <div style={{fontSize:11,color:'var(--text3)',display:'flex',gap:'.6rem',marginBottom:'.6rem'}}>
                  <span><i className="ti ti-clock" style={{fontSize:11}}></i> {c.duration}</span>
                  <span><i className="ti ti-book" style={{fontSize:11}}></i> {c.lessons} lessons</span>
                </div>
                <div style={{display:'flex',gap:'.3rem',flexWrap:'wrap',marginBottom:'.6rem'}}>
                  {c.tags.map(t=><span key={t} style={{fontSize:10,padding:'2px 5px',borderRadius:3,background:'var(--surface3)',color:'var(--text2)'}}>{t}</span>)}
                </div>
                <div style={{height:3,background:'var(--surface3)',borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',width:c.progress+'%',borderRadius:2,background:c.progress===100?'var(--green)':'linear-gradient(90deg,var(--accent2),var(--accent))',transition:'width .3s'}}></div>
                </div>
                <div style={{fontSize:10,marginTop:'.35rem',color:c.progress===100?'var(--green)':c.progress>0?'var(--accent3)':'var(--text3)'}}>
                  {c.progress===100?'✓ Completed':c.progress>0?c.progress+'% complete':'Not started'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {section==='glossary'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
          {GLOSSARY.map(g=>(
            <div key={g.term} className="card" style={{padding:'1rem 1.2rem'}}>
              <div style={{fontWeight:700,fontSize:15,color:'var(--accent)',fontFamily:'var(--mono)',marginBottom:'.35rem'}}>{g.term}</div>
              <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.6}}>{g.def}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Learning
