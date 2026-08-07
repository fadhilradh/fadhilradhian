# Decisions — the five open questions, answered

You said to use my own judgement, so these are locked. Each one is reversible at a stated
cost; where the cost is high I've said so.

## 1. Vertical — **agri-commodities first**

Coffee, cocoa, spices, coconut derivatives, seaweed. Seed data, HS-code subset (BTKI
chapters 07/08/09/12/15/18/21), certifications list (HACCP, ISO 22000, Halal MUI, Organic,
Rainforest Alliance, Fair Trade) and the browse facets are all cut to this vertical.

The _schema_ stays horizontal — `hs_codes` covers all chapters and `categories` is a tree —
so widening is a seed-data and copy change, not a migration. Only the facet defaults and
the landing copy are vertical-specific.

Cost to reverse: low.

## 2. Demand side — **foreign buyers are a launch target**

Bahasa Indonesia is the fallback locale and the source of truth for content;
English is a first-class toggle, not an afterthought. On a first visit the
browser's own language preference wins (an `en-*` browser lands in English), and
an explicit choice is remembered from then on. Consequences, taken now because
they are expensive later:

- Bilingual columns (`*_id` / `*_en`) on HS codes, categories, company about, listing title.
- `locale` on `users`, `Accept-Language` respected on first request, persisted choice wins.
- Currency stored per listing with `IDR | USD`, never converted at rest.
- `search_vector` built with the `simple` dictionary plus `unaccent`, so it works for both
  languages in one index rather than needing per-language configs.

What I deliberately **deferred**: SEO. This is a Vite SPA, so listing pages don't prerender.
That's the right trade for phase 0–4 — buyers arrive from WhatsApp links and direct outreach,
not Google, until there's inventory worth indexing. When it matters, the fix is Netlify
prerendering on `/listing/*` or Vike, not a Next.js migration.

Cost to reverse the bilingual decision: high — that's why it's in phase 0.

## 3. Verification — **manual document review at MVP**

No OSS/NIB API integration. Reasons: the OSS integration path requires an agreement you
won't get pre-revenue, the data model doesn't change either way, and at launch volume the
review queue is a person reading ten documents a week.

What phase 0 ships: `companies.verification_lane`, `company_documents` with a private-bucket
key, `verified_at` / `verified_by`, and an `audit_log` row on every lane change. Reviewing
happens in SQL until phase 5's admin UI. `verification_source` is on the table already
(`'manual' | 'oss_api'`) so an integration later is additive.

Cost to reverse: low.

## 4. Messaging — **in-app only, with a gated WhatsApp handoff**

In-app threads are the record. After an inquiry is moved to `accepted`, each side's phone
number becomes visible on the thread and a `wa.me` deep link appears — because that is how
Indonesian trade actually runs, and pretending otherwise gets you an unused inbox.

The compromise that keeps your data: the _inquiry, the acceptance, and the timestamps_ are
on-platform even if the conversation leaves. That's enough for future take-rate attribution
and for dispute handling. Contact details are regex-stripped from listing bodies and from
pre-acceptance messages, so the handoff can't be used to skip the gate.

Cost to reverse: low — it's a feature flag on one route.

## 5. Design — **port-and-paperwork, building the tokens**

Locked as specified. Grey-green tally-sheet surface, customs-lane semantics, Archivo
Expanded / IBM Plex Sans / IBM Plex Mono, 2px radii, hairlines instead of shadows, the
manifest board as the hero, the stencilled shipping-mark block on cards. No alternative
direction explored — phase 0 exists so you can look at the real thing and say no.

---

## One change to the plan you didn't ask about

**Frontend deploys to Netlify, not Cloudflare Pages** (per your instruction; not Vercel).
`niaga/netlify.toml` is the source of truth. Everything else in the plan's deployment
section stands: API and worker to Fly.io `sin`, database on Neon Singapore.
