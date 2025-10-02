// Utility to check if backend server is running
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function checkServerStatus() {
  try {
    console.log('Checking server status at:', API_URL);
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Server is running:', data);
      return { online: true, data };
    } else {
      console.warn('Server responded with error:', response.status);
      return { online: false, error: `Server returned ${response.status}` };
    }
  } catch (error) {
    console.error('Server check failed:', error);
    return { 
      online: false, 
      error: error.message.includes('fetch') 
        ? 'Không thể kết nối đến server. Vui lòng kiểm tra xem server có đang chạy không.'
        : error.message 
    };
  }
}

export async function testServerConnection() {
  const result = await checkServerStatus();
  
  if (result.online) {
    console.log('✅ Server connection successful');
    return true;
  } else {
    console.error('❌ Server connection failed:', result.error);
    return false;
  }
}