# Aziz Cloudflare

Personal site for [azizmoftah.com](https://azizmoftah.com), deployed to Cloudflare via Git auto-deployments.

## Layout

- `content/cv.json` – **source of truth** for all CV and landing-page content
- `scripts/build.mjs` – generates the HTML pages, sitemap, robots.txt and favicon from the JSON
- `scripts/make-pdf.mjs` – renders the CV page to PDF using a local Edge/Chrome
- `site/` – the deployed static site (generated pages + `assets/` + the PDF)
- `wrangler.jsonc` – Cloudflare config (static assets and custom domains)

## Editing the CV

```bash
# 1. edit content/cv.json
npm run build   # regenerates site/index.html and site/cv/index.html
npm run pdf     # regenerates site/AbdElAziz-Moftah-CV.pdf
git add -A && git commit && git push   # Cloudflare deploys main automatically
```

Generated files are committed, so deploys work even with an empty build command.
Do not edit the generated HTML by hand; changes are overwritten by the next build.

## Auto-deploy setup (one time, in the Cloudflare dashboard)

1. Workers & Pages → **Create** → **Import a repository** → connect GitHub and pick `NotMoftah/aziz-cloudflare`.
2. Project name: `aziz-cloudflare` (must match `name` in `wrangler.jsonc`).
3. Production branch: `main`.
4. Build command: `npm run build`. Deploy command: `npx wrangler deploy`.
5. Save and deploy. Every push to `main` deploys; other branches get preview builds.

`wrangler.jsonc` attaches `azizmoftah.com` and `www.azizmoftah.com` as custom domains on deploy.
The domain must be an active zone in the same Cloudflare account.

## Local preview

```bash
npm run dev
```

## Secrets

Copy `.env.example` to `.env` (gitignored) for local scripts. Never commit tokens.

## Adding another site

Add a new folder with its own `wrangler.jsonc`, then create a second Cloudflare project from the
same repo and set its **Root directory** to that folder.
