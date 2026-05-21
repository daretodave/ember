# Skill: critique

> **External observer.** Visit the live site as a first-time
> reader, take notes, self-assess, append durable findings to
> `plan/CRITIQUE.md`. `/iterate` reads CRITIQUE.md as a finding
> source — that's the **address loop** half.
>
> **Rate-limited** by `/march` (≥12 commits + ≥24h spacing,
> green-deploy required). Cap of 6 filed findings per pass.

## 1. Purpose

The autonomous loop is good at shipping what it was told to
ship. It's bad at noticing when the shipped result doesn't
read well as a real reader would experience it.

`/critique` is the corrective lens.

## 2. Invocation

```
/critique                    # full pass — see auth handling below
/critique <url>              # focused pass on one URL
/critique mobile             # 375×800 only
/critique desktop            # 1280×800 only
/critique anonymous          # public/anonymous pass only (skip auth)
/critique authenticated      # logged-in pass only (requires Auth: != none)
```

**Auth handling.** `plan/bearings.md` declares
`Auth: session-cookie`. Default `/critique` runs **two** passes
in sequence:

- **Anonymous pass** — no session. Walks the public URLs (`/`,
  `/signin`, any `/u/<username>` profile) as a first-time
  visitor.
- **Authenticated pass** — walks the app URLs (`/today`,
  `/log`, `/settings`) as the signed-in critique bot. The
  session is a Supabase cookie minted by
  `scripts/mint-cookie.mjs` (Step 0) and attached by the
  Playwright walk (`scripts/critique-walk.mjs`).

Each pass produces its own `reader` invocation so the bot's
session never pollutes the anonymous walk. Argument
`anonymous` / `authenticated` runs only that pass.

When invoked from `/march`, conditions are pre-checked.

## 3. The page set (default full pass)

Pick **representative**, not exhaustive. The smoke walker
already covers every URL; critique is for *quality*.

### Anonymous page set (always)

| Page | Why critique it |
|---|---|
| `/` (home) | First impression. The fold matters. |
| `/<canonical-detail>/<latest>` | Canonical reading experience. |
| `/<pillar-or-category>` | Pillar voice + card cascade. |
| `/<signature-feature>` | Project's most distinctive surface (when public). |
| `/<list-or-index>` | Faceted browse path. |

### Authenticated page set (only when `Auth: != none`)

| Page | Why critique it |
|---|---|
| `/<post-login-landing>` (typically `/dashboard`, `/app`, or `/home`) | What the user actually sees first. |
| `/<canonical-detail-in-app>/<latest>` | The in-app version of the reading/working experience. |
| `/<settings>` | Where users diagnose problems. Reflects voice + clarity. |
| `/<signature-feature>` (logged-in version) | The product's most distinctive surface for real users. |
| `/<empty-or-onboarding-state>` | Often where the experience breaks down. |

The bot user's data shape matters here — see
`nexus/customization/auth-aware-critique.md` "What does your
bot user look like?". Curate it once so the authenticated
pass walks through representative state, not an empty
account.

Skip pages that don't exist yet. Note in pass log.

## 4. Delegate to `reader`

The `reader` sub-agent at `.claude/agents/reader.md` is the
fresh-eyes observer. **Always delegate the assessment.** Reasons:

- Fresh sub-agent context = genuine first-time-reader perspective.
- Output is structured JSON; easy to filter and file.

**Tooling path.** Locally, `reader` uses Path A (Chrome MCP) for
the anonymous pass. **The authenticated pass — and every pass in
the cloud loop, where there is no Chrome MCP — uses Path A2: the
skill runs `scripts/critique-walk.mjs` and hands the resulting
`captures[]` + mechanical `findings[]` to `reader` for the
qualitative read.** Path A2 walks in a fresh isolated browser
context, so the shared-profile false-finding class that kept
`/critique` local-only cannot occur — that is what makes a cloud
critique pass trustworthy. Path B (WebFetch) is the last resort.

On Path A2, run the walk once per mode, then spawn `reader` with
its JSON output:

```bash
node scripts/critique-walk.mjs --mode anonymous \
  --base https://ember-rust-sigma.vercel.app --urls /,/signin
node scripts/critique-walk.mjs --mode authenticated \
  --base https://ember-rust-sigma.vercel.app --urls /today,/log,/settings
```

Pass `reader`:
- The URL list.
- The **pass mode** (`anonymous` or `authenticated`).
- Voice cue from `plan/bearings.md`.
- Current `plan/CRITIQUE.md` Done section (so it doesn't
  re-surface addressed findings).
- Focus areas from invocation argument.

It returns a JSON array of findings, each carrying
`auth_state`. When the default invocation runs both passes,
spawn `reader` **twice** (once per mode) and concatenate
results before §6 (self-assessment + filing).

Findings tagged `auth_state: "auth-failed"` are filed as
`[needs-user-call]` in `plan/CRITIQUE.md`'s Pending block —
not scored as product bugs. The user resolves the auth
config (refresh the session cookie, fix the login selectors,
etc.) and the next pass re-runs.

## 5. The procedure

### Step 0 — Pre-flight

```bash
git pull --ff-only
pnpm deploy:check
node scripts/mint-cookie.mjs    # mint/refresh the critique bot session
```

If no green deploy: defer. Write a one-line entry to CRITIQUE.md
"deferred at <date>: no green deploy" and exit 0. **Don't commit
on no-ops.**

If the mint fails (Supabase unreachable, admin API rejected, the
bot user banned): file a single `[needs-user-call]` row in
CRITIQUE.md describing the failure and run **only the anonymous
pass** this tick. Don't block the whole critique on auth — the
anonymous pass is still worth filing.

### Step 1 — Build the page set

Default §3. Adjust based on argument, phase progress (skip
non-existent pages), recent shipping focus.

### Step 2 — Spawn `reader`

```
Agent({
  subagent_type: "reader",
  prompt: "Visit these URLs of https://ember-rust-sigma.vercel.app: [list].
           Voice cue from plan/bearings.md: <quote>.
           Already-addressed (skip): <Done section>.
           Focus: <from arg or 'general'>.
           Return ≤ 8 findings as JSON per your output spec."
})
```

Wait for return.

### Step 3 — Self-assess

Reader returns observations; you decide which deserve to land.
For each:

1. **Valid?** Can evidence be re-verified? Drop session-specific
   artifacts.
2. **Actionable?** Can a future `/iterate` tick fix with
   resources at hand? If not, file as `[needs-user-call]`.
3. **Duplicate?** If CRITIQUE.md has an open row for this exact
   issue, drop new + bump older's severity.
4. **Severity match impact?** Re-rate if needed.
5. **Suggested fix sane?** If contradicts bearings or contracts,
   replace with compatible fix.

After assessment, **3–6 findings**, not 8.

### Step 4 — Append to `plan/CRITIQUE.md`

```markdown
# Critique log

> Last pass: <ISO date> at commit <sha>
> Pass count: <N>

## Pending

### [HIGH] /<url> — <one-line>
- pass: <N> (commit <sha>)
- viewport: desktop | mobile
- category: <visual | comprehension | navigation | voice | mobile | performance | a11y | seo>
- observation: <what was seen>
- evidence: <screenshot region | quoted text | console msg>
- suggested fix: <one-line concrete change>
- source: browser | web-fetch

## Done

### [x] [MED] <url> — ... (pass <N>; addressed at <sha>)
```

Update metadata header.

### Step 5 — Commit + push

```bash
git add plan/CRITIQUE.md
git commit -m "$(cat <<'EOF'
critique: pass <N> — <K> findings (<H> high, <M> medium, <L> low)

Visited: <list of URLs>.
Findings filed to plan/CRITIQUE.md Pending.
Address loop: /iterate will pick the highest-scoring finding.
EOF
)"
git push origin main
```

If **zero** findings (rare): still update metadata, commit
`critique: pass <N> — no findings`. Pass counter is the signal
`/march` reads.

### Step 6 — Confirm deploy

```bash
pnpm deploy:check
```

### Step 7 — Done

Return 3-line summary.

## 6. Hard rules

1. **Never modify code, content, or data.** Findings only.
2. **Delegate the assessment to `reader`.** On Path A `reader`
   makes the visit; on Path A2 the skill runs the walk and
   `reader` assesses the captures. Never form findings in
   main-agent context without `reader`.
3. **Self-assess after reader returns.** Don't file raw
   observations.
4. **Cap at 6 filed findings per pass.** 8 is reader's input
   cap; 6 is your output cap.
5. **Never duplicate Pending or Done entries.**
6. **One commit per pass.**
7. **No emojis. No `Co-Authored-By:`.**

## 7. Failure modes

1. **No green deploy.** Defer.
2. **`reader` returns malformed output.** Re-spawn once with
   stricter format. If fails again, write single finding "reader
   sub-agent malfunction at pass <N>", commit, exit 1.
3. **No URLs in page set** (very early phases). Defer.
4. **`git pull` divergence.**

## 8. Address loop contract (how `/iterate` consumes findings)

`plan/CRITIQUE.md` `## Pending` is `/iterate`'s queue:
- Each finding has severity + ease (from suggested-fix
  complexity).
- `/iterate` §4 maps to category `external-critique`:
  HIGH→8–10, MED→5–7, LOW→2–4 impact.
- When `/iterate` ships a fix, moves row Pending → Done with
  `[x]` + commit hash.

Critique findings **compete fairly** with other audit sources.

## 9. When `/march` invokes `/critique`

`/march` reads metadata header at top of `plan/CRITIQUE.md`:

```
> Last pass: <ISO-date> at commit <sha>
> Pass count: <N>
```

Conditions to dispatch:

1. **At least 12 commits** after `Last pass` commit, OR
   `Last pass` more than **24 hours** ago, OR `Last pass` is
   "never" and at least one page-family phase has shipped.
2. `pnpm deploy:check` shows green.
3. No pending HIGH critique already queued for iterate.

If all three: `/march` calls `/critique` for that tick.
