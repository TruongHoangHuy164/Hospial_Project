import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DoctorDashboard() {
  const [patientQuery, setPatientQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({ hoTen: '', soDienThoai: '' });
  const [caseForm, setCaseForm] = useState({ chanDoan: '', huongDieuTri: 'ngoai_tru' });
  const [casesToday, setCasesToday] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [rxQuery, setRxQuery] = useState('');
  const [rxResults, setRxResults] = useState([]);
  const [rxItems, setRxItems] = useState([]); // {thuoc, soLuong}

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
  }), []);

  async function searchPatients(){
    try{
      const url = new URL(`${API_URL}/api/doctor/patients`);
      if (patientQuery) url.searchParams.set('q', patientQuery);
      url.searchParams.set('limit','10');
      const res = await fetch(url, { headers });
      const json = await res.json();
      if(!res.ok) throw json;
      setPatients(json.items || []);
    }catch(e){ console.error(e); }
  }

  useEffect(()=>{ if(patientQuery.length>=1){ const t=setTimeout(searchPatients,300); return ()=>clearTimeout(t);} else { setPatients([]);} }, [patientQuery]);

  async function createPatientQuick(){
    try{
      if(!newPatient.hoTen) return alert('Nhập họ tên');
      const res = await fetch(`${API_URL}/api/doctor/patients`, { method:'POST', headers, body: JSON.stringify(newPatient) });
      const json = await res.json();
      if(!res.ok) throw json;
      setSelectedPatient(json);
      setNewPatient({ hoTen: '', soDienThoai: '' });
      alert('Đã tạo bệnh nhân');
    }catch(e){ alert(e?.message || 'Tạo bệnh nhân thất bại'); }
  }

  async function loadCasesToday(){
    setLoadingCases(true);
    try{
      const url = new URL(`${API_URL}/api/doctor/cases`);
      url.searchParams.set('date','today');
      url.searchParams.set('limit','20');
      const res = await fetch(url, { headers });
      const json = await res.json();
      if(!res.ok) throw json;
      setCasesToday(json.items || []);
    }catch(e){ console.error(e); }
    finally{ setLoadingCases(false); }
  }

  useEffect(()=>{ loadCasesToday(); },[]);

  async function createCase(){
    try{
      if(!selectedPatient?._id) return alert('Chọn bệnh nhân');
      const payload = { benhNhanId: selectedPatient._id, chanDoan: caseForm.chanDoan, huongDieuTri: caseForm.huongDieuTri };
      const res = await fetch(`${API_URL}/api/doctor/cases`, { method:'POST', headers, body: JSON.stringify(payload) });
      const json = await res.json();
      if(!res.ok) throw json;
      setCaseForm({ chanDoan: '', huongDieuTri: 'ngoai_tru' });
      setSelectedPatient(null);
      await loadCasesToday();
      alert('Đã tạo hồ sơ khám');
    }catch(e){ alert(e?.message || 'Tạo hồ sơ khám thất bại'); }
  }

  async function searchMedicines(){
    try{
      const url = new URL(`${API_URL}/api/doctor/medicines`);
      if (rxQuery) url.searchParams.set('q', rxQuery);
      url.searchParams.set('limit','8');
      const res = await fetch(url, { headers });
      const json = await res.json();
      if(!res.ok) throw json;
      setRxResults(json || []);
    }catch(e){ console.error(e); }
  }

  useEffect(()=>{ if(rxQuery.length>=1){ const t=setTimeout(searchMedicines,300); return ()=>clearTimeout(t);} else { setRxResults([]);} }, [rxQuery]);

  function addMedicine(m){
    if(!m) return;
    setRxItems(items => {
      if(items.some(x => x.thuoc._id === m._id)) return items; // avoid dup
      return [...items, { thuoc: m, soLuong: 1 }];
    });
  }

  function updateQty(idx, val){
    const n = Math.max(1, Number(val)||1);
    setRxItems(items => items.map((it,i)=> i===idx ? { ...it, soLuong: n } : it));
  }

  function removeItem(idx){ setRxItems(items => items.filter((_,i)=>i!==idx)); }

  async function submitPrescription(){
    try{
      if(!selectedCase?._id) return alert('Chọn hồ sơ khám');
      if(rxItems.length===0) return alert('Chưa chọn thuốc');
      const payload = { items: rxItems.map(x => ({ thuocId: x.thuoc._id, soLuong: x.soLuong })) };
      const res = await fetch(`${API_URL}/api/doctor/cases/${selectedCase._id}/prescriptions`, { method:'POST', headers, body: JSON.stringify(payload) });
      const json = await res.json();
      if(!res.ok) throw json;
      setRxItems([]); setRxResults([]); setRxQuery('');
      alert('Đã kê đơn');
    }catch(e){ alert(e?.message || 'Kê đơn thất bại'); }
  }

  return (
    <div className="container py-2">
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header fw-semibold">Khám bệnh nhanh</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Tìm bệnh nhân</label>
                <input className="form-control" placeholder="Nhập tên hoặc SĐT..." value={patientQuery} onChange={(e)=>setPatientQuery(e.target.value)} />
                {patients.length>0 && (
                  <div className="list-group mt-2">
                    {patients.map(p=> (
                      <button key={p._id} type="button" className={`list-group-item list-group-item-action ${selectedPatient?._id===p._id?'active':''}`} onClick={()=>setSelectedPatient(p)}>
                        <div className="d-flex justify-content-between"><div>{p.hoTen}</div><small className="text-muted">{p.soDienThoai}</small></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <div className="fw-semibold mb-2">Hoặc tạo bệnh nhân mới</div>
                <div className="row g-2">
                  <div className="col-8"><input className="form-control" placeholder="Họ tên" value={newPatient.hoTen} onChange={(e)=>setNewPatient(s=>({...s, hoTen:e.target.value}))} /></div>
                  <div className="col-4"><input className="form-control" placeholder="SĐT" value={newPatient.soDienThoai} onChange={(e)=>setNewPatient(s=>({...s, soDienThoai:e.target.value}))} /></div>
                </div>
                <button className="btn btn-outline-primary btn-sm mt-2" onClick={createPatientQuick}><i className="bi bi-plus-lg"/> Tạo nhanh</button>
              </div>

              <hr/>
              <div className="mb-2"><span className="fw-semibold">Bệnh nhân được chọn:</span> {selectedPatient? `${selectedPatient.hoTen} (${selectedPatient.soDienThoai||'N/A'})` : <span className="text-muted">Chưa chọn</span>}</div>

              <div className="mb-2">
                <label className="form-label">Chẩn đoán</label>
                <textarea className="form-control" rows={2} value={caseForm.chanDoan} onChange={(e)=>setCaseForm(s=>({...s, chanDoan:e.target.value}))}></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label">Hướng điều trị</label>
                <select className="form-select" value={caseForm.huongDieuTri} onChange={(e)=>setCaseForm(s=>({...s, huongDieuTri:e.target.value}))}>
                  <option value="ngoai_tru">Ngoại trú</option>
                  <option value="noi_tru">Nội trú</option>
                  <option value="chuyen_vien">Chuyển viện</option>
                  <option value="ke_don">Kê đơn</option>
                </select>
              </div>
              <div className="d-flex justify-content-end">
                <button className="btn btn-success" onClick={createCase}><i className="bi bi-clipboard-plus"/> Tạo hồ sơ khám</button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header fw-semibold">Hồ sơ khám hôm nay</div>
            <div className="card-body">
              {loadingCases ? (
                <div>Đang tải...</div>
              ) : casesToday.length===0 ? (
                <div className="text-muted">Chưa có hồ sơ nào</div>
              ) : (
                <div className="list-group">
                  {casesToday.map(hs => (
                    <button type="button" key={hs._id} className={`list-group-item list-group-item-action ${selectedCase?._id===hs._id?'active':''}`} onClick={()=>setSelectedCase(hs)}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">{hs.benhNhanId?.hoTen}</div>
                          <div className="small opacity-75">{new Date(hs.createdAt).toLocaleTimeString()} • {hs.chanDoan || 'Chưa ghi'}</div>
                        </div>
                        <span className="badge text-bg-light">{hs.huongDieuTri || 'N/A'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {selectedCase && (
            <div className="card mt-3 shadow-sm">
              <div className="card-header fw-semibold">Kê đơn cho: {selectedCase.benhNhanId?.hoTen}</div>
              <div className="card-body">
                <div className="mb-2">
                  <label className="form-label">Tìm thuốc</label>
                  <input className="form-control" placeholder="Nhập tên thuốc..." value={rxQuery} onChange={(e)=>setRxQuery(e.target.value)} />
                  {rxResults.length>0 && (
                    <div className="list-group mt-2">
                      {rxResults.map(m => (
                        <button type="button" key={m._id} className="list-group-item list-group-item-action" onClick={()=>addMedicine(m)}>
                          <div className="d-flex justify-content-between"><div>{m.tenThuoc}</div><small className="text-muted">{m.dangBaoChe || m.donViTinh}</small></div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {rxItems.length>0 && (
                  <div className="mb-3">
                    <div className="fw-semibold mb-2">Đơn thuốc</div>
                    {rxItems.map((it, idx) => (
                      <div key={it.thuoc._id} className="d-flex align-items-center gap-2 mb-2">
                        <div className="flex-grow-1">{it.thuoc.tenThuoc}</div>
                        <input type="number" min="1" className="form-control" style={{width:90}} value={it.soLuong} onChange={(e)=>updateQty(idx, e.target.value)} />
                        <button className="btn btn-outline-danger btn-sm" onClick={()=>removeItem(idx)}><i className="bi bi-x"/></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="d-flex justify-content-end">
                  <button className="btn btn-primary" onClick={submitPrescription} disabled={rxItems.length===0}><i className="bi bi-capsule"/> Lưu đơn thuốc</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
