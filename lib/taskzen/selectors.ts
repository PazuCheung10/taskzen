import { ColumnId, Card, Board } from './types';

export const selectColumn = (board: Board, columnId: ColumnId) => {
  return board.columns[columnId];
};

export const selectCardsInColumn = (board: Board, columnId: ColumnId): Card[] => {
  const column = selectColumn(board, columnId);
  return column.cardOrder
    .map((cardId) => board.cards[cardId])
    .filter(Boolean);
};

export const searchCards = (board: Board, query: string): Card[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  return Object.values(board.cards).filter((card) =>
    card.title.toLowerCase().includes(searchTerm) ||
    (card.description && card.description.toLowerCase().includes(searchTerm))
  );
};

export const getCardCount = (board: Board, columnId: ColumnId): number => {
  return selectColumn(board, columnId).cardOrder.length;
};

export const getTotalCardCount = (board: Board): number => {
  return Object.values(board.columns).reduce(
    (total, column) => total + column.cardOrder.length,
    0
  );
};
