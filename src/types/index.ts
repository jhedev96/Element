/**
 * @file Barrel file for the types directory.
 * It re-exports all the type definitions and interfaces, and imports the global
 * JSX declaration to make it available project-wide. This allows for clean
 * imports from a single `src/types` module.
 *
 * @author JheDev <jhedevx.id@gmail.com>
 * @version 10.0.4-beta5
 */

// Import global JSX declarations for its side-effects
import './global';

// Export all type aliases from definitions.ts
export * from './definitions';

// Export all interfaces from interfaces.ts
export * from './interfaces';