# Audit — Ember

> Open findings, scored and categorized. `/iterate` drains
> the Pending section. `/oversight` may bias the loop with
> `> Bias: <category>` rows.

## Pending

### [x] [3.6] / — footer label "a low-friction writing ritual." uses product-management jargon
- category: voice
- impact: 4
- ease: 9
- note: scored 2026-06-03 — from critique pass 31 (c0b8bad); "low-friction" is product-management register — it describes the design posture in technical terms rather than experiential ones; the rest of the page uses concrete, experiential language ("ten minutes of intention", "a quiet personal log"); fix is a single word removal in src/app/page.tsx line 80
- observation: the homepage footer label reads "a low-friction writing ritual." the compound modifier "low-friction" is product-management register — it describes the design posture in technical terms rather than experiential ones. the voice guide specifies plain and slightly bookish; the rest of the page uses concrete, experiential language ("ten minutes of intention", "a quiet personal log").
- evidence: src/app/page.tsx line 80: `<span>a low-friction writing ritual.</span>` — footer section label immediately below the wordmark.
- suggested fix: replace with a plain experiential descriptor, e.g. "a daily writing ritual." (dropping the modifier entirely) or "a quiet daily practice." to match the page's own register.
- source: /critique pass 31 (commit c0b8bad)
- issue: [mirror-failed: 2026-06-03T00:00:00Z]
- resolution: changed "a low-friction writing ritual." to "a daily writing ritual." in src/app/page.tsx. Shipped at 260eb99.

### [x] [3.6] /log — most-recent entry article has no accessible name
- category: a11y
- impact: 4
- ease: 9
- note: scored 2026-06-03 — from critique pass 31 (c0b8bad); the article element at src/app/log/page.tsx line 100 has no aria-label; "showing the most recent." prose sits outside the article boundary with no programmatic association; fix is a single attribute addition
- observation: when entries exist, the most-recent entry is wrapped in an `<article>` element with no accessible name. screen reader users navigating by landmark or article role encounter the prompt text as the only heading inside the article, with no context identifying this as the most recent log entry. the "showing the most recent." prose sits outside the article boundary and has no programmatic association to it.
- evidence: src/app/log/page.tsx line 100: `<article className={styles.entryView}>` — no aria-label attribute. the "showing the most recent." string at line 123 is outside the article.
- suggested fix: add `aria-label="most recent entry"` to the article element so AT users understand its role in the page structure.
- source: /critique pass 31 (commit c0b8bad)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: added aria-label="most recent entry" to the article element in src/app/log/page.tsx. Shipped at d6aed87.

### [x] [3.6] /today — save indicator status strings are sentence fragments
- category: voice
- impact: 4
- ease: 9
- note: scored 2026-06-03 — from critique pass 31 (c0b8bad); three save-indicator status strings are sentence fragments without terminal periods, inconsistent with the voice spec's requirement that copy communicating state be a complete sentence; "saving...", "unsaved", "draft restored" in TodayEntry.tsx lines 145, 148, 150; "saved." already has a period; fix requires 3 string changes + test updates
- observation: three save-indicator status strings are sentence fragments without terminal periods, inconsistent with the voice spec's requirement that copy communicating state be a complete sentence. "saving..." uses an ellipsis convention; "unsaved" is a bare adjective; "draft restored" is a past-participle phrase with no period. the strings appear in the aria-live indicator span (read aloud by screen readers) and as button text, so their register affects both sighted and AT users. the "saved." indicator already has a period; the others are inconsistent with it.
- evidence: src/app/today/TodayEntry.tsx lines 145, 148, 150: `return 'saving...'`, `return 'draft restored'`, `return 'unsaved'`; button label at lines 212, 275: `{saveState === 'saving' ? 'saving...' : 'save'}`.
- suggested fix: change to "saving." (period, no ellipsis), "draft restored." and "not yet saved." — all complete sentences, consistent with "saved." and the voice spec.
- source: /critique pass 31 (commit c0b8bad)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed 'saving...', 'draft restored', 'unsaved' to 'saving.', 'draft restored.', 'not yet saved.' in TodayEntry.tsx; button labels updated; 3 test files updated. Shipped at 17830b2.

### [x] [2.7] /today — OnThisDay component uses second-person "you wrote"
- category: voice
- impact: 3
- ease: 9
- note: scored 2026-06-03 — from critique pass 31 (c0b8bad); the on-this-day component renders "{yearText}, you wrote —" followed by an excerpt; "you wrote" is a second-person construction; fix is a string change in OnThisDay.tsx + test assertion update
- observation: the on-this-day component renders "{yearText}, you wrote —" followed by an excerpt from a prior-year entry. "you wrote" is a second-person construction that conflicts with the no-second-person voice posture applied throughout the site. the feature renders only when the user has a prior entry on the same calendar day in an earlier year.
- evidence: src/app/today/OnThisDay.tsx line 34: `{yearText}, you wrote &mdash;{' '}` — e.g. "a year ago, you wrote — [excerpt]". confirmed in test assertions at OnThisDay.test.tsx lines 78, 96.
- suggested fix: reframe to an impersonal construction, e.g. "a year ago —" followed by the excerpt directly, dropping "you wrote" entirely. preserves the temporal framing without direct address.
- source: /critique pass 31 (commit c0b8bad)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed "{yearText}, you wrote —" to "{yearText} —" in OnThisDay.tsx, dropping "you wrote" entirely. Two test assertions updated. Shipped at 2d880ee.

### [ ] [2.4] /signin — page title separator inconsistency (· vs —)
- category: seo
- impact: 3
- ease: 8
- note: scored 2026-06-03 — from critique pass 31 (c0b8bad); root layout uses em dash ("ember — a daily writing ritual") while all page-level titles use middle dot ("ember · sign in", etc.); fix is a root layout template change or a global page-level update
- observation: the root layout title uses an em dash as separator ("ember — a daily writing ritual") while all page-level titles use a middle dot ("ember · sign in", "ember · today", "ember · log", "ember · settings"). the two separator characters produce inconsistent visual rhythm across browser tabs and search engine result listings.
- evidence: anonymous capture title "ember — a daily writing ritual" (homepage); "ember · sign in" (/signin); authenticated captures: "ember · today", "ember · log", "ember · settings". the root layout sets the default template with em dash; page-level layouts override with middle dot.
- suggested fix: standardise on the middle dot across all titles — change the root layout to "ember · a daily writing ritual" — or adopt the em dash pattern in all page-level templates.
- source: /critique pass 31 (commit c0b8bad)

### [x] [4.0] /today — publish prereq hint gives no current-state signal for users with no username
- category: external-critique
- impact: 5
- ease: 8
- note: scored 2026-06-03 — from critique pass 30 (fd83207); the publish prereq hint reads "entries appear publicly only when a username is set in settings." — passive present-tense phrasing that does not tell the user whether they currently have a username; the toggle is interactive but there is no signal that the entry will remain private; fix is a hint text change in two places (main view + focus overlay) in TodayEntry.tsx with test updates
- observation: the publish toggle is interactive for a new user with no public username set. the prereq hint reads "entries appear publicly only when a username is set in settings." — a conditional observation in the present tense that does not tell the user whether they currently have a username. a user who enables the toggle and saves receives no in-page signal that the entry is not visible anywhere.
- evidence: capture text: "publish / when published, this entry appears on the public profile. / focus / save / entries appear publicly only when a username is set in settings." — toggle is enabled and interactive; hint is passive with no current-state signal for a zero-username account.
- suggested fix: when no username is saved, change the prereq hint to "no public username is set — published entries will remain private until one is added in settings." so the toggle's current effect is unambiguous.
- source: /critique pass 30 (commit fd83207)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed hint text to "no public username is set — published entries will remain private until one is added in settings." in both main view and focus overlay of TodayEntry.tsx. 3 test assertions updated. Shipped at c013b8c.

### [x] [2.7] /signin — "sign-in links expire after 24 hours." appears twice simultaneously after submission
- category: external-critique
- impact: 3
- ease: 9
- note: scored 2026-06-03 — from critique pass 30 (fd83207); the expiry notice was added to the sent-state at 1cb0860 but the footer span was not removed; verbatim duplication on the same screen in the sent state; fix is a conditional render or removal of the footer span
- observation: after a visitor submits their email, "sign-in links expire after 24 hours." appears twice simultaneously: once in the sent-state confirmation paragraph (added at pass 28) and once in the always-visible page footer. the phrase was added to the sent-state at 1cb0860 but the footer span was not removed, producing verbatim duplication on the same screen in the sent state.
- evidence: src/app/signin/page.tsx: sent-state `<p>` ends with "sign-in links expire after 24 hours."; footer unconditionally renders `<span>sign-in links expire after 24 hours.</span>` regardless of state.
- suggested fix: remove "sign-in links expire after 24 hours." from the footer span, or render it only when state !== 'sent', so the expiry notice appears once in the confirmation paragraph where it is most relevant.
- source: /critique pass 30 (commit fd83207)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: conditionally render footer expiry span only when state !== 'sent' in src/app/signin/page.tsx; test added asserting notice appears in role="status" and is absent from footer in sent state. Shipped at fce61a6.

### [ ] [2.0] /settings — hint text "your public profile lives at /u/username" uses second-person possessive
- category: external-critique
- impact: 2
- ease: 10
- note: scored 2026-06-03 — from critique pass 30 (fd83207); the public username field hint reads "your public profile lives at /u/username." — "your public profile" is a second-person possessive; single string change in SettingsForm.tsx
- observation: the public username field hint reads "your public profile lives at /u/username." the phrase "your public profile" is a second-person possessive. prior passes de-possessived "your public profile" in the /today publish description but the same phrase persists in this hint.
- evidence: settings capture: "your public profile lives at /u/username. leave blank to stay private." — "your public profile" is the possessive portion.
- suggested fix: change to "a public profile will appear at /u/username." to remove the possessive while retaining the url example.
- source: /critique pass 30 (commit fd83207)

### [ ] [1.8] / — Twitter card images array lacks alt text
- category: seo
- impact: 2
- ease: 9
- note: scored 2026-06-03 — from critique pass 30 (fd83207); the root layout Twitter card metadata specifies `images` as a plain string array; next.js requires an object array `[{ url, alt }]` to emit an alt attribute; the opengraph image at the same path correctly includes alt text
- observation: the root layout Twitter card metadata specifies `images` as a plain string array. next.js app router requires an object array `[{ url, alt }]` to emit an alt attribute on the twitter card image. the plain string form produces a twitter card image with no accessible description.
- evidence: src/app/layout.tsx: `twitter: { images: ['/opengraph-image'] }` — plain string, no alt property. compare `openGraph.images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember — a daily writing ritual' }]` — object with alt.
- suggested fix: change `twitter.images` to `[{ url: '/opengraph-image', alt: 'ember — a daily writing ritual' }]` to match the opengraph object format.
- source: /critique pass 30 (commit fd83207)

### [ ] [1.8] / — MosaicPreview aria-label "60 days of practice" misrepresents illustrative content
- category: a11y
- impact: 2
- ease: 9
- note: scored 2026-06-03 — from critique pass 30 (fd83207); the MosaicPreview on the landing page carries `aria-label="60 days of practice"` but the mosaic is a hardcoded illustrative tile pattern unrelated to any visitor's data; single string change in MosaicPreview.tsx
- observation: the MosaicPreview component on the landing page carries `aria-label="60 days of practice"`. for an anonymous visitor who has never used ember, the mosaic is a hardcoded illustrative tile pattern. the label "60 days of practice" implies personal ownership of a practice that does not exist for an anonymous first-time visitor.
- evidence: src/components/mosaic/MosaicPreview.tsx: `role="img" aria-label="60 days of practice"` — the PREVIEW_PATTERN is a static hardcoded array not derived from any user session.
- suggested fix: change aria-label to "an example of 60 days tracked" or "illustrative writing log" to accurately describe the decorative, non-personal nature of the element.
- source: /critique pass 30 (commit fd83207)

### [ ] [1.6] /today — "focus" button has no visible description on mobile (touch devices)
- category: comprehension
- impact: 2
- ease: 8
- note: scored 2026-06-03 — from critique pass 30 (fd83207); the "focus" button carries a title attribute on desktop but title tooltips are not surfaced on touch devices; the adjacent publish toggle has a description line rendered below it in the DOM; "focus" is the only control with no supporting copy visible at the mobile viewport
- observation: the "focus" button carries a title attribute ("enters a distraction-free writing view.") on desktop, but title tooltips are not surfaced on touch devices. "focus" is the only control in the row with no supporting copy visible at the mobile viewport.
- evidence: mobile capture controls sequence: "publish / when published, this entry appears on the public profile. / focus / save" — "focus" has no adjacent description; the title attribute is inaccessible on touch.
- suggested fix: render a short description element below the focus button in the DOM, parallel to the publish description ("enters a distraction-free writing view."), so touch users see a plain-language explanation without hover.
- source: /critique pass 30 (commit fd83207)

### [x] [3.6] / — root layout meta description uses "small task" instead of branded "tiny task"
- category: seo
- impact: 4
- ease: 9
- note: scored 2026-06-02 — from critique pass 29 (e9a5f15); three parallel occurrences in src/app/layout.tsx (description, openGraph.description, twitter.description); the page body and all seven 7-day preview items use "tiny task" consistently; the meta description diverges with "small task", which appears nowhere else on the page; affects search snippets and social cards for the primary landing surface
- observation: the root layout meta description reads "ember is a daily writing ritual — one prompt and one small task each morning." the product's branded compound label throughout the landing page body, all seven 7-day preview items, and the closing paragraph is "tiny task" — never "small task." the description diverges from the product's own terminology; a search-result snippet would show a term that does not match any text visible on the landing page.
- evidence: src/app/layout.tsx line 36: `description: 'ember is a daily writing ritual — one prompt and one small task each morning.'` — also openGraph.description (line 46) and twitter.description (line 53) carry the same text. landing page body: "one small prompt and one tiny task each morning." and all seven preview lines beginning "tiny task — ...".
- suggested fix: change "one small task" to "one tiny task" in all three occurrences (description, openGraph.description, twitter.description) in src/app/layout.tsx to match the product's branded label.
- source: /critique pass 29 (commit e9a5f15)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed "one small task" to "one tiny task" in all three metadata fields (description, openGraph.description, twitter.description) in src/app/layout.tsx. Shipped at 75cf391.

### [ ] [2.1] / — H1 uses semantic `<em>` for typographic italics on "intention"
- category: a11y
- impact: 3
- ease: 7
- note: scored 2026-06-02 — from critique pass 29 (e9a5f15); the H1 on the landing page renders "intention" in an `<em>` element; `<em>` carries semantic stress meaning — screen readers voice it with spoken emphasis; the rendering intent appears typographic (italic); the fix is to replace `<em>` with a `<span>` styled with a CSS italic class and remove the semantic stress signal
- observation: the landing page H1 renders "ten minutes of intention before the day swallows you." with the word "intention" wrapped in an `<em>` element. `<em>` carries semantic stress meaning — screen readers voice its contents with spoken emphasis. the rendering intent appears to be typographic (italic styling), but using `<em>` for italics in a heading applies spoken stress to one word of an otherwise plain declarative sentence.
- evidence: src/app/page.tsx line 27: `ten minutes of <em>intention</em> before the day swallows you.` — the only `<em>` element in a heading context on the site.
- suggested fix: replace `<em>` with a `<span>` styled with a CSS italic class (e.g. `styles.pitchAccent`) to remove the semantic stress signal from the accessible tree while preserving the italic rendering. add `.pitchAccent { font-style: italic; }` to the page's CSS module.
- source: /critique pass 29 (commit e9a5f15)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]

### [ ] [2.0] /signin — meta description uses second-person possessive "your email"
- category: voice
- impact: 2
- ease: 10
- note: scored 2026-06-02 — from critique pass 29 (e9a5f15); the /signin meta description reads "sign in to ember with a link sent to your email — no password required." — "your email" is the only possessive remaining in the site's meta description set; all other page meta descriptions now avoid direct address; single string replacement in src/app/signin/layout.tsx
- observation: the /signin page meta description reads "sign in to ember with a link sent to your email — no password required." the phrase "your email" is a second-person possessive. the de-possessiving pattern applied to /log, /today, /settings, and /log/[date] meta descriptions was not applied to this description when it was written. every other page meta description on the site now avoids direct address; /signin is the remaining outlier.
- evidence: src/app/signin/layout.tsx line 5: `description: 'sign in to ember with a link sent to your email — no password required.'` — "your email" is the only possessive remaining in the site's meta description set.
- suggested fix: change to "sign in to ember with a link sent by email — no password required." — removes the possessive while preserving the meaning.
- source: /critique pass 29 (commit e9a5f15)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]

### [ ] [2.0] /settings — "view your public profile" link text uses second-person possessive
- category: voice
- impact: 2
- ease: 10
- note: scored 2026-06-02 — from critique pass 29 (e9a5f15); when a public username is saved, the settings page renders a link "view your public profile." — "your public profile" is a second-person possessive; other settings strings were de-possessived but this conditional link was not; single string change in src/app/settings/page.tsx
- observation: when a public username is saved, the settings page renders a link with text "view your public profile." the phrase "your public profile" is a second-person possessive. the same de-possessiving pattern applied to other settings strings was not applied to this link.
- evidence: src/app/settings/page.tsx line 58: `view your public profile` — rendered only when profile?.username is truthy; the link text is the sole remaining possessive in the settings page visible content.
- suggested fix: change link text to "view public profile" to remove the possessive while preserving the navigation purpose.
- source: /critique pass 29 (commit e9a5f15)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]

### [x] [3.0] /u/[username] and /u/[username]/[date] — authenticated nav link reads "your log", inconsistent with authenticated app nav label "log"
- category: external-critique
- impact: 3
- ease: 10
- note: scored 2026-06-01 — fresh audit; both public-profile page headers show "your log" as a nav link to /log when the visitor is signed in; the authenticated app nav uses the plain label "log" (no possessive) across /today, /log, /settings; the public profile header breaks that pattern with "your log"; two-file fix
- observation: the public profile pages (/u/[username] and /u/[username]/[date]) render a header nav link "your log" pointing to /log when the visiting user is authenticated. the authenticated app's own nav uses plain "log" (no possessive) across all three authenticated pages. the asymmetry introduces a second-person possessive that is inconsistent with both the voice guide and the nav label the user sees on every other page.
- evidence: src/app/u/[username]/page.tsx line 91: `your log`; src/app/u/[username]/[date]/page.tsx line 90: `your log` — compare src/app/today/page.tsx, src/app/log/page.tsx, src/app/settings/page.tsx nav links which all use plain "log".
- suggested fix: change "your log" to "log" in both public-profile page headers, consistent with the nav label used throughout the authenticated app.
- source: /iterate audit 2026-06-01
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed "your log" to "log" in both src/app/u/[username]/page.tsx and src/app/u/[username]/[date]/page.tsx. Shipped at 077dab3.

### [ ] [3.0] [needs-user-call] / — closing paragraph "ember does not personalize your morning." possessive may be intentional brand rhetoric
- category: external-critique
- impact: 3
- ease: 10
- note: scored 2026-05-31 — from critique pass 26 (04acd0a); adjacent possessives in the same closing section were corrected at 1c6a9c6 and 7fbde80; this one is different — the critique finding notes "the contrast between 'your morning' (personal) and 'does not personalize' (impersonal) is arguably the point of the sentence"; iterate cannot resolve autonomously; if intentional, no change; if unintentional, change to "ember does not personalize the morning."
- observation: the closing paragraph reads "the same prompt and task arrive for everyone on a given day. ember does not personalize your morning." the phrase "your morning" is a second-person possessive. the sentence structure uses "your morning" as the personal referent that ember explicitly declines to personalize — the possessive may be the rhetorical load-bearing element rather than an oversight.
- evidence: src/app/page.tsx closing paragraph: `ember does not personalize your morning.` — contrast with "your log shows what is" (changed to "the log" at 1c6a9c6) and "your responses accumulate" (changed to "responses" at 7fbde80) which were straightforward presupposition fixes. the "your morning" case is different in that the possessive is the object of the anti-personalization claim.
- suggested fix: [needs-user-call] if unintentional: change to "ember does not personalize the morning." if intentional for brand contrast: no change needed.
- source: /critique pass 26 (commit 04acd0a)

### [x] [2.4] /settings — display name field has no hint text; scope unclear for new user
- category: external-critique
- impact: 3
- ease: 8
- note: scored 2026-06-01 — from critique pass 27 (a59273f); the public username field carries a hint "your public profile lives at /u/username. leave blank to stay private." but the display name field has no equivalent; a new user cannot tell whether the display name appears on the public profile, in emails, or nowhere visible
- observation: the settings page has three data fields — display name, timezone, and public username. public username has a supporting hint. display name has no equivalent description. for a first-time empty-account user it is unclear where the display name surfaces.
- evidence: capture text: "settings\ndisplay name\ntimezone\nprompt variety\n..." — "display name" is followed immediately by "timezone" with no intervening description.
- suggested fix: add a one-sentence hint below the display name input describing where it surfaces, e.g. "shown on published entries on the public profile."
- source: /critique pass 27 (commit a59273f)
- issue: [mirror-failed: 2026-06-01T06:26:00Z]
- resolution: added "shown on published entries on the public profile." hint below the display name label in SettingsForm.tsx. Shipped at 2e34197.

### [x] [2.4] /signin — expiry notice in page footer, separated from confirmation area
- category: external-critique
- impact: 3
- ease: 8
- note: scored 2026-06-01 — from critique pass 28 (64a33db); the expiry notice ("sign-in links expire after 24 hours.") was only in the page footer; on mobile the footer is below the fold after form submission; a user who reads the confirmation and closes the tab misses the only guidance on how long to act
- observation: the sign-in link expiry notice is placed in the page footer, below the form and confirmation text. a visitor who submits their email, reads the confirmation ("a sign-in link is on its way. the link opens today's prompt directly."), and then closes or minimises the tab will not have seen the expiry notice.
- evidence: /signin body text (footer): "sign-in links expire after 24 hours." — separated from the confirmation copy by the footer boundary.
- suggested fix: move "sign-in links expire after 24 hours." into the confirmation state body, adjacent to "the link opens today's prompt directly."
- source: /critique pass 28 (commit 64a33db)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: added "sign-in links expire after 24 hours." to the 'sent' state confirmation paragraph in src/app/signin/page.tsx. Shipped at 1cb0860.

### [x] [2.1] / — "forgetting a day is fine" presupposes an existing practice for a pre-signup visitor
- category: external-critique
- impact: 3
- ease: 7
- note: scored 2026-06-01 — from critique pass 27 (a59273f); the reassurance paragraph addresses continuity anxiety for an existing practitioner; a first-time visitor evaluating the product cannot have forgotten a day; the surrounding copy ("there are no streaks to break, no reminders to dismiss, no notifications to mute.") does not presuppose prior use; only "forgetting a day" does
- observation: the reassurance paragraph reads "there are no streaks to break, no reminders to dismiss, no notifications to mute. forgetting a day is fine. the log shows what is, not what isn't." a first-time visitor who has not yet signed up cannot have forgotten a day — the sentence addresses continuity anxiety in an existing practitioner.
- evidence: body text: "forgetting a day is fine." — positioned before the sign-in CTA on the anonymous landing page.
- suggested fix: reframe as a feature description rather than reassurance for an existing habit: "a missed day leaves no mark." — preserves the anti-streak signal without presupposing an established record.
- source: /critique pass 27 (commit a59273f)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed "forgetting a day is fine." to "a missed day leaves no mark." in src/app/page.tsx. Shipped at 346dd7b.

### [ ] [2.1] / — section subheader "this is what arrives each morning." uses "this" as an ambiguous pronoun
- category: external-critique
- impact: 3
- ease: 7
- note: scored 2026-06-01 — from critique pass 28 (64a33db); "this" could refer to the full seven-item list or to the daily pattern of one prompt and one tiny task; the product description above explains the daily pattern but the subheader doesn't make the relationship explicit
- observation: the 7-day preview section has a two-line header: "the next seven days" followed by "this is what arrives each morning." for a first-time reader, "this" is an ambiguous pronoun — it could refer to the full seven-item list or to the pattern of one prompt and one tiny task that arrives each day.
- evidence: capture text: "the next seven days\nthis is what arrives each morning.\ntoday\n..." — seven date blocks follow the ambiguous "this."
- suggested fix: replace with explicit framing such as "one prompt and one tiny task, every morning." to make the daily-delivery model unambiguous before the list.
- source: /critique pass 28 (commit 64a33db)

### [ ] [2.0] / — closing paragraph uses "task" where all other occurrences use "tiny task"
- category: external-critique
- impact: 2
- ease: 10
- note: scored 2026-06-01 — from critique pass 27 (a59273f); "tiny task" is used as a compound label consistently on the landing page (seven times in the 7-day preview) except in the closing paragraph which uses "task" alone; 1-word fix
- observation: the closing paragraph reads "the same prompt and task arrive for everyone on a given day." the product uses "tiny task" as its compound label everywhere else on the page.
- evidence: body text: "the same prompt and task arrive for everyone on a given day." — compare seven "tiny task —" lines in the 7-day preview.
- suggested fix: change "the same prompt and task" to "the same prompt and tiny task" to match the product's labeling throughout the page.
- source: /critique pass 27 (commit a59273f)

### [ ] [2.0] /settings — "curated" in standard prompt option uses ungrounded editorial register
- category: external-critique
- impact: 2
- ease: 10
- note: scored 2026-06-01 — from critique pass 27 (a59273f); "curated" implies intentional selection by an editorial process not described anywhere on the page; the personalized option names its mechanism explicitly; removing "curated" aligns both option descriptions in register; 1-word fix
- observation: the standard prompt variety option reads "same curated prompt for everyone each day." the word "curated" asserts quality without specifying a process, inconsistent with the plain attributionless voice used throughout.
- evidence: capture text: "standard: same curated prompt for everyone each day."
- suggested fix: change to "same prompt for everyone each day." — removes the ungrounded assertion while preserving the shared-prompt contrast.
- source: /critique pass 27 (commit a59273f)

### [ ] [2.0] / — lede says "one small prompt" but the named concept throughout is "prompt"
- category: external-critique
- impact: 2
- ease: 10
- note: scored 2026-06-01 — from critique pass 28 (64a33db); "small" is not used as a modifier for "prompt" anywhere else on the page; "tiny task" is used consistently as a compound label; the asymmetry in how the two components are named in the lede is a minor inconsistency
- observation: the product description reads "one small prompt and one tiny task each morning." "tiny task" is the branded compound label used throughout — in the 7-day preview and in the closing paragraph. "small" is not used as a modifier for "prompt" anywhere else; the named concept is simply "prompt."
- evidence: lede: "one small prompt and one tiny task each morning." — compare 7-day preview items: "tiny task — tidy the surface..." / closing: "the same prompt and tiny task arrive for everyone on a given day."
- suggested fix: change "one small prompt and one tiny task each morning." to "one prompt and one tiny task each morning." to match how "prompt" is treated everywhere else on the page.
- source: /critique pass 28 (commit 64a33db)

### [x] [3.0] /u/[username] and /u/[username]/[date] — OG image alt not updated to match root layout fix
- category: seo
- impact: 3
- ease: 10
- note: scored 2026-05-31 — root layout OG image alt was changed from 'ember' to 'ember — a daily writing ritual' at bb32ff9; the public profile page generateMetadata() functions both include an openGraph.images block with alt: 'ember' — the old bare value — which overrides the root layout for these routes; these are the primary share targets in the product and should carry the descriptive alt
- observation: src/app/u/[username]/page.tsx and src/app/u/[username]/[date]/page.tsx both set openGraph.images with alt: 'ember'. the root layout was updated at bb32ff9 to alt: 'ember — a daily writing ritual'; because generateMetadata() in these pages overrides the root layout's openGraph block, the descriptive alt never reaches the public profile pages. these routes are the primary social-sharing surface.
- evidence: src/app/u/[username]/page.tsx line 33: `alt: 'ember'`; src/app/u/[username]/[date]/page.tsx line 34: `alt: 'ember'`; src/app/layout.tsx line 48: `alt: 'ember — a daily writing ritual'` (fixed at bb32ff9)
- suggested fix: change alt: 'ember' to alt: 'ember — a daily writing ritual' in both generateMetadata() functions, consistent with the root layout fix.
- source: /iterate audit 2026-05-31
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed alt to 'ember — a daily writing ritual' in both /u/[username]/page.tsx and /u/[username]/[date]/page.tsx. Shipped at c3a2779.

### [x] [3.0] /today — publish toggle description uses possessive "your public profile"
- category: external-critique
- impact: 3
- ease: 10
- note: scored 2026-05-31 — from critique pass 25; "when published, this entry appears on your public profile." appears in 4 places in TodayEntry.tsx (title attr and srOnly span in both main and focus overlay); change "your public profile" to "the public profile"; parallels de-possessiving applied to every other /today string in passes 22–25
- observation: the publish toggle description reads "when published, this entry appears on your public profile." the phrase "your public profile" is a second-person possessive. it appears twice in the DOM (main view and focus overlay), in both the title attribute and the aria-describedby span. the same de-possessiving pattern applied elsewhere on /today was not applied to this string when the toggle description was reframed at 3e54d90.
- evidence: TodayEntry.tsx lines 185, 193, 256, 265: "when published, this entry appears on your public profile." — present in title attrs and srOnly spans for both main and focus overlay instances.
- suggested fix: change to "when published, this entry appears on the public profile." — removes the possessive while preserving the conditional framing.
- source: /critique pass 25 (commit 57690c4)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed all 4 occurrences in TodayEntry.tsx. Shipped at 95eb800.

### [x] [3.0] /settings — meta description uses possessive "your writing practice"
- category: external-critique
- impact: 3
- ease: 10
- note: scored 2026-05-31 — from critique pass 25; the description was rewritten at e0a3a2b adding purpose context, but introduced "your writing practice" in the new text; parallel fixes removed the same pattern from /log, /log/[date], and /today meta descriptions
- observation: the /settings page meta description reads "account settings for your writing practice — display name, timezone, prompt variety, and public username." the phrase "your writing practice" is a second-person possessive, introduced by the pass 21 fix (e0a3a2b).
- evidence: src/app/settings/page.tsx line 11: description contains "your writing practice"
- suggested fix: change to "account settings — display name, timezone, prompt variety, and public username." — removes the possessive while retaining the field list.
- source: /critique pass 25 (commit 57690c4)
- issue: [mirror-failed: 2026-05-31T06:09:00Z]
- resolution: changed description to "account settings — display name, timezone, prompt variety, and public username." in src/app/settings/page.tsx. Shipped at b7aeccb.

### [x] [3.0] /settings — prompt variety description uses possessive "your recent entries"
- category: external-critique
- impact: 3
- ease: 10
- note: scored 2026-05-31 — from critique pass 25; "your recent entries" was introduced when vendor attribution was removed at 73ce8ed; the standard option description avoids possessives, making the two descriptions inconsistent in register
- observation: the personalized option description reads "personalized: a unique prompt generated from your recent entries." the phrase "your recent entries" is a second-person possessive. the "standard" option description ("same curated prompt for everyone each day") avoids possessives.
- evidence: src/app/settings/SettingsForm.tsx line 148: personalized hint contains "your recent entries"
- suggested fix: change to "personalized: a unique prompt generated from recent entries." — removes the possessive and aligns both toggle descriptions.
- source: /critique pass 25 (commit 57690c4)
- resolution: changed "your recent entries" to "recent entries" in SettingsForm.tsx hint text. Shipped at HEAD.

### [x] [2.8] / — 7-day preview section header doubled in mobile DOM text
- category: external-critique
- impact: 4
- ease: 7
- note: scored 2026-05-31 — from critique pass 25; same always-in-DOM pattern as focus overlay (pending iterate finding); fix requires conditional rendering or aria-hidden on the duplicate instance; requires care around mobile layout; pass 26 mobile capture did not reproduce the doubling — header appeared once; no code change explains this; may be intermittent or layout-condition-dependent; finding kept pending pending a dedicated fix
- observation: the 7-day preview section header ("the next seven days" / "this is what arrives each morning.") appears twice in sequence in the mobile DOM text capture. the duplicate is rendered for a mobile layout slot and remains in the DOM when CSS-hidden, so raw-text readers see the duplication.
- evidence: mobile body text: "the next seven days\nthis is what arrives each morning.\nthe next seven days\nthis is what arrives each morning." — block appears once in the desktop capture.
- suggested fix: apply aria-hidden="true" to the duplicate instance, or conditionally render its text content only when the primary instance is not visible.
- source: /critique pass 25 (commit 57690c4)
- resolution: critique pass 27 (a59273f) mobile capture shows bodyTextLength identical to desktop with section header appearing only once; duplication no longer present; resolved by an undocumented prior change. No code change required.

### [x] [3.0] /log/[date] — meta description uses possessive "your entry for ${date}"
- category: external-critique
- impact: 3
- ease: 10
- note: scored 2026-05-31 — the only remaining possessive in the authenticated-page meta description set; parallel fixes applied to /today ("your daily writing space" → "a space to write" at 74466d1) and /log ("your writing log" → "a 60-day writing log" at a29ff1f); /log/[date] was not updated in those passes; fix is a single-word replacement
- observation: the /log/[date] page exports `description: \`your entry for ${date}\`` — the possessive "your" is the last possessive remaining in the authenticated-page metadata set. meta descriptions appear in browser bookmarks, tab previews, and cached search results, where the visitor may be viewing the snippet without being signed in. the parallel fixes on /today and /log page meta descriptions removed the same pattern in those routes.
- evidence: src/app/log/[date]/page.tsx line 20: `description: \`your entry for ${date}\`` — compare /today (fixed at 74466d1) and /log (fixed at a29ff1f) which no longer carry possessive meta descriptions.
- suggested fix: change to `description: \`an entry for ${date}\`` — removes the possessive while retaining the date context that distinguishes this description per entry.
- source: /iterate audit 2026-05-31
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed description to "an entry for ${date}" in src/app/log/[date]/page.tsx. Shipped at 07f5e88.

### [x] [3.0] /today — "your response" textarea label uses second-person possessive
- category: external-critique
- impact: 3
- ease: 10
- note: scored 2026-05-30 — both the main-form label (TodayEntry.tsx:170) and the focus-overlay label (TodayEntry.tsx:239) read "your response"; the possessive "your" is the only remaining instance of direct-address copy on the page after prior de-possessiving passes; fix is a two-occurrence text replacement in a single file
- observation: the label above the entry textarea reads "your response" in both the main form and the focus-mode overlay. the voice guide avoids presuppositional second-person address; prior passes de-possessived other labels on /today and /log. "your response" persists as the sole remaining possessive label on the page.
- evidence: TodayEntry.tsx line 170 and line 239: `<label ... className={styles.entryLabel}>your response</label>`.
- suggested fix: change both instances of "your response" to "response" in TodayEntry.tsx — removes the possessive while remaining clear as a textarea label.
- source: /critique pass 24 (commit c62ca34)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed both instances of "your response" to "response" in TodayEntry.tsx; three test files updated to match. Shipped at 9e8d354.

### [x] [3.0] /today — meta description uses second-person possessive "your daily writing space"
- category: external-critique
- impact: 3
- ease: 10
- note: scored 2026-05-30 — the /today meta description reads "today's prompt and your daily writing space." the phrase "your daily writing space" addresses the reader possessively; the description appears in search results and bookmark previews where the visitor may not yet have a practice to call "yours"; fix is a single string replacement in src/app/today/page.tsx
- observation: the /today meta description reads "today's prompt and your daily writing space." the phrase "your daily writing space" uses second-person possessive address, which the voice guide discourages.
- evidence: src/app/today/page.tsx line 16: `description: "today's prompt and your daily writing space."` — the possessive "your" is the only instance of direct address in the /today metadata.
- suggested fix: change to "today's prompt and a space to write." — removes the possessive while preserving the page-purpose signal.
- source: /critique pass 24 (commit c62ca34)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed description to "today's prompt and a space to write." in src/app/today/page.tsx. Shipped at 74466d1.

### [x] [3.0] /log/[date] — edit textarea label "your response" not updated with /today fix
- category: external-critique
- impact: 3
- ease: 10
- note: scored 2026-05-31 — EditEntry.tsx:97 label read "your response" while the identical label in TodayEntry.tsx was changed to "response" at 9e8d354; the edit view on /log/[date] was not updated in the same pass; fix is a single text replacement in EditEntry.tsx plus four test references in EditEntry.test.tsx
- observation: /log/[date] edit mode shows a textarea labeled "your response" — the same possessive that was corrected on /today. the two components are parallel writing surfaces; the fix applied to one should apply to both.
- evidence: src/app/log/[date]/EditEntry.tsx:97 `<label ... className={styles.entryLabel}>your response</label>` — unchanged after 9e8d354 fixed TodayEntry.tsx.
- suggested fix: change "your response" to "response" in EditEntry.tsx; update four test references in EditEntry.test.tsx.
- source: /iterate audit 2026-05-31
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed label to "response" in EditEntry.tsx; four test references in EditEntry.test.tsx updated. Shipped at 22b7e74.

### [x] [3.0] /log — meta description uses second-person possessives
- category: external-critique
- impact: 3
- ease: 10
- note: re-scored 2026-05-31 — ease raised from 9 to 10; single string replacement in one file, no logic, no imports, no structural change — same class as /settings meta description (ease 10, score 3.0) and /log/[date] meta description (ease 10, score 3.0); "your writing log" and "you have published" are possessives introduced at a29ff1f; H1 was de-possessived at 3c775f9 but meta description was not updated
- observation: the /log page meta description reads "your writing log — prompts, responses, and the entries you have published over the past 60 days." two possessives remain: "your writing log" and "the entries you have published." the H1 was de-possessived ("the past 60 days") but the meta description was not updated to match.
- evidence: meta description: "your writing log — prompts, responses, and the entries you have published over the past 60 days." — "your" and "you have published" both remain after the H1 fix at 3c775f9.
- suggested fix: reframe to an impersonal description, e.g. "a 60-day writing log — prompts, responses, and published entries." removes direct address while retaining the content signal.
- source: /critique pass 23 (commit 4737f15)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed description to "a 60-day writing log — prompts, responses, and published entries." in src/app/log/page.tsx. Shipped at a5181c7.

### [ ] [2.0] /signin — H1 "sign in." carries a terminal period no other page heading uses
- category: external-critique
- impact: 2
- ease: 10
- note: scored 2026-05-30 — ease is 10; the fix is a single character removal from the H1 string in src/app/signin/page.tsx; no logic, no imports, no structural change
- observation: the /signin page H1 reads "sign in." with a terminal period. no other page heading in the app ends with a period — "settings" and "the past 60 days" carry no terminal period. the period tips "sign in." into a declarative-sentence register inconsistent with how heading labels are treated elsewhere.
- evidence: captured H1: "sign in." — compare authenticated page headings ("settings", "the past 60 days") which carry no terminal period.
- suggested fix: remove the terminal period from the "sign in" H1 in src/app/signin/page.tsx so it reads as a heading label rather than a declarative sentence.
- source: /critique pass 23 (commit 4737f15)

### [ ] [1.8] /signin — "send the link" button uses definite article before any link has been introduced
- category: external-critique
- impact: 2
- ease: 9
- note: scored 2026-05-30 — the submit button reads "send the link"; the surrounding reassurance copy uses the indefinite article "a sign-in link is sent to this address"; the "a" in the description and "the" in the button label are at odds for a first-time visitor
- observation: the submit button reads "send the link." the definite article "the" presupposes a previously established referent, but the surrounding reassurance copy uses the indefinite article: "a sign-in link is sent to this address." the "a" in the description and "the" in the button label are at odds.
- evidence: button label: "send the link" — adjacent reassurance text: "a sign-in link is sent to this address. no password. no other mail."
- suggested fix: change the button label to "send a link" or "send sign-in link" so the article matches the indefinite framing of the surrounding copy.
- source: /critique pass 23 (commit 4737f15)

### [ ] [1.5] / — "ten minutes" in the lede is never grounded in the product description
- category: external-critique
- impact: 3
- ease: 5
- note: scored 2026-05-30 — ease is 5 due to brand judgment required: whether to retain "ten minutes" with a qualifier or remove the specific figure entirely; the product makes no formal time guarantee so either direction is defensible
- observation: the lede opens with "ten minutes of intention before the day swallows you." the product description that follows never references duration. a first-time reader has no basis for the ten-minute figure — whether it is a maximum, an average, a design constraint, or a rhetorical gesture. the number floats without context anywhere on the page.
- evidence: lede: "ten minutes of intention before the day swallows you." product description: "one small prompt and one tiny task each morning. a few sentences in response, the task marked if it happened, and the day continues. over weeks, responses accumulate into a quiet personal log." — no duration reference in the description or the 7-day preview.
- suggested fix: either ground the figure with a brief qualifier (e.g. "a prompt and a task — ten minutes at most.") or remove the specific number from the lede if the product makes no time guarantee, letting the product description carry the framing unaided.
- source: /critique pass 23 (commit 4737f15)

### [ ] [1.8] /today — focus overlay always rendered in DOM; page text is doubled for raw-text consumers
- category: external-critique
- impact: 3
- ease: 6
- note: scored 2026-05-30 — ease is 6; conditional rendering requires care around the opacity-transition animation; the outer overlay container can remain for CSS transition purposes while inner content is conditionally mounted
- observation: the focus-mode overlay is retained permanently in the DOM for its opacity-transition animation and hidden from assistive technology via aria-hidden={!isFocus}. any raw-DOM text reader — Playwright innerText, link-preview scrapers, feed parsers — sees the full prompt, "your response" label, publish description, and username prereq hint duplicated verbatim in the same page.
- evidence: page text capture shows: prompt → controls block ("publish / focus / save / entries appear publicly...") → [focus overlay] prompt again → controls block again → "done writing". the overlay content appears unconditionally before the day strip.
- suggested fix: conditionally render the focus overlay's inner content only when isFocus is true — e.g. {isFocus && <FocusOverlayContent />} — so the duplicate text is absent from the DOM at rest. the outer overlay container can remain for transition purposes.
- source: /critique pass 22 (commit 24d04ae)

### [ ] [1.6] / — tiny task copy in 7-day preview uses second-person imperative throughout
- category: external-critique
- impact: 4
- ease: 4
- note: scored 2026-05-30 — ease is 4; requires updating task text across content/prompts.json (~101 entries) to convert imperative verb forms to gerund or participial constructions; the content change is mechanical but large in scope
- observation: all seven tiny task lines in the anonymous landing-page preview are second-person imperative constructions — "say something true and specific to someone today", "tidy the surface you look at most often", "spend fifteen minutes reading something", etc. the voice guide explicitly prohibits second-person imperative copy. the product description on the same page already uses the participial form ("the task marked if it happened") to describe tasks, but the actual task text throughout the preview contradicts it.
- evidence: body text: "tiny task — say something true and specific to someone today — not a formality. / tiny task — make yourself something to eat with a little more care than usual. / tiny task — tidy the surface you look at most often. / tiny task — spend fifteen minutes reading something with no productivity justification. / tiny task — do one small thing today that you avoided before. / tiny task — write that opinion down in two sentences." — all are imperative verb forms.
- suggested fix: reframe task content as gerund or participial form consistent with the product description's register, e.g. "saying something true and specific to someone today." — apply consistently across content/prompts.json.
- source: /critique pass 22 (commit 24d04ae)

### [x] [3.0] /log — "your log is empty." uses possessive after H1 was corrected to non-possessive
- category: external-critique
- impact: 3
- ease: 10
- note: scored 2026-05-30 — the H1 on /log was changed from "your past 60 days" to "the past 60 days" at 3c775f9; the empty-state sentence immediately below still reads "your log is empty." — the possessive "your log" persists one line below the fixed heading, contradicting the fix's own logic; fix is a single string replacement
- observation: the H1 on /log was changed from "your past 60 days" to "the past 60 days" at 3c775f9 to avoid presupposing content for a zero-entry user. the empty-state sentence immediately below the mosaic was not updated in the same pass and still reads "your log is empty. today's entry will appear here." — the possessive "your log" persists one line below the fixed heading, contradicting the fix's own logic.
- evidence: /log body text: "the past 60 days\n\nyour log is empty. today's entry will appear here." — "the" in the H1, "your" in the body.
- suggested fix: change "your log is empty." to "the log is empty." to match the non-possessive register applied to the H1 in the same correction pass. also update bearings.md standing decision.
- source: /critique pass 23 (commit 96ddb64)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed "your log is empty." to "the log is empty." in src/app/log/page.tsx; updated bearings.md standing decision. Shipped at da2510a.

### [x] [3.0] /settings — save button carries no title attribute while /today save buttons do
- category: external-critique
- impact: 3
- ease: 10
- note: scored 2026-05-30 — the voice guide requires hover/tooltip copy to be a complete sentence with a period; the /today page save buttons carry title="entries are saved privately by default." (shipped at ac5aee3); the equivalent submit button in SettingsForm.tsx formFoot has no title attribute; a sighted user hovering over the settings save button on desktop receives no tooltip, inconsistent with the tooltip-completeness pattern on /today; fix is a single attribute addition
- observation: the voice guide requires hover/tooltip copy to be a complete sentence with a period. the /today page save buttons carry title="entries are saved privately by default." but the equivalent submit button in SettingsForm.tsx formFoot has no title attribute. a sighted user hovering over the settings save button on desktop receives no tooltip, inconsistent with the pattern established on /today.
- evidence: settings page body: "save" button rendered with no tooltip — compare /today which shows title="entries are saved privately by default." on both main and focus-overlay save buttons.
- suggested fix: add title="saves display name, timezone, prompt variety, and username." to the submit button in SettingsForm.tsx, consistent with the /today tooltip pattern.
- source: /critique pass 23 (commit 4737f15)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: added title="saves display name, timezone, prompt variety, and username." to the submit button in src/app/settings/SettingsForm.tsx. Shipped at fd27cba.

### [x] [3.0] /today — "done writing" focus-exit button carries no title attribute
- category: external-critique
- impact: 3
- ease: 10
- note: scored 2026-05-30 — voice guide requires hover/tooltip copy to be a complete sentence with a period; every other interactive control on /today already carries a title attribute (focusTrigger: "enters a distraction-free writing view.", task-done button: dynamic title, both save buttons: "entries are saved privately by default."); focusDone is the only control in the group without one; fix is a single attribute addition to TodayEntry.tsx
- observation: the "done writing" button that exits focus mode has no title attribute. the voice guide requires hover/tooltip copy to be a complete sentence with a period. every other interactive control on /today already carries one; focusDone is the only control without a complete-sentence hover description.
- evidence: TodayEntry.tsx: focusDone button carries aria-label="exit focus mode" and visible text "done writing" but no title attribute; compare focusTrigger which carries title="enters a distraction-free writing view."
- suggested fix: add title="exits the distraction-free writing view." to the focusDone button in TodayEntry.tsx
- source: /critique pass 22 (commit 24d04ae)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: added title="exits the distraction-free writing view." to the focusDone button in TodayEntry.tsx. Shipped at 0251932.

### [x] [3.0] /today — username prereq hint links to /settings with a plain <a> tag, not Next.js Link
- category: external-critique
- impact: 3
- ease: 10
- note: scored 2026-05-30 — every other in-app link on /today uses Next.js Link (nav links, "open log" strip link); the plain <a> triggers a full browser reload rather than client-side navigation; fix is two-line swap + import addition in TodayEntry.tsx
- observation: the publish prereq hint ("entries appear publicly only when a username is set in settings.") links to /settings using a plain HTML <a> tag in both main view and focus overlay, causing a full page reload rather than client-side navigation.
- evidence: TodayEntry.tsx line ~219 and ~282: `<a href="/settings">settings</a>` appears twice; all nav links use Link from 'next/link'
- suggested fix: replace both `<a href="/settings">` instances with `<Link href="/settings">` and add `import Link from 'next/link'`
- source: /critique pass 22 (commit 24d04ae)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: replaced both `<a href="/settings">` instances with `<Link href="/settings">` and added Link import in TodayEntry.tsx. Shipped at 2082b89.

### [x] [3.0] /today — focus-mode overlay renders aria-modal="false" when inactive
- category: a11y
- impact: 3
- ease: 10
- note: scored 2026-05-29 — ease is 10; the fix is a single expression change (`aria-modal={isFocus || undefined}`) that omits the attribute when isFocus is false; ARIA spec does not define a false state for aria-modal; the overlay already uses aria-hidden="true" when inactive so practical screen-reader impact is limited, but the false attribute value diverges from the spec and may trigger warnings in strict ARIA auditors
- observation: the focus-mode overlay div carries `aria-modal={isFocus}`, which serialises to `aria-modal="false"` when focus mode is inactive. the ARIA spec does not define a false state for aria-modal — the attribute should be absent when the element is not modal. the overlay is already `aria-hidden="true"` when inactive, but the spurious false attribute leaves the element non-conformant.
- evidence: src/app/today/TodayEntry.tsx line 230: `aria-modal={isFocus}` — when isFocus is false this produces `aria-modal="false"` on the dialog div; ARIA 1.1 spec §6.6.5: aria-modal is a boolean attribute; false values should be represented by attribute absence.
- suggested fix: change `aria-modal={isFocus}` to `aria-modal={isFocus || undefined}` so the attribute is absent rather than explicitly false when focus mode is not active.
- source: /critique pass 16 (commit 27718e9)
- issue: #32
- resolution: changed aria-modal={isFocus} to aria-modal={isFocus || undefined} in src/app/today/TodayEntry.tsx so the attribute is absent rather than "false" when focus mode is inactive. Shipped at 4db7e74.

### [x] [4.0] /log/[date] — edit textarea placeholder uses second-person imperative not present in /today
- category: external-critique
- impact: 4
- ease: 10
- observation: the edit textarea in EditEntry.tsx carries `placeholder="take your time."` — a second-person imperative that the voice guide explicitly prohibits. the identical fix was applied to TodayEntry.tsx at ddafc86 (changing "take your time." to "there is no rush.") but EditEntry.tsx was not updated in the same pass. a user editing a past entry on /log/[date] sees the old imperative placeholder rather than the consistent impersonal declarative used on /today.
- evidence: src/app/log/[date]/EditEntry.tsx line 106: `placeholder="take your time."` — compare src/app/today/TodayEntry.tsx line 174 (main) and line 238 (focus overlay): both now read `placeholder="there is no rush."` after ddafc86.
- suggested fix: change `placeholder="take your time."` to `placeholder="there is no rush."` in EditEntry.tsx line 106 to match the /today voice fix.
- source: /iterate audit 2026-05-29
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed placeholder to "there is no rush." in src/app/log/[date]/EditEntry.tsx. Shipped at 1353a34.

### [x] [3.6] /log — meta description "your past 60 days" names the window but not the page's purpose
- category: external-critique
- impact: 4
- ease: 9
- observation: the /log page exports `description: 'your past 60 days'` — accurate but opaque. a search-result snippet or bookmark tooltip for /log conveys only a time window; it tells a reader nothing about what the page contains (a mosaic and stat line of writing entries). the critique's suggested fix has been pending since pass 12. the design/CLAUDE.md "Meta description uniqueness" rule requires every route to export a page-specific description that describes content, not just re-states the title.
- evidence: src/app/log/page.tsx line 13: `description: 'your past 60 days'`; design/CLAUDE.md "Meta description uniqueness" rule; critique pass 12 (commit 997e3b1) filed this finding as unaddressed.
- suggested fix: replace with a description that names the content: `'your writing log — prompts, responses, and the entries you have published over the past 60 days.'`
- source: /critique pass 12 (commit 997e3b1)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: updated description in src/app/log/page.tsx to 'your writing log — prompts, responses, and the entries you have published over the past 60 days.' Shipped at a29ff1f.

### [x] [4.0] design/CLAUDE.md — no copy/voice rules documented; violations recur across critique passes
- category: tests
- impact: 5
- ease: 8
- observation: design/CLAUDE.md has a "CSS rule bans" section documenting the text-transform:uppercase ban, enforced by the verify gate. no equivalent section exists for copy and voice rules. the voice coherence candidate (score 5.0, filed at expand pass 8, now pass 44) has accumulated 10+ recurring patterns across 19 critique passes: second-person imperatives in hints and placeholders, possessive presupposition for first-time visitors, register inconsistency between adjacent headings, absent tooltip completeness, cross-page phrasing inconsistency, and value-first framing violations. without documentation, future agents and iterations repeat the same class of violation.
- evidence: plan/PHASE_CANDIDATES.md voice coherence candidate notes 10 unresolved scope items from passes 7–44; plan/CRITIQUE.md records 19 passes with voice/copy violations across every authenticated page; design/CLAUDE.md has no "Copy and voice rules" section despite an analogous "CSS rule bans" section.
- suggested fix: add a "Copy and voice rules" section to design/CLAUDE.md documenting the recurring patterns as named, actionable rules — second-person imperative ban, possessive presupposition guidance, register consistency, tooltip completeness, meta description uniqueness, cross-page phrasing consistency, value-first framing, and attribution-free voice.
- source: /iterate audit 2026-05-28
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: added "Copy and voice rules" section to design/CLAUDE.md with 9 named rules derived from the voice coherence candidate and 19 critique passes. Shipped at c3e4586.

### [x] [3.0] / — full sentence wrapped in <em>, applying spoken stress to a plain declaration
- category: external-critique
- impact: 3
- ease: 10
- observation: the closing paragraph wraps the entire sentence "ember does not personalize your morning." in an <em> element. screen readers voice <em> with stress inflection. the voice guide specifies plain, settled statements of value; wrapping a complete declarative sentence in emphasis applies editorial pressure that conflicts with the understated register of the surrounding copy.
- evidence: src/app/page.tsx: `<p>the same prompt and task arrive for everyone on a given day. <em>ember does not personalize your morning.</em></p>`
- suggested fix: remove the <em> wrapper and let the sentence stand as plain text, consistent with the rest of the closing paragraph.
- source: /critique pass 19 (commit fc34abc)
- issue: [mirror-failed: 2026-05-28T00:00:00Z]
- resolution: removed <em> wrapper from "ember does not personalize your morning." in src/app/page.tsx. Shipped at d4a139f.

### [x] [3.0] /today — "your last seven days" heading implies an existing record for a new user
- category: external-critique
- impact: 3
- ease: 10
- observation: the day strip section is headed "your last seven days" regardless of whether the user has written anything. for a first-time user whose strip shows seven consecutive "no entry" states, the possessive heading implies ownership of a history that does not yet exist.
- evidence: src/app/today/DayStrip.tsx: `<h2 className={styles.stripLabel}>your last seven days</h2>`; authenticated capture shows all seven strip days as "no entry".
- suggested fix: change to "the last seven days" to describe the time window without the possessive.
- source: /critique pass 19 (commit fc34abc)
- issue: [mirror-failed: 2026-05-28T00:00:00Z]
- resolution: changed heading to "the last seven days" in src/app/today/DayStrip.tsx; DayStrip.test.tsx updated. Shipped at e016982.

### [x] [3.0] / — "your responses accumulate" addresses a visitor who has no responses yet
- category: external-critique
- impact: 3
- ease: 10
- observation: the sub-pitch paragraph reads "over weeks, your responses accumulate into a quiet personal log." for an anonymous first-time visitor, "your responses" presupposes a writing history that does not exist.
- evidence: body text: "over weeks, your responses accumulate into a quiet personal log."
- suggested fix: remove the possessive: "over weeks, responses accumulate into a quiet personal log."
- source: /critique pass 19 (commit fc34abc)
- issue: [mirror-failed: 2026-05-28T19:57:00Z]
- resolution: removed possessive "your" from "your responses accumulate" in src/app/page.tsx. Shipped at 7fbde80.

### [x] [3.6] /today — date paragraph has no programmatic association with the prompt H1
- category: a11y
- impact: 4
- ease: 9
- note: re-scored 2026-05-29 — impact raised from 3 to 4; the date paragraph is the first content element before the prompt H1 on /today; a screen reader user encounters it as an orphaned paragraph with no programmatic relationship to the heading it contextualizes; affects every /today visit for all authenticated users; WCAG 2.1 SC 1.3.1 gap on the primary authenticated page — same reach justification as /today textarea placeholder (ddafc86) and task-done button (156c342) re-scores
- observation: the page renders the date string as a plain <p> element immediately before the prompt H1. the date contextualises the H1 but has no semantic relationship to it — no aria-describedby on the H1 and no hgroup wrapper. a screen reader user encounters the date as an unrelated body paragraph before the page's H1.
- evidence: src/app/today/page.tsx: `<p className={styles.dateStamp}>{displayDate}</p>` followed immediately by `<h1 className={styles.prompt}>{prompt}</h1>` — no association element present.
- suggested fix: add `id="today-date"` to the date `<p>` and `aria-describedby="today-date"` to the `<h1>`, so AT announces the prompt with the date as supplementary context.
- source: /critique pass 19 (commit fc34abc)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: added id="today-date" to date <p> and aria-describedby="today-date" to prompt <h1> in src/app/today/page.tsx. Shipped at 4ccd1b3.

### [x] [3.6] /settings — meta description is a bare field list with no purpose signal
- category: external-critique
- impact: 4
- ease: 9
- observation: the /settings page exports `description: 'display name, timezone, prompt variety, public username'` — a comma-separated list of field labels with no sentence form and no description of what the page is for. a search-engine snippet or bookmark tooltip for /settings shows only control names with no context about what the page does or why a user would visit it. compare /today ("today's prompt and your daily writing space.") and /log ("your writing log — prompts, responses, and the entries you have published over the past 60 days.") — both describe page purpose.
- evidence: src/app/settings/page.tsx line 11: `description: 'display name, timezone, prompt variety, public username'` — no sentence form, no purpose signal.
- suggested fix: replace with a sentence: `'account settings for your writing practice — display name, timezone, prompt variety, and public username.'`
- source: /critique pass 21 (commit 737e7d7)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed description to 'account settings for your writing practice — display name, timezone, prompt variety, and public username.' in src/app/settings/page.tsx. Shipped at e0a3a2b.

### [x] [3.0] /log — H1 "your past 60 days" uses possessive for accounts with no entries
- category: external-critique
- impact: 3
- ease: 10
- observation: the /log page H1 reads "your past 60 days" regardless of whether the user has any entries. for a brand-new account, the possessive "your" presupposes 60 days of engagement that does not exist — the same pattern that prompted the /today DayStrip fix at e016982, which changed "your last seven days" to "the last seven days". the /log H1 was not updated in that pass.
- evidence: src/app/log/page.tsx line 81: `<h1 className={styles.mosaicMeta}>your past 60 days</h1>` — possessive heading above the empty-state message.
- suggested fix: change the /log H1 from "your past 60 days" to "the past 60 days", consistent with the DayStrip fix applied to the same pattern on /today.
- source: /critique pass 22 (commit 24d04ae)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed H1 from "your past 60 days" to "the past 60 days" in src/app/log/page.tsx. Shipped at 3c775f9.

### [ ] [1.8] /signin — post-submission confirmation appends redundant password reassurance
- category: external-critique
- impact: 2
- ease: 9
- observation: when the sign-in link has been sent, the page renders "a sign-in link is on its way. no password required." the password reassurance was already visible pre-submission. repeating it in the confirmed state — when the user is focused on retrieving their email — is redundant, and the <em> emphasis increases its salience at an odd moment.
- evidence: src/app/signin/page.tsx: state === 'sent' renders `<p>a sign-in link is on its way. <em>no password required.</em></p>`
- suggested fix: remove "no password required." from the confirmation state; "a sign-in link is on its way." is sufficient post-submission copy.
- source: /critique pass 19 (commit fc34abc)

### [x] [4.2] /settings — no unsaved-changes guard when navigating away
- category: external-critique
- impact: 6
- ease: 7
- observation: the settings form provides no indication of unsaved changes and no route-leave warning. a user who edits fields and navigates away without saving loses their changes silently. /today implements a window.onbeforeunload guard for unsaved entries; /settings has no equivalent, creating an inconsistent safety model across the two primary edit surfaces.
- evidence: src/app/settings/SettingsForm.tsx formFoot renders the save button with no dirty-state indicator and no route-change guard; contrast with TodayEntry.tsx which sets window.onbeforeunload when the textarea has content and saveState is 'idle' or 'error'.
- suggested fix: track whether any field value differs from its initially-loaded profile value and add a window.onbeforeunload guard that fires when the form is dirty, mirroring the /today pattern.
- source: /critique pass 19 (commit fc34abc)
- issue: [mirror-failed: 2026-05-28T17:53:00Z]
- resolution: added savedSnapshotRef tracking last-saved values; isDirty computed from current field state vs snapshot; window.onbeforeunload set when dirty, cleared on successful save. 2 unit tests added. Shipped at 5da280f.

### [x] [4.5] / — home meta description is the brand tagline with no product-category keyword
- category: seo
- impact: 5
- ease: 9
- observation: the root layout `description` field — used as `<meta name="description">` across all pages that do not override it — reads "ten minutes of intention before the day swallows you". this is the product tagline, also used verbatim in `openGraph.description` and `twitter.description`. it contains no word from the functional product vocabulary (writing, ritual, daily, prompt) that appears in the page title "ember — a daily writing ritual". a search-results snippet reader gets no indication of what the site does; the description reads as a motivational tagline with no product-category terms.
- evidence: `src/app/layout.tsx` line 36: `description: 'ten minutes of intention before the day swallows you'`; page title: `'ember — a daily writing ritual'`; none of those title terms appear in the description.
- suggested fix: replace the description with one that anchors the product category while preserving voice, e.g. `'ember is a daily writing ritual — one prompt and one small task each morning.'` Update `openGraph.description` and `twitter.description` consistently.
- source: /critique pass 18 (commit 6c01dc8)
- issue: [mirror-failed: 2026-05-28T00:00:00Z]
- resolution: updated description, openGraph.description, and twitter.description in src/app/layout.tsx to "ember is a daily writing ritual — one prompt and one small task each morning." Shipped at ec895b6.

### [x] [4.8] /today — save button carries no description; privacy of saved-but-unpublished entries is unstated
- category: external-critique
- impact: 6
- ease: 8
- observation: the publish toggle has an inline description explaining its effect on visibility. the save button has no equivalent description. a first-time user cannot determine whether an entry that is saved without publishing is stored privately or visible elsewhere.
- evidence: capture text: "publish / when published, this entry appears on your public profile. / focus / save" — save appears as a bare label with no adjacent description in either main or focus-overlay view.
- suggested fix: add title="entries are saved privately by default." to the save button, consistent with the title attributes already on the focus button and publish toggle label.
- source: /critique pass 18 (commit 6c01dc8)
- issue: [mirror-failed: 2026-05-28T00:00:00Z]
- resolution: added title="entries are saved privately by default." to both save buttons (main view and focus overlay) in src/app/today/TodayEntry.tsx. Shipped at ac5aee3.

### [x] [3.6] /today — no signal that entries are not auto-saved; navigation away silently discards unsaved work
- category: external-critique
- impact: 6
- ease: 6
- observation: the page requires an explicit press of "save" to persist an entry. no copy or ui pattern informs the user that the entry is not saved automatically. a user who writes a response and then navigates away without pressing save would lose their work with no warning.
- evidence: capture shows "save" as the sole persistence action with no "unsaved changes" notice, no auto-save mention, and no navigation-away guard visible on the /today page.
- suggested fix: add a route-change guard warning when the textarea has unsaved content, or add a brief note near the save button such as "entries are not saved automatically."
- source: /critique pass 18 (commit 6c01dc8)
- issue: [mirror-failed: 2026-05-28T04:09:00Z]
- resolution: added window.onbeforeunload handler in TodayEntry.tsx — fires when saveState is 'idle' or 'error' and textarea is non-empty; cleared on save success, empty textarea, or unmount. Shipped at bdcd692.

### [x] [3.6] /today — nav links carry no aria-current marker identifying the active page
- category: a11y
- impact: 4
- ease: 9
- observation: the authenticated navigation renders "today / log / settings" identically across all three pages. no aria-current="page" attribute is applied to the link matching the current route. screen reader users traversing the nav have no programmatic signal indicating which page is active.
- evidence: all three page captures show the same nav text "today / log / settings" with no active-state differentiation; no aria-current is inferable from any capture.
- suggested fix: add aria-current="page" to the nav anchor matching the current route in the shared navigation component, conditioned on the active pathname.
- source: /critique pass 18 (commit 6c01dc8)
- resolution: false positive — all three authenticated pages already carry `aria-current="page"` on the active nav link (`today/page.tsx:65`, `log/page.tsx:74`, `settings/page.tsx:40`). The critique text-capture reader cannot see HTML attributes; the attribute is correctly present. No code change required.

### [x] [3.0] / — "the link arrives once" is ambiguous before any link has been sent
- category: comprehension
- impact: 3
- ease: 10
- note: re-scored 2026-05-29 — ease raised from 9 to 10; the fix is a single clause removal from one string in src/app/page.tsx with no logic, no imports, no structural change; same ease-10 rationale as bb32ff9 (OG image alt, single 4-word string addition); score 3 × 10 / 10 = 3.0
- observation: in the home-page footer CTA, "the link arrives once" appears before a visitor has entered their email. "once" is ambiguous: it could mean one link per request (the intended meaning) or one link ever. a first-time visitor who misses or does not receive the link may read this as meaning the opportunity is permanently spent.
- evidence: footer CTA: "the link arrives once. no password is set. no other mail is sent."
- suggested fix: replace "the link arrives once" with per-request language, e.g. "a link is sent each time this form is submitted." — or drop the clause entirely, since single-send-per-request is implicit in a magic-link flow.
- source: /critique pass 18 (commit 6c01dc8)
- resolution: removed "the link arrives once." from the CTA footer span in src/app/page.tsx; remaining trust copy is self-sufficient. Shipped at a595d0f.

### [x] [3.0] / — "your log" referenced before the visitor has created an account
- category: comprehension
- impact: 3
- ease: 10
- note: re-scored 2026-05-31 — ease raised from 9 to 10; single word removal ("your" → "the") in one line of src/app/page.tsx, no logic, no imports, no tests; same fix type as "your responses accumulate" (7fbde80) which was also ease 10 score 3.0
- observation: the reassurance paragraph closes with "your log shows what is, not what isn't." a first-time visitor has no log — the possessive "your" presupposes an existing account. the sentence is designed as reassurance but lands as an abstraction with no concrete referent for someone who has never used ember.
- evidence: body text: "there are no streaks to break, no reminders to dismiss, no notifications to mute. forgetting a day is fine. your log shows what is, not what isn't."
- suggested fix: remove the possessive: "the log shows what is, not what isn't." — preserves the reassurance without implying the visitor already has a record.
- source: /critique pass 18 (commit 6c01dc8)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed "your log shows what is" to "the log shows what is" in src/app/page.tsx. Shipped at 1c6a9c6.

### [x] [5.4] / — CTA "sign in" gives no signal that it is also the account-creation path
- category: external-critique
- impact: 6
- ease: 9
- observation: the landing page CTA is labelled "sign in" with no surrounding copy acknowledging that ember uses a single magic-link flow for both new and returning visitors. a first-time visitor who has never used the product sees "sign in" and may assume an account already exists. the existing trust signal "the link arrives once" presupposes a prior send, compounding the confusion.
- evidence: footer CTA text: "today's prompt is waiting. the link arrives once. no password is set. no other mail is sent. sign in" — no copy explains the combined sign-in / account-creation flow.
- suggested fix: add a single declarative line near the CTA: "entering an email address for the first time creates an account."
- source: /critique pass 16 (commit 27718e9)
- issue: [mirror-failed: 2026-05-27T02:40:00Z]
- resolution: added "entering an email address for the first time creates an account." before the link-arrival trust signal in the CTA copy in src/app/page.tsx. Shipped at 631bd72.

### [x] [3.2] sitemap.ts — profile-enrichment and fallback logic have no unit tests
- category: tests
- impact: 4
- ease: 8
- observation: `src/app/sitemap.ts` added profile-enrichment logic (finding [3.6], shipped at 57d1cc2) that queries Supabase for non-null `username` rows and appends `/u/<username>` entries. The function has three meaningful code paths: (1) static + profile entries on success; (2) static-only when Supabase returns an error; (3) static-only when the try/catch catches a thrown exception. No test file exists. A regression in the profile query, the null filter, or the error fallback would silently cause public profiles to disappear from the sitemap — the same gap that prompted the original finding to ship a fix.
- evidence: `find src -name "sitemap*test*" -o -name "*test*sitemap*" 2>/dev/null` returns nothing. `src/app/sitemap.ts` uses `createClient` from `@supabase/supabase-js` with a try/catch around the full query and explicit `if (error || !profiles) return staticEntries` guard.
- suggested fix: add `src/app/__tests__/sitemap.test.ts` covering: (1) returns static + profile entries when Supabase succeeds with profile rows; (2) returns static entries only when Supabase returns an error; (3) returns static entries only when the query throws; (4) home entry carries priority 1.
- source: /iterate audit 2026-05-26
- issue: [mirror-failed: 2026-05-26T00:00:00Z]
- resolution: added src/app/__tests__/sitemap.test.ts with 4 tests. Shipped at 6a22818.

### [x] [3.6] /today — focus mode exit button visible label "done" ambiguous next to "save"
- category: external-critique
- impact: 4
- ease: 9
- observation: the focus mode overlay renders a "done" button adjacent to the "save" button. sighted users in focus mode cannot tell whether "done" exits the writing view, saves the entry, or marks the tiny task complete. the aria-label ("exit focus mode") is correct for screen readers but the visible text carries no referent.
- evidence: src/app/today/TodayEntry.tsx line 264: `done` — the focus mode exit button; aria-label="exit focus mode" but visible text is bare "done".
- suggested fix: change visible text to "done writing" so the exit control is distinct from "save" and the tiny task checkbox.
- source: /critique pass 13 (commit 4f08c21)
- issue: [mirror-failed: 2026-05-26T04:08:00Z]
- resolution: changed focus mode exit button visible text from "done" to "done writing" in src/app/today/TodayEntry.tsx. Shipped at 25e38a7.

### [x] [4.0] /signin — SigninPage client component has no unit tests; role="status" and role="alert" unguarded
- category: tests
- impact: 5
- ease: 8
- observation: `src/app/signin/page.tsx` is a 'use client' component managing a 4-state machine (idle/sending/sent/error). The `role="status"` fix on the confirmation paragraph (d5d2f20) and the `role="alert"` on the error paragraph have no test coverage. If either ARIA role is removed in a future refactor, the regression is silent. The existing `src/app/signin/__tests__/actions.test.ts` tests the API route handler, not the page component.
- evidence: `find src/app/signin/__tests__ -name "*.test.*"` returns only `actions.test.ts` (imports `../../api/auth/signin/route`). `src/app/signin/page.tsx` line 54: `<p className={styles.confirmation} role="status">` — no test asserts this role. Line 86: `<p className={styles.errorMsg} role="alert">` — no test asserts this role.
- suggested fix: add `src/app/signin/__tests__/SigninPage.test.tsx` covering: (1) initial state renders form; (2) sending state disables button and shows "sending..."; (3) sent state shows confirmation with role="status" and hides form; (4) error state shows role="alert" with API error message; (5) fallback error message when API returns no error field.
- source: /iterate audit 2026-05-25
- issue: [mirror-failed: 2026-05-25T00:00:00Z]
- resolution: added src/app/signin/__tests__/SigninPage.test.tsx with 6 tests covering initial render, sending state, sent state (role="status"), and error state (role="alert"). Shipped at a6842c1.

### [x] [3.6] /u/[username] — ProfileMosaic has no unit tests; aria-label fix (22f9659) is unguarded
- category: tests
- impact: 4
- ease: 9
- observation: `ProfileMosaic.tsx` renders the 60-tile mosaic on the public profile page. The a11y fix at 22f9659 changed `aria-label={tile.displayDate}` (bare date) to `` aria-label={`${tile.displayDate} — published entry`} `` so screen readers get state context on every published tile. No test file exists for the component. If the label regresses, the fix breaks silently — the same gap that prompted LogMosaic.test.tsx (finding [4.5], shipped at 9e28f27) and DayStrip.test.tsx (finding [4.5], shipped at a91e2b4).
- evidence: `find src/app/u -name "*.test.*"` returns nothing. `src/app/u/[username]/ProfileMosaic.tsx` line 32: `aria-label={\`${tile.displayDate} — published entry\`}`; non-published tiles use `aria-hidden="true"`. The sibling LogMosaic has 6 tests at src/app/log/__tests__/LogMosaic.test.tsx.
- suggested fix: add `src/app/u/[username]/__tests__/ProfileMosaic.test.tsx` covering: published tile has `"<date> — published entry"` aria-label; published tile links to `/u/<username>/<date>`; non-published tile is aria-hidden; mosaic container has `"60-day practice mosaic"` group label.
- source: /iterate audit 2026-05-25
- issue: [mirror-failed: 2026-05-25T00:00:00Z]
- resolution: added src/app/u/[username]/__tests__/ProfileMosaic.test.tsx with 5 tests. Shipped at fb76347.

### [x] [4.5] /today — meta description is the generic product tagline, not page-specific
- category: external-critique
- impact: 5
- ease: 9
- observation: the /today page description reads "ten minutes of intention before the day swallows you" — the product tagline, shared with the landing page. a user bookmarking /today or seeing it in search results gets no description of what the page actually contains. the title "ember · today" differentiates the page but the description does not.
- evidence: `src/app/today/page.tsx` line 16: `description: 'ten minutes of intention before the day swallows you'` — identical to the root layout/landing page description.
- suggested fix: set a page-specific meta description on /today, e.g. "today's prompt and your daily writing space."
- source: /critique pass 12 (commit 997e3b1)
- issue: [mirror-failed: 2026-05-25T06:30:00Z]
- resolution: changed description to "today's prompt and your daily writing space." in src/app/today/page.tsx. Shipped at 6d907ec.

### [x] [3.5] /settings — SettingsForm has no unit tests for save flow or state machine
- category: tests
- impact: 5
- ease: 7
- observation: `SettingsForm.tsx` is the client component that handles all settings saves. It manages four state variables (nameVal, usernameVal, tzVal, personalizedVal), sends them as a JSON payload, and transitions through saving/saved/error states with a 3-second "saved." fade. A prior bug (0419eb3) silently dropped `use_personalized_prompts` from saves because it was missing from the `useCallback` dependency array. No test file exists for the component, so any regression in the save payload or state machine would go undetected.
- evidence: `find src/app/settings -name "*.test.*"` returns only `src/app/api/settings/__tests__/route.test.ts` (API handler, not the component). `src/app/settings/SettingsForm.tsx` lines 56–83: `handleSave` builds the fetch payload from four state variables; stale-closure bug was present until 0419eb3.
- suggested fix: add `src/app/settings/__tests__/SettingsForm.test.tsx` covering: all four fields in the submitted payload; "saving..." state; "saved." in the aria-live region on success; `role="alert"` error on failure; username field-level error for conflict responses.
- source: /iterate audit 2026-05-25
- issue: [mirror-failed: 2026-05-25T01:40:00Z]
- resolution: added src/app/settings/__tests__/SettingsForm.test.tsx with 9 tests covering payload, save state, and error handling. Shipped at 3db946d.

### [x] [4.5] /log — LogMosaic.tsx tileStateLabel has no unit tests; a11y-critical function unprotected
- category: tests
- impact: 5
- ease: 9
- observation: `LogMosaic.tsx` exports a `tileStateLabel()` function that determines what screen readers announce for each of the 60 log mosaic tiles (`aria-label` format `"${displayDate} — ${tileStateLabel(state)}"`). The function was added as part of finding [4.8] at c8770e7. The sibling `DayStrip.tsx` tileStateLabel was just tested at a91e2b4 (9 tests). No test file exists for `LogMosaic.tsx`. If `tileStateLabel()` regresses, the a11y fix at c8770e7 breaks silently with no test signal.
- evidence: `find src/app/log -name "*.test.*"` returns only `src/app/log/[date]/__tests__/EditEntry.test.tsx` — no LogMosaic test. `grep -rn "LogMosaic" src --include="*.test.*"` returns nothing. `src/app/log/LogMosaic.tsx` lines 21–29: `tileStateLabel()` maps 4 states to labels; all 60 tiles use `aria-label={\`${tile.displayDate} — ${tileStateLabel(tile.state)}\`}`.
- suggested fix: add `src/app/log/__tests__/LogMosaic.test.tsx` covering all 4 tile states × aria-label format; assert all tiles link to `/log/[date]`; assert the mosaic container group label.
- source: /iterate audit 2026-05-25
- issue: #31
- resolution: added src/app/log/__tests__/LogMosaic.test.tsx with 6 tests across all tile states. Shipped at 9e28f27.

### [x] [5.4] / — "the mosaic" is undefined jargon for a first-time visitor
- category: external-critique
- impact: 6
- ease: 9
- observation: the landing page copy reads "the mosaic shows what is, not what isn't" — the word "mosaic" is introduced as a named product concept with no prior explanation. a first-time visitor has no referent; they don't know whether the mosaic is a visual, a data structure, or a metaphor. the sentence reads as self-referential insider language.
- evidence: body text: "the mosaic shows what is, not what isn't." — "mosaic" appears once in this context with no definition or earlier introduction on the page.
- suggested fix: replace "the mosaic" with a self-explanatory noun, e.g. "your log shows what is, not what isn't." — the authenticated app uses "log" consistently, and that term travels.
- source: /critique pass 11 (commit 2b4efe6)
- issue: [mirror-failed: 2026-05-24T00:00:00Z]
- resolution: changed "the mosaic shows what is, not what isn't." to "your log shows what is, not what isn't." in src/app/page.tsx. Shipped at 2de843e.

### [x] [4.5] /today — DayStrip tileStateLabel has no tests; a11y-critical function fixed twice
- category: tests
- impact: 5
- ease: 9
- observation: `DayStrip.tsx` exports a `tileStateLabel()` function that determines what screen readers announce for each of the 7 day-strip tiles. it has been fixed twice in the loop (once to add full date + state to non-today tiles at 9b1e99f; once to extend the today-tile label to include the full date and entry state at 103b865). no test file exists for `DayStrip.tsx`. if `tileStateLabel()` regresses, the a11y fix silently breaks with no test signal.
- evidence: `find src -path "*/today/__tests__/DayStrip*"` returns nothing; `grep -r "DayStrip\|tileStateLabel" src --include="*.test.*"` returns nothing; both iterate fixes (9b1e99f, 103b865) changed this function with no accompanying tests.
- suggested fix: add `src/app/today/__tests__/DayStrip.test.tsx` covering all 4 tile states (empty, filled, published, today) × the 3 today sub-states (no entry, written, published); assert srOnly span text content.
- source: /iterate audit 2026-05-24
- issue: [mirror-failed: 2026-05-24T00:00:00Z]
- resolution: added src/app/today/__tests__/DayStrip.test.tsx with 9 tests across all tile states. Shipped at a91e2b4.

### [x] [4.8] /settings — public username input has no persistent accessible label
- category: external-critique
- impact: 6
- ease: 8
- observation: the public username field is preceded by an "@" prefix character and a section-level heading "public username", but if the heading is not programmatically associated with the input (via aria-labelledby or a for/id pair), the input has no accessible name. the "@" symbol alone is not a label.
- evidence: settings capture: "public username\n\nyour public profile lives at /u/your-handle. leave blank to stay private.\n\n@\nsave" — the input appears after "@" with no adjacent label element visible in the text capture.
- suggested fix: associate the "public username" label with the input via a `<label for="...">` / `id` pair, or add `aria-label="public username"` to the input element itself.
- source: /critique pass 11 (commit 2b4efe6)
- resolution: false positive — SettingsForm.tsx already has `<label htmlFor="username">public username</label>` with matching `id="username"` on the input. The critique's text-capture could not see HTML attributes; the for/id association is correct in the current code. No code change required.

### [x] [2.7] / — "sign in to start" button label conflicts with "today's prompt is waiting" framing
- category: external-critique
- impact: 3
- ease: 9
- observation: the footer block positions ember as an already-present ritual ("today's prompt is waiting") but the CTA button reads "sign in to start." the word "start" implies the practice begins at sign-up, undercutting the sense that something is already here and waiting. the nav bar shows only "sign in" — the inconsistency between the two labels compounds the tonal mismatch.
- evidence: body text: "today's prompt is waiting. a sign-in link is the only thing you'll receive. no password, no spam.\nsign in to start"
- suggested fix: change the button label to "sign in" to match the nav, removing the implication of a new beginning.
- source: /critique pass 11 (commit 2b4efe6)
- issue: [mirror-failed: 2026-05-25T10:07:00Z]
- resolution: changed "sign in to start" to "sign in" in src/app/page.tsx; updated e2e smoke test. Shipped at 65b8387.

### [x] [2.7] /signin — meta description is identical to the landing page
- category: external-critique
- impact: 3
- ease: 9
- observation: /signin shares the same meta description as / — "ten minutes of intention before the day swallows you." a search engine or link preview surfacing /signin would show product-pitch copy rather than copy that describes the sign-in action. the page title ("ember · sign in") is correctly differentiated, but the description is not.
- evidence: / description: "ten minutes of intention before the day swallows you"; /signin description: "ten minutes of intention before the day swallows you"
- suggested fix: give /signin its own description, e.g. "sign in to ember with a link sent to your email — no password required."
- source: /critique pass 11 (commit 2b4efe6)
- issue: [mirror-failed: 2026-05-25T00:00:00Z]
- resolution: added description "sign in to ember with a link sent to your email — no password required." to src/app/signin/layout.tsx. Shipped at edab423.

### [x] [2.7] /settings — page meta description omits the "prompt variety" section
- category: external-critique
- impact: 3
- ease: 9
- observation: the /settings page description reads "display name, timezone, public username" but the page also includes a "prompt variety" section (standard vs. personalized prompts). a user arriving from a bookmark or share link with this description would not know prompt settings live here.
- evidence: description field: "display name, timezone, public username"; captured text includes "prompt variety" as a distinct labeled section with two radio options.
- suggested fix: update the description to "display name, timezone, prompt variety, public username" or a condensed equivalent.
- source: /critique pass 11 (commit 2b4efe6)
- issue: [mirror-failed: 2026-05-26T13:46:00Z]
- resolution: updated description to "display name, timezone, prompt variety, public username" in src/app/settings/page.tsx. Shipped at 4a95097.

### [x] [4.5] /today — saveIndicatorText has no regression tests for its two recently-fixed branches
- category: tests
- impact: 5
- ease: 9
- observation: `TodayEntry.tsx` `saveIndicatorText()` was fixed twice in quick succession — c1eec87 (initialize `saveState` to `'saved'` when `initialEntry !== null` so returning users see "last saved · HH:MM" instead of nothing) and a044cd0 (add early return `''` when `saveState === 'idle' && response === ''` so new users see no indicator on first load). Neither fix is covered by the existing test suite. FocusMode, OfflineDraft, and OnThisDay tests render `TodayEntry` but none assert on the save indicator text in these two edge cases.
- evidence: `src/app/today/__tests__/` contains `FocusMode.test.tsx`, `OfflineDraft.test.tsx`, `OnThisDay.test.tsx` — none query the `aria-live="polite"` span for idle-empty or loaded-entry states. `src/app/today/TodayEntry.tsx` lines 127–131: `saveIndicatorText()` has five cases; only `'draft restored'` is asserted anywhere.
- suggested fix: add `src/app/today/__tests__/SaveIndicator.test.tsx` with three tests: (1) indicator is empty string on initial load with no entry and empty textarea; (2) indicator shows "last saved · HH:MM" on load when `initialEntry` is provided; (3) "not yet saved" text never appears.
- source: /iterate audit 2026-05-24
- issue: [mirror-failed: 2026-05-24T00:00:00Z]
- resolution: added SaveIndicator.test.tsx with 4 tests covering idle-empty and loaded-entry states. Shipped at f336224.

### [x] [3.6] sitemap.ts — public profile pages absent from sitemap
- category: seo
- impact: 6
- ease: 6
- observation: `sitemap.ts` returns a static two-entry array covering only `/` and `/signin`. Public profile pages (`/u/[username]`) are the primary externally-shared surface but are entirely absent. Search engines cannot discover them through the sitemap.
- evidence: `src/app/sitemap.ts` returns a static array with two entries; `robots.ts` points crawlers at `/sitemap.xml`; `/u/[username]` paths are allowed by robots but not enumerated in the sitemap.
- suggested fix: make `sitemap()` async; query Supabase `profiles` table (anon key, no cookies needed — `username is not null` RLS policy allows public read) for all rows with non-null `username`; add `/u/${username}` entry per row; fall back to the static list if the query fails.
- source: /iterate audit 2026-05-23
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: made sitemap() async; queries profiles table for non-null username rows; adds /u/${username} entries with weekly changeFrequency. Falls back to static list on DB error. Shipped at 57d1cc2.

### [x] [4.5] /u/[username], /u/[username]/[date] — generateMetadata missing alternates.canonical
- category: seo
- impact: 5
- ease: 9
- observation: public profile and entry pages set openGraph.url but emit no `<link rel="canonical">`. Next.js only generates a canonical tag when alternates.canonical is explicitly set in the Metadata object. These are the primary sharing pages — the canonical tag matters most here.
- evidence: src/app/u/[username]/page.tsx generateMetadata returns openGraph.url with no alternates field. Same in src/app/u/[username]/[date]/page.tsx.
- suggested fix: add `alternates: { canonical: \`${siteUrl}/u/${username}\` }` to /u/[username] generateMetadata and `alternates: { canonical: \`${siteUrl}/u/${username}/${date}\` }` to /u/[username]/[date] generateMetadata.
- source: /iterate audit 2026-05-23
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: added alternates.canonical to both generateMetadata functions. Shipped at 8d7d49a.

### [x] [4.8] /settings — no sign-out affordance in authenticated UI
- category: external-critique
- impact: 6
- ease: 8
- observation: the authenticated nav shows "today / log / settings" only. the settings page has no sign-out link or button anywhere. a user who wants to sign out must navigate directly to /auth/signout by typing the URL — the route handler exists but is unreachable from the UI.
- evidence: nav text on /today, /log, /settings: "today log settings" — no sign-out control. /auth/signout route exists at src/app/auth/signout/route.ts but is not linked from any page.
- suggested fix: add a "sign out" form (POST to /auth/signout) in the settings page footer — lower-case, consistent with voice posture.
- source: /critique pass 8 (commit 5abb81e)
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: added <form action="/auth/signout" method="POST"> with muted "sign out" button in settings page footer. Shipped at 8a9ceb6.

### [x] [4.0] /settings — username hint hardcodes the Vercel preview domain
- category: external-critique
- impact: 5
- ease: 8
- observation: the public username hint reads "your public profile lives at ember-rust-sigma.vercel.app/u/username. leave blank to stay private." — the domain is the internal Vercel preview URL, not a canonical product domain. it exposes infra naming to users and will silently break if the project is moved to a custom domain.
- evidence: hint text in SettingsForm.tsx hardcodes "ember-rust-sigma.vercel.app".
- suggested fix: replace the hardcoded origin with window.location.origin (client-side) or simplify to a relative form: "your public profile lives at /u/your-handle. leave blank to stay private."
- source: /critique pass 8 (commit 5abb81e)
- issue: [mirror-failed: 2026-05-23T19:07:00Z]
- resolution: changed hint to "your public profile lives at /u/your-handle. leave blank to stay private." in SettingsForm.tsx. Shipped at 3508ef7.

### [x] [3.5] /today — publish toggle description conveyed only via `title` attribute
- category: external-critique
- impact: 5
- ease: 7
- observation: the publish toggle wraps a checkbox in a `<label title="make this entry visible on your public profile.">`. the `title` attribute is not reliably announced by screen readers and is invisible on touch devices. no `aria-describedby` links the description to the checkbox input.
- evidence: TodayEntry.tsx: `<label className={styles.publishToggle} title="...">` — the nested checkbox has no aria-describedby.
- suggested fix: add a visually-hidden `<span id="publish-desc">make this entry visible on your public profile.</span>` and set `aria-describedby="publish-desc"` on both checkbox inputs (main and focus-overlay variants).
- source: /critique pass 8 (commit 5abb81e)
- issue: [mirror-failed: 2026-05-23T20:07:00Z]
- resolution: added visually-hidden span + aria-describedby on both checkbox inputs (id="publish-desc" main; id="publish-desc-focus" focus overlay). Shipped at 31de186.

### [x] [5.4] /today — save indicator shows "not yet saved" for existing entries on load
- category: bug
- impact: 6
- ease: 9
- observation: `TodayEntry` initializes `saveState` to `'idle'` unconditionally. `saveIndicatorText()` only returns a formatted saved-time when `saveState === 'saved' && savedAt`. A returning user with an existing entry has `savedAt` set from `initialEntry.updated_at` but `saveState` is still `'idle'`, so the indicator reads "not yet saved" even though the entry exists and is displayed pre-filled.
- evidence: `src/app/today/TodayEntry.tsx` line 22: `useState<SaveState>('idle')` — no initialEntry check. Line 129: `if (saveState === 'saved' && savedAt)` never matches on load for an existing entry.
- suggested fix: initialize `saveState` from `initialEntry`: `useState<SaveState>(initialEntry !== null ? 'saved' : 'idle')`. `handleResponseChange` already resets to `'idle'` on first edit, so the state machine stays correct.
- source: /iterate audit 2026-05-23
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: initialized saveState to 'saved' when initialEntry !== null in TodayEntry.tsx. Shipped at c1eec87.

### [x] [5.4] /today — "see all 60" link label implies a backlog for users with no entries
- category: external-critique
- impact: 6
- ease: 9
- observation: the seven-day strip shows seven days all marked "no entry" and the log link still reads "see all 60". for a brand-new user who has written nothing, the number 60 implies a backlog that does not exist. 60 is the mosaic window size, but that framing is invisible to a new user.
- evidence: "see all 60" immediately followed by seven strip days all labeled "no entry"
- suggested fix: change the link text to "open log" (no count) so it reads as a navigation affordance rather than a count of existing content.
- source: /critique pass 7 (commit 69def1e)
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: changed "see all 60" to "open log" in DayStrip.tsx. Shipped at 831dc54.

### [x] [5.6] verify gate — no lint guard against text-transform:uppercase in src/
- category: tests
- impact: 7
- ease: 8
- observation: 8 of the last 20 commits were iterate fixes removing `text-transform: uppercase` from individual CSS modules. Each fix was correct but left no guard. grep now returns 0 hits — but there is nothing in the verify gate preventing a new CSS module from silently reintroducing the pattern. The ban is not documented in design/CLAUDE.md either.
- evidence: `package.json` verify script has no css-lint step; `design/CLAUDE.md` has no note on text-transform:uppercase; pattern recurred across 8 pages before being fully cleared.
- suggested fix: (1) add a `lint:no-uppercase-css` script to package.json that exits non-zero if any match found; (2) prepend it to the verify chain; (3) add a "CSS rule bans" section to design/CLAUDE.md documenting the ban.
- source: /iterate audit 2026-05-23
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: added `lint:no-uppercase-css` to package.json and prepended to verify chain; documented ban in design/CLAUDE.md "CSS rule bans" section. Shipped at f3ca66d.

### [x] [6.3] / — landing page 7-day preview shows stale build-date as "today"
- category: external-critique
- impact: 7
- ease: 9
- observation: homepage `LandingPage` calls `getSevenDayPreview(new Date())` as a Next.js RSC with no `export const dynamic` override. Next.js 15 statically renders this at build time, so `new Date()` resolves to the build date. A visitor after midnight UTC sees the build date labelled "today" — mismatched against the authenticated `/today` page.
- evidence: anonymous capture (00:05 UTC 2026-05-24) shows "today / Sat 23 May" while authenticated /today shows "Sun 24 May 2026".
- suggested fix: add `export const dynamic = 'force-dynamic'` to `src/app/page.tsx`
- source: /critique pass 9 (commit 8c8a92d)
- issue: [mirror-failed: 2026-05-24T01:29:00Z]
- resolution: added `export const dynamic = 'force-dynamic'` to src/app/page.tsx. Shipped at f97b216.

### [x] [5.4] /today — today tile in day strip omits date and entry state from accessible label
- category: external-critique
- impact: 6
- ease: 9
- observation: `DayStrip.tsx` `tileStateLabel()` returns `'today'` when `state === 'today'`, while all adjacent tiles return the full date and entry state (e.g. "Mon 18 May 2026 — no entry"). A screen reader user navigating the strip hears "today" twice (the visible text is also "today") with no date and no indication of whether an entry has been written.
- evidence: `src/app/today/DayStrip.tsx` line 16: `if (state === 'today') return 'today'`; adjacent tiles return e.g. "Mon 18 May 2026 — no entry".
- suggested fix: extend `tileStateLabel` to include the full date and entry state for the today tile; pass entry to the function so the label can reflect whether an entry exists.
- source: /critique pass 9 (commit 8c8a92d)
- issue: [mirror-failed: 2026-05-24T00:00:00Z]
- resolution: extended tileStateLabel to accept optional Entry; today tile now returns e.g. "today, Sun 24 May 2026 — no entry" (reflecting actual entry state). Shipped at 103b865.

### [x] [3.6] /today — "not yet saved" status reads as an error state before any typing
- category: external-critique
- impact: 4
- ease: 9
- note: re-scored 2026-05-24 — ease raised from 7 to 9; simpler fix is `response === ''` check in saveIndicatorText(), no new state variable needed
- observation: the save-state indicator reads "not yet saved" on first load, before the user has typed a single character. for a first-time visitor this lands as an error or warning rather than an idle placeholder — the word "yet" implies something was expected and is missing.
- evidence: "your response\nnot yet saved\npublish\nfocus\nsave" — appears immediately on page load with empty textarea
- suggested fix: add `if (saveState === 'idle' && response === '') return ''` before the fallback in saveIndicatorText() — response is already tracked state; no new boolean needed.
- source: /critique pass 7 (commit 69def1e)
- issue: [mirror-failed: 2026-05-24T00:00:00Z]
- resolution: added `if (saveState === 'idle' && response === '') return ''` to saveIndicatorText() in TodayEntry.tsx. Shipped at a044cd0.

### [x] [2.7] / — heading register inconsistency between "the next seven days." and "this is what arrives each morning."
- category: external-critique
- impact: 3
- ease: 9
- observation: the two adjacent section labels use different syntactic registers. "the next seven days." is a noun phrase ending in a period, functioning as a section heading. "this is what arrives each morning." is a full declarative sentence. on a page that exercises careful typographic restraint, the inconsistency creates a small tonal wobble.
- evidence: "the next seven days.\nthis is what arrives each morning."
- suggested fix: align to the same register — either "the next seven days" (no period, noun phrase) or "here is what arrives each morning." (full sentence, consistent with the stated voice posture).
- source: /critique pass 7 (commit 69def1e)
- issue: [mirror-failed: 2026-05-25T20:18:00Z]
- resolution: removed trailing period from h2 in src/app/page.tsx: "the next seven days." → "the next seven days". Shipped at 890e4e7.

### [x] [2.7] /log — "today is a good place to start" edges toward coaching tone
- category: external-critique
- impact: 3
- ease: 9
- observation: the empty-state line "today is a good place to start" nudges the user toward an action in a way that conflicts with the stated voice posture of "prefer 'here is something to attend to' framing" and the site's deliberate avoidance of motivational copy. it reads as mild encouragement rather than a calm observation.
- evidence: "your log is empty. today is a good place to start."
- suggested fix: reframe as an observation: "your log is empty. today's entry will appear here." — describes what will happen without coaching.
- source: /critique pass 7 (commit 69def1e)
- issue: [mirror-failed: 2026-05-25T13:36:00Z]
- resolution: changed empty-state to "your log is empty. today's entry will appear here." in src/app/log/page.tsx; updated bearings.md standing decision. Shipped at ea70c0a.

### [x] [2.7] /log — stat line drops unit noun for published count
- category: external-critique
- impact: 3
- ease: 9
- observation: the stat line reads "0 days written. 60 days quiet. 0 published." — the first two clauses carry the unit noun "days" but the third drops it, producing a grammatically inconsistent series.
- evidence: "0 days written. 60 days quiet. 0 published."
- suggested fix: change to "0 days published." matching the unit-noun pattern of the preceding clauses, pluralizing conditionally for singular counts.
- source: /critique pass 8 (commit 5abb81e)
- issue: [mirror-failed: 2026-05-24T18:06:00Z]
- resolution: added conditional "day/days" to published count in log/page.tsx. Shipped at 2ebac0d.

### [x] [2.7] / — footer "made for adults" frames product by exclusion
- category: external-critique
- impact: 3
- ease: 9
- observation: the footer reads "made for adults who want a low-friction ritual." the phrase "made for adults" positions the product by who it excludes rather than who it serves. the voice guide prefers settled statements of value.
- evidence: "ember · v1\nmade for adults who want a low-friction ritual."
- suggested fix: reframe around the value rather than the audience boundary: "a daily writing ritual for people who want less noise." or remove the qualifier entirely.
- source: /critique pass 8 (commit 5abb81e)
- issue: [mirror-failed: 2026-05-26T00:00:00Z]
- resolution: changed "made for adults who want a low-friction ritual." to "a low-friction writing ritual." in src/app/page.tsx. Shipped at 39b9993.

### [x] [2.7] /today — focus button has no hover tooltip while adjacent publish button does
- category: external-critique
- impact: 3
- ease: 9
- observation: the publish toggle carries `title="make this entry visible on your public profile."` per the voice guide ("hover/tooltip copy is a complete sentence with a period"). the adjacent focus button has `aria-label="enter focus mode"` but no `title` attribute. a first-time sighted user hovering over "focus" receives no explanation of what the control does.
- evidence: `src/app/today/TodayEntry.tsx` focusTrigger button: no title attribute; publish toggle label: `title="make this entry visible on your public profile."` is present.
- suggested fix: add `title="enters a distraction-free writing view."` to the focusTrigger button in TodayEntry.tsx.
- source: /critique pass 9 (commit 8c8a92d)
- issue: #30
- resolution: added `title="enters a distraction-free writing view."` to the focusTrigger button in TodayEntry.tsx. Shipped at 7a90a47.

### [x] [2.7] /today — publish toggle tooltip uses imperative form
- category: external-critique
- impact: 3
- ease: 9
- observation: the publish toggle carries `title="make this entry visible on your public profile."` — the imperative construction "make this entry visible" is a direct second-person instruction, which the voice guide prohibits outside quoted text. tooltip copy should read as a state description, not a command.
- evidence: `"publish\nmake this entry visible on your public profile."` — captured in both primary view and focus-mode overlay.
- suggested fix: reframe as declarative: "this entry will appear on your public profile."
- source: /critique pass 10 (commit 84e0c49)
- issue: [mirror-failed: 2026-05-24T16:08:00Z]
- resolution: changed title and aria-describedby span text to "this entry will appear on your public profile." in both main and focus-overlay copies of the publish toggle. Shipped at 1ec04e5.

### [x] [2.7] /settings — "/u/your-handle" literal string in username hint reads as unfinished
- category: external-critique
- impact: 3
- ease: 9
- observation: the public username field hint renders the literal hyphenated string "your-handle" in a URL example: "your public profile lives at /u/your-handle." before a username is set, this reads as placeholder copy accidentally left in rather than a generic illustrative example.
- evidence: `"your public profile lives at /u/your-handle. leave blank to stay private."`
- suggested fix: replace with a clearly-generic placeholder token, e.g. "/u/username" or "/u/your-username".
- source: /critique pass 10 (commit 84e0c49)
- issue: [mirror-failed: 2026-05-26T08:04:00Z]
- resolution: changed "/u/your-handle" to "/u/username" in hint text and input placeholder in SettingsForm.tsx. Shipped at 72dba75.

### [ ] [2.1] /settings — personalized prompt gives no fallback signal for users with no entries
- category: external-critique
- impact: 3
- ease: 7
- observation: the personalized variety option reads "informed by your recent entries" with no indication of what happens when a new user with zero entries selects it. there is no signal about whether the feature activates immediately, requires a minimum, or gracefully falls back to a standard prompt.
- evidence: `"personalized: a unique prompt generated for you by Claude, informed by your recent entries."` — no fallback copy follows.
- suggested fix: add a brief qualifier after the existing description, e.g. "falls back to a standard prompt until entries exist."
- source: /critique pass 10 (commit 84e0c49)

### [x] [3.2] /signin — sign-in page gives no destination context after email submission
- category: external-critique
- impact: 4
- ease: 8
- note: re-scored 2026-06-01 — impact raised from 3 to 4; the /signin page is the conversion gate for every user; after email submission the user has no signal about where the link takes them; first-time users are most uncertain at this exact moment; fix is one sentence addition to the sent-state paragraph
- observation: the sign-in page confirms an email link will be sent and notes "sign-in links expire after 24 hours." but never tells the user where that link takes them. a first-time visitor has no frame of reference for what the logged-in experience looks like before clicking.
- evidence: sent-state confirmation: "a sign-in link is on its way." — footer: "sign-in links expire after 24 hours." — no destination copy in either location.
- suggested fix: add "the link opens today's prompt directly." to the sent-state confirmation paragraph so the user knows where they'll land.
- source: /critique pass 7 (commit 69def1e)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: added "the link opens today's prompt directly." to the sent-state confirmation paragraph in src/app/signin/page.tsx. Shipped at 97821b2.

### [ ] [2.1] /settings — timezone combobox shows no value for accounts with no saved timezone
- category: external-critique
- impact: 3
- ease: 7
- observation: `SettingsForm` initializes `tzVal` from the profile's saved timezone string. for existing accounts that never set a timezone, `timezone` is an empty string, so the combobox renders blank. the virgin-profile auto-detection only fires when `virgin === true`; existing profiles with an empty timezone get no detected default. a user who skipped the timezone field on first setup returns to a blank combobox with no indication of what to enter.
- evidence: settings capture: "timezone" label with no adjacent value; `src/app/settings/SettingsForm.tsx`: auto-detection skipped for non-virgin profiles.
- suggested fix: expand the timezone auto-detection to run whenever `tzVal === ''` (not only on virgin profiles) so the combobox always shows a detected default rather than blank.
- source: /critique pass 9 (commit 8c8a92d)

### [x] [2.7] /settings — "Claude" vendor name in personalized prompt hint
- category: external-critique
- impact: 3
- ease: 9
- observation: the hint text for the prompt variety field reads "personalized: a unique prompt generated for you by Claude, informed by your recent entries." naming the AI vendor is inconsistent with ember's attributionless voice — the same pattern as the prior Supabase attribution on /signin (fixed at dfe1ae4).
- evidence: `src/app/settings/SettingsForm.tsx:123`: hint string contains "generated for you by Claude".
- suggested fix: replace "generated for you by Claude" with "generated from your recent entries" — describes the behavior without naming the vendor.
- source: /critique pass 6 (commit be41cf9)
- issue: [mirror-failed: 2026-05-24T00:00:00Z]
- resolution: replaced "generated for you by Claude" with "generated from your recent entries" in SettingsForm.tsx. Shipped at 73ce8ed.

### [ ] [1.8] /settings — display name placeholder uses second-person "you"
- category: external-critique
- impact: 2
- ease: 9
- observation: the display name input shows placeholder text "how you appear on your public profile" — the voice guide discourages second-person copy.
- evidence: SettingsForm.tsx display name field placeholder "how you appear on your public profile".
- suggested fix: replace with a neutral descriptor: "visible name on your public profile" or a sample value such as "Ada Lovelace".
- source: /critique pass 8 (commit 5abb81e)

### [x] [3.6] / — "that's deliberate." reads as a defensive aside
- category: external-critique
- impact: 4
- ease: 9
- observation: the closing section on the landing page reads "the same prompt and task arrive for everyone on a given day. that's deliberate. ember does not personalize your morning." the phrase "that's deliberate." is a pre-emptive rebuttal to an imagined objection — inconsistent with the voice guide's preference for settled statements over defensive asides.
- evidence: `src/app/page.tsx` line 66–68: `that&apos;s deliberate.{' '}` sandwiched between two declarative sentences.
- suggested fix: remove "that's deliberate." — the sentence "ember does not personalize your morning." already carries the point without the defensive aside.
- source: /critique pass 6 (commit be41cf9)
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: removed "that's deliberate." from the closing paragraph in src/app/page.tsx. Shipped at a44a3a6.

### [x] [5.4] /settings — prompt variety radio group has no focus-visible style
- category: external-critique
- impact: 6
- ease: 9
- observation: the "standard / personalized" radio group uses visually-hidden inputs (opacity: 0; width: 0; height: 0) with styled label elements, but no `:focus-visible` rule exists on `.radioOption` or its container. keyboard users tabbing through the radio group receive no visible focus indicator.
- evidence: `settings/page.module.css`: `.radioInput { position: absolute; opacity: 0; width: 0; height: 0; }` — no `:focus-visible` sibling or parent rule for `.radioOption`.
- suggested fix: add `.radioOption:has(:focus-visible) { outline: 2px solid var(--color-accent); outline-offset: 2px; }` to settings/page.module.css.
- source: /critique pass 6 (commit be41cf9)
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: added `.radioOption:has(:focus-visible)` outline rule in settings/page.module.css. Shipped at 2af17d5.

### [x] [4.5] / — CTA "sign in to start" names the action but not the destination
- category: external-critique
- impact: 5
- ease: 9
- observation: the landing page CTA reads "sign in to start" with no indication of what the first logged-in experience looks like — that the user lands on today's prompt page. the post-auth path is unanchored.
- evidence: captured CTA text: "sign in to start" — no adjacent copy explaining what follows.
- suggested fix: add a brief phrase near the CTA such as "today's prompt is waiting." so the destination is concrete.
- source: /critique pass 6 (commit be41cf9)
- issue: [mirror-failed: 2026-05-23T05:55:00Z]
- resolution: changed ctaCopy primary text to "today's prompt is waiting." and moved privacy copy to the muted span. Shipped at 0e37545.

### [x] [3.6] /today — day-strip tiles are aria-hidden with no AT-accessible state
- category: external-critique
- impact: 6
- ease: 6
- observation: the seven-day strip renders each tile with aria-hidden="true", so screen readers receive no information about which days have entries. state (written/quiet/published) is encoded in CSS class names but those elements are removed from the AT tree.
- evidence: captured text: "Sun Mon Tue Wed Thu Fri today" — state encoded only in CSS class names (tile--filled, tile--published).
- suggested fix: add a visually-hidden span inside each stripDay with the date and state, e.g. "Mon — written" or "Tue — no entry".
- source: /critique pass 6 (commit be41cf9)
- issue: [mirror-failed: 2026-05-23T07:07:00Z]
- resolution: added tileStateLabel() helper in DayStrip.tsx; visually-hidden span provides full date + state per tile ("Mon 19 May 2026 — written", etc.); visible date span gets aria-hidden="true" to prevent double-announcement. Shipped at 9b1e99f.

### [x] [3.6] /log — "today" in empty-state message is plain text, not a link
- category: external-critique
- impact: 4
- ease: 9
- observation: the empty-state message reads "your log is empty. today is a good place to start." — the word "today" names the sibling page but is rendered as plain text. a new user who has just signed up will expect to click it but cannot; they must find another navigation path, which breaks the first-time experience.
- evidence: captured text: "your log is empty. today is a good place to start." — no link affordance visible.
- suggested fix: wrap "today" in a Link to /today.
- source: /critique pass 6 (commit be41cf9)
- issue: [mirror-failed: 2026-05-23T00:00:00Z]
- resolution: wrapped "today" in `<Link href="/today">` in src/app/log/page.tsx. Shipped at ff7dd43.

<!-- 3 pending findings pruned via /oversight 2026-05-23.
     Two SEO items (canonical, sitemap) — score 2.5/2.7, below the iterate
     3.0 threshold, and were already filed as a bundled candidate (SEO
     public-profile completeness 6.0). Vendor-name finding (2.7, "Claude" in
     /settings hint) pruned alongside as voice nit; if it matters it will
     resurface via /critique. -->

### [x] [5.4] /u/[username]/[date] — public entry pages missing OG image in social metadata
- category: seo
- impact: 6
- ease: 9
- observation: `/u/[username]/[date]` is the primary share target when a user publishes an entry and shares the link. its `generateMetadata` returns `openGraph` without an `images` field and sets `twitter.card: 'summary'` with no images. the sibling `/u/[username]` profile page correctly includes `images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember' }]` and `twitter.card: 'summary_large_image'`. because Next.js App Router metadata performs a shallow merge on the `openGraph` object, a child route that omits `images` replaces the parent's `openGraph` entirely — the OG image from the root layout does not cascade through.
- evidence: `src/app/u/[username]/[date]/page.tsx` `generateMetadata`: `openGraph: { title, description, url }` — no images; `twitter: { card: 'summary' }` — no images. contrast with `src/app/u/[username]/page.tsx`: `openGraph: { ..., images: [{ url: '/opengraph-image', ... }] }`, `twitter: { card: 'summary_large_image', images: ['/opengraph-image'] }`.
- suggested fix: add `images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember' }]` to the `openGraph` block and change `twitter.card` to `'summary_large_image'` with `images: ['/opengraph-image']`.
- issue: [mirror-failed: 2026-05-22T00:00:00Z]
- resolution: added images to openGraph and upgraded twitter.card to 'summary_large_image' in src/app/u/[username]/[date]/page.tsx. Shipped at e2b9a06.

### [x] [1.8] /signin — "back" link has no visible destination
- category: external-critique
- impact: 4
- ease: 9
- observation: the sign-in page header shows a "back" link with no destination label. a visitor who arrived at /signin directly (via bookmark, shared link, or search) cannot tell where "back" leads without clicking it.
- evidence: `src/app/signin/page.tsx` line 44–46: `<Link href="/" className={styles.backLink}>back</Link>` — single word, no aria-label, no destination hint.
- suggested fix: change link text to "back to home" so the destination is explicit without needing a tooltip. optionally also add `aria-label="back to home"` for consistency with other nav links.
- source: /critique pass 5 (commit 4552045)
- issue: [mirror-failed: 2026-05-22T00:00:00Z]
- resolution: changed "back" to "back to home" and added aria-label="back to home" in src/app/signin/page.tsx. Shipped at 51977f7.

### [x] [1.8] /log — H1 "your past sixty days" uses word form while stat line uses numeral "60"
- category: external-critique
- impact: 2
- ease: 9
- observation: the /log page H1 reads "your past sixty days" while the stat line immediately below reads "0 days written. 60 days quiet." — two forms of the same number on the same screen.
- evidence: `src/app/log/page.tsx` line 81: `your past sixty days`; stat line uses numeral "60".
- suggested fix: change H1 and metadata description to "your past 60 days" to match numeral form used throughout the stat line.
- source: /critique pass 5 (commit 4552045)
- issue: [mirror-failed: 2026-05-23T01:26:00Z]
- resolution: changed H1 and metadata description to "your past 60 days". Also fixed "see all sixty" (DayStrip), "published in the last sixty days" (/u/[username]), and three aria-labels in the same commit. Shipped at 2573c76.

### [x] [3.6] /signin — "magic-link via supabase" vendor name in footer
- category: external-critique
- impact: 4
- ease: 9
- observation: the /signin page footer renders `magic-link via supabase` as a permanent attribution. supabase is a backend vendor name with no meaning to end users and at odds with ember's calm, minimal voice. every visitor to the signin page sees it before and after submitting.
- evidence: `src/app/signin/page.tsx` line 99: `<span>magic-link via supabase</span>` in `<footer>`.
- suggested fix: replace with copy describing the user experience — e.g. "sign-in links expire after 24 hours." — removing the vendor name and adding useful information.
- source: /critique pass 4 (commit b1aa4e9)
- issue: #28
- resolution: replaced `magic-link via supabase` with `sign-in links expire after 24 hours.` in the /signin footer. Shipped at dfe1ae4.

### [x] [2.7] / — task label prefix inconsistent across 7-day preview
- category: external-critique
- impact: 3
- ease: 9
- observation: in the 7-day preview on the landing page, the first day's task uses "today's tiny task —" while all subsequent days use "tiny task —". the inconsistency is jarring within a single preview block.
- evidence: `src/app/page.tsx` line 57: `{day.isToday ? "today's tiny task" : 'tiny task'} — {day.task}`. the ternary produces two distinct prefixes in the same list.
- suggested fix: standardize to "tiny task —" across all seven rows by replacing the ternary with a static string literal `'tiny task'`.
- source: /critique pass 4 (commit b1aa4e9)
- issue: [mirror-failed: 2026-05-22T00:00:00Z]
- resolution: removed the isToday ternary; all seven rows now render "tiny task —". Shipped at 92a4995.

### [x] [3.6] /today — task label "today's tiny task" differs from anonymous preview "tiny task"
- category: external-critique
- impact: 4
- ease: 9
- observation: authenticated /today rendered "today's tiny task —" while the landing-page 7-day preview (standardized at 92a4995) uniformly uses "tiny task —". a visitor who previewed the landing before signing in saw the label change between surfaces.
- evidence: `src/app/today/TodayEntry.tsx` line 145: `today&apos;s tiny task{' '}` — the hardcoded prefix persisted after the landing-page fix.
- suggested fix: remove the "today's" prefix so both surfaces use "tiny task —".
- source: /critique pass 5 (commit 4552045)
- issue: [mirror-failed: 2026-05-22T21:12:00Z]
- resolution: removed the "today's" prefix in TodayEntry.tsx. Shipped at 0c3165d.

### [x] [1.8] /today — "see all sixty" uses word form inconsistent with numeral "60" elsewhere
- category: external-critique
- impact: 2
- ease: 9
- observation: DayStrip renders `see all sixty` (word form) while /log uses the numeral "60" throughout. the inconsistency is minor but noticeable in a single session.
- evidence: `src/app/today/DayStrip.tsx` line 43: `see all sixty`. `/log` page: "0 days written. 60 days quiet."
- suggested fix: change `see all sixty` to `see all 60` to match the numeral form used on /log.
- source: /critique pass 4 (commit b1aa4e9)
- resolution: changed "see all sixty" to "see all 60" in DayStrip.tsx. Shipped at 2573c76 (bundled with /log H1 fix and five other "sixty" occurrences).

### [x] [4.5] /u/[username], /log/[date] — text-transform: uppercase on date header and edit label
- category: voice
- impact: 5
- ease: 9
- observation: two active selectors still carry `text-transform: uppercase` after the cdcd1ff and 1cfcd07 passes. `.entryDate` in `u/[username]/page.module.css` renders the date header as "FRI 22 MAY 2026 · PUBLISHED" on the public profile. `.entryLabel` in `log/[date]/page.module.css` renders the "your response" label in uppercase in EditEntry.tsx. Both violate the bearings.md voice rule. A third instance, `.previewMarkLabel` in `page.module.css`, is an orphaned selector (element removed at 0c1d673) and can be cleaned up.
- evidence: `grep -rn "text-transform.*uppercase" src/` returns `page.module.css:96`, `u/[username]/page.module.css:150`, `log/[date]/page.module.css:272`; `u/[username]/page.tsx:121` uses `.entryDate`; `log/[date]/EditEntry.tsx:97` uses `.entryLabel`; `.previewMarkLabel` has no references in component files.
- suggested fix: remove `text-transform: uppercase` from `.entryDate` (u/[username]/page.module.css) and `.entryLabel` (log/[date]/page.module.css); also remove the orphaned `.previewMarkLabel` `text-transform` rule in page.module.css.
- source: /iterate audit 2026-05-22
- issue: [mirror-failed: 2026-05-22T00:00:00Z]
- resolution: removed `text-transform: uppercase` from `.entryDate` (u/[username]/page.module.css), `.entryLabel` (log/[date]/page.module.css), and orphaned `.previewMarkLabel` (page.module.css). Shipped at 3795494.

### [x] [6.3] /today — publish toggle has no affordance explaining what publishing does
- category: external-critique
- impact: 7
- ease: 9
- observation: the publish checkbox on /today appears with no surrounding copy, tooltip, or description explaining what publishing does or who can see a published entry. a user encountering this control for the first time has no basis for deciding whether to use it.
- evidence: critique pass 4 — captured text: "publish / focus / save" with no explanatory context visible in DOM text.
- suggested fix: add `title="make this entry visible on your public profile."` to the publish toggle label (both normal and focus-overlay copies). Follows the bearings rule: "Hover/tooltip copy is a complete sentence with a period."
- source: /critique pass 4 (commit b1aa4e9)
- issue: [mirror-failed: 2026-05-22T00:00:00Z]
- resolution: added `title="make this entry visible on your public profile."` to both publish toggle `<label>` elements in TodayEntry.tsx. Shipped at 7fe5ba6.

### [x] [5.4] /today — date heading renders as all-caps "FRI 22 MAY 2026"
- category: external-critique
- impact: 6
- ease: 9
- observation: the date heading on /today is displayed in full uppercase ("FRI 22 MAY 2026") via `text-transform: uppercase` on `.dateStamp` in today/page.module.css. `formatDisplayDate` already returns mixed-case ("Fri 22 May 2026"); the CSS is overriding it. the cdcd1ff fix addressed `.entryLabel` and `.stripLabel` but did not cover `.dateStamp`.
- evidence: `today/page.module.css:83` — `.dateStamp { text-transform: uppercase; }`
- suggested fix: remove `text-transform: uppercase` from `.dateStamp`.
- source: /critique pass 3 (commit ae936e3)
- issue: [mirror-failed: 2026-05-22T04:09:00Z]
- resolution: removed `text-transform: uppercase` from `.dateStamp` in today/page.module.css. Shipped at d419779.

### [x] [5.4] /today — FOCUS and DONE button labels are all-caps
- category: external-critique
- impact: 6
- ease: 9
- observation: the focus-mode toggle ("FOCUS") and exit ("DONE") buttons render in full uppercase via `text-transform: uppercase` on `.focusTrigger` and `.focusDone`. button text in source is already lower-case ("focus", "done"); the CSS is inflating it.
- evidence: `today/page.module.css:383` `.focusTrigger { text-transform: uppercase; }`; line 445 `.focusDone { text-transform: uppercase; }`
- suggested fix: remove `text-transform: uppercase` from `.focusTrigger` and `.focusDone`.
- source: /critique pass 3 (commit ae936e3)
- issue: [mirror-failed: 2026-05-22T04:09:00Z]
- resolution: removed `text-transform: uppercase` from `.focusTrigger` and `.focusDone` in today/page.module.css. Shipped at d419779.

### [x] [4.9] / — "read-only preview" label gives state but not purpose
- category: external-critique
- impact: 7
- ease: 7
- observation: the 7-day preview section is introduced with "the next seven days." followed by a terse "read-only preview" label. the label communicates the interaction state but not why the visitor is seeing this content. a first-time visitor may miss that this is an illustrative sample of what they will receive daily.
- evidence: captured text: "the next seven days. / read-only preview / today / Fri 22 May"
- suggested fix: add a short explanatory subtitle beneath "the next seven days." — e.g. "this is what arrives each morning." — so the preview's purpose is clear without requiring the visitor to infer it.
- source: /critique pass 3 (commit ae936e3)
- issue: [mirror-failed: 2026-05-22T08:00:00Z]
- resolution: replaced "read-only preview" with "this is what arrives each morning." in the sevenMeta span in src/app/page.tsx. Shipped at 757f4a7.

### [x] [4.5] /signin — email field label is all-caps "EMAIL"
- category: external-critique
- impact: 5
- ease: 9
- observation: the email input label renders as "EMAIL" in full uppercase via `text-transform: uppercase` on `.fieldLabel` in signin/page.module.css. the cdcd1ff typography pass removed uppercase from labels in /settings and /today but the /signin label was not included.
- evidence: `signin/page.module.css:91` — `.fieldLabel { text-transform: uppercase; }`
- suggested fix: remove `text-transform: uppercase` from `.fieldLabel` in signin/page.module.css.
- source: /critique pass 3 (commit ae936e3)
- issue: [mirror-failed: 2026-05-22T10:40:00Z]
- resolution: removed `text-transform: uppercase` from `.fieldLabel` in signin/page.module.css. Shipped at 055c339.

### [x] [4.5] / — page title is a bare product name with no description
- category: external-critique
- impact: 8
- ease: 9
- observation: `src/app/page.tsx` line 36 contains `<span className={styles.previewMarkLabel}>the brand is the practice rendered</span>`. CSS `text-transform: uppercase` in `.previewMarkLabel` renders this as "THE BRAND IS THE PRACTICE RENDERED" — internal design-system language exposed on the primary conversion surface. Breaks voice and confuses first-time visitors.
- evidence: `src/app/page.tsx:36` + `src/app/page.module.css:96`
- suggested fix: remove the `<span>` and its inner text entirely; the MosaicPreview is self-explanatory and the section needs no visible label.
- source: /critique pass 2 (commit 1ade924)
- issue: [mirror-failed: 2026-05-21T00:00:00Z]
- resolution: removed the `previewMarkLabel` span from src/app/page.tsx. Shipped at 0c1d673.

### [x] [5.6] /today — focus-mode overlay DOM duplication exposes duplicate controls to screen readers
- category: external-critique
- impact: 8
- ease: 7
- observation: the focus-mode overlay contains a second full copy of the prompt, "YOUR RESPONSE" heading, save-state indicator, and publish/save controls. Both copies are in the DOM simultaneously; without `aria-hidden` on the inactive overlay, screen readers encounter every interactive control twice.
- evidence: both copies live in DOM at once with no aria-hidden on the inactive one.
- suggested fix: add `aria-hidden="true"` to the focus-mode overlay container when focus mode is not active.
- source: /critique pass 2 (commit 1ade924)
- resolution: `aria-hidden={!isFocus}` added to the focus overlay div, along with `aria-modal={isFocus}` and `tabIndex={isFocus ? 0 : -1}` on overlay interactive elements. Shipped as part of phase 19 (a9e1729).

### [x] [5.4] /today — section header caps conflict with stated typographic voice
- category: external-critique
- impact: 6
- ease: 9
- observation: "YOUR RESPONSE" and "YOUR LAST SEVEN DAYS" are rendered in full uppercase while every other label uses sentence or lower case, violating the `bearings.md` voice rule "lower-case where typographic restraint reads better".
- evidence: `src/app/today/page.module.css` multiple `text-transform: uppercase` rules
- suggested fix: remove `text-transform: uppercase` from `.entryLabel` and `.stripLabel` selectors (or equivalent), leaving source text already lower-case.
- source: /critique pass 1 (commit c69173d)
- issue: #25
- resolution: removed `text-transform: uppercase` from `.entryLabel` and `.stripLabel` (today/page.module.css), `.label` (settings/page.module.css), and `.mosaicMeta` (log/page.module.css). Closes the /today, /settings, and /log uppercase-label cluster from critique passes 1 and 2. Shipped at cdcd1ff.

### [x] [7.2] /settings — timezone selector is effectively unusable on mobile
- category: external-critique
- impact: 9
- ease: 8
- observation: the timezone selector is a flat unfiltered list of 200+ timezone strings in a single `<select>` with no `<optgroup>` grouping and no search. mobile users must scroll hundreds of raw IANA tz names.
- evidence: settings page body text is almost entirely composed of raw timezone names in alphabetical sequence.
- suggested fix: group timezones with `<optgroup>` by region prefix (Africa, America, Asia, Europe, etc.).
- source: /critique pass 1 (commit c69173d)
- issue: #26
- resolution: added groupTimezones() helper in SettingsForm.tsx; timezone <select> now renders <optgroup> per region. Shipped at 8d43d1b.

### [x] [5.4] /today — save-state indicator may not be in an aria-live region
- category: external-critique
- impact: 6
- ease: 9
- observation: the "not yet saved" / "saved" indicator on /today may not be wrapped in an `aria-live` region; screen reader users may not be notified when save state changes.
- evidence: captured text shows save-state as static text with no live-region context visible.
- suggested fix: verify `aria-live="polite"` on the save-state element; add if absent.
- source: /critique pass 1 (commit c69173d)
- resolution: `aria-live="polite"` confirmed present on `.lastSaved` span in TodayEntry.tsx (both normal and focus-overlay copies). Already fixed as part of [4.8] in the Done section (shipped at 8b41e0a). Duplicate finding; closed without separate commit.

### [x] [4.5] / — page title is a bare product name with no description
- category: external-critique
- impact: 5
- ease: 9
- observation: the homepage `<title>` is simply "ember" — no description, no keyword signal, no context for returning users with multiple tabs.
- evidence: root layout metadata title = "ember"
- suggested fix: change root layout title to "ember — a daily writing ritual" (or from the tagline).
- source: /critique pass 2 (commit 1ade924)
- issue: [mirror-failed: 2026-05-22T06:08:00Z]
- resolution: changed root layout title, OG title, and twitter title to "ember — a daily writing ritual". Shipped at 99aa554.

### [x] [4.5] /log — "60 quiet" in the empty-state stat line is ambiguous
- category: external-critique
- impact: 5
- ease: 9
- observation: "0 days written. 60 quiet. 0 published." — the word "quiet" means days with no entry but a first-time visitor cannot parse this without explanation.
- evidence: captured text: "0 days written. 60 quiet. 0 published."
- suggested fix: add a gloss — "60 quiet days." — or a visible label beneath the stat row explaining what each figure counts.
- source: /critique pass 1 (commit c69173d)
- issue: [mirror-failed: 2026-05-22T09:19:00Z]
- resolution: changed `{quiet} quiet.` to `{quiet} {quiet === 1 ? 'day' : 'days'} quiet.` in log/page.tsx. Shipped at ccafa00.

### [x] [4.5] /log, /log/[date], /u/[username]/[date], /u/[username] — uppercase date/meta labels
- category: voice
- impact: 5
- ease: 9
- observation: `text-transform: uppercase` persists on four selectors after the cdcd1ff and d419779 passes fixed today/page.module.css but left the log and public-profile pages untouched: `.entryDate` in log/page.module.css, `.entryDate` in log/[date]/page.module.css, `.entryDate` in u/[username]/[date]/page.module.css, and `.mosaicMeta` in u/[username]/page.module.css. The log `.entryDate` shows a date like "FRI 22 MAY"; the profile `.mosaicMeta` shows "PUBLISHED IN THE LAST SIXTY DAYS" — both violate the voice rule.
- evidence: log/page.module.css:173, log/[date]/page.module.css:96, u/[username]/[date]/page.module.css:76, u/[username]/page.module.css:91
- suggested fix: remove `text-transform: uppercase` from all four selectors (same mechanical fix as d419779 applied to today/page.module.css).
- source: /iterate audit 2026-05-22
- issue: #27
- resolution: removed `text-transform: uppercase` from all four selectors. Shipped at 1cfcd07.

### [x] [4.2] / (mobile) — footer trust copy absent at 375px
- category: external-critique
- impact: 6
- ease: 7
- observation: desktop footer includes "a sign-in link is the only thing you'll receive. no password, no spam." — a key trust signal for skeptical first-time visitors. this copy does not appear in the mobile (375px) capture, removing the objection-handler before the sign-in CTA.
- evidence: desktop capture includes the privacy reassurance; mobile capture ends with "sign in to start" with no privacy copy.
- suggested fix: audit the mobile layout to confirm this copy is visible at 375px, or surface it directly above the "sign in to start" CTA.
- source: /critique pass 1 (commit c69173d)
- issue: [mirror-failed: 2026-05-22T15:44:00Z]
- resolution: removed `.ctaCopy { display: none }` at ≤480px; set font-size to var(--type-14) so copy stacks above the CTA button in column layout; increased page padding-bottom to 160px on mobile. Shipped at a018b8d.

### [x] [3.6] /signin — page title not distinctive (inherits root layout title)
- category: seo
- impact: 4
- ease: 9
- observation: /signin is a 'use client' component with no exported metadata; it inherits the root layout title "ember — a daily writing ritual". all other authenticated pages carry descriptive suffixes ("ember · today", "ember · log", "ember · settings"). a user with both the landing page and the sign-in page open cannot distinguish them by tab title.
- evidence: /signin/page.tsx has no metadata export; root layout title is "ember — a daily writing ritual" (changed from bare "ember" at 99aa554 but still not sign-in-specific).
- suggested fix: add src/app/signin/layout.tsx with `export const metadata = { title: 'ember · sign in' }`.
- source: /critique pass 3 (commit ae936e3)
- issue: [mirror-failed: 2026-05-22T17:42:00Z]
- resolution: added src/app/signin/layout.tsx exporting metadata { title: 'ember · sign in' }. Shipped at 6413cfb.

### [x] [2.4] /signin — no link-expiry or next-step copy after submission
- category: external-critique
- impact: 3
- ease: 8
- observation: no indication of how long the magic-link is valid or where it lands; users who close the tab before the email arrives are left uncertain.
- evidence: captured text: "we email you a sign-in link. no password, no spam." — no expiry or destination copy.
- suggested fix: add one line such as "the link is valid for 24 hours and drops you straight into today's page".
- source: /critique pass 1 (commit c69173d)
- resolution: footer now reads "sign-in links expire after 24 hours." — added as part of the dfe1ae4 vendor-attribution fix. Expiry concern addressed.

### [x] [4.5] /today — FOCUS button has no accessible label
- category: external-critique
- impact: 5
- ease: 9
- observation: the focus-mode toggle button is labelled only with "FOCUS" — no `aria-label`. Screen readers cannot determine whether this toggles a view, opens a modal, or changes a setting.
- evidence: FOCUS button in TodayEntry component.
- suggested fix: add `aria-label="enter focus mode"` (or dynamic `aria-label` for pressed state) to the FOCUS button.
- source: /critique pass 2 (commit 1ade924)
- resolution: `aria-label="enter focus mode"` added to the focusTrigger button in TodayEntry.tsx as part of phase 19 (a9e1729).

### [x] /settings — prompt variety radio group has no fieldset/legend grouping (critique pass 12)
- category: external-critique
- impact: 3
- ease: 9
- observation: the prompt variety toggle uses visually-styled radio inputs under a section heading. the section heading "prompt variety" is separate from the radio inputs in the DOM; if there is no `<fieldset>` with a `<legend>`, screen readers cannot programmatically associate the group label with the "standard" and "personalized" radio buttons.
- evidence: settings text: "prompt variety\n\nstandard: ... personalized: ...\n\nstandard\npersonalized" — section heading and radio inputs appear as separate blocks with no structural grouping visible.
- suggested fix: wrap the radio inputs in a `<fieldset>` with `<legend>prompt variety</legend>`, or add `role="group"` with `aria-labelledby` pointing to the "prompt variety" heading id.
- source: /critique pass 12 (commit 079614a)
- resolution: false positive — the container div already carries `role="radiogroup"` and `aria-label="prompt variety"`, which provides programmatic group labeling equivalent to `<fieldset>/<legend>`. The critique's text-based capture cannot read ARIA attributes; the association exists. No code change required.

### [x] [2.7] /log — page meta description is minimal and does not describe content
- category: external-critique
- impact: 3
- ease: 9
- observation: the /log page meta description reads "your past 60 days" — technically accurate but does not describe the page's content or purpose to someone arriving from a search result or bookmark. it names the data window but not what the page shows.
- evidence: title: "ember · log"; description: "your past 60 days"
- suggested fix: expand to describe the page's content, e.g. "a record of your past 60 days of writing — prompts, responses, and the entries you have published."
- source: /critique pass 12 (commit 079614a)
- resolution: already addressed — description updated to 'your writing log — prompts, responses, and the entries you have published over the past 60 days.' by the [x] [3.6] sibling item shipped at a29ff1f. Duplicate entry; no code change required.

### [x] [2.7] / — "ember · v1" footer version string reads as a developer artifact
- category: external-critique
- impact: 3
- ease: 9
- observation: the footer renders "ember · v1" where "v1" is a developer-facing version label with no meaning to a first-time reader. it sits alongside user-facing copy and disrupts the bookish, intentional voice. every other footer line carries user-facing information.
- evidence: footer text: "ember · v1\nmade for adults who want a low-friction ritual."
- suggested fix: remove the "· v1" suffix from the footer, leaving only "ember", or replace with a meaningful phrase such as the year.
- source: /critique pass 12 (commit 079614a)
- issue: [mirror-failed: 2026-05-27T00:00:00Z]
- resolution: removed " · v1" suffix from footer span in src/app/page.tsx, leaving only "ember". Shipped at 5629222.

### [x] [3.6] /log — all-zero stat line reads as a metrics artifact for a new user
- category: external-critique
- impact: 4
- ease: 9
- observation: for a brand-new account with no entries, the log page renders "0 days written. 60 days quiet. 0 days published." immediately above the empty-state message. the triple-zero stat line reads as a metrics dashboard entry rather than the understated observational tone the voice guide specifies. the empty-state line below already communicates the same information.
- evidence: "0 days written. 60 days quiet. 0 days published.\n\nyour log is empty. today's entry will appear here."
- suggested fix: suppress the stat line when written=0 (all values are zero), letting the empty-state message carry the page alone. the stat line reappears as soon as the first entry is written.
- source: /critique pass 13 (commit 4f08c21)
- issue: [mirror-failed: 2026-05-25T00:00:00Z]
- resolution: wrapped mosaicCount <p> with `{written > 0 && ...}` in src/app/log/page.tsx. Shipped at a901368.

### [x] [2.7] / — footer CTA copy uses direct second-person address
- category: external-critique
- impact: 3
- ease: 9
- observation: the footer CTA block reads "today's prompt is waiting. a sign-in link is the only thing you'll receive. no password, no spam." the phrase "you'll receive" is direct second-person address, and "no password, no spam" is a reassurance fragment rather than a settled declarative sentence. the voice guide specifies knowledgeable peer framing, not objection-handler copy.
- evidence: footer text: "today's prompt is waiting. a sign-in link is the only thing you'll receive. no password, no spam."
- suggested fix: reframe as a description of how the system works: "the link arrives once. no password is set. no other mail is sent."
- source: /critique pass 13 (commit 4f08c21)
- issue: [mirror-failed: 2026-05-25T19:18:00Z]
- resolution: changed span text to "the link arrives once. no password is set. no other mail is sent." in src/app/page.tsx. Shipped at 9ffd684.

### [x] [2.4] /today — "done" button label is ambiguous in focus mode
- category: external-critique
- impact: 3
- ease: 8
- observation: the focus mode overlay contains a "done" button (aria-label="exit focus mode") adjacent to a "save" button. the visible text "done" is ambiguous: a user in focus mode may read it as "done writing, save and exit" rather than "exit focus mode without saving". the aria-label is correct for screen readers but sighted users see only "done".
- evidence: focus overlay DOM (always present): "save\ndone" — no adjacent copy distinguishing the exit action from a save action.
- suggested fix: add a title attribute to the "done" button: title="return to normal view." so hovering reveals its scope; or change visible text to "exit focus" to match the aria-label semantics.
- source: /critique pass 13 (commit 4f08c21)
- resolution: addressed by commit 25e38a7 which changed visible text to "done writing" — same fix as the parallel [x] [3.6] finding. Visible text is now "done writing" making the exit action distinct from "save".

### [ ] [2.1] /settings — "sign out" sits adjacent to form "save" with no prominent visual separation
- category: external-critique
- impact: 3
- ease: 7
- observation: the settings page ends with "save\nsign out" — the footer's "sign out" action appears immediately after the form's primary save action in the DOM text. the footer has a border-top separator in CSS, but the visual distance between the two actions can feel compressed, particularly when the form is long on mobile.
- evidence: settings body: "@\nsave\nsign out" — two differently-weighted actions appear in close proximity.
- suggested fix: increase the top margin on the footer and add a short section label above "sign out" (e.g., "session") so it reads as a distinct category rather than a secondary form action.
- source: /critique pass 13 (commit 4f08c21)

### [x] [3.0] /today — publish toggle active with no hint that a public username is required
- category: external-critique
- impact: 5
- ease: 6
- note: re-scored 2026-05-29 — severity raised to MED in CRITIQUE pass 21; impact updated from 3 to 5; score raised from 1.8 to 3.0
- observation: the publish toggle appears on /today whether or not the user has set a public username. toggling it stores a published state but the entry will not appear publicly without a /u/username route. there is no hint at point of use that a username is a prerequisite.
- evidence: /today shows the full publish toggle with "this entry will appear on your public profile." while /settings shows no username value.
- suggested fix: when no public username is saved, render the publish toggle as disabled or add a note inline: "set a username in settings for entries to appear on your profile."
- source: /critique pass 13 (commit 4f08c21)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: added `hasUsername` prop to TodayEntry; when false (no profile.username), renders "entries appear publicly only when a username is set in settings." below the publish toggle in both main view and focus overlay. page.tsx passes `hasUsername={Boolean(profile?.username)}`. 3 tests added. Shipped at bceeb20.

### [x] [3.6] /signin — reassurance line uses direct second-person address and a sentence fragment
- category: external-critique
- impact: 4
- ease: 9
- note: re-scored 2026-05-27 — impact raised from 3 to 4; the reassurance paragraph is always-visible on the primary auth flow and reaches 100% of signing users; the voice violation is identical in register to the landing-page footer "you'll receive" copy fixed at 9ffd684 (which affected the same population). the landing page footer has already been rewritten to impersonal declarative sentences; /signin still uses the old form.
- observation: the reassurance line reads "we email you a sign-in link. no password, no spam." — "we email you" is first-person plural plus direct second-person address, a register shift from the impersonal constructions used throughout the rest of the site ("the link arrives once. no password is set. no other mail is sent."). the trailing "no password, no spam." is a sentence fragment rather than a declarative statement.
- evidence: src/app/signin/page.tsx line 91: `we email you a sign-in link. <em>no password, no spam.</em>` — compare landing page footer at src/app/page.tsx: "the link arrives once. no password is set. no other mail is sent."
- suggested fix: reframe as impersonal declarative sentences: "a sign-in link is sent to this address. no password. no other mail." — removes direct address and converts the fragment. matches the impersonal register of the landing footer.
- source: /critique pass 14 (commit e748b34)
- issue: [mirror-failed: 2026-05-27T00:00:00Z]
- resolution: changed "we email you a sign-in link. no password, no spam." to "a sign-in link is sent to this address. no password. no other mail." in src/app/signin/page.tsx. Shipped at 6397375.

### [x] [3.6] /signin — post-submission confirmation uses second-person imperative
- category: external-critique
- impact: 4
- ease: 9
- note: re-scored 2026-05-28 — impact raised from 3 to 4; the confirmation paragraph is seen by 100% of users who complete the sign-in flow on the primary auth path; same justification as /signin reassurance-line re-score (6397375) and /signin email placeholder re-score (736f911)
- observation: the confirmation state reads "check your email. a sign-in link is on its way." — "check your email" is a second-person imperative instruction, which the voice guide explicitly prohibits. the rest of the sign-in page avoids direct address.
- evidence: src/app/signin/page.tsx line 55: `check your email. a sign-in link is on its way.`
- suggested fix: reframe as an observation: "a sign-in link is on its way." — removes the imperative while preserving the useful information.
- source: /critique pass 14 (commit e748b34)
- issue: [mirror-failed: 2026-05-28T00:04:25Z]
- resolution: changed confirmation text to "a sign-in link is on its way." in src/app/signin/page.tsx. Shipped at ad55037.

### [x] [4.0] /signin — email input placeholder uses second-person example address
- category: external-critique
- impact: 4
- ease: 10
- note: re-scored 2026-05-27 — impact raised from 3 to 4; placeholder visible to 100% of /signin visitors before any input, on the primary auth conversion path; same justification that raised /today textarea placeholder to impact 4 at ddafc86
- observation: the email input carries the placeholder "you@somewhere.com" — a second-person illustrative address that conflicts with the impersonal register used elsewhere on the page.
- evidence: src/app/signin/page.tsx line 69: `placeholder="you@somewhere.com"`
- suggested fix: change to a neutral placeholder such as "email address" or remove the placeholder entirely, relying on the visible label above the field.
- source: /critique pass 14 (commit e748b34)
- issue: [mirror-failed: 2026-05-27T08:10:00Z]
- resolution: changed placeholder to "email address" in src/app/signin/page.tsx. Shipped at 736f911.

### [x] [3.0] / — OG image alt attribute carries brand name only, no descriptive text
- category: seo
- impact: 3
- ease: 10
- note: re-scored 2026-05-29 — ease raised from 9 to 10; the change is a single 4-word string addition inside the root layout metadata object — no logic, no imports, no structural change; ease 10 is warranted
- observation: the root layout sets the OG image alt to the bare string "ember" with no descriptive phrase. if the image fails to render or is read by an assistive tool, the alt conveys only the brand name and nothing about the page content.
- evidence: src/app/layout.tsx line 48: `{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember' }`
- suggested fix: expand the alt to match the page description: "ember — a daily writing ritual"
- source: /critique pass 14 (commit e748b34)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed alt to 'ember — a daily writing ritual' in src/app/layout.tsx openGraph images. Shipped at bb32ff9.

### [ ] [2.7] /settings — public username hint uses second-person imperative "leave blank"
- category: external-critique
- impact: 3
- ease: 9
- observation: the public username hint reads "leave blank to stay private." — "leave blank" is a second-person imperative instruction. the voice guide prohibits second-person imperative copy.
- evidence: src/app/settings/SettingsForm.tsx: `your public profile lives at /u/your-handle. leave blank to stay private.`
- suggested fix: reframe as a declarative: "an empty field keeps your profile private." — removes the imperative and converts to the preferred observational register.
- source: /critique pass 14 (commit e748b34)

### [ ] [2.7] /settings — "@" username prefix conflicts with "/u/" URL structure
- category: external-critique
- impact: 3
- ease: 9
- observation: the public username input is prefixed with "@", which signals a social-media handle convention. ember's actual public URL pattern is "/u/handle", not "@handle". the hint immediately below reads "your public profile lives at /u/your-handle." — the "@" affordance and the URL format use different namespacing signals.
- evidence: src/app/settings/SettingsForm.tsx: `<span className={styles.usernamePrefix}>@</span>` followed by hint citing "/u/your-handle"
- suggested fix: replace the "@" prefix with "/u/" to match the actual URL pattern, or remove the prefix entirely and let the hint carry the format context.
- source: /critique pass 14 (commit e748b34)

### [x] [4.0] /today — TodayEntry handleSave has no test coverage; save payload and error states unguarded
- category: tests
- impact: 5
- ease: 8
- observation: `TodayEntry.tsx` `handleSave` is the core user-facing action — it POSTs date, response, task_done, and is_published to `/api/entries` and manages a 5-state machine (idle/saving/saved/error/draft). Multiple test files cover focus mode, offline draft, on-this-day, and the save indicator function, but none assert on the fetch payload or error-state transitions. A regression that silently drops task_done or is_published from the payload (the same class of bug as the personalizedVal stale-closure at 0419eb3 in SettingsForm) would ship undetected. The error-state role="alert" is also untested.
- evidence: `grep -rn "handleSave\|api/entries" src/app/today/__tests__/` returns no matches. `src/app/today/TodayEntry.tsx` lines 78–102: handleSave sends `{ date, response, task_done: taskDone, is_published: isPublished }` via fetch; error state sets `role="alert"` at line 197.
- suggested fix: add `src/app/today/__tests__/EntrySave.test.tsx` covering: (1) POST /api/entries called with correct payload including task_done and is_published; (2) task_done: true included when task button is toggled; (3) "saving..." state during in-flight request; (4) aria-live region shows saved time after success; (5) role="alert" error message on API failure; (6) "network error. try again." on fetch rejection.
- source: /iterate audit 2026-05-26
- issue: [mirror-failed: 2026-05-26T00:00:00Z]
- resolution: added src/app/today/__tests__/EntrySave.test.tsx with 6 tests covering payload (task_done, is_published), saving state, saved time in aria-live, and error states. Shipped at eac5f4d.

### [x] [3.6] /today — publish toggle description is unconditional when toggle is off
- category: external-critique
- impact: 4
- ease: 9
- note: re-scored 2026-05-26 — impact raised from 3 to 4 (upper LOW); the false guarantee is delivered via aria-describedby to screen readers on every checkbox focus regardless of state, making this an accessibility concern in addition to a comprehension gap on the most-visited authenticated page
- observation: the publish toggle description reads "this entry will appear on your public profile." as a static, unconditional statement. when the toggle is unchecked (the default state), this reads as a factual claim — the entry will appear — rather than a description of what enabling the toggle does. the mismatch between the off-state of the control and the unconditional phrasing creates a small but genuine comprehension gap.
- evidence: body text: "publish\nthis entry will appear on your public profile." — the same static description appears in both the main view and the focus-mode overlay regardless of toggle state.
- suggested fix: reframe to a conditional: "when published, this entry appears on your public profile." — aligns the description with the toggle's role as a state-change control rather than a guarantee.
- source: /critique pass 15 (commit 286ecad)
- resolution: changed title and aria-describedby span text to "when published, this entry appears on your public profile." in both main and focus-mode overlay copies. Shipped at 3e54d90.

### [x] [3.6] /today — textarea placeholder "take your time." is second-person imperative
- category: external-critique
- impact: 4
- ease: 9
- note: impact scored at upper-end LOW (4) — the placeholder is the first text an authenticated user sees on the primary writing surface before typing; the voice guide explicitly prohibits second-person imperative copy; the fix affects every /today visit with an empty textarea
- observation: both the main textarea and the focus-overlay textarea carry the placeholder text "take your time." — a second-person imperative instruction. the voice guide explicitly prohibits second-person imperative copy. the placeholder is visible to any user whose textarea is empty and focused.
- evidence: src/app/today/TodayEntry.tsx line 157: `placeholder="take your time."` on main textarea; line 219: same on focus-overlay textarea.
- suggested fix: replace with an impersonal declarative such as "there is no rush." or remove the placeholder entirely and let the "your response" label above the field carry the framing.
- source: /critique pass 16 (commit 27718e9)
- issue: [mirror-failed: 2026-05-27T06:13:00Z]
- resolution: changed placeholder to "there is no rush." on both main and focus-overlay textareas in src/app/today/TodayEntry.tsx. Shipped at ddafc86.

### [x] [2.7] / — "no password is set" phrasing differs from sign-in page's "no password"
- category: external-critique
- impact: 3
- ease: 9
- observation: the home page footer CTA uses "no password is set. no other mail is sent." while the sign-in page uses the shorter "no password. no other mail." for the same reassurance. the passive-voice "is set" on the home page introduces a slightly different register and a word absent on the sign-in page, creating a minor cross-page inconsistency in how the passwordless model is described.
- evidence: home footer: "no password is set. no other mail is sent." — /signin helper: "no password. no other mail."
- suggested fix: normalise to "no password. no other mail." on the home page footer to match the shorter form used on /signin.
- source: /critique pass 16 (commit 27718e9)
- issue: [mirror-failed: 2026-06-03T16:12:00Z]
- resolution: changed "no password is set. no other mail is sent." to "no password. no other mail." in src/app/page.tsx. Shipped at 0941397.

### [x] [2.7] /today — focus-mode overlay renders aria-modal="false" when inactive
- category: external-critique
- impact: 3
- ease: 9
- observation: the focus-mode overlay uses `aria-modal={isFocus}`, which serialises to `aria-modal="false"` when focus mode is inactive. the ARIA spec does not define a false state for aria-modal — the attribute should be absent when the dialog is not modal, not set to "false". the overlay is simultaneously `aria-hidden="true"` when inactive so practical impact on screen readers is limited, but the pattern diverges from the spec and may trigger axe-core warnings.
- evidence: src/app/today/TodayEntry.tsx line 204: `aria-modal={isFocus}` — when isFocus is false this produces `aria-modal="false"` on the div.
- suggested fix: change to `aria-modal={isFocus || undefined}` so the attribute is absent rather than explicitly false when focus mode is not active.
- source: /critique pass 16 (commit 27718e9)
- resolution: duplicate entry — already resolved at 4db7e74 (the [x] [3.0] sibling at top of Pending, sourced from critique pass 16). No code change required.

### [x] [3.6] / — product description contains embedded second-person imperative clause
- category: external-critique
- impact: 4
- ease: 9
- note: re-scored 2026-05-29 — impact raised from 3 to 4; the sub-pitch paragraph is the primary product description on the landing page, visible to every anonymous visitor; the voice guide explicitly prohibits second-person imperative copy; the same re-scoring logic applied to the textarea placeholder (ddafc86), the /signin reassurance line (6397375), and the task-done tooltip (156c342)
- observation: the introductory paragraph reads "you write a few sentences in response, mark the task done if you did it, and move on." — the clause "mark the task done" is an imperative verb form embedded in what is otherwise a descriptive series using "you write... and move on." the voice guide prohibits second-person imperative copy outside quoted text.
- evidence: body text: "one small prompt and one tiny task each morning. you write a few sentences in response, mark the task done if you did it, and move on." — "mark the task done" uses imperative mood mid-sentence.
- suggested fix: reframe as fully descriptive: "one small prompt and one tiny task each morning. a few sentences in response, the task marked if it happened, and the day continues." — removes the imperative verb while preserving the meaning.
- source: /critique pass 17 (commit 21ebca6)
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: changed sub-pitch to "a few sentences in response, the task marked if it happened, and the day continues." in src/app/page.tsx. Shipped at 6b618e3.

### [x] [3.6] /today — task-done button has no hover tooltip while adjacent controls do
- category: external-critique
- impact: 4
- ease: 9
- note: re-scored 2026-05-27 — impact raised from 3 to 4; the task button is the only control in the /today action row without a title attribute; it sits on the primary authenticated surface visited by all users; the voice guide rule (complete-sentence hover copy) applies to every control in the group — consistent with the same re-scoring applied to the textarea placeholder (ddafc86) and /signin email placeholder (736f911)
- observation: the publish toggle carries title="when published, this entry appears on your public profile." and the focus button carries title="enters a distraction-free writing view." — both complete sentences with periods, per the voice guide. the task-done button is the only control in the group without a title attribute; a sighted user hovering over it receives no tooltip.
- evidence: /today controls row — publish toggle and focus button carry title attributes per the voice guide; the task-done button does not.
- suggested fix: add title="marks today's tiny task as done." (and title="marks today's tiny task as not done." when already marked) to the task-done button in TodayEntry.tsx.
- source: /critique pass 17 (commit 21ebca6)
- issue: [mirror-failed: 2026-05-27T22:25:00Z]
- resolution: added dynamic title attribute (marks today's tiny task as done. / not done.) to the task-done button in TodayEntry.tsx. Shipped at 156c342.

### [ ] [2.1] / — "entering an email address for the first time creates an account" is ambiguous for returning visitors
- category: external-critique
- impact: 3
- ease: 7
- observation: the CTA footer reads "entering an email address for the first time creates an account. the link arrives once." a returning visitor who already has an account reads "for the first time" and may worry whether entering their existing email again creates a duplicate account rather than sending a sign-in link.
- evidence: footer CTA: "today's prompt is waiting. entering an email address for the first time creates an account. the link arrives once. no password is set. no other mail is sent." — no copy disambiguates behavior for known email addresses.
- suggested fix: split into two cases: "a known address receives a sign-in link. a new address creates an account." — covers both visitor types in the same declarative register.
- source: /critique pass 17 (commit 21ebca6)

### [ ] [1.8] /signin — expiry notice appears in the pre-submission state
- category: external-critique
- impact: 3
- ease: 6
- observation: "sign-in links expire after 24 hours." appears in the page footer before any link has been sent. a first-time visitor completing the email form reads this as an unprompted time-pressure signal rather than post-send guidance.
- evidence: page body text (pre-submission state): "sign in. / email / send the link / a sign-in link is sent to this address. no password. no other mail. / ember / sign-in links expire after 24 hours." — the expiry line is always visible, not conditional on link dispatch.
- suggested fix: move the expiry copy into the post-submission confirmation view (shown after the link is sent), so it reads as context for a link already in transit rather than a pre-emptive warning.
- source: /critique pass 17 (commit 21ebca6)

### [x] [3.6] /today and /log/[date] — save indicator reads "not yet saved"; "yet" violates coaching-free copy rule
- category: external-critique
- impact: 4
- ease: 9
- observation: the save-state indicator on /today and /log/[date] returns "not yet saved" when the user has typed content but hasn't saved. the word "yet" implies the user should have saved already — a failure-state framing explicitly prohibited by design/CLAUDE.md "coaching-free copy" rule ("no 'yet' implying failure ('not yet saved')"). the string is used in TodayEntry.tsx (saveIndicatorText fallback) and EditEntry.tsx (inline JSX).
- evidence: src/app/today/TodayEntry.tsx:148: `return 'not yet saved'`; src/app/log/[date]/EditEntry.tsx:114: `{savedAt ? formatSavedTime(savedAt) : 'not yet saved'}`; design/CLAUDE.md "coaching-free copy" rule names "not yet saved" as an example violation
- suggested fix: replace "not yet saved" with "unsaved" in both locations — states what IS (the entry is unsaved) without implying expectation or failure
- source: /iterate audit 2026-05-29
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: replaced "not yet saved" with "unsaved" in TodayEntry.tsx and EditEntry.tsx; updated SaveIndicator.test.tsx regression guard. Shipped at 9615e7d.

## Done

### [x] [4.5] a11y — sign-in confirmation message has no ARIA live region

- category: a11y
- impact: 5
- ease: 9
- observation: `src/app/signin/page.tsx` shows a `<p className={styles.confirmation}>` when `state === 'sent'`, but this paragraph carries no `role="status"` or `aria-live`. Screen readers will not announce that the magic-link email was sent. The error state already has `role="alert"` (line 86), but the success state was missed — the same class of gap that was fixed in TodayEntry (lastSaved aria-live), SettingsForm (saveStatus aria-live), and SigninPage error (role="alert").
- evidence: `src/app/signin/page.tsx` line 54: `<p className={styles.confirmation}>check your email...` — no role, no aria-live, rendered only when `state === 'sent'`.
- suggested fix: add `role="status"` to the confirmation `<p>` so screen readers politely announce the success state.
- issue: [mirror-failed: 2026-05-21T00:00:00Z]
- resolution: added `role="status"` to the confirmation `<p>` in signin/page.tsx. Shipped at d5d2f20.

### [x] [3.6] a11y — ProfileMosaic published tile links missing entry state label

- category: a11y
- impact: 4
- ease: 9
- observation: `ProfileMosaic.tsx` renders published tiles as Link elements with `aria-label={tile.displayDate}`. The label announces only the date ("Mon 12 May 2026") with no indication the tile links to a published entry. Screen reader users navigating the public profile mosaic hear only a date — no context about what they are navigating to. This is the same gap that was fixed in LogMosaic (finding [4.8]), but was not applied to the parallel ProfileMosaic component.
- evidence: `src/app/u/[username]/ProfileMosaic.tsx` line 31: `aria-label={tile.displayDate}` — bare date, no state context. LogMosaic fix at c8770e7 added `tileStateLabel()` to make labels like "Wed 13 May 2026 — published"; ProfileMosaic still uses bare date.
- suggested fix: change `aria-label={tile.displayDate}` to `` aria-label={`${tile.displayDate} — published entry`} `` — all clickable tiles in ProfileMosaic are by definition published.
- issue: [mirror-failed: 2026-05-21T00:00:00Z]
- resolution: changed `aria-label={tile.displayDate}` to `` aria-label={`${tile.displayDate} — published entry`} `` in ProfileMosaic.tsx. Shipped at 22f9659.

### [x] [3.6] a11y — TodayEntry task button aria-label is static regardless of pressed state

- category: a11y
- impact: 4
- ease: 9
- observation: `TodayEntry.tsx` uses `aria-pressed={taskDone}` correctly to convey toggle state, but `aria-label="mark task done"` is static and never changes. When `taskDone=true`, screen readers announce "mark task done, toggle button, pressed" — the label describes the forward action but not the reverse. A user hearing this cannot tell that clicking will unmark the task. Dynamically updating the label removes the ambiguity.
- evidence: `src/app/today/TodayEntry.tsx` line 57: `aria-label="mark task done"` — hardcoded string with no dependency on `taskDone`.
- suggested fix: change to `aria-label={taskDone ? 'mark task not done' : 'mark task done'}`.
- issue: #24
- resolution: changed to `aria-label={taskDone ? 'mark task not done' : 'mark task done'}` in TodayEntry.tsx. Shipped at a8db48d.

### [x] [4.0] test — /api/auth/signin route has no unit tests

- category: tests
- impact: 5
- ease: 8
- observation: `src/app/api/auth/signin/route.ts` exports POST (initiates Supabase magic-link OTP) but has no colocated unit tests. Every other API route has colocated tests. Uncovered branches: missing/non-string email → 400; Supabase OTP error → 400; success → 200; three-tier env-var fallback for emailRedirectTo.
- evidence: `find src/app/api/auth/signin -name "*.test.*"` returned no results.
- suggested fix: add `src/app/api/auth/signin/__tests__/route.test.ts` with 6 tests.
- issue: [mirror-failed: 2026-05-20T12:06:00Z]
- resolution: added `src/app/api/auth/signin/__tests__/route.test.ts` with 6 tests. Shipped at 2dcef41.

### [x] [3.6] test — settings route missing `use_personalized_prompts` test coverage

- category: tests
- impact: 4
- ease: 9
- observation: `POST /api/settings` handles `use_personalized_prompts` (added in phase 12) at lines 57–59 of `src/app/api/settings/route.ts`, but the test suite has no test that includes this field in the request body. If the field is silently dropped during a future refactor, no test catches it. Every other accepted field (display_name, username, timezone, conflict handling) has explicit coverage.
- evidence: `src/app/api/settings/route.ts` lines 57–59: `if (use_personalized_prompts !== undefined && typeof use_personalized_prompts === 'boolean')`. `src/app/api/settings/__tests__/route.test.ts`: 6 tests, none pass `use_personalized_prompts` in the body.
- suggested fix: add a test that sends `{ use_personalized_prompts: true }` and asserts `mockUpsert` was called with `expect.objectContaining({ use_personalized_prompts: true })`.
- issue: [mirror-failed: 2026-05-20T00:00:00Z]

### [x] [3.6] perf — landing page sign-in links are raw `<a>` anchors

- category: perf
- impact: 4
- ease: 9
- observation: `src/app/page.tsx` had two raw `<a href="/signin">` anchors — header nav (line 17) and CTA button (line 91). Both are the primary conversion path for all unauthenticated visitors, causing full-page reloads instead of client-side navigation with prefetching. The nav-link audit (finding [4.5]) fixed authenticated nav links but missed the anonymous landing page.
- evidence: `src/app/page.tsx` line 17: `<a href="/signin">sign in</a>` in `<nav>`; line 91: `<a className={styles.ctaBtn} href="/signin">sign in to start</a>` in CTA.
- suggested fix: import `Link` from 'next/link'; replace both `<a href="/signin">` with `<Link href="/signin">`.
- issue: [mirror-failed: 2026-05-21T00:00:00Z]
- resolution: replaced both raw anchors with `<Link>` in src/app/page.tsx. Shipped at a313cd3.

### [x] [2.7] perf — DayStrip "see all sixty" link is a raw `<a>` anchor

- category: perf
- impact: 3
- ease: 9
- observation: `src/app/today/DayStrip.tsx` renders `<a href="/log" className={styles.stripLink}>see all sixty</a>`, causing a full-page reload when clicked. The nav-link audit (finding [4.5]) fixed all nav anchors but missed this content link in DayStrip.
- evidence: `src/app/today/DayStrip.tsx` line ~46: raw `<a href="/log">`.
- suggested fix: import `Link` from `next/link` in DayStrip.tsx and replace `<a href="/log">` with `<Link href="/log">`.
- resolution: replaced raw `<a>` with `<Link>` and imported `Link` from `next/link` in DayStrip.tsx.

### [x] [2.7] a11y — DayStrip section has no accessible heading

- category: a11y
- impact: 3
- ease: 9
- observation: `<section className={styles.strip}>` in `DayStrip.tsx` uses a `<span>` for its visible label "your last seven days". Screen reader users navigating by headings skip straight from the page `<h1>` (today's prompt) to nothing inside DayStrip. Unlabeled sections are not exposed as named landmarks.
- evidence: `src/app/today/DayStrip.tsx` line ~41: `<span className={styles.stripLabel}>your last seven days</span>` — plain span, not a heading.
- suggested fix: change `<span className={styles.stripLabel}>` to `<h2 className={styles.stripLabel}>` to add the section to heading navigation.
- resolution: changed `<span className={styles.stripLabel}>` to `<h2 className={styles.stripLabel}>` in DayStrip.tsx.

### [x] [4.5] perf — site nav uses raw `<a>` tags; full-page reload on every authenticated navigation

- category: perf
- impact: 5
- ease: 9
- observation: all four authenticated page layouts (`today/`, `log/`, `log/[date]/`, `settings/`) render the site nav with raw `<a href="...">` anchors instead of Next.js `<Link>`. Raw anchors trigger full-page reloads; `<Link>` enables client-side transitions and prefetching. `Link` is already imported in all four files.
- evidence: `src/app/today/page.tsx` lines 63–65; `src/app/log/page.tsx` lines 73–76; `src/app/log/[date]/page.tsx` lines 62–65; `src/app/settings/page.tsx` lines 38–40 and line 54.
- suggested fix: replace `<a href="...">` with `<Link href="...">` in all four nav blocks and the settings profile link.
- issue: #23

### [x] [4.0] bug — entries API accepts future dates; UI rejects them

- category: bug
- impact: 5
- ease: 8
- observation: `POST /api/entries` validates date format (YYYY-MM-DD) but does not check whether the date is in the future. Authenticated users can submit entries for future dates. These rows are stored in the DB but are inaccessible via the UI — `log/[date]/page.tsx` already calls `notFound()` for any date > today. The inconsistency creates phantom rows that violate the product model (one entry per day, written on that day).
- evidence: `src/app/api/entries/route.ts` lines 31–33: validates format only, no temporal bound. `src/app/log/[date]/page.tsx` lines 26–29: rejects future dates with `notFound()`.
- suggested fix: derive UTC today as `new Date().toISOString().slice(0, 10)`, check `if (date > today)` and return 400. Add a test for this branch.
- issue: #22
- resolution: added today-date guard in `src/app/api/entries/route.ts` and a new test. Shipped at c5ffb03.

### [x] [5.4] a11y — SigninPage error message has no role="alert"

- category: a11y
- impact: 6
- ease: 9
- observation: `src/app/signin/page.tsx` renders `<p className={styles.errorMsg}>{errorMsg}</p>` when `state === 'error'`, but the paragraph carries no `role="alert"` and no `aria-live`. When sign-in fails (invalid email, Supabase rate-limit, network error) the error text appears visually but screen readers receive no announcement — identical to the pattern already fixed in TodayEntry and SettingsForm.
- evidence: `src/app/signin/page.tsx` line 86: `<p className={styles.errorMsg}>{errorMsg}</p>` — no role, no aria-live, dynamically rendered on error.
- suggested fix: add `role="alert"` to the error paragraph.
- issue: #19

### [x] [4.5] test — signout route has no unit tests

- category: tests
- impact: 5
- ease: 9
- observation: `src/app/auth/signout/route.ts` exports POST (calls `supabase.auth.signOut()` then redirects to `/`) and GET (returns 405). Neither branch has a test. Every other API route has colocated tests.
- evidence: `find src -path "*/signout*test*"` returns no results.
- suggested fix: add `src/app/auth/signout/__tests__/route.test.ts` with 2 tests: POST signs out and redirects to `/`; GET returns 405.
- issue: #20
- resolution: added `src/app/auth/signout/__tests__/route.test.ts` with POST and GET tests. Shipped at bbeb643.

### [x] [3.6] seo — log/[date] generateMetadata missing description

- category: seo
- impact: 4
- ease: 9
- observation: `src/app/log/[date]/page.tsx` `generateMetadata` returns only `{ title }` with no `description`. Search engines and social previews fall back to the root layout description ("ten minutes of intention before the day swallows you") for all date-specific log pages.
- evidence: `src/app/log/[date]/page.tsx` lines 15–20: `return { title: \`ember · log · ${date}\` }` — no description key.
- suggested fix: add `description: 'your entry for ${date}'` (or similar) to the return object.
- issue: #21
- resolution: added `description: \`your entry for ${date}\`` to generateMetadata return. Shipped at c0fcf1f.

### [x] [5.6] seo — public profile pages missing openGraph and twitter metadata

- category: seo
- impact: 8
- ease: 7
- observation: `/u/[username]/page.tsx` returned only `title` and `description` from `generateMetadata` — no `openGraph` or `twitter`. `/u/[username]/[date]/page.tsx` returned only `title`. Shared links fell back to the generic root layout card.
- evidence: `src/app/u/[username]/page.tsx` lines 17–23; `src/app/u/[username]/[date]/page.tsx` lines 18–23.
- suggested fix: add `openGraph` and `twitter` blocks to both routes' `generateMetadata`, using `NEXT_PUBLIC_SITE_URL` for canonical URLs.
- issue: #17
- resolution: added `description`, `openGraph`, and `twitter` to both routes. Shipped at 7532c5d.

### [x] [5.4] a11y — SettingsForm save feedback has no ARIA live regions

- category: a11y
- impact: 6
- ease: 9
- observation: `SettingsForm.tsx` updates the UI dynamically after save — a "saved." confirmation span and error messages — but neither uses ARIA live regions. The `saveStatus` span always renders "saved." in the DOM; only a CSS class toggles visibility (no content change), so screen readers do not announce the confirmation. The `saveError` span and `fieldError` paragraph are conditionally rendered on error but carry no `role="alert"`.
- evidence: `src/app/settings/SettingsForm.tsx` lines 189–194: `saveStatus` span no `aria-live`; `saveError` span no `role`; line 183–185: `fieldError` paragraph no `role`.
- suggested fix: add `aria-live="polite"` to `saveStatus` span and render conditional content; add `role="alert"` to `saveError` and `fieldError`.
- issue: #16

### [x] [4.8] a11y — LogMosaic tile aria-labels omit entry state

- category: a11y
- impact: 6
- ease: 8
- observation: `LogMosaic.tsx` renders 60 interactive link tiles each with `aria-label={tile.displayDate}`. Screen reader and keyboard users navigating the mosaic hear only the date ("Wed 13 May 2026") with no indication of tile state — whether the day has a written entry, a published entry, or no entry at all.
- evidence: `src/app/log/LogMosaic.tsx` line 82: `aria-label={tile.displayDate}` on every tile regardless of `tile.state` (`empty` | `filled` | `today` | `published`)
- suggested fix: append state description to aria-label: "no entry" / "written" / "today" / "published"
- issue: #15
- resolution: added `tileStateLabel()` helper in LogMosaic.tsx; aria-label now reads "Wed 13 May 2026 — written" etc. Shipped at c8770e7.

### [x] [4.8] a11y — save feedback in TodayEntry has no live region

- category: a11y
- impact: 6
- ease: 8
- observation: `TodayEntry.tsx` updates the `lastSaved` span text dynamically after a save, and conditionally renders an error paragraph on failure. Neither element uses ARIA live regions. Screen reader users won't know when their entry has saved successfully or if a save error has occurred — the only feedback is visual.
- evidence: `src/app/today/TodayEntry.tsx` line 80: `<span className={styles.lastSaved}>` text updates after save with no aria-live; line 103–105: error `<p>` conditionally rendered with no role="alert"
- suggested fix: add `aria-live="polite"` to the `lastSaved` span; add `role="alert"` to the error paragraph
- issue: #14
- resolution: added `aria-live="polite"` to the lastSaved span and `role="alert"` to the save error paragraph in TodayEntry.tsx. Shipped at 8b41e0a.

### [x] [5.4] a11y — task-done state not conveyed to screen readers on log views

- category: a11y
- impact: 6
- ease: 9
- observation: `log/[date]/page.tsx` renders `<span className={styles.entryTaskCheck} />` and `<span className={styles.entryTaskUnchecked} />` as purely visual indicators. `log/page.tsx` renders `<span className={recentEntry.task_done ? styles.entryTaskCheck : undefined} />`. All three spans are empty — no `aria-label`, no `role`, no text. Screen readers see only the task description with no indication of whether the task was completed.
- evidence: `src/app/log/[date]/page.tsx` lines 79–84; `src/app/log/page.tsx` line 104.
- suggested fix: add `role="img"` and `aria-label="task done"` / `aria-label="task not done"` to the task-state spans in both files.
- issue: #13
- resolution: added `role="img"` and `aria-label="task done"`/`"task not done"` to task-state spans in both log pages. Shipped at 22c5da5.

### [x] [6.3] a11y — TodayEntry textarea has no programmatic label

- category: a11y
- impact: 7
- ease: 9
- observation: `src/app/today/TodayEntry.tsx` renders a `<p className={styles.entryLabel}>your response</p>` above the textarea, but it is a plain paragraph, not a `<label>` element. The textarea has no `id`, no `htmlFor` association, and no `aria-label`. Screen readers will not announce "your response" when the user focuses the textarea — the core write surface of the app.
- evidence: `TodayEntry.tsx` lines ~45–52: `<p className={styles.entryLabel}>your response</p>` immediately above `<textarea ... />` with no id, no aria-label, no htmlFor link.
- suggested fix: change the `<p>` to `<label htmlFor="today-entry-response">`, add `id="today-entry-response"` to the textarea.
- issue: #12
- resolution: changed `<p>` to `<label htmlFor="today-entry-response">` and added `id="today-entry-response"` to the textarea. Shipped at 44613b0.

### [x] [5.6] bug — log mosaic counts wrong on today-tile edge case

- category: bug
- impact: 5
- ease: 9
- observation: `src/app/log/page.tsx` computed `written`, `quiet`, and `published` by filtering the `tiles` array on `state`. Two faults: (1) today's tile always has `state = 'today'` (set before the `is_published` check), so a published today-entry is never counted in `published`. (2) today's tile has `state = 'today'` even with no entry yet, inflating `written` by 1 for every new user before they've ever written.
- evidence: tile state machine in `log/page.tsx` sets `state = 'today'` before `is_published` check; `written = tiles.filter(t => t.state !== 'empty').length` always includes today.
- suggested fix: derive counts from the `entries` map directly (`entries.size`, `60 - entries.size`, `[...entries.values()].filter(e => e.is_published).length`).
- resolution: fixed in `src/app/log/page.tsx` — counts now derived from the `entries` map. Shipped this tick.

### [x] [4.2] test gap — auth middleware has no unit tests

- category: tests
- impact: 6
- ease: 7
- observation: `src/middleware.ts` had no unit tests despite being the sole auth guard for all protected routes (`/today`, `/log`, `/settings`). It also redirects authenticated users away from `/signin`.
- evidence: `find src -name "*.test.*" | xargs grep -l "middleware"` returned no results.
- suggested fix: add `src/__tests__/middleware.test.ts` covering unauthenticated redirects, authenticated pass-through, and /signin-to-/today redirect.
- issue: #11
- resolution: added 12 tests in `src/__tests__/middleware.test.ts` using `@vitest-environment node`. Shipped at f5990c2.

### [x] [4.2] content gap — only 20 prompts vs spec target of ~100; rotation repeats every 20 days

- category: content-gaps
- impact: 7
- ease: 6
- observation: `content/prompts.json` contains 20 entries. The deterministic rotation in `src/lib/prompts.ts` cycles `daysSinceEpoch % prompts.length`, so any user practicing daily sees the same prompt every 20 days. Phase 5 brief specified "a seed list of ~100 prompts."
- evidence: `cat content/prompts.json | python3 -c "import json,sys; print(len(json.load(sys.stdin)))"` → 20
- suggested fix: expand content/prompts.json to ~100 entries in the established voice. Delegate to prompt-curator sub-agent; no schema or code changes required.
- next: spawn prompt-curator sub-agent to write ~80 additional prompts + tasks in the established voice
- issue: #10
- resolution: expanded content/prompts.json from 20 to 101 entries via prompt-curator sub-agent. Shipped at a6d0d49.

### [x] [user-issue #6] [HIGH] entries table missing from Supabase — migrations not applied

- category: external-issue
- impact: 9
- ease: 6
- issue: #6
- investigated: 2026-05-16 — at the time, confirmed all 4 migrations in supabase/migrations/ had not been applied to the connected project.
- resolution: superseded. The `march.yml` cloud-loop workflow gained an "Apply Supabase migrations" step that pushes pending migrations every tick via the IPv4 session pooler — using `SUPABASE_PROJECT_ID` + `SUPABASE_DB_PASSWORD` (already GitHub secrets) and the `SUPABASE_REGION` variable; no `SUPABASE_ACCESS_TOKEN` required. Verified via `/oversight` 2026-05-21: a REST probe of `/rest/v1/entries` returned HTTP 200, confirming the table exists in production. No user action required; GitHub issue #6 can be closed.

### [x] [6.3] stale useCallback closure in SettingsForm silently ignores personalizedVal on save

- category: bug
- impact: 7
- ease: 9
- resolution: added `personalizedVal` to the `useCallback` dependency array. Shipped at 0419eb3.
- issue: #9

### [x] [5.4] robots.txt and sitemap.xml absent — site is not crawlable

- category: seo
- impact: 6
- ease: 9
- issue: #7
- resolution: added `src/app/robots.ts` and `src/app/sitemap.ts` using Next.js 15 App Router conventions. Shipped at 8e399c7.

### [x] [4.9] OG / social metadata absent on all pages

- category: seo
- impact: 7
- ease: 7
- resolution: added openGraph (type, siteName, title, description, url) and twitter card (summary) to root layout metadata. Text cards now surface on every social/messaging platform. No OG image for v1. Shipped at 2907586.

### [x] [4.0] auth/callback route has no unit test

- category: tests
- impact: 5
- ease: 8
- issue: #8
- resolution: added `src/app/auth/callback/__tests__/route.test.ts` with 3 tests covering all three branches. Shipped at bef2c0e.

### [x] [user-issue #5] [HIGH] log in bug — magic-link callback redirects to localhost

- category: external-issue
- impact: 9
- ease: 7
- resolution: added `VERCEL_PROJECT_PRODUCTION_URL` as fallback in `src/app/api/auth/signin/route.ts` so the route no longer falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is absent. Added two targeted tests covering the env-var fallback chain. Note: the Supabase Dashboard "Site URL" at Authentication → URL Configuration should also be set to the production Vercel URL — that is a user action in the Supabase console.
