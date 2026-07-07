import React, { useEffect, useRef, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge, useNodesState, useEdgesState, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAppContext } from '../AppContext';

// Simple heuristic parser for the "page" or "entity" from log details
const extractPageOrEntity = (log: any) => {
  const details = log.details || '';
  const action = log.action || '';
  
  // E.g. Uploaded file "file.pdf" to "Document Hub"
  if (details.includes(' to "')) {
    const parts = details.split(' to "');
    return parts[parts.length - 1].replace('"', '');
  }
  // E.g. Updated content for page: Home
  if (details.includes('for page: ')) {
    return details.split('for page: ')[1].trim();
  }
  // E.g. Deleted file "file.pdf" from "Document Hub"
  if (details.includes(' from "')) {
    const parts = details.split(' from "');
    return parts[parts.length - 1].replace('"', '');
  }
  // E.g. Updated resource accessibility for role: "SysAdmin"
  if (details.includes('for role: "')) {
    return "Role: " + details.split('for role: "')[1].replace('"', '');
  }
  // E.g. Created new role: "Admin"
  if (details.includes('role: "')) {
    return "Role: " + details.split('role: "')[1].replace('"', '');
  }
  
  // Default to the action name as the category if no page found
  return action;
};

const EditableNode = ({ id, data }: any) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div 
        className="w-full h-full cursor-text" 
        onDoubleClick={() => data.onEdit && data.onEdit(id)}
      >
        {data.isEditing ? (
          <textarea
            autoFocus
            className="w-full h-full bg-transparent resize-none outline-none font-inherit text-inherit"
            defaultValue={data.label}
            onBlur={(e) => data.onLabelChange && data.onLabelChange(id, e.target.value)}
          />
        ) : (
          data.label
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

const nodeTypes = {
  editable: EditableNode
};

export default function AuditMap() {
  const { changeLogs, currentUser } = useAppContext();

  if (currentUser?.role !== 'SysAdmin') {
    return (
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
        <Shield className="text-red-500 mx-auto" size={48} />
        <h3 className="text-xl font-bold text-white">Access Denied</h3>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          You do not have administrative privileges to view the Audit Map.
        </p>
      </div>
    );
  }

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const initialized = useRef(false);

  const onLabelChange = useCallback((id: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: newLabel, isEditing: false } } : n))
    );
  }, [setNodes]);

  const onEdit = useCallback((id: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, isEditing: true } } : n))
    );
  }, [setNodes]);

  useEffect(() => {
    if (initialized.current || changeLogs.length === 0) return;
    initialized.current = true;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Root Node
    newNodes.push({
      id: 'root',
      type: 'editable',
      position: { x: 50, y: 300 },
      data: { label: 'Audit Logs', onEdit, onLabelChange },
      style: { background: '#A493F7', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '8px', padding: '10px 20px' }
    });

    // Group logs by Username -> Page/Entity -> Action Details
    const grouped: Record<string, Record<string, any[]>> = {};

    changeLogs.forEach(log => {
      const user = log.username || 'System';
      const page = extractPageOrEntity(log);
      
      if (!grouped[user]) grouped[user] = {};
      if (!grouped[user][page]) grouped[user][page] = [];
      
      grouped[user][page].push(log);
    });

    const userKeys = Object.keys(grouped);
    let userYOffset = 100;

    userKeys.forEach((user, userIndex) => {
      const userId = `user-${userIndex}`;
      newNodes.push({
        id: userId,
        type: 'editable',
        position: { x: 300, y: userYOffset },
        data: { label: user, onEdit, onLabelChange },
        style: { background: '#121214', color: 'white', border: '1px solid #3f3f46', borderRadius: '8px', padding: '10px' }
      });
      newEdges.push({
        id: `edge-root-${userId}`,
        source: 'root',
        target: userId,
        animated: true,
        style: { stroke: '#52525b' }
      });

      const pages = Object.keys(grouped[user]);
      let pageYOffset = userYOffset - (pages.length * 60) / 2;

      pages.forEach((page, pageIndex) => {
        const pageId = `page-${userIndex}-${pageIndex}`;
        newNodes.push({
          id: pageId,
          type: 'editable',
          position: { x: 600, y: pageYOffset },
          data: { label: page, onEdit, onLabelChange },
          style: { background: '#1e1b4b', color: '#c7d2fe', border: '1px solid #4f46e5', borderRadius: '8px', padding: '10px' }
        });
        newEdges.push({
          id: `edge-${userId}-${pageId}`,
          source: userId,
          target: pageId,
          animated: true,
          style: { stroke: '#4f46e5' }
        });

        const logs = grouped[user][page];
        // Only show last 5 logs per page to avoid massive clutter
        const recentLogs = logs.slice(0, 5);
        let logYOffset = pageYOffset - (recentLogs.length * 50) / 2;

        recentLogs.forEach((log, logIndex) => {
          const logNodeId = `log-${userIndex}-${pageIndex}-${logIndex}`;
          const dateStr = new Date(log.timestamp).toLocaleString();
          const logLabel = `${log.action}\n${dateStr}\n${log.details}`;

          newNodes.push({
            id: logNodeId,
            type: 'editable',
            position: { x: 900, y: logYOffset },
            data: { label: logLabel, onEdit, onLabelChange },
            style: { 
              background: 'black', 
              color: '#a1a1aa', 
              border: '1px solid #27272a', 
              borderRadius: '4px', 
              fontSize: '10px', 
              padding: '8px', 
              maxWidth: '280px',
              whiteSpace: 'pre-wrap'
            }
          });
          newEdges.push({
            id: `edge-${pageId}-${logNodeId}`,
            source: pageId,
            target: logNodeId,
            style: { stroke: '#27272a' }
          });
          // Increase offset for larger nodes
          logYOffset += 80;
        });

        pageYOffset += Math.max(160, recentLogs.length * 80);
      });

      userYOffset = Math.max(userYOffset + 200, pageYOffset + 50);
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [changeLogs, onEdit, onLabelChange, setNodes, setEdges]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white font-sans flex items-center gap-3">
            <Shield className="text-[#A493F7]" size={28} />
            <span>Audit Mapping Visualizer</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Visual record of user interactions across resources and pages.
          </p>
        </div>
      </div>

      <div className="w-full h-[70vh] border border-zinc-800 rounded-2xl overflow-hidden bg-[#0a0a0c]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#27272a" gap={16} />
          <Controls className="bg-zinc-900 border-zinc-800 fill-zinc-400" />
          <MiniMap
            nodeStrokeColor="#A493F7"
            nodeColor="#121214"
            maskColor="rgba(0,0,0,0.7)"
            className="bg-black border border-zinc-800"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
