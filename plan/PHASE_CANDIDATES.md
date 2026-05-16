# Ember — phase candidates

> Last pass: 2026-05-16 at commit af52916
> Pass count: 1

Candidates proposed by `/expand`. Promotion to `plan/steps/01_build_plan.md`
happens only via local `/oversight` — never from the cloud loop.

## Pending

### [ ] [score 8.0] Entry editing — allow users to edit past entries from /log/[date]

- proposed: 2026-05-16, expand pass 1
- source signals:
  - design/INDEX.md: "there is no edit affordance on this page (a v1.5 stretch per spec)"
  - plan/bearings.md standing decisions: "edit is a v1.5 stretch"
  - phase 6 brief: edit explicitly scoped out with "v1.5 stretch" label
  - commit pattern: 3 independent references pointing at the same gap
- rationale: the app currently writes entries but offers no way to correct them. Every returning user who writes a typo or wants to expand their response hits a hard wall. Three independent references in spec, design, and plan all flag this as the deferred v1.5 feature — real demand from the product's natural use case, not model imagination.
- proposed scope: 1 phase — edit endpoint + UI on /log/[date] (textarea pre-filled, save replaces content, timestamp updated)
- estimated phases: 1
- conflicts: none with spec or URL contract; the edit surface is on an existing route

### [ ] [score 7.0] Brand assets — favicon, OG image, social card

- proposed: 2026-05-16, expand pass 1
- source signals:
  - design/CLAUDE.md: "Favicon, OG image, social cards. These are the demand-pull asset layer. A future /ship-asset slice renders them against the mosaic primitive, but they don't ship in v1."
  - design/INDEX.md: references the brander sub-agent approach for a future slice
  - every shared ember URL currently surfaces a blank/generic preview card
- rationale: two independent design-folder references name this explicitly as deferred-from-v1 demand-pull work. A shared ember link shows a blank preview on every social/messaging platform — the brand mark that took a full phase to commission is invisible at the key moment. The brander sub-agent is purpose-built for this; the work is bounded.
- proposed scope: 1 phase — favicon (16/32/48px), OG image (1200×630, mosaic tile grid on cream), Twitter card, manifest.json entry
- estimated phases: 1
- conflicts: none — design/CLAUDE.md explicitly scopes this as a future asset layer

### [ ] [score 5.0] Data export — download entries as JSON or Markdown

- proposed: 2026-05-16, expand pass 1
- source signals:
  - spec.md: "Exportable data (defer to v1.5)"
- rationale: spec named this as deferred to v1.5 from the outset. Users who have been practicing for weeks have no mechanism to back up or port their writing. Single signal source (spec), but the signal is explicit and user-protective. Scores below the other two because it serves a subset of users and the spec deferred it for good reason (v1 stability first).
- proposed scope: 1 phase — GET /api/export route returning JSON (entries + prompts + dates); optional ?format=md for Markdown; settings page "export your data" link
- estimated phases: 1
- conflicts: none with spec or URL contract (new route under /api/)

## Considered (below threshold)

- **Entry search** — spec says "Search (defer)"; single signal, moderate complexity (-1), estimated 1–2 phases. Score ~4. Revisit if AUDIT or user issues surface demand.
- **Magic-link email templates** — design/CLAUDE.md notes "default magic-link email is fine for v1; templated email lands in a later phase if it lands at all." Single signal, polish-only, score ~4. Revisit if brand impression on auth flow becomes a critique finding.
