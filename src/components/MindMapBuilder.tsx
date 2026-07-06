import React, { useState, useEffect, useCallback, useRef } from 'react';
import '@xyflow/react/dist/style.css';
import { User } from '../types';
import Markdown from 'react-markdown';
import { Plus, Link2, FileText, Image as ImageIcon, Link as LinkIcon, Trash2, Settings, Group, Save, RefreshCw, Edit2, Check, X } from 'lucide-react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  Handle,
  Position,
  NodeResizer,
  ReactFlowProvider,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  MarkerType,
} from '@xyflow/react';

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, data, selected }: any) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: selected ? 4 : 2 }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {data?.isEditing ? (
            <input
              autoFocus
              className="bg-zinc-900 border border-zinc-700 text-xs text-white px-2 py-1 rounded outline-none"
              defaultValue={data.label}
              onBlur={(e) => data.onLabelChange(id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  data.onLabelChange(id, e.currentTarget.value);
                }
              }}
            />
          ) : (
            data?.label && (
              <div 
                className="bg-[#121216]/90 border border-zinc-700 px-2 py-1 rounded text-[10px] text-zinc-300 cursor-text shadow-sm"
                onDoubleClick={(e) => { e.stopPropagation(); data.onEdit(id); }}
              >
                {data.label}
              </div>
            )
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const edgeTypes = {
  custom: CustomEdge,
};

const TextNode = ({ data, selected }: any) => {
  return (
    <>
      <NodeResizer minWidth={100} minHeight={50} isVisible={selected} />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} id="left-target" style={{ left: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Left} id="left-source" style={{ left: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="target" position={Position.Right} id="right-target" style={{ right: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ right: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <div
        className="w-full h-full bg-black/80 border border-zinc-700 rounded-xl p-4 text-white overflow-y-auto overflow-x-hidden shadow-lg"
        style={{ borderColor: data.color || '#A493F7' }}
      >
        {data.isEditing ? (
          <textarea
            autoFocus
            className="w-full h-full bg-transparent resize-none outline-none font-mono text-sm"
            defaultValue={data.content}
            onBlur={(e) => data.onContentChange(data.id, e.target.value)}
          />
        ) : (
          <div
            className="markdown-body text-sm prose prose-invert"
            onDoubleClick={() => data.onEdit(data.id)}
          >
            <Markdown>{data.content || '*Double click to edit text*'}</Markdown>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

const NoteNode = ({ data, selected }: any) => {
  return (
    <>
      <NodeResizer minWidth={150} minHeight={100} isVisible={selected} />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} id="left-target" style={{ left: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Left} id="left-source" style={{ left: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="target" position={Position.Right} id="right-target" style={{ right: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ right: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <div
        className="w-full h-full bg-[#121216] border border-blue-500/50 rounded-xl flex flex-col shadow-lg overflow-hidden"
      >
        <div className="bg-blue-900/20 px-3 py-1.5 border-b border-blue-500/20 flex items-center gap-2">
          <FileText size={14} className="text-blue-400" />
          <span className="text-xs font-bold text-blue-300 truncate">System Note</span>
        </div>
        <div className="p-3 text-sm text-zinc-300 flex-1 overflow-auto bg-black/40">
          {data.isEditing ? (
            <textarea
              autoFocus
              className="w-full h-full bg-transparent resize-none outline-none font-sans text-sm"
              defaultValue={data.content}
              onBlur={(e) => data.onContentChange(data.id, e.target.value)}
            />
          ) : (
            <div className="h-full whitespace-pre-wrap cursor-text" onDoubleClick={() => data.onEdit(data.id)}>
              {data.content || 'Double click to link/edit note content...'}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

const MediaNode = ({ data, selected }: any) => {
  return (
    <>
      <NodeResizer minWidth={200} minHeight={150} isVisible={selected} />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} id="left-target" style={{ left: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Left} id="left-source" style={{ left: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="target" position={Position.Right} id="right-target" style={{ right: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ right: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <div
        className="w-full h-full bg-[#121216] border border-emerald-500/50 rounded-xl flex flex-col shadow-lg overflow-hidden"
      >
        <div className="bg-emerald-900/20 px-3 py-1.5 border-b border-emerald-500/20 flex items-center gap-2">
          <ImageIcon size={14} className="text-emerald-400" />
          <span className="text-xs font-bold text-emerald-300 truncate">Media Embed</span>
        </div>
        <div className="flex-1 bg-black/40 flex items-center justify-center overflow-hidden relative">
          {data.url ? (
            <img src={data.url} alt="Media" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-xs text-zinc-500 text-center p-4">
              {data.isEditing ? (
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Paste Image/Media URL..." 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 outline-none text-white"
                  onBlur={(e) => data.onUrlChange(data.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      data.onUrlChange(data.id, e.currentTarget.value);
                    }
                  }}
                />
              ) : (
                <span className="cursor-pointer" onDoubleClick={() => data.onEdit(data.id)}>Double click to paste Media URL</span>
              )}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

const WebNode = ({ data, selected }: any) => {
  return (
    <>
      <NodeResizer minWidth={300} minHeight={200} isVisible={selected} />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} id="left-target" style={{ left: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Left} id="left-source" style={{ left: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="target" position={Position.Right} id="right-target" style={{ right: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ right: '-4px', top: '50%', transform: 'translateY(-50%)' }} />
      <div
        className="w-full h-full bg-[#121216] border border-pink-500/50 rounded-xl flex flex-col shadow-lg overflow-hidden"
      >
        <div className="bg-pink-900/20 px-3 py-1.5 border-b border-pink-500/20 flex items-center gap-2">
          <LinkIcon size={14} className="text-pink-400" />
          <span className="text-xs font-bold text-pink-300 truncate">{data.url || 'Web Embed'}</span>
        </div>
        <div className="flex-1 bg-white relative">
          {data.url ? (
            <iframe src={data.url} className="w-full h-full border-none pointer-events-auto" title="Web Embed" sandbox="allow-scripts allow-same-origin" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4">
              {data.isEditing ? (
                 <input 
                 type="text" 
                 autoFocus
                 placeholder="https://..." 
                 className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 outline-none text-white text-sm"
                 onBlur={(e) => data.onUrlChange(data.id, e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     data.onUrlChange(data.id, e.currentTarget.value);
                   }
                 }}
               />
              ) : (
                <span className="text-xs text-zinc-500 cursor-pointer" onDoubleClick={() => data.onEdit(data.id)}>Double click to embed URL</span>
              )}
            </div>
          )}
        </div>
        {/* Overlay to allow dragging when iframe is active, unless we want to interact with iframe. React Flow handles this via pointer-events, but we need a drag handle if iframe takes whole space. The header acts as a drag handle implicitly if we don't block it. */}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

const GroupNode = ({ data, selected }: any) => {
  return (
    <>
      <NodeResizer minWidth={200} minHeight={200} isVisible={selected} />
      <div
        className="w-full h-full bg-white/5 border-2 border-dashed border-zinc-600 rounded-2xl relative"
        style={{ borderColor: data.color || '#52525B', backgroundColor: data.color ? `${data.color}10` : undefined }}
      >
        <div className="absolute top-0 left-0 -translate-y-full px-2 py-1">
          {data.isEditing ? (
             <input
             autoFocus
             className="bg-zinc-900 border border-zinc-700 text-xs text-white px-2 py-1 rounded outline-none"
             defaultValue={data.label}
             onBlur={(e) => data.onLabelChange(data.id, e.target.value)}
           />
          ) : (
            <span 
              className="text-xs font-bold text-zinc-400 bg-zinc-900/80 px-2 py-1 rounded-t-lg border-x border-t border-zinc-700/50 cursor-text"
              onDoubleClick={(e) => { e.stopPropagation(); data.onEdit(data.id); }}
            >
              {data.label || 'Group'}
            </span>
          )}
        </div>
      </div>
    </>
  );
};


const nodeTypes = {
  text: TextNode,
  note: NoteNode,
  media: MediaNode,
  weblink: WebNode,
  group: GroupNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'text',
    position: { x: 250, y: 150 },
    data: { content: '# Architecture\n\n- Infinite Canvas\n- Spatial Layout' },
    style: { width: 250, height: 180 },
  },
  {
    id: '2',
    type: 'note',
    position: { x: 600, y: 200 },
    data: { content: 'System Note: This links to our internal database records.' },
    style: { width: 220, height: 150 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true, data: { label: 'depends on' } },
];

export default function MindMapBuilderWrapper({ currentUser }: { currentUser?: User | null }) {
  return (
    <ReactFlowProvider>
      <MindMapBuilder currentUser={currentUser} />
    </ReactFlowProvider>
  );
}

function MindMapBuilder({ currentUser }: { currentUser?: User | null }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView, fitBounds } = useReactFlow();
  const [mapName, setMapName] = useState('Untitled Canvas');
  const [isPublic, setIsPublic] = useState(false);
  const [savedMaps, setSavedMaps] = useState<any[]>([]);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);

  // Management states
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [editingMapName, setEditingMapName] = useState('');
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ukbfc_canvas_maps');
    if (saved) {
      try {
        setSavedMaps(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveMap = () => {
    const mapId = currentMapId || Date.now().toString();
    const newMap = {
      id: mapId,
      name: mapName,
      isPublic,
      ownerId: currentUser?.id || 'anonymous',
      nodes,
      edges,
      updatedAt: Date.now(),
    };
    const updatedMaps = [...savedMaps.filter((m) => m.id !== mapId), newMap];
    setSavedMaps(updatedMaps);
    setCurrentMapId(mapId);
    localStorage.setItem('ukbfc_canvas_maps', JSON.stringify(updatedMaps));
    alert(`Canvas "${mapName}" saved successfully!`);
  };

  const handleNewMap = () => {
    setNodes([]);
    setEdges([]);
    setMapName(`New Canvas ${Date.now().toString().slice(-4)}`);
    setCurrentMapId(null);
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, type: 'custom', animated: true, style: { stroke: '#A493F7', strokeWidth: 2 } } as any, eds));
  }, [setEdges]);

  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setEditingEdge(edge);
  }, []);

  const onEdgeLabelChange = useCallback((id: string, label: string) => {
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === id) {
          return { ...e, data: { ...e.data, label, isEditing: false } };
        }
        return e;
      })
    );
  }, [setEdges]);

  const onEdgeEdit = useCallback((id: string) => {
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === id) {
          return { ...e, data: { ...e.data, isEditing: true } };
        }
        return e;
      })
    );
  }, [setEdges]);

  const addNode = useCallback((type: string) => {
    const newNode: Node = {
      id: Date.now().toString(),
      type,
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { content: '', url: '', label: 'New Group', isEditing: true },
      style: type === 'group' ? { width: 400, height: 300 } : { width: 250, height: 200 },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Handle double clicking directly on the canvas to create a new text node
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.detail === 2) {
        // Double click detected
        addNode('text');
      }
    },
    [addNode]
  );

  const onContentChange = useCallback((id: string, content: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, content, isEditing: false } };
        }
        return n;
      })
    );
  }, [setNodes]);

  const onUrlChange = useCallback((id: string, url: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, url, isEditing: false } };
        }
        return n;
      })
    );
  }, [setNodes]);

  const onLabelChange = useCallback((id: string, label: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, label, isEditing: false } };
        }
        return n;
      })
    );
  }, [setNodes]);

  const onEdit = useCallback((id: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, isEditing: true } };
        }
        return n;
      })
    );
  }, [setNodes]);

  // Pass callbacks to nodes via data
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onContentChange,
          onUrlChange,
          onLabelChange,
          onEdit,
        },
      }))
    );
  }, [onContentChange, onUrlChange, onLabelChange, onEdit, setNodes]); // Note: In a real app this would be optimized to not run constantly

  // Pass callbacks to edges via data
  useEffect(() => {
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        data: {
          ...e.data,
          onLabelChange: onEdgeLabelChange,
          onEdit: onEdgeEdit,
        },
      }))
    );
  }, [onEdgeLabelChange, onEdgeEdit, setEdges]);



  const groupSelected = () => {
    const selectedNodes = nodes.filter((n) => n.selected && n.type !== 'group');
    if (selectedNodes.length === 0) return;

    // Calculate bounds of selected nodes
    const xMin = Math.min(...selectedNodes.map((n) => n.position.x));
    const yMin = Math.min(...selectedNodes.map((n) => n.position.y));
    const xMax = Math.max(...selectedNodes.map((n) => n.position.x + (n.measured?.width || (n.style?.width as number) || 200)));
    const yMax = Math.max(...selectedNodes.map((n) => n.position.y + (n.measured?.height || (n.style?.height as number) || 150)));

    const padding = 40;
    
    const groupId = Date.now().toString();
    const groupNode: Node = {
      id: groupId,
      type: 'group',
      position: { x: xMin - padding, y: yMin - padding - 20 },
      style: { width: (xMax - xMin) + padding * 2, height: (yMax - yMin) + padding * 2 + 20 },
      data: { label: 'New Group', isEditing: true },
    };

    // Assign parent node to selected
    setNodes((nds) => [
      ...nds.map((n) => (n.selected && n.type !== 'group' ? { ...n, parentId: groupId, extent: 'parent' as const } : n)),
      groupNode,
    ]);
  };

  const deleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  };
  
  const autoResizeSelected = () => {
    // Basic auto-resize based on text length could go here, for now it's manual via NodeResizer
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === '!') { // Shift + 1
        e.preventDefault();
        fitView({ duration: 800 });
      } else if (e.shiftKey && e.key === '@') { // Shift + 2
        e.preventDefault();
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          fitView({ nodes: selectedNodes, duration: 800 });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fitView, nodes]);

  const setColor = (color: string) => {
    setNodes(nds => nds.map(n => n.selected ? { ...n, data: { ...n.data, color } } : n));
    setEdges(eds => eds.map(e => e.selected ? { ...e, style: { ...e.style, stroke: color } } : e));
  };

  const COLOR_PALETTE = ['#A493F7', '#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#EC4899'];

  return (
    <div id="mind-map-section" className="bg-[#0B0B0F] border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl flex flex-col h-[800px]">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 relative z-10 border-b border-zinc-800/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            <span className="text-xs font-mono text-[#A493F7] tracking-widest uppercase">INFINITE SPATIAL CANVAS</span>
          </div>
          <h3 className="text-2xl font-bold text-white font-sans mt-1 flex items-center gap-2">
            <input 
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-zinc-800 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Canvas Name"
            />
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            Space+Drag to pan. Ctrl+Scroll to zoom. Double click nodes to edit text/URLs. Drag edges between node handles.
          </p>
        </div>
        
        {/* Draw Tools Toolbar */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-end gap-2">
            <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="accent-purple-500" />
              Public Canvas
            </label>
            <button onClick={handleSaveMap} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg shadow font-semibold flex items-center gap-1">
              <Save size={14} /> Save
            </button>
             <button onClick={handleNewMap} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg shadow font-semibold">
              New
            </button>
            <select 
              className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1.5 outline-none"
              onChange={(e) => {
                if (e.target.value) {
                  const m = savedMaps.find(x => x.id === e.target.value);
                  if (m) {
                    setNodes(m.nodes || []);
                    setEdges(m.edges || []);
                    setMapName(m.name);
                    setIsPublic(m.isPublic);
                    setCurrentMapId(m.id);
                  }
                  e.target.value = ''; // reset selection
                }
              }}
            >
              <option value="">Load Canvas...</option>
              {savedMaps.filter(m => m.isPublic || m.ownerId === (currentUser?.id || 'anonymous')).map(m => (
                <option key={m.id} value={m.id}>{m.name} {m.isPublic ? '(Public)' : '(Private)'}</option>
              ))}
            </select>
            <button 
              onClick={() => setIsManageOpen(true)} 
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-[#A493F7] px-3 py-1.5 rounded-lg shadow font-semibold flex items-center gap-1"
              title="Manage saved canvases"
            >
              <Settings size={14} /> Manage
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 relative bg-black/60 rounded-xl overflow-hidden border border-zinc-800/80">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          panOnScroll={true}
          selectionOnDrag={true}
          panOnDrag={[1, 2]} // Middle and Right mouse buttons pan, or space+drag (built into RF)
          minZoom={0.1}
          maxZoom={4}
          className="bg-[#0f0f13]"
          colorMode="dark"
        >
          <Background color="#333" gap={24} size={1} />
          <Controls className="bg-zinc-900 border-zinc-800 fill-white text-white" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.type === 'note') return '#3B82F6';
              if (n.type === 'media') return '#10B981';
              if (n.type === 'weblink') return '#EC4899';
              if (n.type === 'group') return 'transparent';
              return '#A493F7';
            }}
            maskColor="rgba(0,0,0,0.7)"
            className="bg-black/80 border border-zinc-800"
          />

          <Panel position="top-center" className="flex flex-col gap-2 bg-zinc-900/90 p-2 rounded-xl border border-zinc-800 backdrop-blur shadow-xl">
            <div className="flex items-center gap-2">
              <button onClick={() => addNode('text')} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg text-xs font-semibold">
                <FileText size={14} /> Text Card
              </button>
              <button onClick={() => addNode('note')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg text-xs font-semibold">
                <FileText size={14} /> Sys Note
              </button>
              <button onClick={() => addNode('media')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg text-xs font-semibold">
                <ImageIcon size={14} /> Media Embed
              </button>
              <button onClick={() => addNode('weblink')} className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 rounded-lg text-xs font-semibold">
                <LinkIcon size={14} /> Web Link
              </button>
              <div className="w-px h-6 bg-zinc-700 mx-1"></div>
              <button onClick={groupSelected} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white rounded-lg text-xs font-semibold">
                <Group size={14} /> Group Selected
              </button>
              <button onClick={deleteSelected} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-semibold">
                <Trash2 size={14} /> Delete
              </button>
            </div>
            <div className="flex items-center gap-2 justify-center border-t border-zinc-800 pt-2">
              <span className="text-xs text-zinc-400">Color:</span>
              {COLOR_PALETTE.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition cursor-pointer"
                  style={{ backgroundColor: c }}
                  title={`Set Color ${c}`}
                />
              ))}
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {isManageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f13] border border-zinc-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Manage Saved Canvases</h3>
            <p className="text-xs text-zinc-400 mb-4">Rename, delete, or load your mind map canvases.</p>
            
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {savedMaps.filter(m => m.isPublic || m.ownerId === (currentUser?.id || 'anonymous')).length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-sm">No saved canvases found.</div>
              ) : (
                savedMaps.filter(m => m.isPublic || m.ownerId === (currentUser?.id || 'anonymous')).map(m => {
                  const isEditingThis = editingMapId === m.id;
                  return (
                    <div key={m.id} className="flex items-center justify-between gap-3 p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl hover:bg-zinc-900 transition">
                      <div className="flex-1">
                        {isEditingThis ? (
                          <input
                            type="text"
                            value={editingMapName}
                            onChange={(e) => setEditingMapName(e.target.value)}
                            className="bg-black border border-zinc-700 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:border-purple-500 font-medium"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (editingMapName.trim()) {
                                  const updated = savedMaps.map(sm => sm.id === m.id ? { ...sm, name: editingMapName } : sm);
                                  setSavedMaps(updated);
                                  localStorage.setItem('ukbfc_canvas_maps', JSON.stringify(updated));
                                  if (currentMapId === m.id) {
                                    setMapName(editingMapName);
                                  }
                                  setEditingMapId(null);
                                }
                              }
                            }}
                          />
                        ) : (
                          <span className="font-semibold text-zinc-200 text-sm">
                            {m.name} <span className="text-[10px] text-zinc-500 font-normal">({m.isPublic ? 'Public' : 'Private'})</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isEditingThis ? (
                          <>
                            <button
                              onClick={() => {
                                if (editingMapName.trim()) {
                                  const updated = savedMaps.map(sm => sm.id === m.id ? { ...sm, name: editingMapName } : sm);
                                  setSavedMaps(updated);
                                  localStorage.setItem('ukbfc_canvas_maps', JSON.stringify(updated));
                                  if (currentMapId === m.id) {
                                    setMapName(editingMapName);
                                  }
                                  setEditingMapId(null);
                                }
                              }}
                              className="text-emerald-400 hover:text-emerald-300 p-1.5 rounded-lg hover:bg-emerald-500/10 transition"
                              title="Save Name"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingMapId(null)}
                              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-700/20 transition"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingMapId(m.id);
                                setEditingMapName(m.name);
                              }}
                              className="text-[#A493F7] hover:text-purple-300 p-1.5 rounded-lg hover:bg-[#A493F7]/10 transition"
                              title="Rename Canvas"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setNodes(m.nodes || []);
                                setEdges(m.edges || []);
                                setMapName(m.name);
                                setIsPublic(m.isPublic);
                                setCurrentMapId(m.id);
                                setIsManageOpen(false);
                              }}
                              className="text-zinc-300 hover:text-white px-2.5 py-1 bg-zinc-800 rounded text-xs transition font-semibold"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${m.name}"?`)) {
                                  const updated = savedMaps.filter(sm => sm.id !== m.id);
                                  setSavedMaps(updated);
                                  localStorage.setItem('ukbfc_canvas_maps', JSON.stringify(updated));
                                  if (currentMapId === m.id) {
                                    setCurrentMapId(null);
                                  }
                                }
                              }}
                              className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition"
                              title="Delete Canvas"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4 mt-4">
              <button
                onClick={() => setIsManageOpen(false)}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editingEdge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f13] border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Edit Line Settings</h3>
            <p className="text-xs text-zinc-400 mb-4">Customize the connector line's appearance, flow, and direction.</p>
            
            <div className="space-y-4">
              {/* Flow Animation Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-300 font-medium">Flow Animation</label>
                <input 
                  type="checkbox" 
                  checked={!!editingEdge.animated} 
                  onChange={(e) => {
                    const animated = e.target.checked;
                    setEdges(eds => eds.map(edge => edge.id === editingEdge.id ? { ...edge, animated } : edge));
                    setEditingEdge(prev => prev ? { ...prev, animated } : null);
                  }}
                  className="accent-purple-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Arrow End Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-300 font-medium">Add Arrowhead</label>
                <input 
                  type="checkbox" 
                  checked={!!editingEdge.markerEnd} 
                  onChange={(e) => {
                    const hasArrow = e.target.checked;
                    const strokeColor = (editingEdge.style as any)?.stroke || '#A493F7';
                    const markerEnd = hasArrow ? { type: MarkerType.ArrowClosed, color: strokeColor } : undefined;
                    setEdges(eds => eds.map(edge => edge.id === editingEdge.id ? { ...edge, markerEnd } : edge));
                    setEditingEdge(prev => prev ? { ...prev, markerEnd } : null);
                  }}
                  className="accent-purple-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Reverse Flow Direction */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-300 font-medium">Flow Direction</label>
                <button
                  onClick={() => {
                    setEdges(eds => eds.map(edge => {
                      if (edge.id === editingEdge.id) {
                        const reversed = {
                          ...edge,
                          source: edge.target,
                          target: edge.source,
                        };
                        setEditingEdge(reversed);
                        return reversed;
                      }
                      return edge;
                    }));
                  }}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-purple-300 px-3 py-1.5 rounded-lg border border-zinc-700 transition font-semibold"
                >
                  Reverse Direction
                </button>
              </div>

              {/* Color Selector */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <span className="text-xs text-zinc-400">Line Color:</span>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map(c => {
                    const currentStroke = (editingEdge.style as any)?.stroke || '#A493F7';
                    const isSelected = currentStroke.toLowerCase() === c.toLowerCase();
                    return (
                      <button
                        key={c}
                        onClick={() => {
                          const updatedStyle = { ...(editingEdge.style || {}), stroke: c };
                          const updatedMarker = editingEdge.markerEnd ? { ...(editingEdge.markerEnd as any), color: c } : undefined;
                          setEdges(eds => eds.map(edge => edge.id === editingEdge.id ? { ...edge, style: updatedStyle, markerEnd: updatedMarker } : edge));
                          setEditingEdge(prev => prev ? { ...prev, style: updatedStyle, markerEnd: updatedMarker } : null);
                        }}
                        className={`w-6 h-6 rounded-full border transition cursor-pointer ${isSelected ? 'border-white scale-110' : 'border-white/10 hover:scale-105'}`}
                        style={{ backgroundColor: c }}
                        title={`Select Color ${c}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4 mt-6">
              <button
                onClick={() => setEditingEdge(null)}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
