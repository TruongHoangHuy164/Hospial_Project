import React, { useState, useEffect } from 'react';
import { checkServerStatus } from '../utils/serverCheck';

export default function ServerStatusCheck() {
  const [status, setStatus] = useState({ checking: true, online: false, error: null });

  useEffect(() => {
    const checkStatus = async () => {
      const result = await checkServerStatus();
      setStatus({
        checking: false,
        online: result.online,
        error: result.error
      });
    };
    
    checkStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status.checking) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-hourglass-split"></i> Đang kiểm tra kết nối server...
      </div>
    );
  }

  if (!status.online) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle"></i>
        <strong> Lỗi kết nối server:</strong>
        <br />
        {status.error}
        <br />
        <small>
          Vui lòng đảm bảo backend server đang chạy tại{' '}
          <code>{import.meta.env.VITE_API_URL || 'http://localhost:5000'}</code>
        </small>
      </div>
    );
  }

  return (
    <div className="alert alert-success">
      <i className="bi bi-check-circle"></i> Server đang hoạt động bình thường
    </div>
  );
}