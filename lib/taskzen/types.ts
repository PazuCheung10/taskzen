export type ColumnId = 'todo' | 'doing' | 'done';

export type Card = {
  id: string;
  title: string;
  description?: string;
};

export type Column = {
  id: ColumnId;
  title: string;
  cardOrder: string[];
};

export type Board = {
  columns: Record<ColumnId, Column>;
  cards: Record<string, Card>;
};

export type Actions = {
  addCard: (col: ColumnId, input: { title: string; description?: string }) => void;
  editCard: (id: string, patch: Partial<Omit<Card, 'id'>>) => void;
  deleteCard: (id: string) => void;
  moveCard: (id: string, toCol: ColumnId, index?: number) => void;
  reorderCard: (col: ColumnId, id: string, toIndex: number) => void;
  clearAll: () => void;
  importJSON: (data: Board) => void;
  exportJSON: () => string;
};

export type TaskzenStore = Board & Actions;
