import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { Shield, Search, Filter, Trash2, Calendar, User as UserIcon, RefreshCw, FileText, CheckCircle, Workflow, Table } from 'lucide-react';
import AuditMindMap from './AuditMindMap';

export default function ChangeLogs() {
  const { changeLogs, clearChangeLogs, currentUser } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'user'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'mindmap'>('table');

  if (currentUser?.role !== 'SysAdmin') {
    return (
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
        <Shield className="text-red-500 mx-auto" size={48} />
        <h3 className="text-xl font-bold text-white">Access Denied</h3>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          You do not have administrative privileges to access this secure audit system. Only System Administrators can view change logs.
        </p>
      </div>
    );
  }

  // Statistics
  const totalCount = changeLogs.length;
  const adminCount = changeLogs.filter(log => log.type === 'admin').length;
  const userCount = changeLogs.filter(log => log.type === 'user').length;

  // Filter & Search
  const filteredLogs = changeLogs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSearch = 
      log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to delete all audit logs? This action is irreversible.')) {
      clearChangeLogs();
    }
  };

  const handleExportCSV = () => {
    if (changeLogs.length === 0) return;
    const headers = ['Timestamp', 'Username', 'Role', 'Action', 'Category', 'Details'];
    const rows = changeLogs.map(log => [
      log.timestamp,
      `"${log.username.replace(/"/g, '""')}"`,
      `"${log.userRole.replace(/"/g, '""')}"`,
      `"${log.action.replace(/"/g, '""')}"`,
      log.type === 'admin' ? 'Admin' : 'User',
      `"${log.details.replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ukbfc_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      }) + ' ' + date.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Shield size={28} className="text-[#A493F7] animate-pulse" />
            Audit Log & System Activity
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time secure compliance register. Every administrative and user modification is recorded below.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 mr-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Table View"
            >
              <Table size={16} />
            </button>
            <button
              onClick={() => setViewMode('mindmap')}
              className={`p-1.5 rounded-md transition ${viewMode === 'mindmap' ? 'bg-zinc-800 text-[#A493F7] shadow' : 'text-zinc-500 hover:text-[#A493F7]'}`}
              title="Mind Map View"
            >
              <Workflow size={16} />
            </button>
          </div>
          <button 
            onClick={handleExportCSV}
            disabled={changeLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 hover:text-white rounded-lg transition text-sm font-medium shadow-sm"
          >
            <FileText size={16} />
            Export CSV
          </button>
          <button 
            onClick={handleClearLogs}
            disabled={changeLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-950/40 border border-red-900/40 hover:bg-red-900/30 text-red-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-sm font-medium shadow-sm"
          >
            <Trash2 size={16} />
            Clear Audit Log
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group shadow-lg">
          <div className="absolute right-4 top-4 text-zinc-800 group-hover:text-zinc-700/80 transition-colors">
            <Shield size={40} />
          </div>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Total Actions Captured</p>
          <p className="text-3xl font-black text-white mt-1">{totalCount}</p>
          <div className="w-full bg-zinc-800 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: totalCount > 0 ? '100%' : '0%' }}></div>
          </div>
        </div>

        <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group shadow-lg">
          <div className="absolute right-4 top-4 text-purple-950/40 group-hover:text-purple-950/60 transition-colors">
            <Shield size={40} />
          </div>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Admin Configurations</p>
          <p className="text-3xl font-black text-purple-400 mt-1">{adminCount}</p>
          <div className="w-full bg-zinc-800 h-1 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full" 
              style={{ width: totalCount > 0 ? `${(adminCount / totalCount) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>

        <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group shadow-lg">
          <div className="absolute right-4 top-4 text-emerald-950/40 group-hover:text-emerald-950/60 transition-colors">
            <CheckCircle size={40} />
          </div>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">User Activities</p>
          <p className="text-3xl font-black text-emerald-400 mt-1">{userCount}</p>
          <div className="w-full bg-zinc-800 h-1 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full" 
              style={{ width: totalCount > 0 ? `${(userCount / totalCount) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'mindmap' ? (
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[700px]">
          <div className="p-4 bg-zinc-950/50 border-b border-zinc-800/60 flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2"><Workflow size={18} className="text-[#A493F7]" /> Audit Log Canvas</h3>
            <span className="text-xs text-zinc-500">Interactive Visualization</span>
          </div>
          <div className="flex-1 w-full h-full">
             <AuditMindMap logs={changeLogs} />
          </div>
        </div>
      ) : (
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-zinc-950/50 border-b border-zinc-800/60 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by action, user, role or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm text-white placeholder-zinc-500 outline-none transition"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Filter size={16} className="text-zinc-400" />
            <span className="text-xs font-mono text-zinc-400">Filter Category:</span>
            <div className="flex bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
              {(['all', 'admin', 'user'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                    filterType === type 
                      ? 'bg-zinc-800 text-white shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {type === 'all' ? 'All Activities' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Change Logs List */}
        {filteredLogs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-xl mx-auto text-zinc-500">
              <RefreshCw size={20} className="animate-spin-slow" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-300">No activity logs recorded</h4>
            <p className="text-zinc-500 text-xs max-w-sm mx-auto">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your filters or search criteria to locate specific actions.' 
                : 'Every change users or administrators make to this platform will be captured and visible in real-time.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/20 text-zinc-400 text-xs font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4 w-1/3">Activity Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/10 transition text-sm group">
                    <td className="py-3 px-4 text-zinc-400 whitespace-nowrap font-mono text-xs">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-zinc-500" />
                        {formatDate(log.timestamp)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-full text-zinc-300">
                          <UserIcon size={14} />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-200 leading-none">{log.username}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{log.userRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.action === 'Submitted Question' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          ❓ User Question
                        </span>
                      ) : log.type === 'admin' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          🛡️ Admin Change
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          👤 User Change
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-xs text-zinc-300 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 text-xs break-words">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="p-3 bg-zinc-950/20 border-t border-zinc-800/40 flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>Showing {filteredLogs.length} of {totalCount} logs</span>
          <span className="flex items-center gap-1">
            <Shield size={12} className="text-zinc-500" />
            Immutable Audit History Active
          </span>
        </div>
      </div>
      )}
    </div>
  );
}
