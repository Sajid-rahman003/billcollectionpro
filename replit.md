# Overview

BillCollect Pro is a comprehensive bill collection management system designed for small businesses and freelancers. The application helps track customers, manage bills, monitor expenses, and handle employee data through an intuitive web interface. Built as a Progressive Web App (PWA), it provides offline capabilities and professional-grade features for managing financial operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side application is built with **React 18** using **TypeScript** for type safety. The routing is handled by **Wouter**, a lightweight alternative to React Router. The UI components are built using **Radix UI** primitives with **shadcn/ui** styling, providing a consistent and accessible design system.

**State Management**: The application uses **TanStack Query (React Query)** for server state management, handling data fetching, caching, and synchronization. Local component state is managed with React's built-in hooks.

**Styling**: The design system is implemented using **Tailwind CSS** with CSS custom properties for theming. The configuration supports both light and dark modes with a comprehensive design token system.

**PWA Features**: Service worker implementation provides offline capabilities and caching strategies for improved performance and reliability.

## Backend Architecture

The server is built with **Express.js** running on **Node.js** with TypeScript. The API follows RESTful conventions with route-based organization for different resource types (customers, bills, expenses, employees).

**Development Setup**: The application uses **Vite** for development with hot module replacement and includes Replit-specific development tools for the cloud IDE environment.

**Error Handling**: Centralized error handling middleware processes all errors and returns consistent JSON responses to the client.

## Data Storage Solutions

**Database**: **PostgreSQL** is used as the primary database, accessed through **Neon Database** as the cloud provider. The database connection is pooled for optimal performance.

**ORM**: **Drizzle ORM** provides type-safe database operations with schema-first development. The schema definitions are shared between client and server for consistent type checking.

**Schema Design**: The database includes tables for users, customers, bills, expenses, employees, and sessions. Relationships are properly defined with foreign key constraints and indexes for performance.

## Authentication and Authorization

**Authentication Provider**: **Replit Auth** is integrated using OpenID Connect (OIDC) for secure authentication. This provides Google OAuth integration for user sign-in.

**Session Management**: Server-side sessions are stored in PostgreSQL using **connect-pg-simple**. Sessions are configured with appropriate security settings including httpOnly cookies and secure flags.

**Authorization**: Route-level protection ensures authenticated users can only access their own data. User ID from the authentication claims is used to filter all database queries.

## External Dependencies

**UI Components**: 
- Radix UI primitives for accessible, unstyled components
- shadcn/ui for pre-styled component implementations
- Lucide React for consistent iconography

**Data Visualization**: 
- Chart.js with react-chartjs-2 for dashboard analytics
- Support for doughnut charts, bar charts, and other visualizations

**Development Tools**:
- Replit-specific Vite plugins for development experience
- TypeScript for type safety across the entire stack
- ESBuild for production bundling

**Database & Infrastructure**:
- Neon Database (PostgreSQL) for cloud database hosting
- Drizzle Kit for database migrations and schema management
- WebSocket support for real-time database connections

**Form Handling**:
- React Hook Form with Zod resolvers for type-safe form validation
- Shared validation schemas between client and server

The architecture prioritizes type safety, developer experience, and scalability while maintaining simplicity in deployment and maintenance.