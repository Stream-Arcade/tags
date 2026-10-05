import { useEffect } from 'react';
import { applyTags, defaultTags, selectTags, type Tag, type TagConsent } from './core.js';

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
export function Tags({ tags = defaultTags, extra, consent, disabled = false }: TagsProps) {
  const active = disabled ? [] : selectTags(extra ? [...tags, ...extra] : tags, consent);
  // Lists are usually built inline, so compare by content instead of identity.
  const key = JSON.stringify(active);

  useEffect(() => applyTags(JSON.parse(key) as Tag[], true), [key]);

  return null;
}
