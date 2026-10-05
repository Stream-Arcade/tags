import { type Tag, type TagConsent } from './core.js';
export interface TagsProps {
    /** Replaces the default tag list. */
    tags?: Tag[];
    /** Tags loaded in addition to the list, e.g. one that only this app needs. */
    extra?: Tag[];
    /** Which categories the visitor allowed. Without it only `'necessary'` tags load. */
    consent?: TagConsent;
    /** Loads nothing, e.g. `disabled={import.meta.env.DEV}`. */
    disabled?: boolean;
}
/** Renders nothing; keeps the `<head>` in sync with the tag list and the consent. */
export declare function Tags({ tags, extra, consent, disabled }: TagsProps): null;
