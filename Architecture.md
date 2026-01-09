# 🧱 TaskZen – Architecture Overview

## 1. Purpose
TaskZen is a minimalist **Kanban-style productivity app** built for interaction design and client-side architecture demonstration.

It’s part of the **Pazu Creates Portfolio** series, alongside:
- **InsightBoard (Data Dashboard)** – data visualization and API handling
- **TaskZen (Kanban)** – offline-first state management and UI logic
- **Portfolio Website** – design, animation, and presentation

TaskZen focuses on **state logic clarity**, **offline persistence**, and **keyboard-friendly interaction**, without external databases or APIs.

---

## 2. Tech Stack
| Layer | Technology | Purpose |
|-------|-------------|----------|
| Framework | **Next.js (App Router)** | Routing, layout, page structure |
| Language | **TypeScript** | Strong typing & safer refactors |
| Styling | **Tailwind CSS** | Utility-first responsive styling |
| State Management | **Zustand** | Lightweight store for CRUD & persistence |
| Persistence | **localStorage** | Offline board state saving |
| Drag & Drop | **@dnd-kit** | Smooth drag-and-drop interactions |
| Animation | **CSS Transitions** | Smooth UI transitions and feedback |

---

## 3. Directory Structure
/app
/taskzen/
page.tsx                # Server component entry
TaskzenClient.tsx       # Client component root (mounts Zustand logic)
/globals.css              # Base styles
/components/taskzen/
Column.tsx                # Column wrapper with drag-and-drop support
CardItem.tsx              # Task card (CRUD, edit mode, drag handle)
NewCardForm.tsx           # Input form for new tasks
Toolbar.tsx               # Search / Export / Import / Clear controls
/lib/taskzen/
types.ts                  # Shared type definitions
store.ts                  # Zustand store + localStorage persistence
selectors.ts              # Derived selectors (filter/search)
---

## 4. Design Principles

### 🧩 Modularity
- Each UI piece (Column, CardItem, Toolbar) is isolated and self-contained.  
- The store exposes clean actions (`addCard`, `moveCard`, `editCard`, `reorderCard`, etc.) with no side effects outside Zustand.

### 💾 Persistence & Offline-First
- Board state is automatically serialized to `localStorage["taskzen:v1"]`.
- On load, the app hydrates from storage; no backend required.
- Works fully offline after first load.

### ⚙️ State Shape (Simplified)
```ts
type ColumnId = 'todo' | 'doing' | 'done';
type Card = { id: string; title: string; description?: string };
type Column = { id: ColumnId; title: string; cardOrder: string[] };
type Board = {
  columns: Record<ColumnId, Column>;
  cards: Record<string, Card>;
};
```

### 🔁 Actions
- `addCard(col, {title, description})` - Add new card to column
- `editCard(id, patch)` - Update card title/description
- `deleteCard(id)` - Remove card from board
- `moveCard(id, toCol, index?)` - Move card between columns
- `reorderCard(col, id, toIndex)` - Reorder card within column
- `clearAll()` - Reset entire board
- `importJSON(board)` - Load board from JSON
- `exportJSON() → string` - Export board as JSON
## 5. Data Flow
**User Action → Zustand Store (mutation) → localStorage Sync → Re-render via Selectors → UI Update**

- All business logic lives in `/lib/taskzen/store.ts`
- Components never mutate data directly; they dispatch actions
- Selectors in `/lib/taskzen/selectors.ts` provide filtered views (e.g., search query)

## 6. UI Flow
```
Toolbar
 ├── Search → filters board view
 ├── Export → clipboard JSON
 ├── Import → file picker → store.importJSON()
 └── Clear All → store.clearAll()

TaskzenClient (DndContext)
 ├── Column (Todo) [SortableContext]
 │   ├── NewCardForm
 │   ├── CardItem[] (DraggableCard)
 │   └── Bottom Dropzone
 ├── Column (Doing) [SortableContext]
 └── Column (Done) [SortableContext]
```

## 7. Drag & Drop Architecture
- **@dnd-kit/core**: Main drag-and-drop context and collision detection
- **@dnd-kit/sortable**: Vertical list sorting within columns
- **DragOverlay**: Visual feedback during drag operations
- **Placeholder System**: Shows drop position for cross-column drags
- **Single Edit Mode**: Only one card can be edited at a time

## 8. Styling & Interaction Rules
- **Tailwind conventions:**
  - Spacing: `px-6 py-4`, `gap-4`
  - Color: `bg-slate-800`, `text-slate-100`
  - Focus ring: `focus:outline-none focus:ring-2 focus:ring-cyan-400`
  - Typography: `font-medium` for headings, `text-sm` for descriptions
  - Responsive layout: 1 column on mobile, 3 columns on desktop (`grid-cols-1 lg:grid-cols-3`)
  - Animations: smooth transitions with `transition-all duration-300`
  - Glass-morphism: `backdrop-blur-sm bg-white/10` for modern UI

## 9. Accessibility & UX
- **Keyboard shortcuts:**
  - `Enter` to confirm edit
  - `Ctrl+Enter` to save edits
  - `Esc` to cancel
  - `Tab` through interactive elements
- All buttons include `aria-label` attributes
- Search is non-destructive: filters visible cards only
- Single edit mode prevents UI conflicts
- Drag-and-drop works with keyboard navigation

## 10. Future Enhancements
- ✅ Drag-and-drop with @dnd-kit
- ⏳ Board export/import per user profile (taskzen:<slug>)
- ⏳ Tagging, priorities, and filtering
- ⏳ Light/Dark theme toggle
- ⏳ Server sync (Supabase / Appwrite) if expanded

⸻

## 11. Summary

TaskZen demonstrates a clean, offline-first, reactive client architecture for small-scale productivity tools.
It shows how to design well-structured local state, maintain immutability, and deliver a smooth UX even without a backend.

"Simple architecture, instant feedback — the beauty of local-first design."