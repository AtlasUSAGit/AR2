import React, { useState, useRef } from 'react';
import { useAppContext } from '../AppContext';
import { StaticPage, UploadedFile } from '../types';
import { Edit2, Save, Flag, Check, X, Upload, File, Download, Trash2, Paperclip, Link, Palette } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function StaticPageView({ pageId }: { pageId: string }) {
  const { 
    pages, 
    updatePageContent, 
    togglePageReview, 
    currentUser, 
    permissions, 
    uploadedFiles, 
    addUploadedFile, 
    deleteUploadedFile 
  } = useAppContext();
  
  const page = pages.find((p) => p.id === pageId);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');

  if (!page) return <div className="text-white p-8">Page not found.</div>;

  const userRole = currentUser?.role || '';
  const rolePerm = permissions?.find(p => p.role === userRole);

  const isSysAdmin = userRole === 'SysAdmin';
  const canEdit = isSysAdmin || (rolePerm ? rolePerm.editPages.includes(pageId) : false);
  const canUpload = isSysAdmin || (rolePerm ? rolePerm.uploadPages.includes(pageId) : false);
  const canReadFiles = isSysAdmin || (rolePerm ? (rolePerm.readPageAndFilesPages || []).includes(pageId) : false);

  const handleEdit = () => {
    setContent(page.htmlContent);
    setIsEditing(true);
  };

  const handleSave = () => {
    updatePageContent(page.id, content);
    setIsEditing(false);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const fileDataUrl = reader.result as string;
      addUploadedFile({
        id: `file-${Date.now()}`,
        pageId,
        name: file.name,
        size: formatBytes(file.size),
        uploadedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        uploadedBy: currentUser?.name || currentUser?.username || 'Unknown',
        fileDataUrl,
      });
    };
    reader.readAsDataURL(file);
    // Clear input
    e.target.value = '';
  };

  const pageFiles = uploadedFiles.filter(f => f.pageId === pageId);

  const textEditorSection = isEditing ? (
    <div className="flex flex-col gap-2 relative">
      <style>{`
        .quill-dark .ql-toolbar {
          background-color: rgba(0, 0, 0, 0.4);
          border-color: #3f3f46;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
        }
        .quill-dark .ql-container {
          background-color: #000;
          border-color: #3f3f46;
          color: #d4d4d8;
          font-family: inherit;
          font-size: 0.875rem;
          min-height: 400px;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
        }
        .quill-dark .ql-editor {
          min-height: 400px;
        }
        .quill-dark .ql-stroke {
          stroke: #d4d4d8;
        }
        .quill-dark .ql-fill {
          fill: #d4d4d8;
        }
        .quill-dark .ql-picker {
          color: #d4d4d8;
        }
        .quill-dark .ql-picker-options {
          background-color: #18181b;
          border-color: #3f3f46;
        }
      `}</style>
      <div className="quill-dark">
        <ReactQuill 
          theme="snow" 
          value={content} 
          onChange={setContent} 
          modules={modules}
        />
      </div>
    </div>
  ) : (
    <div 
      className="prose prose-invert prose-purple max-w-none prose-headings:font-sans prose-p:text-zinc-300 prose-li:text-zinc-300 min-h-[150px]"
      dangerouslySetInnerHTML={{ __html: page.htmlContent }}
    />
  );

  const documentAttachmentsSection = (
    <div className="mb-12 border-b border-zinc-800 pb-8 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Paperclip className="text-[#A493F7]" size={20} />
          <h3 className="text-xl font-bold text-white">Sovereign Document Attachments</h3>
        </div>
        {canReadFiles && <span className="text-xs font-mono text-zinc-500">{pageFiles.length} file(s) attached</span>}
      </div>

      {/* Upload Button */}
      {canUpload && (
        <div className="mb-6">
          <label className="border border-dashed border-zinc-800 hover:border-[#A493F7]/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-black/20 hover:bg-[#A493F7]/5 transition group">
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileChange} 
            />
            <Upload className="text-zinc-500 group-hover:text-[#A493F7] mb-2 transition" size={24} />
            <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition">Upload Document Attachment</span>
            <span className="text-xs text-zinc-500 mt-1">Select any PDF, Word, Image, or spreadsheet</span>
          </label>
        </div>
      )}

      {/* File List */}
      {!canReadFiles ? (
        <div className="text-center py-8 border border-zinc-800/50 rounded-xl bg-black/10">
          <File className="text-zinc-600 mx-auto mb-2" size={32} />
          <p className="text-sm text-zinc-500">You do not have permission to view attached files.</p>
        </div>
      ) : pageFiles.length === 0 ? (
        <div className="text-center py-8 border border-zinc-800/50 rounded-xl bg-black/10">
          <File className="text-zinc-600 mx-auto mb-2" size={32} />
          <p className="text-sm text-zinc-500">No attachments uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pageFiles.map((file) => (
            <div key={file.id} className="border border-zinc-850 rounded-xl p-4 flex items-center justify-between bg-black/20 hover:border-zinc-800 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-purple-950/20 border border-purple-500/20 text-[#A493F7] rounded-lg shrink-0">
                  <File size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs font-mono text-zinc-500 mt-0.5">
                    {file.size} • By {file.uploadedBy} on {file.uploadedAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={file.fileDataUrl}
                  download={file.name}
                  className="p-2 text-zinc-400 hover:text-[#A493F7] hover:bg-zinc-800 rounded-lg transition"
                  title="Download File"
                >
                  <Download size={16} />
                </a>
                {canUpload && (
                  <button
                    onClick={() => deleteUploadedFile(file.id)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition"
                    title="Delete File"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-8 relative min-h-[500px] animate-fadeIn">
      <div className="flex justify-between items-start border-b border-zinc-800 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-white font-sans">{page.title}</h2>
        
        {/* Permission-aware controls */}
        <div className="flex items-center gap-3">
          {isSysAdmin && (
            <button
              onClick={() => togglePageReview(page.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition ${
                page.needsReview
                  ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                  : 'bg-zinc-800 text-zinc-400 border-transparent hover:bg-zinc-700'
              }`}
            >
              <Flag size={14} />
              {page.needsReview ? 'MARKED FOR REVIEW' : 'MARK FOR REVIEW'}
            </button>
          )}

          {canEdit && (
            <>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#A493F7]/10 text-[#A493F7] hover:bg-[#A493F7]/20 border border-[#A493F7]/30 rounded-lg text-xs font-mono transition"
                >
                  <Edit2 size={14} />
                  EDIT HTML
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-xs font-mono transition"
                  >
                    <Save size={14} />
                    SAVE
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-mono transition"
                  >
                    <X size={14} />
                    CANCEL
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {page.needsReview && (
        <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-3">
          <Flag className="text-red-500 mt-0.5" size={18} />
          <div>
            <h4 className="text-red-400 font-bold text-sm">Review Required</h4>
            <p className="text-red-300/70 text-xs mt-1">This document has been flagged by a System Administrator for review and updates.</p>
          </div>
        </div>
      )}

      {documentAttachmentsSection}
      {textEditorSection}
    </div>
  );
}
