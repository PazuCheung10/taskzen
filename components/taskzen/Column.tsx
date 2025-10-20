'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskzenStore } from '@/lib/taskzen/store';
import { selectCardsInColumn, filterBoard } from '@/lib/taskzen/selectors';
import { ColumnId, Card } from '@/lib/taskzen/types';
import NewCardForm from './NewCardForm';
import CardItem from './CardItem';

interface ColumnProps {
  columnId: ColumnId;
  title: string;
  searchQuery: string;
  activeCardId?: string;
  dragOverInfo?: {
    columnId: ColumnId;
    position: number;
  } | null;
}

// Draggable Card Component
function DraggableCard({ card, columnId, isEditing, onEditStateChange, activeCardId }: { 
  card: any; 
  columnId: ColumnId; 
  isEditing: boolean;
  onEditStateChange: (cardId: string, isEditing: boolean) => void;
  activeCardId?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: card.id,
    disabled: isEditing // Disable dragging when editing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || activeCardId === card.id ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardItem 
        card={card} 
        columnId={columnId} 
        onEditStateChange={(editing) => onEditStateChange(card.id, editing)}
        isHovered={isHovered}
      />
      {/* Drag Handle - only show when not editing */}
      {!isEditing && (
        <div
          {...listeners}
          className="absolute left-0 top-0 bottom-0 w-3/4 cursor-grab active:cursor-grabbing z-0"
          style={{ 
            background: 'transparent',
            pointerEvents: 'auto',
          }}
        />
      )}
    </div>
  );
}

export default function Column({ columnId, title, searchQuery, activeCardId, dragOverInfo }: ColumnProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const { columns, cards } = useTaskzenStore();
  
  // Apply search filter if there's a query
  const filteredBoard = searchQuery ? filterBoard({ columns, cards }, searchQuery) : { columns, cards };
  const filteredCards = selectCardsInColumn(filteredBoard, columnId);

  // Make column droppable
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: columnId,
  });


  const handleAddCard = () => {
    if (showAddForm) return; // Prevent multiple clicks
    setShowAddForm(true);
  };

  const handleFormSubmit = () => {
    setShowAddForm(false);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
  };

  const handleEditStateChange = (cardId: string, isEditing: boolean) => {
    if (isEditing) {
      setEditingCardId(cardId);
    } else {
      setEditingCardId(null);
    }
  };

  // Check if this column should show a placeholder
  const shouldShowPlaceholder =
    dragOverInfo?.columnId === columnId &&
    activeCardId &&
    (() => {
      let activeColumn: ColumnId | null = null;
      for (const [cid, col] of Object.entries(columns)) {
        if (col.cardOrder.includes(activeCardId)) {
          activeColumn = cid as ColumnId;
          break;
        }
      }
      return activeColumn !== columnId; // show placeholder only for cross-column drags
    })();
  const placeholderPosition = dragOverInfo?.position || 0;

  // Placeholder Component
  const PlaceholderCard = () => (
    <div className="backdrop-blur-sm bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border-2 border-dashed border-cyan-400/60 rounded-xl p-4 shadow-lg animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-gradient-to-r from-cyan-400/40 to-blue-500/40 rounded w-3/4"></div>
        <div className="h-3 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded w-1/2"></div>
      </div>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-500/10"></div>
    </div>
  );

  const getColumnGradient = (columnId: ColumnId) => {
    switch (columnId) {
      case 'todo':
        return 'from-orange-500/30 to-red-500/30 border-orange-400/50 bg-orange-500/5';
      case 'doing':
        return 'from-blue-500/30 to-indigo-500/30 border-blue-400/50 bg-blue-500/5';
      case 'done':
        return 'from-emerald-500/30 to-green-500/30 border-emerald-400/50 bg-emerald-500/5';
      default:
        return 'from-slate-500/30 to-slate-600/30 border-slate-400/50 bg-slate-500/5';
    }
  };

  const getColumnIcon = (columnId: ColumnId) => {
    switch (columnId) {
      case 'todo':
        return '📝';
      case 'doing':
        return '⚡';
      case 'done':
        return '✅';
      default:
        return '📋';
    }
  };

  return (
    <div className={`backdrop-blur-lg bg-gradient-to-b ${getColumnGradient(columnId)} border rounded-2xl p-6 min-h-[600px] flex flex-col shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden`}>
      {/* Column Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">
              {title}
            </h2>
            <p className="text-sm text-slate-300 font-medium">
              {filteredCards.length} {filteredCards.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        </div>
        <button
          onClick={handleAddCard}
          disabled={showAddForm}
          className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          aria-label={`Add new card to ${title} column`}
        >
          <span className="relative z-10 flex items-center gap-2">
            {showAddForm ? '⏳' : '✨'} {showAddForm ? 'Adding...' : 'Add Card'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
      
      {/* New Card Form - Only show when toggled */}
      {showAddForm && (
        <div className="relative z-10 mb-4">
          <NewCardForm 
            columnId={columnId} 
            onSuccess={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      )}
      
          {/* Cards List */}
          <div className="relative z-10 flex-1 space-y-4" ref={setDroppableRef}>
            {(() => {
              const cardsWithPlaceholder: (Card | null)[] = [...filteredCards];
              
              // Insert placeholder at the correct position if this column should show it
              if (shouldShowPlaceholder && activeCardId) {
                // Ensure position is within bounds
                const maxPosition = cardsWithPlaceholder.length;
                const safePosition = Math.min(Math.max(placeholderPosition, 0), maxPosition);
                cardsWithPlaceholder.splice(safePosition, 0, null);
              }
              
              return (
                <SortableContext
                  items={cardsWithPlaceholder
                    .filter(Boolean)
                    .map((c) => (c as Card).id)
                    .concat(`${columnId}__tail`)} // add tail at the end
                  strategy={verticalListSortingStrategy}
                >
                  {/* If no cards and no placeholder, show empty state */}
                  {cardsWithPlaceholder.length === 0 ? (
                    <div className="text-center py-12">
                      {!showAddForm && (
                        <div className="text-6xl mb-4 opacity-50">
                          {searchQuery ? '🔍' : getColumnIcon(columnId)}
                        </div>
                      )}
                      {searchQuery && (
                        <p className="text-slate-300 text-lg font-medium mb-2">
                          No tasks match "{searchQuery}"
                        </p>
                      )}
                      {!searchQuery && !showAddForm && (
                        <p className="text-slate-400 text-sm">
                          Click "Add Card" to get started
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Render cards and placeholder */}
                      {cardsWithPlaceholder.map((card, index) => {
                        // Render placeholder
                        if (card === null) {
                          return <PlaceholderCard key={`placeholder-${columnId}-${placeholderPosition}`} />;
                        }
                        
                        // Render actual card
                        return (
                          <DraggableCard
                            key={card.id}
                            card={card}
                            columnId={columnId}
                            isEditing={editingCardId === card.id}
                            onEditStateChange={handleEditStateChange}
                            activeCardId={activeCardId}
                          />
                        );
                      })}
                      
                      {/* Render an invisible tail sentinel */}
                      <div id={`${columnId}__tail`} className="h-6" />
                    </>
                  )}
                </SortableContext>
              );
            })()}
          </div>
    </div>
  );
}
