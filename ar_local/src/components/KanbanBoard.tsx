import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, GripVertical, CheckCircle, Clock, Circle, Edit2, Trash2, UploadCloud, Paperclip, HelpCircle, List, CheckSquare } from 'lucide-react';

type TaskStatus = 'todo' | 'in-progress' | 'done' | 'questions';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  attachments?: string[];
  questionType?: 'yes-no' | 'multiple-choice';
  options?: string[];
  answer?: string;
}

const initialTasks: Task[] = [
  { id: '1', title: 'Prepare JV Certification Documents', status: 'todo' },
  { id: '2', title: 'Review Security Clearances', status: 'todo' },
  { id: '3', title: 'Deploy GovCloud Environment', status: 'in-progress' },
  { id: '4', title: 'Update Organization Bylaws', status: 'done', attachments: ['bylaws-draft-v2.pdf'] },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState<TaskStatus | null>(null);
  
  // Editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingToTaskId, setUploadingToTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const handleAddTask = (status: TaskStatus) => {
    if (newTaskTitle.trim()) {
      setTasks((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          title: newTaskTitle.trim(),
          status,
          attachments: []
        },
      ]);
      setNewTaskTitle('');
    }
    setIsAddingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  };

  const saveEditing = () => {
    if (editingTaskId && editTitle.trim()) {
      setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, title: editTitle.trim() } : t));
    }
    setEditingTaskId(null);
  };

  const triggerUpload = (taskId: string) => {
    setUploadingToTaskId(taskId);
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingToTaskId) {
      setTasks(prev => prev.map(t => {
        if (t.id === uploadingToTaskId) {
          const attachments = t.attachments ? [...t.attachments, file.name] : [file.name];
          return { ...t, attachments };
        }
        return t;
      }));
    }
    setUploadingToTaskId(null);
    if (e.target) {
      e.target.value = ''; // reset
    }
  };

  const removeAttachment = (taskId: string, index: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.attachments) {
        const newAttachments = [...t.attachments];
        newAttachments.splice(index, 1);
        return { ...t, attachments: newAttachments };
      }
      return t;
    }));
  };

  const columns: { id: TaskStatus; title: string; icon: React.ReactNode; color: string }[] = [
    { id: 'todo', title: 'To-Do', icon: <Circle size={16} className="text-zinc-400" />, color: 'border-zinc-500' },
    { id: 'in-progress', title: 'In Progress', icon: <Clock size={16} className="text-amber-400" />, color: 'border-amber-500' },
    { id: 'done', title: 'Done', icon: <CheckCircle size={16} className="text-emerald-400" />, color: 'border-emerald-500' },
    { id: 'questions', title: 'Questions', icon: <HelpCircle size={16} className="text-purple-400" />, color: 'border-purple-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[calc(100vh-250px)] min-h-[500px]">
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileUpload}
      />
      {columns.map((col) => (
        <div
          key={col.id}
          className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg min-h-[500px] md:min-h-0"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          <div className={`p-4 border-b border-zinc-800 border-t-2 ${col.color} bg-zinc-900/50 flex items-center justify-between`}>
            <div className="flex items-center gap-2 font-mono font-bold text-white uppercase text-sm tracking-wider">
              {col.icon}
              {col.title}
            </div>
            <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-full">
              {tasks.filter((t) => t.status === col.id).length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <AnimatePresence>
              {tasks
                .filter((t) => t.status === col.id)
                .map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    draggable={editingTaskId !== task.id}
                    onDragStart={(e: any) => handleDragStart(e, task.id)}
                    className="bg-[#111115] border border-zinc-800 p-3 rounded-lg flex flex-col gap-2 cursor-grab active:cursor-grabbing hover:border-[#A493F7]/50 hover:shadow-[0_0_15px_rgba(164,147,247,0.15)] transition-all group"
                  >
                    <div className="flex items-start gap-2 w-full">
                      <GripVertical size={16} className="text-zinc-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      
                      {editingTaskId === task.id ? (
                        <div className="flex-1">
                          <input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={saveEditing}
                            onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                            className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#A493F7]"
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-300 font-sans leading-snug flex-1 pt-0.5">
                          {task.title}
                        </p>
                      )}

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => triggerUpload(task.id)} className="p-1 text-zinc-500 hover:text-[#A493F7] rounded" title="Attach Document">
                          <UploadCloud size={14} />
                        </button>
                        <button onClick={() => startEditing(task)} className="p-1 text-zinc-500 hover:text-amber-400 rounded" title="Edit Task">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-zinc-500 hover:text-red-400 rounded" title="Delete Task">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Attachments Section */}
                    {task.attachments && task.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 ml-6">
                        {task.attachments.map((att, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 group/att">
                            <Paperclip size={10} className="text-[#A493F7]" />
                            <span className="truncate max-w-[120px]">{att}</span>
                            <button 
                              onClick={() => removeAttachment(task.id, idx)}
                              className="opacity-0 group-hover/att:opacity-100 hover:text-red-400 ml-1"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Question Card UI */}
                    {task.status === 'questions' && (
                      <div className="mt-2 ml-6 p-2 bg-black/40 border border-zinc-800 rounded-lg flex flex-col gap-2">
                        {!task.questionType ? (
                          <div className="flex gap-2 text-xs">
                            <button onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, questionType: 'yes-no' } : t))} className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-300">
                              <CheckSquare size={12} /> Yes/No
                            </button>
                            <button onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, questionType: 'multiple-choice', options: [] } : t))} className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-300">
                              <List size={12} /> Multi-Choice
                            </button>
                          </div>
                        ) : task.questionType === 'yes-no' ? (
                          <div className="flex gap-4">
                            {['Yes', 'No'].map(opt => (
                              <label key={opt} className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                                <input type="radio" name={`q-${task.id}`} checked={task.answer === opt} onChange={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, answer: opt } : t))} className="accent-purple-500" />
                                {opt}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {task.options?.map((opt, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs text-zinc-300 group/opt">
                                <input type="radio" name={`q-${task.id}`} checked={task.answer === opt} onChange={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, answer: opt } : t))} className="accent-purple-500 cursor-pointer" />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    setTasks(prev => prev.map(t => {
                                      if (t.id === task.id) {
                                        const newOpts = [...(t.options || [])];
                                        newOpts[i] = newVal;
                                        // Also update answer if the selected option's text changes
                                        const newAnswer = t.answer === opt ? newVal : t.answer;
                                        return { ...t, options: newOpts, answer: newAnswer };
                                      }
                                      return t;
                                    }));
                                  }}
                                  className="flex-1 bg-transparent border-none outline-none text-zinc-300 focus:text-white"
                                />
                                <button onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, options: t.options?.filter((_, idx) => idx !== i) } : t))} className="opacity-0 group-hover/opt:opacity-100 text-red-400 hover:text-red-300 cursor-pointer">&times;</button>
                              </div>
                            ))}
                            <div className="flex items-center gap-2 mt-1">
                              <input 
                                type="text"
                                placeholder="Add option..."
                                className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                    const val = e.currentTarget.value.trim();
                                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, options: [...(t.options || []), val] } : t));
                                    e.currentTarget.value = '';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
            </AnimatePresence>

            {isAddingTask === col.id ? (
              <div className="mt-4 p-3 border border-[#A493F7] rounded-lg bg-[#111115]">
                <textarea
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddTask(col.id);
                    } else if (e.key === 'Escape') {
                      setIsAddingTask(null);
                    }
                  }}
                  placeholder="Task title..."
                  className="w-full bg-transparent border-none outline-none text-sm text-white resize-none h-16 mb-2 custom-scrollbar"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsAddingTask(null)}
                    className="text-xs text-zinc-500 hover:text-white px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddTask(col.id)}
                    className="text-xs bg-[#A493F7] text-black font-bold px-3 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTask(col.id)}
                className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-zinc-500 hover:text-[#A493F7] hover:bg-[#A493F7]/10 rounded-lg transition border border-transparent border-dashed hover:border-[#A493F7]/30 text-sm font-mono"
              >
                <Plus size={16} /> Add Task
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
