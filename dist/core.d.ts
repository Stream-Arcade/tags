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
export declare const TAG_ID_ATTRIBUTE = "data-sat-id";
export interface PresetOptions {
    category?: TagCategory;
}
/** Google Tag Manager, e.g. `googleTagManager('GTM-XXXXXXX')`. */
export declare function googleTagManager(containerId: string, options?: PresetOptions): Tag[];
/** Google Analytics 4, e.g. `googleAnalytics('G-XXXXXXXXXX')`. */
export declare function googleAnalytics(measurementId: string, options?: PresetOptions): Tag[];
export interface PlausibleOptions extends PresetOptions {
    /** Script URL, e.g. of a self-hosted instance. */
    src?: string;
}
/** Plausible, e.g. `plausible('streamarcade.example')`. */
export declare function plausible(domain: string, options?: PlausibleOptions): Tag[];
/**
 * The tags every StreamArcade app loads. This list is the one place to add a
 * platform-wide tag; apps pick it up with the next release.
 */
export declare const defaultTags: Tag[];
/** The tags whose category is covered by `consent`. */
export declare function selectTags(tags: Tag[], consent?: TagConsent): Tag[];
/**
 * Inserts the allowed tags into the `<head>` and returns a function that removes them
 * again. A tag whose id is already in the document (e.g. rendered by the server) is skipped.
 */
export declare function applyTags(tags: Tag[], consent?: TagConsent): () => void;
/** The allowed tags as HTML, for a server that fills the `<head>` of `index.html` itself. */
export declare function tagsToHtml(tags: Tag[], consent?: TagConsent): string;
