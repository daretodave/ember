# External-observer findings — Ember

> Last pass: 2026-05-27 at commit 21ebca6
> Pass count: 17

> Written by `/critique` after walking the live site as a
> fresh-eyes visitor. Drained by `/iterate`.

## Pending

### [LOW] / — product description contains embedded second-person imperative clause
- pass: 17 (commit 21ebca6)
- viewport: both
- category: voice
- observation: the introductory paragraph reads "you write a few sentences in response, mark the task done if you did it, and move on." — the clause "mark the task done" is an imperative verb form embedded in what is otherwise a descriptive series using "you write... and move on." the voice guide prohibits second-person imperative copy outside quoted text. a first-time reader could receive this as a directive rather than a description.
- evidence: body text: "one small prompt and one tiny task each morning. you write a few sentences in response, mark the task done if you did it, and move on." — "mark the task done" uses imperative mood mid-sentence.
- suggested fix: reframe as fully descriptive: "one small prompt and one tiny task each morning. a few sentences in response, the task marked if it happened, and the day continues." — removes the imperative verb while preserving the meaning.
- source: browser

### [LOW] / — "entering an email address for the first time creates an account" is ambiguous for returning visitors
- pass: 17 (commit 21ebca6)
- viewport: both
- category: comprehension
- observation: the CTA footer reads "entering an email address for the first time creates an account. the link arrives once." a returning visitor who already has an account reads "for the first time" and may worry whether entering their existing email again creates a duplicate account rather than sending a sign-in link. the copy addresses the new-user case but leaves the returning-user case unanswered.
- evidence: footer CTA: "today's prompt is waiting. entering an email address for the first time creates an account. the link arrives once. no password is set. no other mail is sent." — no copy disambiguates behavior for known email addresses.
- suggested fix: split into two cases or reframe without the conditional qualifier: "a known address receives a sign-in link. a new address creates an account." — covers both visitor types in the same declarative register.
- source: browser

### [LOW] /signin — expiry notice appears in the pre-submission state
- pass: 17 (commit 21ebca6)
- viewport: both
- category: comprehension
- observation: "sign-in links expire after 24 hours." appears in the page footer before any link has been sent. a first-time visitor completing the email form reads this as an unprompted time-pressure signal rather than post-send guidance. the information is accurate but its position implies urgency before anything has happened.
- evidence: page body text (pre-submission state): "sign in. / email / send the link / a sign-in link is sent to this address. no password. no other mail. / ember / sign-in links expire after 24 hours." — the expiry line is always visible, not conditional on link dispatch.
- suggested fix: move the expiry copy into the post-submission confirmation view (shown after the link is sent), so it reads as context for a link already in transit rather than a pre-emptive warning.
- source: browser

### [LOW] /today — task-done button has no hover tooltip while adjacent controls do
- pass: 17 (commit 21ebca6)
- viewport: desktop
- category: comprehension
- observation: the publish toggle carries title="when published, this entry appears on your public profile." and the focus button carries title="enters a distraction-free writing view." — both complete sentences with periods, per the voice guide. the task-done button is the only control in the group without a title attribute; a sighted user hovering over it receives no tooltip.
- evidence: /today controls row: "publish / focus / save" alongside the task-done button — the task-done button's visible label changes state (done / not done) but carries no hover description consistent with the adjacent controls.
- suggested fix: add title="marks today's tiny task as done." (and title="marks today's tiny task as not done." when already marked) to the task-done button in TodayEntry.tsx, consistent with the voice guide requirement for complete-sentence tooltip copy.
- source: browser

### [x] [MED] / — "sign in" CTA gives no signal that it is also the account-creation path
- pass: 16 (commit 27718e9)
- viewport: both
- category: comprehension
- observation: the landing page CTA is labelled "sign in" with no surrounding copy acknowledging that ember uses a single magic-link flow for both new and returning visitors. a first-time visitor who has never used the product sees "sign in" and may assume an account already exists — there is no "create account", "get started", or onboarding signal to indicate that entering an email for the first time is how an account is created.
- evidence: footer CTA text: "today's prompt is waiting. the link arrives once. no password is set. no other mail is sent. sign in" — "the link arrives once" presupposes a prior send that has not occurred for a first-time visitor.
- suggested fix: add a single declarative line near the CTA explaining the combined flow, e.g. "entering your email for the first time creates your account." — no second-person imperative required.
- source: browser
- resolution: added "entering an email address for the first time creates an account." before the link-arrival trust signal in the CTA copy in src/app/page.tsx. Shipped at 631bd72.

### [LOW] / — "no password is set" phrasing differs from sign-in page's "no password"
- pass: 16 (commit 27718e9)
- viewport: both
- category: voice
- observation: the home page footer CTA uses "no password is set. no other mail is sent." while the sign-in page uses the shorter "no password. no other mail." for the same reassurance. the passive-voice "is set" on the home page introduces a slightly different register and a word that is absent on the sign-in page, creating a minor cross-page inconsistency in how the passwordless model is described.
- evidence: home footer: "no password is set. no other mail is sent." — /signin helper: "no password. no other mail."
- suggested fix: normalise the home page footer to "no password. no other mail is sent." or adopt the sign-in page's shorter form throughout.
- source: browser

### [x] [LOW] /today — textarea placeholder "take your time." is second-person imperative
- pass: 16 (commit 27718e9)
- viewport: both
- category: voice
- observation: both the main textarea and the focus-overlay textarea carry the placeholder text "take your time." — a second-person imperative instruction. the voice guide explicitly prohibits second-person imperative copy. the placeholder is visible to any user whose textarea is empty and focused.
- evidence: src/app/today/TodayEntry.tsx: placeholder="take your time." appears on both the main-view textarea and the focus-overlay textarea.
- suggested fix: replace with an impersonal declarative such as "there is no rush." or remove the placeholder entirely and let the "your response" label above the field carry the framing.
- source: browser
- resolution: changed placeholder to "there is no rush." on both main and focus-overlay textareas in src/app/today/TodayEntry.tsx. Shipped at ddafc86.

### [LOW] /today — focus-mode overlay renders aria-modal="false" when inactive
- pass: 16 (commit 27718e9)
- viewport: both
- category: a11y
- observation: the focus-mode overlay uses aria-modal={isFocus}, which serialises to aria-modal="false" when focus mode is inactive. the ARIA spec does not define a false state for aria-modal — the attribute should be absent when the dialog is not modal, not set to "false". the overlay is simultaneously aria-hidden="true" when inactive so practical impact on screen readers is limited, but the pattern diverges from the spec and may trigger warnings in axe-core.
- evidence: src/app/today/TodayEntry.tsx line 204: aria-modal={isFocus} — when isFocus is false this produces aria-modal="false" on the div.
- suggested fix: change to aria-modal={isFocus || undefined} so the attribute is absent rather than explicitly false when focus mode is not active.
- source: browser

### [x] [LOW] /today — publish toggle description is an unconditional statement when toggle is off
- pass: 15 (commit 286ecad)
- viewport: both
- category: comprehension
- observation: the publish toggle description reads "this entry will appear on your public profile." as a static, unconditional statement. when the toggle is unchecked (the default state), this reads as a factual claim — the entry will appear — rather than a description of what enabling the toggle does. the mismatch between the off-state of the control and the unconditional phrasing creates a small but genuine comprehension gap.
- evidence: body text: "publish\nthis entry will appear on your public profile." — the same static description appears in both the main view and the focus-mode overlay regardless of toggle state.
- suggested fix: reframe to a conditional: "when published, this entry appears on your public profile." — aligns the description with the toggle's role as a state-change control rather than a guarantee.
- source: browser
- resolution: changed title and aria-describedby span text to "when published, this entry appears on your public profile." in both main and focus-mode overlay copies. Shipped at 3e54d90.

### [x] [LOW] /signin — reassurance line uses direct second-person address and a sentence fragment
- pass: 14 (commit e748b34)
- viewport: both
- category: voice
- observation: the reassurance line reads "we email you a sign-in link. no password, no spam." — "we email you" is first-person plural plus direct second-person address, a register shift from the impersonal constructions used throughout the rest of the site ("the link arrives once. no password is set. no other mail is sent."). the trailing "no password, no spam." is also a fragment rather than a complete sentence.
- evidence: src/app/signin/page.tsx line 91: `we email you a sign-in link. <em>no password, no spam.</em>` — compare landing page footer, which uses impersonal declarative sentences throughout.
- suggested fix: reframe as impersonal declarative sentences: "a sign-in link is sent to this address. no password. no other mail." — removes direct address and converts the fragment.
- source: browser
- resolution: changed to "a sign-in link is sent to this address. no password. no other mail." in src/app/signin/page.tsx. Shipped at 6397375.

### [LOW] /signin — post-submission confirmation uses second-person imperative
- pass: 14 (commit e748b34)
- viewport: both
- category: voice
- observation: the confirmation state (after the link is sent) reads "check your email. a sign-in link is on its way." — "check your email" is a second-person imperative instruction, which the voice guide explicitly prohibits. the rest of the sign-in page avoids direct address.
- evidence: src/app/signin/page.tsx line 55: `check your email. a sign-in link is on its way.` — rendered when state === 'sent'.
- suggested fix: reframe as an observation: "a sign-in link is on its way." — removes the imperative while preserving the useful information.
- source: browser

### [LOW] /signin — email input placeholder uses second-person example address
- pass: 14 (commit e748b34)
- viewport: both
- category: voice
- observation: the email input carries the placeholder "you@somewhere.com" — a second-person illustrative address. the display name placeholder on /settings ("how you appear on your public profile") is already a pending finding; this is a separate instance of the same pattern on a different page.
- evidence: src/app/signin/page.tsx line 69: `placeholder="you@somewhere.com"` — the only second-person reference on the form outside the reassurance line.
- suggested fix: change to a neutral placeholder such as "email address" or remove the placeholder entirely, relying on the visible "email" label above the field.
- source: browser

### [LOW] / — OG image alt attribute carries brand name only, no descriptive text
- pass: 14 (commit e748b34)
- viewport: both
- category: seo
- observation: the root layout sets the OG image alt to the bare string "ember" with no descriptive phrase. if the image fails to render in a social card preview or is read by an assistive tool, the alt conveys only the brand name and nothing about the page content.
- evidence: src/app/layout.tsx line 48: `{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember' }` — no descriptive phrase accompanies the brand name.
- suggested fix: expand the alt to match the page description: "ember — a daily writing ritual" so the OG image carries the same context as the page title.
- source: browser

### [LOW] /settings — public username hint uses second-person imperative "leave blank"
- pass: 14 (commit e748b34)
- viewport: both
- category: voice
- observation: the public username hint reads "leave blank to stay private." — "leave blank" is a second-person imperative instruction. the voice guide prohibits second-person imperative copy. this is a distinct instance from the pending display name placeholder finding, which covers a different field on the same page.
- evidence: src/app/settings/SettingsForm.tsx line 156: `your public profile lives at /u/your-handle. leave blank to stay private.`
- suggested fix: reframe as a declarative: "an empty field keeps your profile private." — removes the imperative and converts to the preferred observational register.
- source: browser

### [LOW] /settings — "@" username prefix conflicts with "/u/" URL structure
- pass: 14 (commit e748b34)
- viewport: both
- category: comprehension
- observation: the public username input is prefixed with "@", which signals a social-media handle convention. ember's actual public URL pattern is "/u/handle", not "@handle". the hint immediately below reads "your public profile lives at /u/your-handle." — the "@" affordance and the URL format use different namespacing signals, and a user who copies "@handle" as their profile URL would be wrong.
- evidence: src/app/settings/SettingsForm.tsx line 159: `<span className={styles.usernamePrefix}>@</span>` — followed by hint at line 156 citing "/u/your-handle".
- suggested fix: replace the "@" prefix with "/u/" to match the actual URL pattern, or remove the prefix entirely and let the hint carry the format context.
- source: browser

### [x] [LOW] /today — visible "done" label is ambiguous next to "save"
- pass: 13 (commit 4f08c21)
- viewport: both
- category: comprehension
- observation: the day-strip area renders a "done" button adjacent to the "save" button. the visible label is bare "done" with no surrounding copy indicating it marks the tiny task complete rather than finalising the entry or closing the page. the aria-label is correct for screen readers but sighted users read only "done".
- evidence: body text: "save\ndone\nyour last seven days" — "done" sits between the entry controls and the day strip with no visible label explaining its referent.
- suggested fix: change the visible button text to "mark done" or add a short adjacent label such as "tiny task:" directly above the button so its scope is unambiguous.
- source: browser
- resolution: changed focus mode exit button visible text from "done" to "done writing" in src/app/today/TodayEntry.tsx. Shipped at 25e38a7.

### [LOW] /today — publish toggle active with no hint that a public username is required
- pass: 13 (commit 4f08c21)
- viewport: both
- category: comprehension
- observation: the publish toggle appears on /today whether or not the user has set a public username in settings. toggling it without a username stores a published state in the database but the entry will not appear publicly because there is no /u/username route. there is no hint at the point of use that a username is a prerequisite.
- evidence: /today shows the full publish toggle with "this entry will appear on your public profile." while /settings shows no username value in the public username field.
- suggested fix: when no public username is saved, render the publish toggle as disabled or add a note inline: "set a username in settings for entries to appear on your profile."
- source: browser

### [x] [LOW] / — footer CTA copy uses direct second-person address
- pass: 13 (commit 4f08c21)
- viewport: both
- category: voice
- observation: the footer CTA block reads "today's prompt is waiting. a sign-in link is the only thing you'll receive. no password, no spam." the phrase "you'll receive" is direct second-person address, and "no password, no spam" is a reassurance fragment rather than a settled declarative sentence. the voice guide specifies knowledgeable peer framing, not objection-handler copy.
- evidence: footer text: "today's prompt is waiting. a sign-in link is the only thing you'll receive. no password, no spam."
- suggested fix: reframe as a description of how the system works: "the link arrives once. no password is set. no other mail is sent." — removes direct address and converts fragments to full declarative sentences.
- source: browser
- resolution: changed span text to "the link arrives once. no password is set. no other mail is sent." in src/app/page.tsx. Shipped at 9ffd684.

### [LOW] /settings — "sign out" sits adjacent to the form "save" with no visual separation
- pass: 13 (commit 4f08c21)
- viewport: both
- category: comprehension
- observation: the settings page ends with "@\nsave\nsign out" — the destructive "sign out" action appears immediately after the form's primary save action with no visible separator. a user scanning quickly could activate sign-out when intending to save.
- evidence: settings body: "@\nsave\nsign out" — two differently-weighted actions share the same visual proximity.
- suggested fix: place "sign out" in a distinct section below a visual divider or horizontal rule, separate from the form's save button, so it reads as a session action rather than a form action.
- source: browser

### [x] [LOW] /log — all-zero stat line reads as a metrics artifact for a new user
- pass: 13 (commit 4f08c21)
- viewport: both
- category: voice
- observation: for a brand-new account with no entries, the log page renders "0 days written. 60 days quiet. 0 days published." immediately above the empty-state message. the triple-zero stat line reads as a metrics dashboard entry rather than the understated observational tone the voice guide specifies. the empty-state line below it already communicates the same information.
- evidence: "0 days written. 60 days quiet. 0 days published.\n\nyour log is empty. today's entry will appear here."
- suggested fix: suppress the stat line when all values are zero and let the empty-state message carry the page alone, or replace with a single observation such as "nothing written yet. today's entry will appear here."
- source: browser
- resolution: wrapped mosaicCount <p> with `{written > 0 && ...}` in src/app/log/page.tsx. Shipped at a901368.

### [x] [MED] / — "the mosaic" is undefined jargon for a first-time visitor
- pass: 11 (commit 2b4efe6)
- viewport: both
- category: comprehension
- observation: the landing page copy reads "the mosaic shows what is, not what isn't" — the word "mosaic" is introduced as a named product concept with no prior explanation. a first-time visitor has no referent; they don't know whether the mosaic is a visual, a data structure, or a metaphor. the sentence reads as self-referential insider language.
- evidence: body text: "the mosaic shows what is, not what isn't." — "mosaic" appears once in this context with no definition or earlier introduction on the page.
- suggested fix: replace "the mosaic" with a self-explanatory noun, e.g. "your log shows what is, not what isn't." — the authenticated app uses "log" consistently, and that term travels.
- source: browser
- resolution: changed "the mosaic shows what is, not what isn't." to "your log shows what is, not what isn't." in src/app/page.tsx. Shipped at 2de843e.

### [x] [MED] /settings — public username input has no persistent accessible label
- pass: 11 (commit 2b4efe6)
- viewport: both
- category: a11y
- observation: the public username field is preceded by an "@" prefix character and a section-level heading "public username", but if the heading is not programmatically associated with the input (via aria-labelledby or a for/id pair), the input has no accessible name. the "@" symbol alone is not a label.
- evidence: settings capture: "public username\n\nyour public profile lives at /u/your-handle. leave blank to stay private.\n\n@\nsave" — the input appears after "@" with no adjacent label element visible in the text capture.
- suggested fix: associate the "public username" label with the input via a `<label for="...">` / `id` pair, or add `aria-label="public username"` to the input element itself.
- source: browser
- resolution: false positive — SettingsForm.tsx already has `<label htmlFor="username">public username</label>` with matching `id="username"` on the input. The text-capture reader cannot see HTML attributes; the for/id association is correct in the current code. No code change required.

### [x] [MED] /today — meta description is the generic product tagline, not page-specific
- pass: 12 (commit 997e3b1)
- viewport: both
- category: seo
- observation: the /today page description reads "ten minutes of intention before the day swallows you" — the product tagline, shared with the landing page. a user bookmarking /today or seeing it in search results gets no description of what the page actually contains. the title "ember · today" differentiates the page but the description does not.
- evidence: title: "ember · today"; description: "ten minutes of intention before the day swallows you" — identical to the landing page description.
- suggested fix: set a page-specific meta description on /today, e.g. "today's prompt and your daily writing space."
- source: browser
- resolution: changed description to "today's prompt and your daily writing space." in src/app/today/page.tsx. Shipped at 6d907ec.

### [x] [LOW] /settings — prompt variety radio group has no fieldset/legend grouping
- pass: 12 (commit 997e3b1)
- viewport: both
- category: a11y
- observation: the prompt variety toggle uses visually-styled radio inputs under a section heading. the section heading "prompt variety" is separate from the radio inputs in the DOM; if there is no `<fieldset>` with a `<legend>`, screen readers cannot programmatically associate the group label with the "standard" and "personalized" radio buttons. the focus-visible outline fix (2af17d5) addressed keyboard visibility but not group labeling.
- evidence: settings text: "prompt variety\n\nstandard: same curated prompt for everyone each day. personalized: a unique prompt generated from your recent entries.\n\nstandard\npersonalized" — section heading and radio inputs appear as separate blocks with no structural grouping visible.
- suggested fix: wrap the radio inputs in a `<fieldset>` with `<legend>prompt variety</legend>`, or add `role="group"` with `aria-labelledby` pointing to the "prompt variety" heading id.
- source: browser
- resolution: false positive — the container div already carries `role="radiogroup"` and `aria-label="prompt variety"` (SettingsForm.tsx line 125), which provides programmatic group labeling equivalent to `<fieldset>/<legend>`. The critique's text-based capture cannot read ARIA attributes; the association exists. No code change required.

### [LOW] /log — page meta description is minimal and does not describe content
- pass: 12 (commit 997e3b1)
- viewport: both
- category: seo
- observation: the /log page meta description reads "your past 60 days" — technically accurate but does not describe the page's content or purpose to someone arriving from a search result or bookmark. it names the data window but not what the page shows.
- evidence: title: "ember · log"; description: "your past 60 days"
- suggested fix: expand to describe the page's content, e.g. "a record of your past 60 days of writing — prompts, responses, and the entries you have published."
- source: browser

### [x] [LOW] / — "ember · v1" footer version string reads as a developer artifact
- pass: 12 (commit 997e3b1)
- viewport: both
- category: voice
- observation: the footer renders "ember · v1" where "v1" is a developer-facing version label with no meaning to a first-time reader. it sits alongside user-facing copy and disrupts the bookish, intentional voice. every other footer line carries user-facing information.
- evidence: footer text: "ember · v1\nmade for adults who want a low-friction ritual."
- suggested fix: remove the "· v1" suffix from the footer, leaving only "ember", or replace with a meaningful phrase such as the year.
- source: browser
- resolution: removed " · v1" suffix from footer span in src/app/page.tsx. Shipped at 5629222.

### [x] [LOW] / — "sign in to start" button label conflicts with "today's prompt is waiting" framing
- pass: 11 (commit 2b4efe6)
- viewport: both
- category: voice
- observation: the footer block positions ember as an already-present ritual ("today's prompt is waiting") but the CTA button reads "sign in to start." the word "start" implies the practice begins at sign-up, undercutting the sense that something is already here and waiting. the nav bar shows only "sign in" — the inconsistency between the two labels compounds the tonal mismatch.
- evidence: body text: "today's prompt is waiting. a sign-in link is the only thing you'll receive. no password, no spam.\nsign in to start"
- suggested fix: change the button label to "sign in" to match the nav, removing the implication of a new beginning.
- source: browser
- resolution: changed "sign in to start" to "sign in" in src/app/page.tsx; updated e2e smoke test. Shipped at 65b8387.

### [x] [LOW] /signin — meta description is identical to the landing page
- pass: 11 (commit 2b4efe6)
- viewport: both
- category: seo
- observation: /signin shares the same meta description as / — "ten minutes of intention before the day swallows you." a search engine or link preview surfacing /signin would show product-pitch copy rather than copy that describes the sign-in action. the page title ("ember · sign in") is correctly differentiated, but the description is not.
- evidence: / description: "ten minutes of intention before the day swallows you"; /signin description: "ten minutes of intention before the day swallows you"
- suggested fix: give /signin its own description, e.g. "sign in to ember with a link sent to your email — no password required."
- source: browser
- resolution: added description "sign in to ember with a link sent to your email — no password required." to src/app/signin/layout.tsx. Shipped at edab423.

### [x] [LOW] /settings — page meta description omits the "prompt variety" section
- pass: 11 (commit 2b4efe6)
- viewport: both
- category: seo
- observation: the /settings page description reads "display name, timezone, public username" but the page also includes a "prompt variety" section (standard vs. personalized prompts). a user arriving from a bookmark or share link with this description would not know prompt settings live here.
- evidence: description field: "display name, timezone, public username"; captured text includes "prompt variety" as a distinct labeled section with two radio options.
- suggested fix: update the description to "display name, timezone, prompt variety, public username" or a condensed equivalent.
- source: browser
- resolution: updated description to "display name, timezone, prompt variety, public username" in src/app/settings/page.tsx. Shipped at 4a95097.

### [x] [MED] / — CTA "sign in to start" names the action but not the destination
- pass: 6 (commit be41cf9)
- viewport: both
- category: comprehension
- observation: the landing page CTA reads "sign in to start" with no indication of where the link lands. the body copy describes prompts accumulating into "a quiet personal log" but never tells a first-time visitor what happens immediately after signing in — that they land on today's prompt page. the post-auth path is unanchored.
- evidence: captured CTA text: "sign in to start" — no adjacent copy explaining what the first logged-in experience looks like.
- suggested fix: add a brief phrase near the CTA such as "today's prompt is waiting." so the destination is concrete.
- source: browser
- resolution: changed ctaCopy primary text to "today's prompt is waiting." and moved privacy copy to the muted span. Shipped at 0e37545.

### [x] [MED] /today — day-strip tiles are aria-hidden with no AT-accessible state
- pass: 6 (commit be41cf9)
- viewport: both
- category: a11y
- observation: the seven-day strip renders each tile with aria-hidden="true", so screen readers receive no information about which days have entries. the visible sibling span only carries the weekday abbreviation (Sun, Mon, etc.) — not whether that day was written, published, or quiet.
- evidence: captured text: "Sun Mon Tue Wed Thu Fri today" — state (written/quiet/published) is encoded in CSS class names (tile--filled, tile--published) but those elements are removed from the AT tree.
- suggested fix: add a visually-hidden span inside each stripDay with the date and state, e.g. "Mon — written" or "Tue — no entry", so keyboard/AT users understand the strip's meaning.
- source: browser
- resolution: added tileStateLabel() helper in DayStrip.tsx; each stripDay now includes a visually-hidden span with the full date and state ("Mon 19 May 2026 — written", "Thu 21 May 2026 — no entry", "today"); visible date span is aria-hidden to prevent double-announcement. Shipped at 9b1e99f.

### [x] [MED] /settings — prompt variety radio group has no focus-visible style
- pass: 6 (commit be41cf9)
- viewport: both
- category: a11y
- observation: the "standard / personalized" prompt variety selector uses visually-hidden radio inputs (opacity: 0; width: 0; height: 0) with styled label elements, but no :focus-visible rule on the label or container. keyboard users tabbing through the radio group receive no visible focus indicator.
- evidence: settings/page.module.css: `.radioInput { position: absolute; opacity: 0; width: 0; height: 0; }` — no corresponding `:focus-visible` sibling or parent rule exists for `.radioOption`.
- suggested fix: add `.radioOption:has(:focus-visible) { outline: 2px solid var(--color-accent); outline-offset: 2px; }` to settings/page.module.css.
- source: browser
- resolution: added `.radioOption:has(:focus-visible) { outline: 2px solid var(--color-accent); outline-offset: 2px; }` to settings/page.module.css. Shipped at 2af17d5.

### [x] [LOW] /log — "today" in empty-state message is plain text, not a link
- pass: 6 (commit be41cf9)
- viewport: both
- category: comprehension
- observation: the empty-state message reads "your log is empty. today is a good place to start." — the word "today" names the sibling page but is rendered as plain text. a user who has just signed up will expect to click it.
- evidence: captured text: "your log is empty. today is a good place to start." — no link affordance visible.
- suggested fix: wrap "today" in a Link to /today, or rephrase as "head to today to write your first entry." with "today" linked.
- source: browser
- resolution: wrapped "today" in `<Link href="/today">` in src/app/log/page.tsx. Shipped at ff7dd43.

### [x] [MED] /today — "see all 60" link label implies a backlog for users with no entries
- pass: 7 (commit 69def1e)
- viewport: both
- category: comprehension
- observation: the seven-day strip shows seven days all marked "no entry" and the log link still reads "see all 60". for a brand-new user who has written nothing, the number 60 implies a backlog that does not exist. 60 is the mosaic window size, but that framing is invisible to a new user.
- evidence: "see all 60" immediately followed by seven strip days all labeled "no entry"
- suggested fix: change the link text to "open log" (no count) so it reads as a navigation affordance rather than a count of existing content.
- source: browser
- resolution: changed "see all 60" to "open log" in DayStrip.tsx. Shipped at 831dc54.

### [x] [MED] /settings — no sign-out affordance in the authenticated UI
- pass: 8 (commit 5abb81e)
- viewport: both
- category: navigation
- observation: the authenticated nav shows "today / log / settings" only. the settings page has no sign-out link or button anywhere. a user who wants to sign out must navigate directly to /auth/signout by typing the URL — the route handler exists but is unreachable from the UI.
- evidence: nav text on /today, /log, /settings: "today log settings" — no sign-out control. /auth/signout route exists at src/app/auth/signout/route.ts but is not linked from any page.
- suggested fix: add a "sign out" link to /auth/signout in the settings page footer or as a muted nav item (lower-case, consistent with voice posture).
- source: browser
- resolution: added <form action="/auth/signout" method="POST"> with muted "sign out" button in settings page footer. Shipped at 8a9ceb6.

### [x] [MED] /settings — username hint hardcodes the Vercel preview domain
- pass: 8 (commit 5abb81e)
- viewport: both
- category: voice
- observation: the public username hint reads "your public profile lives at ember-rust-sigma.vercel.app/u/username. leave blank to stay private." — the domain is the internal Vercel preview URL, not a canonical product domain. it exposes infra naming to users and will silently break if the project is moved to a custom domain.
- evidence: captured text: "your public profile lives at ember-rust-sigma.vercel.app/u/username. leave blank to stay private."
- suggested fix: replace the hardcoded origin with window.location.host (client-side) or an env var, or simplify to a relative form: "your public profile lives at /u/your-handle. leave blank to stay private."
- source: browser
- resolution: changed hint to "your public profile lives at /u/your-handle. leave blank to stay private." in SettingsForm.tsx. Shipped at 3508ef7.

### [x] [MED] /today — publish toggle description conveyed only via `title` attribute
- pass: 8 (commit 5abb81e)
- viewport: both
- category: a11y
- observation: the publish toggle wraps a checkbox in a `<label title="make this entry visible on your public profile.">`. the `title` attribute is not reliably announced by screen readers and is invisible on touch devices. no `aria-describedby` links the description to the checkbox input.
- evidence: TodayEntry.tsx: `<label className={styles.publishToggle} title="make this entry visible on your public profile.">` — the nested checkbox has no aria-describedby.
- suggested fix: add a visually-hidden `<span id="publish-desc">make this entry visible on your public profile.</span>` and set `aria-describedby="publish-desc"` on both checkbox inputs (main and focus-overlay variants).
- source: browser
- resolution: added visually-hidden span + aria-describedby on both checkbox inputs. Shipped at 31de186.

### [x] [MED] / — landing page 7-day preview shows stale build-date as "today"
- pass: 9 (commit 8c8a92d)
- viewport: both
- category: comprehension
- observation: the homepage `LandingPage` component calls `getSevenDayPreview(new Date())` as a Next.js RSC with no `export const dynamic` or `export const revalidate` override. Next.js 15 statically renders this page at build time, so `new Date()` resolves to the build date, not the request date. a user visiting the site after midnight UTC will see the build date labelled "today" rather than the current date. the authenticated /today page is dynamic (auth-gated) and shows the correct current date, creating a visible mismatch between the preview and the app.
- evidence: anonymous capture (00:05 UTC 2026-05-24) shows "today / Sat 23 May" while authenticated /today shows "Sun 24 May 2026"; last build was from commit 8c8a92d (2026-05-23).
- suggested fix: add `export const dynamic = 'force-dynamic'` to `src/app/page.tsx` so the landing page renders per-request and `new Date()` always reflects the current date.
- source: browser
- resolution: added `export const dynamic = 'force-dynamic'` to src/app/page.tsx. Shipped at f97b216.

### [x] [MED] /today — today tile in day strip omits date and entry state from accessible label
- pass: 9 (commit 8c8a92d)
- viewport: both
- category: a11y
- observation: `DayStrip.tsx` `tileStateLabel()` returns the string `'today'` when `state === 'today'`, while all adjacent tiles return the full date and entry state (e.g. "Mon 18 May 2026 — no entry"). a screen reader user navigating the seven-day strip hears the full date and state for every tile except the current one — where they hear only "today" twice (the visible text is also "today") with no date and no indication of whether an entry has been written.
- evidence: capture: "today / today" versus "Mon / Mon 18 May 2026 — no entry" for adjacent tiles; `src/app/today/DayStrip.tsx` line 16: `if (state === 'today') return 'today'`.
- suggested fix: extend `tileStateLabel` to include the full date and entry state for the today tile, e.g. `if (state === 'today') return \`today, ${formatDisplayDate(date)} — no entry\`` (substituting actual entry state); make the visible "today" span aria-hidden to prevent double-announcement.
- source: browser
- resolution: extended tileStateLabel to accept optional Entry; today tile now returns e.g. "today, Sun 24 May 2026 — no entry" (reflecting actual entry state). Shipped at 103b865.

### [x] [LOW] /today — focus button has no hover tooltip while adjacent publish button does
- pass: 9 (commit 8c8a92d)
- viewport: desktop
- category: comprehension
- observation: the publish toggle carries `title="make this entry visible on your public profile."` per the voice guide ("hover/tooltip copy is a complete sentence with a period"). the adjacent focus button has `aria-label="enter focus mode"` but no `title` attribute. a first-time sighted user hovering over "focus" receives no explanation of what the control does.
- evidence: `src/app/today/TodayEntry.tsx` focusTrigger button: no title attribute; publish toggle label: `title="make this entry visible on your public profile."` is present.
- suggested fix: add `title="enters a distraction-free writing view."` to the focusTrigger button in TodayEntry.tsx.
- source: browser
- resolution: added `title="enters a distraction-free writing view."` to the focusTrigger button in TodayEntry.tsx. Shipped at 7a90a47.

### [LOW] /settings — timezone combobox shows no value for accounts with no saved timezone
- pass: 9 (commit 8c8a92d)
- viewport: both
- category: comprehension
- observation: `SettingsForm` initializes `tzVal` from the profile's saved timezone string. for existing accounts that never set a timezone, `timezone` is an empty string, so the combobox renders blank. the virgin-profile auto-detection only fires when `virgin === true`; existing profiles with an empty timezone get no detected default. a user who skipped the timezone field on first setup returns to a blank combobox with no indication of what to enter.
- evidence: settings capture: "timezone" label with no adjacent value; `src/app/settings/SettingsForm.tsx` lines 37–47: auto-detection skipped for non-virgin profiles.
- suggested fix: expand the timezone auto-detection to run whenever `tzVal === ''` (not only on virgin profiles) so the combobox always shows a detected default rather than blank.
- source: browser

### [x] [LOW] /log — stat line drops unit noun for published count
- pass: 8 (commit 5abb81e)
- viewport: both
- category: voice
- observation: the stat line reads "0 days written. 60 days quiet. 0 published." — the first two clauses carry the unit noun "days" but the third drops it, producing a grammatically inconsistent series.
- evidence: "0 days written. 60 days quiet. 0 published."
- suggested fix: change to "0 days published." matching the unit-noun pattern of the preceding clauses (pluralize conditionally as needed for singular counts).
- source: browser
- resolution: added conditional "day/days" to published count in log/page.tsx. Shipped at 2ebac0d.

### [x] [LOW] / — footer "made for adults" frames product by exclusion
- pass: 8 (commit 5abb81e)
- viewport: both
- category: voice
- observation: the footer reads "made for adults who want a low-friction ritual." the phrase "made for adults" positions the product by who it excludes rather than who it serves. the voice guide prefers settled statements of value.
- evidence: "ember · v1\nmade for adults who want a low-friction ritual."
- suggested fix: reframe around the value rather than the audience boundary: "a daily writing ritual for people who want less noise." or remove the qualifier entirely and let the body copy carry the framing.
- source: browser
- resolution: changed "made for adults who want a low-friction ritual." to "a low-friction writing ritual." in src/app/page.tsx. Shipped at 39b9993.

### [LOW] /settings — display name placeholder uses second-person "you"
- pass: 8 (commit 5abb81e)
- viewport: both
- category: voice
- observation: the display name input shows placeholder text "how you appear on your public profile" — the voice guide discourages second-person copy. while not imperative, the placeholder addresses the user as "you" in a way the rest of the settings page avoids.
- evidence: settings page: display name field placeholder "how you appear on your public profile" per SettingsForm.tsx.
- suggested fix: replace with a neutral descriptor: "visible name on your public profile" or a sample value such as "Ada Lovelace".
- source: browser

### [x] [LOW] /today — "not yet saved" status reads as an error state before any typing
- pass: 7 (commit 69def1e)
- viewport: both
- category: comprehension
- observation: the save-state indicator reads "not yet saved" on first load, before the user has typed a single character. for a first-time visitor this lands as an error or warning rather than an idle placeholder — the word "yet" implies something was expected and is missing.
- evidence: "your response\nnot yet saved\npublish\nfocus\nsave" — appears immediately on page load with empty textarea
- suggested fix: show no save-state label until the user begins typing, or replace the idle text with a neutral em-dash or nothing.
- source: browser
- resolution: added `if (saveState === 'idle' && response === '') return ''` to saveIndicatorText() in TodayEntry.tsx. Shipped at a044cd0.

### [LOW] / — heading register inconsistency between "the next seven days." and "this is what arrives each morning."
- pass: 7 (commit 69def1e)
- viewport: both
- category: voice
- observation: the two adjacent section labels use different syntactic registers. "the next seven days." is a noun phrase ending in a period, functioning as a section heading. "this is what arrives each morning." is a full declarative sentence. on a page that exercises careful typographic restraint, the inconsistency creates a small tonal wobble.
- evidence: "the next seven days.\nthis is what arrives each morning."
- suggested fix: align the labels to the same register — either "the next seven days" (no period, noun phrase) or "here is what arrives each morning." (full sentence, consistent with the stated voice posture).
- source: browser

### [x] [LOW] /log — "today is a good place to start" edges toward coaching tone
- pass: 7 (commit 69def1e)
- viewport: both
- category: voice
- observation: the empty-state line "today is a good place to start" nudges the user toward an action in a way that conflicts with the stated voice posture of "prefer 'here is something to attend to' framing" and the site's deliberate avoidance of motivational copy. it reads as mild encouragement rather than a calm observation.
- evidence: "your log is empty. today is a good place to start."
- suggested fix: reframe as an observation: "your log is empty. today's entry will appear here." — describes what will happen without coaching.
- source: browser
- resolution: changed empty-state to "your log is empty. today's entry will appear here." in src/app/log/page.tsx. Shipped at ea70c0a.

### [LOW] /signin — sign-in page gives no destination context after email submission
- pass: 7 (commit 69def1e)
- viewport: both
- category: comprehension
- observation: the sign-in page confirms an email link will be sent and notes "sign-in links expire after 24 hours." but never tells the user where that link takes them. a first-time visitor has no frame of reference for what the logged-in experience looks like before clicking.
- evidence: "we email you a sign-in link. no password, no spam." / "sign-in links expire after 24 hours." — no destination copy
- suggested fix: add one sentence to the footer, e.g. "the link opens your daily prompt directly." — closes the post-submit loop.
- source: browser

### [x] [LOW] /settings — "Claude" vendor name appears in personalized prompt hint
- pass: 6 (commit be41cf9)
- viewport: both
- category: voice
- observation: the hint text for the prompt variety field reads "personalized: a unique prompt generated for you by Claude, informed by your recent entries." naming the AI vendor is inconsistent with ember's attributionless voice — the same pattern as the prior Supabase attribution on /signin (fixed at dfe1ae4).
- evidence: SettingsForm.tsx: `personalized: a unique prompt generated for you by Claude, informed by your recent entries.`
- suggested fix: replace "generated for you by Claude" with "generated from your recent entries" — describes the behavior without naming the vendor.
- source: browser
- resolution: replaced "generated for you by Claude" with "generated from your recent entries" in SettingsForm.tsx. Shipped at 73ce8ed.

### [x] [LOW] /today — publish toggle tooltip uses imperative form "make this entry visible"
- pass: 10 (commit 51b2c7c)
- viewport: both
- category: voice
- observation: the publish toggle carries `title="make this entry visible on your public profile."` — the imperative construction "make this entry visible" is a direct second-person instruction, which the voice guide prohibits outside quoted text. tooltip copy should read as a state description, not a command.
- evidence: `"publish\nmake this entry visible on your public profile."` — captured in both primary view and focus-mode overlay
- suggested fix: reframe as declarative: "this entry will appear on your public profile." or "entry will be visible on your public profile."
- source: browser
- resolution: changed title and aria-describedby span text to "this entry will appear on your public profile." in both main and focus-overlay copies. Shipped at 1ec04e5.

### [x] [LOW] /settings — "/u/your-handle" literal string in username hint reads as unfinished
- pass: 10 (commit 51b2c7c)
- viewport: both
- category: comprehension
- observation: the public username field hint renders the literal hyphenated string "your-handle" in a URL example: "your public profile lives at /u/your-handle." before a username is set, this reads as placeholder copy accidentally left in rather than a generic illustrative example. a first-time user may attempt to navigate to /u/your-handle.
- evidence: `"your public profile lives at /u/your-handle. leave blank to stay private."`
- suggested fix: replace the literal "-handle" with a clearly-generic placeholder token, e.g. "/u/username" or "/u/your-username", so the example reads as illustrative rather than instructional.
- source: browser
- resolution: changed "/u/your-handle" to "/u/username" in hint text and input placeholder in SettingsForm.tsx. Shipped at 72dba75.

### [LOW] /settings — personalized prompt gives no fallback signal for users with no entries
- pass: 10 (commit 51b2c7c)
- viewport: both
- category: comprehension
- observation: the personalized variety option reads "informed by your recent entries" with no indication of what happens when a new user with zero entries selects it. there is no signal about whether the feature activates immediately, requires a minimum, or gracefully falls back to a standard prompt.
- evidence: `"personalized: a unique prompt generated for you by Claude, informed by your recent entries."` — no fallback copy follows.
- suggested fix: add a brief qualifier after the existing description, e.g. "falls back to a standard prompt until entries exist." so a new user knows the selection is safe to make.
- source: browser

### [x] [LOW] / — "that's deliberate." reads as a defensive aside (pass 6; addressed at a44a3a6)
- pass: 6 (commit be41cf9)
- viewport: both
- category: voice
- observation: the closing section uses "that's deliberate." as a parenthetical justification between two declarative statements. the voice guide prefers settled statements of value over pre-emptive rebuttals to imagined objections.
- evidence: captured text: "the same prompt and task arrive for everyone on a given day. that's deliberate. ember does not personalize your morning."
- suggested fix: remove "that's deliberate." and let "ember does not personalize your morning." carry the point on its own.
- source: browser
- resolution: removed "that's deliberate." from src/app/page.tsx closing paragraph. Shipped at a44a3a6.

### [x] [LOW] / — task label prefix is inconsistent across 7-day preview
- pass: 4 (commit 8b806b8)
- viewport: both
- category: voice
- observation: in the 7-day preview on the landing page, the first day's task uses the prefix "today's tiny task —" while all subsequent days use "tiny task —" without the possessive prefix. within a single preview block the inconsistency is jarring.
- evidence: captured text: "today's tiny task — notice one thing today..." followed by "tiny task — slow down on one task today..."
- suggested fix: standardize to "tiny task —" across all seven rows (dropping the "today's" prefix), matching the recurring-days pattern.
- source: browser
- resolution: removed the isToday ternary in src/app/page.tsx; all seven rows now render "tiny task —". Shipped at 92a4995.

### [x] [LOW] /log — H1 "your past sixty days" uses word form while stat line uses numeral "60"
- pass: 5 (commit 4552045)
- viewport: both
- category: voice
- observation: the /log page H1 reads "your past sixty days" (word form) while the stat line immediately below it reads "0 days written. 60 days quiet. 0 published." (numeral). two forms of the same number appear within a few lines of each other on the same page.
- evidence: "your past sixty days" (H1) directly above "0 days written. 60 days quiet. 0 published." on /log
- suggested fix: change the H1 to "your past 60 days" to match the numeral form used throughout the stat line.
- source: browser
- resolution: changed H1 and metadata description to "your past 60 days". Bundled with six other "sixty"→"60" fixes. Shipped at 2573c76.

### [x] [LOW] /signin — "back" link has no visible destination
- pass: 5 (commit 4552045)
- viewport: both
- category: comprehension
- observation: the sign-in page shows a "back" link immediately after the wordmark. a visitor who arrived at /signin directly (e.g. via a shared link or bookmark) has no indication of where "back" leads.
- evidence: captured text: "ember / back / sign in." — "back" with no destination label
- suggested fix: change the link text to "back to home" or add aria-label="back to home" so the destination is explicit.
- source: browser
- resolution: changed "back" to "back to home" and added aria-label="back to home". Shipped at 51977f7.

### [x] [LOW] /today — "see all sixty" uses word form inconsistent with numeral "60" elsewhere
- pass: 4 (commit 8b806b8)
- viewport: both
- category: voice
- observation: the seven-day strip on /today links to /log with the label "see all sixty" (word form), while /log itself uses the numeral "60" throughout ("60 days quiet", "your past sixty days" h1 aside). the inconsistency is minor but noticeable within the same session.
- evidence: "/today" text: "see all sixty" vs "/log" text: "0 days written. 60 days quiet. 0 published."
- suggested fix: change "see all sixty" to "see all 60" to match the numeral form used on /log.
- source: browser
- resolution: changed "see all sixty" to "see all 60" in DayStrip.tsx. Shipped at 2573c76.

### [x] [LOW] /today — "done" button in seven-day strip lacks an accessible label
- pass: 4 (commit 8b806b8)
- viewport: both
- category: a11y
- observation: the "done" button for marking today's task complete appears in the DOM after the day-label strip (Sat, Sun, Mon, Tue, Wed, Thu, today) with no aria-label. a screen reader encountering "done" at that position lacks context for what action it confirms.
- evidence: captured text: "Sat Sun Mon Tue Wed Thu today" followed by "done" with no intervening label.
- suggested fix: add aria-label="mark today's task done" to the done button element.
- source: browser
- resolution: false positive — text capture shows visible text only. TodayEntry.tsx task button already has `aria-label={taskDone ? 'mark task not done' : 'mark task done'}` (shipped at a8db48d); focus-mode exit button has `aria-label="exit focus mode"` (TodayEntry.tsx:254). No code change required.


### [x] [LOW] /signin — no link-expiry or next-step copy after submission
- pass: 1 (commit c69173d)
- viewport: both
- category: comprehension
- observation: the sign-in page says "we email you a sign-in link. no password, no spam." but gives no indication of where the link lands or how long it is valid. a first-time visitor who closes the tab before the email arrives may be uncertain whether the link has expired.
- evidence: captured text: "we email you a sign-in link. no password, no spam." — no expiry or destination copy.
- suggested fix: add one line such as "the link is valid for 24 hours and drops you straight into today's page" to reduce post-submit uncertainty.
- resolution: footer now reads "sign-in links expire after 24 hours." — added at dfe1ae4 when the vendor attribution was replaced. Expiry concern addressed.

## Done

### [x] [LOW] /today — task label "today's tiny task —" differs from anonymous preview "tiny task —"
- pass: 5 (commit 4552045)
- viewport: both
- category: voice
- observation: the authenticated /today page rendered "today's tiny task —" while the landing-page 7-day preview (standardized at 92a4995) uniformly uses "tiny task —". a visitor who read the landing page before signing in saw the label change between surfaces.
- evidence: `src/app/today/TodayEntry.tsx` line 145: `today&apos;s tiny task{' '}` — hardcoded prefix persisted after the landing-page fix.
- resolution: removed the "today's" prefix in TodayEntry.tsx. Both surfaces now render "tiny task —". Shipped at 0c3165d.

### [x] [LOW] /signin — "magic-link via supabase" vendor name in footer
- pass: 4 (commit 8b806b8)
- viewport: both
- category: voice
- observation: the /signin page footer read "magic-link via supabase." — a vendor name with no user meaning, at odds with ember's calm voice.
- evidence: `src/app/signin/page.tsx` line 99: `<span>magic-link via supabase</span>` in `<footer>`
- resolution: replaced with "sign-in links expire after 24 hours." — removes vendor attribution, adds useful expiry info. Shipped at dfe1ae4.

### [LOW] /signin — page title is identical to landing page, no signin-specific suffix
- pass: 3 (commit ae936e3); evidence updated pass 4
- viewport: both
- category: seo
- observation: the /signin page title is "ember — a daily writing ritual" — identical to the landing page (the root layout default). all other app pages carry descriptive suffixes ("ember · today", "ember · log", "ember · settings"). a user with both the landing page and the sign-in page open cannot distinguish them by tab title.
- evidence: captured title: "ember — a daily writing ritual" on both / and /signin (vs. "ember · today" on /today, "ember · log" on /log)
- suggested fix: set the /signin page title to "ember · sign in" to match the established pattern.
- resolution: added src/app/signin/layout.tsx exporting metadata { title: 'ember · sign in' }. Shipped at 6413cfb.

### [MED] / (mobile) — footer trust copy absent at 375px
- pass: 1 (commit c69173d)
- viewport: mobile
- category: comprehension
- observation: on desktop the footer includes "a sign-in link is the only thing you'll receive. no password, no spam." which is the primary objection-handler for a skeptical first-time visitor. this line does not appear in the mobile capture (375px), removing a meaningful trust signal before the sign-in CTA.
- evidence: desktop capture includes the privacy reassurance; mobile capture ends with "made for adults who want a low-friction ritual. / sign in to start" — no privacy copy.
- suggested fix: audit the mobile layout to confirm this copy is present and visible at 375px, or surface it directly above the "sign in to start" CTA.
- resolution: removed `.ctaCopy { display: none }` from the ≤480px breakpoint; set `font-size: var(--type-14)` so the copy stacks above the CTA button in column layout; increased `.page { padding-bottom }` to 160px on mobile. Shipped at a018b8d.

### [MED] /today — publish button has no affordance explaining what publishing does
- pass: 4 (commit 8b806b8)
- viewport: both
- category: comprehension
- observation: the publish button appears on /today alongside save and focus but there is no surrounding copy, tooltip, or label explaining what publishing does or who can see a published entry.
- evidence: captured text: "publish / focus / save" — no explanatory context visible in the DOM text.
- suggested fix: add a short descriptor near the publish button.
- resolution: added `title="make this entry visible on your public profile."` to both publish toggle `<label>` elements in TodayEntry.tsx. Shipped at 7fe5ba6.

### [MED] /signin — email field label is all-caps "EMAIL"
- pass: 3 (commit ae936e3)
- viewport: both
- category: voice
- observation: the email input label renders as "EMAIL" in full uppercase. the cdcd1ff typography pass removed uppercase from labels in /settings and /today but the /signin label was not included.
- evidence: captured text: "EMAIL / send the link"
- suggested fix: remove text-transform: uppercase from the email label in the sign-in form so it reads "email" in lower-case, consistent with the rest of the app.
- resolution: removed `text-transform: uppercase` from `.fieldLabel` in signin/page.module.css. Shipped at 055c339.

### [MED] /today — save-state indicator may not be a live region
- pass: 1 (commit c69173d)
- viewport: both
- category: a11y
- observation: the save-state label "not yet saved" may not be in an aria-live region; screen reader users would not be notified when the state changes.
- evidence: captured text: "YOUR RESPONSE / not yet saved / publish / save" — save-state appears as static text with no live-region context visible.
- suggested fix: wrap the save-state label in `aria-live="polite"`.
- resolution: `aria-live="polite"` confirmed present on `.lastSaved` span in TodayEntry.tsx. Already fixed as part of audit finding [4.8] (shipped at 8b41e0a). Duplicate finding; closed without separate commit.

### [MED] /log — "60 quiet" in the empty-state stat line is ambiguous
- pass: 1 (commit c69173d)
- viewport: both
- category: comprehension
- observation: the empty-state stat line reads "0 days written. 60 quiet. 0 published." the word "quiet" is doing non-obvious work — it means days with no entry — but a first-time visitor is unlikely to parse this without an explanation.
- evidence: captured text: "0 days written. 60 quiet. 0 published."
- suggested fix: add a brief gloss — e.g. "0 days written. 60 quiet days. 0 published." — or a visible label beneath the stat row explaining what each figure counts.
- resolution: changed `{quiet} quiet.` to `{quiet} days quiet.` in log/page.tsx. Shipped at ccafa00.

### [MED] / — "read-only preview" label gives state but not purpose
- pass: 3 (commit ae936e3)
- viewport: desktop
- category: comprehension
- observation: the 7-day preview section is introduced with "the next seven days." followed by a terse "read-only preview" label. the label communicates the interaction state but not why the visitor is seeing this content before signing in. a first-time visitor may miss that this is an illustrative sample of what they will receive daily.
- evidence: captured text: "the next seven days. / read-only preview / today / Fri 22 May"
- suggested fix: add a short explanatory subtitle beneath "the next seven days." — e.g. "this is what arrives each morning." — so the preview's purpose is clear without requiring the visitor to infer it.
- source: browser
- resolution: replaced "read-only preview" with "this is what arrives each morning." in src/app/page.tsx. Shipped at 757f4a7.

### [MED] / — page title is a bare product name with no descriptive suffix
- pass: 2 (commit 1ade924)
- viewport: both
- category: seo
- observation: the homepage title is simply "ember" with no description of what the product does. this provides no keyword signal and gives the browser tab no context for a returning user who has multiple tabs open.
- evidence: capture metadata: title: "ember"
- suggested fix: change the root layout title to "ember — a daily writing ritual" (or equivalent from the tagline) to carry both brand identity and product purpose.
- source: browser
- resolution: changed root layout title, OG title, and twitter title to "ember — a daily writing ritual" in src/app/layout.tsx. Shipped at 99aa554.

### [MED] /today — date heading renders as all-caps "FRI 22 MAY 2026"
- pass: 3 (commit ae936e3)
- viewport: both
- category: voice
- observation: the date heading on /today is displayed in full uppercase ("FRI 22 MAY 2026") while all other page copy uses lower-case. the cdcd1ff fix addressed `.entryLabel` and `.stripLabel` but did not cover the date heading class.
- evidence: captured text: "FRI 22 MAY 2026"
- suggested fix: remove the uppercase rule from the date heading element on /today so it renders as "Fri 22 May 2026".
- source: browser
- resolution: removed `text-transform: uppercase` from `.dateStamp` in today/page.module.css. Shipped at d419779.

### [MED] /today — FOCUS and DONE button labels are all-caps
- pass: 3 (commit ae936e3)
- viewport: both
- category: voice
- observation: the focus-mode toggle and task-done button render their labels as "FOCUS" and "DONE" in full uppercase. the cdcd1ff fix covered section labels but not button labels.
- evidence: captured text: "FOCUS" and "DONE" amid otherwise lower-case copy
- suggested fix: render these button labels in sentence case ("Focus", "Done") via removing any text-transform: uppercase rule on the button elements; use CSS for stylistic treatment only if needed.
- source: browser
- resolution: removed `text-transform: uppercase` from `.focusTrigger` and `.focusDone` in today/page.module.css. Shipped at d419779.

### [HIGH] /settings — timezone selector is effectively unusable on mobile
- pass: 1 (commit c69173d)
- viewport: both
- category: a11y
- observation: the timezone selector is a flat unfiltered list of 200+ timezone strings in a single `<select>` element with no optgroup grouping and no search. a user on mobile must scroll through hundreds of raw tz database names (e.g. `Africa/Abidjan`, `America/Indiana/Knox`) with no shortcut.
- evidence: settings page body text is almost entirely composed of raw timezone names in alphabetical sequence; no region groupings visible in the text capture.
- suggested fix: group timezones with `<optgroup>` by region, or replace with a searchable combobox so users can type to filter.
- issue: #26
- resolution: added groupTimezones() helper in SettingsForm.tsx; timezone <select> now renders <optgroup> per region prefix. Shipped at 8d43d1b.

### [HIGH] /today — focus-mode overlay DOM duplication exposes duplicate controls to screen readers
- pass: 2 (commit 1ade924)
- resolution: `aria-hidden={!isFocus}`, `aria-modal={isFocus}`, and `tabIndex={isFocus ? 0 : -1}` on overlay interactive elements added to TodayEntry.tsx as part of phase 19. Shipped at a9e1729.

### [MED] /today — section header caps conflict with stated typographic voice
- pass: 1 (commit c69173d)
- resolution: removed `text-transform: uppercase` from `.entryLabel` and `.stripLabel` in today/page.module.css. Shipped at cdcd1ff.

### [MED] /settings — field labels DISPLAY NAME and TIMEZONE are full uppercase
- pass: 2 (commit 1ade924)
- resolution: removed `text-transform: uppercase` from `.label` in settings/page.module.css. Shipped at cdcd1ff.

### [MED] /log — H1 "YOUR PAST SIXTY DAYS" is all-caps
- pass: 2 (commit 1ade924)
- resolution: removed `text-transform: uppercase` from `.mosaicMeta` in log/page.module.css. Shipped at cdcd1ff.

### [MED] /today — FOCUS button has no accessible label
- pass: 2 (commit 1ade924)
- resolution: `aria-label="enter focus mode"` added to the focusTrigger button in TodayEntry.tsx as part of phase 19. Shipped at a9e1729.

### [HIGH] / — "THE BRAND IS THE PRACTICE RENDERED" is internal design copy surfaced to users
- pass: 2 (commit 1ade924)
- viewport: both
- category: voice
- observation: the phrase "THE BRAND IS THE PRACTICE RENDERED" appears in full uppercase between the intro copy and the 7-day prompt preview. it reads as an internal design-system label or brand-strategy fragment rather than user-facing content, and breaks the lower-case typographic register of every other element on the page.
- evidence: captured body text: "THE BRAND IS THE PRACTICE RENDERED / the next seven days. / read-only preview"
- suggested fix: remove the line entirely. if it anchors a section structurally, replace with a semantically appropriate hidden label or a visible heading in sentence case.
- source: browser
- resolution: removed the `previewMarkLabel` span from src/app/page.tsx. Shipped at 0c1d673.
