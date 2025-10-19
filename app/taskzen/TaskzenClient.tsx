'use client';

import { useTaskzenStore } from '@/lib/taskzen/store';
import { getCardCount } from '@/lib/taskzen/selectors';
import { ColumnId } from '@/lib/taskzen/types';

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

export default function TaskzenClient() {
  const { columns } = useTaskzenStore();

  return (
    <div className="min-h-screen bg-slate-800 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">TaskZen</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((column) => {
            const count = getCardCount({ columns }, column.id);
            return (
              <div
                key={column.id}
                className="bg-slate-700 rounded-lg p-4 min-h-[400px]"
              >
                <h2 className="text-xl font-medium mb-4">
                  {column.title} ({count})
                </h2>
                <div className="text-sm text-slate-400">
                  No cards yet
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
