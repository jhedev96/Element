# Element.js

![Versi](https://img.shields.io/badge/version-10.1--beta1-blue)
![Lisensi](https://img.shields.io/badge/license-MIT-green)
![Kontribusi](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)

**Element.js** adalah library JavaScript front-end yang ringan, modern, dan tanpa dependensi, direkayasa untuk menyederhanakan manipulasi DOM, membangun antarmuka pengguna yang dinamis, dan membuat Web Component standar dengan cara yang deklaratif dan efisien.

---

### Filosofi

Di tengah ekosistem JavaScript yang kompleks, **Element.js** lahir dari kebutuhan akan sebuah alat yang kuat namun tetap sederhana. Filosofi kami adalah menyediakan "pisau tentara Swiss" untuk pengembangan UI:

1.  **Kekuatan Deklaratif:** Mengadopsi sintaks yang terinspirasi dari React seperti JSX dan Komponen Fungsional untuk membuat kode UI lebih mudah dibaca dan dikelola, tanpa beban Virtual DOM.
2.  **Keamanan Standar:** Sanitasi HTML, CSS, dan URL adalah fitur inti, bukan tambahan. Library ini secara default melindungi aplikasi dari serangan XSS dengan membersihkan input yang tidak aman.
3.  **Fleksibilitas Ekstrem:** Baik Anda ingin merender beberapa elemen sederhana, membangun Single Page Application berbasis objek, atau membuat Web Component yang dapat digunakan kembali, Element.js menyediakan API yang diperlukan.
4.  **Merangkul Platform:** Daripada menciptakan ekosistem tertutup, Element.js berintegrasi mulus dengan standar web modern, terutama **Custom Elements**, memungkinkan developer untuk membuat komponen yang dapat diinteroperasikan di berbagai framework.

### Fitur Inti

-   **API Deklaratif:** Buat elemen kompleks dengan sintaks yang bersih dan intuitif.
-   **JSX & Komponen Fungsional:** Bangun UI Anda dari fungsi-fungsi kecil yang dapat digunakan kembali dengan sintaks mirip JSX yang familiar.
-   **Mesin Render yang Kuat:** Kontrol terperinci atas pembaruan DOM dengan metode seperti `build`, `append`, `prepend`, dan metode inti `render`.
-   **Sanitasi Bawaan:** Sanitizer berbasis whitelist yang kuat untuk tag HTML, atribut, style CSS, dan skema URL. Aktif secara default demi keamanan.
-   **DOM Berbasis Objek:** Konversi string HTML menjadi representasi objek JavaScript dan sebaliknya. Bangun seluruh pohon DOM dari objek dan gabungkan konten baru ke dalamnya dengan presisi.
-   **Integrasi Web Components:** Helper `register` yang sederhana namun kuat untuk mengubah Komponen Fungsional Anda menjadi Web Component standar yang agnostik terhadap framework.
-   **Tanpa Dependensi:** Ringan dan siap digunakan tanpa dependensi eksternal.

## Instalasi & Pengaturan

### Instalasi via npm/pnpm

Anda dapat menginstal Element.js langsung dari npm/pnpm:

```bash
# Menggunakan npm
npm install @jhedevx/element

# Menggunakan pnpm
pnpm add @jhedevx/element
```
Lalu impor di proyek Anda:
```js
import { el } from '@jhedevx/element';

const app = el.create('div', { id: 'app' });
el.render(document.body, app);
```

### Instalasi manual

Unduh file `Element.js` dan sertakan dalam proyek Anda sebagai ES Module.

```html
<script type="module" src="path/to/app.js"></script>

import { el } from './path/to/Element.js';
```

**Untuk Dukungan JSX:**
Untuk menggunakan sintaks JSX, Anda memerlukan transpiler seperti Babel. Konfigurasikan dengan pragma berikut di `.babelrc` atau konfigurasi build tool Anda:

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
*(Catatan: `el.Fragment` perlu diimplementasikan sebagai alias sederhana untuk `document.createDocumentFragment()` jika Anda memerlukan dukungan fragment di JSX).*

### Panduan API Mendalam

#### Inisialisasi: `el.init()`

Titik masuk untuk me-render konten. Ini menargetkan elemen root di DOM dan mengembalikan satu set metode rendering.

```javascript
// Inisialisasi dengan selector CSS
const app = el.init('#app');

// Inisialisasi dengan Node DOM
const appRoot = document.getElementById('app');
const app = el.init(appRoot);

// Inisialisasi dengan objek konfigurasi
const appUnsafe = el.init({
  root: '#app',
  sanitize: false // Menonaktifkan sanitasi global untuk instance ini
});
```

Metode `init` mengembalikan sebuah objek dengan metode-metode ini:
* `build(elements)`: Membersihkan elemen root dan me-render elemen baru.
* `append(element)`: Menambahkan elemen di akhir root.
* `prepend(element)`: Menambahkan elemen di awal root.
* `buildFromObject(...)`: Membangun dan me-render pohon DOM dari objek JS.

#### Inti Library: `el.create(tag, props, children, sanitizeConfig)`

Ini adalah metode terpenting dalam library. Ini membuat elemen DOM tetapi tidak menempelkannya ke DOM.

-   **`tag`** (String | Function): Nama tag HTML/SVG (`'div'`, `'svg'`) atau sebuah Komponen Fungsional.
-   **`props`** (Object): Sebuah objek yang berisi atribut, properti, dan event listener.
-   **`children`** (Any): Anak dari elemen. Bisa berupa string, angka, elemen lain, array elemen, atau bahkan fungsi (untuk pola render props).
-   **`sanitizeConfig`** (Boolean | Object): Mengganti pengaturan sanitasi instance untuk elemen spesifik ini dan anak-anaknya. Contoh: `{ sanitize: false }`.

**Props Secara Mendalam:**

```javascript
el.create('div', {
  // Atribut HTML standar
  id: 'my-div',
  class: 'container main', // atau ['container', 'main']
  'data-id': '123',

  // Style bisa berupa objek atau string
  style: { backgroundColor: 'blue', fontSize: '16px' },

  // Event listener (camelCase atau lowercase)
  onclick: (e) => console.log('Diklik!', e.target),

  // Properti Khusus untuk akses DOM langsung
  ref: myRefObject, // myRefObject.current akan menjadi elemen DOM
  assign: (domNode) => { domNode.focus(); }, // Fungsi yang menerima elemen

  // Mengatur inner HTML secara berbahaya (disanitasi secara default)
  dangerouslySetInnerHTML: { __html: '<span>HTML Mentah</span>' },

  // Atribut boolean
  disabled: true, // Menjadi <... disabled="disabled">
});
```

#### Mesin Render: `el.render(parent, element, position, sanitize)`

Ini adalah fungsi dasar yang digunakan oleh helper `init` (`append`, `build`). Anda bisa menggunakannya untuk kontrol yang lebih terperinci atas penempatan elemen.

-   **`parent`** (String | HTMLElement): Induk tempat me-render.
-   **`element`** (Any): Elemen atau teks yang akan di-render.
-   **`position`** (String): `'append'` (default) atau `'prepend'`.
-   **`sanitize`** (Boolean): Mengganti sanitasi default untuk operasi ini.

```javascript
const target = document.getElementById('some-container');
const newPara = el.create('p', {}, 'Saya di-render secara langsung!');

// Render di akhir target
el.render(target, newPara, 'append');
```

#### Penanganan HTML & Teks

**`el.jsx(htmlString, sanitize?)`**
Mem-parsing string HTML dan mengembalikan elemen DOM. Berguna untuk konten yang berasal dari CMS atau database. Sanitasi AKTIF secara default.

```javascript
const cardHtml = `<div class="card"><h3>Dari String</h3></div>`;
const cardElement = el.jsx(cardHtml); // Mengembalikan elemen DOM
app.append(cardElement);
```

**`el.text(string, parse?, sanitize?)`**
Utamanya membuat `TextNode`. Jika `parse` adalah `true`, ia mencoba mem-parsing string sebagai HTML, mengembalikan elemen atau fragmen DOM.

```javascript
const textNode = el.text('Teks biasa saja.'); // Sebuah TextNode sederhana
const parsedHtml = el.text('<b>Tebal Hasil Parse</b>', true); // Mengembalikan elemen
```

#### DOM Berbasis Objek

**`el.buildObjectFromHTML(htmlString)`**
Mengonversi string HTML menjadi representasi objek JavaScript.

```javascript
const html = '<div id="main"><p>Halo</p></div>';
const domObj = el.buildObjectFromHTML(html);
/*
Objek hasil:
{
  nodeName: 'div',
  attrs: { id: 'main' },
  children: [
    { nodeName: 'p', content: 'Halo' }
  ]
}
*/
```

**`app.buildFromObject(domObject, mergeObject?, targetNodeId?, mergePosition?)`**
Metode yang kuat untuk membangun pohon DOM dari sebuah objek, dengan opsi untuk menggabungkan elemen lain ke bagian tertentu dari pohon sebelum rendering.

```javascript
const userCard = {
  nodeName: 'div',
  attrs: { class: 'user-card' },
  children: [
    { nodeName: 'h4', content: 'Profil Pengguna' },
    { nodeName: 'div', attrs: { id: 'user-details' } } // Target untuk penggabungan
  ]
};

const userDetails = el.create('p', {}, 'Nama: JheDev');

// Bangun kartu, tapi pertama, suntikkan 'userDetails' ke dalam div dengan id 'user-details'
app.buildFromObject(userCard, userDetails, 'user-details', 'append');
```

#### Web Components: `el.customElements.register()`

Mengubah Komponen Fungsional menjadi Custom Element standar.

-   **`Component`** (Function): Komponen fungsional yang akan didaftarkan.
-   **`tagName`** (String): Nama tag HTML (harus mengandung tanda hubung).
-   **`propNames`** (Array<String>): Daftar nama atribut yang akan diobservasi. Ini akan diteruskan sebagai props. Library secara otomatis menangani konversi `kebab-case` ke `camelCase` untuk props.
-   **`options`** (Object): Opsi seperti `{ shadow: true }` untuk menggunakan Shadow DOM.

```javascript
// 1. Definisikan komponen
function SimpleCounter(props) {
  const start = props.start || 0; // Props berasal dari atribut
  return el.create('div', {}, [
    el.create('span', {}, `Nilai: ${start}`),
    el.create('button', {}, '+')
  ]);
}

// 2. Daftarkan sebagai Web Component
el.customElements.register(
  SimpleCounter,
  'simple-counter', // <simple-counter>
  ['start'] // observasi atribut 'start'
);
```

Sekarang Anda bisa menggunakannya di HTML Anda: `<simple-counter start="5"></simple-counter>`.

### Tinjauan Mendalam Sanitasi

Keamanan adalah fitur utama. Element.js menggunakan pendekatan whitelist.

-   **Tag yang Diizinkan:** Daftar tag HTML yang aman (cth: `<div>`, `<p>`, `<a>`, tapi bukan `<script>`). Akses dengan `el.AllowedTags`.
-   **Atribut yang Diizinkan:** Atribut yang aman (cth: `href`, `src`, `class`, tapi bukan `onerror`). Akses dengan `el.AllowedAttributes`.
-   **Style CSS yang Diizinkan:** Properti CSS yang aman (cth: `color`, `font-weight`, tapi bukan `position`). Akses dengan `el.AllowedCssStyles`.
-   **Skema URL yang Diizinkan:** `http:`, `https:`, `mailto:`, dll. Mencegah `javascript:...` di `hrefs`. Akses dengan `el.AllowedSchemas`.

Setiap tag, atribut, style, atau skema yang tidak ada di whitelist ini akan otomatis dihapus saat sanitasi aktif.

### Referensi API Lengkap

-   `el.init(opts, sanitize?)`: Mengembalikan `{ build, append, prepend, buildFromObject }`.
-   `el.create(tag, props?, children?, sanitizeConfig?)`: Mengembalikan `HTMLElement | SVGElement | DocumentFragment`.
-   `el.render(parent, elem, pos?, sanitize?)`: Me-render elemen ke induk.
-   `el.jsx(htmlString, sanitize?)`: Mengembalikan `HTMLElement | null`.
-   `el.text(str, parse?, sanitize?)`: Mengembalikan `TextNode | HTMLElement`.
-   `el.children(tag, props, children, count)`: Membuat array elemen.
-   `el.buildObjectFromHTML(htmlString)`: Mengembalikan `Object | null`.
-   `el.buildObjectFromHTMLNode(node)`: Mengembalikan `Object | null`.
-   `el.setAttributes(el, props, isSVG?, sanitize?)`: Menerapkan props ke elemen.
-   `el.customElements.register(Component, tagName?, propNames?, options?)`: Mendefinisikan custom element.
-   `el.AllowedTags` (Getter): Mengembalikan whitelist tag.
-   `el.AllowedAttributes` (Getter): Mengembalikan whitelist atribut.
-   `el.AllowedCssStyles` (Getter): Mengembalikan whitelist CSS.
-   `el.AllowedSchemas` (Getter): Mengembalikan whitelist skema URL.

### Berkontribusi

Kontribusi sangat kami harapkan! Silakan lakukan *fork* pada repositori ini, buat *branch* baru untuk fitur atau perbaikan Anda, dan kirimkan *pull request*.

### Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.
