<p align="center">
  <img src=".github/assets/banner.svg" alt="@abdokouta/react-logger" width="100%" />
</p>

<h1 align="center">@abdokouta/react-logger</h1>

<p align="center">
  <strong>Multi-channel logging system for React with DI integration</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@abdokouta/react-logger"><img src="https://img.shields.io/npm/v/@abdokouta/react-logger.svg?style=flat-square" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@abdokouta/react-logger"><img src="https://img.shields.io/npm/dm/@abdokouta/react-logger.svg?style=flat-square" alt="npm downloads" /></a>
  <a href="https://github.com/pixielity-inc/react-logger/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@abdokouta/react-logger.svg?style=flat-square" alt="license" /></a>
</p>

<p align="center">
  Console · Storage · Silent transporters · MultipleInstanceManager · DI Integration · React Hooks
</p>

---

## What is this?

A multi-channel logging system for React apps. Manage multiple named logging channels (console, storage, silent) with a unified API. Built on `MultipleInstanceManager` from `@abdokouta/react-support` and integrates with `@abdokouta/ts-container` for NestJS-style dependency injection.

Inspired by Laravel's logging system — same patterns, same DX, built for the browser.

## Features

- Multiple named channels — switch at runtime
- `LoggerManager` extends `MultipleInstanceManager` for lazy channel creation
- `LoggerService` wraps channels with `debug()`, `info()`, `warn()`, `error()`, `fatal()`
- Contextual logging with `withContext()` / `withoutContext()`
- Console output with expandable context objects in DevTools
- Three built-in transporters: Console, Storage (localStorage), Silent
- Three formatters: Pretty (colors + emoji), JSON, Simple
- `LoggerModule.forRoot(config)` — DynamicModule pattern
- React hooks: `useLogger()`, `useLoggerContext()`
- Global by default — available to all modules
- `OnModuleInit` / `OnModuleDestroy` lifecycle hooks
- TypeScript-first with full type safety

## Architecture

```
LoggerModule.forRoot(config) → DynamicModule
├── { provide: LOGGER_CONFIG, useValue: config }
├── { provide: LoggerManager, useClass: LoggerManager }
└── { provide: LOGGER_MANAGER, useExisting: LoggerManager }

LoggerManager extends MultipleInstanceManager<LoggerConfig>
├── getDefaultInstance() → config.default
├── getInstanceConfig(name) → config.channels[name]
├── createDriver(driver, config) → LoggerConfig with transporters
├── channel(name?) → LoggerService (wraps channel config)
├── onModuleInit() → warm default channel
└── onModuleDestroy() → cleanup all

LoggerService wraps a channel's transporters
├── debug(message, context?)
├── info(message, context?)
├── warn(message, context?)
├── error(message, context?)
├── fatal(message, context?)
├── withContext(context) → add persistent context
└── withoutContext(keys?) → remove context
```

## Quick Start

### 1. Install

```bash
pnpm add @abdokouta/react-logger @abdokouta/react-support @abdokouta/ts-container
```

### 2. Configure

```typescript
// src/config/logger.config.ts
import { defineConfig, LogLevel, ConsoleTransporter, StorageTransporter, SilentTransporter } from '@abdokouta/react-logger';

export default defineConfig({
  default: 'console',
  channels: {
    console: {
      transporters: [new ConsoleTransporter({ level: LogLevel.Debug })],
      context: { app: 'my-app', env: 'development' },
    },
    storage: {
      transporters: [new StorageTransporter({ key: 'app-logs', maxEntries: 500 })],
    },
    errors: {
      transporters: [
        new ConsoleTransporter({ level: LogLevel.Error }),
        new StorageTransporter({ key: 'error-logs', maxEntries: 200 }),
      ],
    },
    silent: {
      transporters: [new SilentTransporter()],
    },
  },
});
```

### 3. Register Module

```typescript
import { Module } from '@abdokouta/ts-container';
import { LoggerModule } from '@abdokouta/react-logger';
import loggerConfig from './config/logger.config';

@Module({
  imports: [LoggerModule.forRoot(loggerConfig)],
})
export class AppModule {}
```

### 4. Use in Services

```typescript
import { Injectable, Inject } from '@abdokouta/ts-container';
import { LoggerManager, LOGGER_MANAGER } from '@abdokouta/react-logger';

@Injectable()
export class UserService {
  constructor(@Inject(LOGGER_MANAGER) private logger: LoggerManager) {}

  createUser(name: string) {
    const log = this.logger.channel();
    log.info('Creating user', { name });

    const audit = this.logger.channel('errors');
    audit.error('User creation failed', { name, reason: 'duplicate' });
  }
}
```

### 5. Use in React

```tsx
import { useLogger, useLoggerContext } from '@abdokouta/react-logger';

function Dashboard() {
  const logger = useLogger();
  logger.info('Dashboard loaded');
  return <div>Dashboard</div>;
}

function UserProfile({ userId }: { userId: string }) {
  useLoggerContext({ userId, component: 'UserProfile' });
  const logger = useLogger();
  // Every log includes { userId, component: 'UserProfile' }
  logger.info('Profile loaded');
  return <div>Profile</div>;
}

function ErrorPanel() {
  const errorLogger = useLogger('errors');
  errorLogger.error('Something went wrong', { source: 'manual' });
  return <div>Error</div>;
}
```

## API Reference

### LoggerManager

The central orchestrator. Extends `MultipleInstanceManager<LoggerConfig>`.

| Method | Description |
|---|---|
| `channel(name?)` | Get a LoggerService for a channel (default if omitted) |
| `getDefaultChannelName()` | Get the default channel name |
| `getChannelNames()` | Get all configured channel names |
| `hasChannel(name)` | Check if a channel is configured |
| `isChannelActive(name?)` | Check if a channel is currently cached |
| `forgetChannel(name?)` | Remove cached channel, force re-creation |
| `extend(driver, creator)` | Register a custom driver creator |
| `purge()` | Clear all cached channels |

### LoggerService

Consumer-facing API. Created by `LoggerManager.channel()`.

| Method | Description |
|---|---|
| `debug(message, context?)` | Log at debug level |
| `info(message, context?)` | Log at info level |
| `warn(message, context?)` | Log at warn level |
| `error(message, context?)` | Log at error level |
| `fatal(message, context?)` | Log at fatal level |
| `withContext(context)` | Add persistent context |
| `withoutContext(keys?)` | Remove context keys (or clear all) |
| `getTransporters()` | Get channel's transporters |

### React Hooks

| Hook | Description |
|---|---|
| `useLogger(channelName?)` | Get a LoggerService for a channel |
| `useLoggerContext(context, channelName?)` | Auto-attach/detach context on mount/unmount |

### DI Tokens

| Token | Description |
|---|---|
| `LOGGER_CONFIG` | Injected config object |
| `LOGGER_MANAGER` | useExisting alias to LoggerManager |

## Transporters

| Transporter | Description |
|---|---|
| `ConsoleTransporter` | Browser console with colors, emoji, expandable context |
| `StorageTransporter` | localStorage persistence with max entry limit |
| `SilentTransporter` | No-op (testing/production) |

## Formatters

| Formatter | Description |
|---|---|
| `PrettyFormatter` | Colors + emoji for console (default) |
| `JsonFormatter` | JSON serialization for storage (default) |
| `SimpleFormatter` | Plain text |

## Packages

| Package | Version | Description |
|---|---|---|
| `@abdokouta/react-logger` | `1.0.1` | Core logger package |

## Related Packages

| Package | Description |
|---|---|
| [`@abdokouta/ts-container`](https://github.com/pixielity-inc/ts-container) | DI container |
| [`@abdokouta/react-support`](https://github.com/pixielity-inc/react-support) | MultipleInstanceManager base |
| [`@abdokouta/react-redis`](https://github.com/pixielity-inc/react-redis) | Redis connection management |
| [`@abdokouta/react-cache`](https://github.com/pixielity-inc/react-cache) | Multi-driver cache system |

## License

MIT © [Abdelrhman Kouta](https://github.com/abdokouta)
