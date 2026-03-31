/**
 * Dependency Injection Tokens
 * 
 * Defines DI tokens for the logger package.
 * Used with @abdokouta/react-di for dependency injection.
 * 
 * @module constants/tokens
 */

/**
 * Logger configuration token
 * 
 * Used to inject the logger configuration into the LoggerService.
 * 
 * @example
 * ```typescript
 * @Injectable()
 * class LoggerService {
 *   constructor(
 *     @Inject(LOGGER_CONFIG) private config: LoggerModuleOptions
 *   ) {}
 * }
 * ```
 */
export const LOGGER_CONFIG = Symbol('LOGGER_CONFIG');

/**
 * Logger service token
 * 
 * Used to inject the logger service into other services.
 * 
 * @example
 * ```typescript
 * @Injectable()
 * class UserService {
 *   constructor(
 *     @Inject(LOGGER_SERVICE) private logger: LoggerService
 *   ) {}
 * }
 * ```
 */
export const LOGGER_SERVICE = Symbol('LOGGER_SERVICE');
