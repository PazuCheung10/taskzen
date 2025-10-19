'use client';

import { useState } from 'react';
import { useTaskzenStore } from '@/lib/taskzen/store';
import { selectCardsInColumn } from '@/lib/taskzen/selectors';
import { ColumnId } from '@/lib/taskzen/types';
import NewCardForm from './NewCardForm';
import CardItem from './CardItem';

interface ColumnProps {
  columnId: ColumnId;
  title: string;
}

export default function Column({ columnId, title }: ColumnProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const { columns, reorderCard } = useTaskzenStore();
  const cards = selectCardsInColumn({ columns }, columnId);

  const handleMoveUp = (cardId: string) => {
    const currentIndex = columns[columnId].cardOrder.indexOf(cardId);
    if (currentIndex > 0) {
      reorderCard(columnId, cardId, currentIndex - 1);
    }
  };

  const handleMoveDown = (cardId: string) => {
    const currentIndex = columns[columnId].cardOrder.indexOf(cardId);
    if (currentIndex < cards.length - 1) {
      reorderCard(columnId, cardId, currentIndex + 1);
    }
  };

  const handleAddCard = () => {
    setShowAddForm(true);
  };

  const handleFormSubmit = () => {
    setShowAddForm(false);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
  };

  const canMoveLeft = columnId !== 'todo';
  const canMoveRight = columnId !== 'done';

  return (
    <div className="bg-slate-700 rounded-lg p-4 min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-slate-100">
          {title} ({cards.length})
        </h2>
        <button
          onClick={handleAddCard}
          className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm px-3 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          + Add Card
        </button>
      </div>
      
      {/* New Card Form - Only show when toggled */}
      {showAddForm && (
        <div className="mb-4">
          <NewCardForm 
            columnId={columnId} 
            onSuccess={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      )}
      
      {/* Cards List */}
      <div className="flex-1 space-y-3">
        {cards.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-8">
            {showAddForm ? 'Fill out the form above to add your first card' : 'No cards yet'}
          </div>
        ) : (
          cards.map((card, index) => (
            <CardItem
              key={card.id}
              card={card}
              columnId={columnId}
              canMoveLeft={canMoveLeft}
              canMoveRight={canMoveRight}
              canMoveUp={index > 0}
              canMoveDown={index < cards.length - 1}
              onMoveUp={() => handleMoveUp(card.id)}
              onMoveDown={() => handleMoveDown(card.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
