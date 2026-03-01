import React, { useEffect, useState } from 'react';

export default function FilePreview({ fileId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState(null);
  const [html, setHtml] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (!fileId) return;
    setLoading(true);
    setKind(null); setHtml(''); setUrl(''); setText('');

    fetch(`/api/files/${fileId}/preview`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Preview fetch failed');
        return r.json();
      })
      .then(j => {
        setKind(j.kind);
        if (j.kind === 'html') setHtml(j.html || '');
        if (j.kind === 'pdf') setUrl(j.url || j.path || '');
        if (j.kind === 'text') setText(j.text || '');
      })
      .catch(e => console.error('Preview load error', e))
      .finally(() => setLoading(false));
  }, [fileId]);

  if (!fileId) return null;

  function handleOpen() { if (!url) return; window.open(url, '_blank'); }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(2,6,23,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
      <div style={{ width:'92%', maxWidth:1100, maxHeight:'92%', background:'#fff', borderRadius:12, overflow:'auto', padding:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <strong>Preview</strong>
          <div>
            <button onClick={handleOpen} style={{ marginRight:8 }} disabled={!url}>Open</button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>

        {loading && <div>Loading preview…</div>}

        {!loading && kind === 'pdf' && url && (<iframe src={url} style={{ width:'100%', height:'75vh', border:0 }} title="pdf-preview" />)}
        {!loading && kind === 'html' && html && (<div dangerouslySetInnerHTML={{ __html: html }} style={{ overflowY:'auto' }} />)}
        {!loading && kind === 'text' && text && (<pre style={{ whiteSpace:'pre-wrap' }}>{text}</pre>)}
        {!loading && !kind && (<div className="text-sm text-gray-600">Preview not available.</div>)}
      </div>
    </div>
  );
}
