import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  ReactFlowProvider,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WebsiteChangeLog } from '../types';
import { Shield, User, FileText, Activity } from 'lucide-react';

// Custom Node Components
const RootNode = ({ data }: any) => (
  <div className="bg-[#121214] border-2 border-[#A493F7] rounded-xl p-4 shadow-[0_0_20px_rgba(164,147,247,0.3)] flex flex-col items-center gap-2 w-48">
    <Shield size={32} className="text-[#A493F7]" />
    <div className="text-white font-bold text-lg text-center">{data.label}</div>
    <div className="text-zinc-400 text-xs text-center">{data.sublabel}</div>
    <Handle type="source" position={Position.Right} />
  </div>
);

const UserNode = ({ data }: any) => (
  <div className="bg-[#121214] border border-emerald-500/50 rounded-xl p-3 shadow-lg flex flex-col items-center gap-1 w-40">
    <Handle type="target" position={Position.Left} />
    <User size={24} className="text-emerald-400" />
    <div className="text-white font-semibold text-sm text-center truncate w-full" title={data.label}>{data.label}</div>
    <div className="text-emerald-500/80 text-[10px] font-mono text-center">{data.sublabel}</div>
    <Handle type="source" position={Position.Right} />
  </div>
);

const CategoryNode = ({ data }: any) => (
  <div className="bg-[#121214] border border-blue-500/50 rounded-xl p-3 shadow-lg flex flex-col items-center gap-1 w-40">
    <Handle type="target" position={Position.Left} />
    <FileText size={20} className="text-blue-400" />
    <div className="text-white font-semibold text-sm text-center">{data.label}</div>
    <div className="text-blue-500/80 text-[10px] font-mono text-center">{data.count} actions</div>
    <Handle type="source" position={Position.Right} />
  </div>
);

const ActionNode = ({ data }: any) => (
  <div className="bg-[#121214] border border-zinc-700 rounded-lg p-2 shadow-sm flex flex-col gap-1 max-w-xs min-w-[200px]">
    <Handle type="target" position={Position.Left} />
    <div className="flex items-center gap-2 border-b border-zinc-800 pb-1">
      <Activity size={14} className={data.type === 'admin' ? 'text-purple-400' : 'text-zinc-400'} />
      <span className="text-white font-medium text-xs truncate" title={data.action}>{data.action}</span>
    </div>
    <div className="text-zinc-400 text-[10px] leading-relaxed line-clamp-3" title={data.details}>
      {data.details}
    </div>
  </div>
);

const nodeTypes = {
  root: RootNode,
  user: UserNode,
  category: CategoryNode,
  action: ActionNode
};

interface AuditMindMapProps {
  logs: WebsiteChangeLog[];
}

function extractCategory(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes('card')) return 'Cards';
  if (lower.includes('page')) return 'Pages';
  if (lower.includes('user')) return 'Users';
  if (lower.includes('checklist')) return 'Checklists';
  if (lower.includes('department')) return 'Departments';
  if (lower.includes('role') || lower.includes('permission')) return 'Roles & Perms';
  if (lower.includes('file')) return 'Files';
  if (lower.includes('question')) return 'Q&A';
  if (lower.includes('video')) return 'Video Settings';
  if (lower.includes('maintenance')) return 'System Status';
  return 'General';
}

function AuditMindMapCanvas({ logs }: AuditMindMapProps) {
  const { nodes, edges } = useMemo(() => {
    const nds: Node[] = [];
    const eds: Edge[] = [];

    // Root Node
    nds.push({
      id: 'root',
      type: 'root',
      position: { x: 0, y: 0 },
      data: { label: 'Audit System', sublabel: `${logs.length} Total Logs` },
    });

    // Group logs by user -> category
    const usersMap = new Map<string, { role: string; categories: Map<string, WebsiteChangeLog[]> }>();

    logs.forEach(log => {
      if (!usersMap.has(log.username)) {
        usersMap.set(log.username, { role: log.userRole, categories: new Map() });
      }
      const userObj = usersMap.get(log.username)!;
      const category = extractCategory(log.action);

      if (!userObj.categories.has(category)) {
        userObj.categories.set(category, []);
      }
      userObj.categories.get(category)!.push(log);
    });

    const levelXOffsets = {
      root: 0,
      users: 350,
      categories: 700,
      actions: 1050
    };

    let userY = 0;
    
    // Limit total rendered nodes to prevent massive lag if logs are huge
    // For this mind map, we'll take top 10 recent unique actions across all categories per user just in case.
    
    Array.from(usersMap.entries()).forEach(([username, userObj], userIdx) => {
      const userId = `user-${username}`;
      const categoriesCount = userObj.categories.size;
      
      // Calculate average Y position for user based on its children
      let categoryStartY = userY;

      Array.from(userObj.categories.entries()).forEach(([category, catLogs], catIdx) => {
        const catId = `cat-${username}-${category}`;
        const safeLogs = catLogs.slice(0, 10); // Show max 10 actions per category to avoid clutter
        
        // Add Category Node
        nds.push({
          id: catId,
          type: 'category',
          position: { x: levelXOffsets.categories, y: categoryStartY + (catIdx * 200) },
          data: { label: category, count: catLogs.length }
        });

        // Edge User -> Category
        eds.push({
          id: `e-${userId}-${catId}`,
          source: userId,
          target: catId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#10B981', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' }
        });

        // Add Action Nodes
        safeLogs.forEach((log, logIdx) => {
          const actionId = `act-${log.id}`;
          nds.push({
            id: actionId,
            type: 'action',
            position: { x: levelXOffsets.actions, y: categoryStartY + (catIdx * 200) + (logIdx * 100) - ((safeLogs.length - 1) * 50) },
            data: { action: log.action, details: log.details, type: log.type }
          });

          // Edge Category -> Action
          eds.push({
            id: `e-${catId}-${actionId}`,
            source: catId,
            target: actionId,
            type: 'smoothstep',
            style: { stroke: '#3B82F6', strokeWidth: 1 },
          });
        });
      });

      const userCenterY = categoriesCount > 0 
        ? categoryStartY + ((categoriesCount - 1) * 200) / 2 
        : categoryStartY;

      // Add User Node
      nds.push({
        id: userId,
        type: 'user',
        position: { x: levelXOffsets.users, y: userCenterY },
        data: { label: username, sublabel: userObj.role }
      });

      // Edge Root -> User
      eds.push({
        id: `e-root-${userId}`,
        source: 'root',
        target: userId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#A493F7', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#A493F7' }
      });

      userY += Math.max(categoriesCount * 250, 200); // Step Y for next user
    });

    // Center root Y vertically based on total user height
    const rootNode = nds.find(n => n.id === 'root');
    if (rootNode) {
      rootNode.position.y = userY > 0 ? (userY - 200) / 2 : 0;
    }

    return { nodes: nds, edges: eds };
  }, [logs]);

  return (
    <div className="w-full h-full min-h-[600px] bg-[#0B0B0F] rounded-xl overflow-hidden relative border border-zinc-800">
      {logs.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-500 font-mono text-sm">
          No audit logs available for visualization.
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          colorMode="dark"
        >
          <Background color="#333" gap={24} size={1} />
          <Controls className="bg-zinc-900 border-zinc-800 fill-white text-white" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.type === 'root') return '#A493F7';
              if (n.type === 'user') return '#10B981';
              if (n.type === 'category') return '#3B82F6';
              return '#52525B';
            }}
            maskColor="rgba(0,0,0,0.7)"
            className="bg-black/80 border border-zinc-800"
          />
        </ReactFlow>
      )}
    </div>
  );
}

export default function AuditMindMap(props: AuditMindMapProps) {
  return (
    <ReactFlowProvider>
      <AuditMindMapCanvas {...props} />
    </ReactFlowProvider>
  );
}
