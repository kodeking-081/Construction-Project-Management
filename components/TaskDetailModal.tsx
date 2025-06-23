// File: components/TaskDetailModal.tsx
'use client';
import { X, Pencil, Trash2 } from 'lucide-react';

interface TaskDetailModalProps {
  task: any;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskDetailModal({ task, onClose, onEdit, onDelete }: TaskDetailModalProps) {
  if (!task) return null;
  const getPriorityBadge = (priority: string) => {
    const base = 'px-2 py-0.5 rounded-full text-xs font-medium';
    switch (priority) {
      case 'HIGH':
        return `${base} bg-red-100 text-red-600`;
      case 'MEDIUM':
        return `${base} bg-yellow-100 text-yellow-700`;
      case 'LOW':
        return `${base} bg-green-100 text-green-600`;
      default:
        return `${base} bg-gray-100 text-gray-600`;
    }
  };

  const getStatusBadge = (status: string) => {
    const base = 'px-2 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'PENDING':
        return `${base} bg-gray-200 text-gray-800`;
      case 'IN_PROGRESS':
        return `${base} bg-blue-100 text-blue-700`;
      case 'DONE':
        return `${base} bg-green-100 text-green-700`;
      case 'ON_HOLD':
        return `${base} bg-yellow-200 text-yellow-800`;
      default:
        return `${base} bg-gray-100 text-gray-600`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto bg-neutral-100 rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 sm:mx-0">
        {/* Header & Close */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
          <div className="flex items-center gap-3">
            <Pencil className="w-5 h-5 text-blue-700 hover:text-blue-900 cursor-pointer" onClick={onEdit} />
            <Trash2 className="w-5 h-5 text-red-700 hover:text-red-900 cursor-pointer" onClick={onDelete} />
            <button onClick={onClose} className="text-gray-600 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-base text-gray-800 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
        </div>

        {/* Grid Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-900 text-sm">
          <p><strong>Project:</strong> {task.project?.title || 'N/A'}</p>
          <p><strong>Subproject:</strong> {task.subproject?.name || 'N/A'}</p>
          <p><strong>Assigned to:</strong> {task.assignedTo?.name || 'N/A'}</p>
          <p><strong>Created by:</strong> {task.creator?.name || 'N/A'}</p>
          <p><strong>Due date:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
          <p>
            <strong>Priority:</strong>{' '}
            <span className={getPriorityBadge(task.priority)}>{task.priority}</span>
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={getStatusBadge(task.status)}>{task.status}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
