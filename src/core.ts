export type TagCategory = 'necessary' | 'analytics' | 'marketing';

export interface Tag {
  /** Unique per tag. Used to avoid inserting the same tag twice. */
  id: string;
  element: 'script' | 'meta' | 'link';
  /** Consent category the tag needs. Defaults to `'necessary'`, which always loads. */
  category?: TagCategory;
  /** HTML attributes. `true` writes a bare attribute (`async`), `false` leaves it out. */
  attrs?: Record<string, string | boolean>;
  /** Inline code of a `<script>`. */
  content?: string;
}

/** `true` allows every category, `false`/`undefined` only `'necessary'`. */
export type TagConsent = boolean | Partial<Record<TagCategory, boolean>>;

/** Marks the elements this package put into the `<head>`. */
export const TAG_ID_ATTRIBUTE = 'data-sat-id';

export interface PresetOptions {
  category?: TagCategory;
}

/** Google Tag Manager, e.g. `googleTagManager('GTM-XXXXXXX')`. */
export function googleTagManager(containerId: string, options: PresetOptions = {}): Tag[] {
  const category = options.category ?? 'analytics';
  return [
    {
      id: 'gtm-init',
      element: 'script',
      category,
      content:
        'window.dataLayer=window.dataLayer||[];' +
        "window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});",
    },
    {
      id: 'gtm',
      element: 'script',
      category,
      attrs: {
        async: true,
        src: `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`,
      },
    },
  ];
}

/** Google Analytics 4, e.g. `googleAnalytics('G-XXXXXXXXXX')`. */
export function googleAnalytics(measurementId: string, options: PresetOptions = {}): Tag[] {
  const category = options.category ?? 'analytics';
  return [
    {
      id: 'ga4',
      element: 'script',
      category,
      attrs: {
        async: true,
        src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
      },
    },
    {
      id: 'ga4-init',
      element: 'script',
      category,
      content:
        'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}' +
        `gtag('js',new Date());gtag('config',${JSON.stringify(measurementId)});`,
    },
  ];
}

export interface PlausibleOptions extends PresetOptions {
  /** Script URL, e.g. of a self-hosted instance. */
  src?: string;
}

/** Plausible, e.g. `plausible('streamarcade.example')`. */
export function plausible(domain: string, options: PlausibleOptions = {}): Tag[] {
  return [
    {
      id: 'plausible',
      element: 'script',
      category: options.category ?? 'analytics',
      attrs: {
        defer: true,
        'data-domain': domain,
        src: options.src ?? 'https://plausible.io/js/script.js',
      },
    },
  ];
}

/**
 * The tags every StreamArcade app loads. This list is the one place to add a
 * platform-wide tag; apps pick it up with the next release.
 */
export const defaultTags: Tag[] = [];

/** The tags whose category is covered by `consent`. */
export function selectTags(tags: Tag[], consent?: TagConsent): Tag[] {
  return tags.filter((tag) => {
    const category = tag.category ?? 'necessary';
    if (category === 'necessary' || consent === true) return true;
    return typeof consent === 'object' && consent[category] === true;
  });
}

/**
 * Inserts the allowed tags into the `<head>` and returns a function that removes them
 * again. A tag whose id is already in the document (e.g. rendered by the server) is skipped.
 */
export function applyTags(tags: Tag[], consent?: TagConsent): () => void {
  const added: Element[] = [];
  for (const tag of selectTags(tags, consent)) {
    if (document.head.querySelector(`[${TAG_ID_ATTRIBUTE}="${CSS.escape(tag.id)}"]`)) continue;
    const el = document.createElement(tag.element);
    el.setAttribute(TAG_ID_ATTRIBUTE, tag.id);
    for (const [name, value] of Object.entries(tag.attrs ?? {})) {
      if (value !== false) el.setAttribute(name, value === true ? '' : value);
    }
    // Scripts inserted by code run in any order unless async is switched off.
    if (el instanceof HTMLScriptElement && el.src && tag.attrs?.async !== true) el.async = false;
    if (tag.content != null) el.textContent = tag.content;
    document.head.appendChild(el);
    added.push(el);
  }
  return () => added.forEach((el) => el.remove());
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** The allowed tags as HTML, for a server that fills the `<head>` of `index.html` itself. */
export function tagsToHtml(tags: Tag[], consent?: TagConsent): string {
  return selectTags(tags, consent)
    .map((tag) => {
      const all: Record<string, string | boolean> = { [TAG_ID_ATTRIBUTE]: tag.id, ...tag.attrs };
      const attrs = Object.entries(all)
        .filter(([, value]) => value !== false)
        .map(([name, value]) =>
          value === true ? name : `${name}="${escapeAttribute(String(value))}"`,
        )
        .join(' ');
      if (tag.element !== 'script') return `<${tag.element} ${attrs} />`;
      const content = (tag.content ?? '').replace(/<\/(script)/gi, '<\\/$1');
      return `<script ${attrs}>${content}</script>`;
    })
    .join('\n');
}
