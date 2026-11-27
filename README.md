# Midnight Deals — Black Friday Deal Finder 2026

[![Black Friday Deal Finder](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/arnesasarizky/black-friday-deal-finder/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/arnesasarizky/black-friday-deal-finder/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

A working Black Friday deal finder: **68 real Black Friday 2026 deals**, each
checked on 27 Nov 2026 at the store named on its card (Amazon, Best Buy,
Walmart, Target, Nordstrom, Macy's, Home Depot, Peloton, BowFlex, Hoka) or in a
deals roundup that names that store. Every discount is computed from the sale
price and the usual price shown, and every deal carries an honest verdict —
NEW LOW, STRONG DEAL, ROUTINE or INFLATED — with one line of evidence.

## What it does

- Text search across products, stores and categories
- Category chips (Tech, Kitchen, Home, Gaming, Toys, Beauty, Fitness, Fashion)
- Store filter and discount filter (≥20 / 30 / 40 / 50% off)
- Sort by biggest discount %, biggest saving $, or price
- A top-5 "Best deals right now" strip, ranked by verdict then discount
- A detail page for every deal (hash route `#/deal/<id>`) with full evidence,
  the store link, and the same product at other stores when it is listed twice
- A deal counter and a "checked 27 Nov 2026" stamp on every view, plus total savings

## How it is built

Vanilla JavaScript, no framework, no external fonts or images — system fonts
and pure CSS in an original dark "midnight sale" theme. All data is baked into
`app/`; the site makes no network requests at runtime (store links are plain
`<a href>` links).

- `app/index.html` — the page shell
- `app/style.css` — the midnight theme
- `app/app.js` — list rendering, search, filters, sort, hash routing
- `app/deals.js` — the 68 checked deals
- `app/detail.js` — the per-deal detail view
- `main.ts` — copies `app/` + `screenshots/` to the output dir and writes
  `dossier.json` with the kit's `vendor/makefun-frontend.ts`

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

Or open `app/index.html` from any static server. To build the hand-in:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## How prices were checked

Each deal was read on 27 Nov 2026 from the store or a deals source naming the
store; the per-deal source is shown on its card. The full research log lives
outside this repo. Prices change — check the store before you buy.
