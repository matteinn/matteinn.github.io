# matteinn.com

Personal website and blog, built with [Astro](https://astro.build) and deployed to GitHub Pages ([matteinn.com](https://matteinn.com)).

## Development

```sh
npm install
npm run dev       # local dev server at http://localhost:4321
npm run build     # production build into ./dist
npm run preview   # serve the production build locally
```

## Writing a post

Add a markdown file to `src/content/posts/`. The filename is the URL slug: `my-new-post.md` is published at `/posts/my-new-post/`.

```markdown
---
title: "My new post"
date: 2026-07-17 10:00:00 +0200
tags: [android, github]
description: >-
  A short snippet (2-3 lines) shown under the title on the homepage and tag
  pages, also used as the meta/RSS description.
---

Post content in markdown...
```

- `tags` is optional; every tag automatically gets a listing page at `/tags/<tag>/`.
- `description` is optional; without it the lists just show title, date and tags.
- Post images go in `public/assets/img/posts/` and are referenced as `/assets/img/posts/...`.
- Previous/next links at the bottom of each article are generated automatically.

Site-wide settings (title, tagline, social links, Google Analytics id) live in `src/config.ts`.

## License

Dual-licensed (see [LICENSE](LICENSE)): blog posts and written content are [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), the site's code is MIT.

## Deploy

Every push to `master` builds and deploys the site via GitHub Actions (`.github/workflows/pages.yml`). The custom domain is configured through `public/CNAME`.
