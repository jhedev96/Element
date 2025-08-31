/**
 * @file This is the main entry point for the Element library.
 * It creates a singleton instance of the Element class and exports it,
 * along with the necessary functions for JSX transformation (jsx, jsxs, jsxDEV)
 * and a `createRef` utility, ensuring a complete and familiar developer experience.
 *
 * @author JheDev <jhedevx.id@gmail.com>
 * @version 10.0.4-beta5
 */

import { Element } from './Element';
import { RefObject } from './types';

/**
 * The singleton instance of the Element class.
 * Use this instance to access all library methods.
 * @example
 * el.init('#app').build(
 * el.create('h1', null, 'Hello, World!')
 * );
 */
export const el = new Element();

// =============================================================================
// # JSX FACTORY & HELPER EXPORTS
// =============================================================================
// Fungsi-fungsi ini adalah jembatan antara sintaks JSX dan metode el.create.
// `tsconfig.json` Anda harus dikonfigurasi untuk menggunakannya.
// Contoh konfigurasi tsconfig.json:
// {
//   "compilerOptions": {
//     "jsx": "react-jsx",
//     "jsxImportSource": "./path/to/your/project/src" // Sesuaikan path
//   }
// }
// Dengan konfigurasi di atas, Anda tidak perlu lagi mendefinisikan jsxFactory secara manual.
// =============================================================================

/**
 * The JSX factory function for creating elements.
 * This is automatically called by the TypeScript compiler when it encounters JSX syntax.
 * It's a direct alias for `el.create`.
 * @see {@link Element.create}
 */
export const jsx = el.create.bind(el);

/**
 * The JSX factory function for creating elements with multiple children (optimized).
 * This is an alias for `el.create` and is used by modern JSX transforms.
 * @see {@link Element.create}
 */
export const jsxs = el.create.bind(el);

/**
 * The JSX factory function for development environments, which may include source information.
 * This is an alias for `el.create`.
 * @see {@link Element.create}
 */
export const jsxDEV = el.create.bind(el);

/**
 * Creates a reference object, similar to React's `createRef`.
 * This allows you to get direct access to a DOM element instance.
 * @template T The type of the element the ref will be attached to.
 * @param {T | null} [initialValue=null] - The initial value of the ref's `current` property.
 * @returns {RefObject<T>} A ref object with a `current` property.
 * @example
 * const myInputRef = createRef<HTMLInputElement>();
 * const myInput = <input ref={myInputRef} type="text" />;
 * // Later in your code...
 * myInputRef.current?.focus();
 */
export const createRef = <T extends Node>(initialValue: T | null = null): RefObject<T> => ({
  current: initialValue,
});