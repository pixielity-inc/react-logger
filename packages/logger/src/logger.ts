/**
 * Logger Implementation
 * 
 * Core logger class that implements the LoggerInterface.
 * Handles log entry creation, context management, and transporter dispatch.
 * 
 * @module logger
 */

import type { LoggerInterface } from './interfaces/logger.interface';
import type { LoggerConfig } from './interfaces/logger-config.interface';
import type { TransporterInterface } from './interfaces/transporter.interface';
import type { LogEntry } from './interfaces/log-entry.interface';
import { LogLevel } from './enums/log-level.enum';

/**
 * Logger class
 * 
 * Implements the LoggerInterface with support for multiple transporters,
 * contextual logging, and log level filtering.
 */
export class Logger implements LoggerInterface {
  private readonly config: LoggerConfig;
  private sharedContext: Record<string, unknown> = {};

  constructor(config: LoggerConfig) {
    this.config = config;
    if (config.context) {
      this.sharedContext = { ...config.context };
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  fatal(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, context);
  }

  withContext(context: Record<string, unknown>): this {
    this.sharedContext = { ...this.sharedContext, ...context };
    return this;
  }

  withoutContext(keys?: string[]): this {
    if (!keys) {
      this.sharedContext = {};
    } else {
      for (const key of keys) {
        delete this.sharedContext[key];
      }
    }
    return this;
  }

  getTransporters(): TransporterInterface[] {
    return this.config.transporters;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      context: { ...this.sharedContext, ...context },
      timestamp: new Date(),
    };

    for (const transporter of this.config.transporters) {
      transporter.log(entry);
    }
  }
}
