# Almanac

A private, local-only menstrual tracker and prediction web app.

**Live:** https://isfarbaset.github.io/almanac/

No accounts. No servers. No ads. No subscription. Your cycle data never
leaves your device, which is the whole point: period data is sensitive,
and the popular apps have a poor track record (Flo was fined by the FTC
for sharing health data with Facebook). Almanac stores everything in your
browser via IndexedDB and makes zero network calls with your data.

## What it does

- Tap any day to log flow, symptoms, and a note
- "Log today" button for fast daily entry
- Weighted prediction of your next period that favors recent cycles
- Confidence window instead of a single fake-precise date
- Estimated fertile window and ovulation day
- A gentle, non-alarming nudge if recent cycles vary by more than a week
- Export and import your data as JSON so you own your backup
- Installable as a PWA: add to home screen, works offline
- Editorial almanac aesthetic, not "wellness app pink"

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL.

## Build

```bash
npm run build
npm run preview
```

The build output is a fully static site in `dist/`.

## Deploy

Deployment is automated. Every push to `main` builds the site and
publishes it to GitHub Pages via `.github/workflows/deploy.yml`. The live
URL is https://isfarbaset.github.io/almanac/.

Because it is served from a project subpath, `vite.config.js` sets
`base` to `/almanac/`. If you fork it under a different repo name, change
that value (and the PWA `scope`/`start_url`) to match.

It is a plain static site, so it also works on any free static host
(Vercel, Cloudflare Pages, Netlify) if you prefer: build command
`npm run build`, output directory `dist`.

## Optional: nicer install icons

The PWA currently uses `public/favicon.svg` as its icon, which is enough
to be installable. For the best home-screen appearance across all
devices, generate PNG icons (192px, 512px, and a 512px maskable) from the
SVG using realfavicongenerator.net or maskable.app, drop them in
`public/`, and add them back to the `icons` array in `vite.config.js`.

## Disclaimer

Predictions are statistical estimates from your own logged history. This
is not contraception and not medical advice. Talk to a clinician about
anything that concerns you.
