# Cloudinary File Organization System

## 📁 **Struktur Folder Cloudinary**

### **✅ Implementasi Baru (Organized by Applicant)**

```
cloudinary.com/s-property/registrations/
├── john-doe-reg_1752123456/
│   ├── ktpFile.jpg
│   ├── npwpFile.pdf
│   └── bankBookFile.jpg
├── jane-smith-reg_1752123789/
│   ├── ktpFile.jpg
│   ├── npwpFile.jpg
│   └── bankBookFile.pdf
└── ahmad-susanto-reg_1752124012/
    ├── ktpFile.jpg
    ├── npwpFile.pdf
    └── bankBookFile.jpg
```

### **❌ Implementasi Sebelumnya (Unorganized)**

```
cloudinary.com/s-property/registrations/
├── 1752123456-ktp.jpg
├── 1752123457-npwp.pdf
├── 1752123458-bankbook.jpg
├── 1752123789-ktp.jpg
├── 1752123790-npwp.jpg
└── 1752123791-bankbook.jpg
```

## 🛠️ **Technical Implementation**

### **1. API Upload Cloudinary**
```javascript
// Sanitize applicant name for folder structure
const sanitizedName = applicantName
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, '') // Remove special characters
  .replace(/\s+/g, '-') // Replace spaces with hyphens
  .substring(0, 30); // Limit length

// Create organized folder structure
const folderPath = `s-property/registrations/${sanitizedName}-${registrationId}`;
const publicId = `${folderPath}/${fileType}`;
```

### **2. Registration Form**
```javascript
const handleFileUpload = useCallback(async (file, fileType) => {
  const registrationId = `reg_${Date.now()}`;
  const options = {
    applicantName: formData.fullName || "unknown",
    registrationId: registrationId
  };
  
  const result = await uploadFile(file, fileType, options);
}, [uploadFile, formData.fullName]);
```

### **3. File Upload Hook**
```javascript
const uploadFile = useCallback(async (file, fileType, options = {}) => {
  const { applicantName = "unknown", registrationId = Date.now().toString() } = options;
  
  // Create FormData with applicant info
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileType", fileType);
  formData.append("applicantName", applicantName);
  formData.append("registrationId", registrationId);
}, []);
```

## 🎯 **Benefits**

### **Organization**
- ✅ **Easy to find**: Files grouped by applicant name
- ✅ **Clear structure**: Each applicant has their own folder
- ✅ **No name conflicts**: Unique registration ID prevents collisions

### **Management**
- ✅ **Bulk operations**: Easy to delete/manage files per applicant
- ✅ **Security**: Isolated file access per registration
- ✅ **Backup**: Simpler backup strategy per applicant

### **Performance**
- ✅ **Faster searching**: Folder structure enables quick file lookup
- ✅ **CDN optimization**: Better caching strategy per folder
- ✅ **Reduced API calls**: Batch operations possible

## 📋 **Naming Convention**

### **Folder Names**
```
Format: {sanitized-name}-{registration-id}
Examples:
- john-doe-reg_1752123456
- jane-smith-reg_1752123789
- ahmad-susanto-reg_1752124012
```

### **File Names**
```
Format: {fileType}
Examples:
- ktpFile.jpg
- npwpFile.pdf  
- bankBookFile.jpg
```

### **Sanitization Rules**
1. **Lowercase**: Convert to lowercase
2. **Remove special chars**: Keep only a-z, 0-9, spaces
3. **Replace spaces**: Convert spaces to hyphens
4. **Limit length**: Maximum 30 characters
5. **Add timestamp**: Unique registration ID suffix

## 🔍 **Example URLs**

### **Before (Unorganized)**
```
https://res.cloudinary.com/your-cloud/image/upload/s-property/registrations/1752123456-ktp.jpg
```

### **After (Organized)**
```
https://res.cloudinary.com/your-cloud/image/upload/s-property/registrations/john-doe-reg_1752123456/ktpFile.jpg
```

## 🚀 **Usage**

### **In Registration Form**
```javascript
// When user uploads file, it automatically creates organized folder
// based on their full name from the form
handleFileUpload(file, "ktpFile");
```

### **In Admin Dashboard**
```javascript
// Files are easily accessible with clear folder structure
// Admin can quickly identify which files belong to which applicant
const fileUrl = registration.documents.ktp.url;
// Example: .../john-doe-reg_1752123456/ktpFile.jpg
```

---
*Updated: File organization system now creates folders per applicant for better management*
