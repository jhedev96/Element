/**
 * @file This file contains the default whitelist configurations for the sanitizer.
 * Separating these makes them easier to manage, view, and override if needed.
 * These defaults are based on a common understanding of safe HTML for content rendering.
 *
 * @author JheDev <jhedevx.id@gmail.com>
 * @version 10.0.4-beta5
 */

import { Whitelist } from './types';

/** Default allowed HTML tags. */
export const DEFAULT_TAG_WHITELIST: Whitelist = {
    A: true, ABBR: true, B: true, BLOCKQUOTE: true, BODY: true, BR: true, CENTER: true,
    CODE: true, DD: true, DIV: true, DL: true, DT: true, EM: true, FONT: true,
    H1: true, H2: true, H3: true, H4: true, H5: true, H6: true, HR: true, I: true,
    IMG: true, LABEL: true, LI: true, OL: true, P: true, PRE: true, SMALL: true,
    SOURCE: true, SPAN: true, STRONG: true, SUB: true, SUP: true, TABLE: true,
    TBODY: true, TR: true, TD: true, TH: true, THEAD: true, UL: true, U: true,
    VIDEO: true
};

/** Special tags that are allowed but processed into a DIV. */
export const DEFAULT_CONTENT_TAG_WHITELIST: Whitelist = {
    FORM: true, 'GOOGLE-SHEETS-HTML-ORIGIN': true
};

/** Default allowed attributes on elements. */
export const DEFAULT_ATTRIBUTE_WHITELIST: Whitelist = {
    align: true, color: true, controls: true, height: true, href: true, id: true,
    src: true, style: true, target: true, title: true, type: true, width: true
};

/** Default allowed CSS properties in style attributes. */
export const DEFAULT_CSS_WHITELIST: Whitelist = {
    'background-color': true, color: true, 'font-size': true, 'font-weight': true,
    'text-align': true, 'text-decoration': true, width: true
};

/** Default allowed URL schemas in URI attributes like `href`. */
export const DEFAULT_SCHEMA_WHITELIST: string[] = [
    'http:', 'https:', 'data:', 'm-files:', 'file:', 'ftp:', 'mailto:', 'pw:'
];

/** Attributes that are treated as URIs and checked against the schema whitelist. */
export const DEFAULT_URI_ATTRIBUTES: Whitelist = {
    href: true, action: true
};

/** Default allowed SVG elements. */
export const DEFAULT_SVG_ELEMENTS: string[] = [
    'animate', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'defs',
    'desc', 'discard', 'ellipse', 'filter', 'foreignObject', 'g', 'image', 'line',
    'linearGradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern',
    'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'stop', 'svg',
    'switch', 'symbol', 'text', 'textPath', 'tspan', 'use', 'view'
];

/** A map of common XML namespaces. */
export const NAMESPACES: Record<string, string> = {
    svg: 'http://www.w3.org/2000/svg',
    html: 'http://www.w3.org/1999/xhtml',
    xml: 'http://www.w3.org/XML/1998/namespace',
    xlink: 'http://www.w3.org/1999/xlink',
    xmlns: 'http://www.w3.org/2000/xmlns/',
    mathMl: 'http://www.w3.org/1998/Math/MathML'
};