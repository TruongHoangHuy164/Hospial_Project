import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientProfiles } from '../../api/patientProfiles';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BookingPage(){
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  
  // Step 1 state
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(''); // profile._id
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Step 2 state
  const [specialties, setSpecialties] = useState([]);
  const [chuyenKhoaId, setChuyenKhoaId] = useState('');
  const [date, setDate] = useState('');

  // Step 3 state
  const [availability, setAvailability] = useState(null);
  const [selected, setSelected] = useState({ bacSiId:'', khungGio:'' });
  
  // Step 4 & 5 state
  const [appointment, setAppointment] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loadingPay, setLoadingPay] = useState(false);

  const headers = useMemo(()=>({ 'Content-Type':'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')||''}` }), []);

  // Redirect if not logged in (but wait for auth loading and skip when returning from payment)
  useEffect(() => {
    if (loading) return; // wait until auth state is known
    const params = new URLSearchParams(window.location.search);
    const hasPaymentReturn = params.get('status') !== null || params.get('resultCode') !== null;
    if (!isAuthenticated && !hasPaymentReturn) {
      toast.info('Vui lòng đăng nhập để đặt lịch khám.');
      navigate('/login?redirect=/booking');
    }
  }, [isAuthenticated, navigate, loading]);

  // Fetch user's own profile and relative profiles
  const loadProfiles = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingProfiles(true);
    try {
      const profilesRes = await getPatientProfiles();
      setProfiles(profilesRes.data);

      // Default to first relative profile if available
      if(profilesRes.data.length > 0) {
        setSelectedProfileId(profilesRes.data[0]._id);
      } else {
        setSelectedProfileId(null); // No profiles available
      }

    } catch (error) {
      toast.error('Không thể tải hồ sơ của bạn.');
    } finally {
      setLoadingProfiles(false);
    }
  }, [isAuthenticated, headers]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);


  // Fast handle MoMo return as soon as component mounts
  useEffect(()=>{
    try{
      const params = new URLSearchParams(window.location.search);
      // If returning from MoMo, resultCode is present
      const resultCode = params.get('resultCode');
      const apptId = sessionStorage.getItem('momo_appt_id');
      if(resultCode !== null && apptId){
        const body = {};
        params.forEach((v,k)=>{ body[k]=v; });
        fetch(`${API_URL}/api/booking/momo/return`, { method:'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) })
          .then(async r => {
            const j = await r.json().catch(()=>({}));
            setAppointment({ _id: apptId });
            if(r.ok && j?.ok){
              setTicket({ soThuTu: j.soThuTu, trangThai: j.sttTrangThai || 'dang_cho' });
              setStep(5);
            }else{
              setStep(5);
              pollTicket(apptId);
            }
          })
          .catch(()=>{
            setAppointment({ _id: apptId });
            setStep(5);
            pollTicket(apptId);
          })
          .finally(()=>{
            sessionStorage.removeItem('momo_appt_id');
            const url = new URL(window.location.href);
            url.search = '';
            window.history.replaceState({}, '', url.toString());
          });
      }
    }catch{}
  },[]);

  async function loadSpecialties(){
    const res = await fetch(`${API_URL}/api/booking/specialties`);
    const json = await res.json();
    if(res.ok) setSpecialties(json);
  }
  useEffect(()=>{ loadSpecialties(); },[]);
  useEffect(()=>{
    try{
      const params = new URLSearchParams(window.location.search);
      const pre = params.get('chuyenKhoaId');
      if(pre) setChuyenKhoaId(pre);
      // Fast handle MoMo return
      const apptId = sessionStorage.getItem('momo_appt_id');
      const resultCode = params.get('resultCode');
      const orderId = params.get('orderId');
      if(apptId && resultCode !== null){
        // Try fast return first
        const body = {};
        params.forEach((v,k)=>{ body[k]=v; });
        fetch(`${API_URL}/api/booking/momo/return`, { method:'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) })
          .then(async r => {
            const j = await r.json().catch(()=>({}));
            if(r.ok && j?.ok){
              setAppointment({ _id: apptId });
              setTicket({ soThuTu: j.soThuTu, trangThai: j.sttTrangThai || 'dang_cho' });
              setStep(5);
            }else{
              // fallback to poll
              setAppointment({ _id: apptId });
              setStep(5);
              pollTicket(apptId);
            }
          })
          .catch(()=>{
            setAppointment({ _id: apptId });
            setStep(5);
            pollTicket(apptId);
          })
          .finally(()=>{
            sessionStorage.removeItem('momo_appt_id');
            // clean URL
            const url = new URL(window.location.href);
            url.search = '';
            window.history.replaceState({}, '', url.toString());
          });
      }
    }catch{}
  },[]);

  // Handle backend redirect success (/api/booking/momo/return-get -> frontend with ?status=success&id=&stt=)
  useEffect(() => {
    try{
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      const lichKhamId = params.get('id') || sessionStorage.getItem('momo_appt_id');
      if(!status) return;
      if(status === 'success' && lichKhamId){
        setAppointment({ _id: lichKhamId });
        const stt = params.get('stt');
        if(stt){
          setTicket({ soThuTu: Number(stt), trangThai: 'dang_cho' });
        } else {
          // ensure we fetch the latest ticket if stt not provided
          pollTicket(lichKhamId);
        }
        setStep(5);
        // cleanup
        sessionStorage.removeItem('momo_appt_id');
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, '', url.toString());
      } else if(status === 'fail'){
        // Move to step 5 to show waiting UI and try polling if we have id
        if(lichKhamId){
          setAppointment({ _id: lichKhamId });
          setStep(5);
          pollTicket(lichKhamId);
        }
        // cleanup URL
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, '', url.toString());
      }
    }catch{}
  }, []);

  async function checkAvailability(){
    try{
      if(!chuyenKhoaId || !date) return alert('Chọn chuyên khoa và ngày khám');
      const url = new URL(`${API_URL}/api/booking/availability`);
      url.searchParams.set('chuyenKhoaId', chuyenKhoaId);
      url.searchParams.set('date', date);
      const res = await fetch(url);
      const json = await res.json();
      if(!res.ok) throw json;
      setAvailability(json);
      setStep(3);
    }catch(e){ alert(e?.message || 'Tải lịch trống thất bại'); }
  }

  async function createAppointment(){
    try{
      if(!selected.bacSiId || !selected.khungGio) return alert('Chọn bác sĩ và khung giờ');
      
      // Ensure we have a profile selected
      if (!selectedProfileId) {
        return toast.error('Vui lòng chọn hồ sơ để đặt lịch.');
      }
      
      const payload = { 
        bacSiId: selected.bacSiId, 
        chuyenKhoaId, 
        date, 
        khungGio: selected.khungGio 
      };

      console.log('Frontend: Creating appointment with selectedProfileId:', selectedProfileId);

      // Booking for relative profile only (self-booking removed)
      payload.hoSoBenhNhanId = selectedProfileId;
      console.log('Frontend: Booking for relative profile:', selectedProfileId);

      console.log('Frontend: Final payload:', payload);

      const res = await fetch(`${API_URL}/api/booking/appointments`, { method:'POST', headers, body: JSON.stringify(payload) });
      const json = await res.json();
      if(!res.ok) {
        console.error('Frontend: Booking failed:', json);
        throw json;
      }
      console.log('Frontend: Booking success:', json);
      setAppointment(json);
      setStep(4);
    }catch(e){ 
      console.error('Frontend: Booking error:', e);
      alert(e?.message || 'Đặt lịch thất bại'); 
    }
  }

  async function pay(){
    try{
      if(!appointment?._id) return;
      setLoadingPay(true);
      const res = await fetch(`${API_URL}/api/booking/appointments/${appointment._id}/momo`, { method:'POST', headers });
      const json = await res.json();
      if(!res.ok) throw json;
      // Store appt id for return handling then redirect to MoMo payUrl
      sessionStorage.setItem('momo_appt_id', appointment._id);
      window.location.href = json.payUrl;
    }catch(e){ alert(e?.message || 'Tạo thanh toán thất bại'); }
    finally{ setLoadingPay(false); }
  }

  async function pollTicket(apptId){
    let tries = 0;
    const timer = setInterval(async () => {
      tries++;
      try{
        const res = await fetch(`${API_URL}/api/booking/appointments/${apptId}/ticket`);
        const json = await res.json();
        if(res.ok && json.soThuTu){
          setTicket({ soThuTu: json.soThuTu, trangThai: json.sttTrangThai || 'dang_cho' });
          clearInterval(timer);
        }
      }catch{}
      if(tries>20){ clearInterval(timer); }
    }, 2000);
  }

  const handleNextStep1 = () => {
    if (!selectedProfileId) {
      return toast.error('Vui lòng chọn hồ sơ bệnh nhân để đặt lịch.');
    }
    setStep(2);
  }

  return (
    <div className="container py-4" style={{maxWidth: 900}}>
      <h3 className="mb-3">Đặt lịch khám bệnh</h3>
      <div className="progress mb-4" role="progressbar" aria-valuenow={step} aria-valuemin="1" aria-valuemax="5">
        <div className="progress-bar" style={{ width: `${(step/5)*100}%` }}></div>
      </div>

      {step===1 && (
        <div className="card shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>1. Chọn hồ sơ bệnh nhân</span>
            <Link to="/user/profiles" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-pencil-square me-1"></i>
              Quản lý hồ sơ
            </Link>
          </div>
          <div className="card-body">
            {loadingProfiles ? (
              <p>Đang tải hồ sơ...</p>
            ) : (
              <div className="list-group">
                {profiles.map(profile => (
                  <label key={profile._id} className={`list-group-item list-group-item-action ${selectedProfileId === profile._id ? 'active' : ''}`}>
                     <input 
                      type="radio" 
                      name="profileSelection" 
                      className="form-check-input me-2" 
                      value={profile._id}
                      checked={selectedProfileId === profile._id}
                      onChange={(e) => setSelectedProfileId(e.target.value)}
                    />
                    <strong>{profile.quanHe}:</strong> {profile.hoTen} ({new Date(profile.ngaySinh).toLocaleDateString('vi-VN')})
                  </label>
                ))}
                {profiles.length === 0 && (
                  <p className="text-center text-muted p-3">
                    Bạn chưa có hồ sơ người thân nào. <br/>
                    Vui lòng vào <Link to="/user/profiles">Quản lý hồ sơ</Link> để thêm hồ sơ người thân trước khi đặt lịch khám.
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="card-footer d-flex justify-content-end">
            <button className="btn btn-primary" onClick={handleNextStep1} disabled={loadingProfiles || !selectedProfileId}>
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {step===2 && (
        <div className="card shadow-sm">
          <div className="card-header">2. Chọn chuyên khoa và ngày khám</div>
          <div className="card-body">
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label">Chuyên khoa</label>
                <select className="form-select" value={chuyenKhoaId} onChange={e=>setChuyenKhoaId(e.target.value)}>
                  <option value="">-- Chọn --</option>
                  {specialties.map(s => <option key={s._id} value={s._id}>{s.ten}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Ngày khám</label>
                <input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="card-footer d-flex justify-content-between">
            <button className="btn btn-outline-secondary" onClick={()=>setStep(1)}>Quay lại</button>
            <button className="btn btn-primary" onClick={checkAvailability}>Xem lịch trống</button>
          </div>
        </div>
      )}

      {step===3 && availability && (
        <div className="card shadow-sm">
          <div className="card-header">3. Chọn bác sĩ và khung giờ</div>
          <div className="card-body">
            <div className="list-group">
              {availability.doctors.map(d => (
                <div key={d.bacSiId} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-semibold">{d.hoTen} <span className="text-muted">• {d.chuyenKhoa}</span></div>
                    <div className="d-flex flex-wrap gap-2">
                      {d.khungGioTrong.length===0 ? <span className="text-muted small">Hết chỗ</span> : d.khungGioTrong.map(g => (
                        <button key={g} className={`btn btn-sm ${selected.bacSiId===d.bacSiId && selected.khungGio===g ? 'btn-primary' : 'btn-outline-primary'}`} onClick={()=>setSelected({ bacSiId: d.bacSiId, khungGio: g })}>{g}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer d-flex justify-content-between">
            <button className="btn btn-outline-secondary" onClick={()=>setStep(2)}>Quay lại</button>
            <button className="btn btn-primary" onClick={createAppointment} disabled={!selected.bacSiId || !selected.khungGio}>Đặt lịch</button>
          </div>
        </div>
      )}

      {step===4 && appointment && (
        <div className="card shadow-sm">
          <div className="card-header">4. Thanh toán</div>
          <div className="card-body">
            <p>Vui lòng thanh toán để hoàn tất đặt lịch khám.</p>
            <div className="alert alert-info">
              Sử dụng MoMo (môi trường test). Số tiền: <strong>150.000 VND</strong>.
            </div>
          </div>
          <div className="card-footer d-flex justify-content-between">
            <button className="btn btn-outline-secondary" onClick={()=>setStep(3)}>Quay lại</button>
            <button className="btn btn-success" onClick={pay} disabled={loadingPay}>{loadingPay? 'Đang khởi tạo...' : 'Thanh toán với MoMo'}</button>
          </div>
        </div>
      )}

      {step===5 && (
        <div className="card shadow-sm">
          <div className="card-header">5. Số thứ tự khám bệnh</div>
          <div className="card-body text-center">
            {!ticket && (
              <>
                <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                <div className="mt-2 small">Đang chờ hệ thống xác nhận thanh toán...</div>
              </>
            )}
            {ticket && (
              <>
                <h4 className="mb-3">Mã số của bạn</h4>
                <div className="display-3 fw-bold">{ticket.soThuTu}</div>
                <div className="mt-2">Trạng thái: <span className="badge text-bg-secondary">{ticket.trangThai}</span></div>
                <div className="mt-2 small text-muted">Giữ gìn số thứ tự và đến đúng giờ khám.</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}