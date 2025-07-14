# Role-Based Authentication System

## 🔐 **Sistem Auth untuk Registration Management**

### **👥 Admin Roles yang Tersedia:**

1. **🔧 superadmin** - Full access ke semua fitur
2. **✏️ editor** - Bisa read, write, export (tidak bisa manage users)
3. **👁️ viewer** - Hanya bisa read/view data

### **📋 Permission Matrix:**

| Feature | Superadmin | Editor | Viewer |
|---------|------------|---------|---------|
| **View Registrations** | ✅ | ✅ | ✅ |
| **View Registration Details** | ✅ | ✅ | ✅ |
| **Update Registration Status** | ✅ | ✅ | ❌ |
| **Export Registration Data** | ✅ | ✅ | ❌ |
| **Delete Registrations** | ✅ | ❌ | ❌ |
| **Manage Admin Users** | ✅ | ❌ | ❌ |

### **🛡️ API Endpoints & Required Roles:**

#### **Registration Management APIs:**

```javascript
// GET /api/admin/registrations - View all registrations
Required Roles: ["superadmin", "editor", "viewer"]

// GET /api/admin/registrations/[id] - View specific registration
Required Roles: ["superadmin", "editor", "viewer"]

// PUT /api/admin/registrations/[id] - Update registration status
Required Roles: ["superadmin", "editor"]

// GET /api/admin/registrations/stats - View statistics
Required Roles: ["superadmin", "editor", "viewer"]

// GET /api/admin/registrations/export - Export data
Required Roles: ["superadmin", "editor"]
```

## 🔧 **Technical Implementation**

### **1. Enhanced Auth Middleware:**

```javascript
// src/lib/auth.js

// New role-based verification
export async function verifyAdminWithRole(request, requiredRoles = []) {
  // Verifies JWT token + checks role permissions
}

// Permission mapping
export const PERMISSIONS = {
  superadmin: ["read", "write", "delete", "manage_users", "export"],
  editor: ["read", "write", "export"],
  viewer: ["read"]
};
```

### **2. API Protection Example:**

```javascript
// Protected API endpoint
export async function PUT(request, { params }) {
  // Only superadmin and editor can update
  const authResult = await verifyAdminWithRole(request, ["superadmin", "editor"]);
  if (authResult.error) {
    return authResult.error; // Returns 401/403 response
  }
  
  // Continue with business logic...
}
```

### **3. Admin Model Schema:**

```javascript
const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: {
    type: String,
    enum: ["superadmin", "editor", "viewer"],
    default: "editor",
  },
});
```

## 🚀 **Usage Examples**

### **Login Process:**
```javascript
// User logs in → JWT token created with role info
const token = jwt.sign({ 
  id: admin._id, 
  role: admin.role 
}, JWT_SECRET);

// Token stored in httpOnly cookie
response.cookies.set("token", token, {
  httpOnly: true,
  secure: true,
  maxAge: 7 * 24 * 60 * 60 // 7 days
});
```

### **API Request with Role Check:**
```javascript
// Each API request automatically checks:
// 1. Valid JWT token
// 2. User exists in database
// 3. User role has required permissions

// Example responses:
// 401 - "Authentication required" (no token)
// 401 - "Admin not found" (invalid user)
// 403 - "Access denied. Required roles: superadmin, editor"
```

## 📊 **Frontend Integration**

### **Admin Dashboard Behavior:**

```javascript
// Different UI based on user role
const admin = useAdmin(); // Gets admin info from auth context

// Conditional rendering
{admin.role === 'viewer' ? (
  <ViewOnlyInterface />
) : (
  <EditableInterface />
)}

// Button permissions
{["superadmin", "editor"].includes(admin.role) && (
  <UpdateStatusButton />
)}
```

### **Error Handling:**

```javascript
// Automatic redirect for 401/403
if (response.status === 401) {
  router.push('/admin/login');
}

if (response.status === 403) {
  showMessage('You do not have permission for this action');
}
```

## 🔧 **Migration from Previous Auth:**

### **What Changed:**

1. **❌ Before:** Mixed token names (`adminToken` vs `token`)
2. **✅ Now:** Consistent `token` cookie name

3. **❌ Before:** No role-based access control
4. **✅ Now:** Granular permissions per role

5. **❌ Before:** Manual auth checks in each API
6. **✅ Now:** Centralized auth middleware

### **Backward Compatibility:**

- ✅ Existing admin users work (same schema)
- ✅ JWT tokens remain valid
- ✅ Login process unchanged
- ✅ Cookie auth mechanism same

## 🧪 **Testing Role-Based Access**

### **Test Cases:**

1. **Superadmin Access:**
   - Can view all registrations ✅
   - Can update status ✅
   - Can export data ✅
   - Can manage users ✅

2. **Editor Access:**
   - Can view all registrations ✅
   - Can update status ✅
   - Can export data ✅
   - Cannot manage users ❌

3. **Viewer Access:**
   - Can view all registrations ✅
   - Cannot update status ❌
   - Cannot export data ❌
   - Cannot manage users ❌

### **API Testing:**

```bash
# Test with different roles
curl -H "Cookie: token=JWT_TOKEN" http://localhost:4004/api/admin/registrations

# Expected responses:
# Valid superadmin/editor/viewer: 200 + data
# Valid viewer on PUT endpoint: 403 + permission error
# No token: 401 + auth required
# Invalid token: 401 + invalid token
```

## 🔒 **Security Features**

### **Enhanced Security:**
- ✅ **Role-based access control**
- ✅ **JWT token validation**
- ✅ **HttpOnly cookies** (XSS protection)
- ✅ **Secure flag** in production
- ✅ **7-day token expiry**
- ✅ **Admin verification** on each request

### **Error Responses:**
- 🔐 **401 Unauthorized:** No/invalid token
- 🚫 **403 Forbidden:** Valid token, insufficient role
- ❌ **404 Not Found:** Resource doesn't exist
- 💥 **500 Server Error:** System error

---
*Updated: Registration system now uses comprehensive role-based authentication with granular permissions*
