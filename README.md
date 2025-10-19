# TaskZen - Kanban Board

A minimalist Kanban-style productivity app built with Next.js 14, TypeScript, and Zustand.

## Features

- **Three Columns**: Todo, Doing, Done
- **Card Management**: Add, edit, delete cards with title and optional description
- **Drag & Drop**: Move cards between columns and reorder within columns
- **Persistence**: Automatic localStorage persistence with namespace `taskzen:v1`
- **Search**: Filter cards by title or description
- **Export/Import**: JSON export and import functionality
- **Accessibility**: Keyboard-first design with proper ARIA labels

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. Navigate to `/taskzen` to access the Kanban board

## Project Structure

```
/app
  /(app)/taskzen/
    page.tsx                # Server component entry
    TaskzenClient.tsx       # Client component root
/components/taskzen/
  Column.tsx                # Column wrapper
  CardItem.tsx              # Task card component
  NewCardForm.tsx           # Input form for new tasks
  Toolbar.tsx               # Search/Export/Import controls
/lib/taskzen/
  types.ts                  # Type definitions
  store.ts                  # Zustand store with persistence
  selectors.ts              # Derived state helpers
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Persistence**: localStorage

## Development

The app is built with a clean separation of concerns:

- **Store**: All business logic lives in `/lib/taskzen/store.ts`
- **Components**: UI components are isolated and self-contained
- **Selectors**: Derived state helpers in `/lib/taskzen/selectors.ts`
- **Types**: Shared type definitions in `/lib/taskzen/types.ts`

## License

This project is part of the Pazu Creates Portfolio series.
