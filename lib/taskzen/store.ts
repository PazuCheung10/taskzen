import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskzenStore, ColumnId, Board, Card } from './types';

const STORAGE_KEY = 'taskzen:v1';

const emptyBoard: Board = {
  columns: {
    todo: {
      id: 'todo',
      title: 'Todo',
      cardOrder: [],
    },
    doing: {
      id: 'doing',
      title: 'Doing',
      cardOrder: [],
    },
    done: {
      id: 'done',
      title: 'Done',
      cardOrder: [],
    },
  },
  cards: {},
};

const seedBoard: Board = {
  columns: {
    todo: {
      id: 'todo',
      title: 'Todo',
      cardOrder: ['demo-1', 'demo-2', 'demo-3'],
    },
    doing: {
      id: 'doing',
      title: 'Doing',
      cardOrder: ['demo-4', 'demo-5'],
    },
    done: {
      id: 'done',
      title: 'Done',
      cardOrder: ['demo-6'],
    },
  },
  cards: {
    'demo-1': {
      id: 'demo-1',
      title: 'Explore the board',
      description: 'Drag cards between columns and reorder within a column.',
    },
    'demo-2': {
      id: 'demo-2',
      title: 'Try search',
      description: 'Type in the Search box to filter cards live (non-destructive).',
    },
    'demo-3': {
      id: 'demo-3',
      title: 'Add your first task',
      description: 'Click “Add Card” in any column to create a new item.',
    },
    'demo-4': {
      id: 'demo-4',
      title: 'Edit a card',
      description: 'Hover a card to reveal Edit. Only one card can be edited at a time.',
    },
    'demo-5': {
      id: 'demo-5',
      title: 'Export / Import',
      description: 'Use Actions → Export to copy JSON, then Import to restore it.',
    },
    'demo-6': {
      id: 'demo-6',
      title: 'Works offline',
      description: 'State persists via localStorage — refresh and everything stays.',
    },
  },
};

export const useTaskzenStore = create<TaskzenStore & { hasHydrated: boolean }>()(
  persist(
    (set, get) => ({
      ...emptyBoard, // Start with empty to avoid flash
      hasHydrated: false,

      addCard: (col: ColumnId, input: { title: string; description?: string }) => {
        const id = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newCard: Card = {
          id,
          title: input.title,
          description: input.description,
        };

        set((state) => ({
          cards: {
            ...state.cards,
            [id]: newCard,
          },
          columns: {
            ...state.columns,
            [col]: {
              ...state.columns[col],
              cardOrder: [...state.columns[col].cardOrder, id],
            },
          },
        }));
      },

      editCard: (id: string, patch: Partial<Omit<Card, 'id'>>) => {
        set((state) => ({
          cards: {
            ...state.cards,
            [id]: {
              ...state.cards[id],
              ...patch,
            },
          },
        }));
      },

      deleteCard: (id: string) => {
        set((state) => {
          const newCards = { ...state.cards };
          delete newCards[id];

          const newColumns = { ...state.columns };
          Object.keys(newColumns).forEach((colId) => {
            newColumns[colId as ColumnId] = {
              ...newColumns[colId as ColumnId],
              cardOrder: newColumns[colId as ColumnId].cardOrder.filter((cardId) => cardId !== id),
            };
          });

          return {
            cards: newCards,
            columns: newColumns,
          };
        });
      },

      moveCard: (id: string, toCol: ColumnId, index?: number) => {
        set((state) => {
          const newColumns = { ...state.columns };
          
          // Remove from current column
          Object.keys(newColumns).forEach((colId) => {
            if (newColumns[colId as ColumnId].cardOrder.includes(id)) {
              newColumns[colId as ColumnId] = {
                ...newColumns[colId as ColumnId],
                cardOrder: newColumns[colId as ColumnId].cardOrder.filter((cardId) => cardId !== id),
              };
            }
          });

          // Add to target column
          const targetIndex = index !== undefined ? index : newColumns[toCol].cardOrder.length;
          newColumns[toCol] = {
            ...newColumns[toCol],
            cardOrder: [
              ...newColumns[toCol].cardOrder.slice(0, targetIndex),
              id,
              ...newColumns[toCol].cardOrder.slice(targetIndex),
            ],
          };

          return { columns: newColumns };
        });
      },

      reorderCard: (col: ColumnId, id: string, toIndex: number) => {
        set((state) => {
          const column = state.columns[col];
          const currentIndex = column.cardOrder.indexOf(id);
          
          if (currentIndex === -1) return state;

          const newCardOrder = [...column.cardOrder];
          newCardOrder.splice(currentIndex, 1);
          newCardOrder.splice(toIndex, 0, id);

          return {
            columns: {
              ...state.columns,
              [col]: {
                ...column,
                cardOrder: newCardOrder,
              },
            },
          };
        });
      },

      clearAll: () => {
        set({ ...emptyBoard, hasHydrated: true });
      },

      importJSON: (data: Board) => {
        set({ ...data, hasHydrated: true });
      },

      exportJSON: () => {
        const state = get();
        return JSON.stringify({
          version: 1,
          board: {
            columns: state.columns,
            cards: state.cards,
          },
        }, null, 2);
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check if this is a fresh install (no persisted data)
          const hasAnyCards = Object.keys(state.cards).length > 0;
          const hasAnyCardOrders = Object.values(state.columns).some(col => col.cardOrder.length > 0);
          const isFreshInstall = !hasAnyCards && !hasAnyCardOrders;

          // If fresh install, seed with demo data
          if (isFreshInstall) {
            state.columns = seedBoard.columns;
            state.cards = seedBoard.cards;
          } else {
            // Ensure all required columns exist
            const requiredColumns: ColumnId[] = ['todo', 'doing', 'done'];
            requiredColumns.forEach((colId) => {
              if (!state.columns[colId]) {
                state.columns[colId] = {
                  id: colId,
                  title: colId.charAt(0).toUpperCase() + colId.slice(1),
                  cardOrder: [],
                };
              }
            });
          }

          // Mark as hydrated
          state.hasHydrated = true;
        }
      },
    }
  )
);
