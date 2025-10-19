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
    <div className="min-h-screen bg-slate-800 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">TaskZen</h1>
        
        {/* Toolbar */}
        <Toolbar 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
        />
        
        {/* Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
  );
}
