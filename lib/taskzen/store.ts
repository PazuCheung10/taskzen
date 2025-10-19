import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskzenStore, ColumnId, Board, Card, Tag, Profile } from './types';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Create slug from name
const createSlug = (name: string) => 
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

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
    archive: {
      id: 'archive',
      title: 'Archive',
      cardOrder: [],
    },
  },
  cards: {},
  tags: {},
  profileName: 'default',
};

// Profile management
const PROFILES_KEY = 'taskzen:profiles';

const getProfiles = (): Profile[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(PROFILES_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveProfiles = (profiles: Profile[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

const updateProfileAccess = (profileId: string) => {
  const profiles = getProfiles();
  const profile = profiles.find(p => p.id === profileId);
  if (profile) {
    profile.lastAccessed = Date.now();
    saveProfiles(profiles);
  }
};

export const useTaskzenStore = create<TaskzenStore>()(
  persist(
    (set, get) => ({
      ...initialBoard,

      // Card operations
      addCard: (col: ColumnId, input: { title: string; description?: string; tags?: string[] }) => {
        const id = generateId();
        const now = Date.now();
        
        set((state) => {
          const newCard: Card = {
            id,
            title: input.title,
            description: input.description,
            tags: input.tags || [],
            archived: false,
            createdAt: now,
            updatedAt: now,
          };

          return {
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
          };
        });
      },

      editCard: (id: string, patch: Partial<Omit<Card, 'id'>>) => {
        set((state) => {
          const card = state.cards[id];
          if (!card) return state;

          return {
            cards: {
              ...state.cards,
              [id]: {
                ...card,
                ...patch,
                updatedAt: Date.now(),
              },
            },
          };
        });
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

      archiveCard: (id: string) => {
        set((state) => {
          const card = state.cards[id];
          if (!card) return state;

          // Remove from current column
          const newColumns = { ...state.columns };
          Object.keys(newColumns).forEach((colId) => {
            if (newColumns[colId as ColumnId].cardOrder.includes(id)) {
              newColumns[colId as ColumnId] = {
                ...newColumns[colId as ColumnId],
                cardOrder: newColumns[colId as ColumnId].cardOrder.filter((cardId) => cardId !== id),
              };
            }
          });

          // Add to archive
          newColumns.archive = {
            ...newColumns.archive,
            cardOrder: [...newColumns.archive.cardOrder, id],
          };

          return {
            cards: {
              ...state.cards,
              [id]: {
                ...card,
                archived: true,
                updatedAt: Date.now(),
              },
            },
            columns: newColumns,
          };
        });
      },

      restoreCard: (id: string) => {
        set((state) => {
          const card = state.cards[id];
          if (!card) return state;

          // Remove from archive
          const newColumns = { ...state.columns };
          newColumns.archive = {
            ...newColumns.archive,
            cardOrder: newColumns.archive.cardOrder.filter((cardId) => cardId !== id),
          };

          // Add to todo
          newColumns.todo = {
            ...newColumns.todo,
            cardOrder: [...newColumns.todo.cardOrder, id],
          };

          return {
            cards: {
              ...state.cards,
              [id]: {
                ...card,
                archived: false,
                updatedAt: Date.now(),
              },
            },
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

      // Tag operations
      addTag: (tag: Omit<Tag, 'id'>) => {
        const id = generateId();
        const newTag: Tag = { ...tag, id };
        
        set((state) => ({
          tags: {
            ...state.tags,
            [id]: newTag,
          },
        }));
        
        return id;
      },

      editTag: (id: string, patch: Partial<Omit<Tag, 'id'>>) => {
        set((state) => {
          const tag = state.tags[id];
          if (!tag) return state;

          return {
            tags: {
              ...state.tags,
              [id]: {
                ...tag,
                ...patch,
              },
            },
          };
        });
      },

      deleteTag: (id: string) => {
        set((state) => {
          const newTags = { ...state.tags };
          delete newTags[id];

          // Remove tag from all cards
          const newCards = { ...state.cards };
          Object.keys(newCards).forEach((cardId) => {
            newCards[cardId] = {
              ...newCards[cardId],
              tags: newCards[cardId].tags.filter((tagId) => tagId !== id),
            };
          });

          return {
            tags: newTags,
            cards: newCards,
          };
        });
      },

      addCardTag: (cardId: string, tagId: string) => {
        set((state) => {
          const card = state.cards[cardId];
          if (!card || card.tags.includes(tagId)) return state;

          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                tags: [...card.tags, tagId],
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      removeCardTag: (cardId: string, tagId: string) => {
        set((state) => {
          const card = state.cards[cardId];
          if (!card) return state;

          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                tags: card.tags.filter((id) => id !== tagId),
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      // Profile operations
      createProfile: (name: string) => {
        const id = generateId();
        const slug = createSlug(name);
        const profile: Profile = {
          id,
          name,
          slug,
          lastAccessed: Date.now(),
        };

        const profiles = getProfiles();
        profiles.push(profile);
        saveProfiles(profiles);

        return id;
      },

      switchProfile: (profileId: string) => {
        const profiles = getProfiles();
        const profile = profiles.find(p => p.id === profileId);
        if (!profile) return;

        updateProfileAccess(profileId);
        
        set((state) => ({
          ...state,
          profileName: profile.name,
        }));
      },

      deleteProfile: (profileId: string) => {
        const profiles = getProfiles();
        const filteredProfiles = profiles.filter(p => p.id !== profileId);
        saveProfiles(filteredProfiles);
      },

      renameProfile: (profileId: string, newName: string) => {
        const profiles = getProfiles();
        const profile = profiles.find(p => p.id === profileId);
        if (!profile) return;

        profile.name = newName;
        profile.slug = createSlug(newName);
        saveProfiles(profiles);

        set((state) => ({
          ...state,
          profileName: newName,
        }));
      },

      getProfiles: () => getProfiles(),

      // Board operations
      clearAll: () => {
        set(() => ({
          ...initialBoard,
          profileName: get().profileName,
        }));
      },

      importJSON: (data: Board) => {
        set(() => ({
          ...data,
          profileName: get().profileName,
        }));
      },

      exportJSON: () => {
        const state = get();
        return JSON.stringify({
          version: 1,
          board: {
            columns: state.columns,
            cards: state.cards,
            tags: state.tags,
            profileName: state.profileName,
          },
        });
      },
    }),
    {
      name: 'taskzen:v1',
      partialize: (state) => ({
        columns: state.columns,
        cards: state.cards,
        tags: state.tags,
        profileName: state.profileName,
      }),
    }
  )
);