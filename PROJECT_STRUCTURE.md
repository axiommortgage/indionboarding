# Project Structure - Feature Sliced Design

This project follows a modern Feature Sliced Design (FSD) architecture with Next.js App Router.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Shadcn/ui
- **Language**: TypeScript
- **Testing**: Jest + React Testing Library
- **Backend**: Strapi v3 integration
- **Architecture**: Feature Sliced Design

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── shared/                # Shared utilities and components
│   ├── ui/                # Reusable UI components (Shadcn)
│   ├── lib/               # Utility functions
│   │   ├── utils.ts       # Shadcn utils
│   │   └── api.ts         # API client for Strapi
│   ├── hooks/             # Shared custom hooks
│   │   └── use-api.ts     # API data fetching hook
│   ├── types/             # Shared TypeScript types
│   │   ├── api.ts         # API and Strapi types
│   │   └── global.d.ts    # Global type declarations
│   └── utils/             # General utilities
└── features/              # Feature-specific code
    └── example-feature/   # Example feature implementation
        ├── components/    # Feature components
        ├── hooks/         # Feature-specific hooks
        ├── actions/       # Server actions
        ├── lib/           # Feature utilities
        ├── types/         # Feature types
        └── __tests__/     # Feature tests
```

## Feature Sliced Design Principles

### 1. Shared Layer

Contains reusable code that can be used across multiple features:

- UI components (Shadcn/ui based)
- API utilities
- Common hooks
- Type definitions

### 2. Features Layer

Each feature is self-contained with its own:

- Components
- Business logic
- API actions
- Types
- Tests

### 3. App Layer

Contains Next.js specific files:

- Page components (only routing logic)
- Layouts
- Route handlers

## API Integration

### Strapi Integration

- Custom API client in `src/shared/lib/api.ts`
- Type-safe Strapi responses
- Error handling and loading states
- Custom hooks for data fetching

### Usage Example

```typescript
// In a feature component
import { useApi } from "@/shared/hooks/use-api";
import { apiClient } from "@/shared/lib/api";

const { data, loading, error } = useApi(() =>
  apiClient.getStrapiCollection("your-collection")
);
```

## Testing Strategy

### Component Tests

- Located in `__tests__` folders within features
- Uses Jest + React Testing Library
- Mocks API calls and hooks

### Running Tests

```bash
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run with coverage report
```

## Development Guidelines

### Adding a New Feature

1. Create folder: `src/features/feature-name/`
2. Add subfolders: `components/`, `hooks/`, `actions/`, `lib/`, `types/`, `__tests__/`
3. Implement feature logic
4. Add tests for components and utilities
5. Export public API from feature

### Adding Shared Components

1. Add to `src/shared/ui/`
2. Export from `src/shared/ui/index.ts`
3. Add tests if complex logic involved

### API Integration

1. Define types in feature's `types/` folder
2. Create API functions using shared `apiClient`
3. Use `useApi` hook for data fetching
4. Handle loading and error states

## Environment Setup

1. Copy environment variables (create `.env.local`):

```bash
NEXT_PUBLIC_STRAPI_URL=http://localhost:1339
```

2. Install dependencies:

```bash
npm install
```

3. Run development server:

```bash
npm run dev
```

4. Run tests:

```bash
npm test
```
