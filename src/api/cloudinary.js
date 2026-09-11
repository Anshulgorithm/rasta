const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Uploads a single file to Cloudinary using the unsigned preset from .env.
// Returns the public URL of the uploaded image.
async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Photo upload failed.');
  }

  const data = await response.json();
  return data.secure_url;
}

// Uploads several files one after another (not at the same time, to keep
// things simple and avoid overwhelming the connection) and returns their URLs.
export async function uploadImagesToCloudinary(files) {
  const urls = [];
  for (const file of files) {
    const url = await uploadImageToCloudinary(file);
    urls.push(url);
  }
  return urls;
}
