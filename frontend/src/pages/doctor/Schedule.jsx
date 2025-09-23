import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatDate(d){ return d.toISOString().slice(0,10); }
function startOfWeek(d){ const x = new Date(d); const day = x.getDay(); const diff = (day===0?6:day-1); x.setDate(x.getDate()-diff); x.setHours(0,0,0,0); return x; }

export default function DoctorSchedulePage(){
  const [weekStart, setWeekStart] = useState(()=> startOfWeek(new Date()));
  const [items, setItems] = useState([]);
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')||''}` }), []);

  const days = Array.from({length:7}).map((_,i)=>{ const d=new Date(weekStart); d.setDate(d.getDate()+i); return d; });
  const cas = ['sang','chieu','toi'];

  async function load(){
    const from = formatDate(days[0]);
    const to = formatDate(days[6]);
    const url = new URL(`${API_URL}/api/doctor/schedule`);
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);
    const res = await fetch(url, { headers });
    const json = await res.json();
    if(res.ok) setItems(json); else console.error(json);
  }
  useEffect(()=>{ load(); }, [weekStart]);

  function findOne(dateStr, ca){
    return items.find(x => x.ca===ca && x.ngay?.slice?.(0,10)===dateStr);
  }

  async function toggle(date, ca){
    const dateStr = formatDate(date);
    const exist = findOne(dateStr, ca);
    if(exist){
      // toggle off -> delete if đang làm việc; if trực/nghỉ allow change
      await fetch(`${API_URL}/api/doctor/schedule/${exist._id}`, { method:'DELETE', headers });
      setItems(list => list.filter(x => x._id !== exist._id));
    }else{
      const body = { ngay: dateStr, ca: ca, loaiCa: 'lam_viec' };
      const res = await fetch(`${API_URL}/api/doctor/schedule`, { method:'POST', headers, body: JSON.stringify(body) });
      const json = await res.json();
      if(res.ok) setItems(list => [...list, json]); else alert(json?.message||'Lỗi lưu');
    }
  }

  async function setLoai(date, ca, loai){
    const dateStr = formatDate(date);
    const exist = findOne(dateStr, ca);
    if(!exist){
      const res = await fetch(`${API_URL}/api/doctor/schedule`, { method:'POST', headers, body: JSON.stringify({ ngay: dateStr, ca, loaiCa: loai }) });
      const json = await res.json();
      if(res.ok) setItems(list => [...list, json]); else alert(json?.message||'Lỗi');
    }else{
      const res = await fetch(`${API_URL}/api/doctor/schedule/${exist._id}`, { method:'PUT', headers, body: JSON.stringify({ loaiCa: loai }) });
      const json = await res.json();
      if(res.ok) setItems(list => list.map(x => x._id===json._id? json: x)); else alert(json?.message||'Lỗi');
    }
  }

  return (
    <div className="container py-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Lịch làm việc</h5>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" onClick={()=> setWeekStart(d=>{ const x=new Date(d); x.setDate(x.getDate()-7); return startOfWeek(x); })}><i className="bi bi-chevron-left"/> Tuần trước</button>
          <button className="btn btn-outline-secondary" onClick={()=> setWeekStart(startOfWeek(new Date()))}>Hôm nay</button>
          <button className="btn btn-outline-secondary" onClick={()=> setWeekStart(d=>{ const x=new Date(d); x.setDate(x.getDate()+7); return startOfWeek(x); })}>Tuần sau <i className="bi bi-chevron-right"/></button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead>
            <tr>
              <th>Ca/Ngày</th>
              {days.map((d,i)=> (
                <th key={i}>{d.toLocaleDateString('vi-VN', { weekday: 'short', day:'2-digit', month:'2-digit' })}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cas.map(ca => (
              <tr key={ca}>
                <th className="text-capitalize">{ca}</th>
                {days.map((d, i) => {
                  const dateStr = formatDate(d);
                  const exist = findOne(dateStr, ca);
                  const loai = exist?.loaiCa || null;
                  return (
                    <td key={i}>
                      <div className="d-flex flex-column gap-2">
                        <button className={`btn btn-sm ${exist? 'btn-success':'btn-outline-secondary'}`} onClick={()=>toggle(d, ca)}>
                          {exist? 'Đã đăng ký' : 'Đăng ký' }
                        </button>
                        <div className="btn-group">
                          <button className={`btn btn-sm ${loai==='lam_viec'?'btn-primary':'btn-outline-primary'}`} onClick={()=>setLoai(d,ca,'lam_viec')}>Làm việc</button>
                          <button className={`btn btn-sm ${loai==='truc'?'btn-warning':'btn-outline-warning'}`} onClick={()=>setLoai(d,ca,'truc')}>Trực</button>
                          <button className={`btn btn-sm ${loai==='nghi'?'btn-danger':'btn-outline-danger'}`} onClick={()=>setLoai(d,ca,'nghi')}>Nghỉ</button>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
