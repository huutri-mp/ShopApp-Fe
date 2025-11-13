# AI Coding Instructions

## Architecture Overview

This is a **Next.js 16 e-commerce application** using the App Router pattern with TypeScript, featuring a dual-layout system:
- **Public storefront** (`app/`) - product browsing, authentication
- **Protected dashboard** (`app/dashboard/`) - product management (requires authentication)

The app uses **shadcn/ui components** with Radix UI primitives, Tailwind CSS v4 (with CSS imports), and client-side state management via custom hooks.

## Key Development Patterns

### Component Architecture
- **UI Components**: Located in `components/ui/` - shadcn/ui components with CVA (Class Variance Authority) for variants
- **App Components**: Located in `app/components/` - business logic components
- **Styling**: Uses `cn()` utility from `lib/utils.ts` for conditional classes: `cn("base-classes", conditionalClass && "additional-classes")`

### Authentication & Routing
- **Auth Pattern**: Uses `localStorage` for token storage with `useAuth` hook (`hooks/useAuth.ts`)
- **Protected Routes**: Dashboard layout (`app/dashboard/layout.tsx`) redirects unauthenticated users to `/auth/login`
- **Auth Check**: Always check `isLoading` state before redirecting to avoid flash of content

### State Management
- **Custom Hooks Pattern**: Business logic in hooks (`useAuth`, `useProducts`, `useFetch`)
- **Product State**: Managed via `useProducts` hook with in-memory array (no external API)
- **Client-Side Only**: All interactive components use `"use client"` directive

### Form Handling
Forms use controlled components with `useState` for form data and follow this pattern:
```tsx
const [formData, setFormData] = useState({ field: "" })
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target
  setFormData(prev => ({ ...prev, [name]: value }))
}
```

## Development Commands

```bash
# Development server
pnpm dev

# Build (ignores TypeScript errors - see next.config.mjs)
pnpm build

# Production server
pnpm start

# Linting
pnpm lint
```

## Configuration Files

- **Tailwind**: Uses v4 with CSS imports (`@import "tailwindcss"`), no config file
- **shadcn/ui**: Configured via `components.json` with aliases for `@/components`, `@/lib`, `@/hooks`
- **Next.js**: TypeScript errors ignored in build, images unoptimized
- **Import Aliases**: Use `@/` prefix for all internal imports

## Component Development Guidelines

### UI Components
- Extend shadcn/ui components in `components/ui/`
- Use `buttonVariants` pattern with CVA for consistent styling
- Always forward refs and spread props for composability

### Business Components
- Place in `app/components/` for app-specific logic
- Use TypeScript interfaces for props (avoid inline types)
- Follow the loading state pattern: `const [isLoading, setIsLoading] = useState(false)`

### Layout Components
- Layouts handle authentication, headers, and global structure
- Use `flex flex-col min-h-screen` pattern for full-height layouts
- Dashboard layout includes authentication guard

## Data Patterns

### Product Interface
```tsx
interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
  stock: number
  rating: number
  reviews: number
  image: string
  discount?: number
}
```

### Mock Data Approach
- Products stored in `useProducts` hook as hardcoded array
- Authentication uses localStorage with mock tokens
- No external API calls - all data is client-side

## File Organization

- **Pages**: Use Next.js App Router conventions (`page.tsx`, `layout.tsx`, `loading.tsx`)
- **Components**: Separate UI primitives from business components
- **Hooks**: Custom hooks for state management and side effects
- **Utils**: Utility functions in `lib/utils.ts` (mainly the `cn` helper)

When adding features, follow these established patterns for consistency with the existing codebase architecture.