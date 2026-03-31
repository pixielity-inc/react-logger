/**
 * @abdokouta/logger
 *
 * A lightweight, client-side logging package inspired by Laravel's
 * logging architecture. Provides a clean interface for structured
 * logging with pluggable transporters, customizable formatters,
 * contextual logging, colors, and emoji support.
 *
 * @example
 * ```typescript
 * import { LoggerModule, defineConfig, LogLevel } from '@abdokouta/logger';
 * import { ConsoleTransporter, StorageTransporter } from '@abdokouta/logger';
 *
 * // Configure in your module
 * @Module({
 *   imports: [
 *     LoggerModule.forRoot(
 *       defineConfig({
 *         default: 'console',
 *         channels: {
 *           console: { transporters: [new ConsoleTransporter()] },
 *           storage: { transporters: [new StorageTransporter()] },
 *         },
 *       })
 *     ),
 *   ],
 * })
 * export class AppModule {}
 *
 * // Use in services
 * @Injectable()
 * class UserService {
 *   constructor(
 *     @Inject(LoggerService) private logger: LoggerService
 *   ) {}
 *
 *   async createUser(data: UserData) {
 *     this.logger.info('Creating user', { email: data.email });
 *   }
 * }
 *
 * // Use in React components
 * function MyComponent() {
 *   const logger = useLogger();
 *   logger.info('Component rendered');
 *   return <div>Hello</div>;
 * }
 * ```
 *
 * @module @abdokouta/logger
 */

// ============================================================================
// Enums
// ============================================================================
export { LogLevel } from './enums';

// ============================================================================
// Core Interfaces
// ============================================================================
export type { LogEntry } from './interfaces';
export type { FormatterInterface } from './interfaces';
export type { TransporterInterface } from './interfaces';
export type { LoggerInterface } from './interfaces';
export type { LoggerConfig } from './interfaces';
export type { LoggerServiceInterface } from './interfaces/logger-service.interface';

// ============================================================================
// Service (DI)
// ============================================================================
export { LoggerService } from './services/logger.service';
export { LoggerService as Logger } from './services/logger.service';

// ============================================================================
// Module (DI Configuration)
// ============================================================================
export { LoggerModule } from './logger.module';
export type { LoggerModuleOptions } from './config/logger.config';

// ============================================================================
// Utils
// ============================================================================
export { defineConfig } from './utils';

// ============================================================================
// Formatters
// ============================================================================
export { PrettyFormatter } from './formatters';
export { JsonFormatter } from './formatters';
export { SimpleFormatter } from './formatters';

// ============================================================================
// Transporters
// ============================================================================
export { ConsoleTransporter } from './transporters';
export type { ConsoleTransporterOptions } from './transporters';

export { SilentTransporter } from './transporters';

export { StorageTransporter } from './transporters';
export type { StorageTransporterOptions } from './transporters';

// ============================================================================
// React Hooks
// ============================================================================
export { useLogger } from './hooks/use-logger';
export { useLoggerContext } from './hooks/use-logger-context';
