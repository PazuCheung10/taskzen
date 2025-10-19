'use client';

import { useState } from 'react';
import { useTaskzenStore } from '@/lib/taskzen/store';
import { ColumnId } from '@/lib/taskzen/types';

interface NewCardFormProps {
  columnId: ColumnId;
}

export default function NewCardForm({ columnId }: NewCardFormProps) {
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
      
      // Clear form and focus title input
      setTitle('');
      setDescription('');
      const titleInput = document.getElementById(`title-${columnId}`) as HTMLInputElement;
      if (titleInput) {
        titleInput.focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor={`title-${columnId}`} className="block text-sm font-medium text-slate-200 mb-1">
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
          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor={`description-${columnId}`} className="block text-sm font-medium text-slate-200 mb-1">
          Description
        </label>
        <textarea
          id={`description-${columnId}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter description (optional)..."
          rows={2}
          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
          disabled={isSubmitting}
        />
      </div>
      
      <button
        type="submit"
        disabled={!title.trim() || isSubmitting}
        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-500 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        {isSubmitting ? 'Adding...' : 'Add Card'}
      </button>
      
      <p className="text-xs text-slate-400 text-center">
        Press Ctrl+Enter to submit
      </p>
    </form>
  );
}
