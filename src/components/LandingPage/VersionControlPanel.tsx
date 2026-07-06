import React, { useState, useEffect } from 'react';
import { useLandingPage } from './LandingPageContext';
import { Save, Clock, Check, Trash2, X, AlertCircle } from 'lucide-react';

export const VersionControlPanel: React.FC = () => {
  const { versions, saveVersion, loadVersion, deleteVersion, isEditMode, setEditMode } = useLandingPage();
  const [isOpen, setIsOpen] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    const handleToggleEditMode = () => setEditMode(!isEditMode);
    window.addEventListener('toggle-edit-mode', handleToggleEditMode);
    return () => window.removeEventListener('toggle-edit-mode', handleToggleEditMode);
  }, [isEditMode, setEditMode]);

  const activeVersion = versions.find(v => v.isActive);

  const handleSave = () => {
    if (newVersionName.trim()) {
      saveVersion(newVersionName.trim());
      setNewVersionName('');
      setShowSaveDialog(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {isEditMode && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center shadow-lg hover:bg-zinc-800 hover:border-purple-500 transition-all group relative"
          >
            <Clock size={20} className="group-hover:text-purple-400" />
            <div className="absolute right-14 bg-black border border-zinc-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
              Version History
            </div>
          </button>
        )}
      </div>

      {/* Version Control Side Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-zinc-950 border-l border-zinc-800 shadow-2xl z-[10000] flex flex-col transform transition-transform duration-300">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Clock size={18} className="text-purple-500" />
              Version History
            </h2>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {showSaveDialog ? (
              <div className="bg-zinc-900 p-4 rounded-lg border border-purple-500/30 mb-6">
                <h3 className="text-sm font-bold text-white mb-2">Save Current State</h3>
                <input
                  type="text"
                  placeholder="e.g. Q3 Marketing Launch"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!newVersionName.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Save Version
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="w-full bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-600 hover:border-purple-500 text-zinc-300 hover:text-white text-sm font-medium py-3 rounded-lg mb-6 flex items-center justify-center gap-2 transition-all"
              >
                <Save size={16} /> Save Current State
              </button>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Saved Versions</h3>
              
              {versions.sort((a, b) => b.timestamp - a.timestamp).map((version) => (
                <div 
                  key={version.id} 
                  className={`p-3 rounded-lg border ${
                    version.isActive 
                      ? 'bg-purple-900/20 border-purple-500/50' 
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600'
                  } transition-colors group`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {version.name}
                      {version.isActive && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-mono uppercase">
                          Active
                        </span>
                      )}
                    </h4>
                    
                    {!version.isActive && (
                      <button 
                        onClick={() => deleteVersion(version.id)}
                        className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Version"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  
                  <div className="text-xs text-zinc-500 font-mono mb-3">
                    {new Date(version.timestamp).toLocaleString()}
                  </div>
                  
                  {!version.isActive && (
                    <button
                      onClick={() => loadVersion(version.id)}
                      className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded transition-colors"
                    >
                      Restore & Set Active
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-black border-t border-zinc-800">
            <div className="flex items-start gap-2 text-zinc-400 text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <p>Versions are saved securely in your browser's local storage engine.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VersionControlPanel;
