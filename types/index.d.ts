declare module "@jhedev96/element" {
  export interface ElementConfig {
    root?: string | HTMLElement | SVGElement | Document;
    sanitize?: boolean;
  }

  export interface CreditInfo {
    version: string;
    author: string;
  }

  export default class Element {
    constructor(config?: ElementConfig | string | HTMLElement | SVGElement | Document, sanitize?: boolean);

    /**
     * Inisialisasi ulang target root setelah instance dibuat.
     */
    init(root: string | HTMLElement | SVGElement | Document, sanitize?: boolean): void;

    /**
     * Render HTML string atau Node ke target root.
     */
    render(content: string | Node, target?: HTMLElement | SVGElement | Document): void;

    /**
     * Hapus semua child dari target root.
     */
    clear(target?: HTMLElement | SVGElement | Document): void;

    /**
     * Escape string agar aman dari injection HTML.
     */
    escapeHTML(input: string): string;

    /**
     * Buat elemen DOM baru.
     */
    create<K extends keyof HTMLElementTagNameMap>(
      tag: K,
      attrs?: Record<string, any>,
      ...children: (string | Node)[]
    ): HTMLElementTagNameMap[K];

    /**
     * Tambahkan event listener ke elemen target.
     */
    on(
      target: HTMLElement | SVGElement | Document,
      event: string,
      handler: EventListenerOrEventListenerObject
    ): void;

    /**
     * Hapus event listener dari elemen target.
     */
    off(
      target: HTMLElement | SVGElement | Document,
      event: string,
      handler: EventListenerOrEventListenerObject
    ): void;

    /**
     * Query element dalam target root (shorthand seperti $()).
     */
    query<T extends Element = HTMLElement>(selector: string): T | null;

    /**
     * Query semua element dalam target root.
     */
    queryAll<T extends Element = HTMLElement>(selector: string): NodeListOf<T>;

    /**
     * Dapatkan credit info (versi, author).
     */
    getCredit(): CreditInfo;
  }
}
