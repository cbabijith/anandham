> **Digital library:** The new public reader and PostgreSQL library studio are documented in [docs/DIGITAL_LIBRARY.md](docs/DIGITAL_LIBRARY.md), including source coverage, setup, API contracts, and Railway deployment.

# Anandham Monorepo

> Enterprise-grade monorepo powering the Anandham platform — 3 Flutter mobile apps (Android & iOS) + 3 Next.js web applications, managed with Turborepo.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Applications](#applications)
  - [Mobile Apps (Flutter)](#mobile-apps-flutter)
  - [Web Apps (Next.js)](#web-apps-nextjs)
- [Shared Packages](#shared-packages)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
  - [Web (Vercel)](#web-vercel)
  - [Mobile (Android & iOS)](#mobile-android--ios)
- [Code Architecture](#code-architecture)
  - [Flutter — Clean Architecture](#flutter--clean-architecture)
  - [Next.js — App Router Architecture](#nextjs--app-router-architecture)
- [Scripts Reference](#scripts-reference)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [Branch Strategy](#branch-strategy)
- [Code Review Guidelines](#code-review-guidelines)
- [License](#license)

---

## Overview

Anandham is a multi-platform application suite consisting of:

| Platform | App | Description |
|----------|-----|-------------|
| 📱 Mobile | **User App** | Consumer-facing app for end users |
| 📱 Mobile | **Author App** | Content management for authors/creators |
| 📱 Mobile | **Admin App** | Administrative dashboard & controls |
| 🌐 Web | **User Website** | Public-facing website for users |
| 🌐 Web | **Author Portal** | Author content management portal |
| 🌐 Web | **Admin Dashboard** | System administration dashboard |

All applications share common utilities, UI components, and configurations through shared packages, ensuring consistency and reducing code duplication.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    MONOREPO ROOT                     │
│                   (Turborepo)                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────── APPS ───────────────┐              │
│  │                                     │              │
│  │  ┌─────────┐ ┌─────────┐ ┌───────┐ │              │
│  │  │ mobile  │ │ mobile  │ │mobile │ │  Flutter     │
│  │  │  user   │ │ author  │ │ admin │ │  (Android    │
│  │  │         │ │         │ │       │ │   & iOS)     │
│  │  └────┬────┘ └────┬────┘ └───┬───┘ │              │
│  │       │           │          │      │              │
│  │  ┌────┴────┐ ┌────┴────┐ ┌──┴────┐ │              │
│  │  │  web    │ │  web    │ │ web   │ │  Next.js     │
│  │  │  user   │ │ author  │ │ admin │ │  (React)     │
│  │  └────┬────┘ └────┬────┘ └───┬───┘ │              │
│  │       │           │          │      │              │
│  └───────┼───────────┼──────────┼──────┘              │
│          │           │          │                      │
│  ┌───────┴───────────┴──────────┴──────┐              │
│  │          SHARED PACKAGES            │              │
│  │                                      │              │
│  │  ┌────────────┐  ┌───────────────┐  │              │
│  │  │flutter_core│  │  @anandham/ui │  │              │
│  │  │ (Dart pkg) │  │  (React pkg)  │  │              │
│  │  └────────────┘  └───────────────┘  │              │
│  │                                      │              │
│  │  ┌────────────────┐ ┌────────────┐  │              │
│  │  │ shared-utils   │ │  configs   │  │              │
│  │  │ (TypeScript)   │ │ (TS/ESLint)│  │              │
│  │  └────────────────┘ └────────────┘  │              │
│  └──────────────────────────────────────┘              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Core

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Turborepo** | ^2.8 | Monorepo orchestration, caching, task pipeline |
| **Node.js** | 24.x | JavaScript runtime |
| **npm** | 11.x | Package manager with workspaces |

### Mobile (Flutter)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Flutter** | 3.38.x | Cross-platform mobile framework |
| **Dart** | 3.10.x | Programming language |
| **flutter_bloc** | latest | State management (BLoC pattern) |
| **get_it** | latest | Dependency injection |
| **dio** | latest | HTTP client |
| **equatable** | latest | Value equality |
| **dartz** | latest | Functional programming |
| **shared_preferences** | latest | Local storage |
| **connectivity_plus** | latest | Network connectivity |

### Web (Next.js)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 15.x | React meta-framework (App Router) |
| **React** | 19.x | UI library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **ESLint** | 9.x | Code linting |
| **Prettier** | latest | Code formatting |

### Deployment

| Service | Purpose |
|---------|---------|
| **Vercel** | Web app hosting & CI/CD |
| **Google Play Store** | Android distribution |
| **Apple App Store** | iOS distribution |

---

## Repository Structure

```
anandham/
├── .vscode/                        # VS Code workspace settings
│   ├── extensions.json             # Recommended extensions
│   └── settings.json              # Shared editor settings
│
├── apps/                           # All applications
│   ├── mobile_user/               # 📱 Flutter - User App
│   │   ├── android/               #    Android project
│   │   ├── ios/                   #    iOS project
│   │   ├── lib/                   #    Dart source code
│   │   │   ├── app/               #    App config, routes, theme
│   │   │   ├── core/              #    Constants, errors, network, DI
│   │   │   ├── data/              #    Data sources, models, repos
│   │   │   ├── domain/            #    Entities, repos interfaces, use cases
│   │   │   ├── presentation/      #    BLoCs, pages, widgets
│   │   │   ├── shared/            #    Shared widgets & mixins
│   │   │   └── main.dart          #    Entry point
│   │   ├── test/                  #    Unit & widget tests
│   │   └── pubspec.yaml           #    Dart dependencies
│   │
│   ├── mobile_author/             # 📱 Flutter - Author App
│   │   └── (same structure as mobile_user)
│   │
│   ├── mobile_admin/              # 📱 Flutter - Admin App
│   │   └── (same structure as mobile_user)
│   │
│   ├── web-user/                  # 🌐 Next.js - User Website
│   │   ├── public/                #    Static assets
│   │   ├── src/
│   │   │   ├── app/               #    App Router pages & layouts
│   │   │   │   ├── (auth)/        #    Auth route group
│   │   │   │   ├── layout.tsx     #    Root layout
│   │   │   │   ├── page.tsx       #    Home page
│   │   │   │   ├── loading.tsx    #    Loading state
│   │   │   │   ├── error.tsx      #    Error boundary
│   │   │   │   └── not-found.tsx  #    404 page
│   │   │   ├── components/        #    React components
│   │   │   │   ├── ui/            #    Reusable UI (Button, etc.)
│   │   │   │   ├── layout/        #    Header, Footer, Sidebar
│   │   │   │   └── common/        #    Shared components
│   │   │   ├── hooks/             #    Custom React hooks
│   │   │   ├── lib/               #    Utilities, API client, constants
│   │   │   ├── services/          #    Business logic services
│   │   │   ├── store/             #    State management
│   │   │   ├── types/             #    TypeScript type definitions
│   │   │   ├── styles/            #    Custom styles
│   │   │   └── middleware.ts      #    Next.js middleware
│   │   ├── vercel.json            #    Vercel deployment config
│   │   └── package.json
│   │
│   ├── web-author/                # 🌐 Next.js - Author Portal
│   │   └── (same structure as web-user)
│   │
│   └── web-admin/                 # 🌐 Next.js - Admin Dashboard
│       └── (same structure as web-user)
│
├── packages/                      # Shared packages
│   ├── flutter_core/              # 📦 Shared Flutter/Dart code
│   │   ├── lib/
│   │   │   ├── src/
│   │   │   │   ├── constants/     #    Shared constants
│   │   │   │   ├── models/        #    Shared data models
│   │   │   │   ├── network/       #    API client & interceptors
│   │   │   │   ├── services/      #    Common services
│   │   │   │   ├── utils/         #    Utility functions
│   │   │   │   └── widgets/       #    Shared widgets
│   │   │   └── anandham_core.dart #    Barrel export
│   │   └── pubspec.yaml
│   │
│   ├── ui/                        # 📦 Shared React UI components
│   │   ├── src/
│   │   │   ├── components/        #    Button, Card, Input, Modal, etc.
│   │   │   └── index.ts           #    Barrel export
│   │   └── package.json
│   │
│   ├── shared-utils/              # 📦 Shared TypeScript utilities
│   │   ├── src/
│   │   │   ├── date.ts            #    Date formatting
│   │   │   ├── string.ts          #    String manipulation
│   │   │   ├── number.ts          #    Number formatting
│   │   │   ├── validation.ts      #    Validators
│   │   │   ├── storage.ts         #    localStorage wrapper
│   │   │   ├── constants.ts       #    HTTP status, roles, pagination
│   │   │   ├── types.ts           #    Shared TypeScript types
│   │   │   └── index.ts           #    Barrel export
│   │   └── package.json
│   │
│   ├── eslint-config/             # 📦 Shared ESLint configuration
│   │   ├── next.js                #    Next.js ESLint rules
│   │   ├── library.js             #    Library ESLint rules
│   │   └── package.json
│   │
│   └── typescript-config/         # 📦 Shared TypeScript configs
│       ├── base.json              #    Base TS config
│       ├── nextjs.json            #    Next.js TS config
│       ├── react-library.json     #    React library TS config
│       └── package.json
│
├── .gitignore                     # Git ignore rules
├── .prettierrc                    # Prettier configuration
├── .prettierignore                # Prettier ignore rules
├── package.json                   # Root package.json (workspaces)
├── package-lock.json              # Lock file
├── turbo.json                     # Turborepo pipeline config
└── README.md                      # 📖 This file
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

| Tool | Min Version | Installation |
|------|------------|-------------|
| **Node.js** | 20.x+ | [nodejs.org](https://nodejs.org) |
| **npm** | 10.x+ | Comes with Node.js |
| **Flutter** | 3.38.x+ | [flutter.dev/docs/get-started](https://flutter.dev/docs/get-started/install) |
| **Dart** | 3.10.x+ | Comes with Flutter |
| **Android Studio** | Latest | [developer.android.com](https://developer.android.com/studio) |
| **Xcode** | 15+ (macOS) | Mac App Store |
| **Git** | 2.x+ | [git-scm.com](https://git-scm.com) |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/abijithsupportta/anandham.git
cd anandham

# 2. Install Node.js dependencies (all web apps + packages)
npm install

# 3. Set up environment variables for web apps
cp apps/web-user/.env.example apps/web-user/.env.local
cp apps/web-author/.env.example apps/web-author/.env.local
cp apps/web-admin/.env.example apps/web-admin/.env.local

# 4. Install Flutter dependencies for each mobile app
cd apps/mobile_user && flutter pub get && cd ../..
cd apps/mobile_author && flutter pub get && cd ../..
cd apps/mobile_admin && flutter pub get && cd ../..

# 5. Install shared Flutter package dependencies
cd packages/flutter_core && flutter pub get && cd ../..

# 6. Verify Flutter setup
flutter doctor
```

---

## Applications

### Mobile Apps (Flutter)

| App | Package Name | Directory | Port |
|-----|-------------|-----------|------|
| User App | `com.anandham.anandham_user` | `apps/mobile_user` | — |
| Author App | `com.anandham.anandham_author` | `apps/mobile_author` | — |
| Admin App | `com.anandham.anandham_admin` | `apps/mobile_admin` | — |

#### Running Mobile Apps

```bash
# Run User App
cd apps/mobile_user
flutter run                    # Run on connected device/emulator
flutter run --release          # Run in release mode

# Run Author App
cd apps/mobile_author
flutter run

# Run Admin App
cd apps/mobile_admin
flutter run

# Run on specific device
flutter devices               # List available devices
flutter run -d <device_id>    # Run on specific device
```

#### Building Mobile Apps

```bash
# Android APK
cd apps/mobile_user
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk

# Android App Bundle (for Play Store)
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab

# iOS (macOS only)
flutter build ios --release
# Then open in Xcode: ios/Runner.xcworkspace
```

### Web Apps (Next.js)

| App | Package Name | Directory | Dev Port |
|-----|-------------|-----------|----------|
| User Website | `@anandham/web-user` | `apps/web-user` | 3000 |
| Author Portal | `@anandham/web-author` | `apps/web-author` | 3100 |
| Admin Dashboard | `@anandham/web-admin` | `apps/web-admin` | 3200 |

#### Running Web Apps

```bash
# From the root — run all web apps
npm run dev

# Run specific web app
npm run dev:web-user           # http://localhost:3000
npm run dev:web-author         # http://localhost:3100
npm run dev:web-admin          # http://localhost:3200

# Or using Turbo filter
npx turbo run dev --filter=@anandham/web-user
```

#### Building Web Apps

```bash
# Build all web apps
npm run build

# Build specific web app
npm run build:web-user
npm run build:web-author
npm run build:web-admin
```

---

## Shared Packages

### `packages/flutter_core` — Shared Dart Package

Shared code used across all 3 Flutter mobile apps.

```dart
// In any Flutter app's pubspec.yaml:
dependencies:
  anandham_core:
    path: ../../packages/flutter_core

// Usage:
import 'package:anandham_core/anandham_core.dart';
```

**Includes:** API client, data models, network interceptors, services, validators, shared widgets.

### `packages/ui` — Shared React UI Components

Reusable React components used across all 3 Next.js web apps.

```tsx
// Usage in any Next.js app:
import { Button, Card, Input, Modal, Badge, Spinner, Avatar } from '@anandham/ui';
```

**Components:** Button, Card, Input, Modal, Badge, Spinner, Avatar — all with variants, sizes, and accessibility.

### `packages/shared-utils` — Shared TypeScript Utilities

Common utility functions and types used across web apps.

```tsx
import { formatDate, isValidEmail, formatCurrency, ROLES } from '@anandham/shared-utils';
```

**Includes:** Date/String/Number formatters, validators, storage helpers, constants, shared types.

### `packages/eslint-config` — Shared ESLint Rules

Consistent linting rules across all web apps and packages.

### `packages/typescript-config` — Shared TypeScript Config

Base TypeScript configurations extended by all TypeScript packages and apps.

---

## Development Workflow

### Daily Development

```bash
# Start all web apps in development mode
npm run dev

# Run a specific Flutter app
cd apps/mobile_user && flutter run

# Lint all web projects
npm run lint

# Format all code
npm run format

# Type check
npx turbo run type-check
```

### Turborepo Caching

Turborepo automatically caches build outputs. Subsequent builds skip unchanged packages:

```bash
# First build — full build
npm run build                  # ⏱ ~60s

# Second build (no changes) — cached
npm run build                  # ⏱ ~1s (from cache!)

# Build with verbose output
npx turbo run build --verbosity=2
```

### Running Tasks on Specific Apps

```bash
# Using --filter flag
npx turbo run build --filter=@anandham/web-user
npx turbo run lint --filter=@anandham/web-admin
npx turbo run dev --filter=@anandham/web-author

# Filter by directory
npx turbo run build --filter=./apps/web-*
```

---

## Deployment

### Web (Vercel)

Each web app has its own `vercel.json` configured for Turborepo builds.

#### Setup Steps

1. **Import your GitHub repository** into [Vercel](https://vercel.com)
2. **Create 3 projects** — one for each web app
3. **Configure each project:**

| Project | Root Directory | Build Command | Output Directory |
|---------|---------------|---------------|-----------------|
| web-user | `apps/web-user` | `cd ../.. && npx turbo run build --filter=@anandham/web-user` | `.next` |
| web-author | `apps/web-author` | `cd ../.. && npx turbo run build --filter=@anandham/web-author` | `.next` |
| web-admin | `apps/web-admin` | `cd ../.. && npx turbo run build --filter=@anandham/web-admin` | `.next` |

4. **Set environment variables** in each Vercel project dashboard
5. **Enable Remote Caching** (optional):
   ```bash
   npx turbo login
   npx turbo link
   ```

### Mobile (Android & iOS)

#### Android (Google Play Store)

```bash
cd apps/mobile_user  # or mobile_author / mobile_admin

# 1. Update version in pubspec.yaml
#    version: 1.0.0+1

# 2. Generate signing key (first time only)
keytool -genkey -v -keystore ~/key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload

# 3. Build App Bundle
flutter build appbundle --release

# 4. Upload to Google Play Console
#    Output: build/app/outputs/bundle/release/app-release.aab
```

#### iOS (Apple App Store)

```bash
cd apps/mobile_user  # or mobile_author / mobile_admin

# 1. Open in Xcode
open ios/Runner.xcworkspace

# 2. Set signing team & bundle identifier
# 3. Build archive: Product → Archive
# 4. Distribute to App Store Connect

# OR use command line:
flutter build ipa --release
# Output: build/ios/ipa/
```

---

## Code Architecture

### Flutter — Clean Architecture

Each Flutter app follows **Clean Architecture** with 4 layers:

```
┌────────────────────────────────────────┐
│           PRESENTATION                  │
│  (Pages, Widgets, BLoCs)               │
│  ┌──────────────────────────────────┐  │
│  │  BLoC ←→ Page ←→ Widgets        │  │
│  └──────────┬───────────────────────┘  │
├─────────────┼──────────────────────────┤
│           DOMAIN                        │
│  (Entities, Use Cases, Repo Contracts) │
│  ┌──────────┴───────────────────────┐  │
│  │  UseCase → Repository (abstract) │  │
│  └──────────┬───────────────────────┘  │
├─────────────┼──────────────────────────┤
│           DATA                          │
│  (Models, Data Sources, Repo Impls)    │
│  ┌──────────┴───────────────────────┐  │
│  │  Repository → DataSource(s)       │  │
│  └──────────┬───────────────────────┘  │
├─────────────┼──────────────────────────┤
│           CORE                          │
│  (DI, Network, Constants, Errors)      │
│  ┌──────────┴───────────────────────┐  │
│  │  ApiClient, GetIt, Failures, etc  │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Key Patterns:**
- **BLoC** for state management (`flutter_bloc`)
- **GetIt** for dependency injection (`get_it`)
- **Dartz** for functional error handling (`Either<Failure, Success>`)
- **Equatable** for value equality in entities and states

### Next.js — App Router Architecture

Each Next.js app follows the **App Router** pattern:

```
┌────────────────────────────────────────┐
│              APP ROUTER                 │
│  (Pages, Layouts, Loading, Error)      │
│  ┌──────────────────────────────────┐  │
│  │  layout.tsx → page.tsx           │  │
│  │  loading.tsx, error.tsx          │  │
│  │  Route Groups: (auth)/          │  │
│  └──────────┬───────────────────────┘  │
├─────────────┼──────────────────────────┤
│           COMPONENTS                    │
│  (UI, Layout, Common)                  │
│  ┌──────────┴───────────────────────┐  │
│  │  Button, Card → Header, Footer  │  │
│  └──────────┬───────────────────────┘  │
├─────────────┼──────────────────────────┤
│           SERVICES / HOOKS              │
│  (Business Logic, Custom Hooks)        │
│  ┌──────────┴───────────────────────┐  │
│  │  useAuth → AuthService → API     │  │
│  └──────────┬───────────────────────┘  │
├─────────────┼──────────────────────────┤
│           LIB / UTILS                   │
│  (API Client, Helpers, Constants)      │
│  ┌──────────┴───────────────────────┐  │
│  │  apiClient, validators, helpers  │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Key Patterns:**
- **App Router** with file-based routing
- **Server Components** by default, **Client Components** where needed
- **Route Groups** for authentication layout `(auth)/`
- **Middleware** for route protection
- **Tailwind CSS** for styling

---

## Scripts Reference

### Root Scripts (run from project root)

| Script | Command | Description |
|--------|---------|-------------|
| Build all | `npm run build` | Build all web apps with caching |
| Dev all | `npm run dev` | Start all web apps in dev mode |
| Lint all | `npm run lint` | Lint all web packages |
| Test all | `npm run test` | Run all tests |
| Clean | `npm run clean` | Clean all build outputs |
| Format | `npm run format` | Format all files with Prettier |
| Dev User Web | `npm run dev:web-user` | Start user website only |
| Dev Author Web | `npm run dev:web-author` | Start author portal only |
| Dev Admin Web | `npm run dev:web-admin` | Start admin dashboard only |
| Build User Web | `npm run build:web-user` | Build user website only |
| Build Author Web | `npm run build:web-author` | Build author portal only |
| Build Admin Web | `npm run build:web-admin` | Build admin dashboard only |

### Flutter Commands (run from app directory)

| Command | Description |
|---------|-------------|
| `flutter pub get` | Install dependencies |
| `flutter run` | Run on connected device |
| `flutter run --release` | Run in release mode |
| `flutter build apk` | Build Android APK |
| `flutter build appbundle` | Build Android App Bundle |
| `flutter build ios` | Build iOS |
| `flutter test` | Run tests |
| `flutter analyze` | Analyze Dart code |
| `flutter clean` | Clean build artifacts |

---

## Environment Variables

### Web Apps

Create `.env.local` in each web app directory (copy from `.env.example`):

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | Yes |
| `NEXTAUTH_URL` | NextAuth callback URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth encryption secret | Yes |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics tracking | No |
| `NEXT_PUBLIC_MAINTENANCE_MODE` | Enable maintenance page | No |

### Flutter Apps

API configuration is managed in:
- Shared: `packages/flutter_core/lib/src/constants/api_constants.dart`
- Per-app: `apps/mobile_*/lib/core/constants/api_constants.dart`

---

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run linting and tests
5. Commit with conventional commits
6. Push and create a Pull Request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<scope>): <description>

feat(web-user): add user profile page
fix(mobile-admin): resolve login crash on Android
chore(deps): update flutter to 3.38.x
docs(readme): update deployment section
refactor(flutter-core): simplify API client
style(ui): fix button padding
test(web-admin): add dashboard unit tests
```

**Scopes:** `web-user`, `web-author`, `web-admin`, `mobile-user`, `mobile-author`, `mobile-admin`, `flutter-core`, `ui`, `shared-utils`, `deps`, `ci`

---

## Branch Strategy

```
main (production)
 └── develop (staging)
      ├── feature/web-user-profile
      ├── feature/mobile-auth-flow
      ├── fix/admin-dashboard-crash
      └── release/v1.2.0
```

| Branch | Purpose | Merges To |
|--------|---------|-----------|
| `main` | Production-ready code | — |
| `develop` | Integration branch | `main` |
| `feature/*` | New features | `develop` |
| `fix/*` | Bug fixes | `develop` |
| `hotfix/*` | Critical production fixes | `main` + `develop` |
| `release/*` | Release preparation | `main` + `develop` |

---

## Code Review Guidelines

- [ ] Code follows project architecture patterns
- [ ] No hardcoded values — use constants
- [ ] Components are reusable and typed
- [ ] Error states are handled
- [ ] Loading states are shown
- [ ] Code is formatted (`npm run format` / `flutter format`)
- [ ] Linting passes (`npm run lint` / `flutter analyze`)
- [ ] Tests are added for new features
- [ ] No sensitive data in commits
- [ ] Environment variables used for configuration
- [ ] Shared code goes in `packages/`, not duplicated

---

## License

ISC License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ using Turborepo + Flutter + Next.js**

</div>
