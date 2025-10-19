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

export const filterBoard = (board: Board, query: string): Board => {
  if (!query.trim()) return board;
  
  const searchTerm = query.toLowerCase();
  const filteredCards: Record<string, Card> = {};
  const filteredColumns = { ...board.columns };
  
  // Filter cards that match the search query
  Object.values(board.cards).forEach((card) => {
    const matchesTitle = card.title.toLowerCase().includes(searchTerm);
    const matchesDescription = card.description?.toLowerCase().includes(searchTerm) || false;
    
    if (matchesTitle || matchesDescription) {
      filteredCards[card.id] = card;
    }
  });
  
  // Update column card orders to only include filtered cards
  Object.keys(filteredColumns).forEach((columnId) => {
    const column = filteredColumns[columnId as keyof typeof filteredColumns];
    filteredColumns[columnId as keyof typeof filteredColumns] = {
      ...column,
      cardOrder: column.cardOrder.filter((cardId) => cardId in filteredCards),
    };
  });
  
  return {
    columns: filteredColumns,
    cards: filteredCards,
  };
};
