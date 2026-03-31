/**
 * useLogger Hook
 * 
 * React hook for accessing the logger service in components.
 * Provides access to the default channel or a specific channel.
 * 
 * @module hooks/use-logger
 */

import { useInject } from '@abdokouta/react-di';
import { LoggerService } from '@/services/logger.service';
import type { LoggerInterface } from '@/interfaces/logger.interface';

/**
 * Access the logger service in React components
 * 
 * Returns the logger service instance or a specific channel.
 * 
 * @param channelName - Optional channel name (uses default if not specified)
 * @returns Logger instance
 * 
 * @example
 * ```typescript
 * import { useLogger } from '@abdokouta/logger';
 * 
 * function MyComponent() {
 *   const logger = useLogger();
 * 
 *   const handleClick = () => {
 *     logger.info('Button clicked', { timestamp: Date.now() });
 *   };
 * 
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Use specific channel
 * function ErrorBoundary({ error }: { error: Error }) {
 *   const errorLogger = useLogger('errors');
 * 
 *   useEffect(() => {
 *     errorLogger.error('Component error', {
 *       message: error.message,
 *       stack: error.stack,
 *     });
 *   }, [error]);
 * 
 *   return <div>Something went wrong</div>;
 * }
 * ```
 */
export function useLogger(channelName?: string): LoggerInterface {
  const loggerService = useInject(LoggerService);
  
  if (channelName) {
    return loggerService.channel(channelName);
  }
  
  // Return the service itself which implements LoggerInterface
  return loggerService as LoggerInterface;
}
