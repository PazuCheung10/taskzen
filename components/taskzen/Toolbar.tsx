'use client';

import { useState, useRef, useEffect } from 'react';
import { useTaskzenStore } from '@/lib/taskzen/store';
import { Board } from '@/lib/taskzen/types';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Toolbar({ searchQuery, onSearchChange }: ToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { clearAll, importJSON, exportJSON } = useTaskzenStore();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    setIsMenuOpen(false); // Close menu after action
    try {
      const jsonData = exportJSON();
      await navigator.clipboard.writeText(jsonData);
      alert('Board exported to clipboard! You can now paste it elsewhere.');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    if (isImporting) return;
    setIsMenuOpen(false); // Close menu after action
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
      alert('Board imported successfully!');
      
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
      setIsMenuOpen(false); // Close menu after action
      alert('All cards have been cleared.');
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
        <div className={`relative transition-all duration-500 ${isMenuOpen ? 'flex-1' : 'flex-1'}`}>
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
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-slate-100 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm transition-all duration-300"
              aria-label="Search cards by title or description"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
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

        {/* Action Menu */}
        <div className={`relative transition-all duration-500 ${isMenuOpen ? 'flex-1' : 'w-auto'}`} ref={menuRef}>
          {!isMenuOpen ? (
            <button
              onClick={toggleMenu}
              className="group relative overflow-hidden bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              aria-label="Open actions menu"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                ⚙️ Actions
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          ) : (
            <div className="flex gap-2 w-full">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              aria-label="Export board to clipboard"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isExporting ? '⏳' : '📋'} {isExporting ? 'Exporting...' : 'Export'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button
              onClick={handleImport}
              disabled={isImporting}
              className="flex-1 group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              aria-label="Import board from JSON file"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isImporting ? '⏳' : '📁'} {isImporting ? 'Importing...' : 'Import'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button
              onClick={handleClearAll}
              className="flex-1 group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              aria-label="Clear all cards from board"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                🗑️ Clear
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button
              onClick={toggleMenu}
              className="group relative overflow-hidden bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              aria-label="Close actions menu"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                ✕
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            </div>
          )}
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
