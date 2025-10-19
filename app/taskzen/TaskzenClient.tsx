'use client';

import Column from '@/components/taskzen/Column';
import { ColumnId } from '@/lib/taskzen/types';

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

export default function TaskzenClient() {
  return (
    <div className="min-h-screen bg-slate-800 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">TaskZen</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              columnId={column.id}
              title={column.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
