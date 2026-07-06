import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../AppContext';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UploadCloud, 
  Check, 
  HelpCircle, 
  File, 
  Sparkles, 
  ArrowRight, 
  Maximize2, 
  Info,
  Trash2,
  Plus,
  Flag,
  X
} from 'lucide-react';
import { DocCard, Checklist } from '../types';

interface CardItemProps {
  card: DocCard;
  isSysAdmin: boolean;
  updateCard: (card: DocCard) => void;
  deleteCard: (id: string) => void;
  toggleCardReview: (id: string) => void;
}

const CardItem = ({ card, isSysAdmin, updateCard, deleteCard, toggleCardReview }: CardItemProps) => {
  const [title, setTitle] = useState(card.title);
  const [content, setContent] = useState(card.content);

  useEffect(() => {
    setTitle(card.title);
  }, [card.title]);

  useEffect(() => {
    setContent(card.content);
  }, [card.content]);

  const handleBlur = () => {
    if (title !== card.title || content !== card.content) {
      updateCard({ ...card, title, content });
    }
  };

  return (
    <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
      {card.needsReview && (
        <div className="absolute top-0 right-0 bg-red-500/10 border-l border-b border-red-500/30 px-3 py-1 rounded-bl-xl flex items-center gap-1">
          <Flag size={12} className="text-red-400" />
          <span className="text-[10px] font-mono text-red-400 font-bold uppercase">Needs Review</span>
        </div>
      )}
      {isSysAdmin ? (
        <div className="space-y-3 pt-2">
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            onBlur={handleBlur}
            className="w-full bg-transparent font-bold text-white text-lg focus:outline-none" 
          />
          <textarea 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            onBlur={handleBlur}
            className="w-full bg-transparent text-sm text-zinc-400 focus:outline-none min-h-[60px]" 
          />
          <div className="flex gap-2 pt-2">
            <button onClick={() => toggleCardReview(card.id)} className="text-xs font-mono text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded">Flag Review</button>
            <button onClick={() => deleteCard(card.id)} className="text-xs font-mono text-zinc-500 hover:text-red-400 px-2 py-1 rounded">Delete</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 pt-2">
          <h4 className="font-bold text-white text-lg">{card.title}</h4>
          <p className="text-sm text-zinc-400">{card.content}</p>
        </div>
      )}
    </div>
  );
};

interface ChecklistItemProps {
  key?: string | number;
  checklist: Checklist;
  isSysAdmin: boolean;
  isReadOnly: boolean;
  updateChecklist: (checklist: Checklist) => void;
  deleteChecklist: (id: string) => void;
}

const ChecklistItem = ({ checklist, isSysAdmin, isReadOnly, updateChecklist, deleteChecklist }: ChecklistItemProps) => {
  const [title, setTitle] = useState(checklist.title);

  useEffect(() => {
    setTitle(checklist.title);
  }, [checklist.title]);

  const handleTitleBlur = () => {
    if (title !== checklist.title) {
      updateChecklist({ ...checklist, title });
    }
  };

  return (
    <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        {isSysAdmin ? (
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            onBlur={handleTitleBlur}
            className="bg-transparent font-bold text-white text-lg focus:outline-none flex-1" 
          />
        ) : (
          <h4 className="font-bold text-white text-lg">{checklist.title}</h4>
        )}
        {isSysAdmin && (
          <button onClick={() => deleteChecklist(checklist.id)} className="text-zinc-500 hover:text-red-400 transition"><Trash2 size={16} /></button>
        )}
      </div>
      
      <div className="space-y-2">
        {checklist.items.map(item => (
          <ChecklistTodoItem 
            key={item.id}
            item={item}
            checklist={checklist}
            isSysAdmin={isSysAdmin}
            isReadOnly={isReadOnly}
            updateChecklist={updateChecklist}
          />
        ))}
      </div>
      
      {isSysAdmin && (
        <button 
          onClick={() => updateChecklist({
            ...checklist,
            items: [...checklist.items, { id: `cli-${Date.now()}`, text: 'New Item', completed: false }]
          })}
          className="mt-4 text-xs font-mono text-[#A493F7] hover:text-white transition flex items-center gap-1"
        >
          <Plus size={12} /> Add Item
        </button>
      )}
    </div>
  );
};

interface ChecklistTodoItemProps {
  key?: string | number;
  item: any;
  checklist: Checklist;
  isSysAdmin: boolean;
  isReadOnly: boolean;
  updateChecklist: (checklist: Checklist) => void;
}

const ChecklistTodoItem = ({ item, checklist, isSysAdmin, isReadOnly, updateChecklist }: ChecklistTodoItemProps) => {
  const [text, setText] = useState(item.text);

  useEffect(() => {
    setText(item.text);
  }, [item.text]);

  const handleTextBlur = () => {
    if (text !== item.text) {
      updateChecklist({
        ...checklist,
        items: checklist.items.map(i => i.id === item.id ? { ...i, text } : i)
      });
    }
  };

  return (
    <div className="flex items-center gap-3 group">
      <button 
        onClick={() => {
          if (isReadOnly) return;
          updateChecklist({
            ...checklist,
            items: checklist.items.map(i => i.id === item.id ? {...i, completed: !i.completed} : i)
          });
        }}
        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.completed ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-700 hover:border-emerald-500'}`}
        disabled={isReadOnly}
      >
        {item.completed && <Check size={14} />}
      </button>
      {isSysAdmin ? (
        <input 
          value={text} 
          onChange={e => setText(e.target.value)} 
          onBlur={handleTextBlur}
          className="bg-transparent text-sm text-zinc-300 focus:outline-none flex-1"
        />
      ) : (
        <span className={`text-sm ${item.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{item.text}</span>
      )}
      {isSysAdmin && (
        <button onClick={() => updateChecklist({
          ...checklist,
          items: checklist.items.filter(i => i.id !== item.id)
        })} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><X size={14} /></button>
      )}
    </div>
  );
};

interface DocumentInfo {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  flowchartSteps: number[]; // Ties to 1-16 flowchart steps
  flowchartStepDetails: { [stepId: number]: string };
}

const DOCUMENTS: DocumentInfo[] = [
  {
    id: 'doc-1',
    name: 'White Paper',
    subtitle: 'Subject matter inside contract',
    description: 'Technical white paper establishing deep domain expertise and defining custom engineering approaches for federal target systems.',
    flowchartSteps: [7],
    flowchartStepDetails: {
      7: 'Required for Step 7 (Procurement Paperwork) - Acts as the core technical brief in our draft unsolicited proposals.'
    }
  },
  {
    id: 'doc-2',
    name: 'Articles of Incorporation',
    subtitle: 'Legal Corporate Foundation',
    description: 'State-certified charter establishing the legal framework and ownership structure of the entity.',
    flowchartSteps: [4, 8],
    flowchartStepDetails: {
      4: 'Required for Step 4 (TCE Formation) - Must be submitted to establish the legal joint venture structure.',
      8: 'Required for Step 8 (Proposal Submission) - Validates ownership structure for final 8(a) package submission.'
    }
  },
  {
    id: 'doc-3',
    name: 'Small Business Enterprise (SBE) Certification',
    subtitle: 'Socioeconomic Status Validation',
    description: 'Official certification confirming small business enterprise standing and size compliance with SBA regulations.',
    flowchartSteps: [5, 8],
    flowchartStepDetails: {
      5: 'Required for Step 5 (TCE Paperwork) - Essential document for drafting SBE-specific proposal components.',
      8: 'Required for Step 8 (Proposal Submission) - Part of the core compliance package submitted to the SBA.'
    }
  },
  {
    id: 'doc-4',
    name: 'Capabilities Statement',
    subtitle: 'Core Competency Summary',
    description: 'A concise, target-focused brief outlining the corporate capabilities, NAICS codes, past performance, and differentiator metrics.',
    flowchartSteps: [5, 10],
    flowchartStepDetails: {
      5: 'Required for Step 5 (TCE Paperwork) - Core document defining technical capabilities of the Joint Venture.',
      10: 'Required for Step 10 (Meeting Buyers) - Distributed during active engagements with Contracting Officers.'
    }
  },
  {
    id: 'doc-5',
    name: 'Capabilities Brief',
    subtitle: 'Interactive Presentation Material',
    description: 'High-fidelity technical slides detailing enterprise security solutions, cloud lattice, and federal ops postures.',
    flowchartSteps: [5, 10],
    flowchartStepDetails: {
      5: 'Required for Step 5 (TCE Paperwork) - Establishes presentation-ready material for agency alignment.',
      10: 'Required for Step 10 (Meeting Buyers) - Projected and reviewed in briefings with federal procurement teams.'
    }
  },
  {
    id: 'doc-6',
    name: 'Unsolicited Proposal Volume 1',
    subtitle: 'Technical & Management Volume',
    description: 'Comprehensive unsolicited proposal specifying corporate methodology, performance guarantees, and structural design solutions.',
    flowchartSteps: [7, 8],
    flowchartStepDetails: {
      7: 'Required for Step 7 (Procurement Paperwork) - The primary technical blueprint for unsolicited solicitation.',
      8: 'Required for Step 8 (Proposal Submission) - Key operational document of the 8(a) package.'
    }
  },
  {
    id: 'doc-7',
    name: 'Unsolicited Proposal Volume 2',
    subtitle: 'Cost & Pricing Volume',
    description: 'Detailed financial modeling, pricing sheets, and labor category margins tailored to GovCloud deployment targets.',
    flowchartSteps: [7, 8],
    flowchartStepDetails: {
      7: 'Required for Step 7 (Procurement Paperwork) - The core cost volume detailing project budgets.',
      8: 'Required for Step 8 (Proposal Submission) - Underpins the pricing transparency of the submitted 8(a) package.'
    }
  },
  {
    id: 'doc-8',
    name: 'Scope of Work (SOW)',
    subtitle: 'Project Boundary Conditions',
    description: 'Specific performance expectations, service level objectives, boundaries, and milestone timelines for the contract vehicle.',
    flowchartSteps: [9],
    flowchartStepDetails: {
      9: 'Required for Step 9 (Rate Sheet and Scope) - Defines the exact work parameters linked with the 8(a) rate cards.'
    }
  },
  {
    id: 'doc-9',
    name: 'Performance of Work (POW)',
    subtitle: 'Compliance Tracking Statement',
    description: 'Formulation of project progress tracking mechanisms, milestone compliance, and quality control systems.',
    flowchartSteps: [16],
    flowchartStepDetails: {
      16: 'Required for Step 16 (Refinement & Compliance) - Crucial for validating work performance against federal benchmarks.'
    }
  },
  {
    id: 'doc-10',
    name: 'Executed Contract / Past Performance Record',
    subtitle: 'Verifiable Experience Record',
    description: 'Certified federal past performance record confirming execution quality, timely delivery, and budget compliance.',
    flowchartSteps: [13],
    flowchartStepDetails: {
      13: 'Required for Step 13 (Contract Award Paid) - Validates capability history for release of prime contract funds.'
    }
  },
  {
    id: 'doc-11',
    name: 'Declaration for Federal Employment (Form OF-306)',
    subtitle: 'Personnel Security Clearance Package',
    description: 'SBA standard background check form to establish suitability for employment on secure federal systems and access clearances.',
    flowchartSteps: [11],
    flowchartStepDetails: {
      11: 'Required for Step 11 (8(a) Contract Ratification) - Mandatory security clearance submission before the vendor list is approved.'
    }
  }
];

// Flowchart step summaries to visually match with FederalFlowchart.tsx
const FLOWCHART_STEPS = [
  { id: 1, label: 'Introductions Made' },
  { id: 2, label: 'Legislature reviews' },
  { id: 3, label: 'Legislation signed' },
  { id: 4, label: 'TCE Incorporated' },
  { id: 5, label: 'TCE Paperwork Drafted' },
  { id: 6, label: 'Notify SBA of Intent' },
  { id: 7, label: 'Drafting of Proposals' },
  { id: 8, label: '8(a) Package Submitted' },
  { id: 9, label: 'Curation of Rate Sheet' },
  { id: 10, label: 'Meeting Federal Buyers' },
  { id: 11, label: 'Contract Approved' },
  { id: 12, label: 'BPA Acquired' },
  { id: 13, label: 'Contract Dollars Paid' },
  { id: 14, label: 'Outsourcing of Roles' },
  { id: 15, label: '8(a) Retains Profits' },
  { id: 16, label: 'Performance & Compliance' }
];

export default function DocumentHub() {
  const { currentUser, cards, checklists, addCard, updateCard, deleteCard, toggleCardReview, addChecklist, updateChecklist, deleteChecklist } = useAppContext();
  const isSysAdmin = currentUser?.role === 'SysAdmin';
  const isReadOnly = currentUser?.role === 'District Representative' || currentUser?.role === 'President';

  const [activeHubTab, setActiveHubTab] = useState<'repo' | 'board'>('repo');

  const [flowchartStepsMap, setFlowchartStepsMap] = useState<{ id: number, label: string }[]>(() => {
    const saved = localStorage.getItem('ukbfc_8a_flowchart_steps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { id: 1, label: 'Introductions Made' },
      { id: 2, label: 'Legislature reviews' },
      { id: 3, label: 'Legislation signed' },
      { id: 4, label: 'TCE Incorporated' },
      { id: 5, label: 'TCE Paperwork Drafted' },
      { id: 6, label: 'Notify SBA of Intent' },
      { id: 7, label: 'Drafting of Proposals' },
      { id: 8, label: '8(a) Package Submitted' },
      { id: 9, label: 'Curation of Rate Sheet' },
      { id: 10, label: 'Meeting Federal Buyers' },
      { id: 11, label: 'Contract Approved' },
      { id: 12, label: 'BPA Acquired' },
      { id: 13, label: 'Contract Dollars Paid' },
      { id: 14, label: 'Outsourcing of Roles' },
      { id: 15, label: '8(a) Retains Profits' },
      { id: 16, label: 'Performance & Compliance' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ukbfc_8a_flowchart_steps', JSON.stringify(flowchartStepsMap));
  }, [flowchartStepsMap]);
  const [documents, setDocuments] = useState<DocumentInfo[]>(() => {
    const saved = localStorage.getItem('ukbfc_8a_documents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DOCUMENTS;
  });

  useEffect(() => {
    localStorage.setItem('ukbfc_8a_documents', JSON.stringify(documents));
  }, [documents]);

  // Document statuses state
  const [statuses, setStatuses] = useState<{ [docId: string]: 'Missing' | 'In Progress' | 'Verified/Ready' }>(() => {
    const saved = localStorage.getItem('ukbfc_8a_doc_statuses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Default statuses: some ready, some in progress, some missing
    return {
      'doc-1': 'In Progress',
      'doc-2': 'Verified/Ready',
      'doc-3': 'Verified/Ready',
      'doc-4': 'In Progress',
      'doc-5': 'Missing',
      'doc-6': 'Missing',
      'doc-7': 'Missing',
      'doc-8': 'In Progress',
      'doc-9': 'Missing',
      'doc-10': 'Missing',
      'doc-11': 'Verified/Ready',
    };
  });

  // Document Hub Meta
  const [hubMeta, setHubMeta] = useState(() => {
    const saved = localStorage.getItem('ukbfc_8a_hub_meta');
    return saved ? JSON.parse(saved) : {
      pipelineLabel: 'SBA 8(a) Procurement Pipeline',
      title: '8(a) Document Readiness & Submission Hub',
      description: 'Verify compliance mapping, simulate secure uploads, and inspect how legal, technical, and pricing volumes map directly into our 16-step federal bidding pipeline.'
    };
  });

  useEffect(() => {
    localStorage.setItem('ukbfc_8a_hub_meta', JSON.stringify(hubMeta));
  }, [hubMeta]);

  // Customizable title and subtitle for the pipeline step mapping section
  const [pipelineTitle, setPipelineTitle] = useState<string>(() => {
    return localStorage.getItem('ukbfc_8a_pipeline_title') || 'Pipeline Step Mapping';
  });

  const [pipelineSubtitle, setPipelineSubtitle] = useState<string>(() => {
    return localStorage.getItem('ukbfc_8a_pipeline_subtitle') || 'Interactive compliance highlights across our 16 steps';
  });

  useEffect(() => {
    localStorage.setItem('ukbfc_8a_pipeline_title', pipelineTitle);
  }, [pipelineTitle]);

  useEffect(() => {
    localStorage.setItem('ukbfc_8a_pipeline_subtitle', pipelineSubtitle);
  }, [pipelineSubtitle]);

  // Upload simulation state
  const [uploadProgress, setUploadProgress] = useState<{ [docId: string]: number }>({});
  const [isUploading, setIsUploading] = useState<{ [docId: string]: boolean }>({});
  const [fileNames, setFileNames] = useState<{ [docId: string]: string }>({});
  const [fileSizes, setFileSizes] = useState<{ [docId: string]: string }>({});
  const [dragOverDocId, setDragOverDocId] = useState<string | null>(null);

  // Focus & interaction states
  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>('doc-1');

  // Kinetic pulse and line connectors state
  interface PulseParticle {
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    stepId: number;
  }

  interface ConnectorLine {
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }

  const [pulses, setPulses] = useState<PulseParticle[]>([]);
  const [connectors, setConnectors] = useState<ConnectorLine[]>([]);
  const [glowingSteps, setGlowingSteps] = useState<number[]>([]);

  // Trigger glowing effect on target flowchart nodes
  const triggerStepGlow = (stepId: number) => {
    setGlowingSteps(prev => [...prev, stepId]);
    setTimeout(() => {
      setGlowingSteps(prev => prev.filter(id => id !== stepId));
    }, 1500);
  };

  // Sync statuses to localStorage
  useEffect(() => {
    localStorage.setItem('ukbfc_8a_doc_statuses', JSON.stringify(statuses));
  }, [statuses]);

  // Recalculate connector line coordinates dynamically
  const activeDocId = hoveredDocId || selectedDocId;
  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];

  const updateConnectors = () => {
    const rootEl = document.getElementById('document-hub-root');
    const sourceEl = document.getElementById(`doc-card-${activeDoc.id}`);
    if (!rootEl || !sourceEl) return;

    // Below lg breakpoint (1024px), columns stack vertically.
    // Drawing connector lines across stacked columns causes major vertical overlaps and visual clutter.
    if (window.innerWidth < 1024) {
      if (connectors.length > 0) setConnectors([]);
      return;
    }

    const rootRect = rootEl.getBoundingClientRect();
    const sourceRect = sourceEl.getBoundingClientRect();
    const startX = sourceRect.left - rootRect.left + 24; // Align near left icon box
    const startY = sourceRect.top - rootRect.top + sourceRect.height / 2;

    const newConnectors: ConnectorLine[] = [];

    activeDoc.flowchartSteps.forEach(stepId => {
      const targetEl = document.getElementById(`mini-step-${stepId}`);
      if (targetEl) {
        const targetRect = targetEl.getBoundingClientRect();
        const endX = targetRect.left - rootRect.left + targetRect.width / 2;
        const endY = targetRect.top - rootRect.top + targetRect.height / 2;

        newConnectors.push({
          id: `${activeDoc.id}-${stepId}`,
          startX,
          startY,
          endX,
          endY
        });
      }
    });

    setConnectors(newConnectors);
  };

  useEffect(() => {
    // Delay slightly to allow DOM layout to stabilize
    const timer = setTimeout(updateConnectors, 200);
    window.addEventListener('resize', updateConnectors);
    // Use capture: true to intercept all scrolls (e.g., inside local scrollable containers)
    window.addEventListener('scroll', updateConnectors, { capture: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateConnectors);
      window.removeEventListener('scroll', updateConnectors, { capture: true });
    };
  }, [activeDocId, statuses]);

  // Spawn animated purple pulse particles
  const triggerPulses = (docId: string) => {
    const rootEl = document.getElementById('document-hub-root');
    const sourceEl = document.getElementById(`doc-card-${docId}`);
    if (!rootEl || !sourceEl) return;

    const docObj = documents.find(d => d.id === docId);
    if (!docObj) return;

    const rootRect = rootEl.getBoundingClientRect();
    const sourceRect = sourceEl.getBoundingClientRect();
    const startX = sourceRect.left - rootRect.left + 24;
    const startY = sourceRect.top - rootRect.top + sourceRect.height / 2;

    docObj.flowchartSteps.forEach((stepId, index) => {
      const targetEl = document.getElementById(`mini-step-${stepId}`);
      if (targetEl) {
        const targetRect = targetEl.getBoundingClientRect();
        const endX = targetRect.left - rootRect.left + targetRect.width / 2;
        const endY = targetRect.top - rootRect.top + targetRect.height / 2;

        // Stagger slightly if multiple steps exist
        setTimeout(() => {
          setPulses(prev => [
            ...prev,
            {
              id: `${docId}-${stepId}-${Date.now()}-${index}`,
              startX,
              startY,
              endX,
              endY,
              stepId
            }
          ]);
        }, index * 150);
      }
    });
  };

  // Handle status toggle change
  const handleStatusChange = (docId: string, newStatus: 'Missing' | 'In Progress' | 'Verified/Ready') => {
    if (newStatus === 'Verified/Ready' && statuses[docId] !== 'Verified/Ready') {
      triggerPulses(docId);
    }
    setStatuses(prev => ({
      ...prev,
      [docId]: newStatus
    }));
  };

  // Run a mock visual upload simulation
  const startMockUpload = (docId: string, file: File) => {
    if (isUploading[docId]) return;

    setIsUploading(prev => ({ ...prev, [docId]: true }));
    setUploadProgress(prev => ({ ...prev, [docId]: 0 }));
    setFileNames(prev => ({ ...prev, [docId]: file.name }));
    
    // Format size nicely
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileSizes(prev => ({ ...prev, [docId]: `${sizeInMB} MB` }));

    // Auto toggle document status to 'In Progress' initially
    if (statuses[docId] === 'Missing') {
      handleStatusChange(docId, 'In Progress');
    }

    let progress = 0;
    const intervalTime = 150; // Total duration ~ 1.5 seconds (10 steps)
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({ ...prev, [docId]: progress }));

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(prev => ({ ...prev, [docId]: false }));
          // Auto upgrade to 'Verified/Ready' on complete upload!
          handleStatusChange(docId, 'Verified/Ready');
        }, 300);
      }
    }, intervalTime);
  };

  // Drag and Drop event handlers
  const handleDragOver = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDocId(docId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDocId(null);
  };

  const handleDrop = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDocId(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      startMockUpload(docId, files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      startMockUpload(docId, files[0]);
    }
  };

  // Delete simulated file
  const handleDeleteFile = (docId: string) => {
    setFileNames(prev => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
    setFileSizes(prev => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
    setUploadProgress(prev => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
    // Revert status to missing
    handleStatusChange(docId, 'Missing');
  };

  // Calculate overall metrics
  const totalDocs = documents.length;
  const verifiedCount = Object.values(statuses).filter(s => s === 'Verified/Ready').length;
  const inProgressCount = Object.values(statuses).filter(s => s === 'In Progress').length;
  const missingCount = Object.values(statuses).filter(s => s === 'Missing').length;

  const handleAddDocument = () => {
    const newDoc: DocumentInfo = {
      id: `doc-${Date.now()}`,
      name: 'New Document',
      subtitle: 'Subtitle',
      description: 'Document description.',
      flowchartSteps: [],
      flowchartStepDetails: {}
    };
    setDocuments([newDoc, ...documents]);
    setStatuses({ ...statuses, [newDoc.id]: 'Missing' });
  };

  const handleUpdateDocument = (updatedDoc: DocumentInfo) => {
    setDocuments(documents.map(d => d.id === updatedDoc.id ? updatedDoc : d));
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(documents.filter(d => d.id !== docId));
    const newStatuses = { ...statuses };
    delete newStatuses[docId];
    setStatuses(newStatuses);
    if (selectedDocId === docId) setSelectedDocId(null);
  };

  const compliancePercentage = totalDocs > 0 ? Math.round((verifiedCount / totalDocs) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn relative" id="document-hub-root">
      


      {/* ================= HUB TABS ================= */}
      <div className="flex w-full mb-8 relative z-10 gap-4">
        <button
          onClick={() => setActiveHubTab('repo')}
          className={`flex-1 py-4 text-center font-bold font-sans transition-all duration-300 border-b-2 ${activeHubTab === 'repo' ? 'bg-[#A493F7]/10 text-[#A493F7] border-[#A493F7] shadow-[0_4px_20px_-10px_rgba(164,147,247,0.5)]' : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
        >
          Document Repository
        </button>
        <button
          onClick={() => setActiveHubTab('board')}
          className={`flex-1 py-4 text-center font-bold font-sans transition-all duration-300 border-b-2 ${activeHubTab === 'board' ? 'bg-[#A493F7]/10 text-[#A493F7] border-[#A493F7] shadow-[0_4px_20px_-10px_rgba(164,147,247,0.5)]' : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
        >
          Dynamic Operations Boards
        </button>
      </div>

      {activeHubTab === 'repo' && (
        <>
          {/* ================= MAIN SPLIT SCREEN LAYOUT ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-12 xl:col-span-12 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
            <div>
              {isSysAdmin ? (
                <input
                  value={hubMeta.repoTitle || '8(a) Document Repository'}
                  onChange={e => setHubMeta({ ...hubMeta, repoTitle: e.target.value })}
                  className="text-sm font-semibold text-white font-sans bg-transparent border-b border-zinc-800 focus:border-[#A493F7] focus:outline-none w-full"
                />
              ) : (
                <h4 className="text-sm font-semibold text-white font-sans">{hubMeta.repoTitle || 'Document Repository'}</h4>
              )}
              {isSysAdmin ? (
                <input
                  value={hubMeta.repoDescription || 'Manage audit statuses, details, and simulate secure transfers'}
                  onChange={e => setHubMeta({ ...hubMeta, repoDescription: e.target.value })}
                  className="text-xs text-zinc-400 mt-0.5 bg-transparent border-b border-zinc-800 focus:border-[#A493F7] focus:outline-none w-full max-w-sm"
                />
              ) : (
                <p className="text-xs text-zinc-400 mt-0.5">{hubMeta.repoDescription || 'Manage audit statuses, details, and simulate secure transfers'}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-black/60 border border-zinc-900 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse mr-1" />
                <span>Interactive Simulator Online</span>
              </div>
              {isSysAdmin && (
                <button
                  onClick={handleAddDocument}
                  className="px-3 py-1.5 bg-[#A493F7]/10 text-[#A493F7] hover:bg-[#A493F7]/20 border border-[#A493F7]/30 rounded-lg text-xs font-mono transition flex items-center gap-1"
                >
                  <Plus size={14} /> Add Document
                </button>
              )}
            </div>
          </div>

          {/* Document list grid */}
          <div className="space-y-4">
            {documents.map((doc) => {
              const status = statuses[doc.id];
              const progress = uploadProgress[doc.id] || 0;
              const uploading = isUploading[doc.id] || false;
              const fName = fileNames[doc.id];
              const fSize = fileSizes[doc.id];
              
              const isSelected = selectedDocId === doc.id;
              const isDragOver = dragOverDocId === doc.id;

              return (
                <div
                  id={`doc-card-${doc.id}`}
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  onMouseEnter={() => setHoveredDocId(doc.id)}
                  onMouseLeave={() => setHoveredDocId(null)}
                  onDragOver={(e) => handleDragOver(e, doc.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, doc.id)}
                  className={`border transition-all duration-300 rounded-2xl p-4.5 space-y-4 relative group/card cursor-pointer glow-card tilt-card ${
                    isSelected
                      ? 'bg-[#101014]/95 border-purple-500/60 shadow-[0_0_25px_rgba(164,147,247,0.12)]'
                      : isDragOver
                        ? 'bg-[#151224] border-purple-400 scale-[1.01] shadow-[0_0_20px_rgba(164,147,247,0.2)]'
                        : 'bg-[#0B0B0F]/90 border-zinc-900 hover:border-zinc-800 hover:bg-[#0f0f13]'
                  }`}
                >
                  
                  {/* Glowing background indicator when ready */}
                  {status === 'Verified/Ready' && (
                    <div className="absolute -top-px -left-px right-0 h-[2px] bg-gradient-to-r from-purple-400 via-indigo-400 to-transparent rounded-t-2xl opacity-60" />
                  )}

                  {/* Header Row: Doc Title & Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      
                      {/* Document Icon Box with Morphing Shape Transition */}
                      <div className={`p-2.5 border transition-all duration-500 state-morph-card shrink-0 ${
                        status === 'Verified/Ready'
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_12px_rgba(164,147,247,0.15)] rounded-full'
                          : status === 'In Progress'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse rounded-lg'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 rounded-sm'
                      }`}>
                        <FileText size={18} />
                      </div>

                      <div className="space-y-1 w-full max-w-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isSysAdmin ? (
                            <input
                              value={doc.name}
                              onChange={e => handleUpdateDocument({ ...doc, name: e.target.value })}
                              onClick={e => e.stopPropagation()}
                              className="text-sm font-bold text-white bg-transparent border-b border-zinc-800 focus:border-[#A493F7] focus:outline-none w-full"
                            />
                          ) : (
                            <h5 className="text-sm font-bold text-white tracking-tight group-hover/card:text-purple-400 transition-colors">
                              {doc.name}
                            </h5>
                          )}
                          
                          {/* Flowchart step indicators pill */}
                          <span className="text-[8px] font-mono bg-zinc-950 border border-zinc-900 px-1.5 py-0.5 rounded text-zinc-500">
                            Steps: {doc.flowchartSteps.join(', ')}
                          </span>
                        </div>
                        {isSysAdmin ? (
                          <input
                            value={doc.subtitle}
                            onChange={e => handleUpdateDocument({ ...doc, subtitle: e.target.value })}
                            onClick={e => e.stopPropagation()}
                            className="text-xs text-zinc-400 font-sans bg-transparent border-b border-zinc-800 focus:border-[#A493F7] focus:outline-none w-full"
                          />
                        ) : (
                          <p className="text-xs text-zinc-400 font-sans">{doc.subtitle}</p>
                        )}
                      </div>
                    </div>

                    {/* Status selection pills */}
                    <div className="flex items-center gap-1.5 self-end sm:self-start bg-black/60 border border-zinc-900 p-1 rounded-xl shrink-0">
                      
                      {/* Status Toggle: Missing */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); if(!isReadOnly) handleStatusChange(doc.id, 'Missing'); }}
                        className={`px-2.5 py-1 text-[9px] font-mono uppercase rounded-lg transition-all ${
                          status === 'Missing'
                            ? 'bg-zinc-850 border border-zinc-800 text-zinc-400 font-bold'
                            : 'text-zinc-500 hover:text-zinc-300'
                        } ${isReadOnly ? 'cursor-not-allowed opacity-50' : ''}`}
                        disabled={isReadOnly}
                      >
                        Missing
                      </button>

                      {/* Status Toggle: In Progress */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); if(!isReadOnly) handleStatusChange(doc.id, 'In Progress'); }}
                        className={`px-2.5 py-1 text-[9px] font-mono uppercase rounded-lg transition-all ${
                          status === 'In Progress'
                            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold animate-pulse'
                            : 'text-zinc-500 hover:text-zinc-300'
                        } ${isReadOnly ? 'cursor-not-allowed opacity-50' : ''}`}
                        disabled={isReadOnly}
                      >
                        In Progress
                      </button>

                      {/* Status Toggle: Verified/Ready */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); if(!isReadOnly) handleStatusChange(doc.id, 'Verified/Ready'); }}
                        className={`px-2.5 py-1 text-[9px] font-mono uppercase rounded-lg transition-all flex items-center gap-1 ${
                          status === 'Verified/Ready'
                            ? 'bg-purple-600/20 border border-purple-500/30 text-white font-bold shadow-[0_0_10px_rgba(164,147,247,0.2)]'
                            : 'text-zinc-500 hover:text-zinc-300'
                        } ${isReadOnly ? 'cursor-not-allowed opacity-50' : ''}`}
                        disabled={isReadOnly}
                      >
                        {status === 'Verified/Ready' && <Check size={8} />}
                        Verified
                      </button>

                      {isSysAdmin && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                          className="px-2 py-1 ml-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Simulated High-Fidelity Drag-and-Drop Dropzone & Progress */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
                    
                    {/* Drag and drop interactive area */}
                    <div className="md:col-span-8">
                      {fName ? (
                        <div className="bg-black/40 border border-zinc-850 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg shrink-0">
                              <File size={15} />
                            </div>
                            <div className="truncate space-y-0.5">
                              <span className="font-mono text-zinc-300 text-[11px] block truncate">{fName}</span>
                              <span className="text-[10px] font-mono text-zinc-500 block">{fSize}</span>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteFile(doc.id); }}
                            className={`p-1.5 bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-red-400 rounded-lg hover:border-red-500/20 transition shrink-0 ${isReadOnly ? 'hidden' : 'cursor-pointer'}`}
                            title="Remove uploaded file"
                            disabled={isReadOnly}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : isReadOnly ? (
                        <div className="w-full h-16 border-2 border-dashed border-zinc-850 rounded-xl flex flex-col items-center justify-center p-2 text-center bg-black/25 text-zinc-500 opacity-50 cursor-not-allowed">
                          <span className="text-[10px] font-mono">Upload disabled for this role</span>
                        </div>
                      ) : (
                        <label 
                          className={`w-full h-16 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-2 text-center transition-all duration-300 cursor-pointer ${
                            isDragOver 
                              ? 'border-[#A493F7] bg-purple-950/20 text-white'
                              : 'border-zinc-850 hover:border-zinc-750 bg-black/25 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, doc.id)}
                            disabled={uploading}
                          />
                          <div className="flex items-center gap-2">
                            <UploadCloud size={15} className={isDragOver ? 'animate-bounce text-[#A493F7]' : 'text-zinc-600'} />
                            <div className="text-[10px] font-mono">
                              {isDragOver ? (
                                <span className="text-[#A493F7] font-bold">Release to Upload</span>
                              ) : (
                                <span>Drag / click to upload PDF</span>
                              )}
                            </div>
                          </div>
                        </label>
                      )}
                    </div>

                    {/* Progress Bar or Active Status Visual */}
                    <div className="md:col-span-4 flex flex-col justify-center bg-black/20 border border-zinc-900/60 p-3 rounded-xl min-h-[64px]">
                      {uploading ? (
                        <div className="space-y-1.5 w-full">
                          <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                            <span>Uploading...</span>
                            <span className="text-[#A493F7]">{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                            <motion.div 
                              className="h-full bg-purple-500"
                              initial={{ width: '0%' }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.15 }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center md:text-left">
                          {status === 'Verified/Ready' ? (
                            <div className="flex items-center justify-center md:justify-start gap-1.5 text-purple-400 font-mono text-[10px] font-bold">
                              <CheckCircle2 size={13} className="text-purple-400 animate-pulse" />
                              <span>READY FOR SUBMIT</span>
                            </div>
                          ) : status === 'In Progress' ? (
                            <div className="flex items-center justify-center md:justify-start gap-1.5 text-amber-400 font-mono text-[10px] font-bold">
                              <Clock size={13} className="text-amber-400 animate-pulse" />
                              <span>IN ASSEMBLY</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center md:justify-start gap-1.5 text-zinc-500 font-mono text-[10px]">
                              <AlertCircle size={13} />
                              <span>PENDING MATERIALS</span>
                            </div>
                          )}
                          <span className="text-[9px] text-zinc-600 font-mono block mt-0.5">
                            {status === 'Verified/Ready' ? 'Audit verified ✅' : status === 'In Progress' ? 'Draft pending review' : 'No draft submitted'}
                          </span>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
        </div>
        </>
      )}

      {activeHubTab === 'board' && (
        <>
          {/* Admin Checklists Only */}
          <div className="lg:col-span-12 mt-8 space-y-6 relative z-10">
          <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
            <div>
              <h3 className="text-xl font-bold text-white font-sans">Dynamic Operations Board</h3>
              <p className="text-xs text-zinc-400">Action items, priority checklists, and review flags.</p>
            </div>
            {isSysAdmin && (
              <div className="flex gap-2">
                <button 
                  onClick={() => addChecklist({ id: `cl-${Date.now()}`, title: 'New Checklist', items: [] })}
                  className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-mono transition flex items-center gap-1"
                >
                  <Plus size={14} /> Add Checklist
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {checklists.map(checklist => (
              <ChecklistItem 
                key={checklist.id}
                checklist={checklist}
                isSysAdmin={isSysAdmin}
                isReadOnly={isReadOnly}
                updateChecklist={updateChecklist}
                deleteChecklist={deleteChecklist}
              />
            ))}
          </div>
          </div>
        </>
      )}

    </div>
  );
}
