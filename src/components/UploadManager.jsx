import React, { useRef, useState, useEffect } from 'react'
import { uploadFile } from '../api/filesApi'

export default function UploadManager({ onUploaded }) {
  const ref = useRef(null)
  const [queue, setQueue] = useState([])

  useEffect(() => {
    return () => {
      setQueue((q) => {
        q.forEach((it) => { if (it?.cancel) try { it.cancel() } catch {} })
        return []
      })
    }
  }, [])

  function onSelect(e) {
    const files = Array.from(e.target.files || [])
    files.forEach(startUpload)
    e.target.value = null
  }

  function onDrop(e) {
    e.preventDefault()
    const files = Array.from(e.dataTransfer?.files || [])
    files.forEach(startUpload)
  }
  function onDragOver(e) { e.preventDefault() }

  function startUpload(file) {
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9)
    const entry = { id, name: file?.name ?? 'untitled', size: file?.size ?? 0, progress: 0, status: 'uploading', cancel: null }
    setQueue((q) => [entry, ...q])

    const { promise, cancel } = uploadFile(file, (p) => {
      const progress = Number.isFinite(p) ? Math.max(0, Math.min(100, p)) : 0
      setQueue((q) => q.map((it) => (it.id === id ? { ...it, progress } : it)))
    })

    setQueue((q) => q.map((it) => (it.id === id ? { ...it, cancel } : it)))

    promise.then((meta) => {
      setQueue((q) => q.map((it) => (it.id === id ? { ...it, progress: 100, status: 'done' } : it)))
      try { onUploaded && onUploaded(meta) } catch (err) { console.warn('onUploaded handler threw', err) }
      setTimeout(() => setQueue((q) => q.filter((it) => it.id !== id)), 1300)
    }).catch((err) => {
      const isAbort = err && (err.name === 'AbortError' || /cancel|abort/i.test(String(err?.message || '')))
      setQueue((q) => q.map((it) => (it.id === id ? { ...it, status: isAbort ? 'cancelled' : 'failed' } : it)))
      setTimeout(() => setQueue((q) => q.filter((it) => it.id !== id)), 900)
      console.error('upload failed', err)
    })
  }

  function cancelUpload(id) {
    setQueue((q) => {
      const found = q.find((x) => x.id === id)
      if (found?.cancel) try { found.cancel() } catch {}
      return q.map((it) => (it.id === id ? { ...it, status: 'cancelled' } : it))
    })
    setTimeout(() => setQueue((q) => q.filter((it) => it.id !== id)), 800)
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3">Upload</h3>

      <div
        role="button"
        tabIndex={0}
        className="upload-area"
        onClick={() => ref.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') ref.current?.click() }}
      >
        <input ref={ref} type="file" className="hidden" multiple onChange={onSelect} />
        <div className="text-sm text-gray-500">Drag & drop or click to select</div>
      </div>

      <div className="mt-4 space-y-2">
        {queue.map((q) => {
          const progress = Number.isFinite(q.progress) ? Math.max(0, Math.min(100, q.progress)) : 0
          const sizeKB = (Number.isFinite(q.size) ? (q.size / 1024) : 0).toFixed(2)
          return (
            <div key={q.id} className="p-2 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{q.name}</div>
                <div className="text-xs text-gray-500">{sizeKB} KB</div>
              </div>
              <div className="w-48">
                <div className="w-full bg-gray-100 rounded h-3 overflow-hidden">
                  <div style={{ width: `${progress}%` }} className="h-3 rounded bg-indigo-500 transition-all" />
                </div>
                <div className="text-xs text-gray-600 mt-1 flex items-center justify-between">
                  <span>{q.status} • {progress}%</span>
                  <div>
                    {q.status === 'uploading' && <button type="button" onClick={() => cancelUpload(q.id)} className="text-xs text-red-600 ml-2">Cancel</button>}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
