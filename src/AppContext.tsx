// RBAC context updates - forcing a git status change
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Department, DocCard, Checklist, StaticPage, Role, RolePermission, UploadedFile, WebsiteChangeLog } from './types';
import { defaultUsers, defaultDepartments, defaultPages, defaultCards, defaultChecklists, userPasswordHashes } from './data';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

interface AppState {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  pages: StaticPage[];
  cards: DocCard[];
  checklists: Checklist[];
  maintenanceMode: boolean;
  login: (username: string, passwordText: string) => Promise<boolean>;
  logout: () => void;
  setMaintenanceMode: (mode: boolean) => void;
  // CRUD Users
  addUser: (user: User) => void;
  deleteUser: (id: string) => void;
  updateUser: (user: User) => void;
  // CRUD Departments
  addDepartment: (dept: Department) => void;
  deleteDepartment: (id: string) => void;
  // Pages
  updatePageContent: (id: string, htmlContent: string) => void;
  togglePageReview: (id: string) => void;
  // Cards
  addCard: (card: DocCard) => void;
  updateCard: (card: DocCard) => void;
  deleteCard: (id: string) => void;
  toggleCardReview: (id: string) => void;
  // Checklists
  addChecklist: (checklist: Checklist) => void;
  updateChecklist: (checklist: Checklist) => void;
  deleteChecklist: (id: string) => void;
  // Roles & Permissions & File Uploads
  roles: string[];
  permissions: RolePermission[];
  addRole: (role: string) => void;
  updateRolePermissions: (roleName: string, readPageOnlyPages: string[], readPageAndFilesPages: string[], editPages: string[], uploadPages: string[]) => void;
  uploadedFiles: UploadedFile[];
  addUploadedFile: (file: UploadedFile) => void;
  deleteUploadedFile: (id: string) => void;
  // Logging
  changeLogs: WebsiteChangeLog[];
  clearChangeLogs: () => void;
  addLog: (action: string, details: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [cards, setCards] = useState<DocCard[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [changeLogs, setChangeLogs] = useState<WebsiteChangeLog[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    client.models.AppElement.update({
      id: 'global-settings',
      content: JSON.stringify({ maintenanceMode, theme: newTheme })
    }).catch(err => console.error('Error syncing theme:', err));
  };

  const seedDefaults = async () => {
    try {
      for (const page of defaultPages) {
        await client.models.AppElement.create({
          id: page.id,
          type: 'page',
          content: JSON.stringify({ title: page.title, htmlContent: page.htmlContent }),
          isChecked: page.needsReview,
          position: 0
        });
      }
      for (const card of defaultCards) {
        await client.models.AppElement.create({
          id: card.id,
          type: 'card',
          content: JSON.stringify({ title: card.title, content: card.content }),
          isChecked: card.needsReview,
          position: 0
        });
      }
      for (const checklist of defaultChecklists) {
        await client.models.AppElement.create({
          id: checklist.id,
          type: 'checklist',
          content: checklist.title,
          isChecked: false,
          position: 0
        });
        for (const item of checklist.items) {
          await client.models.AppElement.create({
            id: item.id,
            type: 'todo',
            content: JSON.stringify({ text: item.text, checklistId: checklist.id }),
            isChecked: item.completed,
            position: 0
          });
        }
      }
      for (const user of defaultUsers) {
        await client.models.AppElement.create({
          id: user.id,
          type: 'user',
          content: JSON.stringify(user),
          isChecked: false,
          position: 0
        });
      }
      for (const dept of defaultDepartments) {
        await client.models.AppElement.create({
          id: dept.id,
          type: 'department',
          content: JSON.stringify(dept),
          isChecked: false,
          position: 0
        });
      }
      await client.models.AppElement.create({
        id: 'global-roles',
        type: 'roles',
        content: JSON.stringify([
          'SysAdmin', 'District Representative', 'President', 'Assistant President',
          'Treasurer', 'Secretary', 'finance office', 'tax commissioners',
          'IT / service support', 'corporate board'
        ]),
        isChecked: false,
        position: 0
      });
      await client.models.AppElement.create({
        id: 'global-permissions',
        type: 'permissions',
        content: JSON.stringify([
          {
            role: 'SysAdmin',
            readPageOnlyPages: [],
            readPageAndFilesPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'],
            editPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'],
            uploadPages: ['bylaws', 'meeting-minutes', 'board-minutes', 'resources']
          },
          {
            role: 'IT / service support',
            readPageOnlyPages: [],
            readPageAndFilesPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'],
            editPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'],
            uploadPages: ['bylaws', 'meeting-minutes', 'board-minutes', 'resources']
          },
          {
            role: 'President',
            readPageOnlyPages: [],
            readPageAndFilesPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'],
            editPages: [],
            uploadPages: []
          },
          {
            role: 'District Representative',
            readPageOnlyPages: [],
            readPageAndFilesPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'],
            editPages: [],
            uploadPages: []
          }
        ]),
        isChecked: false,
        position: 0
      });
    } catch (err) {
      console.error('Error seeding defaults:', err);
    }
  };

  useEffect(() => {
    const sub = client.models.AppElement.observeQuery().subscribe({
      next: ({ items }) => {
        if (items.length === 0) {
          seedDefaults();
          return;
        }

        // Seed users if missing
        if (items.filter(item => item.type === 'user').length === 0) {
          console.log('Seeding missing users, departments, roles, and permissions...');
          const seedMissingAdminData = async () => {
            try {
              for (const user of defaultUsers) {
                await client.models.AppElement.create({ id: user.id, type: 'user', content: JSON.stringify(user), isChecked: false, position: 0 });
              }
              for (const dept of defaultDepartments) {
                await client.models.AppElement.create({ id: dept.id, type: 'department', content: JSON.stringify(dept), isChecked: false, position: 0 });
              }
              await client.models.AppElement.create({
                id: 'global-roles', type: 'roles', isChecked: false, position: 0,
                content: JSON.stringify(['SysAdmin', 'District Representative', 'President', 'Assistant President', 'Treasurer', 'Secretary', 'finance office', 'tax commissioners', 'IT / service support', 'corporate board'])
              });
              await client.models.AppElement.create({
                id: 'global-permissions', type: 'permissions', isChecked: false, position: 0,
                content: JSON.stringify([
                  { role: 'SysAdmin', readPageOnlyPages: [], readPageAndFilesPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'], editPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'], uploadPages: ['bylaws', 'meeting-minutes', 'board-minutes', 'resources'] },
                  { role: 'IT / service support', readPageOnlyPages: [], readPageAndFilesPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'], editPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'], uploadPages: ['bylaws', 'meeting-minutes', 'board-minutes', 'resources'] },
                  { role: 'President', readPageOnlyPages: [], readPageAndFilesPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'], editPages: [], uploadPages: [] },
                  { role: 'District Representative', readPageOnlyPages: [], readPageAndFilesPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'], editPages: [], uploadPages: [] }
                ])
              });
            } catch (e) {
              console.error('Error seeding admin data:', e);
            }
          };
          seedMissingAdminData();
        }

        const dbPages = items
          .filter(item => item.type === 'page')
          .map(item => {
            try {
              const contentObj = JSON.parse(item.content || '{}');
              return {
                id: item.id,
                title: contentObj.title || '',
                htmlContent: contentObj.htmlContent || '',
                needsReview: !!item.isChecked
              };
            } catch (e) {
              return { id: item.id, title: '', htmlContent: '', needsReview: false };
            }
          });

        const existingPageIds = new Set(dbPages.map(p => p.id));
        const missingPages = defaultPages.filter(p => !existingPageIds.has(p.id));
        
        if (missingPages.length > 0) {
          missingPages.forEach(async (page) => {
            try {
              await client.models.AppElement.create({
                id: page.id,
                type: 'page',
                content: JSON.stringify({ title: page.title, htmlContent: page.htmlContent }),
                isChecked: page.needsReview,
                position: 0
              });
            } catch (err) {
              console.error('Error seeding missing page:', err);
            }
          });
          dbPages.push(...missingPages);
        }

        setPages(dbPages);

        const dbCards = items
          .filter(item => item.type === 'card')
          .map(item => {
            try {
              const contentObj = JSON.parse(item.content || '{}');
              return {
                id: item.id,
                title: contentObj.title || '',
                content: contentObj.content || '',
                needsReview: !!item.isChecked
              };
            } catch (e) {
              return { id: item.id, title: '', content: '', needsReview: false };
            }
          });
        setCards(dbCards);

        const dbChecklistHeaders = items.filter(item => item.type === 'checklist');
        const dbTodos = items.filter(item => item.type === 'todo');

        const dbChecklists = dbChecklistHeaders.map(header => {
          const itemsForChecklist = dbTodos
            .map(todo => {
              try {
                const contentObj = JSON.parse(todo.content || '{}');
                return {
                  id: todo.id,
                  text: contentObj.text || '',
                  completed: !!todo.isChecked,
                  checklistId: contentObj.checklistId || ''
                };
              } catch (e) {
                return null;
              }
            })
            .filter((item): item is NonNullable<typeof item> => item !== null && item.checklistId === header.id);

          return {
            id: header.id,
            title: header.content || '',
            items: itemsForChecklist
          };
        });
        setChecklists(dbChecklists);

        // Parse Users
        const dbUsers = items
          .filter(item => item.type === 'user')
          .map(item => {
            try { return JSON.parse(item.content || '{}'); } catch (e) { return null; }
          })
          .filter(Boolean);
        if (dbUsers.length > 0) setUsers(dbUsers);

        // Parse Departments
        const dbDepts = items
          .filter(item => item.type === 'department')
          .map(item => {
            try { return JSON.parse(item.content || '{}'); } catch (e) { return null; }
          })
          .filter(Boolean);
        if (dbDepts.length > 0) setDepartments(dbDepts);

        // Parse Global Roles
        const dbRoles = items.find(item => item.type === 'roles');
        if (dbRoles) {
          try { setRoles(JSON.parse(dbRoles.content || '[]')); } catch (e) { }
        }

        // Parse Global Permissions
        const dbPermissions = items.find(item => item.type === 'permissions');
        if (dbPermissions) {
          try {
            const parsed = JSON.parse(dbPermissions.content || '[]');
            const migrated = parsed.map((p: any) => ({
              ...p,
              readPageOnlyPages: p.readPageOnlyPages || [],
              readPageAndFilesPages: p.readPageAndFilesPages || p.readPages || [],
            }));
            setPermissions(migrated);
          } catch (e) { }
        }

        // Parse Global Settings
        const dbSettings = items.find(item => item.type === 'settings');
        if (dbSettings) {
          try {
            const settings = JSON.parse(dbSettings.content || '{}');
            if (settings.theme) setTheme(settings.theme);
            if (typeof settings.maintenanceMode === 'boolean') setMaintenanceMode(settings.maintenanceMode);
          } catch (e) { }
        }

        // Parse Uploaded Files
        const dbFiles = items
          .filter(item => item.type === 'uploadedFile')
          .map(item => {
            try { return JSON.parse(item.content || '{}'); } catch (e) { return null; }
          })
          .filter(Boolean);
        setUploadedFiles(dbFiles);

        // Parse Change Logs
        const dbLogs = items
          .filter(item => item.type === 'changeLog')
          .map(item => {
            try { return JSON.parse(item.content || '{}'); } catch (e) { return null; }
          })
          .filter(Boolean)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setChangeLogs(dbLogs);
      },
      error: (err) => {
        console.error('Amplify observeQuery error:', err);
      }
    });

    return () => sub.unsubscribe();
  }, []);

  const addLog = (action: string, details: string) => {
    const newLog: WebsiteChangeLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'system',
      username: currentUser?.username || 'System',
      userRole: currentUser?.role || 'System',
      action,
      details,
      type: currentUser?.role === 'SysAdmin' ? 'admin' : 'user'
    };
    setChangeLogs(prev => [newLog, ...prev]);
    client.models.AppElement.create({
      id: newLog.id,
      type: 'changeLog',
      content: JSON.stringify(newLog),
      isChecked: false,
      position: 0
    }).catch(err => console.error('Error creating change log:', err));
  };

  const clearChangeLogs = () => {
    changeLogs.forEach(log => {
      client.models.AppElement.delete({ id: log.id }).catch(() => { });
    });
    setChangeLogs([]);
  };

  const sha256 = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const login = async (username: string, passwordText: string) => {
    const lowerUsername = username.toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === lowerUsername);
    if (user) {
      const hash = await sha256(passwordText);
      const expectedHash = user.passwordHash || userPasswordHashes[lowerUsername];
      if (expectedHash && hash === expectedHash) {
        setCurrentUser(user);
        return true;
      }
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const addUser = (user: User) => {
    setUsers([...users, user]);
    client.models.AppElement.create({
      id: user.id,
      type: 'user',
      content: JSON.stringify(user),
      isChecked: false,
      position: 0
    }).catch(err => console.error('Error creating user:', err));
    addLog('Create User', `Created user "${user.username}" (${user.name}) with role "${user.role}"`);
  };

  const deleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    setUsers(users.filter(u => u.id !== id));
    client.models.AppElement.delete({ id }).catch(err => console.error('Error deleting user:', err));
    if (user) {
      addLog('Delete User', `Deleted user "${user.username}" (${user.name})`);
    }
  };

  const updateUser = (updatedUser: User) => {
    const prevUser = users.find(u => u.id === updatedUser.id);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    client.models.AppElement.update({
      id: updatedUser.id,
      content: JSON.stringify(updatedUser)
    }).catch(err => console.error('Error updating user:', err));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    if (prevUser) {
      const changes: string[] = [];
      if (prevUser.name !== updatedUser.name) changes.push(`name to "${updatedUser.name}"`);
      if (prevUser.role !== updatedUser.role) changes.push(`role to "${updatedUser.role}"`);
      if (prevUser.departmentId !== updatedUser.departmentId) {
        const oldDept = departments.find(d => d.id === prevUser.departmentId)?.name || prevUser.departmentId;
        const newDept = departments.find(d => d.id === updatedUser.departmentId)?.name || updatedUser.departmentId;
        changes.push(`department to "${newDept}"`);
      }
      addLog('Update User', `Updated user "${updatedUser.username}": ${changes.join(', ') || 'saved without visual updates'}`);
    }
  };

  const addDepartment = (dept: Department) => {
    setDepartments([...departments, dept]);
    client.models.AppElement.create({
      id: dept.id,
      type: 'department',
      content: JSON.stringify(dept),
      isChecked: false,
      position: 0
    }).catch(err => console.error('Error creating department:', err));
    addLog('Create Department', `Created department: ${dept.name}`);
  };

  const deleteDepartment = (id: string) => {
    const dept = departments.find(d => d.id === id);
    setDepartments(departments.filter(d => d.id !== id));
    client.models.AppElement.delete({ id }).catch(err => console.error('Error deleting department:', err));
    if (dept) {
      addLog('Delete Department', `Deleted department: ${dept.name}`);
    }
  };

  const updatePageContent = (id: string, htmlContent: string) => {
    const page = pages.find(p => p.id === id);
    setPages(pages.map(p => p.id === id ? { ...p, htmlContent } : p));
    if (page) {
      client.models.AppElement.update({
        id,
        content: JSON.stringify({ title: page.title, htmlContent })
      }).catch(err => console.error('Error updating page content:', err));
      addLog('Edit Document Page', `Updated content for page: ${page.title}`);
    }
  };

  const togglePageReview = (id: string) => {
    const page = pages.find(p => p.id === id);
    const newStatus = page ? !page.needsReview : false;
    setPages(pages.map(p => p.id === id ? { ...p, needsReview: !p.needsReview } : p));
    if (page) {
      client.models.AppElement.update({
        id,
        isChecked: newStatus
      }).catch(err => console.error('Error toggling page review:', err));
      addLog('Toggle Document Review', `Toggled review flag for "${page.title}" to ${newStatus ? 'Needs Review' : 'Reviewed'}`);
    }
  };

  const addCard = (card: DocCard) => {
    setCards([...cards, card]);
    client.models.AppElement.create({
      id: card.id,
      type: 'card',
      content: JSON.stringify({ title: card.title, content: card.content }),
      isChecked: card.needsReview,
      position: 0
    }).catch(err => console.error('Error creating card:', err));
    addLog('Create Document Card', `Created card: "${card.title}"`);
  };

  const updateCard = (card: DocCard) => {
    const prevCard = cards.find(c => c.id === card.id);
    setCards(cards.map(c => c.id === card.id ? card : c));
    if (prevCard) {
      client.models.AppElement.update({
        id: card.id,
        content: JSON.stringify({ title: card.title, content: card.content }),
        isChecked: card.needsReview
      }).catch(err => console.error('Error updating card:', err));
      const changes: string[] = [];
      if (prevCard.title !== card.title) changes.push(`title to "${card.title}"`);
      if (prevCard.content !== card.content) changes.push(`content modified`);
      addLog('Update Document Card', `Updated card "${card.title}": ${changes.join(', ') || 'saved without changes'}`);
    }
  };

  const deleteCard = (id: string) => {
    const card = cards.find(c => c.id === id);
    setCards(cards.filter(c => c.id !== id));
    if (card) {
      client.models.AppElement.delete({ id }).catch(err => console.error('Error deleting card:', err));
      addLog('Delete Document Card', `Deleted card: "${card.title}"`);
    }
  };

  const toggleCardReview = (id: string) => {
    const card = cards.find(c => c.id === id);
    const newStatus = card ? !card.needsReview : false;
    setCards(cards.map(c => c.id === id ? { ...c, needsReview: !c.needsReview } : c));
    if (card) {
      client.models.AppElement.update({
        id,
        isChecked: newStatus
      }).catch(err => console.error('Error toggling card review:', err));
      addLog('Toggle Card Review', `Toggled review flag for card "${card.title}" to ${newStatus ? 'Needs Review' : 'Reviewed'}`);
    }
  };

  const addChecklist = async (checklist: Checklist) => {
    setChecklists([...checklists, checklist]);
    try {
      await client.models.AppElement.create({
        id: checklist.id,
        type: 'checklist',
        content: checklist.title,
        isChecked: false,
        position: 0
      });
      for (const item of checklist.items) {
        await client.models.AppElement.create({
          id: item.id,
          type: 'todo',
          content: JSON.stringify({ text: item.text, checklistId: checklist.id }),
          isChecked: item.completed,
          position: 0
        });
      }
      addLog('Create Checklist', `Created checklist: "${checklist.title}"`);
    } catch (err) {
      console.error('Error creating checklist:', err);
    }
  };

  const updateChecklist = async (checklist: Checklist) => {
    const prevChecklist = checklists.find(c => c.id === checklist.id);
    setChecklists(checklists.map(c => c.id === checklist.id ? checklist : c));
    if (prevChecklist) {
      try {
        await client.models.AppElement.update({
          id: checklist.id,
          content: checklist.title
        });

        let itemChangeMsg = '';

        // Check for deleted items
        for (const prevItem of prevChecklist.items) {
          const stillExists = checklist.items.some(i => i.id === prevItem.id);
          if (!stillExists) {
            await client.models.AppElement.delete({ id: prevItem.id });
          }
        }

        // Add or update items
        for (const item of checklist.items) {
          const prevItem = prevChecklist.items.find(pi => pi.id === item.id);
          if (prevItem) {
            await client.models.AppElement.update({
              id: item.id,
              isChecked: item.completed,
              content: JSON.stringify({ text: item.text, checklistId: checklist.id })
            });
            if (prevItem.completed !== item.completed) {
              itemChangeMsg = ` - Marked item "${item.text}" as ${item.completed ? 'completed' : 'incomplete'}`;
            }
          } else {
            // New item! Use create instead of update
            await client.models.AppElement.create({
              id: item.id,
              type: 'todo',
              isChecked: item.completed,
              content: JSON.stringify({ text: item.text, checklistId: checklist.id }),
              position: 0
            });
            itemChangeMsg = ` - Added new item "${item.text}"`;
          }
        }
        addLog('Update Checklist', `Updated checklist "${checklist.title}"${itemChangeMsg}`);
      } catch (err) {
        console.error('Error updating checklist:', err);
      }
    }
  };

  const deleteChecklist = async (id: string) => {
    const checklist = checklists.find(c => c.id === id);
    setChecklists(checklists.filter(c => c.id !== id));
    if (checklist) {
      try {
        await client.models.AppElement.delete({ id });
        for (const item of checklist.items) {
          await client.models.AppElement.delete({ id: item.id });
        }
        addLog('Delete Checklist', `Deleted checklist: "${checklist.title}"`);
      } catch (err) {
        console.error('Error deleting checklist:', err);
      }
    }
  };

  const addRole = (role: string) => {
    if (!roles.includes(role)) {
      const newRoles = [...roles, role];
      setRoles(newRoles);
      client.models.AppElement.update({
        id: 'global-roles',
        content: JSON.stringify(newRoles)
      }).catch(err => console.error('Error updating roles:', err));

      const newPerms = [...permissions, {
        role,
        readPageOnlyPages: [],
        readPageAndFilesPages: ['home', 'mindmap', 'federal', 'hub', 'bylaws', 'meeting-minutes', 'board-minutes', 'resources'],
        editPages: [],
        uploadPages: []
      }];
      setPermissions(newPerms);
      client.models.AppElement.update({
        id: 'global-permissions',
        content: JSON.stringify(newPerms)
      }).catch(err => console.error('Error updating permissions:', err));

      addLog('Create Role', `Created new role: "${role}"`);
    }
  };

  const updateRolePermissions = (roleName: string, readPageOnlyPages: string[], readPageAndFilesPages: string[], editPages: string[], uploadPages: string[]) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.role === roleName);
      const newPerms = existing
        ? prev.map(p => p.role === roleName ? { ...p, readPageOnlyPages, readPageAndFilesPages, editPages, uploadPages } : p)
        : [...prev, { role: roleName, readPageOnlyPages, readPageAndFilesPages, editPages, uploadPages }];

      client.models.AppElement.update({
        id: 'global-permissions',
        content: JSON.stringify(newPerms)
      }).catch(err => console.error('Error updating permissions:', err));

      return newPerms;
    });
    addLog('Update Role Permissions', `Updated resource accessibility for role: "${roleName}"`);
  };

  const addUploadedFile = (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file]);
    client.models.AppElement.create({
      id: file.id,
      type: 'uploadedFile',
      content: JSON.stringify(file),
      isChecked: false,
      position: 0
    }).catch(err => console.error('Error creating uploaded file:', err));
    const pageName = pages.find(p => p.id === file.pageId)?.title || file.pageId;
    addLog('Upload File', `Uploaded file "${file.name}" (${file.size}) to "${pageName}"`);
  };

  const deleteUploadedFile = (id: string) => {
    const file = uploadedFiles.find(f => f.id === id);
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    client.models.AppElement.delete({ id }).catch(err => console.error('Error deleting uploaded file:', err));
    if (file) {
      const pageName = pages.find(p => p.id === file.pageId)?.title || file.pageId;
      addLog('Delete File', `Deleted file "${file.name}" from "${pageName}"`);
    }
  };

  const updateMaintenanceMode = (mode: boolean) => {
    setMaintenanceMode(mode);
    client.models.AppElement.update({
      id: 'global-settings',
      content: JSON.stringify({ maintenanceMode: mode, theme })
    }).catch(err => console.error('Error syncing maintenance mode:', err));
    addLog('Toggle Maintenance Mode', `Set global maintenance mode to ${mode ? 'ENABLED' : 'DISABLED'}`);
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, departments, pages, cards, checklists, maintenanceMode,
      login, logout, setMaintenanceMode: updateMaintenanceMode,
      addUser, deleteUser, updateUser, addDepartment, deleteDepartment,
      updatePageContent, togglePageReview,
      addCard, updateCard, deleteCard, toggleCardReview,
      addChecklist, updateChecklist, deleteChecklist,
      roles, permissions, addRole, updateRolePermissions,
      uploadedFiles, addUploadedFile, deleteUploadedFile,
      changeLogs, clearChangeLogs, addLog,
      theme, toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
