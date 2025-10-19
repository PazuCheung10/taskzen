export type ColumnId = 'todo' | 'doing' | 'done' | 'archive';

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type Card = {
  id: string;
  title: string;
  description?: string;
  tags: string[]; // Array of tag IDs
  archived: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Column = {
  id: ColumnId;
  title: string;
  cardOrder: string[];
};

export type Board = {
  columns: Record<ColumnId, Column>;
  cards: Record<string, Card>;
  tags: Record<string, Tag>;
  profileName: string;
};

export type Profile = {
  id: string;
  name: string;
  slug: string;
  lastAccessed: number;
};

export type Actions = {
  // Card operations
  addCard: (col: ColumnId, input: { title: string; description?: string; tags?: string[] }) => void;
  editCard: (id: string, patch: Partial<Omit<Card, 'id'>>) => void;
  deleteCard: (id: string) => void;
  archiveCard: (id: string) => void;
  restoreCard: (id: string) => void;
  moveCard: (id: string, toCol: ColumnId, index?: number) => void;
  reorderCard: (col: ColumnId, id: string, toIndex: number) => void;
  
  // Tag operations
  addTag: (tag: Omit<Tag, 'id'>) => string;
  editTag: (id: string, patch: Partial<Omit<Tag, 'id'>>) => void;
  deleteTag: (id: string) => void;
  addCardTag: (cardId: string, tagId: string) => void;
  removeCardTag: (cardId: string, tagId: string) => void;
  
  // Profile operations
  createProfile: (name: string) => string;
  switchProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  renameProfile: (profileId: string, newName: string) => void;
  getProfiles: () => Profile[];
  
  // Board operations
  clearAll: () => void;
  importJSON: (data: Board) => void;
  exportJSON: () => string;
};

export type TaskzenStore = Board & Actions;
