'use client';

import { useState } from 'react';
import Column from '@/components/taskzen/Column';
import Toolbar from '@/components/taskzen/Toolbar';
import { ColumnId } from '@/lib/taskzen/types';

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

export default function TaskzenClient() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              TaskZen
            </h1>
            <p className="text-slate-300 text-lg font-light">
              Organize your tasks with style
            </p>
          </div>
          
          {/* Toolbar */}
          <div className="mb-8">
            <Toolbar 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
            />
          </div>
          
          {/* Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {COLUMNS.map((column) => (
              <Column
                key={column.id}
                columnId={column.id}
                title={column.title}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
