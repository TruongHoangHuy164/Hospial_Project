import React from 'react';

export default function ReceptionPrint(){
  return (
    <div>
      <h3>In số thứ tự / hóa đơn</h3>
      <p>Chọn lịch hẹn đã thanh toán để in số thứ tự và hóa đơn. (Tính năng chi tiết sẽ được bổ sung)</p>
      <button className="btn btn-outline-secondary" onClick={()=>window.print()}><i className="bi bi-printer"></i> In trang</button>
    </div>
  );
}
