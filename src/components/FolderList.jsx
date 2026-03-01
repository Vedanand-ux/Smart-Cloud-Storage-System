import React from 'react';

export default function FolderList({ files = [], selected = null, onSelect = () => {} }) {
  const groups = files.reduce((acc, f) => {
    let tag = 'Unsorted';
    try {
      if (Array.isArray(f.ai_tags) && f.ai_tags.length) tag = String(f.ai_tags[0]).replace(/^#/, '');
      else if (typeof f.ai_tags === 'string' && f.ai_tags.trim()) {
        const t = f.ai_tags.trim();
        if (t.startsWith('[')) {
          const parsed = JSON.parse(t);
          if (Array.isArray(parsed) && parsed.length) tag = String(parsed[0]).replace(/^#/, '');
        } else tag = String(t).replace(/^#/, '');
      }
    } catch { tag = 'Unsorted'; }
    acc[tag] = acc[tag] || [];
    acc[tag].push(f);
    return acc;
  }, {});

  const folderNames = Object.keys(groups).sort((a,b)=>{
    if (a === 'Unsorted') return 1;
    if (b === 'Unsorted') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="card">
      <h4 className="text-sm font-semibold mb-3">Folders</h4>
      <div className="text-xs text-gray-600 mb-3">Click a folder to filter files.</div>

      <div className="space-y-2">
        {folderNames.length === 0 && <div className="text-sm text-gray-500">No folders yet.</div>}
        {folderNames.map(name => {
          const count = groups[name].length;
          const active = selected === name;
          return (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={`folder-item w-full flex items-center justify-between p-2 rounded ${active ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-gray-50'}`}
            >
              <div className="text-left">
                <div className="text-sm font-medium">{name}</div>
                <div className="text-xs text-gray-500">{count} file{count>1?'s':''}</div>
              </div>
              <div className="text-xs text-indigo-600">Open</div>
            </button>
          )
        })}
      </div>

      <hr className="my-3" />
      <div className="text-xs text-gray-600 mb-2">Sample file</div>
      <div className="flex items-center space-x-2">
        <button className="text-xs text-indigo-600" onClick={()=> window.open('/mnt/data/Project Idea.docx','_blank')}>Open sample file</button>
        <span className="text-xs text-gray-400">/mnt/data/Project Idea.docx</span>
      </div>
    </div>
  );
}
