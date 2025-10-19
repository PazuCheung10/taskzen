'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Column from '@/components/taskzen/Column';
import Toolbar from '@/components/taskzen/Toolbar';
import { ColumnId } from '@/lib/taskzen/types';
import { useTaskzenStore } from '@/lib/taskzen/store';

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

export default function TaskzenClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const { moveCard, reorderCard, columns, cards } = useTaskzenStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which column the active card is in
    let activeColumn: ColumnId | null = null;
    for (const [columnId, column] of Object.entries(columns)) {
      if (column.cardOrder.includes(activeId)) {
        activeColumn = columnId as ColumnId;
        break;
      }
    }

    if (!activeColumn) return;

    // If dropping on a column
    if (COLUMNS.some(col => col.id === overId)) {
      const targetColumn = overId as ColumnId;
      if (activeColumn !== targetColumn) {
        moveCard(activeId, targetColumn);
      }
      return;
    }

    // If dropping on another card (reordering within same column)
    if (activeColumn && activeId !== overId) {
      const activeIndex = columns[activeColumn].cardOrder.indexOf(activeId);
      const overIndex = columns[activeColumn].cardOrder.indexOf(overId);
      
      if (activeIndex !== overIndex) {
        reorderCard(activeColumn, activeId, overIndex);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
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
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {COLUMNS.map((column) => {
                const columnCards = columns[column.id].cardOrder
                  .map(cardId => cards[cardId])
                  .filter(Boolean);
                
                return (
                  <SortableContext
                    key={column.id}
                    id={column.id}
                    items={columnCards.map(card => card.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Column
                      columnId={column.id}
                      title={column.title}
                      searchQuery={searchQuery}
                    />
                  </SortableContext>
                );
              })}
            </div>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
