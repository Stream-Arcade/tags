# @stream-arcade/tags

The StreamArcade head tags (analytics and co.) as a React component. Without props it loads
the tags every StreamArcade app shares; the list and the consent can be overridden.

The shared list lives in `defaultTags` in [src/core.ts](src/core.ts). Add a tag there once
and every app gets it with the next release.

## Installation

```sh
pnpm add github:Stream-Arcade/tags#v1.0.0
```

`dist/` is committed, so installing needs no build step. Peer dependency: `react >= 18`.

## Usage

Render it once, anywhere in the app. It renders nothing and writes into the `<head>`:

```tsx
import { Tags } from '@stream-arcade/tags';

<Tags consent={{ analytics: hasConsent }} />;
```

## Consent

Every tag has a `category`: `'necessary'` (default), `'analytics'` or `'marketing'`.
Necessary tags always load. The others only load once `consent` allows their category:

```tsx
<Tags />                                  // necessary tags only
<Tags consent={{ analytics: true }} />    // plus analytics
<Tags consent />                          // everything
```

When consent is withdrawn the tags are removed from the `<head>`. A script that already ran
keeps running until the next page load.

## Overriding the tags

```tsx
import { Tags, defaultTags, plausible } from '@stream-arcade/tags';

<Tags
  tags={[...defaultTags, ...plausible('streamarcade.example')]} // replaces the list
  extra={[
    // on top of the list
    { id: 'verify', element: 'meta', attrs: { name: 'google-site-verification', content: '…' } },
    { id: 'my-script', element: 'script', category: 'marketing', attrs: { src: '/x.js', defer: true } },
    { id: 'my-inline', element: 'script', content: 'window.myFlag = true;' },
  ]}
  disabled={import.meta.env.DEV} // loads nothing
/>;
```

A tag is `{ id, element, category?, attrs?, content? }` with `element` being `'script'`,
`'meta'` or `'link'`. The `id` must be unique; a tag whose id is already in the document is
not inserted again.

Presets return ready-made tags and take `{ category }` to change the consent category
(default `'analytics'`):

| Preset                                   | Loads                |
| ---------------------------------------- | -------------------- |
| `googleTagManager('GTM-XXXXXXX')`        | Google Tag Manager   |
| `googleAnalytics('G-XXXXXXXXXX')`        | Google Analytics 4   |
| `plausible('domain', { src })`           | Plausible            |

## Without React

`@stream-arcade/tags/core` has the same list and helpers without importing React:

```ts
import { applyTags, defaultTags, tagsToHtml } from '@stream-arcade/tags/core';

const remove = applyTags(defaultTags, { analytics: true }); // browser
const html = tagsToHtml(defaultTags); // server: paste into the <head> of index.html
```

Tags rendered by the server are recognized by their `data-sat-id` attribute, so `<Tags />`
does not load them a second time.

## Development

```sh
pnpm install
pnpm build   # writes dist/ – commit it, it's what consumers install
```

Release: bump the version in `package.json`, run `pnpm build`, commit, then `git tag vX.Y.Z` and push the tag.
