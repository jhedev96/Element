/**
 * @file The main Element class, converted to TypeScript.
 * This class provides a powerful and flexible way to create and manipulate DOM elements,
 * with built-in support for JSX, functional components, and HTML sanitization.
 * The implementation is a faithful conversion of the original JavaScript source.
 *
 * @author JheDev <jhedevx.id@gmail.com>
 * @version 10.0.4-beta5
 */

import {
    DEFAULT_TAG_WHITELIST,
    DEFAULT_CONTENT_TAG_WHITELIST,
    DEFAULT_ATTRIBUTE_WHITELIST,
    DEFAULT_CSS_WHITELIST,
    DEFAULT_SCHEMA_WHITELIST,
    DEFAULT_URI_ATTRIBUTES,
    DEFAULT_SVG_ELEMENTS,
    NAMESPACES
} from './defaults';

import {
    Whitelist,
    DomNode,
    Selector,
    RootElement,
    ElementInput,
    IElementConfig,
    IElementMethods,
    IBuildCallback,
    IChildrenCallback,
    DomObject,
    JsxElement,
    JsxElementInput,
    Children,
    FunctionalComponent,
    ElementProps,
    RefObject,
    Tag
} from './types';


export class Element {
    // Blok: Konfigurasi Sanitasi
    // Properti privat untuk konfigurasi dan fungsionalitas sanitasi.
    // Semua ini diambil dari file defaults.ts untuk menjaga kebersihan kode.
    private tagWhitelist: Whitelist = { ...DEFAULT_TAG_WHITELIST };
    private contentTagWhiteList: Whitelist = { ...DEFAULT_CONTENT_TAG_WHITELIST };
    private attributeWhitelist: Whitelist = { ...DEFAULT_ATTRIBUTE_WHITELIST };
    private cssWhitelist: Whitelist = { ...DEFAULT_CSS_WHITELIST };
    private schemaWhiteList: string[] = [...DEFAULT_SCHEMA_WHITELIST];
    private uriAttributes: Whitelist = { ...DEFAULT_URI_ATTRIBUTES };

    // Blok: Properti Internal
    // Properti ini digunakan untuk operasional internal kelas.
    private parser: DOMParser = new DOMParser();
    private enableSanitization: boolean = true;
    private targetRoot: RootElement = null;
    private namespaces: Record<string, string> = NAMESPACES;
    private svgElements: string[] = [...DEFAULT_SVG_ELEMENTS];

    private readonly credit = {
        version: '10.0.4-beta5',
        author: 'JheDev <jhedevx.id@gmail.com>'
    };

    /**
     * Creates an instance of the Element class.
     * @param {ElementInput} [config={}] - The initial configuration, which can be a selector string,
     * a DOM node, or a configuration object `{ root, sanitize }`.
     */
    constructor(config: ElementInput = {}) {
        this.processConfig(config);
    }

    /**
     * Processes the configuration to set the target root and sanitation status.
     * This method is flexible, accepting a config object, a selector string, or a DOM node.
     * @private
     * @param {ElementInput} opts - A selector string, DOM Node, or configuration object.
     * @param {boolean} [sanitize] - The sanitation option, used only if `opts` is a string or DOM Node.
     */
    private processConfig(opts: ElementInput, sanitize?: boolean): void {
        // Watermark untuk identitas di console.
        console.log(`%c %c %c Element | v${this.credit.version} | Author: ${this.credit.author} %c %c %c`, 'background: #9854d8', 'background: #6c2ca7', 'color: #fff; background: #450f78;', 'background: #6c2ca7', 'background: #9854d8', 'background: #ffffff');

        let rootInput: Selector | DomNode | undefined | null = null;
        let sanitizeSetting: boolean = this.enableSanitization;

        if (typeof opts === 'object' && opts !== null && !(opts instanceof Node)) {
            // Kasus: opts adalah objek konfigurasi (e.g., { root: ..., sanitize: ... })
            const config = opts as IElementConfig;
            if ('sanitize' in config && typeof config.sanitize === 'boolean') {
                sanitizeSetting = config.sanitize;
            }
            if ('root' in config && config.root !== undefined) {
                rootInput = config.root;
            }
        } else {
            // Kasus: opts adalah string (selector) atau DOM Node
            rootInput = opts as Selector | DomNode;
            if (typeof sanitize === 'boolean') {
                sanitizeSetting = sanitize;
            }
        }

        this.enableSanitization = sanitizeSetting;

        if (rootInput) {
            this.targetRoot = this.$(rootInput);
            if (!this.targetRoot) {
                console.warn("Specified root element was not found or is invalid:", rootInput);
            }
        }
    }

    /**
     * A simple query selector utility. Returns the first element, or a list of elements, or null.
     * @private
     * @param {Selector | DomNode} input - A CSS selector string or a direct DOM node.
     * @returns {RootElement} The found element(s) or the input node itself.
     */
    private $(input: Selector | DomNode): RootElement {
        if (typeof input === 'string') {
            try {
                const elements = document.querySelectorAll(input);
                return elements.length > 1 ? elements : (elements[0] as DomNode) || null;
            } catch (error) {
                console.error("Error in CSS selector:", error);
                return null;
            }
        }
        if (input instanceof Node) {
            return input as DomNode;
        }
        console.warn("Input type not supported by selector function $:", input);
        return null;
    }

    /**
     * Initializes the Element instance with a root and sanitation options, returning manipulation methods.
     * @param {ElementInput} opts - A selector string, DOM Node, or configuration object.
     * @param {boolean} [sanitize] - The sanitation option, used only if `opts` is a string or DOM Node.
     * @returns {IElementMethods} An object with methods to manipulate the root element.
     */
    public init(opts: ElementInput, sanitize?: boolean): IElementMethods {
        this.processConfig(opts, sanitize);

        const currentRoot = this.targetRoot;

        if (!currentRoot || !(currentRoot instanceof Element)) {
             console.error("Target root is not a valid element. Please specify a valid 'root' in constructor or init.");
             const dummyFunc = () => { console.error("Cannot perform operation, target root is not valid."); };
             return { build: dummyFunc, append: dummyFunc, prepend: dummyFunc, appendTo: dummyFunc, prependTo: dummyFunc, buildFromObject: dummyFunc };
        }

        const self = this;

        return {
            build: (elem) => {
                while (currentRoot.firstChild) {
                    currentRoot.removeChild(currentRoot.firstChild);
                }

                const buildIterate = (root: Element, el: JsxElementInput[], pos: 'append' | 'prepend') => {
                    el.forEach(child => {
                        self.render(root, child, pos);
                    });
                };

                if (typeof elem === 'function') {
                    elem({
                        append: (el) => self.render(currentRoot, el, 'append'),
                        prepend: (el) => self.render(currentRoot, el, 'prepend'),
                    } as IBuildCallback);
                } else if (Array.isArray(elem)) {
                    buildIterate(currentRoot, elem, 'append');
                } else {
                    self.render(currentRoot, elem, 'append');
                }
            },
            append: (elem) => self.render(currentRoot, elem, 'append'),
            prepend: (elem) => self.render(currentRoot, elem, 'prepend'),
            appendTo: (elem) => self.render(currentRoot, elem, 'append'),
            prependTo: (elem) => self.render(currentRoot, elem, 'prepend'),
            buildFromObject: (domObject, mergeObject, targetNodeId, mergePosition = 'append', sanitizeConfig) => {
                if (!domObject || typeof domObject.nodeName !== 'string') {
                    throw new Error("Invalid main DOM object. Must have a 'nodeName' property. " + JSON.stringify(domObject));
                }

                let finalSanitizeSetting = self.enableSanitization;
                if (typeof sanitizeConfig === 'boolean') {
                    finalSanitizeSetting = sanitizeConfig;
                } else if (typeof sanitizeConfig === 'object' && sanitizeConfig !== null && 'sanitize' in sanitizeConfig) {
                    finalSanitizeSetting = !!sanitizeConfig.sanitize;
                }

                let finalDomObject = domObject;

                if (mergeObject && typeof targetNodeId === 'string' && targetNodeId.trim() !== '') {
                    finalDomObject = JSON.parse(JSON.stringify(domObject)); // Deep copy
                    const targetNode = self.findNodeById(finalDomObject, targetNodeId);

                    if (targetNode) {
                        const mergedElement = self.buildElementFromObject(mergeObject, finalSanitizeSetting);
                        if (mergedElement) {
                            const mergedDomObject = self.buildObjectFromHTMLNode(mergedElement as Node);
                            if (mergedDomObject) {
                                if (!targetNode.children) {
                                    targetNode.children = [];
                                }
                                if (mergePosition === 'prepend') {
                                    targetNode.children.unshift(mergedDomObject);
                                } else if (mergePosition === 'replace') {
                                    targetNode.children = [mergedDomObject];
                                } else {
                                    targetNode.children.push(mergedDomObject);
                                }
                            }
                        }
                    } else {
                        console.warn(`Node with ID '${targetNodeId}' not found in the main DOM object. Merge cancelled.`);
                    }
                }

                const mainElement = self.buildElementFromObject(finalDomObject, finalSanitizeSetting);
                if (mainElement) {
                    self.render(currentRoot, mainElement, 'append', finalSanitizeSetting);
                }
            }
        };
    }

    /**
     * Renders an element into a parent node at a specified position.
     * @param {DomNode | Selector} parent - The parent element or selector.
     * @param {JsxElementInput} elem - The element to render.
     * @param {'append' | 'prepend'} [position='append'] - The position to insert the element.
     * @param {boolean} [sanitizeHtmlString] - Overrides the default sanitization setting for this operation.
     */
    public render(parent: DomNode | Selector, elem: JsxElementInput, position: 'append' | 'prepend' = 'append', sanitizeHtmlString?: boolean): void {
        let actualParent: DomNode | null = null;
        if (typeof parent === 'string') {
            const result = this.$(parent);
            actualParent = (result instanceof NodeList ? result[0] : result) as DomNode | null;
        } else {
            actualParent = parent;
        }

        if (!actualParent || !(actualParent instanceof Node)) {
            throw new Error("Parent is not a valid element for rendering: " + parent);
        }

        let actualElem: Node | null = null;
        if (elem instanceof Node) {
            actualElem = elem;
        } else if (typeof elem === 'string' || typeof elem === 'number') {
            const finalSanitize = typeof sanitizeHtmlString === 'boolean' ? sanitizeHtmlString : this.enableSanitization;
            actualElem = this.text(String(elem), false, finalSanitize);
        } else if (elem === null || elem === undefined || typeof elem === 'boolean') {
            return; // Do not render null, undefined, or booleans
        } else if (typeof elem === 'function') {
            // Handle functional components passed directly to render
            const result = this.create(elem, {});
            if (result) actualElem = result;
        }
        else {
            throw new Error("Element to be rendered is invalid after processing: " + elem);
        }

        if(!actualElem) return;

        if (position === 'prepend' && actualParent.firstChild) {
            actualParent.insertBefore(actualElem, actualParent.firstChild);
        } else {
            actualParent.appendChild(actualElem);
        }
    }

    /**
     * Finds a node by its ID within a DomObject structure.
     * @private
     * @param {DomObject} domObject - The object to search within.
     * @param {string} id - The ID to find.
     * @returns {DomObject | null} The found node object or null.
     */
    private findNodeById(domObject: DomObject, id: string): DomObject | null {
        if (!domObject || !id) return null;
        if (domObject.attrs && domObject.attrs.id === id) {
            return domObject;
        }
        if (domObject.children && Array.isArray(domObject.children)) {
            for (const child of domObject.children) {
                const foundNode = this.findNodeById(child, id);
                if (foundNode) return foundNode;
            }
        }
        return null;
    }

    /**
     * Builds a DOM element from a DomObject representation.
     * @private
     * @param {DomObject} obj - The object to build from.
     * @param {boolean} currentSanitizeSetting - The sanitization setting for this build.
     * @returns {JsxElement | null} The created DOM element.
     */
    private buildElementFromObject(obj: DomObject, currentSanitizeSetting: boolean): JsxElement | null {
        if (!obj || typeof obj.nodeName !== 'string') {
            console.warn("Invalid DOM element object:", obj);
            return null;
        }

        if (obj.nodeName === '#text') {
            return document.createTextNode(String(obj.content || ''));
        }

        const tag = obj.nodeName.toLowerCase();
        const isSVG = this.svgElements.includes(tag);
        const el = isSVG ? document.createElementNS(this.namespaces.svg, tag) : document.createElement(tag);

        if (obj.attrs) {
            this.setAttributes(el, obj.attrs, isSVG, currentSanitizeSetting);
        }

        if (obj.content !== undefined && obj.content !== null) {
            el.appendChild(this.text(String(obj.content), false, currentSanitizeSetting));
        }

        if (obj.events) {
            for (const eventName in obj.events) {
                if (Object.prototype.hasOwnProperty.call(obj.events, eventName) && typeof obj.events[eventName] === 'function') {
                    el.addEventListener(eventName, obj.events[eventName]);
                }
            }
        }

        if (obj.children && Array.isArray(obj.children)) {
            obj.children.forEach(childObj => {
                const childElement = this.buildElementFromObject(childObj, currentSanitizeSetting);
                if (childElement) {
                    el.appendChild(childElement);
                }
            });
        }
        return el;
    }

    /**
     * Creates multiple instances of an element.
     * @param {Tag} tag - The tag name or functional component.
     * @param {ElementProps | null} props - The properties for the element.
     * @param {Children} children - The children of the element.
     * @param {number} [count=1] - The number of elements to create.
     * @returns {JsxElement[]} An array of created elements.
     */
    public children(tag: Tag, props: ElementProps | null, children: Children, count: number = 1): JsxElement[] {
        const elements: JsxElement[] = [];
        for (let i = 0; i < count; i++) {
            // Note: The 4th parameter `sanitizeConfig` is not passed here, matching original JS `children` logic.
            const newElement = this.create(tag, props, children);
            if(newElement) elements.push(newElement);
        }
        return elements;
    }

    /**
     * Creates a new DOM element or renders a functional component. This is the core JSX factory function.
     * @param {Tag<P>} tag - The HTML/SVG tag name or a functional component.
     * @param {P & ElementProps | null} [props] - Properties and attributes for the element or component.
     * @param {Children} [children] - The children of the element.
     * @param {boolean | { sanitize?: boolean }} [sanitizeConfig] - Explicit sanitization setting for this element and its children.
     * @returns {JsxElement | null} The created DOM element or the result of the rendered component.
     */
    public create<P extends {}>(
        tag: Tag<P>,
        props: (P & ElementProps) | null,
        children?: Children,
        sanitizeConfig?: boolean | { sanitize?: boolean }
    ): JsxElement | null {

        // BLOK: PERBAIKAN UTAMA - LOGIKA SANITASI
        // Logika ini sekarang secara akurat mencerminkan kode asli dengan memeriksa parameter ke-4.
        let finalSanitizeSetting = this.enableSanitization; // 1. Default kelas
        if (props && typeof props.sanitizeChildren === 'boolean') {
            finalSanitizeSetting = props.sanitizeChildren; // 2. Prioritas kedua: dari props
        }
        if (typeof sanitizeConfig === 'boolean') {
            finalSanitizeSetting = sanitizeConfig; // 3. Prioritas utama: dari parameter ke-4
        } else if (typeof sanitizeConfig === 'object' && sanitizeConfig !== null && 'sanitize' in sanitizeConfig) {
            finalSanitizeSetting = !!sanitizeConfig.sanitize;
        }
        // AKHIR BLOK PERBAIKAN

        const finalProps = props || ({} as P & ElementProps);

        // --- Blok: Penanganan Komponen Fungsional ---
        if (typeof tag === "function") {
            const componentProps = { ...finalProps, children: children };
            const componentResult = (tag as FunctionalComponent<P>)(componentProps);

            if (typeof componentResult === 'string') {
                const objectFromHtml = this.buildObjectFromHTML(componentResult);
                return objectFromHtml ? this.buildElementFromObject(objectFromHtml, finalSanitizeSetting) : null;
            } else if (componentResult instanceof Node) {
                return componentResult as JsxElement;
            } else if (componentResult === null || componentResult === undefined || typeof componentResult === 'boolean') {
                return document.createDocumentFragment();
            } else {
                 console.warn("Functional component returned an unsupported type:", componentResult);
                 return null;
            }
        }
        // --- Akhir Blok ---

        const isSVG = this.svgElements.includes(tag);
        const el = isSVG ? document.createElementNS(this.namespaces.svg, tag) : document.createElement(tag);

        const { children: propsChildren, ...attrs } = finalProps;
        if (Object.keys(attrs).length > 0) {
            this.setAttributes(el, attrs, isSVG, finalSanitizeSetting);
        }

        // Gabungkan children dari parameter ke-3 dan dari props.children (seperti di kode asli)
        const allChildren = children !== undefined ? [children] : (propsChildren !== undefined ? [propsChildren] : []);
        const flattenedChildren = allChildren.flat(Infinity);

        flattenedChildren.forEach(child => {
            if (child === null || child === undefined || typeof child === 'boolean') return;

            if (typeof child === 'function') {
                // Penanganan callback `childrens` untuk perulangan
                child({
                    childrens: (elemTag: Tag, elemProps: ElementProps, elemChild: Children, loop: number = 1) => {
                        for (let i = 0; i < loop; i++) {
                            // Teruskan `finalSanitizeSetting` ke anak-anak yang dibuat secara rekursif
                            const childSanitize = typeof elemProps?.sanitizeChildren === 'boolean' ? elemProps.sanitizeChildren : finalSanitizeSetting;
                            const createdChild = this.create(elemTag, elemProps, elemChild, childSanitize);
                            if (createdChild) this.render(el, createdChild, 'append', childSanitize);
                        }
                    }
                } as IChildrenCallback);
            } else {
                this.render(el, child as JsxElementInput, 'append', finalSanitizeSetting);
            }
        });

        return el;
    }

    /**
     * Creates a DOM element from a raw HTML string. A helper for specific use cases.
     * @param {string} htmlString - The HTML string to parse.
     * @param {boolean | {sanitize?: boolean}} [sanitize] - Overrides the default sanitization setting.
     * @returns {JsxElement | null} The created DOM element.
     */
    public jsx(htmlString: string, sanitize?: boolean | { sanitize?: boolean }): JsxElement | null {
        let sanitizeSetting = this.enableSanitization;
        if (typeof sanitize === 'boolean') {
            sanitizeSetting = sanitize;
        } else if (typeof sanitize === 'object' && sanitize !== null && 'sanitize' in sanitize) {
            sanitizeSetting = !!sanitize.sanitize;
        }

        const objectFromHtml = this.buildObjectFromHTML(htmlString);
        return objectFromHtml ? this.buildElementFromObject(objectFromHtml, sanitizeSetting) : null;
    }

    /**
     * Creates a Text node, with optional parsing and sanitization.
     * @param {string} str - The string content.
     * @param {boolean} [parse=false] - If true, attempts to parse the string as HTML.
     * @param {boolean} [sanitize=this.enableSanitization] - If true, sanitizes the string.
     * @returns {Text | DocumentFragment} The created Text node or DocumentFragment.
     */
    public text(str: string, parse: boolean = false, sanitize: boolean = this.enableSanitization): Text | DocumentFragment {
        let processedStr = String(str);

        if (sanitize && processedStr.trim() !== "") {
            processedStr = this.SanitizeHtmlInternal(processedStr);
        }

        if (parse && processedStr.trim() === '') {
            return document.createDocumentFragment();
        }

        if (parse && processedStr.trim().startsWith('<') && processedStr.trim().endsWith('>')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = processedStr.trim();
            if (tempDiv.childNodes.length > 1) {
                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                return fragment;
            }
            return tempDiv.firstChild as (Text | DocumentFragment);
        }
        return document.createTextNode(processedStr);
    }

    /**
     * Sets attributes and properties on a DOM element, handling various special cases.
     * @param {HTMLElement | SVGElement} el - The DOM element.
     * @param {Record<string, any>} props - The properties object.
     * @param {boolean} [isSVG=false] - True if the element is an SVG element.
     * @param {boolean} sanitizeHtmlContent - The sanitization setting for this operation.
     */
    public setAttributes(el: HTMLElement | SVGElement, props: Record<string, any>, isSVG: boolean = false, sanitizeHtmlContent: boolean): void {
        const finalSanitizeSetting = typeof sanitizeHtmlContent === 'boolean' ? sanitizeHtmlContent : this.enableSanitization;

        for (const propName in props) {
            if (!Object.hasOwn(props, propName)) continue;

            let propValue = props[propName];

            // Abaikan props internal dari transpiler JSX
            if (propName === "__source" || propName === "__self" || propName === "tsxTag" || propName === "key" || propName === "sanitizeChildren") {
                continue;
            }

            // Blok: Penanganan Event Listener
            if (propName.startsWith("on") && typeof propValue === "function") {
                const finalName = propName.replace(/Capture$/, "");
                const useCapture = propName !== finalName;
                let eventName = finalName.toLowerCase().substring(2);
                if (eventName === "doubleclick") eventName = "dblclick";
                el.addEventListener(eventName, propValue, useCapture);
                continue;
            }

            // Blok: Penanganan Atribut & Properti Khusus
            switch (propName) {
                case 'class':
                case 'className':
                    const classValue = Array.isArray(propValue) ? propValue.flat(5).filter(Boolean).join(' ') : String(propValue || '');
                    if (isSVG) el.setAttribute('class', classValue);
                    else (el as HTMLElement).className = classValue;
                    break;
                case 'style':
                case 'css':
                    if (typeof propValue === 'string') {
                        el.setAttribute('style', propValue);
                    } else if (typeof propValue === 'object' && propValue !== null) {
                        Object.keys(propValue).forEach(styleProp => {
                            const cssPropName = styleProp.replace(/([A-Z])/g, '-$&').toLowerCase();
                            if (!finalSanitizeSetting || this.cssWhitelist[cssPropName]) {
                                (el.style as any)[styleProp] = propValue[styleProp];
                            }
                        });
                    }
                    break;
                case 'dataset':
                    if (typeof propValue === 'object' && propValue !== null) {
                        Object.assign((el as HTMLElement).dataset, propValue);
                    }
                    break;
                case 'htmlFor':
                case 'for':
                    if('htmlFor' in el) (el as HTMLLabelElement).htmlFor = propValue;
                    break;
                case 'dangerouslySetInnerHTML':
                    if (propValue && typeof propValue === 'object' && '__html' in propValue) {
                        el.innerHTML = finalSanitizeSetting ? this.SanitizeHtmlInternal(String(propValue.__html)) : String(propValue.__html);
                    }
                    break;
                case 'innerHTML':
                case 'html':
                    el.innerHTML = finalSanitizeSetting ? this.SanitizeHtmlInternal(String(propValue)) : String(propValue);
                    break;
                case 'innerText':
                case 'textContent':
                case 'text':
                    el.textContent = String(propValue);
                    break;
                case 'ref':
                    if (propValue && typeof propValue === 'object' && 'current' in propValue) {
                        (propValue as RefObject<typeof el>).current = el;
                    }
                    break;
                case 'assign':
                    if (typeof propValue === 'function') propValue(el);
                    break;
                case 'xmlns':
                     el.setAttributeNS(this.namespaces.xmlns, 'xmlns', String(propValue));
                     break;
                default:
                    // Blok: Penanganan Atribut Umum dan Boolean
                    if (propValue === true) {
                        el.setAttribute(propName, ''); // Atribut boolean
                    } else if (propValue !== false && propValue !== null && propValue !== undefined) {
                        if (isSVG || !(propName in el)) {
                             el.setAttribute(propName, String(propValue));
                        } else {
                            try {
                                (el as any)[propName] = propValue;
                            } catch (e) {
                                el.setAttribute(propName, String(propValue));
                            }
                        }
                    }
                    break;
            }
        }
    }

    /**
     * Builds a DomObject from an HTML string.
     * @param {string} htmlString - The HTML string to parse.
     * @returns {DomObject | null} The corresponding DomObject or null on failure.
     */
    public buildObjectFromHTML(htmlString: string): DomObject | null {
        if (typeof htmlString !== 'string' || htmlString.trim() === '') {
            console.warn("Input is not a valid HTML string.");
            return null;
        }

        const doc = this.parser.parseFromString(htmlString, 'text/html');
        const rootElement = doc.body.firstElementChild;

        if (!rootElement) {
            const textContent = doc.body.textContent?.trim();
            if (textContent) {
                return { nodeName: '#text', content: textContent };
            }
            console.warn("No valid element found in the HTML string.");
            return null;
        }

        return this.buildObjectFromHTMLNode(rootElement);
    }

    /**
     * Recursively builds a DomObject from a DOM Node.
     * @param {Node} node - The DOM Node to convert.
     * @returns {DomObject | null} The corresponding DomObject.
     */
    public buildObjectFromHTMLNode(node: Node): DomObject | null {
        if (!node) return null;
        if (node.nodeType === Node.COMMENT_NODE || (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim())) {
            return null;
        }
        if (node.nodeType === Node.TEXT_NODE) {
            return { nodeName: '#text', content: node.textContent?.trim() };
        }
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }

        const el = node as Element;
        const obj: DomObject = {
            nodeName: el.tagName.toLowerCase(),
            attrs: {},
            children: []
        };

        if (el.attributes.length > 0) {
            Array.from(el.attributes).forEach(attr => {
                (obj.attrs as Record<string, any>)[attr.name] = attr.value;
            });
        }
        
        const styleAttr = (obj.attrs as Record<string,any>)['style'];
        if (styleAttr && typeof styleAttr === 'string') {
            const styleObj: Record<string, string> = {};
            styleAttr.split(';').forEach(pair => {
                const parts = pair.split(':').map(p => p.trim());
                if (parts.length === 2 && parts[0] && parts[1]) {
                    const propName = parts[0].replace(/-([a-z])/g, g => g[1].toUpperCase());
                    styleObj[propName] = parts[1];
                }
            });
            if (Object.keys(styleObj).length > 0) (obj.attrs as Record<string,any>)['style'] = styleObj;
            else delete (obj.attrs as Record<string,any>)['style'];
        }

        if (el.childNodes.length > 0) {
            el.childNodes.forEach(childNode => {
                const convertedChild = this.buildObjectFromHTMLNode(childNode);
                if (convertedChild) obj.children?.push(convertedChild);
            });
        }
        
        // Sederhanakan objek jika hanya berisi satu node teks atau beberapa node teks.
        if (obj.children?.length === 1 && obj.children[0].nodeName === '#text') {
            obj.content = obj.children[0].content;
            delete obj.children;
        } else if (obj.children && obj.children.length > 0 && obj.children.every(c => c.nodeName === '#text')) {
             obj.content = obj.children.map(c => c.content).join('');
             delete obj.children;
        } else if (obj.children?.length === 0) {
            delete obj.children;
        }

        return obj;
    }

    /**
     * Internal HTML sanitizer. Recursively traverses nodes and cleans them based on whitelists.
     * @private
     * @param {string} input - The HTML string to sanitize.
     * @param {string} [extraSelector] - An extra CSS selector for tags to allow.
     * @returns {string} The sanitized HTML string.
     */
    private SanitizeHtmlInternal(input: string, extraSelector?: string): string {
        input = input.trim();
        if (input === "" || input === "<br>") return "";

        const wrappedInput = input.indexOf("<body") === -1 ? `<body>${input}</body>` : input;
        const doc = this.parser.parseFromString(wrappedInput, "text/html");

        if (doc.body.tagName !== 'BODY') doc.body.remove();
        
        const makeSanitizedCopy = (node: Node): Node => {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.cloneNode(true);
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as Element;
                if (this.tagWhitelist[el.tagName] || this.contentTagWhiteList[el.tagName] || (extraSelector && el.matches(extraSelector))) {
                    const newNode = this.contentTagWhiteList[el.tagName] ? doc.createElement('DIV') : doc.createElement(el.tagName);

                    Array.from(el.attributes).forEach(attr => {
                        if (this.attributeWhitelist[attr.name]) {
                            if (attr.name === "style") {
                                const tempEl = document.createElement('div');
                                tempEl.style.cssText = attr.value;
                                let sanitizedStyle = '';
                                for (let i = 0; i < tempEl.style.length; i++) {
                                    const styleName = tempEl.style[i];
                                    if (this.cssWhitelist[styleName]) {
                                        sanitizedStyle += `${styleName}: ${tempEl.style.getPropertyValue(styleName)}; `;
                                    }
                                }
                                if (sanitizedStyle.trim()) newNode.setAttribute('style', sanitizedStyle.trim());
                            } else {
                                if (this.uriAttributes[attr.name] && attr.value.includes(":") && !this.startsWithAny(attr.value, this.schemaWhiteList)) {
                                    return;
                                }
                                newNode.setAttribute(attr.name, attr.value);
                            }
                        }
                    });

                    el.childNodes.forEach(child => newNode.appendChild(makeSanitizedCopy(child)));

                    if ((newNode.tagName === "SPAN" || newNode.tagName === "B" || newNode.tagName === "I" || newNode.tagName === "U") && newNode.innerHTML.trim() === "") {
                        return doc.createDocumentFragment();
                    }
                    return newNode;
                }
            }
            return doc.createDocumentFragment();
        };

        const resultElement = makeSanitizedCopy(doc.body);
        return (resultElement as Element).innerHTML.replace(/div><div/g, "div>\n<div");
    }

    /**
     * Checks if a string starts with any of the provided substrings.
     * @private
     */
    private startsWithAny(str: string, substrings: string[]): boolean {
        for (const sub of substrings) {
            if (str.startsWith(sub)) return true;
        }
        return false;
    }

    // Getters untuk mengakses whitelist dari luar (bersifat read-only).
    get AllowedTags(): Whitelist { return this.tagWhitelist; }
    get AllowedAttributes(): Whitelist { return this.attributeWhitelist; }
    get AllowedCssStyles(): Whitelist { return this.cssWhitelist; }
    get AllowedSchemas(): string[] { return this.schemaWhiteList; }
}