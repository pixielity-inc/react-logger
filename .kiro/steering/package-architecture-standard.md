---
inclusion: auto
---

# Package Architecture Standard

This document defines the canonical structure, naming conventions, and patterns
for all `@abdokouta/*` packages. Every package MUST follow these rules.

## 1. Monorepo Layout

Each package lives in its own git repo with this structure:

```
{package-repo}/
├── .github/workflows/
│   ├── ci.yml
│   └── publish.yml
├── __tests__/
├── examples/vite/
├── packages/{name}/          ← the publishable npm package
│   ├── src/
│   ├── config/               ← optional default config file
│   ├── dist/                 ← built output
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsup.config.ts
│   └── vitest.config.ts
├── package.json              ← monorepo root
├── pnpm-workspace.yaml
└── turbo.json
```

## 2. Source Directory Structure

Every package's `src/` MUST follow this layout:

```
src/
├── {name}.module.ts          # DI module with forRoot()
├── index.ts                  # barrel exports (the public API)
├── constants/
│   ├── index.ts              # re-exports all constants
│   └── tokens.constant.ts    # Symbol-based DI tokens
├── interfaces/
│   ├── index.ts              # re-exports all interfaces
│   └── *.interface.ts        # one file per interface
├── types/                    # (if needed)
│   ├── index.ts
│   └── *.type.ts             # type aliases, unions, mapped types
├── enums/                    # (if needed)
│   ├── index.ts
│   └── *.enum.ts
├── services/
│   ├── index.ts
│   ├── {name}-manager.service.ts   # extends MultipleInstanceManager (if manager package)
│   └── {name}.service.ts           # wrapper created by manager (if manager package)
│                                   # OR standalone service (if non-manager package)
├── {drivers}/                # domain-specific: stores/, transporters/, connectors/, drivers/
│   ├── index.ts
│   └── *.ts
├── hooks/
│   ├── index.ts
│   ├── use-{name}/
│   │   ├── index.ts
│   │   └── use-{name}.hook.ts
│   └── use-{name}-{variant}/
│       ├── index.ts
│       └── use-{name}-{variant}.hook.ts
└── utils/
    ├── index.ts
    └── define-config.util.ts
```

## 3. Export Rules

### 3.1 Where things MUST live

| Export kind | Directory | File naming |
|---|---|---|
| `export interface` | `interfaces/` | `{name}.interface.ts` |
| `export type` (alias/union/mapped) | `types/` | `{name}.type.ts` |
| `export enum` | `enums/` | `{name}.enum.ts` |
| `export const` (DI tokens, Symbols) | `constants/` | `tokens.constant.ts` |
| `export const` (config maps, lookup tables) | `constants/` | `{name}.constant.ts` |
| `export class` (services) | `services/` | `{name}.service.ts` |
| `export class` (drivers/stores/transporters) | `{drivers}/` | `{name}.{driver-type}.ts` |
| `export function` (hooks) | `hooks/` | `use-{name}.hook.ts` |
| `export function` (utilities) | `utils/` | `{name}.util.ts` |

### 3.2 NEVER export interfaces/types/enums from service, driver, or module files

If a service file needs an options interface (e.g., `ConsoleTransporterOptions`),
that interface MUST be defined in `interfaces/` and imported. Do NOT define and
export it inline in the class file.

### 3.3 Barrel exports

Every directory with exports MUST have an `index.ts` that re-exports everything.
The root `index.ts` is the public API — it imports from barrel files, not individual files.

```typescript
// constants/index.ts
export { CONFIG_TOKEN, MANAGER_TOKEN } from './tokens.constant';

// interfaces/index.ts
export type { FooInterface } from './foo.interface';
export type { BarInterface } from './bar.interface';
```

## 4. Manager Package Pattern

Packages that manage multiple named instances (cache stores, redis connections,
logger channels) follow this pattern:

### 4.1 Manager class

```typescript
@Injectable()
export class {Name}Manager
  extends MultipleInstanceManager<{DriverType}>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@Inject({NAME}_CONFIG) private readonly config: {Name}ModuleOptions) {
    super();
  }

  // MultipleInstanceManager contract
  getDefaultInstance(): string { return this.config.default; }
  setDefaultInstance(name: string): void { ... }
  getInstanceConfig(name: string): Record<string, any> | undefined { ... }
  protected createDriver(driver: string, config: Record<string, any>): {DriverType} { ... }

  // Public API — returns {Name}Service
  {accessor}(name?: string): {Name}Service { ... }

  // Lifecycle
  onModuleInit(): void { this.{accessor}(); }
  async onModuleDestroy(): Promise<void> { this.purge(); }
}
```

Where `{accessor}` is the domain-specific method:
- Cache → `store(name?)`
- Redis → `connection(name?)`
- Logger → `channel(name?)`

### 4.2 Service class (wrapper)

The service is NOT injectable. It's created by the manager's accessor method.

```typescript
export class {Name}Service {
  constructor(private readonly _driver: {DriverType}) {}
  // domain-specific methods wrapping the driver
}
```

### 4.3 Module

```typescript
@Module({})
export class {Name}Module {
  static forRoot(config: {Name}ModuleOptions): DynamicModule {
    return {
      module: {Name}Module,
      global: config.isGlobal ?? true,
      providers: [
        { provide: {NAME}_CONFIG, useValue: config },
        { provide: {Name}Manager, useClass: {Name}Manager },
        { provide: {NAME}_MANAGER, useExisting: {Name}Manager },
      ],
      exports: [{Name}Manager, {NAME}_MANAGER, {NAME}_CONFIG],
    };
  }
}
```

### 4.4 DI Tokens

Every manager package MUST have these tokens:

```typescript
export const {NAME}_CONFIG = Symbol.for('{NAME}_CONFIG');
export const {NAME}_MANAGER = Symbol.for('{NAME}_MANAGER');
```

## 5. Non-Manager Package Pattern

Packages without MultipleInstanceManager (e.g., config) follow a simpler pattern:

```typescript
@Module({})
export class {Name}Module {
  static forRoot(config: {Name}ModuleOptions): DynamicModule {
    return {
      module: {Name}Module,
      global: config.isGlobal ?? true,
      providers: [
        { provide: {NAME}_CONFIG, useValue: config },
        { provide: {Name}Service, useClass: {Name}Service },
        { provide: {NAME}_SERVICE, useExisting: {Name}Service },
      ],
      exports: [{Name}Service, {NAME}_SERVICE, {NAME}_CONFIG],
    };
  }
}
```

Tokens:

```typescript
export const {NAME}_CONFIG = Symbol.for('{NAME}_CONFIG');
export const {NAME}_SERVICE = Symbol.for('{NAME}_SERVICE');
```

## 6. React Hooks

Every package with React integration MUST provide hooks:

```typescript
// hooks/use-{name}/use-{name}.hook.ts
export function use{Name}(instanceName?: string): {Name}Service {
  const manager = useInject({Name}Manager);
  return manager.{accessor}(instanceName);
}
```

For non-manager packages:

```typescript
export function use{Name}(): {Name}Service {
  return useInject({Name}Service);
}
```

## 7. CI/CD Workflows

### 7.1 ci.yml

```yaml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: pnpm install --no-frozen-lockfile
      - run: pnpm --filter @abdokouta/{PACKAGE_NAME} build
      - run: pnpm --filter @abdokouta/{PACKAGE_NAME} test || true

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - run: pnpm install --no-frozen-lockfile
      - run: pnpm run format:check || true
      - run: pnpm run lint || true
```

Rules:
- Use `pnpm --filter @abdokouta/{PACKAGE_NAME} build` (NOT `pnpm run build`)
- Use `pnpm --filter @abdokouta/{PACKAGE_NAME} test || true`
- Do NOT include `cache: "pnpm"` in setup-node (no lockfile in monorepo root)
- Comment header MUST match the actual package name

### 7.2 publish.yml

```yaml
name: Publish to npm
on:
  push:
    tags: ["v*"]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          registry-url: "https://registry.npmjs.org"
      - run: pnpm install --no-frozen-lockfile
      - run: pnpm --filter @abdokouta/{PACKAGE_NAME} build
      - run: pnpm --filter @abdokouta/{PACKAGE_NAME} test || true
      - run: pnpm publish --access public --no-git-checks || true
        working-directory: packages/{name}
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Rules:
- `working-directory` MUST point to the inner publishable package
- Do NOT include `cache: "pnpm"` in setup-node

## 8. package.json Standard

### 8.1 Dependencies

- `@abdokouta/ts-container` → peerDependency (required)
- `@abdokouta/react-support` → peerDependency (required, if using MultipleInstanceManager)
- `@abdokouta/ts-container-react` → devDependency (for hooks)
- `react` → peerDependency (optional)
- Domain-specific deps (e.g., `@upstash/redis`) → dependency

### 8.2 Exports

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": ["dist", "config", "README.md", "LICENSE"]
}
```

### 8.3 Scripts (standard set)

```json
{
  "build": "tsup",
  "dev": "tsup --watch",
  "clean": "rm -rf dist node_modules/.cache",
  "typecheck": "tsc --noEmit",
  "lint": "eslint . --max-warnings 0",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "prepublishOnly": "pnpm run build",
  "release": "pnpm publish --access public --no-git-checks"
}
```

## 9. DI Container Reference

All packages use `@abdokouta/ts-container` (NOT `@abdokouta/react-di`).

```typescript
import { Module, Injectable, Inject, type DynamicModule } from '@abdokouta/ts-container';
import type { OnModuleInit, OnModuleDestroy } from '@abdokouta/ts-container';
```

React hooks use `@abdokouta/ts-container-react`:

```typescript
import { useInject } from '@abdokouta/ts-container-react';
```

## 10. Package Registry

| Package | npm name | Repo | Type |
|---|---|---|---|
| Container | `@abdokouta/ts-container` | pixielity-inc/ts-container | Core DI |
| Container React | `@abdokouta/ts-container-react` | pixielity-inc/ts-container | React bindings |
| Application | `@abdokouta/ts-application` | pixielity-inc/ts-container | Bootstrap |
| Support | `@abdokouta/react-support` | pixielity-inc/react-support | Base classes |
| Redis | `@abdokouta/react-redis` | pixielity-inc/react-redis | Manager |
| Cache | `@abdokouta/react-cache` | pixielity-inc/react-cache | Manager |
| Logger | `@abdokouta/react-logger` | pixielity-inc/react-logger | Manager |
| Config | `@abdokouta/react-config` | pixielity-inc/react-config | Non-manager |

## 11. Standardization Checklist

When creating or auditing a package, verify:

- [ ] `src/` follows the directory structure in section 2
- [ ] All interfaces live in `interfaces/` (none in service/driver files)
- [ ] All types live in `types/` (no duplicates with interfaces)
- [ ] All enums live in `enums/`
- [ ] All DI tokens live in `constants/tokens.constant.ts`
- [ ] Every directory has an `index.ts` barrel
- [ ] Root `index.ts` exports everything needed by consumers
- [ ] Module follows section 4.3 (manager) or section 5 (non-manager)
- [ ] Tokens follow naming: `{NAME}_CONFIG`, `{NAME}_MANAGER` or `{NAME}_SERVICE`
- [ ] CI workflow uses `pnpm --filter` and correct package name
- [ ] Publish workflow uses correct `working-directory`
- [ ] No `cache: "pnpm"` in setup-node
- [ ] `@abdokouta/ts-container` used (not `react-di`)
- [ ] peerDependencies correctly declared
- [ ] package.json scripts match section 8.3
