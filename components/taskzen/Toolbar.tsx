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
    <div className="bg-slate-700 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="flex-1 w-full sm:w-auto">
          <label htmlFor="search-input" className="sr-only">
            Search cards
          </label>
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search cards by title or description..."
            className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            aria-label="Search cards by title or description"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-slate-500 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Export board to clipboard"
          >
            {isExporting ? 'Exporting...' : '📋 Export'}
          </button>

          <button
            onClick={handleImport}
            disabled={isImporting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Import board from JSON file"
          >
            {isImporting ? 'Importing...' : '📁 Import'}
          </button>

          <button
            onClick={handleClearAll}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Clear all cards from board"
          >
            🗑️ Clear All
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
        <div className="mt-3 text-sm text-slate-400">
          Searching for: "{searchQuery}"
        </div>
      )}
    </div>
  );
}
