// User Management view - RBAC integration updates
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { User, Role } from '../types';
import { Trash2, UserPlus, Edit2, Check, X, Shield, Key, Sliders, FolderOpen } from 'lucide-react';

const ALL_PAGES = [
  { id: 'home', name: 'Command Center (Home)' },
  { id: 'mindmap', name: 'Mind Map Sandbox' },
  { id: 'federal', name: '8(a) Contracting Timeline' },
  { id: 'hub', name: '8(a) Document Hub' },
  { id: 'bylaws', name: 'Bylaws' },
  { id: 'meeting-minutes', name: 'Meeting Minutes' },
  { id: 'board-minutes', name: 'Board Minutes' },
  { id: 'resources', name: 'Resources' },
];

export default function UserManagement() {
  const {
    users,
    departments,
    addUser,
    deleteUser,
    updateUser,
    addDepartment,
    deleteDepartment,
    currentUser,
    roles,
    permissions,
    addRole,
    updateRolePermissions
  } = useAppContext();

  const [subTab, setSubTab] = useState<'users' | 'departments' | 'permissions'>('users');

  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>('District Representative');
  const [newDept, setNewDept] = useState('');

  // Editing User State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState<Role>('District Representative');
  const [editDept, setEditDept] = useState('');

  // Roles & Permissions state
  const [selectedRole, setSelectedRole] = useState<string>('SysAdmin');
  const [newRoleName, setNewRoleName] = useState('');

  if (currentUser?.role !== 'SysAdmin') {
    return (
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
        <Shield className="text-red-500 mx-auto" size={48} />
        <h3 className="text-xl font-bold text-white">Access Denied</h3>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          You do not have administrative privileges to access this system. Only System Administrators can configure user permissions.
        </p>
      </div>
    );
  }

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditRole(user.role);
    setEditDept(user.departmentId);
  };

  const handleSaveEdit = (userId: string) => {
    if (!editName || !editUsername || !editDept) return;
    updateUser({
      id: userId,
      name: editName,
      username: editUsername,
      role: editRole,
      departmentId: editDept
    });
    setEditingUserId(null);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const sha256 = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newName || !newDept || !newPassword) return;

    const hash = await sha256(newPassword);
    const newUser: User = {
      id: `u-${Date.now()}`,
      username: newUsername,
      name: newName,
      role: newRole,
      departmentId: newDept,
      passwordHash: hash
    };
    addUser(newUser);
    setNewUsername('');
    setNewName('');
    setNewPassword('');
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const cleanRoleName = newRoleName.trim();
    addRole(cleanRoleName);
    setSelectedRole(cleanRoleName);
    setNewRoleName('');
  };

  const currentRolePerm = permissions.find(p => p.role === selectedRole) || {
    role: selectedRole,
    readPageOnlyPages: [],
    readPageAndFilesPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'],
    editPages: [],
    uploadPages: []
  };

  const handleTogglePermission = (type: 'readPageOnly' | 'readPageAndFiles' | 'edit' | 'upload', pageId: string) => {
    let newReadPageOnly = currentRolePerm.readPageOnlyPages ? [...currentRolePerm.readPageOnlyPages] : [];
    let newReadPageAndFiles = currentRolePerm.readPageAndFilesPages ? [...currentRolePerm.readPageAndFilesPages] : [];
    let newEdit = currentRolePerm.editPages ? [...currentRolePerm.editPages] : [];
    let newUpload = currentRolePerm.uploadPages ? [...currentRolePerm.uploadPages] : [];

    if (type === 'readPageOnly') {
      if (newReadPageOnly.includes(pageId)) {
        newReadPageOnly = newReadPageOnly.filter(id => id !== pageId);
      } else {
        newReadPageOnly.push(pageId);
        newReadPageAndFiles = newReadPageAndFiles.filter(id => id !== pageId); // Mutual exclusivity
      }
    } else if (type === 'readPageAndFiles') {
      if (newReadPageAndFiles.includes(pageId)) {
        newReadPageAndFiles = newReadPageAndFiles.filter(id => id !== pageId);
      } else {
        newReadPageAndFiles.push(pageId);
        newReadPageOnly = newReadPageOnly.filter(id => id !== pageId); // Mutual exclusivity
      }
    } else if (type === 'edit') {
      if (newEdit.includes(pageId)) {
        newEdit = newEdit.filter(id => id !== pageId);
      } else {
        newEdit.push(pageId);
      }
    } else if (type === 'upload') {
      if (newUpload.includes(pageId)) {
        newUpload = newUpload.filter(id => id !== pageId);
      } else {
        newUpload.push(pageId);
      }
    }

    updateRolePermissions(selectedRole, newReadPageOnly, newReadPageAndFiles, newEdit, newUpload);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white font-sans flex items-center gap-3">
            <Shield className="text-[#A493F7]" size={28} />
            <span>Sovereign Security & User Management</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Configure identity records, directory divisions, and secure permission matrices.</p>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex border-b border-zinc-800/80 gap-6">
        <button
          onClick={() => setSubTab('users')}
          className={`pb-3 text-xs font-mono uppercase tracking-widest transition-all duration-300 relative flex items-center gap-2 ${subTab === 'users' ? 'text-[#A493F7] font-bold' : 'text-zinc-500 hover:text-white'
            }`}
        >
          <UserPlus size={14} />
          User Directory
          {subTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#A493F7]" />}
        </button>
        <button
          onClick={() => setSubTab('departments')}
          className={`pb-3 text-xs font-mono uppercase tracking-widest transition-all duration-300 relative flex items-center gap-2 ${subTab === 'departments' ? 'text-[#A493F7] font-bold' : 'text-zinc-500 hover:text-white'
            }`}
        >
          <FolderOpen size={14} />
          Divisions / Departments
          {subTab === 'departments' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#A493F7]" />}
        </button>
        <button
          onClick={() => setSubTab('permissions')}
          className={`pb-3 text-xs font-mono uppercase tracking-widest transition-all duration-300 relative flex items-center gap-2 ${subTab === 'permissions' ? 'text-[#A493F7] font-bold' : 'text-zinc-500 hover:text-white'
            }`}
        >
          <Key size={14} />
          Role Permissions Matrix
          {subTab === 'permissions' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#A493F7]" />}
        </button>
      </div>

      {/* TAB 1: USERS LIST & CREATION */}
      {subTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-mono uppercase text-[#A493F7] mb-4">Provision New Identity</h3>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Username (Email)</label>
                <input type="text" required value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-[#A493F7] focus:outline-none focus:ring-1 focus:ring-[#A493F7]" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Password</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-[#A493F7] focus:outline-none focus:ring-1 focus:ring-[#A493F7]" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Full Name</label>
                <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-[#A493F7] focus:outline-none focus:ring-1 focus:ring-[#A493F7]" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Role</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value as Role)} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-[#A493F7] focus:outline-none">
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Department</label>
                <select required value={newDept} onChange={e => setNewDept(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-[#A493F7] focus:outline-none">
                  <option value="">Select Dept...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="bg-[#A493F7] text-black font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-white transition flex items-center justify-center gap-2 w-full">
                <UserPlus size={16} /> Add User
              </button>
            </form>
          </div>

          <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900 text-xs uppercase text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {users.map((user) => {
                  const dept = departments.find(d => d.id === user.departmentId);
                  const isEditing = editingUserId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-zinc-900/50 transition">
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="bg-black border border-zinc-700 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:border-[#A493F7]"
                          />
                        ) : (
                          <span className="font-bold text-white">{user.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            required
                            value={editUsername}
                            onChange={e => setEditUsername(e.target.value)}
                            className="bg-black border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-white w-full focus:outline-none focus:border-[#A493F7]"
                          />
                        ) : (
                          <span className="font-mono text-xs">{user.username}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={editRole}
                            onChange={e => setEditRole(e.target.value as Role)}
                            className="bg-black border border-zinc-700 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-[#A493F7]"
                          >
                            {roles.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="bg-purple-900/30 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={editDept}
                            onChange={e => setEditDept(e.target.value)}
                            className="bg-black border border-zinc-700 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-[#A493F7]"
                          >
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span>{dept?.name || 'Unknown'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex justify-end items-center gap-1">
                            <button
                              onClick={() => handleSaveEdit(user.id)}
                              className="text-emerald-400 hover:text-emerald-300 p-1.5 rounded-lg hover:bg-emerald-500/10 transition"
                              title="Save Changes"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-700/20 transition"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(user)}
                              className="text-[#A493F7] hover:text-purple-300 p-1.5 rounded-lg hover:bg-[#A493F7]/10 transition"
                              title="Edit User"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              disabled={user.username === currentUser?.username || user.username === 'admin'}
                              className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed p-1.5 rounded-lg hover:bg-red-500/10 transition"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS LIST & ADDITION */}
      {subTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 h-fit">
            <h3 className="text-sm font-mono uppercase text-[#A493F7] mb-4">Add Department</h3>
            <form onSubmit={e => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('deptName') as HTMLInputElement).value;
              if (input) {
                addDepartment({ id: `dept-${Date.now()}`, name: input });
                (e.currentTarget.elements.namedItem('deptName') as HTMLInputElement).value = '';
              }
            }} className="space-y-4">
              <div>
                <input name="deptName" type="text" placeholder="Department Name" required className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-[#A493F7] focus:outline-none focus:ring-1 focus:ring-[#A493F7]" />
              </div>
              <button type="submit" className="w-full bg-[#A493F7] text-black font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-white transition flex items-center justify-center gap-2">
                <UserPlus size={16} /> Add Department
              </button>
            </form>
          </div>

          <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden md:col-span-2">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900 text-xs uppercase text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Department Name</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-zinc-900/50 transition">
                    <td className="px-6 py-4 font-mono text-xs">{dept.id}</td>
                    <td className="px-6 py-4 font-bold text-white">{dept.name}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteDepartment(dept.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ROLE PERMISSIONS CONFIGURATION */}
      {subTab === 'permissions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left panel: list of roles & Add Role */}
          <div className="space-y-6">
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-mono uppercase text-[#A493F7] mb-4">Create New Role</h3>
              <form onSubmit={handleAddRole} className="space-y-3">
                <input
                  type="text"
                  placeholder="e.g. Chief Inspector"
                  required
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-[#A493F7] focus:outline-none focus:ring-1 focus:ring-[#A493F7]"
                />
                <button type="submit" className="w-full bg-[#A493F7] text-black font-bold text-xs font-mono uppercase tracking-wider py-2.5 rounded-lg hover:bg-white transition">
                  Create Role
                </button>
              </form>
            </div>

            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-4">
              <h3 className="text-xs font-mono text-zinc-400 uppercase mb-3 px-2">Role Registry</h3>
              <div className="space-y-1">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg font-mono transition flex items-center justify-between ${selectedRole === r
                        ? 'bg-purple-900/20 text-[#A493F7] border border-purple-500/20 font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                      }`}
                  >
                    <span>{r}</span>
                    {selectedRole === r && <Sliders size={12} className="text-[#A493F7]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Permissions checklist matrix */}
          <div className="md:col-span-2 bg-[#121214] border border-zinc-800 rounded-2xl p-6">
            <div className="border-b border-zinc-800 pb-4 mb-6">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block">Active Configuration Target</span>
              <h3 className="text-2xl font-sans font-bold text-white flex items-center gap-2 mt-1">
                <Key size={20} className="text-[#A493F7]" />
                <span>{selectedRole}</span>
              </h3>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-semibold text-zinc-200 mb-3 font-mono uppercase tracking-wider text-purple-400">Workspace Controls (Read, Edit & Upload)</h4>
                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-black/40">
                  <table className="w-full text-left text-xs font-mono text-zinc-400">
                    <thead className="bg-zinc-900/60 border-b border-zinc-850 text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">Page / Workspace</th>
                        <th className="px-4 py-3 text-center">Open & Read (Page Only)</th>
                        <th className="px-4 py-3 text-center">Open & Read (Page and Files)</th>
                        <th className="px-4 py-3 text-center">Edit / Author</th>
                        <th className="px-4 py-3 text-center">Upload Files</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {ALL_PAGES.map((p) => {
                        const canReadPageOnly = currentRolePerm.readPageOnlyPages ? currentRolePerm.readPageOnlyPages.includes(p.id) : false;
                        const canReadPageAndFiles = currentRolePerm.readPageAndFilesPages ? currentRolePerm.readPageAndFilesPages.includes(p.id) : false;
                        const canEdit = currentRolePerm.editPages ? currentRolePerm.editPages.includes(p.id) : false;
                        const canUpload = currentRolePerm.uploadPages ? currentRolePerm.uploadPages.includes(p.id) : false;

                        return (
                          <tr key={p.id} className="hover:bg-zinc-900/20">
                            <td className="px-4 py-3.5 font-sans font-medium text-white">{p.name}</td>

                            {/* Read Page Only Checkbox */}
                            <td className="px-4 py-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={canReadPageOnly}
                                onChange={() => handleTogglePermission('readPageOnly', p.id)}
                                disabled={selectedRole === 'SysAdmin'}
                                className="w-4 h-4 rounded border-zinc-800 text-purple-600 bg-zinc-900 focus:ring-[#A493F7] disabled:opacity-30"
                              />
                            </td>

                            {/* Read Page And Files Checkbox */}
                            <td className="px-4 py-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={canReadPageAndFiles}
                                onChange={() => handleTogglePermission('readPageAndFiles', p.id)}
                                disabled={selectedRole === 'SysAdmin'}
                                className="w-4 h-4 rounded border-zinc-800 text-purple-600 bg-zinc-900 focus:ring-[#A493F7] disabled:opacity-30"
                              />
                            </td>

                            {/* Edit Checkbox */}
                            <td className="px-4 py-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={canEdit}
                                onChange={() => handleTogglePermission('edit', p.id)}
                                disabled={selectedRole === 'SysAdmin'}
                                className="w-4 h-4 rounded border-zinc-800 text-purple-600 bg-zinc-900 focus:ring-[#A493F7] disabled:opacity-30"
                              />
                            </td>

                            {/* Upload Checkbox */}
                            <td className="px-4 py-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={canUpload}
                                onChange={() => handleTogglePermission('upload', p.id)}
                                disabled={selectedRole === 'SysAdmin'}
                                className="w-4 h-4 rounded border-zinc-800 text-purple-600 bg-zinc-900 focus:ring-[#A493F7] disabled:opacity-30"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedRole === 'SysAdmin' && (
                <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-xl text-xs text-[#A493F7] font-mono leading-relaxed">
                  🛡️ Note: The SysAdmin role has system-level absolute permissions which are immutable to prevent administrative lockout.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
