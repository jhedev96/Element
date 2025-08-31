/**
 * @file Contains all interface definitions for the Element library.
 * These interfaces describe the shape of objects, props, and callbacks.
 *
 * @author JheDev <jhedevx.id@gmail.com>
 * @version 10.0.4-beta5
 */

import type {
    Selector,
    DomNode,
    JsxElementInput,
    Tag,
    Children,
    JsxElement
} from './definitions';

//==============================================================================
// # CORE INTERFACES
//==============================================================================

/**
 * Describes the structure of a reference object, commonly used for `ref` props
 * to get direct access to a DOM element.
 * @template T The type of the element being referenced.
 */
export interface RefObject<T> {
  current: T | null;
}

/**
 * Describes the configuration object for the Element constructor or init method.
 */
export interface IElementConfig {
  /** The root element or selector for DOM manipulation. */
  root?: Selector | DomNode;
  /** Whether to enable HTML sanitization by default for all created elements. */
  sanitize?: boolean;
}

//==============================================================================
// # METHOD & BUILDER INTERFACES
//==============================================================================

/**
 * Defines the structure for the builder function passed to `init().build()`.
 * Allows for appending or prepending elements programmatically.
 */
export interface IBuildCallback {
  append(el: JsxElementInput): void;
  prepend(el: JsxElementInput): void;
}

/**
 * Defines the structure for the children callback in `create()`.
 * Allows for creating and appending nested children in a loop.
 */
export interface IChildrenCallback {
    childrens(elemTag: Tag, elemProps: ElementProps, elemChild: Children, loop?: number): void;
}

/**
 * Represents the set of methods returned by the `init()` function for chainable actions
 * on a specified root element.
 */
export interface IElementMethods {
  build(elem: JsxElementInput | JsxElementInput[] | ((builder: IBuildCallback) => void)): void;
  append(elem: JsxElementInput): void;
  prepend(elem: JsxElementInput): void;
  appendTo(elem: JsxElementInput): void;
  prependTo(elem: JsxElementInput): void;
  buildFromObject(
    domObject: DomObject,
    mergeObject?: DomObject,
    targetNodeId?: string,
    mergePosition?: 'append' | 'prepend' | 'replace',
    sanitizeConfig?: boolean | { sanitize?: boolean }
  ): void;
}

//==============================================================================
// # DOM OBJECT & COMPONENT INTERFACES
//==============================================================================

/**
 * Describes the internal object structure used to represent a DOM element.
 * This is the blueprint for building elements from objects and vice-versa.
 */
export interface DomObject {
  /** The tag name of the node (e.g., 'div', 'p', '#text'). */
  nodeName: string;
  /** A key-value map of attributes for the element. */
  attrs?: Record<string, any>;
  /** The text content of the node, if it's a simple text node. */
  content?: string | number;
  /** An array of child DomObject, representing nested elements. */
  children?: DomObject[];
  /** A key-value map of event listeners to attach to the element. */
  events?: Record<string, EventListener>;
}

/**
 * Defines a Functional Component. It's a function that takes props and returns a renderable element.
 * @template P The type of the props object for the component.
 */
export interface FunctionalComponent<P = {}> {
    (props: P & { children?: Children }): JsxElement | string | null | undefined | boolean;
}

/**
 * Base properties for any element created, including standard props and event handlers.
 * It also includes special properties for sanitization and refs.
 */
export interface ElementProps extends Record<string, any> {
    children?: Children;
    sanitizeChildren?: boolean;
    ref?: RefObject<any>;
    assign?: (el: HTMLElement | SVGElement) => void;
    dangerouslySetInnerHTML?: { __html: string };
}
