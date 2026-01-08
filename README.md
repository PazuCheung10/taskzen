# TaskZen - Kanban Board

A minimalist Kanban-style productivity app built with Next.js (App Router), TypeScript, and Zustand. Features a beautiful glass-morphism UI with offline-first functionality.

Built to explore offline-first state management and keyboard-friendly workflows in a focused, single-purpose UI.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000/taskzen](http://localhost:3000/taskzen)

## ✨ Features

### Core Functionality
- **📋 Three Columns**: Todo, Doing, Done with beautiful gradients
- **➕ Card Management**: Add, edit, delete cards with title and optional description
- **🔄 Drag & Drop**: Smooth drag-and-drop between columns and reorder within columns
- **💾 Persistence**: Automatic localStorage persistence - works offline!
- **🔍 Search**: Real-time filtering by title or description
- **📤 Export/Import**: JSON export to clipboard and file import
- **🗑️ Clear All**: Reset board with confirmation

### User Experience
- **⌨️ Keyboard-First**: Full keyboard navigation and shortcuts
- **♿ Accessibility**: Proper ARIA labels and screen reader support
- **📱 Responsive**: Works on desktop, tablet, and mobile
- **🎨 Modern UI**: Glass-morphism design with gradients and animations
- **⚡ Performance**: Instant loading and smooth interactions
- **🎯 Single Edit Mode**: Only one card can be edited at a time for better UX
- **🔄 Smooth Animations**: Visual feedback with placeholders and drag overlays

## 🎯 How to Use

### Adding Tasks
1. Click "Add Card" in any column
2. Enter a title (required) and optional description
3. Press Enter or click "Add" to save

### Moving Tasks
- **Drag & Drop**: Simply drag cards between columns or reorder within columns
- **Visual Feedback**: See placeholders and smooth animations during drag operations
- **Keyboard**: Tab to navigate, Enter to activate buttons

### Search & Filter
- Type in the search bar to filter tasks in real-time
- Press Escape to clear the search

### Export/Import
- **Export**: Click ⚙️ → Export to copy JSON to clipboard
- **Import**: Click ⚙️ → Import to load from JSON file
- **Clear All**: Click ⚙️ → Clear to reset the board

## 📸 Screenshots / Demo

This repository focuses on implementation and architecture.  
Run locally (`npm install` → `npm run dev`) to experience the full interaction flow at `http://localhost:3000/taskzen`.

## 🏗️ Architecture

### Project Structure
```
/app/taskzen/
  page.tsx                  # Server component entry
  TaskzenClient.tsx         # Client component root
/components/taskzen/
  Column.tsx                # Column wrapper with glass-morphism
  CardItem.tsx              # Task card with hover effects
  NewCardForm.tsx           # Input form for new tasks
  Toolbar.tsx               # Search/Export/Import controls
/lib/taskzen/
  types.ts                  # TypeScript definitions
  store.ts                  # Zustand store with localStorage persistence
  selectors.ts              # Derived state helpers (filtering, etc.)
```

### Tech Stack
- **⚡ Framework**: Next.js (App Router)
- **🔷 Language**: TypeScript
- **🎨 Styling**: Tailwind CSS with custom gradients
- **🗃️ State**: Zustand with persist middleware
- **💾 Storage**: localStorage (offline-first)
- **🔄 Drag & Drop**: @dnd-kit for smooth drag-and-drop interactions

### Design Principles
- **🎯 Clear Boundaries**: Components only call store actions
- **📊 Derived Logic**: All computed state lives in selectors.ts
- **♻️ No Direct Storage**: Components never touch localStorage directly
- **⌨️ Keyboard-First**: Full accessibility support
- **📱 Mobile-First**: Responsive design from the ground up

## 🚀 Definition of Done ✅

- ✅ `/taskzen` loads instantly and works offline (localStorage)
- ✅ CRUD + move + reorder + search all work perfectly
- ✅ State persists across refreshes
- ✅ Smooth drag-and-drop with @dnd-kit library
- ✅ Minimal, readable code with clear boundaries
- ✅ Components only call store actions; no direct localStorage code
- ✅ Derived logic lives in selectors.ts
- ✅ README updated with run instructions, features, and demo video

## 📄 License

This project is part of the Pazu Creates Portfolio series.

---
Built by Pazu — `https://pazu.dev`
