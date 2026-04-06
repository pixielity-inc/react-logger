/**
 * Basic Logger Usage Example
 *
 * This example demonstrates the fundamental logging operations:
 * - Different log levels
 * - Contextual logging
 * - Multiple channels
 * - Persistent context
 *
 * @example
 * Run this example:
 * ```bash
 * ts-node examples/01-basic-usage.ts
 * ```
 */

import { LoggerModule, LoggerService } from '@abdokouta/react-logger';
import { Inversiland } from '@abdokouta/ts-container';

/**
 * Initialize the logger module
 */
async function setupLogger() {
  const app = await Inversiland.run({
    module: class AppModule {},
    imports: [
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
      }),
    ],
  });

  return app.get(LoggerService);
}

/**
 * Example 1: Basic log levels
 */
function logLevels(logger: LoggerService) {
  console.log('\n=== Example 1: Log Levels ===\n');

  logger.debug('This is a debug message');
  logger.info('This is an info message');
  logger.warn('This is a warning message');
  logger.error('This is an error message');
  logger.fatal('This is a fatal message');
}

/**
 * Example 2: Logging with context
 */
function loggingWithContext(logger: LoggerService) {
  console.log('\n=== Example 2: Logging with Context ===\n');

  logger.info('User logged in', {
    userId: 123,
    email: 'user@example.com',
    ip: '192.168.1.1',
  });

  logger.info('Order created', {
    orderId: 456,
    userId: 123,
    amount: 99.99,
    items: 3,
  });

  logger.error('Payment failed', {
    orderId: 456,
    error: 'Insufficient funds',
    attemptedAmount: 99.99,
  });
}

/**
 * Example 3: Persistent context
 */
function persistentContext(logger: LoggerService) {
  console.log('\n=== Example 3: Persistent Context ===\n');

  // Add persistent context
  logger.withContext({
    requestId: 'abc-123',
    userId: 42,
  });

  // All subsequent logs will include this context
  logger.info('Request started');
  logger.info('Processing data');
  logger.info('Request completed');

  // Remove specific context keys
  logger.withoutContext(['requestId']);
  logger.info('After removing requestId');

  // Clear all context
  logger.withoutContext();
  logger.info('After clearing all context');
}

/**
 * Example 4: Multiple channels
 */
async function multipleChannels() {
  console.log('\n=== Example 4: Multiple Channels ===\n');

  // Setup logger with multiple channels
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
          audit: {
            level: 'info',
            transporters: [{ type: 'console', format: 'json' }],
          },
        },
      }),
    ],
  });

  const logger = app.get(LoggerService);

  // Use default channel
  logger.info('Application log');

  // Use audit channel
  const auditLogger = logger.channel('audit');
  auditLogger.info('User action', {
    userId: 123,
    action: 'UPDATE_PROFILE',
  });
}

/**
 * Example 5: Error logging with stack traces
 */
function errorLogging(logger: LoggerService) {
  console.log('\n=== Example 5: Error Logging ===\n');

  try {
    // Simulate an error
    throw new Error('Something went wrong');
  } catch (error) {
    logger.error('Operation failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      operation: 'exampleOperation',
    });
  }
}

/**
 * Example 6: Performance tracking
 */
async function performanceTracking(logger: LoggerService) {
  console.log('\n=== Example 6: Performance Tracking ===\n');

  const start = Date.now();

  // Simulate some work
  await new Promise((resolve) => setTimeout(resolve, 100));

  const duration = Date.now() - start;

  logger.info('Task completed', {
    task: 'dataProcessing',
    duration,
    status: 'success',
  });
}

/**
 * Example 7: Conditional logging
 */
function conditionalLogging(logger: LoggerService) {
  console.log('\n=== Example 7: Conditional Logging ===\n');

  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (isDevelopment) {
    logger.debug('Development mode - detailed logging enabled');
  }

  // Always log important events
  logger.info('Application started', {
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
}

/**
 * Example 8: Structured data logging
 */
function structuredLogging(logger: LoggerService) {
  console.log('\n=== Example 8: Structured Data Logging ===\n');

  // Log with structured data
  logger.info('Database query executed', {
    query: 'SELECT * FROM users WHERE id = ?',
    params: [123],
    duration: 45,
    rowCount: 1,
  });

  logger.info('API request', {
    method: 'POST',
    path: '/api/users',
    statusCode: 201,
    responseTime: 123,
    userAgent: 'Mozilla/5.0...',
  });

  logger.info('Cache operation', {
    operation: 'SET',
    key: 'user:123',
    ttl: 300,
    size: 1024,
  });
}

/**
 * Example 9: Request/Response logging
 */
function requestResponseLogging(logger: LoggerService) {
  console.log('\n=== Example 9: Request/Response Logging ===\n');

  const requestId = 'req-' + Math.random().toString(36).substr(2, 9);

  // Log incoming request
  logger.withContext({ requestId }).info('Incoming request', {
    method: 'GET',
    path: '/api/users/123',
    headers: {
      'user-agent': 'Mozilla/5.0...',
      accept: 'application/json',
    },
  });

  // Log response
  logger.withContext({ requestId }).info('Outgoing response', {
    statusCode: 200,
    duration: 45,
    size: 1024,
  });

  // Clear request context
  logger.withoutContext(['requestId']);
}

/**
 * Example 10: Business event logging
 */
function businessEventLogging(logger: LoggerService) {
  console.log('\n=== Example 10: Business Event Logging ===\n');

  // User registration
  logger.info('User registered', {
    userId: 123,
    email: 'newuser@example.com',
    source: 'web',
    timestamp: new Date().toISOString(),
  });

  // Purchase event
  logger.info('Purchase completed', {
    orderId: 456,
    userId: 123,
    amount: 99.99,
    currency: 'USD',
    items: [
      { id: 1, name: 'Product A', price: 49.99 },
      { id: 2, name: 'Product B', price: 50.0 },
    ],
  });

  // Subscription event
  logger.info('Subscription upgraded', {
    userId: 123,
    fromPlan: 'basic',
    toPlan: 'premium',
    price: 29.99,
  });
}

/**
 * Run all examples
 */
async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Logger Basic Usage Examples          ║');
  console.log('╚════════════════════════════════════════╝');

  const logger = await setupLogger();

  logLevels(logger);
  loggingWithContext(logger);
  persistentContext(logger);
  await multipleChannels();
  errorLogging(logger);
  await performanceTracking(logger);
  conditionalLogging(logger);
  structuredLogging(logger);
  requestResponseLogging(logger);
  businessEventLogging(logger);

  console.log('\n✅ All examples completed successfully!\n');
}

// Run the examples
main().catch(console.error);
