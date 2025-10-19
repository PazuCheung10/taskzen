'use client';

import { useState } from 'react';
import { useTaskzenStore } from '@/lib/taskzen/store';
import { ColumnId } from '@/lib/taskzen/types';

interface NewCardFormProps {
  columnId: ColumnId;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function NewCardForm({ columnId, onSuccess, onCancel }: NewCardFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addCard = useTaskzenStore((state) => state.addCard);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      addCard(columnId, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      
      // Clear form and call success callback
      setTitle('');
      setDescription('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add card:', error);
      // Keep form open on error so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    setTitle('');
    setDescription('');
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor={`title-${columnId}`} className="block text-sm font-semibold text-slate-200 mb-2">
          Title *
        </label>
        <input
          id={`title-${columnId}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter card title..."
          required
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-slate-100 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300"
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor={`description-${columnId}`} className="block text-sm font-semibold text-slate-200 mb-2">
          Description
        </label>
        <textarea
          id={`description-${columnId}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter description (optional)..."
          rows={2}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-slate-100 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm resize-none transition-all duration-300"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="group relative overflow-hidden flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          aria-label="Add new card to this column"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? '⏳' : '✨'} {isSubmitting ? 'Adding...' : 'Add Card'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="group relative overflow-hidden bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          aria-label="Cancel adding new card"
        >
          <span className="relative z-10 flex items-center gap-2">
            ✕ Cancel
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
      
      <p className="text-xs text-slate-300 text-center">
        Press Ctrl+Enter to submit, Esc to cancel
      </p>
    </form>
  );
}
