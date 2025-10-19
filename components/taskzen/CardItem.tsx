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
    setIsEditing(true);
    setEditTitle(card.title);
    setEditDescription(card.description || '');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(card.title);
    setEditDescription(card.description || '');
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    
    editCard(card.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
    });
    setIsEditing(false);
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

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteCard(card.id);
    }
  };

  const handleMoveLeft = () => {
    const columnOrder: ColumnId[] = ['todo', 'doing', 'done'];
    const currentIndex = columnOrder.indexOf(columnId);
    if (currentIndex > 0) {
      moveCard(card.id, columnOrder[currentIndex - 1]);
    }
  };

  const handleMoveRight = () => {
    const columnOrder: ColumnId[] = ['todo', 'doing', 'done'];
    const currentIndex = columnOrder.indexOf(columnId);
    if (currentIndex < columnOrder.length - 1) {
      moveCard(card.id, columnOrder[currentIndex + 1]);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-slate-600 border border-slate-500 rounded-lg p-3">
        <form ref={editFormRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-2">
            <input
              ref={titleInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Card title..."
              className="w-full px-2 py-1 bg-slate-700 border border-slate-500 rounded text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Description (optional)..."
              rows={2}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-500 rounded text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Save changes"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-slate-500 hover:bg-slate-400 text-white text-xs px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ctrl+Enter to save, Esc to cancel
          </p>
        </form>
      </div>
    );
  }

  return (
    <div
      className="bg-slate-600 border border-slate-500 rounded-lg p-3 hover:bg-slate-550 transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="space-y-2">
        <h3 className="font-medium text-slate-100 text-sm leading-tight">
          {card.title}
        </h3>
        {card.description && (
          <p className="text-slate-300 text-xs leading-relaxed">
            {card.description}
          </p>
        )}
      </div>

      {showActions && (
        <div className="mt-3 space-y-2">
          {/* Reorder controls */}
          <div className="flex gap-1">
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="bg-slate-500 hover:bg-slate-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
              title="Move up"
              aria-label={`Move "${card.title}" up in ${columnId} column`}
            >
              ↑
            </button>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="bg-slate-500 hover:bg-slate-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
              title="Move down"
              aria-label={`Move "${card.title}" down in ${columnId} column`}
            >
              ↓
            </button>
          </div>

          {/* Move between columns */}
          <div className="flex gap-1">
            <button
              onClick={handleMoveLeft}
              disabled={!canMoveLeft}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              title="Move left"
              aria-label={`Move "${card.title}" to previous column`}
            >
              ← Move
            </button>
            <button
              onClick={handleMoveRight}
              disabled={!canMoveRight}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              title="Move right"
              aria-label={`Move "${card.title}" to next column`}
            >
              Move →
            </button>
          </div>

          {/* Edit and Delete */}
          <div className="flex gap-1">
            <button
              onClick={handleEdit}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
              title="Edit card"
              aria-label={`Edit "${card.title}"`}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              title="Delete card"
              aria-label={`Delete "${card.title}"`}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
