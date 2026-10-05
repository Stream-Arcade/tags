/** Marks the elements this package put into the `<head>`. */
export const TAG_ID_ATTRIBUTE = 'data-sat-id';
/** Google Tag Manager, e.g. `googleTagManager('GTM-XXXXXXX')`. */
export function googleTagManager(containerId, options = {}) {
    const category = options.category ?? 'analytics';
    return [
        {
            id: 'gtm-init',
            element: 'script',
            category,
            content: 'window.dataLayer=window.dataLayer||[];' +
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
export function googleAnalytics(measurementId, options = {}) {
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
            content: 'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}' +
                `gtag('js',new Date());gtag('config',${JSON.stringify(measurementId)});`,
        },
    ];
}
/** Plausible, e.g. `plausible('streamarcade.example')`. */
export function plausible(domain, options = {}) {
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
export const defaultTags = [];
/** The tags whose category is covered by `consent`. */
export function selectTags(tags, consent) {
    return tags.filter((tag) => {
        const category = tag.category ?? 'necessary';
        if (category === 'necessary' || consent === true)
            return true;
        return typeof consent === 'object' && consent[category] === true;
    });
}
/**
 * Inserts the allowed tags into the `<head>` and returns a function that removes them
 * again. A tag whose id is already in the document (e.g. rendered by the server) is skipped.
 */
export function applyTags(tags, consent) {
    const added = [];
    for (const tag of selectTags(tags, consent)) {
        if (document.head.querySelector(`[${TAG_ID_ATTRIBUTE}="${CSS.escape(tag.id)}"]`))
            continue;
        const el = document.createElement(tag.element);
        el.setAttribute(TAG_ID_ATTRIBUTE, tag.id);
        for (const [name, value] of Object.entries(tag.attrs ?? {})) {
            if (value !== false)
                el.setAttribute(name, value === true ? '' : value);
        }
        // Scripts inserted by code run in any order unless async is switched off.
        if (el instanceof HTMLScriptElement && el.src && tag.attrs?.async !== true)
            el.async = false;
        if (tag.content != null)
            el.textContent = tag.content;
        document.head.appendChild(el);
        added.push(el);
    }
    return () => added.forEach((el) => el.remove());
}
function escapeAttribute(value) {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
/** The allowed tags as HTML, for a server that fills the `<head>` of `index.html` itself. */
export function tagsToHtml(tags, consent) {
    return selectTags(tags, consent)
        .map((tag) => {
        const all = { [TAG_ID_ATTRIBUTE]: tag.id, ...tag.attrs };
        const attrs = Object.entries(all)
            .filter(([, value]) => value !== false)
            .map(([name, value]) => value === true ? name : `${name}="${escapeAttribute(String(value))}"`)
            .join(' ');
        if (tag.element !== 'script')
            return `<${tag.element} ${attrs} />`;
        const content = (tag.content ?? '').replace(/<\/(script)/gi, '<\\/$1');
        return `<script ${attrs}>${content}</script>`;
    })
        .join('\n');
}
