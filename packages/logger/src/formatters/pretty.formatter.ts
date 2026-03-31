/**
 * Pretty Formatter
 *
 * A visually rich formatter that produces colorful, emoji-prefixed
 * log output designed for the browser console. Each log level is
 * assigned a distinct emoji and CSS color to make scanning logs
 * effortless during development.
 *
 * This is the default formatter used by the ConsoleTransporter.
 *
 * @module formatters/pretty
 *
 * @example
 * ```ts
 * const formatter = new PrettyFormatter();
 * const output = formatter.format(entry);
 * // => "🐛 [DEBUG] [14:30:00.000] Hello world {userId: 42}"
 * ```
 */
import { LogLevel } from '@/enums';
import type { FormatterInterface, LogEntry } from '@/interfaces';

/**
 * Mapping of log levels to their emoji prefix.
 * Provides instant visual identification of severity in console output.
 */
const LEVEL_EMOJI: Record<LogLevel, string> = {
  [LogLevel.Debug]: '🐛',
  [LogLevel.Info]: 'ℹ️',
  [LogLevel.Warn]: '⚠️',
  [LogLevel.Error]: '❌',
  [LogLevel.Fatal]: '💀',
};

/**
 * Mapping of log levels to their display label.
 * Used in the formatted output string between brackets.
 */
const LEVEL_LABEL: Record<LogLevel, string> = {
  [LogLevel.Debug]: 'DEBUG',
  [LogLevel.Info]: 'INFO',
  [LogLevel.Warn]: 'WARN',
  [LogLevel.Error]: 'ERROR',
  [LogLevel.Fatal]: 'FATAL',
};

/**
 * Mapping of log levels to CSS color strings for browser console styling.
 * These colors are applied via `%c` formatting in `console.log`.
 */
export const LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.Debug]: 'color: #8B8B8B',
  [LogLevel.Info]: 'color: #2196F3',
  [LogLevel.Warn]: 'color: #FF9800',
  [LogLevel.Error]: 'color: #F44336',
  [LogLevel.Fatal]:
    'color: #FFFFFF; background: #F44336; font-weight: bold; padding: 1px 4px; border-radius: 2px',
};

export class PrettyFormatter implements FormatterInterface {
  /**
   * Format a log entry into a pretty, human-readable string with
   * emoji prefix, level badge, timestamp, message, and context.
   *
   * The returned string includes `%c` placeholders for CSS styling
   * in the browser console. The ConsoleTransporter is responsible
   * for passing the corresponding style strings.
   *
   * @param entry - The log entry to format.
   * @returns The formatted string with CSS style placeholders.
   */
  format(entry: LogEntry): string {
    const emoji = LEVEL_EMOJI[entry.level];
    const label = LEVEL_LABEL[entry.level];
    const time = this.formatTimestamp(entry.timestamp);
    const contextStr = this.formatContext(entry.context);

    return `${emoji} %c[${label}]%c [${time}] ${entry.message}${contextStr}`;
  }

  /**
   * Extract a short time string (HH:mm:ss.SSS) from an ISO timestamp.
   *
   * @param timestamp - ISO 8601 timestamp string.
   * @returns A short time-only representation.
   */
  private formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const ms = String(date.getMilliseconds()).padStart(3, '0');
      
      return `${hours}:${minutes}:${seconds}.${ms}`;
    } catch {
      return timestamp;
    }
  }

  /**
   * Serialize context data into a compact, readable string.
   * Returns an empty string when context is empty to keep output clean.
   *
   * @param context - The context record to serialize.
   * @returns A formatted context string or empty string.
   */
  private formatContext(context: Record<string, unknown>): string {
    const keys = Object.keys(context);

    if (keys.length === 0) {
      return '';
    }

    try {
      return ` ${JSON.stringify(context)}`;
    } catch {
      return ` [context serialization failed]`;
    }
  }
}
