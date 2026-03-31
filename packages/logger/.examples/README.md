# Logger Examples

This folder contains examples demonstrating how to use `@abdokouta/logger` in
various scenarios.

## Examples Overview

### 1. Basic Usage (`01-basic-usage.ts`)

Learn the fundamental logging operations:

- ✅ Log levels (debug, info, warn, error, fatal)
- ✅ Contextual logging
- ✅ Multiple channels
- ✅ Persistent context
- ✅ Different transporters

**Run:**

```bash
ts-node examples/01-basic-usage.ts
```

### 2. Multiple Channels (`02-multiple-channels.ts`)

Work with multiple logging channels:

- ✅ Application logs
- ✅ Audit logs
- ✅ Error logs
- ✅ Channel isolation
- ✅ Different configurations per channel

**Run:**

```bash
ts-node examples/02-multiple-channels.ts
```

### 3. Structured Logging (`03-structured-logging.ts`)

Master structured logging patterns:

- ✅ Request logging
- ✅ Performance tracking
- ✅ Error tracking
- ✅ User activity logging
- ✅ Correlation IDs

**Run:**

```bash
ts-node examples/03-structured-logging.ts
```

## Quick Start

### Installation

```bash
npm install @abdokouta/logger @abdokouta/container
```

### Basic Setup

```typescript
import { LoggerModule, LoggerService } from '@abdokouta/logger';
import { Inversiland } from '@abdokouta/container';

// Initialize logger
const app = await Inversiland.run({
  module: class AppModule {},
  imports: [
    LoggerModule.forRoot({
      default: 'app',
      channels: {
        app: {
          level: 'info',
          transporters: [{ type: 'console', format: 'pretty' }],
        },
      },
    }),
  ],
});

// Get logger service
const logger = app.get(LoggerService);

// Use logger
logger.info('Application started');
```

## Common Patterns

### 1. Request Logging

```typescript
logger
  .withContext({ requestId: 'abc-123', userId: 42 })
  .info('Processing request', { method: 'GET', path: '/api/users' });
```

### 2. Error Logging

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    operation: 'riskyOperation',
  });
}
```

### 3. Performance Tracking

```typescript
const start = Date.now();
await performTask();
const duration = Date.now() - start;

logger.info('Task completed', { task: 'performTask', duration });
```

### 4. Audit Logging

```typescript
const auditLogger = logger.channel('audit');

auditLogger.info('User action', {
  userId: 123,
  action: 'UPDATE_PROFILE',
  changes: { email: 'new@example.com' },
  timestamp: new Date().toISOString(),
});
```

### 5. Debug Logging

```typescript
logger.debug('Cache hit', {
  key: 'user:123',
  ttl: 300,
  size: 1024,
});
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
logger.debug('Detailed debugging information');
logger.info('General informational messages');
logger.warn('Warning messages for potential issues');
logger.error('Error messages for failures');
logger.fatal('Critical errors requiring immediate attention');
```

### 2. Add Context to Logs

```typescript
// Good: Rich context
logger.info('User login', {
  userId: 123,
  email: 'user@example.com',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});

// Bad: No context
logger.info('User login');
```

### 3. Use Persistent Context

```typescript
// Set context once for multiple logs
logger
  .withContext({ requestId: 'abc-123', userId: 42 })
  .info('Request started')
  .info('Processing data')
  .info('Request completed');
```

### 4. Use Separate Channels

```typescript
// Application logs
const appLogger = logger.channel('app');
appLogger.info('Application event');

// Audit logs
const auditLogger = logger.channel('audit');
auditLogger.info('User action');

// Error logs
const errorLogger = logger.channel('errors');
errorLogger.error('Critical error');
```

### 5. Structure Your Logs

```typescript
// Good: Structured data
logger.info('Order created', {
  orderId: 123,
  userId: 456,
  amount: 99.99,
  items: 3,
});

// Bad: String concatenation
logger.info(`Order 123 created by user 456 for $99.99 with 3 items`);
```

## Configuration Examples

### Console Logger (Development)

```typescript
LoggerModule.forRoot({
  default: 'app',
  channels: {
    app: {
      level: 'debug',
      transporters: [
        {
          type: 'console',
          format: 'pretty',
        },
      ],
    },
  },
});
```

### File Logger (Production)

```typescript
LoggerModule.forRoot({
  default: 'app',
  channels: {
    app: {
      level: 'info',
      transporters: [
        {
          type: 'file',
          format: 'json',
          path: 'logs/app.log',
        },
      ],
    },
  },
});
```

### Multiple Channels

```typescript
LoggerModule.forRoot({
  default: 'app',
  channels: {
    app: {
      level: 'info',
      transporters: [{ type: 'console', format: 'pretty' }],
    },
    audit: {
      level: 'info',
      transporters: [{ type: 'file', format: 'json', path: 'logs/audit.log' }],
    },
    errors: {
      level: 'error',
      transporters: [
        { type: 'file', format: 'json', path: 'logs/errors.log' },
        { type: 'console', format: 'pretty' },
      ],
    },
  },
});
```

## Troubleshooting

### Logs Not Appearing

1. Check log level configuration
2. Verify transporter configuration
3. Check file permissions (for file transporter)
4. Verify LoggerModule is imported

### Performance Issues

1. Use appropriate log levels
2. Avoid logging in tight loops
3. Use async transporters
4. Consider log sampling

### File Issues

1. Check file path permissions
2. Verify disk space
3. Check file rotation settings
4. Monitor file sizes

## Additional Resources

- [Main README](../README.md) - Package documentation
- [Winston Documentation](https://github.com/winstonjs/winston) - Inspiration
- [Pino Documentation](https://getpino.io/) - Fast logging

## Contributing

Found an issue or have a suggestion? Please open an issue or submit a pull
request!
