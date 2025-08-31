/**
 * @file Contains the global JSX namespace declaration.
 * This file is crucial for TypeScript to understand and type-check JSX syntax
 * when using this library. It should be imported for its side effects.
 *
 * @author JheDev <jhedevx.id@gmail.com>
 * @version 10.0.4-beta5
 */

import type { JsxElement } from './definitions';

//==============================================================================
// # GLOBAL JSX DECLARATION
//==============================================================================

/**
 * This global namespace declaration is essential for TypeScript's JSX support.
 * It tells TypeScript how to type-check JSX syntax, what elements are valid,
 * and what attributes they can have.
 */
declare global {
  namespace JSX {
    /** The return type of a JSX expression. */
    type Element = JsxElement | null;

    /** Defines intrinsic attributes that can be used on any element, like `key`. */
    interface IntrinsicAttributes {
      key?: string | number;
    }

    /**
     * Defines all valid HTML and SVG elements and their corresponding props (as `any` for maximum flexibility).
     * This is the core of JSX type-safety for DOM elements.
     */
    interface IntrinsicElements {
      // HTML
      a: any; abbr: any; address: any; area: any; article: any; aside: any; audio: any;
      b: any; base: any; bdi: any; bdo: any; blockquote: any; body: any; br: any; button: any;
      canvas: any; caption: any; center: any; cite: any; code: any; col: any; colgroup: any;
      data: any; datalist: any; dd: any; del: any; details: any; dfn: any; dialog: any; div: any; dl: any; dt: any;
      em: any; embed: any;
      fieldset: any; figcaption: any; figure: any; font: any; footer: any; form: any;
      h1: any; h2: any; h3: any; h4: any; h5: any; h6: any; head: any; header: any; hgroup: any; hr: any; html: any;
      i: any; iframe: any; img: any; input: any; ins: any;
      kbd: any;
      label: any; legend: any; li: any; link: any;
      main: any; map: any; mark: any; menu: any; meta: any; meter: any;
      nav: any; noscript: any;
      object: any; ol: any; optgroup: any; option: any; output: any;
      p: any; picture: any; pre: any; progress: any;
      q: any;
      rp: any; rt: any; ruby: any;
      s: any; samp: any; script: any; section: any; select: any; slot: any; small: any; source: any; span: any; strong: any; style: any; sub: any; summary: any; sup: any;
      table: any; tbody: any; td: any; template: any; textarea: any; tfoot: any; th: any; thead: any; time: any; title: any; tr: any; track: any;
      u: any; ul: any;
      var: any; video: any;
      wbr: any;

      // SVG
      svg: any; animate: any; animateMotion: any; animateTransform: any;
      circle: any; clipPath: any; defs: any; desc: any; discard: any; ellipse: any;
      feBlend: any; feColorMatrix: any; feComponentTransfer: any; feComposite: any; feConvolveMatrix: any; feDiffuseLighting: any; feDisplacementMap: any; feDistantLight: any; feDropShadow: any; feFlood: any; feFuncA: any; feFuncB: any; feFuncG: any; feFuncR: any; feGaussianBlur: any; feImage: any; feMerge: any; feMergeNode: any; feMorphology: any; feOffset: any; fePointLight: any; feSpecularLighting: any; feSpotLight: any; feTile: any; feTurbulence: any;
      filter: any; foreignObject: any; g: any; image: any; line: any; linearGradient: any;
      marker: any; mask: any; metadata: any; mpath: any; path: any; pattern: any;
      polygon: any; polyline: any; radialGradient: any; rect: any;
      set: any; stop: any; switch: any; symbol: any;
      text: any; textPath: any; tspan: any; use: any; view: any;

      // Allow any tag for flexibility with custom elements
      [elemName: string]: any;
    }
  }
}