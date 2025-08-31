class Element {
    // Properti privat untuk konfigurasi dan fungsionalitas sanitasi
    #tagWhitelist = {
        A: true, ABBR: true, B: true, BLOCKQUOTE: true, BODY: true, BR: true, CENTER: true,
        CODE: true, DD: true, DIV: true, DL: true, DT: true, EM: true, FONT: true,
        H1: true, H2: true, H3: true, H4: true, H5: true, H6: true, HR: true, I: true,
        IMG: true, LABEL: true, LI: true, OL: true, P: true, PRE: true, SMALL: true,
        SOURCE: true, SPAN: true, STRONG: true, SUB: true, SUP: true, TABLE: true,
        TBODY: true, TR: true, TD: true, TH: true, THEAD: true, UL: true, U: true,
        VIDEO: true
    };

    #contentTagWhiteList = { FORM: true, 'GOOGLE-SHEETS-HTML-ORIGIN': true };
    #attributeWhitelist = {
        align: true, color: true, controls: true, height: true, href: true, id: true,
        src: true, style: true, target: true, title: true, type: true, width: true
    };
    #cssWhitelist = {
        'background-color': true, color: true, 'font-size': true, 'font-weight': true,
        'text-align': true, 'text-decoration': true, width: true
    };
    #schemaWhiteList = ['http:', 'https:', 'data:', 'm-files:', 'file:', 'ftp:', 'mailto:', 'pw:'];
    #uriAttributes = { href: true, action: true };
    #parser = new DOMParser();

    #enableSanitization = true;
    #targetRoot = null;

    #namespaces = {
        svg: 'http://www.w3.org/2000/svg',
        html: 'http://www.w3.org/1999/xhtml',
        xml: 'http://www.w3.org/XML/1998/namespace',
        xlink: 'http://www.w3.org/1999/xlink',
        xmlns: 'http://www.w3.org/2000/xmlns/',
        mathMl: 'http://www.w3.org/1998/Math/MathML'
    };

    #svgElements = [
        'animate', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'defs',
        'desc', 'discard', 'ellipse', 'filter', 'foreignObject', 'g', 'image', 'line',
        'linearGradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern',
        'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'stop', 'svg',
        'switch', 'symbol', 'text', 'textPath', 'tspan', 'use', 'view'
    ];

    #credit = {
        version: '10.1-beta1',
        author: 'JheDev <jhedevx.id@gmail.com>'
    };

    constructor(config = {}) {
        if (typeof config === 'object' && config !== null) {
            this.#processConfig(config);
        } else {
            this.#processConfig({});
        }
    }

    /**
     * Memproses konfigurasi untuk mengatur root target dan status sanitasi.
     * Metode ini fleksibel, dapat menerima:
     * 1. Objek konfigurasi: `{ root: string|HTMLElement|SVGElement|Document, sanitize: boolean }`
     * 2. String selector atau DOM Node: string|HTMLElement|SVGElement|Document (untuk opts),
     * dengan parameter kedua `sanitize` (boolean) yang opsional.
     *
     * @param {string|HTMLElement|SVGElement|Document|object} opts - String selector, DOM Node, atau objek konfigurasi.
     * @param {boolean} [sanitize] - Opsi sanitasi, hanya digunakan jika `opts` adalah string atau DOM Node.
     */
    #processConfig(opts, sanitize) {
        // watermark
        console.log.apply(console, window.console.log(`%c %c %c Element | v${this.#credit.version} | Author: ${this.#credit.author} %c %c %c`, 'background: #9854d8', 'background: #6c2ca7', 'color: #fff; background: #450f78;', 'background: #6c2ca7', 'background: #9854d8', 'background: #ffffff'));

        let rootInput = null;
        let sanitizeSetting = this.#enableSanitization; // Default dari properti privat

        if (typeof opts === 'object' && opts !== null && ! (opts instanceof HTMLElement || opts instanceof SVGElement || opts instanceof Document)) {
            // Kasus: opts adalah objek konfigurasi (e.g., { root: ..., sanitize: ... })
            const config = opts;
            if ('sanitize' in config) {
                sanitizeSetting = !!config.sanitize;
            }
            if ('root' in config && config.root !== undefined) {
                rootInput = config.root;
            }
        } else {
            // Kasus: opts adalah string (selector) atau DOM Node
            rootInput = opts;
            // sanitize (sanitize) hanya berlaku jika opts adalah string atau DOM
            if (typeof sanitize === 'boolean' && sanitize !== undefined) {
                sanitizeSetting = !!sanitize;
            }
        }

        // Terapkan pengaturan sanitasi
        this.#enableSanitization = sanitizeSetting;

        if (rootInput !== null && rootInput !== undefined) {
            this.#targetRoot = this.#$(rootInput);
            if (!this.#targetRoot) {
                console.warn("Root element yang ditentukan tidak ditemukan atau tidak valid:", rootInput);
            }
        }
    }

    #$(input) {
        if (typeof input === 'string') {
            try {
                const elements = document.querySelectorAll(input);
                return elements.length > 1 ? elements : elements[0] || null;
            } catch (error) {
                console.error("Kesalahan pada selector CSS:", error);
                return null;
            }
        }
        if (input instanceof HTMLElement || input instanceof SVGElement || input instanceof Document) {
            return input;
        }
        console.warn("Tipe input tidak didukung oleh fungsi selector $:", input);
        return null;
    }

    /**
     * Menginisialisasi instance Element dengan root dan opsi sanitasi.
     * Fleksibel dalam menerima parameter:
     * - `init({root: dom/string, sanitize: false/true})`
     * - `init('string', boolean)`
     * - `init(dom, boolean)`
     *
     * @param {string|HTMLElement|SVGElement|Document|object} opts - String selector, DOM Node, atau objek konfigurasi.
     * @param {boolean} [sanitize=false] - Opsi sanitasi, hanya digunakan jika `opts` adalah string atau DOM Node.
     */
    init(opts, sanitize) {
        this.#processConfig(opts, sanitize);

        const currentRoot = this.#targetRoot;

        if (!currentRoot) {
            console.error("Target root belum ditentukan atau tidak valid. Harap tentukan 'root' di constructor atau init.");
            const dummyFunc = () => { console.error("Tidak dapat melakukan operasi, target root tidak valid."); };
            return { build: dummyFunc, append: dummyFunc, prepend: dummyFunc, appendTo: dummyFunc, prependTo: dummyFunc, buildFromObject: dummyFunc };
        }

        const self = this;

        return {
            build: (elem) => {
                // Hapus konten root sebelum membangun yang baru
                while (currentRoot.firstChild) {
                    currentRoot.removeChild(currentRoot.firstChild);
                }

                const buildIterate = (root, el, pos) => {
                    el.forEach(child => {
                        self.render(root, child, pos);
                    });
                }

                if (typeof elem === 'function') {
                    elem({
                        append: (el) => {
                            self.render(currentRoot, el, 'append');
                        },
                        prepend: (el) => {
                            self.render(currentRoot, el, 'prepend');
                        }
                    });
                    return;
                } else if (Array.isArray(elem)) {
                    // Jika inputnya adalah array, lakukan perulangan
                    buildIterate(currentRoot, elem, 'append');
                } else {
                    // Jika hanya satu elemen, langsung render
                    self.render(currentRoot, elem, 'append');
                }
            },
            append: (elem) => {
                self.render(currentRoot, elem, 'append');
            },
            prepend: (elem) => {
                self.render(currentRoot, elem, 'prepend');
            },
            appendTo: (elem) => {
                self.render(currentRoot, elem, 'append');
            },
            prependTo: (elem) => {
                self.render(currentRoot, elem, 'prepend');
            },
            buildFromObject: (domObject, mergeObject, targetNodeId, mergePosition = 'append', sanitizeConfig) => {
                if (!domObject || typeof domObject.nodeName !== 'string') {
                    throw new Error("Objek DOM utama tidak valid. Harus memiliki properti 'nodeName'. " + JSON.stringify(domObject));
                }

                let finalSanitizeSetting = self.#enableSanitization;
                if (typeof sanitizeConfig === 'boolean') {
                    finalSanitizeSetting = sanitizeConfig;
                } else if (typeof sanitizeConfig === 'object' && sanitizeConfig !== null && 'sanitize' in sanitizeConfig) {
                    finalSanitizeSetting = !!sanitizeConfig.sanitize;
                }

                let finalDomObject = domObject;

                if (mergeObject && typeof targetNodeId === 'string' && targetNodeId.trim() !== '') {
                    finalDomObject = JSON.parse(JSON.stringify(domObject));
                    const targetNode = self.#findNodeById(finalDomObject, targetNodeId);

                    if (targetNode) {
                        const mergedElement = self.#buildElementFromObject(mergeObject, finalSanitizeSetting);
                        if (mergedElement) {
                            const mergedDomObject = self.buildObjectFromHTMLNode(mergedElement);

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
                        console.warn(`Node dengan ID '${targetNodeId}' tidak ditemukan dalam objek DOM utama. Merge dibatalkan.`);
                    }
                }

                const mainElement = self.#buildElementFromObject(finalDomObject, finalSanitizeSetting);
                if (mainElement) {
                    self.render(currentRoot, mainElement, 'append', finalSanitizeSetting);
                }
            }
        };
    }

    render(parent, elem, position = 'append', sanitizeHtmlString) {
        let actualParent = parent;
        let actualElem = elem;

        const finalSanitizeHtmlString = typeof sanitizeHtmlString === 'boolean' ? sanitizeHtmlString : this.#enableSanitization;

        if (typeof parent === 'string') {
            actualParent = this.#$(parent);
        }

        if (!actualParent || (!(actualParent instanceof HTMLElement) && !(actualParent instanceof SVGElement))) {
            throw new Error("Parent tidak valid untuk render:", parent);
        }

        if (typeof elem === 'string' || typeof elem === 'number') { // Handle numbers as well
            actualElem = this.text(String(elem), false, finalSanitizeHtmlString); // Pass false for parse as it's just text
        }

        if (typeof elem === 'function') {
            actualElem = elem();
        }

        if (!actualElem || (!(actualElem instanceof HTMLElement) && !(actualElem instanceof SVGElement) && !(actualElem instanceof Text) && !(actualElem instanceof DocumentFragment))) {
            // Jika elemen adalah null (misalnya dari disconnectedCallback), akan membersihkan parent
            if (elem === null) {
                 while (actualParent.firstChild) {
                    actualParent.removeChild(actualParent.firstChild);
                }
                return;
            }
            throw new Error("Elemen yang akan dirender tidak valid setelah pemrosesan:", elem);
        }
        
        // Jika elemen baru adalah null, bersihkan parent
        if (actualElem === null) {
            while (actualParent.firstChild) {
                actualParent.removeChild(actualParent.firstChild);
            }
            return;
        }

        if (position === 'prepend' && actualParent.firstChild) {
            actualParent.insertBefore(actualElem, actualParent.firstChild);
        } else {
            actualParent.appendChild(actualElem);
        }
    }

    #findNodeById(domObject, id) {
        if (!domObject || !id) return null;

        if (domObject.attrs && domObject.attrs.id === id) {
            return domObject;
        }

        if (domObject.children && Array.isArray(domObject.children)) {
            for (let i = 0; i < domObject.children.length; i++) {
                const foundNode = this.#findNodeById(domObject.children[i], id);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
        return null;
    }

    #buildElementFromObject(obj, currentSanitizeSetting) {
        if (!obj || typeof obj.nodeName !== 'string') {
            console.warn("Objek elemen DOM tidak valid:", obj);
            return null;
        }

        const tag = obj.nodeName.toLowerCase();
        const isSVG = this.#svgElements.includes(tag);

        let el;
        if (isSVG) {
            el = document.createElementNS(this.#namespaces.svg, tag);
        } else {
            el = document.createElement(tag);
        }

        if (obj.attrs) {
            this.setAttributes(el, obj.attrs, isSVG, currentSanitizeSetting);
        }

        if (obj.content !== undefined && obj.content !== null) {
            if (isSVG && tag === 'text') {
                el.textContent = String(obj.content);
            } else if (!isSVG) {
                el.appendChild(this.text(String(obj.content), false, currentSanitizeSetting));
            } else {
                el.textContent = String(obj.content);
            }
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
                const childElement = this.#buildElementFromObject(childObj, currentSanitizeSetting);
                if (childElement) {
                    el.appendChild(childElement);
                }
            });
        }

        return el;
    }

    children(tag, props, children, count = 1) {
        const elements = [];
        for (let i = 0; i < count; i++) {
            elements.push(this.create(tag, props, children));
        }
        return elements;
    }

    /**
     * Membuat elemen DOM baru atau merender komponen fungsional.
     * @param {string|function} tag - Nama tag HTML/SVG atau fungsi komponen.
     * @param {Object} [props] - Properti dan atribut.
     * @param {Array<HTMLElement|SVGElement|string|number>|HTMLElement|SVGElement|string|number|null} [children] - Children dari elemen.
     * @param {boolean|{sanitize?: boolean}} [sanitizeConfig] - Opsi sanitasi.
     * @returns {HTMLElement|SVGElement|Text|DocumentFragment|null} Elemen DOM yang dibuat atau hasil render komponen.
     */
    create(tag, props = {}, children, sanitizeConfig) {
        let finalSanitizeSetting = this.#enableSanitization;

        if (typeof sanitizeConfig === 'boolean') {
            finalSanitizeSetting = sanitizeConfig;
        } else if (typeof sanitizeConfig === 'object' && sanitizeConfig !== null && 'sanitize' in sanitizeConfig) {
            finalSanitizeSetting = !!sanitizeConfig.sanitize;
        } else if (props && typeof props.sanitizeChildren === 'boolean') {
            finalSanitizeSetting = props.sanitizeChildren;
        }

        if (typeof tag === "function") {
            const componentProps = { ...props, children: children };
            const componentResult = tag(componentProps); // Panggil fungsi komponen

            // Deteksi jenis hasil kembalian dari komponen
            if (typeof componentResult === 'string') {
                // Kasus 1: Komponen mengembalikan HTML string murni
                // Contoh: function MyComp() { return `<div>Hello</div>`; }
                const objectFromHtml = this.buildObjectFromHTML(componentResult);
                if (!objectFromHtml) {
                    console.error("Gagal mengurai string HTML dari komponen fungsional.");
                    return null;
                }
                return this.#buildElementFromObject(objectFromHtml, finalSanitizeSetting);
            } else if (componentResult instanceof HTMLElement ||
                       componentResult instanceof SVGElement ||
                       componentResult instanceof Text ||
                       componentResult instanceof DocumentFragment) {
                // Kasus 2: Komponen mengembalikan hasil dari el.create (sudah berupa node DOM)
                // Contoh: function MyComp() { return el.create('div', {}, 'Hello'); }
                return componentResult;
            } else if (componentResult === null || componentResult === undefined || typeof componentResult === 'boolean') {
                // Komponen mengembalikan null/undefined (misalnya, untuk tidak merender apa pun)
                return document.createDocumentFragment(); // Mengembalikan fragmen kosong
            } else {
                console.warn("Komponen fungsional mengembalikan tipe yang tidak didukung:", componentResult);
                return null;
            }
        }
 
        let el;
        const isSVG = this.#svgElements.includes(tag);

        if (isSVG) {
            el = document.createElementNS(this.#namespaces.svg, tag);
        } else {
            el = document.createElement(tag);
        }

        const { children: propsChildren, ...attrs } = props;
        if (children === undefined && propsChildren !== undefined) {
            children = propsChildren;
        }

        if (attrs && typeof attrs.sanitizeChildren === 'boolean') {
            delete attrs.sanitizeChildren;
        }

        if (attrs) {
            this.setAttributes(el, attrs, isSVG, finalSanitizeSetting);
        }

        if (typeof children === 'function') {
            children({
                childrens: (elemTag, elemProps, elemChild, loop = 1) => {
                    for (let i = 0; i < loop; i += 1) {
                        const childProps = { ...elemProps };
                        let childSanitizeConfig = finalSanitizeSetting; // Ambil dari induk

                        // Jika anak secara eksplisit punya sanitizeChildren, itu yang dipakai
                        if (typeof elemProps?.sanitizeChildren === 'boolean') {
                            childSanitizeConfig = elemProps.sanitizeChildren;
                        }

                        this.render(el, this.create(elemTag, childProps, elemChild, childSanitizeConfig), 'append', finalSanitizeSetting);
                    }
                }
            });
        }
        else if (Array.isArray(children)) {
            for (let i = 0; i < children.length; i += 1) {
                // Teruskan `finalSanitizeSetting` ke `render`
                this.render(el, children[i], 'append', finalSanitizeSetting);
            }
        }
        // Pastikan `children` bisa berupa `null` atau `undefined` dan argumen ke-4 tetap diinterpretasikan
        else if (children !== undefined && children !== null && (typeof children === 'string' || typeof children === 'number')) {
            if (isSVG && tag === 'text') {
                el.textContent = String(children);
            } else {
                this.render(el, this.text(String(children), false, finalSanitizeSetting), 'append', finalSanitizeSetting);
            }
        }
        else {

            let processedChildren = Array.isArray(children) ? children : [children];
            processedChildren = processedChildren.flat(Infinity).filter(child => {
                return (Boolean(child) && !(Array.isArray(child) && !child.length)) || child === 0;
            });

            for (let i = 0; i < processedChildren.length; i += 1) {
                const child = processedChildren[i];
                // Penanganan nested component: jika child adalah fungsi, panggil dan proses hasilnya
                if (typeof child === 'function') {
                    const nestedComponentResult = child(); // Panggil nested komponen
                    // Rekursif memproses hasil nested component
                    if (typeof nestedComponentResult === 'string') {
                        const childObjFromHtml = this.buildObjectFromHTML(nestedComponentResult);
                        if (childObjFromHtml) {
                            const nestedEl = this.#buildElementFromObject(childObjFromHtml, finalSanitizeSetting);
                            if (nestedEl) {
                                this.render(el, nestedEl, 'append', finalSanitizeSetting);
                            }
                        }
                    } else if (nestedComponentResult instanceof HTMLElement || nestedComponentResult instanceof SVGElement || nestedComponentResult instanceof Text || nestedComponentResult instanceof DocumentFragment) {
                        this.render(el, nestedComponentResult, 'append', finalSanitizeSetting);
                    } else if (nestedComponentResult === null || nestedComponentResult === undefined) {
                        // Do nothing for null/undefined child components
                    } else {
                        console.warn("Nested komponen fungsional mengembalikan tipe yang tidak didukung:", nestedComponentResult);
                    }
                } else if (child instanceof HTMLElement || child instanceof SVGElement || child instanceof Text || child instanceof DocumentFragment) {
                    this.render(el, child, 'append', finalSanitizeSetting);
                } else if (typeof child === 'string' || typeof child === 'number') {
                    if (isSVG && tag === 'text') {
                        if (!el.textContent) {
                            el.textContent = String(child);
                        }
                    } else {
                        this.render(el, this.text(String(child), false, finalSanitizeSetting), 'append', finalSanitizeSetting);
                    }
                }
            }

        }

        return el;
    }

    jsx(htmlStringOrComponentResult, sanitize) {
        let sanitizeSetting = this.#enableSanitization;

        if (typeof sanitize === 'boolean') {
            sanitizeSetting = sanitize;
        } else if (typeof sanitize === 'object' && sanitize !== null && 'sanitize' in sanitize) {
            sanitizeSetting = !!sanitize.sanitize;
        }

        let finalHtmlString = htmlStringOrComponentResult;

        if (typeof htmlStringOrComponentResult === 'function') {
            console.warn("`jsx` yang didefinisikan untuk string HTML tidak cocok untuk menerima fungsi komponen secara langsung seperti `" + htmlStringOrComponentResult + "`.");
            console.warn("Silakan panggil komponen fungsional Anda terlebih dahulu untuk mendapatkan string HTML-nya.");
            return null;
        }

        // Lanjutkan dengan parsing string HTML
        const objectFromHtml = this.buildObjectFromHTML(finalHtmlString);

        if (!objectFromHtml) {
            console.error("Gagal mengurai string HTML menjadi objek DOM.");
            return null;
        }

        return this.#buildElementFromObject(objectFromHtml, sanitizeSetting);
    }

    text(str, parse = false, sanitize = false) {
        let processedStr = String(str);

        if (sanitize && processedStr.trim() !== "") {
            processedStr = this.#SanitizeHtmlInternal(processedStr);
        }

        if (parse && processedStr.trim() === '') {
            return document.createDocumentFragment();
        }

        if (parse && typeof processedStr === 'string' && processedStr.trim().startsWith('<') && processedStr.trim().endsWith('>')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = processedStr.trim();
            if (tempDiv.childNodes.length > 1) {
                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                return fragment;
            }
            return tempDiv.firstChild;
        }
        return document.createTextNode(processedStr);
    }

    /**
     * Mengatur atribut dan properti pada elemen DOM.
     * @param {HTMLElement|SVGElement} el - Elemen DOM yang akan diatur atributnya.
     * @param {Object} props - Objek yang berisi pasangan kunci-nilai atribut/properti.
     * @param {boolean} [isSVG=false] - True jika elemen adalah SVG.
     * @param {boolean} sanitizeHtmlContent - Nilai boolean yang menunjukkan apakah konten HTML harus disanitasi.
     * Nilai ini sudah diprioritaskan dari `create` atau `buildFromObject`.
     */
    setAttributes(el, props, isSVG = false, sanitizeHtmlContent) {
        const finalSanitizeHtmlContent = typeof sanitizeHtmlContent === 'boolean' ? sanitizeHtmlContent : this.#enableSanitization;

        const setAttributeMethods = {
            'class': (value) => {
                let classNameStr = "";
                if (Array.isArray(value)) {
                    value = value.flat(5);
                    for (let i = 0; i < value.length; i++) {
                        if (value[i]) {
                            classNameStr += (classNameStr ? " " : "") + String(value[i]).trim();
                        }
                    }
                } else {
                    classNameStr = String(value);
                }

                if (isSVG) {
                    el.setAttribute('class', classNameStr);
                } else {
                    el.className = classNameStr;
                }
            },
            'className': (value) => setAttributeMethods['class'](value),
            'style': (value) => {
                if (typeof value === 'string') {
                    el.style.cssText = value;
                } else if (typeof value === 'object' && value !== null) {
                    // Hanya tambahkan gaya yang diizinkan jika sanitasi aktif
                    if (finalSanitizeHtmlContent) {
                        for (const styleProp in value) {
                            if (Object.prototype.hasOwnProperty.call(value, styleProp)) {
                                const cssPropName = styleProp.replace(/([A-Z])/g, '-$&').toLowerCase();
                                if (this.#cssWhitelist[cssPropName]) {
                                    el.style.setProperty(cssPropName, value[styleProp]);
                                }
                            }
                        }
                    } else {
                        Object.assign(el.style, value);
                    }
                }
            },
            'css': (value) => setAttributeMethods['style'](value),
            'dataset': (value) => {
                if (typeof value === 'object' && value !== null) {
                    Object.assign(el.dataset, value);
                }
            },
            'htmlFor': (value) => el.htmlFor = value,
            'for': (value) => el.htmlFor = value,
            // React-like :)
            'dangerouslySetInnerHTML': (value) => {
                if (value && typeof value === 'object' && '__html' in value) {
                    el.innerHTML = finalSanitizeHtmlContent ? this.#SanitizeHtmlInternal(String(value.__html)) : String(value.__html);
                }
            },
            'innerHTML': (value) => {
                el.innerHTML = finalSanitizeHtmlContent ? this.#SanitizeHtmlInternal(String(value)) : String(value);
            },
            'html': (value) => setAttributeMethods['innerHTML'](value),
            'innerText': (value) => el.innerText = String(value),
            'textContent': (value) => el.textContent = String(value),
            'text': (value) => setAttributeMethods['textContent'](value),
            'ref': (value) => {
                if (value && typeof value === 'object' && 'current' in value) {
                    value.current = el;
                }
            },
            'assign': (value) => {
                if (typeof value === 'function') {
                    value(el);
                }
            },
            'xmlns': (value) => {
                el.setAttributeNS(this.#namespaces.xmlns, 'xmlns', String(value));
            }
        };

        for (const propName in props) {
            if (!Object.hasOwn(props, propName)) {
                continue;
            }

            let propValue = props[propName];

            if (propName === "__source" || propName === "__self" || propName === "tsxTag") {
                continue;
            }

            if (propName.startsWith("on") && typeof propValue === "function") {
                const finalName = propName.replace(/Capture$/, "");
                const useCapture = propName !== finalName;
                let eventName = finalName.toLowerCase().substring(2);

                if (eventName === "doubleclick") {
                    eventName = "dblclick";
                }

                el.addEventListener(eventName, propValue, useCapture);
            } else if (setAttributeMethods[propName]) {
                setAttributeMethods[propName](propValue);
            } else {
                // Penanganan atribut Boolean (misal: <input checked>)
                if (propValue === true) {
                    propValue = propName;
                }
                if (propValue === undefined || propValue === null || propValue === false) {
                    // Jangan set atribut jika null, undefined, atau false (kecuali itu atribut boolean)
                    continue;
                }

                if (isSVG) {
                    // Untuk SVG, gunakan setAttributeNS dengan null namespaceURI untuk atribut standar
                    el.setAttributeNS(null, propName, String(propValue));
                } else {
                    // Untuk HTML, coba set sebagai properti DOM, fallback ke setAttribute
                    if (propName in el) {
                        el[propName] = propValue;
                    } else {
                        el.setAttribute(propName, String(propValue));
                    }
                }
            }
        }
    }

    buildObjectFromHTML(htmlString) {
        if (typeof htmlString !== 'string' || htmlString.trim() === '') {
            console.warn("Input tidak valid untuk buildObjectFromHTML. Harap berikan string HTML.");
            return null;
        }

        const doc = this.#parser.parseFromString(htmlString, 'text/html');
        const tempDiv = doc.body;

        const rootElement = tempDiv.firstElementChild;

        if (!rootElement) {
            if (tempDiv.childNodes.length === 1 && tempDiv.firstChild.nodeType === Node.TEXT_NODE) {
                 return {
                    nodeName: '#text',
                    content: tempDiv.firstChild.textContent.trim()
                };
            } else if (tempDiv.childNodes.length > 1 && Array.from(tempDiv.childNodes).every(n => n.nodeType === Node.TEXT_NODE || n.nodeType === Node.COMMENT_NODE || n.textContent.trim() === '')) {
                 return {
                    nodeName: '#text',
                    content: Array.from(tempDiv.childNodes)
                               .filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== '')
                               .map(n => n.textContent.trim())
                               .join(' ')
                };
            }
            console.warn("Tidak ada elemen yang ditemukan dalam string HTML.");
            return null;
        }

        return this.buildObjectFromHTMLNode(rootElement);
    }

    buildObjectFromHTMLNode(node) {
        if (!node || !(node instanceof Node)) {
            return null;
        }

        if (node.nodeType === Node.COMMENT_NODE ||
            (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '')) {
            return null;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            return {
                nodeName: '#text',
                content: node.textContent.trim()
            };
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }

        const obj = {
            nodeName: node.tagName.toLowerCase(),
            attrs: {},
            children: []
        };

        if (node.attributes.length > 0) {
            Array.from(node.attributes).forEach(attr => {
                obj.attrs[attr.name] = attr.value;
            });
        }

        if (obj.attrs.style && typeof obj.attrs.style === 'string') {
            const styleObj = {};
            const stylePairs = obj.attrs.style.split(';');
            stylePairs.forEach(pair => {
                const parts = pair.split(':').map(p => p.trim());
                if (parts.length === 2) {
                    const propName = parts[0].replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    styleObj[propName] = parts[1];
                }
            });
            if (Object.keys(styleObj).length > 0) {
                obj.attrs.style = styleObj;
            } else {
                delete obj.attrs.style;
            }
        }

        if (node.childNodes.length > 0) {
            Array.from(node.childNodes).forEach(childNode => {
                const convertedChild = this.buildObjectFromHTMLNode(childNode);
                if (convertedChild) {
                    obj.children.push(convertedChild);
                }
            });
        }

        if (obj.children.length === 1 && obj.children[0].nodeName === '#text' && Object.keys(obj.attrs).length === 0) {
            obj.content = obj.children[0].content;
            delete obj.children;
        } else if (obj.children.length > 0 && obj.children.every(c => c.nodeName === '#text')) {
             obj.content = obj.children.map(c => c.content).join('');
             delete obj.children;
        }

        return obj;
    }

    #SanitizeHtmlInternal(input, extraSelector) {
        input = input.trim();
        if (input === "") return "";

        if (input === "<br>") return "";

        if (input.indexOf("<body") === -1) input = "<body>" + input + "</body>";

        let doc = this.#parser.parseFromString(input, "text/html");

        if (doc.body.tagName !== 'BODY')
            doc.body.remove();
        if (typeof doc.createElement !== 'function')
            doc.createElement.remove();

        const makeSanitizedCopy = (node) => {
            let newNode;
            if (node.nodeType === Node.TEXT_NODE) {
                newNode = node.cloneNode(true);
            } else if (node.nodeType === Node.ELEMENT_NODE && (this.#tagWhitelist[node.tagName] || this.#contentTagWhiteList[node.tagName] || (extraSelector && node.matches(extraSelector)))) {

                if (this.#contentTagWhiteList[node.tagName])
                    newNode = doc.createElement('DIV');
                else
                    newNode = doc.createElement(node.tagName);

                for (let i = 0; i < node.attributes.length; i++) {
                    let attr = node.attributes[i];
                    if (this.#attributeWhitelist[attr.name]) {
                        if (attr.name === "style") {
                            if (typeof attr.value === 'string' && attr.value.trim() !== '') {
                                const tempEl = document.createElement('div');
                                tempEl.setAttribute('style', attr.value);
                                let sanitizedStyle = '';
                                for (let s = 0; s < tempEl.style.length; s++) {
                                    let styleName = tempEl.style[s];
                                    if (this.#cssWhitelist[styleName]) {
                                        sanitizedStyle += `${styleName}: ${tempEl.style.getPropertyValue(styleName)}; `;
                                    }
                                }
                                if (sanitizedStyle.trim() !== '') {
                                    newNode.setAttribute('style', sanitizedStyle.trim());
                                }
                            }
                        }
                        else {
                            if (this.#uriAttributes[attr.name]) {
                                if (attr.value.indexOf(":") > -1 && !this.#startsWithAny(attr.value, this.#schemaWhiteList))
                                    continue;
                            }
                            newNode.setAttribute(attr.name, attr.value);
                        }
                    }
                }
                for (let i = 0; i < node.childNodes.length; i++) {
                    let subCopy = makeSanitizedCopy(node.childNodes[i]);
                    newNode.appendChild(subCopy, false);
                }

                if ((newNode.tagName === "SPAN" || newNode.tagName === "B" || newNode.tagName === "I" || newNode.tagName === "U")
                    && newNode.innerHTML.trim() === "") {
                    return doc.createDocumentFragment();
                }

            } else {
                newNode = doc.createDocumentFragment();
            }
            return newNode;
        };

        let resultElement = makeSanitizedCopy(doc.body);

        return resultElement.innerHTML
            .replace(/div><div/g, "div>\n<div");
    }

    #startsWithAny(str, substrings) {
        for (let i = 0; i < substrings.length; i++) {
            if (str.indexOf(substrings[i]) === 0) {
                return true;
            }
        }
        return false;
    }

    get customElements() {
        const self = this;

        const h = self.create.bind(self);

        const render = (element, container) => {
            // Bersihkan container sebelum render
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            if (element) {
                container.appendChild(element);
            }
        };

        // Hydrate akan berfungsi sama seperti render untuk kasus ini
        const hydrate = render;

        const cloneElement = (element, newProps) => {
            if (!element) return null;

            // Ekstrak props lama dari elemen DOM
            const oldProps = {};
            // Ambil atribut
            for (const attr of element.attributes) {
                oldProps[attr.name] = attr.value;
            }
            // Ambil event listeners (ini bagian yang sulit dan seringkali tidak mungkin dilakukan secara sempurna tanpa VDOM)
            // Untuk kesederhanaan, kita akan mengabaikan kloning event listener dan mengandalkan pemasangan ulang.

            // Gabungkan props lama dan baru
            const props = { ...oldProps, ...newProps };
            
            // Ambil children
            const children = Array.from(element.childNodes).map(node => node.cloneNode(true));
            
            // Buat elemen baru dengan props yang digabungkan dan children yang sama
            return h(element.tagName, props, children);
        };
        
        function toCamelCase(str) {
            return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
        }

        function Slot(props, context) {
            const ref = (r) => {
                if (!r) {
                    if (this.ref) {
                       this.ref.removeEventListener('_element', this._listener);
                    }
                } else {
                    this.ref = r;
                    if (!this._listener) {
                        this._listener = (event) => {
                            event.stopPropagation();
                            event.detail.context = context;
                        };
                        r.addEventListener('_element', this._listener);
                    }
                }
            };

            return h('slot', { ...props, ref });
        }
        
        function toDom(element, nodeName) {
            if (element.nodeType === 3) return self.text(element.data);
            if (element.nodeType !== 1) return null;

            let children = [],
                props = {},
                i = 0,
                a = element.attributes,
                cn = element.childNodes;

            for (i = a.length; i--;) {
                if (a[i].name !== 'slot') {
                    props[a[i].name] = a[i].value;
                    props[toCamelCase(a[i].name)] = a[i].value;
                }
            }

            for (i = cn.length; i--;) {
                const domNode = toDom(cn[i], null);
                const slotName = cn[i].slot;
                if (slotName) {
                    props[slotName] = h(Slot, { name: slotName }, domNode);
                } else {
                    children[i] = domNode;
                }
            }
            
            const wrappedChildren = nodeName ? h(Slot, null, children.filter(Boolean)) : children.filter(Boolean);
            return h(nodeName || element.nodeName.toLowerCase(), props, wrappedChildren);
        }

        function ContextProvider(props) {
            this.getChildContext = () => props.context;
            const { context, children, ...rest } = props;

            return cloneElement(children, rest);
        }
        
        function connectedCallback() {
            const event = new CustomEvent('_element', {
                detail: {},
                bubbles: true,
                cancelable: true,
            });
            this.dispatchEvent(event);
            const context = event.detail.context;

            const initialProps = { ...this._props, context };
            
            // Menggabungkan atribut dari elemen HTML ke dalam props
            for(const attr of this.attributes) {
                const name = toCamelCase(attr.name);
                if (!(name in initialProps)) {
                   initialProps[name] = attr.value;
                }
            }

            this._component = h(
                this._vdomComponent,
                initialProps,
                Array.from(this.childNodes).map(child => toDom(child, child.nodeName))
            );

            (this.hasAttribute('hydrate') ? hydrate : render)(this._component, this._root);
        }

        function attributeChangedCallback(name, oldValue, newValue) {
            if (!this._component) return;
            
            newValue = newValue == null ? undefined : newValue;
            const props = this._component.props || {};
            
            props[name] = newValue;
            props[toCamelCase(name)] = newValue;

            // Re-render komponen dengan props baru
            this._component = h(
                this._vdomComponent,
                props,
                Array.from(this.childNodes).map(child => toDom(child, child.nodeName))
            );
            render(this._component, this._root);
        }

        function disconnectedCallback() {
            render((this._component = null), this._root);
        }

        return {
            /**
             * Mendaftarkan komponen sebagai web-component.
             * @param {Function} Component Komponen fungsional untuk didaftarkan.
             * @param {string} [tagName] Nama tag HTML (harus mengandung tanda hubung dan huruf kecil).
             * @param {string[]} [propNames] Atribut HTML yang akan diobservasi.
             * @param {Options} [options] Opsi tambahan untuk elemen.
             */
            register: function(Component, tagName, propNames, options) {
                function myElement() {
                    const inst = /** @type {myCustomElement} */ (
                        Reflect.construct(HTMLElement, [], myElement)
                    );
                    inst._vdomComponent = Component;
                    inst._root =
                        options && options.shadow
                            ? inst.attachShadow({ mode: options.mode || 'open' })
                            : inst;
                    inst._props = {};
                    return inst;
                }

                myElement.prototype = Object.create(HTMLElement.prototype);
                myElement.prototype.constructor = myElement;
                myElement.prototype.connectedCallback = connectedCallback;
                myElement.prototype.attributeChangedCallback = attributeChangedCallback;
                myElement.prototype.disconnectedCallback = disconnectedCallback;

                myElement.prototype.ContextProvider = ContextProvider;

                propNames =
                    propNames ||
                    Component.observedAttributes ||
                    Object.keys(Component.propTypes || {});
                myElement.observedAttributes = propNames;

                propNames.forEach((name) => {
                    if (!Object.getOwnPropertyDescriptor(myElement.prototype, name)) {
                        Object.defineProperty(myElement.prototype, name, {
                            get() {
                                return this._component ? this._component.props[name] : this._props[name];
                            },
                            set(v) {
                                if (this._component) {
                                    this.attributeChangedCallback(name, null, v);
                                } else {
                                    this._props[name] = v;
                                    // Jika belum terhubung, connectedCallback akan menangani render
                                }

                                const type = typeof v;
                                if (
                                    v == null ||
                                    type === 'string' ||
                                    type === 'boolean' ||
                                    type === 'number'
                                ) {
                                    this.setAttribute(name, v);
                                }
                            },
                        });
                    }
                });

                return customElements.define(
                    tagName || Component.tagName || Component.displayName || Component.name,
                    myElement
                );
            }
        };
    }

    get AllowedTags() { return this.#tagWhitelist; }
    get AllowedAttributes() { return this.#attributeWhitelist; }
    get AllowedCssStyles() { return this.#cssWhitelist; }
    get AllowedSchemas() { return this.#schemaWhiteList; }
}

export const el = new Element();

export const jsx = el.jsx.bind(el);
export const jsxs = el.jsx.bind(el);
export const jsxDEV = el.jsx.bind(el);
export const createRef = (initialValue) => ({ current: initialValue });