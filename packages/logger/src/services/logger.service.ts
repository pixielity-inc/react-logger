/**
 * Logger Service
 *
 * Main logger service that handles channels internally (NO separate manager).
 * Provides high-level logging operations with support for multiple channels.
 *
 * **Architecture:**
 * - Manages channels internally (no separate LoggerManager)
 * - Provides unified logging API
 * - Supports multiple channels with different transporters
 * - Lazy channel initialization
 *
 * @module services/logger
 */

import { Injectable, Inject } from '@abdokouta/react-di';
import { Logger } from '../logger';
import type { LoggerInterface } from '../interfaces/logger.interface';
import type { LoggerServiceInterface } from '../interfaces/logger-service.interface';
import { LOGGER_CONFIG } from '../constants/tokens.constant';
import type { LoggerModuleOptions } from '../config/logger.config';

/**
 * Logger service implementation
 *
 * Provides a unified logging API with support for multiple channels.
 * Handles channel management internally without a separate manager class.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class UserService {
 *   constructor(
 *     @Inject(LoggerService) private logger: LoggerService
 *   ) {}
 *
 *   async createUser(data: UserData) {
 *     // Use default channel
 *     this.logger.info('Creating user', { email: data.email });
 *
 *     try {
 *       const user = await this.db.users.create(data);
 *       this.logger.info('User created', { userId: user.id });
 *       return user;
 *     } catch (error) {
 *       this.logger.error('Failed to create user', { error });
 *       throw error;
 *     }
 *   }
 *
 *   async auditAction(action: string) {
 *     // Use specific channel
 *     const auditLogger = this.logger.channel('audit');
 *     auditLogger.info('User action', { action });
 *   }
 * }
 * ```
 */
@Injectable()
export class LoggerService implements LoggerServiceInterface {
  /** Logger configuration */
  private readonly config: LoggerModuleOptions;

  /** Cached channel instances */
  private channels: Map<string, LoggerInterface> = new Map();

  /** Default channel instance */
  private defaultChannel?: LoggerInterface;

  /**
   * Create a new logger service
   *
   * @param config - Logger configuration
   */
  constructor(
    @Inject(LOGGER_CONFIG)
    config: LoggerModuleOptions
  ) {
    this.config = config;
  }

  /**
   * Get a logger channel instance
   *
   * Returns the specified channel, or the default channel if no name is provided.
   * Channels are lazily initialized and cached.
   *
   * @param name - Channel name (uses default if not specified)
   * @returns Logger instance
   * @throws Error if channel is not configured
   *
   * @example
   * ```typescript
   * // Use default channel
   * const logger = loggerService.channel();
   * logger.info('Default message');
   *
   * // Use specific channel
   * const errorLogger = loggerService.channel('errors');
   * errorLogger.error('Critical error');
   * ```
   */
  channel(name?: string): LoggerInterface {
    const channelName = name ?? this.config.default;

    // Return cached channel if exists
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName) as LoggerInterface;
    }

    // Resolve and cache new channel
    const channel = this.resolve(channelName);
    this.channels.set(channelName, channel);

    return channel;
  }

  /**
   * Log a message at the debug level (default channel)
   *
   * @param message - The log message
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * loggerService.debug('Cache hit', { key: 'user:123' });
   * ```
   */
  debug(message: string, context: Record<string, unknown> = {}): void {
    this.getDefaultChannel().debug(message, context);
  }

  /**
   * Log a message at the info level (default channel)
   *
   * @param message - The log message
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * loggerService.info('User logged in', { userId: '123' });
   * ```
   */
  info(message: string, context: Record<string, unknown> = {}): void {
    this.getDefaultChannel().info(message, context);
  }

  /**
   * Log a message at the warn level (default channel)
   *
   * @param message - The log message
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * loggerService.warn('API rate limit approaching', { remaining: 10 });
   * ```
   */
  warn(message: string, context: Record<string, unknown> = {}): void {
    this.getDefaultChannel().warn(message, context);
  }

  /**
   * Log a message at the error level (default channel)
   *
   * @param message - The log message
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * loggerService.error('Database connection failed', { error });
   * ```
   */
  error(message: string, context: Record<string, unknown> = {}): void {
    this.getDefaultChannel().error(message, context);
  }

  /**
   * Log a message at the fatal level (default channel)
   *
   * @param message - The log message
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * loggerService.fatal('Application crashed', { error, stack });
   * ```
   */
  fatal(message: string, context: Record<string, unknown> = {}): void {
    this.getDefaultChannel().fatal(message, context);
  }

  /**
   * Add persistent context to the default channel
   *
   * @param context - Key-value pairs to add to the shared context
   * @returns The logger service instance for fluent chaining
   *
   * @example
   * ```typescript
   * loggerService
   *   .withContext({ requestId: 'abc-123' })
   *   .withContext({ userId: 42 })
   *   .info('Processing request');
   * ```
   */
  withContext(context: Record<string, unknown>): this {
    this.getDefaultChannel().withContext(context);
    return this;
  }

  /**
   * Remove keys from the default channel's shared context
   *
   * @param keys - Optional array of context keys to remove
   * @returns The logger service instance for fluent chaining
   *
   * @example
   * ```typescript
   * // Remove specific keys
   * loggerService.withoutContext(['userId', 'requestId']);
   *
   * // Clear all context
   * loggerService.withoutContext();
   * ```
   */
  withoutContext(keys?: string[]): this {
    this.getDefaultChannel().withoutContext(keys);
    return this;
  }

  /**
   * Get all transporters from the default channel
   *
   * @returns Array of transporter instances
   */
  getTransporters() {
    return this.getDefaultChannel().getTransporters();
  }

  /**
   * Get the default channel name
   *
   * @returns Default channel name
   */
  getDefaultChannelName(): string {
    return this.config.default;
  }

  /**
   * Get all configured channel names
   *
   * @returns Array of channel names
   */
  getChannelNames(): string[] {
    return Object.keys(this.config.channels);
  }

  /**
   * Check if a channel is configured
   *
   * @param name - Channel name
   * @returns True if the channel is configured
   */
  hasChannel(name: string): boolean {
    return name in this.config.channels;
  }

  /**
   * Check if a channel is currently active (cached)
   *
   * @param name - Channel name (uses default if not specified)
   * @returns True if the channel is active
   */
  isChannelActive(name?: string): boolean {
    const channelName = name ?? this.config.default;
    return this.channels.has(channelName);
  }

  /**
   * Get the default channel instance
   *
   * @returns Logger instance
   * @throws Error if default channel cannot be resolved
   * @private
   */
  private getDefaultChannel(): LoggerInterface {
    if (this.defaultChannel) {
      return this.defaultChannel;
    }

    // Lazy initialize default channel
    const channelName = this.config.default;

    if (this.channels.has(channelName)) {
      this.defaultChannel = this.channels.get(channelName) as LoggerInterface;
      return this.defaultChannel;
    }

    this.defaultChannel = this.resolve(channelName);
    this.channels.set(channelName, this.defaultChannel);

    return this.defaultChannel;
  }

  /**
   * Resolve a channel by name
   *
   * Creates a new logger instance based on channel configuration.
   *
   * @param name - Channel name
   * @returns Logger instance
   * @throws Error if channel is not configured
   * @private
   */
  private resolve(name: string): LoggerInterface {
    const channelConfig = this.config.channels[name];

    if (!channelConfig) {
      throw new Error(
        `Logger channel [${name}] is not configured. ` +
          `Available channels: ${Object.keys(this.config.channels).join(', ')}`
      );
    }

    // Create logger with channel configuration
    return new Logger(channelConfig);
  }
}
