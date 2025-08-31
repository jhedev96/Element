// Make sure the path to your library file is correct
import { el } from '../src/Element.js';

// --- 1. Core: `el.create` and `el.init` ---
const demoCore = el.init('#demo-core');
const coreButton = el.create('button', {
    class: ['btn', 'btn-primary'],
    style: { background: 'darkslateblue' },
    onclick: () => alert('Core button clicked!')
}, 'Click Me');
demoCore.build(coreButton);


// --- 2. Rendering Engine: `el.render` ---
const renderList = document.getElementById('render-list');
let prependCounter = 0;
let appendCounter = 0;

document.getElementById('btn-prepend').addEventListener('click', () => {
    prependCounter++;
    const newItem = el.create('li', {}, `Prepended Item ${prependCounter}`);
    el.render(renderList, newItem, 'prepend'); // Using el.render directly
});

document.getElementById('btn-append').addEventListener('click', () => {
    appendCounter++;
    const newItem = el.create('li', {}, `Appended Item ${appendCounter}`);
    el.render(renderList, newItem, 'append'); // Using el.render directly
});


// --- 3. Direct DOM Access: `ref` and `assign` props ---
const demoRef = el.init('#demo-ref');
const inputRef = { current: null }; // Create a ref object

const refExample = el.create('div', {}, [
    el.create('input', {
        type: 'text',
        placeholder: 'I will be focused',
        ref: inputRef // Assign the ref
    }),
    el.create('button', {
        onclick: () => {
            // Use the ref to access the DOM node directly
            if (inputRef.current) {
                inputRef.current.focus();
                alert(`Input value: ${inputRef.current.value}`);
            }
        }
    }, 'Focus and Read Input'),
    el.create('p', {
        // 'assign' is a function that receives the node on creation
        assign: (node) => {
            node.style.color = 'green';
            node.textContent = 'My color was set by the "assign" prop!';
        }
    })
]);
demoRef.build(refExample);


// --- 4. Sanitization Showcase ---
const demoSanitize = el.init('#demo-sanitize');
const maliciousHtml = `<img src="invalid" onerror="alert('HACKED!')"> <p style="position:absolute; top:0; left:0; color:blue;">This style is partially sanitized.</p><script>alert('nope')</script>`;
const explanation = el.create('div', {}, [
    el.create('p', {}, 'Original malicious string:'),
    el.create('pre', {}, maliciousHtml),
    el.create('p', {}, 'Result after sanitization (view inspector to see removed attributes):'),
    el.jsx(maliciousHtml) // Sanitized by default
]);
demoSanitize.build(explanation);


// --- 5. Object-Driven DOM: `buildFromObject` ---
const demoObject = el.init('#demo-object');
const template = {
    nodeName: 'article',
    attrs: { id: 'post-1' },
    children: [
        { nodeName: 'h3', content: 'Post Title' },
        { nodeName: 'div', attrs: { id: 'post-body' }, content: 'Loading content...' }
    ]
};
const newContent = el.create('p', {}, 'This is the actual post content that was merged in.');
demoObject.buildFromObject(template, newContent, 'post-body', 'replace');


// --- 6. Advanced Web Component ---
function InteractiveCounter(props) {
    // Get props from attributes (kebab-case is converted to camelCase)
    let currentValue = parseInt(props.startValue || 0, 10);
    const step = parseInt(props.step || 1, 10);

    // Create a ref for the span to update it without re-rendering everything
    const displayRef = { current: null };

    const handleIncrement = () => {
        currentValue += step;
        if (displayRef.current) {
            displayRef.current.textContent = currentValue;
        }
    };
    
    return el.create('div', { class: 'interactive-counter' }, [
        el.create('span', {}, 'Value: '),
        el.create('span', { ref: displayRef }, currentValue),
        el.create('button', { onclick: handleIncrement }, `Add ${step}`)
    ]);
}

el.customElements.register(
  InteractiveCounter,
  'interactive-counter',
  ['startValue', 'step'] // Attributes to observe
);
console.log('Registered "interactive-counter" custom element.');
