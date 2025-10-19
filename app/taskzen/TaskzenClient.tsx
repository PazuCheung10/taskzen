'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Column from '@/components/taskzen/Column';
import Toolbar from '@/components/taskzen/Toolbar';
import { ColumnId, Card } from '@/lib/taskzen/types';
import { useTaskzenStore } from '@/lib/taskzen/store';

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

export default function TaskzenClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{
    columnId: ColumnId;
    position: number;
  } | null>(null);
  const { moveCard, reorderCard, columns, cards } = useTaskzenStore();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    const card = cards[activeId];
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDragOverInfo(null);
      return;
    }

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

    // If hovering over a column (not a card)
    if (COLUMNS.some(col => col.id === overId)) {
      const targetColumn = overId as ColumnId;
      const columnCards = columns[targetColumn].cardOrder.map(cardId => cards[cardId]).filter(Boolean);
      setDragOverInfo({
        columnId: targetColumn,
        position: columnCards.length
      });
      return;
    }

    // If hovering over another card
    if (activeId !== overId) {
      // Find which column the over card is in
      let overColumn: ColumnId | null = null;
      for (const [columnId, column] of Object.entries(columns)) {
        if (column.cardOrder.includes(overId)) {
          overColumn = columnId as ColumnId;
          break;
        }
      }

      if (!overColumn) return;

      // Calculate drop position
      const overIndex = columns[overColumn].cardOrder.indexOf(overId);
      setDragOverInfo({
        columnId: overColumn,
        position: overIndex
      });

      // If reordering within same column
      if (activeColumn === overColumn) {
        // Don't call reorderCard here - let handleDragEnd handle it
        // This prevents double-dodging with the placeholder
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Clear the active card and drag over info
    setActiveCard(null);
    setDragOverInfo(null);
    
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

    // If dropping on another card
    if (activeId !== overId) {
      // Find which column the over card is in
      let overColumn: ColumnId | null = null;
      for (const [columnId, column] of Object.entries(columns)) {
        if (column.cardOrder.includes(overId)) {
          overColumn = columnId as ColumnId;
          break;
        }
      }

      if (!overColumn) return;

      // If moving between columns
      if (activeColumn !== overColumn) {
        moveCard(activeId, overColumn);
      } else {
        // Same column reordering - use the placeholder position directly
        const activeIndex = columns[activeColumn].cardOrder.indexOf(activeId);
        
        // Use the dragOverInfo position directly (this is where the placeholder shows)
        const targetPosition = dragOverInfo?.position || 0;
        
        if (activeIndex !== targetPosition) {
          reorderCard(activeColumn, activeId, targetPosition);
        }
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
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
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
                      activeCardId={activeCard?.id}
                      dragOverInfo={dragOverInfo}
                    />
                  </SortableContext>
                );
              })}
              </div>
            </DndContext>
            
            {/* Drag Overlay */}
            <DragOverlay>
              {activeCard ? (
                <div className="backdrop-blur-sm bg-white/25 border-2 border-cyan-400/60 rounded-xl p-4 shadow-2xl transform rotate-2 scale-110 opacity-95">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-100 text-base leading-tight">
                      {activeCard.title}
                    </h3>
                    {activeCard.description && (
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {activeCard.description}
                      </p>
                    )}
                  </div>
                  {/* Drag indicator */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✋</span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
        </div>
      </div>
    </div>
  );
}
