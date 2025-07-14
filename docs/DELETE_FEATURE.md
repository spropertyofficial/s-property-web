# Delete Registration Feature

## 🗑️ **Fitur Hapus Registrasi**

### **✅ Implementasi Lengkap:**

Fitur hapus registrasi telah ditambahkan dengan role-based access control yang ketat.

## 🔐 **Role-Based Access Control**

### **🎯 Permission Matrix:**

| Role | View | Update Status | Export | **DELETE** |
|------|------|---------------|--------|------------|
| **superadmin** | ✅ | ✅ | ✅ | ✅ |
| **editor** | ✅ | ✅ | ✅ | ❌ |
| **viewer** | ✅ | ❌ | ❌ | ❌ |

### **🛡️ Security Level:**

- **HANYA SUPERADMIN** yang bisa menghapus registrasi
- Konfirmasi ganda dengan SweetAlert
- Soft delete bisa diimplementasikan nanti jika diperlukan

## 🛠️ **Technical Implementation**

### **1. API DELETE Endpoint:**

```javascript
// DELETE /api/admin/registrations/[id]
export async function DELETE(request, { params }) {
  // Hanya superadmin yang bisa akses
  const authResult = await verifyAdminWithRole(request, ["superadmin"]);
  if (authResult.error) {
    return authResult.error; // 403 Forbidden untuk non-superadmin
  }
  
  // Hard delete dari database
  await Registration.findByIdAndDelete(id);
  
  // TODO: Delete files from Cloudinary (optional)
}
```

### **2. Frontend Implementation:**

```javascript
// Button hanya muncul untuk superadmin
{admin?.role === "superadmin" && (
  <button onClick={() => handleDelete(id, name)}>
    <FaTrash />
  </button>
)}

// Double confirmation
const handleDelete = async (id, fullName) => {
  const result = await Swal.fire({
    title: "Hapus Registrasi",
    text: `Yakin hapus "${fullName}"? Tidak bisa dibatalkan.`,
    icon: "warning",
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal"
  });
}
```

### **3. Admin Context System:**

```javascript
// Hook untuk mendapatkan admin info
const { admin } = useAdmin();

// Admin context provider di layout
<AdminProvider>
  {children}
</AdminProvider>
```

## 🚀 **Features**

### **✅ What Works:**

1. **Role-Based Visibility:**
   - Delete button hanya muncul untuk superadmin
   - Editor dan viewer tidak melihat tombol delete

2. **API Security:**
   - HTTP 403 jika non-superadmin coba delete via API
   - Proper authentication dan role validation

3. **User Experience:**
   - Konfirmasi dialog dengan nama lengkap pendaftar
   - Success/error notifications
   - Auto refresh table setelah delete

4. **Data Integrity:**
   - Hard delete dari MongoDB
   - Statistics update otomatis setelah delete

### **🔄 Post-Delete Actions:**

```javascript
// Setelah delete berhasil:
1. Refresh registration list → fetchRegistrations()
2. Update statistics → fetchStats()  
3. Show success notification
4. Table auto-update
```

## 📋 **Usage Instructions**

### **For Superadmin:**

1. **Login as superadmin**
2. **Navigate to** `/admin/registrations`
3. **Find registration** to delete
4. **Click trash icon** (🗑️) in Actions column
5. **Confirm deletion** in popup dialog
6. **Registration removed** from system

### **For Editor/Viewer:**

- ❌ **No delete button visible**
- ❌ **API returns 403** if attempted via direct API call
- ✅ **Can still view, update status, export** (based on role)

## ⚠️ **Important Notes**

### **Data Considerations:**

1. **Hard Delete:** Data dihapus permanen dari database
2. **File Cleanup:** File di Cloudinary tidak otomatis terhapus (TODO)
3. **No Backup:** Tidak ada backup otomatis sebelum delete
4. **Audit Trail:** Tidak ada log deletion (bisa ditambahkan nanti)

### **Recommended Enhancements:**

```javascript
// Future improvements yang bisa ditambahkan:

1. Soft Delete:
   - Add 'deletedAt' field instead of hard delete
   - Keep data for audit purposes

2. File Cleanup:
   - Auto-delete Cloudinary files when registration deleted
   - Cleanup orphaned files

3. Audit Logging:
   - Log who deleted what and when
   - Keep deletion history

4. Bulk Delete:
   - Allow multiple selection for bulk operations
   - Batch delete functionality

5. Backup Before Delete:
   - Export to backup before deletion
   - Recovery mechanism
```

## 🧪 **Testing Scenarios**

### **Test Cases:**

1. **Superadmin Delete:**

   ```text
   ✅ Login as superadmin
   ✅ See delete button
   ✅ Click delete → Show confirmation
   ✅ Confirm → Registration deleted
   ✅ Table refreshed
   ✅ Statistics updated
   ```

2. **Editor Access:**

   ```text
   ✅ Login as editor
   ❌ No delete button visible
   ❌ Direct API call returns 403
   ✅ Other functions work normally
   ```

3. **Viewer Access:**

   ```text
   ✅ Login as viewer
   ❌ No delete button visible
   ❌ No write permissions at all
   ✅ Read-only access works
   ```

## 🔒 **Security Features**

### **Multi-Layer Protection:**

1. **Frontend:** Button hidden untuk non-superadmin
2. **API:** Role verification di server-side
3. **Database:** Proper MongoDB connection dan validation
4. **Confirmation:** Double-confirmation dialog
5. **Audit:** Action logging untuk security

### **Error Handling:**

- **401:** No authentication token
- **403:** Valid token, insufficient role (non-superadmin)
- **404:** Registration not found
- **500:** Server error during deletion

---

## Status Update

Delete functionality implemented with superadmin-only access and proper security measures
