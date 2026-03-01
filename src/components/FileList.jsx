import React, { useEffect, useState } from 'react';
import FilePreview from './FilePreview';

function Tag({ children }) {
  return <span className="tag-pill">#{children}</span>;
}

export default function FileList({ files = [], onDelete = () => {} }) {
  const [previewId, setPreviewId] = useState(null);

  useEffect(() => {
    // helpful debug
    // console.log('FileList files', files);
  }, [files]);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3">Files</h3>

      {previewId && <FilePreview fileId={previewId} onClose={() => setPreviewId(null)} />}

      <div className="space-y-4">
        {files.length === 0 && (
          <div className="text-sm text-gray-500 p-4">No files uploaded yet.</div>
        )}

        {files.map((f) => {
          const displayName = f.filename || f.name || 'untitled';
          const sizeKB = (Number.isFinite(f.size) ? (f.size / 1024) : 0).toFixed(2);
          const mimetype = f.mimetype || '';

          let tags = [];
          try {
            if (Array.isArray(f.ai_tags)) tags = f.ai_tags;
            else if (typeof f.ai_tags === 'string' && f.ai_tags.startsWith('[')) tags = JSON.parse(f.ai_tags);
            else if (typeof f.ai_tags === 'string' && f.ai_tags.trim()) tags = [f.ai_tags];
          } catch { tags = []; }

          const folder = tags.length ? String(tags[0]).replace(/^#/, '') : '—';

          return (
            <div key={f.id ?? displayName} className="file-row flex items-start justify-between">
              <div style={{ minWidth:0 }}>
                <div className="font-medium text-gray-800 text-sm truncate">{displayName}</div>
                <div className="muted mt-1">{sizeKB} KB • {mimetype}</div>

                <div className="mt-2 small">
                  <div><strong>Folder:</strong> <span className="muted">{folder}</span></div>
                </div>

                <div className="mt-2">
                  {tags.length > 0 ? tags.map((t,i)=> <Tag key={i}>{String(t).replace(/^#/, '')}</Tag>) : <span className="text-xs text-gray-400">no tags</span>}
                </div>

                {f.ai_summary && <div className="text-xs text-gray-600 mt-2 line-clamp-2">{f.ai_summary}</div>}
              </div>

              <div className="flex items-center space-x-3 mt-2">
                <span className="status-pill">{f.ai_status || '—'}</span>
                <div className="right-links">
                  <a href="#" onClick={(e)=>{e.preventDefault(); setPreviewId(f.id)}}>Preview</a>
                  <a href="#" onClick={(e)=>{e.preventDefault(); window.open(`/files/${f.id}/raw`, '_blank')}}>Open file</a>
                  <button className="text-xs text-red-600" onClick={()=>onDelete(f.id)}>Delete</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
