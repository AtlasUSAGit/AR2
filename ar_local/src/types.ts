export type Role = string;

export interface Department {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  departmentId: string;
  passwordHash?: string;
}

export interface DocCard {
  id: string;
  title: string;
  content: string;
  needsReview: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface StaticPage {
  id: string;
  title: string;
  htmlContent: string;
  needsReview: boolean;
}

export interface MindMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  width: number;
  height: number;
  description: string;
  shape: 'circle' | 'square' | 'diamond' | 'rounded-square';
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  color: string;
  arrowColor: string;
  label: string;
}

export interface NetworkDevice {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'degraded';
  load: number;
  ping: number;
}

export interface LogMessage {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface RolePermission {
  role: string;
  readPageOnlyPages: string[];
  readPageAndFilesPages: string[];
  editPages: string[];
  uploadPages: string[];
}

export interface UploadedFile {
  id: string;
  pageId: string;
  name: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  fileDataUrl?: string;
}

export interface WebsiteChangeLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  userRole: string;
  action: string;
  details: string;
  type: 'admin' | 'user';
}

