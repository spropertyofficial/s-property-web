export async function uploadToCloudinary(file) {
  const url = "https://api.cloudinary.com/v1_1/s-property-cms/auto/upload";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default");

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Gagal upload ke Cloudinary");
  }

  const data = await res.json();
  return data.secure_url; // URL gambar di Cloudinary
}
