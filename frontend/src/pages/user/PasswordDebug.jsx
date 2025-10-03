import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PasswordDebug() {
  const { isAuthenticated, user } = useAuth();
  
  // Create headers manually since AuthContext doesn't provide them
  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    // Test 1: Basic connectivity
    try {
      const headers = getHeaders();
      const response = await fetch(`${API_URL}/api/users/profile`, { headers });
      results.connectivity = {
        status: response.ok ? 'success' : 'error',
        message: response.ok ? 'Kết nối thành công' : `HTTP ${response.status}`,
        details: response.ok ? await response.json() : await response.text()
      };
    } catch (error) {
      results.connectivity = {
        status: 'error',
        message: 'Lỗi kết nối',
        details: error.message
      };
    }

    // Test 2: Authentication
    results.auth = {
      status: isAuthenticated ? 'success' : 'error',
      message: isAuthenticated ? 'Đã xác thực' : 'Chưa xác thực',
      details: { user, headers: getHeaders() }
    };

    // Test 3: Change password endpoint
    try {
      const response = await fetch(`${API_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          currentPassword: 'test',
          newPassword: 'test123'
        })
      });
      
      const data = await response.json();
      results.changePassword = {
        status: response.status === 400 ? 'warning' : (response.ok ? 'success' : 'error'),
        message: response.status === 400 ? 'Endpoint hoạt động (lỗi validation)' : (response.ok ? 'OK' : `HTTP ${response.status}`),
        details: data
      };
    } catch (error) {
      results.changePassword = {
        status: 'error',
        message: 'Lỗi gọi API',
        details: error.message
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      runTests();
    }
  }, [isAuthenticated]);

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card">
            <div className="card-header">
              <h4>Change Password Debug Tool</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <button 
                  className="btn btn-primary" 
                  onClick={runTests}
                  disabled={loading}
                >
                  {loading ? 'Đang test...' : 'Chạy Test'}
                </button>
              </div>

              {Object.keys(testResults).length > 0 && (
                <>
                  <h5>Kết quả Test:</h5>
                  
                  {Object.entries(testResults).map(([testName, result]) => (
                    <div key={testName} className={`alert alert-${
                      result.status === 'success' ? 'success' : 
                      result.status === 'warning' ? 'warning' : 'danger'
                    }`}>
                      <h6>{testName.toUpperCase()}</h6>
                      <p><strong>Status:</strong> {result.message}</p>
                      <details>
                        <summary>Chi tiết</summary>
                        <pre style={{ fontSize: '12px', marginTop: '10px' }}>
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                </>
              )}

              <div className="mt-4">
                <h5>Hướng dẫn:</h5>
                <ul>
                  <li><strong>Connectivity:</strong> Phải success để đổi mật khẩu hoạt động</li>
                  <li><strong>Auth:</strong> Phải success và có token hợp lệ</li>
                  <li><strong>Change Password:</strong> Warning (lỗi validation) là bình thường vì đang test với data giả</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}