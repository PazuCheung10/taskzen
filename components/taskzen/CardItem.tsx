'use client';

import { useState, useRef, useEffect } from 'react';
import { useTaskzenStore } from '@/lib/taskzen/store';
import { Card, ColumnId } from '@/lib/taskzen/types';

interface CardItemProps {
  card: Card;
  columnId: ColumnId;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function CardItem({
  card,
  columnId,
  canMoveLeft,
  canMoveRight,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: CardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');
  const [showActions, setShowActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const editFormRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const { editCard, deleteCard, moveCard } = useTaskzenStore();

  // Focus title input when entering edit mode
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (isProcessing) return;
    setIsEditing(true);
    setEditTitle(card.title);
    setEditDescription(card.description || '');
  };

  const handleCancel = () => {
    if (isProcessing) return;
    setIsEditing(false);
    setEditTitle(card.title);
    setEditDescription(card.description || '');
  };

  const handleSave = async () => {
    if (!editTitle.trim() || isProcessing) return;
    
    setIsProcessing(true);
    try {
      editCard(card.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleDelete = async () => {
    if (isProcessing) return;
    
    if (confirm(`Are you sure you want to delete "${card.title}"? This action cannot be undone.`)) {
      setIsProcessing(true);
      try {
        deleteCard(card.id);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleMoveLeft = async () => {
    if (isProcessing || !canMoveLeft) return;
    
    setIsProcessing(true);
    try {
      const columnOrder: ColumnId[] = ['todo', 'doing', 'done'];
      const currentIndex = columnOrder.indexOf(columnId);
      if (currentIndex > 0) {
        moveCard(card.id, columnOrder[currentIndex - 1]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMoveRight = async () => {
    if (isProcessing || !canMoveRight) return;
    
    setIsProcessing(true);
    try {
      const columnOrder: ColumnId[] = ['todo', 'doing', 'done'];
      const currentIndex = columnOrder.indexOf(columnId);
      if (currentIndex < columnOrder.length - 1) {
        moveCard(card.id, columnOrder[currentIndex + 1]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="backdrop-blur-sm bg-white/15 border border-white/30 rounded-xl p-4 shadow-xl">
        <form ref={editFormRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-3">
            <input
              ref={titleInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Card title..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Description (optional)..."
              rows={2}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm resize-none transition-all duration-300"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={!editTitle.trim() || isProcessing}
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              aria-label="Save changes"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isProcessing ? '⏳' : '💾'} {isProcessing ? 'Saving...' : 'Save'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isProcessing}
              className="group relative overflow-hidden bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400/50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              aria-label="Cancel editing"
            >
              <span className="relative z-10 flex items-center gap-2">
                ✕ Cancel
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-3 text-center">
            Ctrl+Enter to save, Esc to cancel
          </p>
        </form>
      </div>
    );
  }

  return (
    <div
      className="group relative backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Card Content */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-100 text-base leading-tight">
          {card.title}
        </h3>
        {card.description && (
          <p className="text-slate-300 text-sm leading-relaxed">
            {card.description}
          </p>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-cyan-400/5 group-hover:via-purple-400/5 group-hover:to-pink-400/5 transition-all duration-500 pointer-events-none"></div>

      {showActions && (
        <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Reorder controls */}
          <div className="flex gap-2">
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp || isProcessing}
              className="group relative overflow-hidden bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400/50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              title="Move up"
              aria-label={`Move "${card.title}" up in ${columnId} column`}
            >
              <span className="relative z-10">↑</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown || isProcessing}
              className="group relative overflow-hidden bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400/50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              title="Move down"
              aria-label={`Move "${card.title}" down in ${columnId} column`}
            >
              <span className="relative z-10">↓</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Move between columns */}
          <div className="flex gap-2">
            <button
              onClick={handleMoveLeft}
              disabled={!canMoveLeft || isProcessing}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              title="Move left"
              aria-label={`Move "${card.title}" to previous column`}
            >
              <span className="relative z-10 flex items-center gap-1">
                {isProcessing ? '⏳' : '←'} {isProcessing ? '...' : 'Move'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button
              onClick={handleMoveRight}
              disabled={!canMoveRight || isProcessing}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              title="Move right"
              aria-label={`Move "${card.title}" to next column`}
            >
              <span className="relative z-10 flex items-center gap-1">
                {isProcessing ? '⏳' : 'Move'} {isProcessing ? '...' : '→'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Edit and Delete */}
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              disabled={isProcessing}
              className="group relative overflow-hidden bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              title="Edit card"
              aria-label={`Edit "${card.title}"`}
            >
              <span className="relative z-10 flex items-center gap-1">
                ✏️ Edit
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button
              onClick={handleDelete}
              disabled={isProcessing}
              className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400/50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              title="Delete card"
              aria-label={`Delete "${card.title}"`}
            >
              <span className="relative z-10 flex items-center gap-1">
                {isProcessing ? '⏳' : '🗑️'} {isProcessing ? '...' : 'Delete'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
