/**
 * Logger Module
 * 
 * Configures the logger system for dependency injection.
 * Provides LoggerService (NO manager) to the application.
 * 
 * @module logger.module
 */

import { Module, forRoot, type DynamicModule } from '@abdokouta/container';

import { LoggerService } from './services/logger.service';
import { LOGGER_CONFIG } from './constants/tokens.constant';
import type { LoggerModuleOptions } from './config/logger.config';
import { SilentTransporter } from './transporters/silent.transporter';
import { ConsoleTransporter } from './transporters/console.transporter';
import type { LoggerConfig } from './interfaces/logger-config.interface';

/**
 * Logger module
 * 
 * Provides LoggerService to the application via dependency injection.
 * The service handles channels internally (NO separate manager).
 * 
 * @example
 * ```typescript
 * import { Module } from '@abdokouta/container';
 * import { LoggerModule, defineConfig } from '@abdokouta/logger';
 * import { ConsoleTransporter, StorageTransporter } from '@abdokouta/logger';
 * import { LogLevel } from '@abdokouta/logger';
 * 
 * @Module({
 *   imports: [
 *     LoggerModule.forRoot(
 *       defineConfig({
 *         default: 'console',
 *         channels: {
 *           console: {
 *             transporters: [new ConsoleTransporter()],
 *             context: { app: 'my-app' },
 *           },
 *           storage: {
 *             transporters: [new StorageTransporter({ maxEntries: 500 })],
 *           },
 *           errors: {
 *             transporters: [
 *               new ConsoleTransporter({ level: LogLevel.Error }),
 *               new StorageTransporter({ key: 'error-logs' }),
 *             ],
 *           },
 *         },
 *       })
 *     ),
 *   ],
 * })
 * export class AppModule {}
 * ```
 * 
 * @example
 * ```typescript
 * // Using logger in a service
 * import { Injectable, Inject } from '@abdokouta/container';
 * import { LoggerService } from '@abdokouta/logger';
 * 
 * @Injectable()
 * export class UserService {
 *   constructor(
 *     @Inject(LoggerService) private logger: LoggerService
 *   ) {}
 * 
 *   async createUser(data: UserData) {
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
@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern requires static methods
export class LoggerModule {
  /**
   * Configure the logger module
   * 
   * @param config - Logger configuration (can be passed directly without defineConfig)
   * @returns Dynamic module
   * 
   * @example
   * ```typescript
   * LoggerModule.forRoot({
   *   default: 'console',
   *   channels: {
   *     console: {
   *       transporters: [new ConsoleTransporter()],
   *     },
   *   },
   * })
   * ```
   */
  static forRoot(config: LoggerModuleOptions): DynamicModule {
    // Ensure default channel has transporters
    const processedConfig = LoggerModule.processConfig(config);

    return forRoot(LoggerModule, {
      providers: [
        {
          provide: LOGGER_CONFIG,
          useValue: processedConfig,
        },
        LoggerService,
      ],
      exports: [LoggerService, LOGGER_CONFIG],
    });
  }

  /**
   * Process configuration to add default transporters if needed
   * 
   * @param config - Raw configuration
   * @returns Processed configuration with defaults
   * @private
   */
  private static processConfig(config: LoggerModuleOptions): LoggerModuleOptions {
    const processedChannels: Record<string, LoggerConfig> = {};

    // Use for...in loop for better compatibility
    for (const name in config.channels) {
      if (Object.prototype.hasOwnProperty.call(config.channels, name)) {
        const channelConfig = config.channels[name];
        
        // Skip if channelConfig is undefined
        if (!channelConfig) continue;
        
        // If no transporters specified, add default based on channel name
        if (!channelConfig.transporters || channelConfig.transporters.length === 0) {
          if (name === 'silent') {
            processedChannels[name] = {
              ...channelConfig,
              transporters: [new SilentTransporter()],
            };
          } else {
            processedChannels[name] = {
              ...channelConfig,
              transporters: [new ConsoleTransporter()],
            };
          }
        } else {
          processedChannels[name] = channelConfig;
        }
      }
    }

    return {
      ...config,
      channels: processedChannels,
    };
  }
}
