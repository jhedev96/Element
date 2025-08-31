/**
 * @file Contains all core type alias definitions for the Element library.
 * These types define the fundamental building blocks and inputs used throughout the system.
 *
 * @author JheDev <jhedevx.id@gmail.com>
 * @version 10.0.4-beta5
 */

import type { IElementConfig, FunctionalComponent } from './interfaces';

//==============================================================================
// # CORE TYPES
//==============================================================================

/** Defines the structure for a whitelist object, where keys are allowed tags/attributes. */
export type Whitelist = Record<string, true>;

/** Represents a standard DOM Node that can be targeted by the library. */
export type DomNode = HTMLElement | SVGElement | Document;

/** Represents a CSS selector string for querying the DOM. */
export type Selector = string;

/**
 * Represents the root element(s) that the library will manipulate.
 * It can be a single node, a list of nodes, or null if not found.
 */
export type RootElement = DomNode | NodeListOf<Element> | null;

/**
 * Defines the possible input for initializing the Element class,
 * which can be a selector, a direct DOM node, or a configuration object.
 */
export type ElementInput = Selector | DomNode | IElementConfig;

//==============================================================================
// # JSX & COMPONENT TYPES
//==============================================================================

/**
 * Represents any valid element that can be rendered, including DOM nodes,
 * text, fragments, or null/boolean for conditional rendering.
 */
export type JsxElement = HTMLElement | SVGElement | Text | DocumentFragment;

/**
 * Represents any valid node that can be a child in JSX, including other elements,
 * strings, numbers, or even functional components.
 */
export type JsxChild = JsxElement | string | number | FunctionalComponent<any> | null | undefined | boolean;

/**
 * Represents the children that can be passed to a component or element.
 * Can be a single child or an array of children, including nested arrays.
 */
export type Children = JsxChild | JsxChild[];

/**
 * Represents the input type for elements that can be rendered, which can be
 * a raw element, string, number, or a component function.
 */
export type JsxElementInput = JsxElement | string | number | FunctionalComponent<any>;

/** The tag for an element, which can be a string (like 'div') or a Functional Component. */
export type Tag<P = {}> = keyof JSX.IntrinsicElements | FunctionalComponent<P>;
