import { useEffect } from 'react';
import { applyTags, defaultTags, selectTags } from './core.js';
/** Renders nothing; keeps the `<head>` in sync with the tag list and the consent. */
export function Tags({ tags = defaultTags, extra, consent, disabled = false }) {
    const active = disabled ? [] : selectTags(extra ? [...tags, ...extra] : tags, consent);
    // Lists are usually built inline, so compare by content instead of identity.
    const key = JSON.stringify(active);
    useEffect(() => applyTags(JSON.parse(key), true), [key]);
    return null;
}
