'use client';

import { useState, useRef } from 'react';
import { useTaskzenStore } from '@/lib/taskzen/store';
import { Board } from '@/lib/taskzen/types';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Toolbar({ searchQuery, onSearchChange }: ToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { clearAll, importJSON, exportJSON } = useTaskzenStore();

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      const jsonData = exportJSON();
      await navigator.clipboard.writeText(jsonData);
      
      // Show success feedback
      const button = document.querySelector('[aria-label="Export board to clipboard"]') as HTMLButtonElement;
      const originalText = button.textContent;
      button.textContent = '✓ Copied!';
      button.classList.add('bg-green-600', 'hover:bg-green-700');
      button.classList.remove('bg-green-600', 'hover:bg-green-700');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-600', 'hover:bg-green-700');
        button.classList.add('bg-green-600', 'hover:bg-green-700');
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    if (isImporting) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Basic validation - check if it has the expected structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON structure');
      }
      
      if (data.version !== 1) {
        throw new Error('Unsupported version');
      }
      
      if (!data.board || !data.board.columns || !data.board.cards) {
        throw new Error('Invalid board structure');
      }
      
      // Check if columns have the expected structure
      const requiredColumns = ['todo', 'doing', 'done'];
      const hasRequiredColumns = requiredColumns.every(col => 
        data.board.columns[col] && 
        Array.isArray(data.board.columns[col].cardOrder)
      );
      
      if (!hasRequiredColumns) {
        throw new Error('Missing required columns');
      }
      
      // Import the validated data
      importJSON(data.board);
      
      // Show success feedback
      const button = document.querySelector('[aria-label="Import board from JSON file"]') as HTMLButtonElement;
      const originalText = button.textContent;
      button.textContent = '✓ Imported!';
      button.classList.add('bg-green-600', 'hover:bg-green-700');
      button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-600', 'hover:bg-green-700');
        button.classList.add('bg-blue-600', 'hover:bg-blue-700');
      }, 2000);
      
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Invalid file format'}`);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all cards? This action cannot be undone.')) {
      clearAll();
      
      // Show success feedback
      const button = document.querySelector('[aria-label="Clear all cards from board"]') as HTMLButtonElement;
      const originalText = button.textContent;
      button.textContent = '✓ Cleared!';
      button.classList.add('bg-green-600', 'hover:bg-green-700');
      button.classList.remove('bg-red-600', 'hover:bg-red-700');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-600', 'hover:bg-green-700');
        button.classList.add('bg-red-600', 'hover:bg-red-700');
      }, 2000);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onSearchChange('');
    }
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row gap-6 items-center">
        {/* Search Input */}
        <div className="flex-1 w-full sm:w-auto relative">
          <label htmlFor="search-input" className="sr-only">
            Search cards
          </label>
          <div className="relative">
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search cards by title or description..."
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-slate-100 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300"
              aria-label="Search cards by title or description"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              🔍
            </div>
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            aria-label="Export board to clipboard"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isExporting ? '⏳' : '📋'} {isExporting ? 'Exporting...' : 'Export'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={handleImport}
            disabled={isImporting}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            aria-label="Import board from JSON file"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isImporting ? '⏳' : '📁'} {isImporting ? 'Importing...' : 'Import'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={handleClearAll}
            className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            aria-label="Clear all cards from board"
          >
            <span className="relative z-10 flex items-center gap-2">
              🗑️ Clear All
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Select JSON file to import"
      />

      {/* Search status */}
      {searchQuery && (
        <div className="mt-4 text-sm text-slate-300 bg-white/5 rounded-lg px-4 py-2 border border-white/10">
          <span className="flex items-center gap-2">
            <span className="text-cyan-400">🔍</span>
            Searching for: <span className="font-semibold text-cyan-300">"{searchQuery}"</span>
          </span>
        </div>
      )}
    </div>
  );
}
