import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProfileDebug() {
  const { user, headers, isAuthenticated } = useAuth();
  const [apiStatus, setApiStatus] = useState('checking');
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    try {
      setApiStatus('checking');
      const response = await fetch(`${API_URL}/api/users/profile`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setApiStatus('success');
        setError(null);
      } else {
        const errorText = await response.text();
        setError(`HTTP ${response.status}: ${errorText}`);
        setApiStatus('error');
      }
    } catch (err) {
      setError(`Network Error: ${err.message}`);
      setApiStatus('error');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      testConnection();
    }
  }, [isAuthenticated]);

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card">
            <div className="card-header">
              <h4>Profile API Debug Tool</h4>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h5>Authentication Status</h5>
                  <ul className="list-unstyled">
                    <li><strong>Authenticated:</strong> {String(isAuthenticated)}</li>
                    <li><strong>User:</strong> {JSON.stringify(user, null, 2)}</li>
                    <li><strong>Headers:</strong> {JSON.stringify(headers, null, 2)}</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h5>API Configuration</h5>
                  <ul className="list-unstyled">
                    <li><strong>API URL:</strong> {API_URL}</li>
                    <li><strong>Endpoint:</strong> /api/users/profile</li>
                    <li><strong>Status:</strong> 
                      <span className={`badge ms-1 ${
                        apiStatus === 'success' ? 'bg-success' :
                        apiStatus === 'error' ? 'bg-danger' : 'bg-warning'
                      }`}>
                        {apiStatus}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mb-4">
                <button 
                  className="btn btn-primary me-2" 
                  onClick={testConnection}
                >
                  Test API Connection
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    console.log('Debug Info:', {
                      user, headers, isAuthenticated, 
                      apiStatus, profile, error
                    });
                  }}
                >
                  Log Debug Info
                </button>
              </div>

              {error && (
                <div className="alert alert-danger">
                  <h6>Error Details:</h6>
                  <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                    {error}
                  </pre>
                </div>
              )}

              {profile && (
                <div className="alert alert-success">
                  <h6>Profile Data Retrieved:</h6>
                  <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(profile, null, 2)}
                  </pre>
                </div>
              )}

              {apiStatus === 'checking' && (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Testing API connection...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}