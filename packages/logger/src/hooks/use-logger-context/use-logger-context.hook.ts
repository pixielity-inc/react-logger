/**
 * useLoggerContext Hook
 *
 * React hook for managing logger context in components.
 * Automatically adds and removes context based on component lifecycle.
 *
 * @module hooks/use-logger-context
 */

import { useEffect } from 'react';
import { useLogger } from '../use-logger';

/**
 * Manage logger context in React components
 *
 * Automatically adds context when the component mounts and removes it when unmounted.
 * Useful for adding component-specific context to all logs.
 *
 * @param context - Context to add to the logger
 * @param channelName - Optional channel name (uses default if not specified)
 *
 * @example
 * ```typescript
 * import { useLoggerContext } from '@abdokouta/logger';
 *
 * function UserProfile({ userId }: { userId: string }) {
 *   // Add userId to all logs in this component
 *   useLoggerContext({ userId, component: 'UserProfile' });
 *
 *   const logger = useLogger();
 *
 *   const handleUpdate = () => {
 *     // This log will include { userId, component: 'UserProfile' }
 *     logger.info('Updating profile');
 *   };
 *
 *   return <button onClick={handleUpdate}>Update</button>;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With specific channel
 * function PaymentForm({ orderId }: { orderId: string }) {
 *   useLoggerContext({ orderId, form: 'payment' }, 'payment');
 *
 *   const logger = useLogger('payment');
 *
 *   const handleSubmit = () => {
 *     logger.info('Payment submitted');
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useLoggerContext(context: Record<string, unknown>, channelName?: string): void {
  const logger = useLogger(channelName);

  useEffect(() => {
    // Add context on mount
    logger.withContext(context);

    // Remove context on unmount
    return () => {
      logger.withoutContext(Object.keys(context));
    };
  }, [logger, context]);
}
