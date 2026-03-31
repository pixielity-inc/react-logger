# @abdokouta/logger

Laravel-inspired logging system for Refine with multiple channels, transporters, and formatters.

## Features

- **Multiple Channels**: Console, Storage (localStorage), and Silent
- **Pluggable Transporters**: Route logs to different destinations
- **Customizable Formatters**: Pretty (with colors/emoji), JSON, or Simple
- **Contextual Logging**: Add persistent context to all logs
- **React Hooks**: `useLogger()` and `useLoggerContext()` for easy integration
- **TypeScript**: Full type safety with comprehensive JSDoc documentation
- **Browser Compatible**: Works in all modern browsers
- **Dependency Injection**: Integrates with @abdokouta/container

## Installation

```bash
npm install @abdokouta/logger
# or
yarn add @abdokouta/logger
# or
pnpm add @abdokouta/logger
```

## Quick Start

### 1. Configure the Module

```typescript
import { Module } from '@abdokouta/container';
import { LoggerModule, defineConfig } from '@abdokouta/logger';
import { ConsoleTransporter, StorageTransporter } from '@abdokouta/logger';
import { LogLevel } from '@abdokouta/logger';

@Module({
  imports: [
    LoggerModule.forRoot(
      defineConfig({
        default: 'console',
        channels: {
          console: {
            transporters: [new ConsoleTransporter()],
            context: { app: 'my-app', env: 'production' },
          },
          storage: {
            transporters: [new StorageTransporter({ maxEntries: 500 })],
          },
          errors: {
            transporters: [
              new ConsoleTransporter({ level: LogLevel.Error }),
              new StorageTransporter({ key: 'error-logs' }),
            ],
          },
        },
      })
    ),
  ],
})
export class AppModule {}
```

### 2. Use in Services

```typescript
import { Injectable, Inject } from '@abdokouta/container';
import { LoggerService } from '@abdokouta/logger';

@Injectable()
export class UserService {
  constructor(
    @Inject(LoggerService) private logger: LoggerService
  ) {}

  async createUser(data: UserData) {
    this.logger.info('Creating user', { email: data.email });
    
    try {
      const user = await this.db.users.create(data);
      this.logger.info('User created', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', { error });
      throw error;
    }
  }

  async auditAction(action: string) {
    // Use specific channel
    const auditLogger = this.logger.channel('audit');
    auditLogger.info('User action', { action });
  }
}
```

### 3. Use in React Components

```typescript
import { useLogger } from '@abdokouta/logger';

function MyComponent() {
  const logger = useLogger();

  const handleClick = () => {
    logger.info('Button clicked', { timestamp: Date.now() });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## Configuration

### LoggerModuleOptions

```typescript
interface LoggerModuleOptions {
  /** Default channel name */
  default: string;
  
  /** Channel configurations */
  channels: Record<string, LoggerConfig>;
}

interface LoggerConfig {
  /** Transporters for this channel */
  transporters?: TransporterInterface[];
  
  /** Initial shared context */
  context?: Record<string, unknown>;
}
```

### Using defineConfig

```typescript
import { defineConfig } from '@abdokouta/logger';

export const loggerConfig = defineConfig({
  default: 'console',
  channels: {
    console: {
      transporters: [new ConsoleTransporter()],
      context: { app: 'my-app' },
    },
  },
});
```

### Using Presets

```typescript
import { defineConfig, consolePreset, silentPreset } from '@abdokouta/logger';

// Console preset (development)
export const devConfig = defineConfig({
  ...consolePreset,
  channels: {
    ...consolePreset.channels,
    console: {
      ...consolePreset.channels.console,
      context: { app: 'my-app', env: 'dev' },
    },
  },
});

// Silent preset (testing)
export const testConfig = defineConfig(silentPreset);
```

## Channels

### Console Channel

Logs to the browser console with colors and emoji.

```typescript
{
  console: {
    transporters: [new ConsoleTransporter()],
  },
}
```

### Storage Channel

Persists logs to localStorage.

```typescript
{
  storage: {
    transporters: [
      new StorageTransporter({
        key: 'app-logs',
        maxEntries: 500,
      }),
    ],
  },
}
```

### Error Channel

Multiple transporters for error handling.

```typescript
{
  errors: {
    transporters: [
      new ConsoleTransporter({ level: LogLevel.Error }),
      new StorageTransporter({ key: 'error-logs', maxEntries: 200 }),
    ],
  },
}
```

### Silent Channel

Disables logging (useful for testing).

```typescript
{
  silent: {
    transporters: [new SilentTransporter()],
  },
}
```

## API Reference

### LoggerService

Main service for logging operations.

#### Methods

- `channel(name?: string): LoggerInterface` - Get a specific channel
- `debug(message, context?)` - Log debug message
- `info(message, context?)` - Log info message
- `warn(message, context?)` - Log warning message
- `error(message, context?)` - Log error message
- `fatal(message, context?)` - Log fatal message
- `withContext(context)` - Add persistent context
- `withoutContext(keys?)` - Remove context
- `getChannelNames()` - Get all channel names
- `hasChannel(name)` - Check if channel exists
- `isChannelActive(name?)` - Check if channel is active

### Logger

Core logger class (used internally by LoggerService).

#### Methods

- `debug(message, context?)` - Log debug message
- `info(message, context?)` - Log info message
- `warn(message, context?)` - Log warning message
- `error(message, context?)` - Log error message
- `fatal(message, context?)` - Log fatal message
- `withContext(context)` - Add persistent context
- `withoutContext(keys?)` - Remove context
- `getTransporters()` - Get all transporters
- `getContext()` - Get current context

## Transporters

### ConsoleTransporter

Outputs to browser console with colors and emoji.

```typescript
new ConsoleTransporter({
  formatter: new PrettyFormatter(), // default
  level: LogLevel.Debug, // minimum level
})
```

### StorageTransporter

Persists logs to localStorage.

```typescript
new StorageTransporter({
  key: 'logger:entries', // localStorage key
  maxEntries: 100, // max entries to keep
  formatter: new JsonFormatter(), // default
  level: LogLevel.Debug, // minimum level
})
```

### SilentTransporter

No-op transporter (discards all logs).

```typescript
new SilentTransporter()
```

## Formatters

### PrettyFormatter

Colorful output with emoji (default for console).

```typescript
new PrettyFormatter()
// Output: 🐛 [DEBUG] [14:30:00.000] Hello world {userId: 42}
```

### JsonFormatter

JSON output (default for storage).

```typescript
new JsonFormatter()
// Output: {"level":"info","message":"Hello","timestamp":"...","context":{}}
```

### SimpleFormatter

Plain text output.

```typescript
new SimpleFormatter()
// Output: [DEBUG] [2026-03-28T14:30:00.000Z] Hello world {userId: 42}
```

## React Hooks

### useLogger

Access logger service in components.

```typescript
import { useLogger } from '@abdokouta/logger';

function MyComponent() {
  const logger = useLogger();
  
  // Use default channel
  logger.info('Component rendered');
  
  // Use specific channel
  const errorLogger = useLogger('errors');
  errorLogger.error('Something went wrong');
  
  return <div>Hello</div>;
}
```

### useLoggerContext

Manage logger context in components.

```typescript
import { useLoggerContext, useLogger } from '@abdokouta/logger';

function UserProfile({ userId }: { userId: string }) {
  // Add userId to all logs in this component
  useLoggerContext({ userId, component: 'UserProfile' });
  
  const logger = useLogger();
  
  const handleUpdate = () => {
    // This log will include { userId, component: 'UserProfile' }
    logger.info('Updating profile');
  };
  
  return <button onClick={handleUpdate}>Update</button>;
}
```

## Common Patterns

### Contextual Logging

```typescript
@Injectable()
export class AuthService {
  constructor(
    @Inject(LoggerService) private logger: LoggerService
  ) {}

  async login(email: string, password: string) {
    // Add request context
    this.logger.withContext({ email, action: 'login' });
    
    this.logger.info('Login attempt');
    
    try {
      const user = await this.authenticate(email, password);
      this.logger.info('Login successful', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('Login failed', { error });
      throw error;
    } finally {
      // Clean up context
      this.logger.withoutContext(['email', 'action']);
    }
  }
}
```

### Error Logging

```typescript
@Injectable()
export class PaymentService {
  constructor(
    @Inject(LoggerService) private logger: LoggerService
  ) {}

  async processPayment(orderId: string, amount: number) {
    const errorLogger = this.logger.channel('errors');
    
    try {
      const result = await this.chargeCard(orderId, amount);
      this.logger.info('Payment processed', { orderId, amount });
      return result;
    } catch (error) {
      errorLogger.error('Payment failed', {
        orderId,
        amount,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
```

### Audit Logging

```typescript
@Injectable()
export class UserService {
  constructor(
    @Inject(LoggerService) private logger: LoggerService
  ) {}

  async updateUser(userId: string, data: Partial<User>) {
    const auditLogger = this.logger.channel('audit');
    
    auditLogger.info('User update started', {
      userId,
      changes: Object.keys(data),
    });
    
    const user = await this.db.users.update(userId, data);
    
    auditLogger.info('User update completed', {
      userId,
      changes: data,
    });
    
    return user;
  }
}
```

### Environment-Based Configuration

```typescript
import { defineConfig, consolePreset, silentPreset } from '@abdokouta/logger';

export const getLoggerConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    return defineConfig({
      default: 'console',
      channels: {
        console: {
          transporters: [new ConsoleTransporter({ level: LogLevel.Warn })],
        },
        errors: {
          transporters: [
            new ConsoleTransporter({ level: LogLevel.Error }),
            new StorageTransporter({ key: 'error-logs' }),
          ],
        },
      },
    });
  }
  
  if (env === 'test') {
    return defineConfig(silentPreset);
  }
  
  // Development
  return defineConfig({
    ...consolePreset,
    channels: {
      ...consolePreset.channels,
      console: {
        ...consolePreset.channels.console,
        context: { env: 'dev' },
      },
    },
  });
};
```

## Best Practices

1. **Use Appropriate Log Levels**: Debug for development, Info for important events, Warn for issues, Error for failures, Fatal for critical errors
2. **Add Context**: Include relevant data to make logs useful
3. **Use Channels**: Separate concerns (console, storage, errors, audit)
4. **Clean Up Context**: Remove sensitive data after logging
5. **Handle Errors Gracefully**: Always catch and log errors
6. **Use Structured Logging**: Include structured data in context
7. **Monitor Storage**: Set appropriate maxEntries for StorageTransporter

## TypeScript Support

Full TypeScript support with comprehensive types:

```typescript
import type {
  LoggerInterface,
  LoggerServiceInterface,
  LoggerModuleOptions,
  LoggerConfig,
  LogEntry,
  LogLevel,
  TransporterInterface,
  FormatterInterface,
} from '@abdokouta/logger';
```

## Browser Compatibility

This package works in all modern browsers that support:
- localStorage API
- console API
- ES2020 features

No polyfills required for modern browsers (Chrome 80+, Firefox 75+, Safari 13.1+, Edge 80+).

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Support

- [Documentation](https://refine.dev/docs)
- [Discord](https://discord.gg/refine)
- [GitHub Issues](https://github.com/refinedev/refine/issues)

## Related Packages

- [@abdokouta/cache](../cache) - Multi-driver cache system
- [@abdokouta/redis](../redis) - Redis connection management
