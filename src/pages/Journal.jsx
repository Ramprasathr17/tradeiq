// Journal.jsx
import React, { useState, useEffect } from 'react'
import { getJournal, addJournalEntry, deleteJournalEntry } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const BLANK={symbol:'',exchange:'NSE',strategy:'',direction:'LONG',entry_date:'',exit_date:'',entry_price:'',exit_price:'',quantity:'',notes:'',tags:''}

export function Journal({ auth }) {
  const { userId, isDemo } = auth || {}
  const [entries,setEntries]=useState([])
  const [form,setForm]=useState(BLANK)
  const [showForm,setShowForm]=useState(false)
  const [loading,setLoading]=useState(false)

  useEffect(()=>{
    if(!userId||isDemo)return
    setLoading(true)
    getJournal(userId).then(setEntries).catch(()=>{}).finally(()=>setLoading(false))
  },[userId,isDemo])

  const pnl=()=>{
    const p=(parseFloat(form.exit_price||0)-parseFloat(form.entry_price||0))*(form.direction==='SHORT'?-1:1)*parseInt(form.quantity||0)
    return isNaN(p)?0:p
  }

  const save=async()=>{
    if(!form.symbol){toast.error('Enter a symbol');return}
    setLoading(true)
    try{
      const entry={...form,pnl:pnl(),tags:form.tags.split(',').map(t=>t.trim()).filter(Boolean)}
      if(userId&&!isDemo){
        const saved=await addJournalEntry(userId,entry)
        setEntries(prev=>[saved,...prev])
      }else{
        setEntries(prev=>[{...entry,id:Date.now().toString(),created_at:new Date().toISOString()},...prev])
      }
      setForm(BLANK); setShowForm(false)
      toast.success('Trade logged!')
    }catch(e){toast.error(e.message)}finally{setLoading(false)}
  }

  const remove=async(id)=>{
    try{
      if(userId&&!isDemo)await deleteJournalEntry(id)
      setEntries(prev=>prev.filter(e=>e.id!==id))
      toast.success('Entry deleted')
    }catch(e){toast.error(e.message)}
  }

  const totalPnl=entries.reduce((s,e)=>s+(e.pnl||0),0)
  const wins=entries.filter(e=>(e.pnl||0)>0).length

  return (
    <div className="fade-in">
      <div className="grid-4" style={{marginBottom:'1.5rem'}}>
        <div className="stat-card"><div className="stat-label">Total Trades</div><div className="stat-value">{entries.length}</div></div>
        <div className="stat-card"><div className="stat-label">Net P&L</div><div className="stat-value" style={{color:totalPnl>=0?'var(--green)':'var(--red)'}}>{totalPnl>=0?'+':''}₹{Math.abs(totalPnl).toLocaleString('en-IN',{maximumFractionDigits:0})}</div></div>
        <div className="stat-card"><div className="stat-label">Win Rate</div><div className="stat-value">{entries.length?Math.round(wins/entries.length*100):0}%</div><div className="stat-change">{wins}W / {entries.length-wins}L</div></div>
        <div className="stat-card"><div className="stat-label">Avg P&L / Trade</div><div className="stat-value" style={{fontSize:18}}>{entries.length?'₹'+Math.round(totalPnl/entries.length).toLocaleString('en-IN'):'—'}</div></div>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <h2 style={{fontSize:16,fontWeight:600}}>Trade Entries</h2>
        <button className="btn btn-primary" onClick={()=>setShowForm(true)}>+ Log Trade</button>
      </div>

      {showForm&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Log a Trade</div>
              <button onClick={()=>setShowForm(false)} style={{color:'var(--text3)',fontSize:20}}><i className="ti ti-x"></i></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.6rem'}}>
              {[['symbol','Symbol','text'],['exchange','Exchange','text'],['strategy','Strategy','text'],['direction','Direction','select'],['entry_date','Entry Date','date'],['exit_date','Exit Date','date'],['entry_price','Entry Price','number'],['exit_price','Exit Price','number'],['quantity','Quantity','number']].map(([k,lbl,type])=>(
                <div key={k}>
                  <div style={{fontSize:11,color:'var(--text2)',marginBottom:3}}>{lbl}</div>
                  {type==='select'?(
                    <select className="input" value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}>
                      <option>LONG</option><option>SHORT</option>
                    </select>
                  ):(
                    <input className="input" type={type} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value.toUpperCase?e.target.value.toUpperCase():e.target.value}))} />
                  )}
                </div>
              ))}
              <div style={{gridColumn:'span 2'}}>
                <div style={{fontSize:11,color:'var(--text2)',marginBottom:3}}>Notes</div>
                <textarea className="input" rows={2} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={{width:'100%',resize:'vertical'}}></textarea>
              </div>
              <div style={{gridColumn:'span 2'}}>
                <div style={{fontSize:11,color:'var(--text2)',marginBottom:3}}>Tags (comma separated)</div>
                <input className="input" value={form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} placeholder="options, weekly, loss..." />
              </div>
            </div>
            {form.entry_price&&form.exit_price&&form.quantity&&(
              <div style={{marginTop:'.75rem',padding:'.6rem .85rem',borderRadius:'var(--radius-sm)',background:pnl()>=0?'rgba(0,212,170,.08)':'rgba(255,77,109,.08)',border:`1px solid ${pnl()>=0?'rgba(0,212,170,.2)':'rgba(255,77,109,.2)'}`,color:pnl()>=0?'var(--green)':'var(--red)',fontWeight:600,fontSize:13}}>
                Estimated P&L: {pnl()>=0?'+':''}₹{Math.abs(pnl()).toLocaleString('en-IN',{maximumFractionDigits:0})}
              </div>
            )}
            <div style={{display:'flex',gap:'.5rem',marginTop:'1.25rem',justifyContent:'flex-end'}}>
              <button className="btn btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={loading}>{loading?'Saving…':'Save Entry'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {loading&&!entries.length?<div className="spinner"></div>:entries.length===0?(
          <div className="empty"><i className="ti ti-notebook"></i><p>No trades logged yet. Click + Log Trade to start.</p></div>
        ):(
          <table className="data-table">
            <thead><tr><th>Symbol</th><th>Direction</th><th>Strategy</th><th>Entry</th><th>Exit</th><th>Qty</th><th>P&L</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {entries.map(e=>(
                <tr key={e.id}>
                  <td><div className="name-cell">{e.symbol}</div><div className="sub-cell">{e.exchange}</div></td>
                  <td><span className={`badge ${e.direction==='LONG'?'badge-green':'badge-red'}`}>{e.direction}</span></td>
                  <td style={{color:'var(--text2)',fontFamily:'var(--font)',fontSize:12}}>{e.strategy||'—'}</td>
                  <td>{e.entry_price?'₹'+parseFloat(e.entry_price).toLocaleString('en-IN'):'—'}</td>
                  <td>{e.exit_price?'₹'+parseFloat(e.exit_price).toLocaleString('en-IN'):'—'}</td>
                  <td>{e.quantity||'—'}</td>
                  <td className={(e.pnl||0)>=0?'up':'down'}>{(e.pnl||0)>=0?'+':''}₹{Math.abs(e.pnl||0).toLocaleString('en-IN',{maximumFractionDigits:0})}</td>
                  <td style={{color:'var(--text3)',fontSize:11}}>{e.entry_date||e.created_at?.split('T')[0]}</td>
                  <td><button onClick={()=>remove(e.id)} style={{color:'var(--text3)',fontSize:14}}><i className="ti ti-trash"></i></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Journal
