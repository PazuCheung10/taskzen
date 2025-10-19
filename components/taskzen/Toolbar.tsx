'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { clearAll, importJSON, exportJSON } = useTaskzenStore();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickOnMenu = menuRef.current && menuRef.current.contains(target);
      const isClickOnButton = buttonRef.current && buttonRef.current.contains(target);
      
      if (!isClickOnMenu && !isClickOnButton) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    if (isMenuOpen) {
      // If menu is open, just close it
      setIsMenuOpen(false);
    } else {
      // If menu is closed, calculate position and open it
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setButtonPosition({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right - window.scrollX
        });
      }
      setIsMenuOpen(true);
    }
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
        <div className="flex-1">
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

        {/* Action Menu Dropdown */}
        <div className="relative z-[10000]" ref={menuRef}>
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            className="group relative overflow-hidden bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            aria-label="Open actions menu"
          >
            <span className="relative z-10 flex items-center justify-center">
              ⚙️
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {/* Dropdown Menu - Rendered via Portal */}
          {isMenuOpen && typeof window !== 'undefined' && createPortal(
            <div 
              className="fixed w-48 bg-white/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl overflow-hidden z-[99999]"
              style={{
                top: `${buttonPosition.top}px`,
                right: `${buttonPosition.right}px`
              }}
              ref={menuRef}
            >
              <div className="py-2">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-100 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-3"
                  aria-label="Export board to clipboard"
                >
                  <span className="text-lg">{isExporting ? '⏳' : '📋'}</span>
                  <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                </button>

                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-100 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-3"
                  aria-label="Import board from JSON file"
                >
                  <span className="text-lg">{isImporting ? '⏳' : '📁'}</span>
                  <span>{isImporting ? 'Importing...' : 'Import'}</span>
                </button>

                <button
                  onClick={handleClearAll}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3"
                  aria-label="Clear all cards from board"
                >
                  <span className="text-lg">🗑️</span>
                  <span>Clear All</span>
                </button>
              </div>
            </div>,
            document.body
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
