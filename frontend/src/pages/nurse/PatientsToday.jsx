import React from 'react';

export default function PatientsToday(){
  const columns = ['STT','Tên BN','Giới tính','Tình trạng bệnh','Ghi chú'];
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Danh sách bệnh nhân trong ngày</h5>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                {columns.map(c => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={columns.length} className="text-center">Đang phát triển...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
