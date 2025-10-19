'use client';

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

  const canMoveLeft = columnId !== 'todo';
  const canMoveRight = columnId !== 'done';

  return (
    <div className="bg-slate-700 rounded-lg p-4 min-h-[500px] flex flex-col">
      <h2 className="text-xl font-medium mb-4 text-slate-100">
        {title} ({cards.length})
      </h2>
      
      {/* New Card Form */}
      <div className="mb-4">
        <NewCardForm columnId={columnId} />
      </div>
      
      {/* Cards List */}
      <div className="flex-1 space-y-3">
        {cards.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-8">
            No cards yet
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
