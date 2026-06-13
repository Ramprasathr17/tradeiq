import React, { useState, useEffect } from 'react'
import { getAlerts, createAlert, deleteAlert } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const NEWS=[
  {tag:'MACRO',bg:'rgba(0,212,170,.1)',col:'#00d4aa',title:'RBI holds repo rate at 6.5%; accommodative stance maintained',time:'2m',src:'RBI.org',impact:'Positive'},
  {tag:'F&O',bg:'rgba(124,109,255,.1)',col:'#7c6dff',title:'NIFTY 24,600 CE sees 56L OI surge — strong resistance',time:'8m',src:'Moneycontrol',impact:'Neutral'},
  {tag:'RESULT',bg:'rgba(255,107,53,.1)',col:'#ff6b35',title:'Infosys Q1FY25: ₹38,994 Cr revenue — beats by 2.1%',time:'22m',src:'ET Markets',impact:'Positive'},
  {tag:'ALERT',bg:'rgba(255,77,109,.1)',col:'#ff4d6d',title:'HDFC Bank under pressure — FII net sell ₹1,240 Cr',time:'45m',src:'Bloomberg',impact:'Negative'},
  {tag:'SECTOR',bg:'rgba(0,212,170,.1)',col:'#00d4aa',title:'Auto sector rallies 2.4%; domestic sales beat Q2 forecast',time:'1h',src:'SIAM',impact:'Positive'},
  {tag:'GLOBAL',bg:'rgba(124,109,255,.1)',col:'#7c6dff',title:'US Fed signals no rate cut in Q3 — DXY strengthens',time:'2h',src:'Reuters',impact:'Negative'},
  {tag:'F&O',bg:'rgba(124,109,255,.1)',col:'#7c6dff',title:'BANKNIFTY 53,000 CE: 12L OI addition — resistance confirmed',time:'3h',src:'NSE India',impact:'Neutral'},
]
const EVENTS=[
  {date:'18 Jun',event:'TATAMOTORS Q1 Results',type:'Earnings',impact:'High'},
  {date:'19 Jun',event:'NIFTY Monthly Expiry',type:'F&O',impact:'High'},
  {date:'21 Jun',event:'India CPI Data',type:'Macro',impact:'Medium'},
  {date:'25 Jun',event:'US FOMC Minutes',type:'Global',impact:'Medium'},
  {date:'28 Jun',event:'WIPRO Q1 Results',type:'Earnings',impact:'Low'},
]

export default function News({ auth }) {
  const { userId, isDemo } = auth || {}
  const [filter,setFilter]=useState('ALL')
  const [alerts,setAlerts]=useState([
    {id:'1',symbol:'RELIANCE',condition:'>',value:3000,alert_type:'Price',status:'active'},
    {id:'2',symbol:'HDFCBANK',condition:'<',value:1550,alert_type:'Price',status:'active'},
    {id:'3',symbol:'NIFTY',condition:'>',value:15,alert_type:'IV%',status:'active'},
  ])
  const [form,setForm]=useState({symbol:'',condition:'>',value:''})
  const [saving,setSaving]=useState(false)

  useEffect(()=>{
    if(!userId||isDemo)return
    getAlerts(userId).then(setAlerts).catch(()=>{})
  },[userId,isDemo])

  const addAlert=async()=>{
    if(!form.symbol||!form.value){toast.error('Fill in symbol and value');return}
    setSaving(true)
    try{
      const entry={symbol:form.symbol.toUpperCase(),condition:form.condition,value:parseFloat(form.value),alert_type:'Price',status:'active'}
      if(userId&&!isDemo){
        const saved=await createAlert(userId,entry)
        setAlerts(prev=>[saved,...prev])
      }else{
        setAlerts(prev=>[{...entry,id:Date.now().toString()},...prev])
      }
      setForm({symbol:'',condition:'>',value:''})
      toast.success(`Alert set for ${entry.symbol}`)
    }catch(e){toast.error(e.message)}finally{setSaving(false)}
  }

  const removeAlert=async(id)=>{
    try{
      if(userId&&!isDemo)await deleteAlert(id)
      setAlerts(prev=>prev.filter(a=>a.id!==id))
      toast.success('Alert removed')
    }catch(e){toast.error(e.message)}
  }

  const tags=['ALL','MACRO','F&O','RESULT','ALERT','SECTOR','GLOBAL']
  const filtered=filter==='ALL'?NEWS:NEWS.filter(n=>n.tag===filter)
  const impC={High:'var(--red)',Medium:'var(--accent3)',Low:'var(--green)'}

  return (
    <div className="fade-in">
      <div className="grid-3" style={{marginBottom:'1.5rem'}}>
        <div className="stat-card"><div className="stat-label"><i className="ti ti-trending-up" style={{fontSize:13,color:'var(--green)'}}></i>Bullish Signals</div><div className="stat-value" style={{color:'var(--green)'}}>14</div><div className="stat-change up">↑ from 9 yesterday</div></div>
        <div className="stat-card"><div className="stat-label"><i className="ti ti-alert-triangle" style={{fontSize:13,color:'var(--red)'}}></i>Risk Alerts</div><div className="stat-value" style={{color:'var(--red)'}}>3</div><div className="stat-change down">F&O expiry pressure</div></div>
        <div className="stat-card"><div className="stat-label"><i className="ti ti-flame" style={{fontSize:13,color:'var(--accent3)'}}></i>Most Active</div><div className="stat-value" style={{fontSize:18}}>TATASTEEL</div><div className="stat-change up">+5.8% volume spike</div></div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card" style={{marginBottom:'1rem'}}>
            <div className="card-header">
              <div className="card-title"><i className="ti ti-flame"></i>Market News</div>
              <span className="badge badge-live"><span className="dot-live" style={{width:5,height:5}}></span>Live</span>
            </div>
            <div style={{display:'flex',gap:'.35rem',marginBottom:'.85rem',flexWrap:'wrap'}}>
              {tags.map(t=>(
                <button key={t} onClick={()=>setFilter(t)} style={{
                  padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:600,cursor:'pointer',
                  background:filter===t?'var(--accent2)':'var(--surface2)',
                  color:filter===t?'#fff':'var(--text2)',
                  border:`1px solid ${filter===t?'var(--accent2)':'var(--border)'}`
                }}>{t}</button>
              ))}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
              {filtered.map((n,i)=>(
                <div key={i} style={{display:'flex',gap:8,padding:'.6rem .7rem',borderRadius:'var(--radius-sm)',border:'1px solid var(--border)',cursor:'pointer',transition:'background .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:1,padding:'2px 5px',borderRadius:3,background:n.bg,color:n.col,flexShrink:0,height:'fit-content',marginTop:2}}>{n.tag}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:500,lineHeight:1.4,marginBottom:2}}>{n.title}</div>
                    <div style={{fontSize:10,color:'var(--text3)',display:'flex',gap:'.6rem'}}>
                      <span>{n.time} ago</span><span>{n.src}</span>
                      <span style={{color:n.impact==='Positive'?'var(--green)':n.impact==='Negative'?'var(--red)':'var(--text3)'}}>{n.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title"><i className="ti ti-calendar-event"></i>Upcoming Events</div></div>
            <div style={{display:'flex',flexDirection:'column',gap:'.45rem'}}>
              {EVENTS.map((e,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'.55rem .7rem',borderRadius:'var(--radius-sm)',background:'var(--surface2)'}}>
                  <div style={{minWidth:50,fontSize:11,fontWeight:700,fontFamily:'var(--mono)',color:'var(--accent2)'}}>{e.date}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:500}}>{e.event}</div>
                    <div style={{fontSize:10,color:'var(--text3)'}}>{e.type}</div>
                  </div>
                  <span style={{fontSize:11,fontWeight:600,color:impC[e.impact]}}>{e.impact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><i className="ti ti-bell"></i>Price Alerts</div>
            <span className="badge badge-purple">{alerts.length} active</span>
          </div>
          <div style={{background:'var(--surface2)',borderRadius:'var(--radius-sm)',padding:'1rem',marginBottom:'1rem',border:'1px solid var(--border)'}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--text2)',marginBottom:'.6rem',textTransform:'uppercase',letterSpacing:'1px'}}>New Alert</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'.4rem',marginBottom:'.5rem'}}>
              <input placeholder="Symbol" value={form.symbol} onChange={e=>setForm(p=>({...p,symbol:e.target.value.toUpperCase()}))} />
              <select value={form.condition} onChange={e=>setForm(p=>({...p,condition:e.target.value}))}>
                <option>{'>'}</option><option>{'<'}</option>
              </select>
              <input placeholder="Value" type="number" value={form.value} onChange={e=>setForm(p=>({...p,value:e.target.value}))} />
            </div>
            <button className="btn btn-primary" onClick={addAlert} disabled={saving} style={{width:'100%',justifyContent:'center'}}>
              {saving?<span className="spinner-sm"></span>:'+ Create Alert'}
            </button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
            {alerts.map(a=>(
              <div key={a.id} style={{
                padding:'.7rem .9rem',borderRadius:'var(--radius-sm)',
                background:a.status==='active'?'rgba(0,212,170,.05)':'rgba(255,77,109,.05)',
                border:`1px solid ${a.status==='active'?'rgba(0,212,170,.2)':'rgba(255,77,109,.2)'}`,
                display:'flex',justifyContent:'space-between',alignItems:'center'
              }}>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{a.symbol} {a.condition} {a.value?.toLocaleString('en-IN')}</div>
                  <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{a.alert_type} alert</div>
                </div>
                <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
                  <span className={`badge ${a.status==='active'?'badge-green':'badge-orange'}`}>{a.status}</span>
                  <button onClick={()=>removeAlert(a.id)} style={{color:'var(--text3)',fontSize:15}}><i className="ti ti-trash"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
