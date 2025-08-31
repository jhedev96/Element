# Element.js

![Version](https://img.shields.io/badge/version-10.1--beta1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Contributions](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)

**Element.js** is a lightweight, modern, and dependency-free JavaScript front-end library, engineered to simplify DOM manipulation, build dynamic user interfaces, and create standard Web Components in a declarative and efficient way.

---

### Philosophy

In a complex JavaScript ecosystem, **Element.js** was born from the need for a tool that is both powerful and simple. Our philosophy is to provide a "Swiss Army knife" for UI development:

1.  **Declarative Power:** Adopt a React-inspired syntax like JSX and Functional Components to make UI code more readable and manageable, without the overhead of a Virtual DOM.
2.  **Security by Default:** HTML, CSS, and URL sanitization are core features, not afterthoughts. The library defaults to protecting applications from XSS attacks by cleaning unsafe inputs.
3.  **Extreme Flexibility:** Whether you want to render a few simple elements, build an object-driven Single Page Application, or create reusable Web Components, Element.js provides the necessary APIs.
4.  **Embrace the Platform:** Rather than creating a walled garden, Element.js seamlessly integrates with modern web standards, especially **Custom Elements**, allowing developers to create components that are interoperable across frameworks.

### Core Features

-   **Declarative API:** Create complex elements with a clean, intuitive syntax.
-   **JSX & Functional Components:** Build your UI from small, reusable functions with a familiar JSX-like syntax.
-   **Powerful Rendering Engine:** Fine-grained control over DOM updates with methods like `build`, `append`, `prepend`, and the core `render` method.
-   **Built-in Sanitization:** A robust whitelist-based sanitizer for HTML tags, attributes, CSS styles, and URL schemas. It's on by default for safety.
-   **Object-Driven DOM:** Convert HTML strings to JavaScript object structures and back. Build entire DOM trees from objects and merge new content into them with precision.
-   **Web Components Integration:** A simple yet powerful `register` helper to turn your Functional Components into standard, framework-agnostic Web Components.
-   **Zero Dependencies:** Lightweight and ready to use without any external dependencies.

### Installation & Setup

Download the `Element.js` file and include it in your project as an ES Module.

```html
<script type="module" src="path/to/app.js"></script>

import { el } from './path/to/Element.js';
```

**For JSX Support:**
To use JSX syntax, you need a transpiler like Babel. Configure it with the following pragma in your `.babelrc` or build tool configuration:

```json
{
  "plugins": [
    ["@babel/plugin-transform-react-jsx", {
      "pragma": "el.create",
      "pragmaFrag": "el.Fragment"
    }]
  ]
}
```
*(Note: `el.Fragment` would need to be implemented as a simple alias for `document.createDocumentFragment()` if you need fragment support in JSX).*

### Deep Dive: API Usage

#### Initialization: `el.init()`

The entry point to rendering content. It targets a root element in the DOM and returns a set of rendering methods.

```javascript
// Initialize with a CSS selector
const app = el.init('#app');

// Initialize with a DOM Node
const appRoot = document.getElementById('app');
const app = el.init(appRoot);

// Initialize with a configuration object
const appUnsafe = el.init({
  root: '#app',
  sanitize: false // Disables global sanitization for this instance
});
```

The `init` method returns an object with these methods:
* `build(elements)`: Clears the root element and renders the new element(s).
* `append(element)`: Appends an element to the root.
* `prepend(element)`: Prepends an element to the root.
* `buildFromObject(...)`: Constructs and renders a DOM tree from a JS object.

#### The Core: `el.create(tag, props, children, sanitizeConfig)`

This is the most important method in the library. It creates a DOM element but does not attach it to the DOM.

-   **`tag`** (String | Function): An HTML/SVG tag name (`'div'`, `'svg'`) or a Functional Component.
-   **`props`** (Object): An object containing attributes, properties, and event listeners.
-   **`children`** (Any): The element's children. Can be a string, number, another element, an array of elements, or even a function (for the render props pattern).
-   **`sanitizeConfig`** (Boolean | Object): Overrides the instance's sanitize setting for this specific element and its children. Example: `{ sanitize: false }`.

**Props In-Depth:**

```javascript
el.create('div', {
  // Standard HTML attributes
  id: 'my-div',
  class: 'container main', // or ['container', 'main']
  'data-id': '123',

  // Style can be an object or a string
  style: { backgroundColor: 'blue', fontSize: '16px' },

  // Event listeners (camelCase or lowercase)
  onclick: (e) => console.log('Clicked!', e.target),

  // Special Properties for direct DOM access
  ref: myRefObject, // myRefObject.current will be the DOM element
  assign: (domNode) => { domNode.focus(); }, // A function that receives the element

  // Dangerously set inner HTML (sanitized by default)
  dangerouslySetInnerHTML: { __html: '<span>Raw HTML</span>' },

  // Boolean attributes
  disabled: true, // Becomes <... disabled="disabled">
});
```

#### The Rendering Engine: `el.render(parent, element, position, sanitize)`

This is the underlying function used by `init`'s helpers (`append`, `build`). You can use it for fine-grained control over where elements are placed.

-   **`parent`** (String | HTMLElement): The parent to render into.
-   **`element`** (Any): The element or text to render.
-   **`position`** (String): `'append'` (default) or `'prepend'`.
-   **`sanitize`** (Boolean): Overrides the default sanitization for this operation.

```javascript
const target = document.getElementById('some-container');
const newPara = el.create('p', {}, 'I was rendered directly!');

// Render it at the end of the target
el.render(target, newPara, 'append');
```

#### HTML & Text Handling

**`el.jsx(htmlString, sanitize?)`**
Parses a string of HTML and returns a DOM element. Useful for content coming from a CMS or database. Sanitization is ON by default.

```javascript
const cardHtml = `<div class="card"><h3>From String</h3></div>`;
const cardElement = el.jsx(cardHtml); // Returns a DOM element
app.append(cardElement);
```

**`el.text(string, parse?, sanitize?)`**
Primarily creates a `TextNode`. If `parse` is `true`, it attempts to parse the string as HTML, returning a DOM element or fragment.

```javascript
const textNode = el.text('Just simple text.'); // A simple TextNode
const parsedHtml = el.text('<b>Parsed Bold</b>', true); // Returns an element
```

#### Object-Driven DOM

**`el.buildObjectFromHTML(htmlString)`**
Converts an HTML string into a JavaScript object representation.

```javascript
const html = '<div id="main"><p>Hello</p></div>';
const domObj = el.buildObjectFromHTML(html);
/*
Resulting object:
{
  nodeName: 'div',
  attrs: { id: 'main' },
  children: [
    { nodeName: 'p', content: 'Hello' }
  ]
}
*/
```

**`app.buildFromObject(domObject, mergeObject?, targetNodeId?, mergePosition?)`**
A powerful method to build a DOM tree from an object, with an option to merge another element into a specific part of the tree before rendering.

```javascript
const userCard = {
  nodeName: 'div',
  attrs: { class: 'user-card' },
  children: [
    { nodeName: 'h4', content: 'User Profile' },
    { nodeName: 'div', attrs: { id: 'user-details' } } // Target for merging
  ]
};

const userDetails = el.create('p', {}, 'Name: JheDev');

// Build the card, but first, inject 'userDetails' inside the div with id 'user-details'
app.buildFromObject(userCard, userDetails, 'user-details', 'append');
```

#### Web Components: `el.customElements.register()`

Turns a Functional Component into a standard Custom Element.

-   **`Component`** (Function): The functional component to register.
-   **`tagName`** (String): The HTML tag name (must contain a hyphen).
-   **`propNames`** (Array<String>): A list of attribute names to observe. These will be passed as props. The library automatically handles `kebab-case` to `camelCase` conversion for props.
-   **`options`** (Object): Options like `{ shadow: true }` to use the Shadow DOM.

```javascript
// 1. Define the component
function SimpleCounter(props) {
  const start = props.start || 0; // Props come from attributes
  return el.create('div', {}, [
    el.create('span', {}, `Value: ${start}`),
    el.create('button', {}, '+')
  ]);
}

// 2. Register it as a Web Component
el.customElements.register(
  SimpleCounter,
  'simple-counter', // <simple-counter>
  ['start'] // observe the 'start' attribute
);
```

Now you can use it in your HTML: `<simple-counter start="5"></simple-counter>`.

### Sanitization Deep Dive

Security is a primary feature. Element.js uses a whitelist approach.

-   **Allowed Tags:** A safe list of HTML tags (e.g., `<div>`, `<p>`, `<a>`, but not `<script>`). Access with `el.AllowedTags`.
-   **Allowed Attributes:** Safe attributes (e.g., `href`, `src`, `class`, but not `onerror`). Access with `el.AllowedAttributes`.
-   **Allowed CSS Styles:** Safe CSS properties (e.g., `color`, `font-weight`, but not `position`). Access with `el.AllowedCssStyles`.
-   **Allowed URL Schemas:** `http:`, `https:`, `mailto:`, etc. Prevents `javascript:...` in `hrefs`. Access with `el.AllowedSchemas`.

Any tag, attribute, style, or schema not in these whitelists is automatically removed when sanitization is active.

### Full API Reference

-   `el.init(opts, sanitize?)`: Returns `{ build, append, prepend, buildFromObject }`.
-   `el.create(tag, props?, children?, sanitizeConfig?)`: Returns `HTMLElement | SVGElement | DocumentFragment`.
-   `el.render(parent, elem, pos?, sanitize?)`: Renders an element to a parent.
-   `el.jsx(htmlString, sanitize?)`: Returns `HTMLElement | null`.
-   `el.text(str, parse?, sanitize?)`: Returns `TextNode | HTMLElement`.
-   `el.children(tag, props, children, count)`: Creates an array of elements.
-   `el.buildObjectFromHTML(htmlString)`: Returns `Object | null`.
-   `el.buildObjectFromHTMLNode(node)`: Returns `Object | null`.
-   `el.setAttributes(el, props, isSVG?, sanitize?)`: Applies props to an element.
-   `el.customElements.register(Component, tagName?, propNames?, options?)`: Defines a custom element.
-   `el.AllowedTags` (Getter): Returns the tag whitelist.
-   `el.AllowedAttributes` (Getter): Returns the attribute whitelist.
-   `el.AllowedCssStyles` (Getter): Returns the CSS whitelist.
-   `el.AllowedSchemas` (Getter): Returns the URL schema whitelist.

### Contributing

Contributions are welcome! Please fork the repository, create a new branch for your feature or fix, and submit a pull request.

### License

This project is licensed under the MIT License.
