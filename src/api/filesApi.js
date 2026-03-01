// src/api/filesApi.js

// Upload with simulated progress + cancel support (returns { promise, cancel })
export function uploadFile(file, onProgress) {
  const controller = new AbortController();
  let progress = 0;

  const interval = setInterval(() => {
    progress += 8;
    if (progress > 90) progress = 90;
    try { if (onProgress) onProgress(progress); } catch (e) {}
  }, 120);

  const formData = new FormData();
  formData.append('file', file);

  const promise = fetch('http://localhost:4000/api/upload', {
    method: 'POST',
    body: formData,
    signal: controller.signal,
  })
    .then(async (res) => {
      clearInterval(interval);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error('Upload failed: ' + (txt || res.status));
      }
      try { if (onProgress) onProgress(100); } catch (e) {}
      return res.json();
    })
    .catch((err) => {
      clearInterval(interval);
      throw err;
    });

  return { promise, cancel: () => controller.abort() };
}

export async function listFiles() {
  const res = await fetch('http://localhost:4000/api/files');
  if (!res.ok) throw new Error('Failed to fetch files');
  return res.json();
}

export async function updateFileTags(id, tags) {
  const res = await fetch(`http://localhost:4000/api/files/${id}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags }),
  });
  if (!res.ok) throw new Error('Failed to update tags');
  return res.json();
}

// <- Added deleteFile (used by App.jsx)
export async function deleteFile(id) {
  const res = await fetch(`http://localhost:4000/api/files/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error('Delete failed: ' + (txt || res.status));
  }
  return res.json();
}
