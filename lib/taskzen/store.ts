import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskzenStore, ColumnId, Board, Card } from './types';

const STORAGE_KEY = 'taskzen:v1';

const initialBoard: Board = {
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

export const useTaskzenStore = create<TaskzenStore>()(
  persist(
    (set, get) => ({
      ...initialBoard,

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
        set(initialBoard);
      },

      importJSON: (data: Board) => {
        set(data);
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
      },
    }
  )
);
