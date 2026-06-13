import React, { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
Chart.register(...registerables)

const DEFAULTS = [
  {tradingsymbol:'RELIANCE',exchange:'NSE',last_price:2920,change_pct:0.83},
  {tradingsymbol:'TCS',     exchange:'NSE',last_price:4085,change_pct:1.54},
  {tradingsymbol:'HDFCBANK',exchange:'NSE',last_price:1590,change_pct:-1.12},
  {tradingsymbol:'WIPRO',   exchange:'NSE',last_price:615, change_pct:1.32},
  {tradingsymbol:'ITC',     exchange:'NSE',last_price:478, change_pct:0.64},
  {tradingsymbol:'INFY',    exchange:'NSE',last_price:1810,change_pct:2.09},
]

function genIntraday(base) {
  const pts=[]; let p=base*0.992
  for(let i=0;i<75;i++){
    const tm=9*60+15+i*6
    p+=(Math.random()-.48)*base*.002
    pts.push({t:`${Math.floor(tm/60)}:${String(tm%60).padStart(2,'0')}`,v:+p.toFixed(2)})
  }
  return pts
}

export default function Watchlist({ auth }) {
  const { userId, isDemo } = auth
  const [list,    setList]    = useState(DEFAULTS)
  const [selected,setSelected]= useState('RELIANCE')
  const [newSym,  setNewSym]  = useState('')
  const [loading, setLoading] = useState(false)
  const chartRef  = useRef(null)
  const chartInst = useRef(null)

  // Load from Supabase
  useEffect(()=>{
    if(!userId||isDemo) return
    getWatchlist(userId).then(data=>{
      if(data.length) setList(data.map(w=>({...w,last_price:0,change_pct:0})))
    }).catch(()=>{})
  },[userId,isDemo])

  // Chart
  useEffect(()=>{
    if(chartInst.current) chartInst.current.destroy()
    if(!chartRef.current) return
    const sel=list.find(w=>w.tradingsymbol===selected)||list[0]
    const pts=genIntraday(sel?.last_price||2920)
    const isUp=pts[pts.length-1].v>=pts[0].v
    chartInst.current=new Chart(chartRef.current,{
      type:'line',
      data:{labels:pts.map(p=>p.t),datasets:[{
        data:pts.map(p=>p.v),
        borderColor:isUp?'#00d4aa':'#ff4d6d',
        backgroundColor:isUp?'rgba(0,212,170,.05)':'rgba(255,77,109,.05)',
        fill:true,tension:0.3,pointRadius:0,borderWidth:2
      }]},
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false}},
        scales:{
          x:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#8b90a7',font:{size:9},maxTicksLimit:6}},
          y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#8b90a7',font:{size:10},callback:v=>'₹'+v}}
        }
      }
    })
    return ()=>chartInst.current?.destroy()
  },[selected,list])

  const handleAdd = async () => {
    const sym=newSym.trim().toUpperCase()
    if(!sym){toast.error('Enter a symbol');return}
    if(list.find(w=>w.tradingsymbol===sym)){toast.error('Already in watchlist');return}
    setLoading(true)
    try{
      if(userId&&!isDemo) await addToWatchlist(userId,sym,'NSE')
      setList(prev=>[...prev,{tradingsymbol:sym,exchange:'NSE',last_price:0,change_pct:0}])
      setNewSym('')
      toast.success(`${sym} added`)
    }catch(e){toast.error(e.message)}finally{setLoading(false)}
  }

  const handleRemove = async (sym) => {
    try{
      if(userId&&!isDemo) await removeFromWatchlist(userId,sym)
      setList(prev=>prev.filter(w=>w.tradingsymbol!==sym))
      if(selected===sym) setSelected(list[0]?.tradingsymbol||'')
      toast.success(`${sym} removed`)
    }catch(e){toast.error(e.message)}
  }

  const sel=list.find(w=>w.tradingsymbol===selected)||list[0]

  return (
    <div className="fade-in">
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><i className="ti ti-star"></i>Watchlist</div>
            <span className="badge badge-purple">{list.length} symbols</span>
          </div>

          <div className="input-row">
            <input className="input flex-1" placeholder="Add symbol (e.g. TATASTEEL)"
              value={newSym} onChange={e=>setNewSym(e.target.value.toUpperCase())}
              onKeyDown={e=>e.key==='Enter'&&handleAdd()} />
            <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={loading}>
              {loading?<span className="spinner-sm"></span>:'+ Add'}
            </button>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'.3rem'}}>
            {list.map(w=>(
              <div key={w.tradingsymbol} onClick={()=>setSelected(w.tradingsymbol)} style={{
                display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'.55rem .75rem',borderRadius:'var(--radius-sm)',cursor:'pointer',
                background:selected===w.tradingsymbol?'var(--surface2)':'transparent',
                border:`1px solid ${selected===w.tradingsymbol?'var(--border2)':'transparent'}`,
                transition:'all .15s'
              }}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{
                    width:30,height:30,borderRadius:8,fontSize:11,fontWeight:700,
                    background:`rgba(${w.change_pct>=0?'0,212,170':'255,77,109'},.1)`,
                    color:w.change_pct>=0?'var(--green)':'var(--red)',
                    display:'flex',alignItems:'center',justifyContent:'center'
                  }}>{w.tradingsymbol.slice(0,2)}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600}}>{w.tradingsymbol}</div>
                    <div style={{fontSize:10,color:'var(--text3)'}}>{w.exchange}</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:12,fontWeight:600,fontFamily:'var(--mono)'}}>
                      {w.last_price>0?'₹'+w.last_price.toLocaleString('en-IN'):'—'}
                    </div>
                    <div style={{fontSize:10,fontFamily:'var(--mono)',color:w.change_pct>=0?'var(--green)':'var(--red)'}}>
                      {w.change_pct>=0?'+':''}{w.change_pct.toFixed(2)}%
                    </div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();handleRemove(w.tradingsymbol)}}
                    style={{color:'var(--text3)',fontSize:14}} title="Remove">
                    <i className="ti ti-x"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><i className="ti ti-chart-line"></i>{selected} Intraday</div>
              <span className={`badge ${(sel?.change_pct||0)>=0?'badge-green':'badge-red'}`}>
                {(sel?.change_pct||0)>=0?'+':''}{(sel?.change_pct||0).toFixed(2)}%
              </span>
            </div>
            <div className="chart-wrap" style={{height:200}}>
              <canvas ref={chartRef} role="img" aria-label={`${selected} intraday chart`}></canvas>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><i className="ti ti-info-circle"></i>Snapshot</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.6rem'}}>
              {[
                ['LTP',sel?.last_price>0?'₹'+sel.last_price.toLocaleString('en-IN'):'—'],
                ['Day Change',`${(sel?.change_pct||0)>=0?'+':''}${(sel?.change_pct||0).toFixed(2)}%`],
                ['52W High',sel?.last_price?'₹'+(sel.last_price*1.32).toFixed(0):'—'],
                ['52W Low', sel?.last_price?'₹'+(sel.last_price*0.72).toFixed(0):'—'],
                ['Volume','28.4L'],
                ['Market Cap','₹19.8T'],
              ].map(([k,v])=>(
                <div key={k} style={{background:'var(--surface2)',borderRadius:'var(--radius-sm)',padding:'.6rem .8rem'}}>
                  <div style={{fontSize:10,color:'var(--text3)',marginBottom:2}}>{k}</div>
                  <div style={{fontSize:13,fontWeight:600,fontFamily:'var(--mono)'}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
