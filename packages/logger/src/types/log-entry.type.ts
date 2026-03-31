/**
 * Log Entry Type
 * 
 * Represents a single log entry with all its metadata.
 * 
 * @module types/log-entry
 */

import type { LogLevel } from '@/enums';

export interface LogEntry {
  /**
   * The severity level of this log entry.
   */
  level: LogLevel;

  /**
   * The log message.
   */
  message: string;

  /**
   * Additional context data.
   */
  context?: Record<string, unknown>;

  /**
   * Timestamp when the log was created.
   */
  timestamp: Date;

  /**
   * Channel name that produced this log.
   */
  channel?: string;
}
