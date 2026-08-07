# News feed — spec (phase 7, not built)

**Status: specified, not implemented.** Sequenced after the core app, per instruction.
Nothing in this document exists in the codebase yet.

**Job:** a news page carrying Indonesian import/export news, refreshed every 12 hours,
with at least one Bahasa Indonesia item and one English item per refresh.

---

## The one decision that shapes everything else

**Headlines and links, never article text.**

Ingest via RSS/Atom where it exists and store only: headline, the source's own summary
truncated to ~200 characters, source name, canonical URL, publication timestamp, language.
Every row links out to the publisher. No images, no full text, no paraphrased rewrites.

Three reasons, in order of weight:

1. **Copyright.** Republishing article bodies from Kompas or Reuters is infringement.
   Headline-plus-link-plus-attribution is what aggregators do and is defensible; a
   cached full-text mirror is not. Get counsel before launch — see the legal note below.
2. **No image licensing problem**, and no R2 storage cost, because there are no images.
3. It is **less work** and fails more gracefully. A feed parser is fifty lines; a
   resilient full-text extractor is a permanent maintenance burden.

This also decides the page design: a ruled manifest-style table, not a card grid with
hero images. The card grid is the generic move _and_ the one that needs pictures we
have no right to use.

---

## Sources

**Verify each feed endpoint before writing the adapter.** Publishers move and retire
feeds, and this environment's network policy blocked outbound requests, so the URLs below
are candidates rather than confirmed endpoints. On a machine with open egress:

```sh
for u in <candidate urls>; do
  printf '%s → %s\n' "$u" \
    "$(curl -sL -o /tmp/f.xml -w '%{http_code}' -m 20 "$u" && grep -c '<item\|<entry' /tmp/f.xml)"
done
```

Order matters: the job walks sources by priority until each language has a fresh item.

**Bahasa Indonesia** — state and statistical sources first. They are the most reputable
for trade specifics, the most permissive about reuse, and the least likely to be behind
a paywall.

| Priority | Source                                                                 | Why                                                                       |
| -------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1        | **Antara** (ekonomi)                                                   | State news agency, reliably has a feed, permissive                        |
| 2        | **Kemendag** press releases                                            | Primary source for trade policy, quotas, LARTAS changes                   |
| 3        | **Bea Cukai** announcements                                            | Customs procedure changes — directly actionable for users                 |
| 4        | **BPS** statistics releases                                            | Monthly export/import figures; the single most-cited number in the sector |
| 5        | Bisnis.com (ekonomi), Kontan, CNBC Indonesia, Katadata, Kompas Ekonomi | Commercial depth, commodity prices                                        |

**English**

| Priority | Source                                        | Why                                                                   |
| -------- | --------------------------------------------- | --------------------------------------------------------------------- |
| 1        | **Antara English** (economics)                | Same agency, already translated — the cheapest reliable EN guarantee  |
| 2        | **Jakarta Globe** / **Jakarta Post** business | Written for the foreign-buyer audience, which is half the demand side |
| 3        | Tempo English business                        | Reasonable third                                                      |
| 4        | Reuters / Nikkei Asia Indonesia coverage      | Verify licensing terms before adding — most restrictive of the set    |

Sources live in a `news_sources` table, not in code, so adding one is a row and a
priority number. An adapter is only needed when a source has no feed.

**No feed?** A narrow HTML adapter that reads only the section listing page for headline,
link and timestamp. It must obey `robots.txt`, make one request per run, identify itself
(`NiagaBot/1.0 (+https://niaga.example/bot)`), and never fetch article pages.

---

## Cadence and the "at least one of each" guarantee

pg-boss schedule, `0 6,18 * * *`, `tz: 'Asia/Jakarta'` — exactly twelve hours apart,
landing before the Jakarta business day and after it closes. pg-boss stores the schedule
in Postgres, so it survives restarts and fires on one machine only. No new
infrastructure: same reason there is no RabbitMQ and no Redis-backed queue.

The quota is a real constraint, so it needs a real mechanism rather than hope:

1. Walk sources by priority for the target language.
2. **Fresh** = published within 36 hours, passes the relevance filter, and not already
   stored (dedupe below).
3. Stop as soon as that language has ≥1 fresh item. Keep up to 8 per language per run.
4. If every source is exhausted with 0 items, **widen the window to 7 days** and take the
   newest unseen item.
5. If still 0, write a `news_fetch_runs` row with `status = 'short'` and the language that
   came up empty.

Step 5 is the important one. The quota is never met by re-showing an old item as new or by
generating filler. A thin run is recorded and visible in the admin queue — the same
principle as showing the red verification lane instead of hiding it.

**Dedupe** on `url_hash` (SHA-256 of the canonical URL with tracking params stripped) as a
unique index, plus a trigram similarity check on the title against the last 7 days.
Syndicated wire copy appears on four sites with four URLs and near-identical headlines;
the URL index alone will not catch it.

---

## Relevance filter

Economy news is not trade news. Keyword scoring on title + summary, threshold to admit:

- **ID:** ekspor, impor, ekspor-impor, bea cukai, kepabeanan, bea keluar, tarif, kuota,
  lartas, larangan terbatas, incoterm, kontainer, peti kemas, pelabuhan, komoditas,
  neraca dagang, devisa hasil ekspor, plus the launch vertical's commodities (kopi, kakao,
  rempah, kelapa, rumput laut, CPO).
- **EN:** export, import, customs, tariff, quota, trade balance, shipment, container,
  freight, port, commodity, plus the same commodity names.

Store the matched terms on the row. The page can then show _why_ an item is there, and a
bad filter is debuggable instead of mysterious.

Keyword-first, deliberately: it is free, inspectable, and adds no vendor. An LLM
classifier is a later upgrade if precision turns out to be poor — measure before adding.

---

## Schema

```
news_sources    id, name, homepage_url, feed_url, kind ('rss'|'atom'|'html'),
                language ('id'|'en'), priority int, enabled boolean,
                consecutive_failures int, disabled_at, last_fetched_at

news_items      id, source_id, language,
                title, summary,            -- summary capped at 240 chars
                url, url_hash,             -- unique index on url_hash
                published_at, fetched_at,
                matched_terms text[],      -- why the filter admitted it
                hidden boolean default false,   -- takedown switch
                search_vector tsvector GENERATED

news_fetch_runs id, started_at, finished_at,
                status ('ok'|'short'|'failed'),
                items_by_language jsonb,   -- {"id": 3, "en": 1}
                notes
```

Indexes: `(language, published_at DESC, id DESC)` for the keyset feed, GIN on
`search_vector`, unique on `url_hash`.

**Free-tier impact:** ~4–16 items per day, so ~2–6k rows a year at a few hundred bytes
each. Invisible against Neon's 0.5 GB. No images, so no R2 cost. One extra pg-boss
schedule.

---

## API

```
GET /v1/news?lang=id|en|all&q=&cursor=&limit=
```

Keyset paginated on `(published_at DESC, id DESC)`, same cursor helpers as listings.
Contract in `packages/contracts/src/news.ts`.

This is the **only** endpoint in the product that is safe to cache hard —
`Cache-Control: public, max-age=600` — because it is identical for every visitor. Worth
doing: it keeps the Fly.io machine asleep for what will be a popular page.

---

## The page

Route `/kabar` (Bahasa is the default locale; the path is part of the voice).

Design reuses the vocabulary already built rather than inventing a second one:

- A **ruled table**, like the manifest board — mono timestamp, stencilled source chip, an
  `ID` / `EN` language tag, headline in body face, summary in `text-ink-muted`.
- **Grouped by day**, with the date as a stencilled section rule.
- Rows link out: `target="_blank" rel="noopener noreferrer nofollow"`, with an external
  arrow glyph so it is obvious the click leaves the site.
- Filter chips for `Semua / ID / EN` in the URL as search params, typed by the contract —
  same pattern as the browse page, so a filtered news view is a shareable link.
- **No images. No infinite scroll.** A "muat lebih banyak" button using the cursor.
- Empty state names the next refresh time rather than apologising.
- Attribution is not decorative: source name is always visible, never truncated.

A three-row strip of the latest trade news belongs on the landing page below the lane
legend — but only once the page itself exists and is reliably populated.

---

## Politeness and failure

- Obey `robots.txt` per source; cache it for 24 hours.
- One request per source per run. Never fetch article pages.
- Identify the bot in the User-Agent with a contact URL.
- `If-Modified-Since` / `ETag` on every feed request.
- Exponential backoff on 429 and 5xx; a run that fails one source continues to the next.
- `consecutive_failures >= 6` (three days) sets `disabled_at` and surfaces in the admin
  queue. A dead source should not fail the run forever in silence.

---

## Legal — get counsel, this is not advice

- **Headline + link + attribution** is standard aggregator practice, but publisher ToS
  vary and some explicitly forbid automated access. Check each source's terms before
  enabling it, and keep the enable switch per source so one objection is one row.
- Honour takedown requests through the `hidden` flag, and log the action in `audit_log`.
- Do not let the news page imply endorsement, and do not let summaries become customs or
  legal guidance — the existing "informational, not customs advice" line should extend to
  this page.
- Reuters, Nikkei and Bloomberg have licensing programmes and are the ones most likely to
  object. Treat them as opt-in after a terms review, not as launch sources.

---

## Why phase 7 and not sooner

News does not solve the cold-start problem — verified listings do. A perfect news page
with no inventory is a blog. But it is cheap, it gives a reason to return between
inquiries, and Antara alone satisfies the bilingual quota, so it is a reasonable first
thing to build once the trust layer is live.

Estimated scope once started: one day for the ingest job and schema, one day for the page.
