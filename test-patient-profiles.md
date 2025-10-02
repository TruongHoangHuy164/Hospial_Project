# Patient Profiles Test Guide

## Issues Fixed So Far:

1. ✅ Fixed backend authentication middleware (req.user.id instead of req.user.\_id)
2. ✅ Fixed frontend form data handling and styling
3. ✅ Added proper error handling and logging
4. ✅ Improved UI with new CSS classes

## Testing Steps:

### 1. Start Backend Server

```bash
cd C:\Hospital_Mini_Project\backend
node src/index.js
```

### 2. Start Frontend Server

```bash
cd C:\Hospital_Mini_Project\frontend
npm run dev
```

### 3. Test Patient Profiles Feature

1. **Login** to the application first
2. **Navigate** to `/user/profiles` or click "Hồ sơ người thân" in the menu
3. **Check browser console** for API logs:

   - Should see "Frontend: Starting to fetch profiles..."
   - Should see API request logs
   - Should see backend logs if server is running

4. **Add a new profile**:

   - Click "Thêm hồ sơ" button
   - Fill in required fields (marked with \*)
   - Submit form
   - Check console for creation logs

5. **Check profile display**:
   - Profiles should appear in a clean card layout
   - Each profile should show: name, relationship, ID, birth date, etc.

## Potential Issues to Check:

### Backend Issues:

- [ ] Backend server not running (Exit Code: 1)
- [ ] Database connection issues
- [ ] Authentication token validation
- [ ] CORS configuration

### Frontend Issues:

- [ ] API base URL configuration
- [ ] Token storage in localStorage
- [ ] Network connectivity to backend

### Data Issues:

- [ ] Empty profiles array due to user ID mismatch
- [ ] Form validation errors
- [ ] Date formatting issues

## Debugging Commands:

### Check if backend is running:

```bash
curl http://localhost:5000/health
```

### Check database connection:

```bash
# In MongoDB shell or compass
db.patientprofiles.find()
```

### Check browser storage:

```javascript
// In browser console
localStorage.getItem("accessToken");
```
