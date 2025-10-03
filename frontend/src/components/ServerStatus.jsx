import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ServerStatus = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    try {
      console.log('Checking server at:', API_URL);
      const response = await fetch(`${API_URL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Server response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Server data:', data);
        setStatus('online');
      } else {
        setStatus('error');
        setError(`Server responded with ${response.status}`);
      }
    } catch (err) {
      console.error('Server check error:', err);
      setStatus('offline');
      setError(err.message);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '4px',
      background: 'white',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <strong>Server Status:</strong>
      <div style={{ 
        color: status === 'online' ? 'green' : status === 'offline' ? 'red' : 'orange' 
      }}>
        {status === 'checking' && '🔄 Checking...'}
        {status === 'online' && '✅ Online'}
        {status === 'offline' && '❌ Offline'}
        {status === 'error' && '⚠️ Error'}
      </div>
      {error && <div style={{ color: 'red', fontSize: '10px' }}>{error}</div>}
      <div style={{ fontSize: '10px', marginTop: '5px' }}>
        {API_URL}
      </div>
      <button 
        onClick={checkServer}
        style={{ fontSize: '10px', marginTop: '5px' }}
      >
        Recheck
      </button>
    </div>
  );
};

export default ServerStatus;