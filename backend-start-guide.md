# Backend Start Guide

## Để khởi động backend:

### Option 1: PowerShell

```powershell
cd C:\Hospital_Mini_Project\backend
node src/index.js
```

### Option 2: Command Prompt

```cmd
cd C:\Hospital_Mini_Project\backend
node src/index.js
```

### Expected output:

```
Server running on http://localhost:5000
Database connected successfully
```

## Troubleshooting:

### 1. Check if backend is running:

- Open browser: http://localhost:5000
- Should show: `{"app":"Hospital Backend","status":"ok"}`

### 2. Check profile API:

- Must be logged in first
- GET http://localhost:5000/api/users/profile
- Should return user profile data

### 3. Common issues:

- **Port 5000 in use**: Change port in backend/src/index.js
- **Database connection**: Check MongoDB connection string
- **CORS errors**: Backend should allow frontend origin

## Quick test backend:

```bash
# Test if server is alive
curl http://localhost:5000/

# Expected response:
# {"app":"Hospital Backend","status":"ok"}
```
