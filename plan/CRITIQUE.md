# External-observer findings — Ember

> Last pass: 2026-06-17 at commit d450909
> Pass count: 61

> Written by `/critique` after walking the live site as a
> fresh-eyes visitor. Drained by `/iterate`.

## Pending

### [MED] /today — formatSavedTime always renders UTC time; users in non-UTC timezones see an incorrect save timestamp
- pass: 61 (commit d450909)
- viewport: both
- category: comprehension
- observation: the "last saved" indicator on /today (e.g. "last saved · 01:46") formats the timestamp using getUTCHours() and getUTCMinutes() — UTC is hardcoded. a user whose timezone is UTC+5 who saves at 6:46 AM local time sees "01:46" — the UTC equivalent. for a journaling app where prompt delivery and entry dating are both timezone-aware, an incorrect local-time save indicator undermines trust in the save record and conflicts with the app's own timezone setting.
- evidence: src/lib/entries.ts formatSavedTime(): const h = String(d.getUTCHours()).padStart(2, '0'); const m = String(d.getUTCMinutes()).padStart(2, '0') — no user-timezone conversion. the /today page shows "last saved · 01:46" which reflects UTC, not the user's saved timezone.
- suggested fix: pass the user's IANA timezone string (already stored in the profile) to formatSavedTime and use toLocaleTimeString with the user's timezone option, or apply a UTC-to-user-tz offset using the same timezone logic as the date stamp above the prompt.
- source: browser

### [MED] /settings — "print your book" link gives no context for first-time users; "book" is undefined in the UI
- pass: 61 (commit d450909)
- viewport: both
- category: comprehension
- observation: the link "print your book" appears on /settings between "export your data" and "delete my account" with no surrounding explanation of what "book" refers to. a first-time user who has written a handful of entries has no prior context that their entries can be compiled into a printable document. the concept is introduced only through the action label itself, leaving the user to guess what the feature produces.
- evidence: /settings capture: "export your data print your book\ndelete my account and all my entries" — no description precedes or follows the link; contrast "export your data" which is self-describing.
- suggested fix: add a brief prose line adjacent to the link, e.g. "format your entries as a printable document." to give the feature a one-line description, or add a tooltip/aria-description that conveys what "book" produces.
- source: browser

### [LOW] /log — "showing the most recent." is a sentence fragment with no object noun
- pass: 61 (commit d450909)
- viewport: both
- category: comprehension
- observation: the truncation notice below the most recent entry card reads "showing the most recent." — a participial sentence fragment with no noun complement. a reader encountering this phrase in isolation has no explicit object: most recent what? the surrounding entry card provides implicit context, but the sentence is grammatically incomplete and reads oddly as interface copy.
- evidence: src/app/log/page.tsx line 231: "showing the most recent.{' '}" followed by <Link>full entry</Link> — the prose fragment appears before the "full entry" link with no explicit noun.
- suggested fix: rewrite as "showing the most recent entry." to supply the missing object noun and produce a grammatically complete sentence.
- source: browser

### [LOW] /today — "will remain private" asserts an existing published-but-private state rather than a conditional
- pass: 61 (commit d450909)
- viewport: both
- category: voice
- observation: the inline notice reads "no public username is set. published entries will remain private until a username is added in settings." the phrase "will remain private" implies that entries are already in a published-but-private holding state. for a user who has not yet published anything, no such state exists — the phrasing incorrectly asserts a current condition. a clearer phrasing would frame this as a conditional: what happens if you publish without a username, not what is currently happening.
- evidence: src/app/today/TodayEntry.tsx line 293: "no public username is set. published entries will remain private until a username is added in settings." — "will remain" is assertive present-continuous, not conditional.
- suggested fix: change to "if published without a username, entries remain private until a username is added." to make the conditional explicit rather than asserting an existing published-but-private state.
- source: browser

### [LOW] /settings — prompt source pack descriptions visible only on selection; unchosen options give no preview
- pass: 61 (commit d450909)
- viewport: both
- category: comprehension
- observation: the prompt source section shows a description (e.g. "a varied daily prompt.") only for the currently selected pack via a dynamic paragraph. options like "stoic" or "grief" have no visible description until selected. a first-time user browsing the list sees five option names — standard, gratitude, craft, stoic, grief — with no indication of what each category entails until they actively select it. pack names like "grief" may give pause without the context that the description would provide.
- evidence: /settings capture: "prompt source\n\na varied daily prompt.\n\nstandard\ngratitude\ncraft\nstoic\ngrief" — only the selected pack's description visible; unchosen options shown as bare labels with no inline hint.
- suggested fix: add a brief parenthetical or visually-subordinate description beneath each option label (similar to how the daily-reminder and weekly-reflection on/off options each have their own description paragraphs) so users can scan all options without having to select each.
- source: browser

### [x] [LOW] /today — day-strip abbreviated weekday labels not aria-hidden; AT reads weekday name twice per entry
- pass: 60 (commit 897e523)
- viewport: both
- category: a11y
- observation: the "last seven days" strip renders an abbreviated weekday label ('Wed', 'Thu', etc.) immediately before the full date string ('Wed 10 Jun 2026 — no entry') for each item. if the abbreviated label is not aria-hidden, AT users hear the weekday name announced twice — once from the abbreviation and once from the full date string.
- evidence: /today capture: "Wed\nWed 10 Jun 2026 — no entry\nThu\nThu 11 Jun 2026 — no entry" — abbreviated day name precedes the full date text for each strip item with no aria-hidden on the abbreviation element.
- suggested fix: add aria-hidden="true" to the abbreviated day label element in src/app/today/DayStrip.tsx so AT reads only the full date string per strip item.
- source: browser
- resolution: false positive — aria-hidden="true" was already on the stripDate <span> (added at 9b1e99f); capture showed both the aria-hidden visual label and the sr-only full date string, which is correct AT behaviour. Duplicate of the resolved finding at pass 58 line 450. Closed without code change.

### [x] [LOW] /settings — export and print controls abut without whitespace; concatenated in accessible text
- pass: 60 (commit 897e523)
- viewport: both
- category: a11y
- observation: the "export your data" and "print your book" controls appear in the accessible text without any whitespace separator — concatenated as "export your dataprint your book". if the elements are inline siblings with no whitespace text node between them, a screen reader may announce both as a single continuous string.
- evidence: /settings capture: "export your dataprint your book" — no space between the two link/button labels. contrast surrounding controls which each appear on their own line in the capture.
- suggested fix: add a whitespace text node (a space or line break) between the two elements in src/app/settings/page.tsx so they are announced as separate controls.
- source: browser
- issue: #67
- resolution: added {' '} between the two elements in src/app/settings/page.tsx. Shipped at 74e15f2.

### [x] [LOW] /log — "the past 60 days" heading overstates window scope for sparse accounts
- pass: 60 (commit 897e523)
- viewport: both
- category: comprehension
- observation: the /log page heading reads "the past 60 days" while the stat line reads "2 days written. 0 days published." for a new user, the large scoped heading paired with a sparse count creates ambiguity — a first-time reader cannot tell whether "60 days" is the browsing window or an expected entry count, and the mismatch may read as a broken or incomplete feature.
- evidence: /log capture: "the past 60 days\n\n2 days written. 0 days published." — heading states a 60-day window but the stat confirms only 2 entries exist with presumably 58 empty mosaic tiles.
- suggested fix: add a brief clarifying sub-label such as "a 60-day writing window" or rephrase the heading as "the past 60 days — a window, not a count" to remove the ambiguity for new users.
- source: browser
- issue: #68
- resolution: changed heading text to "the past 60 days — a writing window." in src/app/log/page.tsx. Shipped at eb6ce9d.

### [x] [LOW] /settings — prompt source radio labels embed full descriptions inline; verbose under AT announcement
- pass: 60 (commit 897e523)
- viewport: both
- category: a11y
- observation: each prompt source radio option embeds a full descriptive clause after an em-dash in the label ("standard — a varied daily prompt.", "gratitude — noticing what has arrived and what continues."). when a screen reader announces the radio, it reads the entire multi-clause label. the daily-reminder and weekly-reflection options use aria-describedby for supplementary text; the prompt source options could follow the same pattern.
- evidence: /settings capture: "standard — a varied daily prompt.\ngratitude — noticing what has arrived and what continues.\ncraft — attention to making, process, and material.\nstoic — what is yours to do, and what is not.\ngrief — carrying loss, change, and what remains." — full description embedded in each radio label text.
- suggested fix: separate each description into a sibling <span> with aria-describedby so the radio label is the pack name alone ("standard", "gratitude", etc.) and the description is supplementary context, matching the pattern used for daily-reminder and weekly-reflection.
- source: browser
- issue: #70
- resolution: changed <option> text to just the pack label name; the hint paragraph (aria-describedby="desc-prompt-pack") now dynamically shows the selected pack's description. Shipped at 7fa8ae7.

### [x] [MED] /signin — email input removes browser focus outline with no adequate replacement; WCAG 2.4.11 gap
- pass: 53 (commit 3f0847a)
- viewport: both
- category: a11y
- observation: the email input on /signin sets outline: none and relies solely on a 1px border-bottom color change (from hairline gray to the accent color) as the focus indicator. WCAG 2.4.11 (Focus Appearance, Level AA in 2.2) requires a focus indicator with sufficient minimum area. a single-pixel bottom-border transition does not meet the perimeter-area threshold around the component. this is a distinct gap from the missing autocomplete finding (pass 51) — that addresses input purpose; this addresses keyboard focus visibility.
- evidence: src/app/signin/page.module.css: .fieldInput { outline: none; } and .fieldInput:focus { border-bottom-color: var(--color-accent); } — no box-shadow, no outline replacement, no ring of sufficient thickness.
- suggested fix: remove outline: none from .fieldInput and add .fieldInput:focus { outline: 2px solid var(--color-accent); outline-offset: 2px; } to provide a visible focus ring meeting WCAG 2.4.11.
- source: browser
- issue: #40
- resolution: added outline: 2px solid var(--color-accent); outline-offset: 2px to .fieldInput:focus in src/app/signin/page.module.css. Shipped at bd69812.

### [x] [MED] / — landing page interactive elements (.headerNav a, .ctaBtn) have no :focus-visible styles; keyboard focus invisible
- pass: 54 (commit 4ca3212)
- viewport: both
- category: a11y
- observation: the header nav "sign in" link and the sticky CTA "sign in" button have no :focus or :focus-visible rule in src/app/page.module.css. tailwind v4 preflight resets browser default outlines. keyboard users tabbing through the landing page see no visible focus indicator on either interactive element. the identical gap was corrected on the /signin email input in pass 53 (added outline: 2px solid var(--color-accent) to .fieldInput:focus), but the landing page links and button were not updated in that same pass.
- evidence: src/app/page.module.css: no :focus or :focus-visible rule for .headerNav a or .ctaBtn. src/app/globals.css: @import 'tailwindcss' (v4.1.6) applies preflight that resets outlines. compare src/app/signin/page.module.css: .fieldInput:focus { outline: 2px solid var(--color-accent); outline-offset: 2px; } — explicit outline added at bd69812.
- suggested fix: add .headerNav a:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; } and .ctaBtn:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; } to src/app/page.module.css.
- source: browser
- issue: #44
- resolution: added .headerNav a:focus-visible and .ctaBtn:focus-visible with outline: 2px solid var(--color-accent); outline-offset: 2px to src/app/page.module.css. Shipped at 32c93fb.

### [x] [MED] /today — H1 is the daily prompt question; no stable in-page page-identity heading
- pass: 54 (commit 4ca3212)
- viewport: both
- category: a11y
- observation: the page H1 is the day's prompt text — a daily-changing question (e.g. "what's the longest you've gone without speaking to someone, and what was it like?"). no static heading identifies the page or the writing surface. AT users navigating by heading encounter a different H1 every day with no structural heading indicating page context. the date is a plain paragraph before the H1, not a heading element.
- evidence: src/app/today/page.tsx line 83: <h1 className={styles.prompt} aria-describedby="today-date">{prompt}</h1> — the H1 contains the day's prompt question. line 81: <p className={styles.dateStamp} id="today-date">{displayDate}</p> — date is a paragraph, not a heading. the page <title> is "ember · today" but the in-page heading tree has only the prompt question as H1 followed by H2 "the last seven days" in the day strip.
- suggested fix: add a visually-styled or sr-only <span className={styles.srOnly}>today</span> before the prompt inside the H1 element, or promote a "today" heading above the prompt and demote the prompt to an <h2>, so the heading tree has a stable page identifier followed by the day's question.
- source: browser
- issue: #46
- resolution: added <span className={styles.srOnly}>today — </span> inside H1 before prompt in src/app/today/page.tsx. Shipped at 8c951ee.

### [x] [MED] /settings — delete confirmation panel uses role="group" instead of role="alertdialog"; warning not announced on panel open
- pass: 54 (commit 4ca3212)
- viewport: both
- category: a11y
- observation: the two-step account deletion confirmation panel uses role="group" aria-label="confirm account deletion". destructive confirmation panels containing a warning message that requires user decision should use role="alertdialog" so screen readers interrupt reading and announce the panel's warning text when it opens. with role="group", the warning "permanently delete your account and all entries. there is no undo." is not proactively surfaced to AT users when the panel appears.
- evidence: src/app/settings/DeleteAccountSection.tsx line 42: <div className={styles.deleteConfirm} role="group" aria-label="confirm account deletion"> — role="group" does not carry alertdialog semantics. the ARIA authoring practices specify role="alertdialog" for dialogs that contain an alert message and require user action before continuing.
- suggested fix: change role="group" to role="alertdialog" and add aria-modal="true" plus aria-describedby pointing to the warning paragraph's id on the confirmation panel div, so screen readers announce the destructive warning when the panel opens.
- source: browser
- issue: #45
- resolution: changed role="group" to role="alertdialog", added aria-modal="true" and aria-describedby="delete-warning"; added id="delete-warning" to warning paragraph. Shipped at 5fd8c9e.

### [x] [LOW] / — "ember does not personalize your morning" uses second-person possessive; breaks impersonal register
- pass: 54 (commit 4ca3212)
- viewport: both
- category: voice
- observation: the first sentence of the closing section reads "ember does not personalize your morning." the word "your" is the only second-person address in the landing page's main content. all surrounding copy uses impersonal declarative framing ("a missed day leaves no mark", "the log shows what is, not what isn't", "there are no streaks to break"). the second-person address is conspicuous in a careful reading.
- evidence: src/app/page.tsx line 74: <p>ember does not personalize your morning.</p> — "your" is second-person possessive. contrast line 77: "a missed day leaves no mark." — fully impersonal declarative register throughout the rest of the closing section.
- suggested fix: rewrite as "ember does not personalize the morning." to remove second-person address and stay in the impersonal declarative register of the surrounding copy.
- source: browser
- resolution: intentional brand rhetoric — the "your morning" / "does not personalize" contrast is the point of the sentence; keep as-is per /oversight 2026-06-11. Closed without code change.

### [x] [LOW] /signin — account-creation notice is the final sentence in the reassurance paragraph; new visitors may miss it
- pass: 55 (commit 988fbcf)
- viewport: both
- category: comprehension
- observation: the reassurance paragraph on /signin ends with "a new address creates an account." as the fourth and final sentence. a visitor scanning quickly reads "a sign-in link is sent to this address." (sentence 1) and may assume the form is sign-in-only, missing the account-creation path entirely. the landing page CTA had this sentence order corrected in pass 48 (shipped at aab597f) but the /signin reassurance paragraph was not updated in that same pass.
- evidence: src/app/signin/page.tsx reassurance paragraph: "a sign-in link is sent to this address. it expires after 24 hours. no password. no other mail. a new address creates an account." — account-creation path is sentence 4 of 4. contrast src/app/page.tsx (post pass-48): "a new address creates an account. a returning address receives a sign-in link." — new-visitor path leads.
- suggested fix: reorder the reassurance paragraph to lead with the account-creation path: "a new address creates an account. a returning address receives a sign-in link. no password. no other mail. the link expires after 24 hours."
- source: browser
- resolution: reordered reassurance to lead with account-creation; removed expiry sentence from pre-submit (moved to confirmation). Shipped in Phase 30.

### [x] [LOW] /signin — expiry statement shifts grammatical register between pre-submission and post-submission states
- pass: 55 (commit 988fbcf)
- viewport: both
- category: voice
- observation: the reassurance paragraph (pre-submit) reads "it expires after 24 hours." — singular pronoun, refers to the specific link about to be sent. the confirmation paragraph (post-submit) reads "sign-in links expire after 24 hours." — generic plural with no specific referent. the same expiry fact is expressed in two different registers across back-to-back states of the same flow.
- evidence: src/app/signin/page.tsx pre-submit reassurance: "a sign-in link is sent to this address. it expires after 24 hours." and post-submit confirmation: "sign-in links expire after 24 hours." — singular "it" vs. generic plural "sign-in links" for the same caveat.
- suggested fix: align the confirmation to the singular definite register: change "sign-in links expire after 24 hours." to "the link expires after 24 hours." to refer to the specific link just sent.
- source: browser
- resolution: removed expiry from pre-submit; changed post-submit to "the link expires after 24 hours." Shipped in Phase 30.

### [x] [LOW] /settings — weekly-reflection radio inputs share aria-describedby pointing to "off" state description; "on" state misdescribed
- pass: 59 (commit eb5b8d0)
- viewport: both
- category: a11y
- observation: both "off" and "on" radio inputs for the weekly-reflection group share aria-describedby="desc-reflection-off". the paragraph at id="desc-reflection-off" reads "a short paragraph written by ember from your week's entries, visible on your log. generated once per week; never shown if you wrote fewer than three entries." — active-state behavior, not the disabled state. a screen reader user selecting "off" hears the description for the active state. the identical bug exists on the daily-reminder group (filed pass 58) but the weekly-reflection group was not covered in that finding.
- evidence: src/app/settings/SettingsForm.tsx lines 326 and 338: both "off" and "on" reflection radios carry aria-describedby="desc-reflection-off". no id="desc-reflection-on" paragraph exists.
- suggested fix: add a second description paragraph for the "on" state (id="desc-reflection-on") with text such as "ember will compose a short reflection from your week's entries once per week." and update the "on" radio's aria-describedby to "desc-reflection-on".
- source: browser
- resolution: changed desc-reflection-off text to "no weekly reflection will be generated."; added desc-reflection-on with active copy; updated on-radio aria-describedby to desc-reflection-on. Fixed together with the daily-reminder sibling (pass 58). Shipped at b08765f.

### [LOW] / — landing page footer aria-label="ember" does not represent the full footer content; tagline absent from landmark name
- pass: 55 (commit 988fbcf)
- viewport: both
- category: a11y
- observation: the landing page footer has aria-label="ember" but contains two spans: "ember" and "a daily writing ritual." the accessible name reflects only the first span; the tagline is absent from the landmark name. AT users navigating to the contentinfo landmark hear "ember, contentinfo" with no indication the region also contains the product tagline.
- evidence: src/app/page.tsx: <footer aria-label="ember"><span>ember</span><span>a daily writing ritual.</span></footer>. the pass-52 fix added aria-label="ember" to satisfy the unnamed-landmark finding; the value was not extended to cover both spans.
- suggested fix: change aria-label to "ember — a daily writing ritual" to represent the full content of the footer region.
- source: browser

### [x] [LOW] /signin — confirmation paragraph has both role="status" live region and programmatic focus; screen readers double-announce the confirmation
- pass: 55 (commit 988fbcf)
- viewport: both
- category: a11y
- observation: the confirmation paragraph carries role="status" (aria-live="polite" aria-atomic="true") and also receives programmatic focus via confirmationRef.current?.focus(). screen readers announce a live region update when content populates, then announce the focused element text again when focus arrives — the same confirmation message is spoken twice in rapid succession on VoiceOver and NVDA.
- evidence: src/app/signin/page.tsx: <p ref={confirmationRef} role="status" tabIndex={-1}> receives .focus() in a useEffect triggered on state==="sent". role="status" and the programmatic focus movement are two separate announcement paths firing on the same state transition.
- suggested fix: remove role="status" from the confirmation paragraph and rely solely on the programmatic focus delivery to surface the content to AT users, eliminating the duplicate announcement path.
- source: browser
- resolution: removed role="status" from confirmation paragraph; kept tabIndex={-1} and programmatic focus. Added data-testid="signin-confirmation" for testability. Shipped in Phase 30.

### [LOW] / — sticky CTA aside has aria-label="sign in"; imperative verb phrase used as a landmark accessible name
- pass: 55 (commit 988fbcf)
- viewport: both
- category: a11y
- observation: the sticky CTA aside uses aria-label="sign in". landmark accessible names are surfaced directly to AT users via the landmark rotor and landmark navigation shortcuts. "sign in" is an imperative verb phrase — the same register the voice guide prohibits in interactive labels throughout the product. the pass-46 fix gave the link inside the aside aria-label="sign in to ember" but did not change the landmark name on the aside element itself.
- evidence: src/app/page.tsx: <aside className={styles.cta} aria-label="sign in">. the link inside has aria-label="sign in to ember" (added at a prior pass) but the aside landmark label was not updated.
- suggested fix: change the aside aria-label to a noun phrase such as "sign-in prompt" or "account access" to remove the imperative verb from the landmark name.
- source: browser

### [LOW] /log — meta description lists content types absent in the empty state; misleads visitors arriving from search
- pass: 55 (commit 988fbcf)
- viewport: both
- category: comprehension
- observation: the /log page meta description reads "a 60-day writing log — prompts, responses, and published entries." for a new user with no entries, none of those three content types are present on the page. a visitor arriving from a search result reads a description that lists content the page does not yet contain.
- evidence: src/app/log/layout.tsx description: "a 60-day writing log — prompts, responses, and published entries." authenticated capture body text: "the log is empty. each entry fills a tile in the mosaic above. today's entry will appear here." — no prompts, responses, or published entries rendered.
- suggested fix: change the description to "a 60-day writing log — one entry per day, shown as a mosaic and a list." to describe the page structure rather than its content state; holds in both empty and populated states.
- source: browser

### [x] [MED] /settings — prompt variety radio inputs lack fieldset/legend grouping; WCAG 1.3.1 group relationship not conveyed to screen readers
- pass: 56 (commit 5fac7a3)
- viewport: both
- category: a11y
- observation: the "standard" and "personalized" options on /settings are radio inputs preceded by a "prompt variety" label text and explanation paragraph. without a <fieldset> + <legend> grouping the radio inputs, screen readers cannot associate the options with the group label "prompt variety" — each option is announced in isolation with no group context. WCAG 1.3.1 (Info and Relationships) requires that group relationships conveyed visually also be available to AT.
- evidence: settings capture: "prompt variety\n\nstandard: same prompt for everyone each day. personalized: ..." text appears as a paragraph above "standard\npersonalized" with no structural grouping apparent; compare display name and timezone which each have label/input pairs.
- suggested fix: wrap the prompt variety radio inputs in a <fieldset> with a <legend>prompt variety</legend> in src/app/settings/SettingsForm.tsx, replacing the current heading/paragraph approach with a proper ARIA group structure.
- source: browser
- issue: #62
- resolution: added id="label-variety" to the <span className={styles.label}> and changed aria-label="prompt variety" to aria-labelledby="label-variety" on the radioGroup div, programmatically linking the visible label to the group per WCAG 1.3.1. Shipped at a63de96.

### [LOW] / — "today" entry in the seven-day preview has no accessible identification; only visual styling differentiates it from future days
- pass: 56 (commit 5fac7a3)
- viewport: both
- category: a11y
- observation: the landing page seven-day preview highlights the current day visually via a dayToday CSS class (background and accent color on the date). no accessible attribute communicates "today" to AT users — there is no aria-current="date", no aria-label suffix, and no visually-hidden text inside the date element. screen reader users scanning the list hear "Mon 15 Jun — what part of your day..." with no indication this item differs from the six future days.
- evidence: anonymous capture: the "today" row in the seven-day preview renders "today\nMon 15 Jun\n..." with "today" as a day-header label, but src/app/page.tsx likely renders the same list structure for all seven days with a conditional className. no aria-current or sr-only "today" label in the accessible tree.
- suggested fix: add aria-current="date" to the today list item in the seven-day preview on src/app/page.tsx, or prepend a visually-hidden <span className="sr-only">today — </span> inside the date element when day.isToday is true.
- source: browser

### [LOW] / — landing page H1 is the product tagline; "ember" name absent from AT heading tree
- pass: 56 (commit 5fac7a3)
- viewport: both
- category: a11y
- observation: the landing page H1 reads "ten minutes of intention before the day swallows you." the product name "ember" appears only in the lockup (a decorative div with aria-hidden on the glyph and a plain span for the wordmark) and in the page <title> element. AT users navigating by headings — a common pattern on unfamiliar pages — encounter a poetic tagline as the sole H1 with no heading-level product identifier. the page title compensates for users who read it, but heading navigation bypasses the title.
- evidence: anonymous capture: body text opens with "skip to content\nember\nsign in\nten minutes of intention before the day swallows you." — "ten minutes..." is the H1. the lockup wordmark "ember" is plain DOM text in the pre-heading nav area, not a heading.
- suggested fix: add a visually-hidden <span className="sr-only">ember — </span> prefix inside the H1 element in src/app/page.tsx, mirroring the approach used for /today's page-identity sr-only prefix shipped in pass 54 at 8c951ee.
- source: browser

### [x] [LOW] /signin — email input placeholder "email address" duplicates the label "email" in a slightly different register
- pass: 56 (commit 5fac7a3)
- viewport: both
- category: voice
- observation: the email input on /signin has label text "email" and placeholder text "email address". the label is a terse single-word field-type identifier; the placeholder adds "address" and disappears on first keystroke. the combination is redundant — the placeholder adds no meaningful guidance and departs from the single-word label register. the product's other inputs (display name, username) follow the same terse label style without placeholder text.
- evidence: anonymous /signin capture: "email\n\na sign-in link is sent to this address..." — label "email" followed by placeholder text "email address" on the input. the body capture does not render placeholder text but the page.tsx source would show <input placeholder="email address" />.
- suggested fix: remove the placeholder attribute from the email input in src/app/signin/page.tsx; the "email" label is sufficient and its removal is consistent with the site's minimal register.
- source: browser
- resolution: removed placeholder="email address" from email input. Shipped in Phase 30.

### [LOW] /today — focus-mode exit button "done writing" uses a participial phrase; breaks the product's noun-phrase register
- pass: 56 (commit 5fac7a3)
- viewport: both
- category: voice
- observation: the focus-mode overlay exit button is labeled "done writing". all other interactive labels in the product use noun phrases or single restrained words: "log", "settings", "save", "publish", "focus", "sign out", "back to home". "done writing" is a two-word participial construction that reads as a user declaration rather than a calm control label. the label appears only when focus mode is active.
- evidence: authenticated /today capture: "done writing" appears as a standalone action label at the end of the focus-mode overlay text, after the prompt, textarea, and save controls.
- suggested fix: change the label to "done" in src/app/today/TodayEntry.tsx to match the spare noun-phrase register used throughout; "done" is unambiguous in a single-control overlay context where the only action is closing.
- source: browser

### [x] [LOW] /signin — submit button label "send a link" is an imperative verb phrase
- pass: 54 (commit 4ca3212)
- viewport: both
- category: voice
- observation: the form submit button renders the label "send a link" in its idle state. "send" is a bare imperative verb. the voice guide prohibits second-person imperative copy. all other interactive labels on /signin use noun phrases or declarative framing ("sign in", "back to home", "email"). this is the only imperative verb in the page's UI copy.
- evidence: src/app/signin/page.tsx: {state === 'sending' ? 'sending.' : 'send a link'} — "send a link" is the idle-state label on <button type="submit">. contrast "sending." (in-progress state) which is declarative; the idle state alone uses the imperative form.
- suggested fix: change the idle label to a noun phrase such as "get a sign-in link" or a declarative form to match the register used throughout the page.
- source: browser
- resolution: changed idle label to "send link." — terse, period-terminated, parallels "sending." in-progress state. Shipped in Phase 30.

### [x] [LOW] /today — writing surface has no landmark or heading; heading navigation skips directly from H1 (prompt) to H2 (day strip)
- pass: 54 (commit 4ca3212)
- viewport: both
- category: a11y
- observation: the heading outline for /today is H1 (prompt question) then H2 "the last seven days" in the day strip. the task check, response textarea, and publish/focus/save controls sit between them in DOM order but are not wrapped in any named section or headed by any element. AT users navigating by heading bypass the entire writing surface. AT users navigating by landmark reach only the main landmark — no sub-region identifies the writing area within it.
- evidence: src/app/today/page.tsx line 83: <h1>{prompt}</h1>. src/app/today/TodayEntry.tsx renders task, textarea, and controls as a flat fragment with no heading or section element. src/app/today/DayStrip.tsx line 53: <h2 id="day-strip-heading">the last seven days</h2>. nothing between H1 and H2 in the heading tree; no landmark sub-region in main enclosing TodayEntry.
- suggested fix: wrap TodayEntry's outermost rendered content in <section aria-label="today's entry"> so AT users can navigate directly to the writing surface via the landmark rotor without requiring a visible heading.
- source: browser
- issue: #48
- resolution: converted outer div to <section aria-label="today's entry"> in TodayEntry.tsx. Shipped at 0922be8.

### [x] [LOW] /signin — openGraph metadata has no images property; share card renders without image
- pass: 53 (commit 3f0847a)
- viewport: both
- category: seo
- observation: the /signin layout exports an openGraph block with title, description, and url but no images array. Next.js per-route metadata merging replaces the full openGraph key when a child page overrides it, so the root layout's global OG image (/opengraph-image) is not inherited. a link shared to /signin produces an imageless social card rather than the branded OG image that all other pages emit.
- evidence: src/app/signin/layout.tsx: openGraph: { title: 'ember · sign in', description: '...', url: '/signin' } — no images property. contrast src/app/layout.tsx which sets images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: '...' }].
- suggested fix: add images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember — a daily writing ritual' }] to the openGraph block in src/app/signin/layout.tsx and the same twitter.images to the twitter block.
- source: browser
- resolution: added images arrays to both openGraph and twitter blocks. Shipped at fe60b35.

### [x] [LOW] /signin, /today, /settings — error fallback copy uses second-person imperative "try again."
- pass: 53 (commit 3f0847a)
- viewport: both
- category: voice
- observation: error messages across three routes use the pattern "something went wrong. try again." and "network error. try again." the phrase "try again" is a second-person imperative verb. the voice guide prohibits second-person imperative copy. all non-error copy on these pages uses declarative framing.
- evidence: src/app/signin/page.tsx: setErrorMsg(... ?? 'something went wrong. try again.'); src/app/today/TodayEntry.tsx lines 113 and 117: 'something went wrong. try again.' and 'network error. try again.'; src/app/settings/SettingsForm.tsx lines 101 and 105: same pattern.
- suggested fix: change all three occurrences to "something went wrong. save failed." and "network error. save failed." (or "the link could not be sent." on /signin) to keep the flat declarative register.
- source: browser
- resolution: /signin fallback changed to "the link could not be sent."; /today, /settings, /log/[date], DeleteAccountSection fallbacks changed to "save failed."/"deletion failed." suffix variants. Shipped at 6b2fb77.

### [LOW] / — sticky CTA "today's prompt is waiting." uses mild anthropomorphism inconsistent with the flat declarative register
- pass: 53 (commit 3f0847a)
- viewport: both
- category: voice
- observation: the closing sticky CTA opens with "today's prompt is waiting." the phrase implies the prompt has agency — it is doing something. the rest of the landing page uses strictly inanimate declarative phrasing: "one prompt and one tiny task each morning", "a missed day leaves no mark", "the log shows what is, not what isn't." the construction reads as a soft imperative nudge, departing from the flat bookish register established throughout.
- evidence: src/app/page.tsx: today&apos;s prompt is waiting. — in the <p className={styles.ctaCopy}> preceding the sign-in link.
- suggested fix: rewrite as "today's prompt is ready." to keep the inanimate declarative register.
- source: browser

### [LOW] /log — "browse by date" link label uses second-person imperative verb
- pass: 53 (commit 3f0847a)
- viewport: both
- category: voice
- observation: in the log entries section footer, a link reads "browse by date". "browse" is an imperative verb. the voice guide states no second-person imperative copy. all other navigational copy in the product uses noun phrases or declarative framing ("writing log", "today's entry", "log"). this link navigates to the most recent entry's dated URL (/log/{date}).
- evidence: src/app/log/page.tsx: <Link href={`/log/${recentDate}`}>browse by date</Link> — inside the entryFoot section below the most recent entry card.
- suggested fix: change link text to "all entries" or "full log" to replace the imperative verb with a descriptive noun phrase consistent with the product's voice.
- source: browser

### [LOW] /log — entry article header contains date as plain text with no heading element; heading hierarchy inside article is broken
- pass: 53 (commit 3f0847a)
- viewport: both
- category: a11y
- observation: the <header> element inside <article aria-label="most recent entry"> contains a plain text date string (e.g. "Thu 12 Jun 2026") with no wrapping heading element. the next heading in the article is <h2> containing the prompt text. AT users navigating by heading inside the article encounter the prompt as the first and only heading — the date appears as plain text with no heading role. the heading hierarchy skips from the article's accessible name directly to the prompt h2 with no date-level structural heading.
- evidence: src/app/log/page.tsx: <header className={styles.entryDate}>{formatDisplayDate(recentDate!)} {recentDate === today && ' · today'}</header> followed by <h2 className={styles.entryPrompt}>{recentPrompt.prompt}</h2> — the date text inside <header> has no heading wrapper.
- suggested fix: wrap the date string inside the article <header> in an <h2> element and demote the prompt line to <p className={styles.entryPrompt}>, so the heading sequence within the article is: date (h2) → prompt (paragraph).
- source: browser

### [x] [MED] /signin — email input has no autocomplete="email"; WCAG 1.3.5 not met
- pass: 51 (commit 0107c11)
- viewport: both
- category: a11y
- observation: the email input on /signin has no autocomplete attribute. WCAG 1.3.5 (Identify Input Purpose, Level AA) requires autocomplete tokens on inputs that collect personal information so assistive technology and password managers can assist users. the settings form inputs received autocomplete fixes in pass 49 (shipped at 69be03d: autocomplete="name" on display name, autocomplete="username" on username), but the signin email input was not updated in that same pass.
- evidence: src/app/signin/page.tsx: <input id="email" type="email" placeholder="email address" required ...> — no autocomplete attribute. compare src/app/settings/SettingsForm.tsx which received autocomplete="name" and autocomplete="username" at 69be03d.
- suggested fix: add autocomplete="email" to the email input in src/app/signin/page.tsx.
- source: browser
- issue: #39
- resolution: added autocomplete="email" to the email input in src/app/signin/page.tsx. Shipped at 565a6ee.

### [x] [LOW] / — .dayTask::before pseudo-element renders a 12×12px checkbox-like square before each task item in the 7-day preview; implies interactivity on read-only content
- pass: 51 (commit 0107c11)
- viewport: both
- category: visual
- observation: each "tiny task" row in the seven-day preview list has a 12×12px box injected via the .dayTask::before CSS pseudo-element. the marker has a border and border-radius matching the product's form inputs, resembling an empty checkbox. the task rows are read-only preview content with no click, focus, or toggle behavior, but the checkbox-like marker may lead a first-time visitor to attempt interaction.
- evidence: src/app/page.module.css lines 180–188: .dayTask::before { content: ''; display: inline-block; width: 12px; height: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-1); flex-shrink: 0; transform: translateY(2px); } — rendered before every task paragraph in the landing page seven-day preview.
- suggested fix: remove the .dayTask::before pseudo-element and rely on the "tiny task —" text prefix as the sole visual differentiator; or replace the checkbox marker with a typographic marker (e.g. a dash or bullet) that does not imply interactivity.
- source: browser
- issue: #47
- resolution: removed .dayTask::before rule from src/app/page.module.css. Shipped at 8905030.

### [LOW] /signin — confirmation copy "on its way" is colloquial; departs from the flat bookish register
- pass: 51 (commit 0107c11)
- viewport: both
- category: voice
- observation: after a successful link submission, the confirmation paragraph reads "a sign-in link is on its way." the phrase "on its way" is colloquial and does not match the flat, terse register used throughout the product. the following clause "the link opens today's prompt directly." uses "directly" as a filler adverb adding no information. all other copy uses plain declarative sentences without idiomatic phrasing.
- evidence: src/app/signin/page.tsx confirmation paragraph: "a sign-in link is on its way. the link opens today's prompt directly. sign-in links expire after 24 hours. no password. no other mail."
- suggested fix: rewrite as "a sign-in link has been sent. following it opens today's prompt. links expire after 24 hours. no password. no other mail." to restore the flat, plain register.
- source: browser

### [LOW] /signin — lockup Link carries aria-hidden="true" on a focusable element; ARIA anti-pattern
- pass: 51 (commit 0107c11)
- viewport: both
- category: a11y
- observation: the header lockup on /signin is a Next.js Link (anchor with href="/") with aria-hidden="true" and tabIndex={-1}. the ARIA authoring practices prohibit aria-hidden="true" on focusable elements: a link can receive programmatic focus via .focus() even when removed from the tab order by tabIndex={-1}. this was added at 567174d (pass 42) to suppress the duplicate lockup/back-to-home link pair, but the fix introduced a new ARIA conformance issue.
- evidence: src/app/signin/page.tsx line 47: <Link href="/" className={styles.lockup} aria-label="ember — home" aria-hidden="true" tabIndex={-1}> — Link element with href is focusable; aria-hidden="true" must not be applied to focusable elements.
- suggested fix: replace the lockup Link with a non-interactive <div> or <span> styled identically (removing href), keeping only the "back to home" Link as the navigational element; this removes the ARIA violation without reintroducing the duplicate-link issue that 567174d addressed.
- source: browser

### [LOW] /today — OnThisDay component renders <aside> with no accessible name; unnamed complementary landmark
- pass: 51 (commit 0107c11)
- viewport: both
- category: a11y
- observation: the OnThisDay component renders an <aside> element with no aria-label or aria-labelledby attribute. per the ARIA spec, an <aside> without an accessible name is exposed as an unnamed complementary landmark. AT users navigating by landmark encounter "complementary" with no identification of the region's content. the component renders conditionally when a prior-year entry exists on the same calendar day.
- evidence: src/app/today/OnThisDay.tsx line 32: <aside className={styles.onThisDay}> — no aria-label or aria-labelledby attribute. the component renders a temporal excerpt link of the form "{yearText} — {excerpt}".
- suggested fix: add aria-label="on this day" to the <aside> element in OnThisDay.tsx so the complementary landmark is identifiable when present.
- source: browser

### [LOW] /settings — <footer> element has no accessible name; contentinfo landmark is unnamed
- pass: 51 (commit 0107c11)
- viewport: both
- category: a11y
- observation: the settings page <footer> is a top-level sibling of <main>, giving it the contentinfo landmark role. it has no aria-label or aria-labelledby attribute, so AT users navigating to the contentinfo landmark hear only "contentinfo" with no indication the region contains the sign-out control. the sign-out button is the sole interactive element in the footer.
- evidence: src/app/settings/page.tsx line 71: <footer className={styles.footer}> — no accessible name attribute. contains <form action="/auth/signout" method="POST"><button type="submit">sign out</button></form>.
- suggested fix: add aria-label="account" to the <footer> element in settings/page.tsx so the contentinfo landmark is identifiable when AT users navigate by landmark.
- source: browser

### [x] [LOW] / and /signin — <main id="main-content"> missing tabIndex={-1}; skip link focus delivery unreliable on anonymous pages
- pass: 52 (commit b4d3589)
- viewport: both
- category: a11y
- observation: the skip link in the root layout targets #main-content. the prior fix (pass 49, shipped at 88f8cb9) added tabIndex={-1} to <main id="main-content"> in src/app/today/page.tsx, src/app/log/page.tsx, and src/app/settings/page.tsx — but not the two anonymous-accessible routes. non-interactive elements without tabIndex cannot reliably receive programmatic focus in all browsers when targeted by a skip link.
- evidence: src/app/page.tsx line 24: <main id="main-content"> — no tabIndex. src/app/signin/page.tsx line 56: <main className={styles.main} id="main-content"> — no tabIndex. compare src/app/today/page.tsx: <main className={styles.main} id="main-content" tabIndex={-1}>.
- suggested fix: add tabIndex={-1} to <main id="main-content"> in both src/app/page.tsx and src/app/signin/page.tsx, mirroring the fix applied to the authenticated pages at 88f8cb9.
- source: browser
- issue: #41
- resolution: added tabIndex={-1} to <main id="main-content"> in src/app/page.tsx and src/app/signin/page.tsx. Shipped at bc52684.

### [x] [LOW] / and /signin — footer elements have no accessible name; contentinfo landmarks unnamed on anonymous pages
- pass: 52 (commit b4d3589)
- viewport: both
- category: a11y
- observation: the landing page <footer className={styles.footerCredit}> and the /signin <footer className={styles.footer}> both carry the contentinfo landmark role but have no aria-label or aria-labelledby. AT users navigating to the contentinfo landmark on either anonymous page hear only "contentinfo" with no indication of the region's content. the pending /settings footer finding (pass 51) applies to the same structural gap on all three routes.
- evidence: src/app/page.tsx line 84: <footer className={styles.footerCredit}> — no accessible name. src/app/signin/page.tsx line 107: <footer className={styles.footer}> — no accessible name. both contain only presentational text spans.
- suggested fix: add aria-label="ember" to the <footer> element in src/app/page.tsx and src/app/signin/page.tsx, consistent with what the settings footer fix will apply.
- source: browser
- issue: #43
- resolution: added aria-label="ember" to <footer> in src/app/page.tsx and src/app/signin/page.tsx. Shipped this tick.

### [LOW] / — sticky CTA <aside> rendered after <footer> in DOM; complementary landmark follows contentinfo in AT landmark order
- pass: 52 (commit b4d3589)
- viewport: both
- category: a11y
- observation: the sticky CTA bar is <aside aria-label="sign in">, carrying the complementary landmark role. in the DOM it appears after the <footer> (contentinfo). AT users navigating by landmark encounter contentinfo before complementary — unusual sequence that may cause the CTA to be missed, since contentinfo conventionally signals page end.
- evidence: src/app/page.tsx: <footer className={styles.footerCredit}> at line 84 (closes at 87); <aside className={styles.cta} aria-label="sign in"> at line 89 — after the footer in source order.
- suggested fix: move the <aside> before the <footer> in src/app/page.tsx DOM source order, or replace <aside> with <div role="none"> (the bar is a conversion affordance, not complementary content) to remove the misplaced landmark entirely.
- source: browser

### [LOW] /settings — delete-account warning uses second-person possessive "your account"; breaks register within the two-step flow
- pass: 52 (commit b4d3589)
- viewport: both
- category: voice
- observation: when the delete confirmation panel opens, the warning paragraph reads "permanently delete your account and all entries. there is no undo." the phrase "your account" is second-person possessive. the trigger button uses first-person ownership ("delete my account and all my entries") but the confirmation warning shifts to second person within the same two-step destructive flow.
- evidence: src/app/settings/DeleteAccountSection.tsx line 44: <p className={styles.deleteWarning}>permanently delete your account and all entries. there is no undo.</p>
- suggested fix: rewrite as "this will permanently delete the account and all entries. there is no undo." to remove second-person address and use the flat declarative register.
- source: browser

### [LOW] /settings — DeleteAccountSection has no aria-live region; deletion in-progress state not announced to screen readers
- pass: 52 (commit b4d3589)
- viewport: both
- category: a11y
- observation: when the confirm button is clicked, the button label changes from "delete account" to "deleting." and disabled is applied. button label changes on disabled buttons are not reliably announced by all screen readers without a dedicated aria-live region. no aria-live element exists in DeleteAccountSection. the SettingsForm pattern — a dedicated aria-live span emitting "saving." / "saved." — is not replicated for this destructive action.
- evidence: src/app/settings/DeleteAccountSection.tsx lines 58-65: confirm button renders {deleting ? 'deleting.' : 'delete account'} with disabled={deleting}; no aria-live element in the component. contrast src/app/settings/SettingsForm.tsx line 215: <span aria-live="polite" ...>.
- suggested fix: add <span aria-live="polite" className={styles.srOnly}>{deleting ? 'deleting.' : ''}</span> inside DeleteAccountSection so screen readers announce the in-progress state when deletion begins.
- source: browser

### [LOW] /settings — "export your data" label uses second-person possessive and imperative verb
- pass: 52 (commit b4d3589)
- viewport: both
- category: voice
- observation: the export link label "export your data" uses the second-person possessive "your" and the imperative verb "export". the voice guide prohibits second-person imperative copy. every other action label in the settings page footer area avoids second-person address — "delete my account and all my entries" uses first-person; "sign out" is an established UI idiom.
- evidence: src/app/settings/page.tsx lines 72-76: <a href="/api/export" className={styles.exportLink} download>export your data</a>
- suggested fix: change label to "export data" to remove both the imperative and the second-person possessive, consistent with the flat noun-phrase register used elsewhere.
- source: browser

### [x] [LOW] /today, /log, /settings — global skip link targets <main id="main-content"> elements that have no tabIndex; focus delivery unreliable
- pass: 49 (commit 247ad7b)
- viewport: both
- category: a11y
- observation: the root layout skip link ("skip to content") targets #main-content via href. the <main id="main-content"> elements on /today, /log, and /settings have no tabIndex attribute. non-interactive elements cannot reliably receive programmatic focus in all browsers when targeted by a skip link. the identical gap was corrected for the <div id="log-content"> secondary skip target on /log in pass 41 (commit 6c10116) by adding tabIndex={-1}, but the primary #main-content target on all three pages was not updated in that same pass.
- evidence: src/app/layout.tsx line 74: <a href="#main-content" className="skip-link">skip to content</a>. src/app/today/page.tsx line 80: <main className={styles.main} id="main-content"> — no tabIndex. src/app/log/page.tsx line 88: <main id="main-content"> — no tabIndex. src/app/settings/page.tsx line 53: <main className={styles.main} id="main-content"> — no tabIndex. compare src/app/log/page.tsx line 104: <div id="log-content" tabIndex={-1}> — secondary skip target received the fix; primary did not.
- suggested fix: add tabIndex={-1} to the <main id="main-content"> element in src/app/today/page.tsx, src/app/log/page.tsx, and src/app/settings/page.tsx, mirroring the fix applied to #log-content in pass 41.
- source: browser
- resolution: added tabIndex={-1} to <main id="main-content"> in src/app/today/page.tsx, src/app/log/page.tsx, and src/app/settings/page.tsx. Shipped at 88f8cb9.

### [x] [LOW] /log — mosaic tile tooltip fires on keyboard focus but carries aria-hidden="true"; excerpt content is invisible to screen readers
- pass: 49 (commit 247ad7b)
- viewport: desktop
- category: a11y
- observation: the mosaic tile link fires onFocus to show the tooltip, making the entry date and excerpt preview visible to sighted keyboard users. the tooltip div carries aria-hidden="true", so its content — the display date and up to 80 characters of entry text — is excluded from the AT tree. screen reader users receive only the tile's aria-label (date + state, e.g. "Thu 4 Jun 2026 — written") with no excerpt, while sighted keyboard users see the excerpt in the tooltip. a published or written tile has meaningful excerpt content the AT user cannot access at the same focus point.
- evidence: src/app/log/LogMosaic.tsx line 93: onFocus={(e) => handleFocus(e, tile)} — tooltip renders on keyboard focus. line 100-102: <div className={styles.tooltip} aria-hidden="true"> — content excluded from AT tree. line 90: aria-label={`${tile.displayDate} — ${tileStateLabel(tile.state)}`} on the Link — state only, no excerpt. tileStateLabel returns 'written', 'published', 'no entry', or 'today'.
- suggested fix: extend the tile link's aria-label to include the excerpt when one exists: aria-label={`${tile.displayDate} — ${tileStateLabel(tile.state)}${tile.excerpt ? '. ' + tile.excerpt : ''}`} so AT users receive the same entry preview context as sighted keyboard users on focus.
- source: browser
- resolution: extended tile Link aria-label to include excerpt when present in src/app/log/LogMosaic.tsx; test added. Shipped at 04498b9.

### [x] [LOW] / — <section className={styles.previewMark}> wrapping the mosaic preview has no accessible name; not exposed as a named landmark
- pass: 49 (commit 247ad7b)
- viewport: both
- category: a11y
- observation: the previewMark section wrapping MosaicPreview on the landing page has no aria-label, aria-labelledby, or heading element. per the ARIA spec, a <section> without an accessible name is not exposed as a named region landmark. all three adjacent sections — hero (aria-labelledby="hero-heading"), seven-days (aria-labelledby="seven-days-heading"), and closing (aria-label="about ember") — are correctly named. previewMark is the only section in the landmark sequence without a name.
- evidence: src/app/page.tsx line 36: <section className={styles.previewMark}> — no accessible name attribute. line 25: <section className={styles.hero} aria-labelledby="hero-heading"> — named. line 40: <section className={styles.seven} aria-labelledby="seven-days-heading"> — named. line 72: <section className={styles.closing} aria-label="about ember"> — named.
- suggested fix: add aria-hidden="true" to the section if it is purely decorative and the MosaicPreview's own role="img" aria-label is sufficient, or add aria-label="writing log preview" to expose it as a named landmark consistent with the adjacent sections. the aria-hidden approach is preferable if the mosaic has no navigational purpose for AT users on the landing page.
- source: browser
- resolution: added aria-hidden="true" to <section className={styles.previewMark}> in src/app/page.tsx. Shipped at 9ffab40.

### [x] [MED] /today — focus mode overlay always in DOM without aria-hidden when inactive; AT users encounter duplicate prompt and controls
- pass: 50 (commit 61c7ec5)
- viewport: both
- category: a11y
- observation: the focus mode overlay renders in the DOM at all times, not only when focus mode is active. when focus mode is inactive, the overlay lacks aria-hidden, so AT users encounter a duplicate copy of the prompt, response area, publish toggle, save button, publish hint, and username warning, followed by a "done writing" exit control. the prior fix at 18e5ed5 applied inert to #page-header and #day-strip when isFocus=true but did not add aria-hidden to the overlay container when isFocus=false. sighted users are unaffected (CSS hides the overlay visually); AT users receive all overlay content in the reading order.
- evidence: authenticated /today body text (desktop): "response\npublish\nfocus\nsave\n\nwhen published, this entry appears on the public profile.\n\nno public username is set. published entries will remain private until a username is added in settings.\n\nwhat's a texture...\n\nresponse\npublish\nsave\n\nwhen published, this entry appears on the public profile.\n\nno public username is set...\n\ndone writing" — the full prompt-and-controls block appears twice, first as the main view (with focus button) and then as the overlay (without focus button, ending with "done writing").
- suggested fix: add aria-hidden={!isFocus || undefined} to the focus overlay container element in TodayEntry.tsx so the overlay is hidden from the AT tree when focus mode is inactive; mirror the inert approach applied to the header/day-strip at 18e5ed5.
- source: browser
- resolution: changed aria-hidden={!isFocus} to aria-hidden={!isFocus || undefined} in TodayEntry.tsx (note: aria-hidden={!isFocus} was already present, so the overlay was already hidden from AT when inactive; the || undefined avoids the aria-hidden="false" anti-pattern when active). Shipped at 9c38398.

### [x] [LOW] /today — 'focus' button label provides no description of the distraction-free mode it activates
- pass: 50 (commit 61c7ec5)
- viewport: both
- category: a11y
- observation: the focus mode toggle button label is "focus" with no adjacent hint text, tooltip, or aria-description explaining what activating it does. the button opens a full-viewport distraction-free writing overlay (role="dialog" aria-label="focus mode"), but the trigger itself gives no indication of the UI change it initiates. a first-time visitor or AT user encounters a bare "focus" button adjacent to "publish" and "save" without being able to predict the action.
- evidence: authenticated /today body text: "response\npublish\nfocus\nsave" — "focus" appears between publish and save with no descriptive copy adjacent; the dialog aria-label "focus mode" is on the overlay (not the trigger).
- suggested fix: add aria-description="enter distraction-free writing mode" to the focus trigger button, or add a title="enter distraction-free writing mode." attribute (complete sentence with period per voice guide) so AT users and hover users can discover the control's purpose before activating it.
- source: browser
- resolution: false-positive — focus trigger already has aria-label="enters a distraction-free writing view." at TodayEntry.tsx line 218 (added at 0867e95). Playwright innerText captures visible text regardless of aria-label, creating apparent duplication. No code change needed; closed without shipping.

### [x] [LOW] /today — abbreviated weekday labels in day strip appear before full date strings; potentially not hidden from AT
- pass: 50 (commit 61c7ec5)
- viewport: both
- category: a11y
- observation: each row in the day strip mini-log begins with a standalone abbreviated weekday label ("Fri", "Sat", etc.) as a separate text node, followed by the full accessible date string ("Fri 5 Jun 2026 — no entry"). if the abbreviated label is not wrapped in an aria-hidden element, AT users hear the day name twice per row: once as the standalone abbreviation and again as part of the full date string on the tile link's accessible label. the pass 43 DayStrip fix (4f5c4e4) addressed section-level landmark labeling but did not specifically address the abbreviated day text nodes.
- evidence: authenticated /today body text: "Fri\nFri 5 Jun 2026 — no entry\nSat\nSat 6 Jun 2026 — no entry" — standalone "Fri" / "Sat" abbreviations appear before the full date-and-state strings in reading order.
- suggested fix: wrap the abbreviated day label element in src/app/today/DayStrip.tsx with aria-hidden="true" so AT users hear only the full date string ("Fri 5 Jun 2026 — no entry") from the tile link's accessible label, not the preceding abbreviation.
- source: browser
- resolution: false-positive — abbreviated day label spans already have aria-hidden="true" at DayStrip.tsx line 64. Playwright innerText captures CSS-visible elements regardless of aria-hidden. AT users see only the srOnly full tileStateLabel. No code change needed; closed without shipping.

### [x] [LOW] /log — <section className={styles.mosaicWrap}> wrapping the mosaic and H1 has no accessible name; not exposed as a named landmark
- pass: 49 (commit 247ad7b)
- viewport: both
- category: a11y
- observation: the mosaicWrap section on /log wraps the H1, the "skip to log" link, and the LogMosaic component but has no aria-label or aria-labelledby attribute. the adjacent <section aria-label="log entries"> (named in a prior pass) is correctly exposed as a landmark; the mosaic section is not. AT users navigating by landmark cannot jump to the mosaic region by name.
- evidence: src/app/log/page.tsx line 89: <section className={styles.mosaicWrap}> — no accessible name attribute. line 90: <h1 className={styles.mosaicMeta}>the past 60 days</h1> — H1 has no id for a labelledby reference. compare line 108: <section aria-label="log entries"> — correctly named.
- suggested fix: add id="mosaic-heading" to the H1 at line 90 and aria-labelledby="mosaic-heading" to the section at line 89, exposing the mosaic region as a named landmark consistent with the log entries section pattern.
- source: browser
- resolution: added id="mosaic-heading" to H1 and aria-labelledby="mosaic-heading" to section in src/app/log/page.tsx. Shipped at 0de5180.

### [LOW] /log — empty-state paragraph uses "the mosaic above" as a spatial reference with no AT-addressable counterpart
- pass: 49 (commit 247ad7b)
- viewport: both
- category: comprehension
- observation: the empty-state paragraph reads "each entry fills a tile in the mosaic above." the phrase "mosaic above" is a visual-spatial reference. the LogMosaic container carries role="group" aria-label="60-day practice mosaic" but that label does not appear in the empty-state sentence, and the containing mosaicWrap section is unnamed (see companion finding). a screen reader user navigating linearly encounters "above" with no accessible referent.
- evidence: src/app/log/page.tsx line 141-143: "the log is empty. each entry fills a tile in the mosaic above." — "mosaic above" refers spatially to the LogMosaic component. src/app/log/LogMosaic.tsx line 82: role="group" aria-label="60-day practice mosaic" — accessible label exists on the container but is not referenced from the empty-state text.
- suggested fix: replace "in the mosaic above" with "in the 60-day mosaic" so the phrase matches the mosaic container's aria-label and removes the directional spatial reference.
- source: browser

### [x] [LOW] /settings — display name and username inputs have no autocomplete attribute; violates WCAG 1.3.5
- pass: 49 (commit 247ad7b)
- viewport: both
- category: a11y
- observation: the display name input and the public username input in SettingsForm.tsx have no autocomplete attribute. WCAG 1.3.5 (Identify Input Purpose, Level AA) requires autocomplete tokens on inputs that collect personal information so assistive technology and password managers can assist users. "name" is the correct token for the display name field; "username" is the correct token for the public username field. neither is present.
- evidence: src/app/settings/SettingsForm.tsx line 125-133: <input id="display-name" type="text" ... > — no autocomplete attribute. line 194-205: <input id="username" type="text" ... > — no autocomplete attribute.
- suggested fix: add autocomplete="name" to the display name input and autocomplete="username" to the public username input in SettingsForm.tsx.
- source: browser
- resolution: added autocomplete="name" to display name input and autocomplete="username" to username input in src/app/settings/SettingsForm.tsx. Shipped at 69be03d.

### [x] [LOW] / — landing page header lockup glyph and wordmark both exposed to AT, producing double "ember" announcement
- pass: 48 (commit 031745d)
- viewport: both
- category: a11y
- observation: the landing page header lockup is a plain <div className={styles.lockup}> containing <MosaicGlyph /> (which renders <div role="img" aria-label="ember">) and a <span className={styles.wordmark}>ember</span>. because the parent div has no overriding aria-label, AT users encounter both children in sequence: the glyph announces as "ember, image" and the wordmark span announces as "ember", producing a double "ember" announcement for the same logo group. the pass-38 fix added aria-label="ember — home" to "all 9 lockup Link elements" but the landing page lockup is a non-interactive div, not a Link, so it was not covered by that fix.
- evidence: src/app/page.tsx line 15: <div className={styles.lockup}> — no aria-label. src/components/mosaic/MosaicGlyph.tsx line 27: <div className={styles.glyph} role="img" aria-label="ember">. compare src/app/signin/page.tsx: lockup is a Link with aria-label="ember — home", which overrides children and removes the duplicate.
- suggested fix: add aria-hidden="true" to the <MosaicGlyph /> call inside the landing page lockup div so only the wordmark span contributes to AT reading, matching the effective result of the /signin Link fix.
- source: browser
- resolution: added decorative prop to MosaicGlyph; set aria-hidden=true and removed role/aria-label when decorative=true; applied <MosaicGlyph decorative /> in src/app/page.tsx lockup div. Shipped at 549ebbc.

### [x] [LOW] / — hero section has no accessible name; not exposed as named region landmark
- pass: 48 (commit 031745d)
- viewport: both
- category: a11y
- observation: the landing page hero section (<section className={styles.hero}>) contains the H1 tagline and sub-pitch but has no aria-label or aria-labelledby attribute. per the ARIA spec, a <section> without an accessible name is not exposed as a named region landmark. AT users navigating by landmark cannot jump to the hero. the identical gap was corrected on the closing section (aria-label="about ember", pass 47) and the seven-day preview section (aria-labelledby="seven-days-heading"), but the hero was not addressed in either pass.
- evidence: src/app/page.tsx line 25: <section className={styles.hero}> — no aria-label or aria-labelledby. compare line 40: <section className={styles.seven} aria-labelledby="seven-days-heading"> and the closing section fix from pass 47.
- suggested fix: add aria-labelledby pointing to the H1's id (add id="hero-heading" to the <h1>) to expose the hero as a named region landmark consistent with the adjacent sections.
- source: browser
- resolution: added id="hero-heading" to <h1> and aria-labelledby="hero-heading" to <section className={styles.hero}> in src/app/page.tsx. Shipped at 18aef81.

### [x] [LOW] / — CTA sentence order puts returning-user path first; new-visitor path is buried second
- pass: 48 (commit 031745d)
- viewport: both
- category: comprehension
- observation: the sticky CTA copy reads "a returning address receives a sign-in link. a new address creates an account." for a first-time visitor the only applicable sentence is the second — they are a new address. the returning-user path is stated first, so a reader who scans the first sentence and stops may conclude the form is sign-in-only. pass 46 changed "a known address" to "a returning address" but did not apply the alternative ordering the same pass itself proposed: "lead with the new-account sentence."
- evidence: src/app/page.tsx line 93: "a returning address receives a sign-in link. a new address creates an account." pass-46 suggested fix included: "alternatively, lead with the new-account sentence: 'a new address creates an account. a returning address receives a sign-in link.'" — the word change was applied but the reorder was not.
- suggested fix: swap sentence order to "a new address creates an account. a returning address receives a sign-in link." so the relevant path for a first-time visitor appears first.
- source: browser
- resolution: swapped sentence order to "a new address creates an account. a returning address receives a sign-in link." in src/app/page.tsx. Shipped at aab597f.

### [x] [MED] /settings — form has no structural section groupings; fields and account actions are a flat sequence
- pass: 48 (commit 031745d)
- viewport: both
- category: a11y
- observation: the settings form presents four input areas (display name, timezone, prompt variety, public username) followed by save and sign-out controls as a flat sequence with no heading, fieldset, or landmark structure separating logical groups. the prompt variety radios have a radiogroup with aria-label="prompt variety" but the three text/select fields have no enclosing group and the save/sign-out controls are undifferentiated from the form fields in the AT tree. a screen reader user tabbing through the form has no programmatic way to identify where profile fields end and account actions begin.
- evidence: settings body text sequence: "display name / [hint] / timezone / [hint] / prompt variety / standard / personalized / public username / [hint] / /u/ / save / sign out" — no visible headings or group boundaries between field areas and actions. src/app/settings/SettingsForm.tsx has no fieldset or section wrapping the profile fields separate from the action row.
- suggested fix: wrap the save and sign-out controls in a visually-muted <section aria-label="account actions"> (or a <div role="group" aria-label="account actions">) to create a programmatic boundary between form fields and account controls; or add a visually-hidden <h2> before the action row.
- source: browser
- resolution: added role="group" aria-label="account actions" to the formFoot div in src/app/settings/SettingsForm.tsx. Shipped at a3e0b8e.

### [x] [LOW] / — landing page footer element is nested inside main, suppressing contentinfo landmark
- pass: 47 (commit 6eee387)
- viewport: both
- category: a11y
- observation: the <footer className={styles.footerCredit}> element is nested inside <main id="main-content">. per the ARIA spec and the HTML living standard, a <footer> receives the contentinfo landmark role only when it is a top-level sectioning element (a direct descendant of the body, not a descendant of article/aside/main/nav/section). when nested inside <main>, it has no landmark role. prior passes (36 and 43) correctly changed the element from <div> to <footer> but the relocation outside main was never applied. the /signin and /settings pages both place their footer elements as siblings of <main>, consistent with the landmark spec.
- evidence: src/app/page.tsx: <main id="main-content"> at line 24; <footer className={styles.footerCredit}> at line 83 inside it; </main> at line 87. contrast src/app/signin/page.tsx where <footer> is a sibling of <main> at top-level.
- suggested fix: move <footer className={styles.footerCredit}> (and its closing tag) to after </main> in src/app/page.tsx so it is a direct child of the <body> element and carries the contentinfo landmark role.
- source: browser
- resolution: moved <footer> to after </main> in src/app/page.tsx so it is a sibling of <main>. Shipped at 9ce20c8.

### [x] [LOW] / — closing philosophy section has no accessible name and is not exposed as a landmark
- pass: 47 (commit 6eee387)
- viewport: both
- category: a11y
- observation: the <section className={styles.closing}> on the landing page contains the product's no-streak philosophy copy ("ember does not personalize your morning." and the no-notifications paragraph) but has no accessible name — no aria-label, aria-labelledby, or heading element. per the ARIA spec, a <section> without an accessible name is not exposed as a named region landmark. AT users navigating by landmark cannot identify or jump to this region. the adjacent 7-day preview section at line 40 uses aria-labelledby="seven-days-heading" as the correct pattern.
- evidence: src/app/page.tsx lines 72–81: <section className={styles.closing}> with two <p> elements inside and no heading or aria-label attribute.
- suggested fix: add aria-label="about ember" to <section className={styles.closing}> to expose it as a named region landmark consistent with the adjacent section's pattern.
- source: browser
- resolution: added aria-label="about ember" to <section className={styles.closing}> in src/app/page.tsx; landmark test added to LandingPage.test.tsx. Shipped at a2fd84e.

### [x] [LOW] /today — publish label carries a title attribute that duplicates the visible paragraph below it
- pass: 47 (commit 6eee387)
- viewport: desktop
- category: a11y
- observation: the <label> wrapping the publish checkbox carries title="when published, this entry appears on the public profile." the identical text is already rendered as a visible <p id="publish-desc" className={styles.publishHint}> directly below the action row, associated to the checkbox via aria-describedby="publish-desc". the title on the label creates a redundant hover-only tooltip for copy that is already visible on-screen and already programmatically associated to the input. the same pattern is repeated in the focus-mode overlay (title on the label at line 280, paragraph at line 303).
- evidence: src/app/today/TodayEntry.tsx line 204: <label className={styles.publishToggle} title="when published, this entry appears on the public profile.">; same text at line 238: <p id="publish-desc" className={styles.publishHint}>when published, this entry appears on the public profile.</p>. repeated at lines 280 and 303.
- suggested fix: remove the title attribute from both publish <label> elements (main view at line 204 and focus-mode view at line 280) since the description is already visible in the publishHint paragraph and associated to the checkbox via aria-describedby.
- source: browser
- resolution: removed title attribute from both publish <label> elements in src/app/today/TodayEntry.tsx. Shipped at faedf1d.

### [x] [LOW] / — closing CTA "a known address" phrase is ambiguous to first-time visitors
- pass: 46 (commit 973c2e8)
- viewport: both
- category: comprehension
- observation: the closing CTA reads "a known address receives a sign-in link. a new address creates an account." a first-time visitor who has never heard of ember does not have a "known address" in the system — they may read "a known address" as implying they need a pre-existing account. the clarifying sentence follows immediately but a quick scan could miss the second sentence and conclude the form is login-only.
- evidence: body text: "today's prompt is waiting. a known address receives a sign-in link. a new address creates an account. no password. no other mail. / sign in"
- suggested fix: replace "a known address" with "a returning address" (or "a registered address") to signal prior use rather than a system precondition; alternatively, lead with the new-account sentence: "a new address creates an account. a returning address receives a sign-in link."
- source: browser
- resolution: changed "a known address" to "a returning address" in src/app/page.tsx:93. Shipped at e819d01.

### [x] [LOW] / — nav and CTA both carry a "sign in" link with identical accessible names
- pass: 46 (commit 973c2e8)
- viewport: both
- category: a11y
- observation: the page header nav contains a "sign in" link and the closing CTA aside also contains a "sign in" link. both use the same label text and point to the same href (/signin). screen reader users scanning links by name encounter two identically-named "sign in" links with no way to distinguish the header shortcut from the CTA. the aside was given an accessible name ("sign in" via aria-label on the aside wrapper at af927c1) but the link inside it still shares the same label as the nav link.
- evidence: body text: "ember / sign in / … / sign in" — "sign in" appears twice, once in the nav region and once in the aside CTA region. both point to /signin. the aside aria-label "sign in" names the region, not the link, so the link's accessible name remains "sign in" identical to the nav.
- suggested fix: differentiate the CTA link's accessible name with aria-label="sign in to ember" (or similar) so AT users navigating by link can distinguish the CTA from the header shortcut.
- source: browser
- resolution: added aria-label="sign in to ember" to the CTA Link in src/app/page.tsx. Shipped at 4c2d6c7.

### [x] [LOW] /today — nav "log" link and day-strip "log" link share identical accessible names and href
- pass: 46 (commit 973c2e8)
- viewport: both
- category: a11y
- observation: the top nav carries a "log" link (/log) and the day-strip section header also carries a "log" link (/log). both have identical label text and identical href. screen reader users navigating by link encounter two indistinguishable "log" entries per page with no accessible differentiation of their contexts (site-wide nav shortcut vs. contextual section header).
- evidence: body text: "ember / today / log / settings / … the last seven days / log / Wed / Wed 3 Jun 2026 — no entry" — "log" appears twice, once in the nav region and once as the day-strip section header link.
- suggested fix: add aria-label="writing log" (or similar) to the day-strip Link in DayStrip.tsx so AT users can distinguish the contextual shortcut from the primary nav item.
- source: browser
- resolution: added aria-label="writing log" to the day-strip Link in DayStrip.tsx; DayStrip test updated. Shipped at 960072f.

### [x] [LOW] /today, /log, /settings — no openGraph metadata override; social shares emit root OG title
- pass: 46 (commit 973c2e8)
- viewport: desktop
- category: seo
- observation: the page-level metadata for /today, /log, and /settings exports only title and description with no openGraph block. next.js merges the root layout's openGraph for unset keys, so a social share of any of these URLs emits og:title "ember · a daily writing ritual" and og:url pointing to the root domain, rather than the page-specific title and path. the identical gap on /signin was resolved at abd5bbd; the three authenticated pages were not updated in that pass.
- evidence: src/app/today/page.tsx metadata export: { title: "ember · today", description: "…" } — no openGraph key. same pattern in src/app/log/page.tsx and src/app/settings/page.tsx. root layout openGraph.title: "ember · a daily writing ritual" and openGraph.url: siteUrl remain the defaults for pages without an override.
- suggested fix: add openGraph: { title, description, url } to the metadata export in src/app/today/page.tsx, src/app/log/page.tsx, and src/app/settings/page.tsx, mirroring the pattern applied to src/app/signin/layout.tsx at abd5bbd.
- source: browser
- resolution: added openGraph { title, description, url } and twitter { title, description } to each page's metadata export. Shipped at 90af0b6.

### [x] [LOW] / — 7-day preview section has no framing sentence before the list
- pass: 45 (commit add612f)
- viewport: both
- category: comprehension
- observation: the "the next seven days" heading immediately precedes the seven dated prompt entries with no sentence explaining what the visitor is looking at. a first-time visitor does not know whether these are sample prompts, personalised previews, or a real shared schedule. the clarifying sentence ("the same prompt and tiny task arrive for everyone on a given day.") exists but appears after all seven entries, not before them.
- evidence: body text sequence: "the next seven days / today / Mon 8 Jun / [prompt] / tiny task — ..." — the explanation paragraph appears only after the seventh entry.
- suggested fix: move the explanatory sentence ("the same prompt and tiny task arrive for everyone on a given day. ember does not personalize your morning.") to immediately below the "the next seven days" heading, before the first dated entry.
- source: browser
- resolution: added <p className={styles.sevenMeta}> with "the same prompt and tiny task arrive for everyone on a given day." inside sevenHead div in src/app/page.tsx; removed duplicate from closing section; "ember does not personalize your morning." remains standalone. Shipped at 532902b.

### [x] [LOW] / — 7-day prompt day entries lack structural grouping
- pass: 45 (commit add612f)
- viewport: both
- category: a11y
- observation: each day block in the 7-day preview (day label, date, prompt, tiny task) has no containing element that groups it as a discrete unit. the blocks run as a flat sequence of mixed heading-level labels and paragraphs. screen-reader users navigating by heading or list item have no programmatic way to identify where one day's content ends and the next begins.
- evidence: body text: "today / Mon 8 Jun / [prompt] / tiny task — ... / tomorrow / Tue 9 Jun / [prompt] / tiny task — ..." — no structural boundary between day entries.
- suggested fix: wrap each day block (day label, date, prompt, task) in an <article> or <li> element to give AT users a discrete navigable unit per day.
- source: browser
- resolution: false positive — src/app/page.tsx already renders the 7-day preview as <ul className={styles.sevenList}> with each day block in <li>; commit 0a4eb73 added ul/li structure. Reader captured body text and could not detect the list semantics. No code change needed.

### [x] [LOW] /signin — page lacks a value proposition sentence for cold visitors
- pass: 45 (commit add612f)
- viewport: both
- category: comprehension
- observation: a user arriving at /signin via a shared link, search result, or direct navigation sees only the sign-in form with no reminder of what they are signing in for. the reassurance copy covers the mechanics of the magic link but does not restate what ember offers. a cold visitor and a returning visitor with weak recall are treated identically.
- evidence: full body text: "sign in / email / a sign-in link is sent to this address. it expires after 24 hours. no password. no other mail. a new address creates an account. / send a link / ember"
- suggested fix: add one short sentence above the form, e.g. "one prompt and one tiny task each morning — sign in to begin."
- source: browser
- resolution: added <p className={styles.tagline}>one prompt and one tiny task each morning.</p> after h1 in src/app/signin/page.tsx; added .tagline CSS class (serif, muted, type-17). Shipped at b883615.

### [x] [LOW] /log — empty state gives no description of the 60-day mosaic
- pass: 45 (commit add612f)
- viewport: both
- category: comprehension
- observation: a new user visiting /log sees only "the log is empty. today's entry will appear here." with no indication of what the log looks like when filled. the 60-day mosaic is the product's primary visual, but the empty state gives no preview or description of it — the user has no sense of what they are building toward.
- evidence: full body text: "the past 60 days / skip to log / the log is empty. today's entry will appear here."
- suggested fix: extend the empty-state copy to mention the mosaic, e.g. "the log is empty. entries accumulate here as a 60-day mosaic. today's entry will appear here."
- source: browser
- resolution: changed emptyState paragraph in src/app/log/page.tsx to "the log is empty. each entry fills a tile in the mosaic above. today's entry will appear here." Shipped at HEAD.

### [x] [LOW] /settings — display name field has no format hint
- pass: 45 (commit add612f)
- viewport: both
- category: comprehension
- observation: the display name field shows only "shown on entries when they appear on a public profile." with no guidance on format — whether spaces are allowed, whether it should be a real name or a handle, or what length is acceptable. unlike the public username field (anchored by the "/u/" path prefix), display name has no example or constraint visible in the form.
- evidence: body text: "display name / shown on entries when they appear on a public profile." — no example, no format hint adjacent to the field.
- suggested fix: add a one-line hint below the field description, e.g. "any name or alias, such as J. Doe or a pen name."
- source: browser
- resolution: extended display name hint to "shown on entries when they appear on a public profile. any name or alias works — a first name, initials, or a pen name." in src/app/settings/SettingsForm.tsx. Shipped at 95846fc.

### [x] [LOW] / — closing region uses <div> instead of <footer> element (inconsistent with /signin)
- pass: 43 (commit 5e1498c)
- viewport: both
- category: a11y
- observation: the landing page closing region ("ember / a daily writing ritual.") is wrapped in <div className={styles.footerCredit}> with no semantic footer element. the /signin page uses <footer className={styles.footer}> for its equivalent closing region. AT users navigating by landmark cannot reach the landing page closing region via footer landmark navigation; the two pages are structurally inconsistent.
- evidence: src/app/page.tsx line 83: <div className={styles.footerCredit}> — no footer landmark. src/app/signin/page.tsx line 107: <footer className={styles.footer}> — uses semantic footer element for identical structural purpose.
- suggested fix: change <div className={styles.footerCredit}> to <footer className={styles.footerCredit}> in src/app/page.tsx to add a consistent footer landmark matching /signin.
- source: browser
- resolution: changed <div className={styles.footerCredit}> to <footer className={styles.footerCredit}> in src/app/page.tsx. Shipped at HEAD.

### [LOW] /settings — username input placeholder drops "public" qualifier from field label
- pass: 43 (commit 5e1498c)
- viewport: both
- category: voice
- observation: the public username input carries placeholder="username" while the field label reads "public username." the "public" qualifier — which distinguishes this field from display name — is absent in the placeholder. the display name field uses placeholder="name shown on published entries" which is consistent with its label scope. a user filling the form for the first time sees "username" as the input hint, which does not reinforce the public nature of the field the way the label does.
- evidence: src/app/settings/SettingsForm.tsx line 203: placeholder="username" — field label: <label htmlFor="username">public username</label> — contrast display name at line 131: placeholder="name shown on published entries" which aligns with label "display name."
- suggested fix: remove the placeholder entirely (the adjacent hint "a public profile will appear at /u/username." already sets the format expectation) or change to a descriptive example such as "your-handle" that preserves the public framing.
- source: browser

### [x] [LOW] /today — day strip <section> carries no accessible name; not exposed as named region landmark
- pass: 43 (commit 5e1498c)
- viewport: both
- category: a11y
- observation: the day strip is wrapped in <section id="day-strip"> with no aria-label or aria-labelledby attribute. per the ARIA spec, a <section> without an accessible name is not exposed as a named region landmark — browsers and screen readers treat it as a generic container. AT users navigating by landmark (F6 in JAWS, rotor in VoiceOver) cannot jump to the day strip; they can reach it only by heading navigation via the H2 inside. the section contains <h2>the last seven days</h2> but the h2 does not automatically promote the section to a named landmark without an explicit association.
- evidence: src/app/today/DayStrip.tsx line 51: <section id="day-strip" className={styles.strip}> — no aria-label or aria-labelledby attribute present. the section H2 ("the last seven days") is at line 53 with no id assigned for labelledby association.
- suggested fix: add aria-labelledby="day-strip-heading" to the section element and id="day-strip-heading" to the H2, converting the section to a named region landmark that AT users can navigate to directly.
- source: browser
- resolution: added aria-labelledby="day-strip-heading" to <section id="day-strip"> and id="day-strip-heading" to the H2 in DayStrip.tsx. Shipped at 4f5c4e4.

### [x] [LOW] /today — publish toggle description is visually hidden on all viewports; sighted mobile users see no explanation
- pass: 43 (commit 5e1498c)
- viewport: mobile
- category: comprehension
- observation: the publish toggle description "when published, this entry appears on the public profile." is placed in a visually-hidden srOnly span associated to the checkbox via aria-describedby. on all viewports, no visible hint text appears adjacent to the "publish" label for sighted users — the description is AT-only. publish is the primary opt-in gate for public visibility; a sighted touch user on mobile encounters a bare "publish" label and checkbox with no on-screen explanation of what activating it does.
- evidence: src/app/today/TodayEntry.tsx: <span id="publish-desc" className={styles.srOnly}>when published, this entry appears on the public profile.</span> — srOnly applies position:absolute and clip to hide visually at all viewports. the mobile body text capture shows the description text in DOM order (captured by Playwright innerText) but it is not rendered visibly. the prereq hint below ("no public username is set...") renders as a visible paragraph, creating a visible/invisible inconsistency between the two adjacent explanatory lines.
- suggested fix: remove the srOnly class from the publish description span so it renders as a visible muted paragraph below the publish label row on all viewports, matching the visible treatment of the prereq hint directly below it.
- source: browser
- resolution: moved description out of srOnly span to a visible <p className={styles.publishHint}> after the action row in both normal and focus-mode views. Shipped at 02aa0fd.

### [x] [HIGH] /today — focus overlay does not trap keyboard focus
- pass: 42 (commit b9b4b91)
- viewport: desktop
- category: a11y
- observation: the focus overlay (role="dialog") does not trap keyboard focus. the header lockup link and all three nav links (today, log, settings) are never assigned tabIndex={-1} when focus mode is active. a keyboard user pressing Shift+Tab from the overlay textarea exits backward through the nav links into the visually-obscured header behind the opaque overlay. aria-modal is a screen-reader hint only; no browser uses it to prevent physical Tab movement.
- evidence: src/app/today/TodayEntry.tsx: tabIndex suppression applied only to elements within TodayEntry (task check button, main textarea, publish checkbox, focus trigger, save button, settings link). src/app/today/page.tsx: lockup Link and nav Links (today, log, settings) carry no tabIndex prop and remain at default 0. focusOverlay is the last child of TodayEntry fragment in DOM order; backward Tab from the overlay textarea cycles to the nav.
- suggested fix: lift focus-mode state to page.tsx and add tabIndex={isFocus ? -1 : undefined} to the lockup Link and all three nav Links, or apply the HTML inert attribute to the <header> element when focus mode is active.
- source: browser
- resolution: applied inert attribute to #page-header and #day-strip via useEffect in TodayEntry.tsx when isFocus changes. Shipped at 18e5ed5.

### [x] [MED] /today — duplicate aria-live and role="alert" regions during focus mode
- pass: 42 (commit b9b4b91)
- viewport: desktop
- category: a11y
- observation: during focus mode, two aria-live="polite" save-state regions and two role="alert" error paragraphs are simultaneously active in the AT tree. the main-view live region and error alert are siblings of the focusOverlay div, not descendants of it; aria-hidden is applied only to the overlay element itself, leaving the outer live regions fully exposed to screen readers while focus mode is open. both outer and inner regions emit the same save state and error message, producing duplicate announcements on every state change.
- evidence: TodayEntry.tsx line 183: outer <span aria-live="polite"> is a sibling of the overlay, not inside it. aria-hidden applied only to the focusOverlay div itself. outer <p role="alert"> is also outside the overlay. overlay contains identical aria-live and role="alert" duplicates reading the same state variables. when isFocus=true the overlay's aria-hidden is removed, but the outer live/alert regions have no corresponding suppression.
- suggested fix: wrap the outer (main-view) entry content — task div, outer label, outer textarea, entryMeta row, publishHint, and error paragraph — in a container element and apply aria-hidden={isFocus} to that wrapper when focus mode activates, suppressing all outer live regions while the dialog is open.
- source: browser
- resolution: wrapped outer main-view content in <div aria-hidden={isFocus || undefined}> in TodayEntry.tsx. Shipped at b6025f1.

### [x] [LOW] /signin — header contains two successive links pointing to "/"
- pass: 42 (commit b9b4b91)
- viewport: both
- category: a11y
- observation: the /signin header contains two successive links pointing to "/": the lockup (aria-label="ember — home") and the explicit "back to home" link. screen reader users navigating by link encounter two home links in the same header region with no intervening content, with no indication the first is a logo affordance.
- evidence: capture linear text: "ember / back to home / sign in" — the lockup link and "back to home" link both appear before the H1. both href="/", both in <header>.
- suggested fix: add aria-hidden="true" and tabIndex={-1} to the lockup link on /signin so only the explicit "back to home" link is in the tab and AT order, removing the redundant successive home link.
- source: browser
- resolution: added aria-hidden="true" + tabIndex={-1} to the lockup Link in src/app/signin/page.tsx. Shipped at 567174d.

### [x] [LOW] /settings — save button title abbreviates "public username" field as "username"
- pass: 42 (commit b9b4b91)
- viewport: desktop
- category: voice
- observation: the save button tooltip title reads "saves display name, timezone, prompt variety, and username." the form labels the fourth field "public username" but the tooltip abbreviates it to "username" — the only mismatch among the four field names listed. the three other field names in the tooltip match their form labels exactly.
- evidence: src/app/settings/SettingsForm.tsx: title="saves display name, timezone, prompt variety, and username." vs. <label htmlFor="username">public username</label> — "public" is dropped in the tooltip.
- suggested fix: change title to "saves display name, timezone, prompt variety, and public username." to match the on-page field label exactly.
- source: browser
- resolution: changed title to "saves display name, timezone, prompt variety, and public username." in src/app/settings/SettingsForm.tsx. Shipped at 434edd7.

### [x] [LOW] /today — focus overlay dialog labeled via aria-labelledby pointing to the full 16-word prompt
- pass: 42 (commit b9b4b91)
- viewport: desktop
- category: a11y
- observation: the focus overlay dialog is labeled via aria-labelledby="focus-mode-heading" pointing to a <p> element containing the full prompt question. when the dialog opens, screen readers announce the entire prompt sentence as the dialog's accessible name before the user reaches any interactive element. a short, stable label would produce a cleaner opening announcement without removing the visible prompt text.
- evidence: TodayEntry.tsx: aria-labelledby="focus-mode-heading" on the dialog div; <p id="focus-mode-heading">{prompt}</p> — today's prompt is "what do you find hardest to ask for, even from people who would give it easily?" announced verbatim as the dialog name when focus mode opens.
- suggested fix: replace aria-labelledby with aria-label="focus mode" on the dialog element, or target a visually-hidden short heading inside the overlay instead of the prompt paragraph.
- source: browser
- resolution: replaced aria-labelledby="focus-mode-heading" with aria-label="focus mode" on dialog div; removed unused id from prompt paragraph; unit test updated. Shipped at 43d1502.

### [x] [LOW] /log — entry-list section has no heading in the zero-entry state
- pass: 42 (commit b9b4b91)
- viewport: desktop
- category: a11y
- observation: the log page has two structural sections — the 60-tile mosaic headed by H1 "the past 60 days" and the entry-list area below the divider — but the entry section carries no heading in the empty state. the H2 for the most recent entry prompt only renders when entries exist. a new user's AT heading outline has one item. there is no heading to orient AT users navigating into the section below the mosaic when the log is empty.
- evidence: src/app/log/page.tsx: <h1 className={styles.mosaicMeta}>the past 60 days</h1> is the only heading. the H2 inside the recentEntry conditional block is absent in the empty state. the empty-state <p> "the log is empty. today's entry will appear here." is a plain paragraph with no sibling heading.
- suggested fix: add a persistent visually-muted <h2> to the entry-list section that renders regardless of entry count, e.g., "most recent" or an aria-label on a <section> element, so AT users have a heading destination below the mosaic in all states.
- source: browser
- resolution: wrapped entry conditional in <section aria-label="log entries"> to expose a named region landmark in both populated and empty states. Shipped at 1c922ec.

### [x] [LOW] / — sticky CTA region carries no ARIA landmark
- pass: 38 (commit f9032a8)
- viewport: both
- category: a11y
- observation: the primary sign-in CTA is a position:fixed element rendered outside `<main>`. the page landmark inventory is: site navigation header + main content area. AT users navigating by landmark have no programmatic path to the CTA region; the sign-in link is reachable by Tab order but the region itself is absent from the landmark list.
- evidence: capture body text places the CTA ("today's prompt is waiting. a known address receives a sign-in link. a new address creates an account. no password. no other mail. / sign in") after the main content — consistent with a fixed overlay outside `<main>`. no complementary, aside, or named section landmark covers it in the page structure.
- suggested fix: add `role="complementary"` (or convert to `<aside>`) to the CTA element so AT users can reach the sign-in region via landmark navigation.
- source: browser
- resolution: changed <div> to <aside aria-label="sign in"> in src/app/page.tsx. Shipped at af927c1.

### [x] [LOW] /signin — reassurance paragraph is after the submit button in DOM reading order
- pass: 38 (commit f9032a8)
- viewport: both
- category: comprehension
- observation: the paragraph explaining what the button does — "a sign-in link is sent to this address. no password. no other mail. a new address creates an account." — is placed outside and after the form in DOM reading order. a keyboard-only user or screen reader user encounters the submit button before the text that contextualises the action it triggers.
- evidence: capture linear reading order: "sign in / email / send the link / a sign-in link is sent to this address. no password. no other mail. a new address creates an account." — the button label "send the link" precedes the explanatory paragraph.
- suggested fix: move the reassurance paragraph inside the `<form>`, between the email field and the submit button, so explanation precedes the action in linear reading order.
- source: browser
- resolution: moved reassurance <p> inside <form> between email field and submit button in src/app/signin/page.tsx. Shipped at 27e8bf4.

### [x] [LOW] /signin — keyboard focus is not managed after the form-to-confirmation DOM transition
- pass: 38 (commit f9032a8)
- viewport: both
- category: a11y
- observation: on successful submission the form is replaced by a confirmation paragraph. the previously focused submit button is removed from the DOM; the browser drops focus to the document body. the status region announces to screen readers, but sighted keyboard users lose their focus position and must re-orient by tabbing from the top.
- evidence: the confirmation state ("a sign-in link is on its way...") renders in place of the form with no programmatic focus movement to the confirmation element. no focusable element receives focus after the state transition.
- suggested fix: attach a ref to the confirmation paragraph and call `.focus()` in a `useEffect` triggered when state becomes `'sent'`, so keyboard focus moves to the confirmation text immediately on transition.
- source: browser
- resolution: added confirmationRef + useEffect in page.tsx; tabIndex={-1} on confirmation <p>; test verifies focus movement. Shipped at 7ca5cc2.

### [x] [LOW] /signin — lockup link accessible name is computed as "ember ember" from duplicate nested labels
- pass: 38 (commit f9032a8)
- viewport: both
- category: a11y
- observation: the header lockup on /signin is a link wrapping the ember glyph (an img with aria-label="ember") and a visible wordmark span ("ember"). both children contribute to the link's computed accessible name, yielding the redundant label "ember ember" rather than a single clean name.
- evidence: capture header renders "ember" (glyph) adjacent to "ember" (wordmark) inside a single link element. the pattern — role=img aria-label="ember" + visible text "ember" inside one anchor — produces a doubled accessible name in screen reader announcement.
- suggested fix: add `aria-label="ember — home"` to the link element, or set `aria-hidden="true"` on the glyph element when it is nested inside the link so only the wordmark span contributes to the accessible name.
- source: browser
- resolution: added aria-label="ember — home" to all 9 lockup Link elements. Shipped at d528c7d.

### [x] [LOW] / — 7-day preview subheader echoes lede with near-identical phrasing
- pass: 40 (commit 49e85e6)
- viewport: both
- category: comprehension
- observation: the product description lede reads "one prompt and one tiny task each morning." and the 7-day preview section subheader reads "one prompt and one tiny task, every morning." — the same noun structure with only "each" replaced by "every." a first-time reader encounters the near-identical phrase twice within one scroll. the subheader does not frame the seven-day list, clarify its scope, or add new context; it restates what the lede already established.
- evidence: body text lede: "one prompt and one tiny task each morning." then section header: "the next seven days / one prompt and one tiny task, every morning."
- suggested fix: replace the subheader with copy that frames the list rather than restating the lede, e.g. "a look at the week ahead." or "the days coming up." so the line earns its position.
- source: browser
- resolution: removed sevenMeta span entirely; the H2 "the next seven days" alone frames the section. Shipped at bc1ad45.

### [x] [LOW] /signin — meta description ends with "no password required" while on-page copy uses "no password."
- pass: 40 (commit 49e85e6)
- viewport: both
- category: voice
- observation: the /signin meta description reads "sign in to ember with a link sent by email — no password required." the word "required" is a passive-adjective form not used in any visible on-page copy. the page's reassurance paragraph reads "no password. no other mail." — a different register. a search snippet surfaces the "required" form before a visitor reaches the page, while the page itself does not use it.
- evidence: meta description: "sign in to ember with a link sent by email — no password required." vs. on-page reassurance: "no password. no other mail."
- suggested fix: change meta description to "sign in to ember with a link sent by email — no password, no other mail." to match the register and exact phrasing of the visible page copy.
- source: browser
- resolution: changed description in src/app/signin/layout.tsx to "sign in to ember with a link sent by email — no password, no other mail." Shipped at bbf0470.

### [x] [LOW] /log — empty state offers no in-body path to create the first entry
- pass: 40 (commit 49e85e6)
- viewport: both
- category: comprehension
- observation: the /log page in its empty state displays "the log is empty. today's entry will appear here." with no link or call to action pointing to /today. a first-time authenticated user who lands on /log from a bookmark or direct URL sees the empty state message but must infer from the nav bar that "today" is the creation path. the message describes what will happen but gives no direction on how to make it happen.
- evidence: body text: "the past 60 days / skip to log / the log is empty. today's entry will appear here." — no link to /today in the body content; only the nav bar provides a path forward.
- suggested fix: link "today's entry" to /today in the empty-state sentence, e.g. "the log is empty. today's entry will appear here once written." so the sentence itself navigates the user to the creation surface.
- source: browser
- resolution: false positive — src/app/log/page.tsx already renders `<Link href="/today">today's entry</Link> will appear here.`; the reader captured plain text and could not detect the link. no code change needed.

### [x] [LOW] /settings — display name hint references the public profile before a username is set
- pass: 40 (commit 49e85e6)
- viewport: both
- category: comprehension
- observation: the display name field hint reads "shown on published entries on the public profile." for a user who has not yet set a public username — the default state for a new account — there is no public profile. the hint references a destination that does not exist until a username is added lower in the same form, creating an unexplained forward dependency.
- evidence: settings body text: "display name / shown on published entries on the public profile." — /today confirms: "no public username is set. published entries will remain private until a username is added in settings." — the public profile does not exist for this account.
- suggested fix: reframe the hint to describe the field's purpose without presupposing an active profile, e.g. "shown on entries when they appear on a public profile." — accurate whether or not a username is currently set.
- source: browser
- resolution: changed hint to "shown on entries when they appear on a public profile." in src/app/settings/SettingsForm.tsx. Shipped at c06f4c7.

### [LOW] /settings — "sign out" uses second-person imperative verb form
- pass: 38 (commit f9032a8)
- viewport: both
- category: voice
- observation: the sign-out button label is "sign out" — an imperative verb phrase. the voice guide prohibits second-person imperative copy. prior passes corrected equivalent imperative constructions across the product ("leave blank to stay private" → "an empty field keeps the profile private."). "sign out" is the remaining imperative action label in the authenticated settings footer.
- evidence: settings capture body text: "save / sign out" — "sign out" appears unconditionally at the bottom of every authenticated settings page visit.
- suggested fix: if the imperative form is intentional as a universal UI idiom, annotate it as exempt in bearings.md to prevent recurrence; otherwise change to a noun phrase such as "sign-out" or reframe the button to a descriptive label consistent with the voice guide.
- source: browser

### [x] [LOW] /settings — timezone field has no hint text explaining its effect
- pass: 38 (commit f9032a8)
- viewport: both
- category: comprehension
- observation: the settings form has three fields. display name now carries a hint ("shown on published entries on the public profile.") and public username has a hint ("a public profile will appear at /u/username. an empty field keeps the profile private."). the timezone field is a bare label with no supporting copy. a new user cannot determine from the field alone whether timezone controls prompt delivery time, entry dating, or some other behavior.
- evidence: settings capture: "display name / shown on published entries on the public profile. / timezone / prompt variety / standard: same curated prompt..." — "timezone" appears with no adjacent description between the display name hint and the prompt variety hint.
- suggested fix: add a one-sentence hint below the timezone label, e.g. "used to determine the current day for prompt delivery and entry dating." to explain the setting's effect in the same register as the adjacent hints.
- source: browser
- resolution: added hint paragraph below timezone label in SettingsForm.tsx matching adjacent hint style. Shipped at 505d88f.

### [x] [LOW] /settings — personalized prompt option gives no indication of when it activates
- pass: 39 (commit f36dd96)
- viewport: both
- category: comprehension
- observation: the personalized prompt variety option states it generates "a unique prompt generated from recent entries" but gives no indication of what qualifies as "recent," how many entries are required, or what happens when the option is selected on a new account with no entries. a user selecting personalized immediately after sign-up has no signal that the option is a no-op until a log exists.
- evidence: settings body text: "personalized: a unique prompt generated from recent entries." — no qualifying clause about activation conditions or fallback behavior; contrast with the standard option which fully describes its behavior in one sentence.
- suggested fix: append a fallback clause to the personalized description: "personalized: a unique prompt generated from recent entries. falls back to a standard prompt until entries exist." so new users understand the prerequisite before selecting.
- source: browser
- resolution: appended "falls back to a standard prompt until entries exist." to desc-personalized span in SettingsForm.tsx. Shipped at 4ddfa2b.

### [x] [LOW] /signin — "sign-in links expire after 24 hours." is in the footer, separated from the form's explanatory copy
- pass: 37 (commit 562a795)
- viewport: both
- category: comprehension
- observation: the sign-in form's inline explanatory copy reads "a sign-in link is sent to this address. no password. no other mail. a new address creates an account." the expiry notice "sign-in links expire after 24 hours." appears after the ember wordmark in the footer — a visual break away from the rest of the link behaviour copy. a user looking for caveats near the submit button does not encounter the expiry notice until scrolling past the footer wordmark; the information is present but disconnected from the action it qualifies.
- evidence: body text order: "a sign-in link is sent to this address. no password. no other mail. a new address creates an account.\n\nember\nsign-in links expire after 24 hours." — the wordmark creates a break between the form copy and the expiry statement.
- suggested fix: move the expiry sentence into the main form's explanatory paragraph — "a sign-in link is sent to this address. it expires after 24 hours. no password. no other mail. a new address creates an account." — so the caveat and the promise sit in the same reading unit.
- source: browser
- resolution: added "it expires after 24 hours." into reassurance paragraph in src/app/signin/page.tsx; removed footer expiry span. Shipped at 51e9c0a.

### [x] [LOW] /today — "tiny task" label in TodayEntry lacks semantic wrapper (parallel landing-page fix not applied)
- pass: 36 (commit 0dce6e9)
- viewport: both
- category: a11y
- observation: the landing-page fix at 0101b1b wrapped "tiny task" in a `<span className={styles.taskLabel}>` in page.tsx so AT users and parsers can differentiate the recurring label from the day-specific task body. TodayEntry.tsx was not updated in the same commit — the task paragraph still renders "tiny task" as unseparated raw text inside `<p className={styles.taskBody}>`. screen reader users and DOM text consumers on /today cannot differentiate the label from the task content.
- evidence: src/app/today/TodayEntry.tsx:164–165: `<p className={styles.taskBody}>tiny task{' '}<span className={styles.taskMuted}>— {task}</span></p>` — "tiny task" is unseparated raw text. compare src/app/page.tsx:59–62 where 0101b1b added `<span className={styles.taskLabel}>tiny task</span>`.
- suggested fix: wrap "tiny task" in `<span className={styles.taskLabel}>tiny task</span>` inside the taskBody paragraph in TodayEntry.tsx, consistent with the landing-page fix.
- source: browser
- resolution: added .taskLabel to today/page.module.css; wrapped "tiny task" in semantic span in TodayEntry.tsx. Shipped at 53e2549.

### [x] [LOW] /today — task-done button aria-label uses imperative "mark task done" while title uses non-imperative "marks today's tiny task as done."
- pass: 36 (commit 0dce6e9)
- viewport: both
- category: a11y
- observation: the task-done toggle button carries `aria-label="mark task done"` (and "mark task not done" when already marked). the title attribute on the same element correctly uses the non-imperative form "marks today's tiny task as done." and includes the branded "tiny" modifier. screen reader users hear the aria-label as the accessible name — the imperative form — while sighted users hovering on desktop see the title's non-imperative form. the aria-label diverges from the voice guide and from the title it accompanies.
- evidence: src/app/today/TodayEntry.tsx:160–161: `aria-label={taskDone ? 'mark task not done' : 'mark task done'}` and `title={taskDone ? "marks today's tiny task as not done." : "marks today's tiny task as done."}` — aria-label uses imperative verb; title uses declarative with branded "tiny task".
- suggested fix: align aria-label to the title's form — change to `"marks today's tiny task as done."` and `"marks today's tiny task as not done."` — removes the imperative and aligns with voice and with the title.
- source: browser
- resolution: changed aria-label in TodayEntry.tsx to declarative form matching title; same fix applied to EditEntry.tsx. Shipped at 4b057a0.

### [x] [LOW] /settings — aria-live region announces only "saved." and is silent during "saving." in-flight state
- pass: 36 (commit 0dce6e9)
- viewport: both
- category: a11y
- observation: the settings form aria-live region only emits text when saveState is 'saved'; it renders an empty string for every other state including 'saving'. a screen reader user who submits the settings form receives no spoken acknowledgment that a save is in progress — they hear silence until the server returns. the /today page (TodayEntry.tsx) was updated in pass 31 (17830b2) to announce all save states including "saving."; SettingsForm.tsx was not updated to the same standard in that pass. the pass-34 fix (5699c54) corrected the visible button label from "saving..." to "saving." but did not update the aria-live conditional.
- evidence: src/app/settings/SettingsForm.tsx:210–211: `<span aria-live="polite" ...>{saveState === 'saved' ? 'saved.' : ''}</span>` — empty string for 'saving' state. compare src/app/today/TodayEntry.tsx:181–183 where aria-live renders the full saveIndicatorText() including 'saving.'.
- suggested fix: change the conditional to `{saveState === 'saving' ? 'saving.' : saveState === 'saved' ? 'saved.' : ''}` to announce the in-flight state to screen reader users.
- source: browser
- resolution: changed aria-live conditional to emit 'saving.' during in-flight state; test added. Shipped at 407b9ec.

### [x] [LOW] /signin — in-flight submit label "sending..." uses ellipsis while all other in-progress labels use a terminal period
- pass: 36 (commit 0dce6e9)
- viewport: both
- category: voice
- observation: the sign-in form submit button renders "sending..." during the in-flight state. every other in-progress label in the product uses a terminal period: "saving." on /today, /settings, and /log/[date] (the last two fixed at 5699c54, pass 34). "sending..." is the only remaining ellipsis-form in-progress label, inconsistent with the established convention.
- evidence: src/app/signin/page.tsx:80: `{state === 'sending' ? 'sending...' : 'send the link'}` — ellipsis form. compare src/app/today/TodayEntry.tsx:212: `'saving.'` (period, no ellipsis).
- suggested fix: change "sending..." to "sending." in src/app/signin/page.tsx line 80.
- source: browser
- resolution: changed 'sending...' to 'sending.' in src/app/signin/page.tsx; SigninPage.test.tsx assertion updated. Shipped at 0de53e3.

### [x] [LOW] /today — "open log" link in day strip uses imperative verb
- pass: 36 (commit 0dce6e9)
- viewport: both
- category: voice
- observation: the day strip on /today renders a link to /log with the label "open log". the verb "open" is an imperative construction. the nav bar uses the bare noun "log" for the same destination; "open log" is the only instance of an imperative verb in a navigation link across the product. the voice guide prohibits second-person imperative copy.
- evidence: src/app/today/DayStrip.tsx:54–55: `<Link href="/log" className={styles.stripLink}>open log</Link>` — body text: "open log" appears between the "the last seven days" heading and the seven strip tiles.
- suggested fix: change link text from "open log" to "log" to match the nav bar noun form and remove the imperative construction.
- source: browser
- resolution: changed link text from "open log" to "log" in DayStrip.tsx. Shipped at 66578c4.

### [x] [LOW] / — landing page footer region uses a div element instead of a footer landmark
- pass: 36 (commit 0dce6e9)
- viewport: both
- category: a11y
- observation: the landing page closing section ("ember / a daily writing ritual.") is wrapped in `<div className={styles.footerCredit}>` with no semantic footer element. the /signin page uses `<footer className={styles.footer}>` for its equivalent closing region. keyboard and AT users who navigate by landmark cannot reach the landing page's closing region via footer landmark navigation; the two pages are inconsistent in their use of landmark structure.
- evidence: src/app/page.tsx:84: `<div className={styles.footerCredit}>` — no footer landmark on the landing page. compare src/app/signin/page.tsx: `<footer className={styles.footer}>` landmark.
- suggested fix: change `<div className={styles.footerCredit}>` to `<footer className={styles.footerCredit}>` (and the closing tag) to add a consistent footer landmark.
- source: browser
- resolution: changed <div className={styles.footerCredit}> to <footer className={styles.footerCredit}> in src/app/page.tsx. Shipped at HEAD.

### [LOW] /settings — display name input placeholder uses second-person possessive "your public profile"
- pass: 35 (commit 2dad7ef)
- viewport: both
- category: voice
- observation: the display name input carries the placeholder "how you appear on your public profile." the phrase "your public profile" is a second-person possessive. prior passes de-possessived the hint text and the "view your public profile" link on the same page; the input placeholder was not updated in those passes.
- evidence: src/app/settings/SettingsForm.tsx:131: `placeholder="how you appear on your public profile"` — "your public profile" is the same possessive construction addressed in the settings hints (a57cc00) and the page link (still pending in AUDIT.md).
- suggested fix: change placeholder to "name shown on published entries" — removes direct address while describing the field's purpose in the same register as the adjacent hint text.
- source: browser

### [x] [LOW] /signin — confirmation state uses "no password required." while form copy uses "no password."
- pass: 41 (commit 438baef)
- viewport: both
- category: voice
- observation: after a successful sign-in link submission, the confirmation paragraph contains `<em>no password required.</em>`. the word "required" is a passive-adjective form not present in any other auth copy on the page. the form's reassurance paragraph reads "no password. no other mail." — a terse, period-terminated register. the confirmation state introduces an inconsistent formulation that a reader encounters only after submitting, when the meta description issue (fixed at bbf0470) was the same root problem on the search-snippet side.
- evidence: src/app/signin/page.tsx:69: `<em>no password required.</em>` in the confirmation paragraph — contrast reassurance copy at line 88: "no password. no other mail. a new address creates an account." — "required" appears in the confirmation but nowhere in the form's visible pre-submission copy.
- suggested fix: change the confirmation phrase to "no password. no other mail." to match the register and phrasing of the form's reassurance paragraph.
- source: browser
- resolution: changed `<em>no password required.</em>` to "no password. no other mail." in src/app/signin/page.tsx confirmation paragraph. Shipped at 7650862.

### [LOW] /today — focus trigger button aria-label uses imperative "enter focus mode" while title uses declarative form
- pass: 41 (commit 438baef)
- viewport: both
- category: voice
- observation: the focus trigger button carries `aria-label="enter focus mode"` — an imperative construction — while its title attribute reads "enters a distraction-free writing view." in the declarative form. the task-done button had the same imperative/declarative mismatch and was corrected at 4b057a0; the focus trigger was not updated in that pass. screen reader users hear the aria-label as the accessible name — the imperative form — while sighted desktop users see the title's non-imperative form.
- evidence: src/app/today/TodayEntry.tsx:202: `aria-label="enter focus mode"` — imperative verb; line 203: `title="enters a distraction-free writing view."` — declarative verb. same pattern as task-done fix at 4b057a0.
- suggested fix: change aria-label to "enters a distraction-free writing view." to match the title and align with the voice guide's non-imperative register.
- source: browser

### [LOW] /today — exit-focus button aria-label uses imperative "exit focus mode" while visible label is "done writing"
- pass: 41 (commit 438baef)
- viewport: both
- category: voice
- observation: the button that closes focus mode carries `aria-label="exit focus mode"` — an imperative construction. the button's visible label is "done writing" — a non-imperative, gerund-phrase form. screen reader users hear the aria-label as the accessible name; sighted users read the visible "done writing" label. the accessible name and the visible label use different registers, and the aria-label violates the voice guide's prohibition on imperative copy.
- evidence: src/app/today/TodayEntry.tsx:300: `aria-label="exit focus mode"` — imperative verb; line 305: visible text "done writing" — non-imperative; line 301: `title="exits the distraction-free writing view."` — declarative form available to align with.
- suggested fix: change aria-label to "exits the distraction-free writing view." to match the declarative register of the adjacent focus trigger title, or "done writing." to match the visible label.
- source: browser

### [x] [LOW] /today — save button title is inaccurate when publish checkbox is checked
- pass: 41 (commit 438baef)
- viewport: both
- category: comprehension
- observation: the save button carries `title="entries are saved privately by default."` — a description of the default privacy posture, not of what pressing save does in the current form state. a user who checks the publish toggle before saving encounters a tooltip that contradicts their current intent: the entry will not be saved privately, it will be published. the title is only accurate in the unchecked default state.
- evidence: src/app/today/TodayEntry.tsx:215: `title="entries are saved privately by default."` on the save `<button>`; the publish checkbox at line 187 can be checked; same title appears on the focus-mode save button at line 278 — both carry the inaccurate description when publish is checked.
- suggested fix: change the title to a state-independent description of the action, e.g. "saves the current entry." so it remains accurate regardless of the publish toggle state.
- source: browser
- resolution: changed both save button titles to "saves the current entry." in TodayEntry.tsx. Shipped at 5b83a48.

### [x] [LOW] /log — skip link target #log-content has no tabIndex and may not reliably receive focus
- pass: 41 (commit 438baef)
- viewport: both
- category: a11y
- observation: the skip link "skip to log" targets `#log-content` via href. the target is a plain `<div>` with no tabIndex attribute. non-interactive elements without tabIndex cannot receive programmatic focus in all browsers; activating the skip link moves the URL fragment but does not reliably place keyboard focus on the target element, leaving keyboard users at an indeterminate focus position.
- evidence: src/app/log/page.tsx:82: `<a href="#log-content" className="skip-link">skip to log</a>`; line 95: `<div id="log-content" className={styles.divider}>` — no tabIndex on the target div. the prior fix (f13c754) corrected the label but not the focus-receive capability of the target.
- suggested fix: add `tabIndex={-1}` to the `#log-content` div so keyboard focus is programmatically receivable when the skip link is activated.
- source: browser
- resolution: added tabIndex={-1} to the #log-content div in src/app/log/page.tsx. Shipped at 6c10116.

### [x] [LOW] /log — skip link label "skip to entries" sets an unfulfilled expectation in the empty state
- pass: 35 (commit 2dad7ef)
- viewport: both
- category: comprehension
- observation: the skip link added in pass 34 is labelled "skip to entries" but when the log is empty the destination (#log-content) immediately precedes the empty-state paragraph "the log is empty. today's entry will appear here." a keyboard user who activates the skip link expecting to reach entries lands on an empty region. the label is accurate when the log has entries but misleading in the zero-state that most new users experience first.
- evidence: src/app/log/page.tsx:82: `<a href="#log-content" className="skip-link">skip to entries</a>` — authenticated capture body text in empty state: "the past 60 days\nskip to entries\n\nthe log is empty. today's entry will appear here."
- suggested fix: change the skip link label to "skip to log" so it describes the destination region rather than its content state — accurate in both populated and empty states.
- source: browser
- resolution: changed "skip to entries" to "skip to log" in src/app/log/page.tsx. Shipped at f13c754.

### [x] [LOW] / — "tiny task" label and per-day instruction run together in a single paragraph with no semantic separation
- pass: 35 (commit 2dad7ef)
- viewport: both
- category: a11y
- observation: in the seven-day preview, each day's task is rendered as a single paragraph element: "tiny task — {day.task}". the recurring label "tiny task" and the unique per-day instruction share one paragraph node with only an em dash as visual separator. AT users and search parsers cannot differentiate the label from the task body; the label is not semantically distinguished from the day-specific content.
- evidence: src/app/page.tsx:59–60: `<p className={styles.dayTask}>tiny task — {day.task}</p>` — all seven preview blocks follow this pattern. desktop and mobile captures show e.g. "tiny task — write that person's name down, and one thing you learned." with no inner element structure.
- suggested fix: wrap "tiny task" in a `<span className={styles.taskLabel}>` within the paragraph so the label is semantically and stylistically separable from the task body; update page.module.css to add the corresponding class rule.
- source: browser
- resolution: inner `<span className={styles.taskLabel}>tiny task</span>` added; Inter 14px label vs Source Serif 4 16px task body. Shipped at 0101b1b.

### [x] [MED] /log — 60-tile mosaic has no bypass mechanism for keyboard-only users
- pass: 34 (commit d754637)
- viewport: both
- category: a11y
- observation: the /log page renders the 60-day mosaic as 60 individual Link elements. a keyboard-only user must Tab through all 60 links to reach any content below the mosaic (empty-state paragraph or most-recent entry). the skip-to-content link at the top of the page targets #main-content, which begins at the mosaic section — it provides no bypass past the mosaic itself.
- evidence: src/app/log/LogMosaic.tsx: tiles.map renders 60 Link elements unconditionally, each with aria-label='[date] — [state]'. no skip link, id='log-content', or aria bypass mechanism exists between the mosaic and the content below it.
- suggested fix: add a visually-hidden skip link immediately before the mosaic (e.g. `<a href="#log-content" className="skipLink">skip to entries</a>`) and add `id="log-content"` to the element wrapping the content below the mosaic.
- source: browser
- resolution: added `<a href="#log-content" className="skip-link">skip to entries</a>` before LogMosaic and id="log-content" on the divider div in src/app/log/page.tsx. Shipped at d53b342.

### [x] [LOW] /settings — in-flight save button label uses "saving..." (ellipsis) while /today uses "saving." (period)
- pass: 34 (commit d754637)
- viewport: both
- category: voice
- observation: the settings form save button changes to "saving..." during an in-flight request; the edit-entry save button at /log/[date] does the same. the /today entry form was updated in pass 31 to use "saving." (period, no ellipsis) for voice consistency — SettingsForm.tsx and EditEntry.tsx were not updated in that pass. the result is an inconsistent in-flight label across the product's three save surfaces.
- evidence: src/app/settings/SettingsForm.tsx:219: `'saving...'`; src/app/log/[date]/EditEntry.tsx:138: `'saving...'` — compare src/app/today/TodayEntry.tsx:212: `'saving.'` (period).
- suggested fix: change `'saving...'` to `'saving.'` in SettingsForm.tsx line 219 and EditEntry.tsx line 138 to match the /today convention and the voice spec preference for complete sentences with periods.
- source: browser
- resolution: changed 'saving...' to 'saving.' in SettingsForm.tsx line 219 and EditEntry.tsx line 138; SettingsForm.test.tsx assertion updated. Shipped at 5699c54.

### [x] [LOW] /settings — prompt variety radio inputs carry no per-option aria-describedby
- pass: 34 (commit d754637)
- viewport: both
- category: a11y
- observation: the "standard" and "personalized" radio inputs share a single concatenated hint paragraph: "standard: same curated prompt for everyone each day. personalized: a unique prompt generated from recent entries." no per-option aria-describedby links either radio input to its portion of the hint. a screen reader user focused on either radio hears only its name and position ("standard, radio button, 1 of 2") with no programmatic access to the per-option description.
- evidence: src/app/settings/SettingsForm.tsx: single `<p className={styles.hint}>` carries both descriptions with no id attributes; neither radio input carries aria-describedby. the radiogroup uses aria-label="prompt variety" at group level only.
- suggested fix: split the hint into two elements with ids (e.g. `id="desc-standard"` and `id="desc-personalized"`) and add `aria-describedby="desc-standard"` to the standard radio and `aria-describedby="desc-personalized"` to the personalized radio.
- source: browser
- resolution: wrapped each hint sentence in a span with id="desc-standard" / id="desc-personalized"; added aria-describedby to each radio input in SettingsForm.tsx.

### [x] [LOW] /signin — autoFocus on email input bypasses page context for screen reader users
- pass: 34 (commit d754637)
- viewport: both
- category: a11y
- observation: the email input on /signin carries the autoFocus attribute, which moves browser focus to the input immediately on page load. a screen reader user arriving at the page never hears the H1 "sign in." or the reassurance paragraph before being announced into the email input — they encounter "email, edit text" with no surrounding page context.
- evidence: src/app/signin/page.tsx:71: `autoFocus` on the email `<input>`. page structure: H1 "sign in." → autoFocused email input → reassurance paragraph. focus bypasses the heading and context on load.
- suggested fix: remove autoFocus from the email input; if sighted-user focus convenience is desired, apply it via a useEffect + ref after mount so the heading is announced first, or focus the skip-to-content mechanism instead.
- source: browser
- resolution: removed autoFocus attribute from the email input in src/app/signin/page.tsx. Shipped at c1beaba.

### [x] [LOW] / — 7-day prompt preview renders as plain divs with no list semantics
- pass: 34 (commit d754637)
- viewport: both
- category: a11y
- observation: the seven upcoming-day blocks on the landing page are rendered as `<div>` elements inside a `<section>`. no list role is applied to the container and no listitem role to each day. screen reader users cannot use list navigation commands to jump between the seven items or hear the total count ("item 1 of 7").
- evidence: src/app/page.tsx: `days.map` renders each day as `<div>` inside `<section className={styles.seven}>` — no `<ul>`/`<li>` elements, no `role="list"` on the container, no `role="listitem"` on day elements.
- suggested fix: change the day container to a `<ul>` (or add `role="list"`) and each day `<div>` to `<li>` (or add `role="listitem"`), so AT users can navigate by list item and hear the item count.
- source: browser
- resolution: wrapped days.map output in ul.sevenList and changed each div to li; CSS reset added in page.module.css. Shipped at 0a4eb73.

### [x] [LOW] /today — prereq hint uses ambiguous pronoun "one" as username referent
- pass: 33 (commit 308df1f)
- viewport: both
- category: comprehension
- observation: the publish prereq hint reads "no public username is set — published entries will remain private until one is added in settings." the pronoun "one" lacks a clear antecedent in the same sentence — its intended referent is "a public username" but a reader scanning the compound sentence could momentarily parse "one" as a count or a person. the em-dash compound structure compounds the ambiguity by shifting subject mid-clause: "published entries" (plural) → implied "username" (singular) across the break.
- evidence: body text: "no public username is set — published entries will remain private until one is added in settings." — "one" has no explicit antecedent; present in both main view and focus overlay at TodayEntry.tsx lines 219–220 and 282–283.
- suggested fix: split into two sentences and name the referent explicitly: "no public username is set. published entries will remain private until a username is added in settings."
- source: browser
- resolution: split into two sentences with "a username" replacing "one". Shipped at 581f6f2.

### [x] [LOW] /settings — timezone field label absent from mobile text capture; warrants verification
- pass: 33 (commit 308df1f)
- viewport: mobile
- category: comprehension
- observation: at the 375px viewport, the settings page text capture omits both the "timezone" field label and the "prompt variety" field label. both labels appear in the desktop (1280px) capture. no responsive CSS rule hides these elements at the mobile breakpoint. the discrepancy may be a text-extraction artifact from the TimezoneCombobox interactive component or a layout-timing issue at mobile resolution, or the labels may be visually suppressed at the mobile viewport. warrants verification at the live site.
- evidence: desktop body text: "display name\n\nshown on published entries on the public profile.\n\ntimezone\nprompt variety\n\nstandard: same curated prompt..." — mobile body text: "display name\n\nshown on published entries on the public profile.\n\nstandard: same curated prompt..." — "timezone" and "prompt variety" labels both absent from mobile sequence; no media query hides .label at ≤480px in settings/page.module.css.
- suggested fix: verify that the timezone field and its label render visibly at 375px on the live site; if the labels are hidden or the field is not accessible at mobile, restore both; if confirmed as a text-extraction artifact from the combobox component, no code change is needed.
- source: browser
- resolution: false positive — code inspection confirms the "timezone" label is a standard `<label htmlFor="timezone">` element (SettingsForm.tsx line 137) with no responsive CSS rule hiding it at any breakpoint (settings/page.module.css has no display:none on .label). The "prompt variety" label is a plain `<span className={styles.label}>`. The absence in mobile text capture is a text-extraction artifact from the TimezoneCombobox client component's dynamic rendering state. No code change needed.

### [x] [LOW] /signin — "entering an email address for the first time creates an account" on the sign-in page creates returning-user ambiguity
- pass: 33 (commit 308df1f)
- viewport: both
- category: comprehension
- observation: the /signin page reassurance block includes "entering an email address for the first time creates an account." a returning user who already has an account and is signing in reads "for the first time" and may worry that their email address will create a duplicate account rather than sign them in. this ambiguity was identified on the landing page "/" CTA footer and filed as a PHASE_CANDIDATES finding (auth funnel UX clarity candidate, scope item 1), but the same copy appears on /signin — the page where returning users are most likely to encounter it. the landing page candidate's proposed fix covers "/" only, leaving /signin with the unresolved copy.
- evidence: /signin body text: "a sign-in link is sent to this address. no password. no other mail. entering an email address for the first time creates an account." — the "for the first time" conditional does not distinguish existing-account sign-in from new account creation; returning users at the sign-in step read this as ambiguity about their account state.
- suggested fix: change to two declarative sentences covering both visitor types: "a known address receives a sign-in link. a new address creates an account." — removes the "for the first time" conditional that confuses returning visitors; same fix proposed for "/" in the auth funnel candidate.
- source: browser
- resolution: replaced "entering an email address for the first time creates an account." with "a new address creates an account." in src/app/signin/page.tsx. Shipped at ade50e4.

### [x] [LOW] / — meta description says "one prompt" while page body says "one small prompt"
- pass: 32 (commit 3f7071a)
- viewport: both
- category: seo
- observation: the root layout meta description reads "ember is a daily writing ritual — one prompt and one tiny task each morning." the landing page body reads "one small prompt and one tiny task each morning." the modifier "small" distinguishes the prompt element on the page but is absent from the meta. a search-result snippet describes the product's first component differently from the body copy.
- evidence: meta description (src/app/layout.tsx): "ember is a daily writing ritual — one prompt and one tiny task each morning." body text: "one small prompt and one tiny task each morning." — "small" present in body, absent in meta.
- suggested fix: change meta description to "ember is a daily writing ritual — one small prompt and one tiny task each morning." to match the body phrasing exactly.
- source: browser
- resolution: self-resolved — the landing page lede was changed from "one small prompt" to "one prompt" at 28d1d20; both meta and body now read "one prompt and one tiny task each morning."

### [x] [LOW] /settings — "leave blank to stay private." uses second-person imperative in the public username hint
- pass: 32 (commit 3f7071a)
- viewport: both
- category: voice
- observation: the public username hint reads "your public profile lives at /u/username. leave blank to stay private." both sentences use second-person address: "your public profile" (possessive, already a pending finding at pass 30) and "leave blank" (imperative). the voice guide prohibits second-person imperative copy. the two adjacent second-person constructions compound the direct-address register on the same hint line.
- evidence: settings page body text: "your public profile lives at /u/username. leave blank to stay private." — "leave blank" is the imperative construction.
- suggested fix: change "leave blank to stay private." to "an empty field keeps the profile private." — removes the imperative while preserving the intent.
- source: browser
- resolution: rewritten as "a public profile will appear at /u/username. an empty field keeps the profile private." in SettingsForm.tsx. Shipped at a57cc00.

### [x] [LOW] /settings — "@" prefix on the public username field implies social-media handle format but the URL pattern is "/u/username"
- pass: 32 (commit 3f7071a)
- viewport: both
- category: comprehension
- observation: the public username input is prefixed with "@", suggesting a "@handle" convention. the URL convention for public profiles is "/u/username", not "@username". a user who enters a username sees their public profile at "/u/username" — a different format from what the "@" prefix implies. the prefix sets an expectation the product does not fulfill.
- evidence: settings page body text: "your public profile lives at /u/username. ... @ save sign out" — "@" appears as the visible input prefix immediately before the username field.
- suggested fix: replace the "@" prefix with "/u/" to match the actual URL pattern — sets the correct URL expectation at the point of input.
- source: browser
- resolution: false positive — the public profile page (src/app/u/[username]/page.tsx line 103) displays the username with an "@" prefix on the rendered profile, making the "@" input affordance consistent with the product's own display convention. the URL pattern uses "/u/" but the display convention uses "@". no code change needed; the "@" prefix accurately foreshadows how the username is displayed on the public profile.

### [x] [LOW] /today — OnThisDay component uses second-person "you wrote"
- pass: 31 (commit c0b8bad)
- viewport: both
- category: voice
- observation: the on-this-day component renders "{yearText}, you wrote —" followed by an excerpt from a prior-year entry. "you wrote" is a second-person construction that conflicts with the no-second-person voice posture applied throughout the site. the feature renders only when the user has a prior entry on the same calendar day in an earlier year; the bot account had no such entries so it did not appear in the capture, but the source copy is confirmed.
- evidence: src/app/today/OnThisDay.tsx line 34: `{yearText}, you wrote &mdash;{' '}` — e.g. "a year ago, you wrote — [excerpt]". confirmed in test assertions at OnThisDay.test.tsx lines 78, 96.
- suggested fix: reframe to an impersonal construction, e.g. "a year ago —" followed by the excerpt directly, dropping "you wrote" entirely. preserves the temporal framing without direct address.
- source: browser
- resolution: changed "{yearText}, you wrote —" to "{yearText} —" in OnThisDay.tsx. Two test assertions updated. Shipped at 2d880ee.

### [x] [LOW] /log — most-recent entry article has no accessible name
- pass: 31 (commit c0b8bad)
- viewport: both
- category: a11y
- observation: when entries exist, the most-recent entry is wrapped in an `<article>` element with no accessible name. screen reader users navigating by landmark or article role encounter the prompt text as the only heading inside the article, with no context identifying this as the most recent log entry. the "showing the most recent." prose sits outside the article boundary and has no programmatic association to it.
- evidence: src/app/log/page.tsx line 100: `<article className={styles.entryView}>` — no aria-label attribute. the "showing the most recent." string at line 123 is outside the article.
- suggested fix: add `aria-label="most recent entry"` to the article element so AT users understand its role in the page structure.
- source: browser
- resolution: added aria-label="most recent entry" to the article element in src/app/log/page.tsx. Shipped at d6aed87.

### [x] [LOW] /today — save indicator status strings are sentence fragments
- pass: 31 (commit c0b8bad)
- viewport: both
- category: voice
- observation: three save-indicator status strings are sentence fragments without terminal periods, inconsistent with the voice spec's requirement that copy communicating state be a complete sentence. "saving..." uses an ellipsis convention; "unsaved" is a bare adjective; "draft restored" is a past-participle phrase with no period. the strings appear in the aria-live indicator span (read aloud by screen readers) and as button text, so their register affects both sighted and AT users. the "saved." indicator already has a period; the others are inconsistent with it.
- evidence: src/app/today/TodayEntry.tsx lines 145, 148, 150: `return 'saving...'`, `return 'draft restored'`, `return 'unsaved'`; button label at lines 212, 275: `{saveState === 'saving' ? 'saving...' : 'save'}`.
- suggested fix: change to "saving." (period, no ellipsis), "draft restored." and "not yet saved." — all complete sentences, consistent with "saved." and the voice spec.
- source: browser
- resolution: changed 'saving...', 'draft restored', 'unsaved' to 'saving.', 'draft restored.', 'not yet saved.' in TodayEntry.tsx; button labels and 3 test files updated. Shipped at 17830b2.

### [x] [LOW] /signin — page title separator inconsistency (· vs —)
- pass: 31 (commit c0b8bad)
- viewport: both
- category: seo
- observation: the root layout title uses an em dash as separator ("ember — a daily writing ritual") while all page-level titles use a middle dot ("ember · sign in", "ember · today", "ember · log", "ember · settings"). the two separator characters produce inconsistent visual rhythm across browser tabs and search engine result listings.
- evidence: anonymous capture title "ember — a daily writing ritual" (homepage); "ember · sign in" (/signin); authenticated captures: "ember · today", "ember · log", "ember · settings". the root layout sets the default template with em dash; page-level layouts override with middle dot.
- suggested fix: standardise on the middle dot across all titles — change the root layout to "ember · a daily writing ritual" — or adopt the em dash pattern in all page-level templates.
- source: browser
- resolution: changed root layout title, openGraph.title, and twitter.title from em dash to middle dot in src/app/layout.tsx. Shipped at 37d4e8a.

### [x] [LOW] / — footer label "a low-friction writing ritual." uses product-management jargon
- pass: 31 (commit c0b8bad)
- viewport: both
- category: voice
- observation: the homepage footer label reads "a low-friction writing ritual." the compound modifier "low-friction" is product-management register — it describes the design posture in technical terms rather than experiential ones. the voice guide specifies plain and slightly bookish; the rest of the page uses concrete, experiential language ("ten minutes of intention", "a quiet personal log").
- evidence: anonymous capture: "ember\na low-friction writing ritual." — footer section label immediately below the wordmark.
- suggested fix: replace with a plain experiential descriptor, e.g. "a daily writing ritual." (dropping the modifier entirely) or "a quiet daily practice." to match the page's own register.
- source: browser
- resolution: changed "a low-friction writing ritual." to "a daily writing ritual." in src/app/page.tsx. Shipped at 260eb99.

### [x] [LOW] / — Twitter card images array lacks alt text
- pass: 30 (commit 53cd344)
- viewport: both
- category: seo
- observation: the root layout Twitter card metadata specifies `images` as a plain string array. next.js app router requires an object array `[{ url, alt }]` to emit an alt attribute on the twitter card image. the plain string form produces a twitter card image with no accessible description. the opengraph image at the same path correctly includes alt text.
- evidence: src/app/layout.tsx: `twitter: { images: ['/opengraph-image'] }` — plain string, no alt property. compare `openGraph.images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember — a daily writing ritual' }]` — object with alt.
- suggested fix: change `twitter.images` to `[{ url: '/opengraph-image', alt: 'ember — a daily writing ritual' }]` to match the opengraph object format and carry an accessible image description in the twitter card.
- source: browser
- resolution: changed `twitter.images` to `[{ url: '/opengraph-image', alt: 'ember — a daily writing ritual' }]` in src/app/layout.tsx. Shipped at bac93ea.

### [LOW] /today — "focus" button has no visible description on mobile (touch devices)
- pass: 30 (commit 53cd344)
- viewport: mobile
- category: comprehension
- observation: the "focus" button carries a title attribute ("enters a distraction-free writing view.") on desktop, but title tooltips are not surfaced on touch devices. the adjacent publish toggle has a description line rendered below it in the DOM; "save" is self-explanatory. "focus" is the only control in the row with no supporting copy visible at the mobile viewport.
- evidence: mobile capture controls sequence: "publish / when published, this entry appears on the public profile. / focus / save" — "focus" has no adjacent description; the title attribute is inaccessible on touch.
- suggested fix: render a short description element below the focus button in the DOM, parallel to the publish description ("enters a distraction-free writing view."), so touch users see a plain-language explanation without hover.
- source: browser

### [x] [LOW] /settings — "your public profile lives at /u/username" uses second-person possessive
- pass: 30 (commit 53cd344)
- viewport: both
- category: voice
- observation: the public username field hint reads "your public profile lives at /u/username." the phrase "your public profile" is a second-person possessive. prior passes de-possessived "your public profile" in the /today publish description (resolved at 95eb800) but the same phrase persists in this hint. the pending pass-14 finding covers "leave blank to stay private" as imperative; the possessive "your public profile lives at" in the same sentence is a distinct, unfiled instance.
- evidence: settings capture: "your public profile lives at /u/username. leave blank to stay private." — "your public profile" is the possessive portion; "leave blank" is the imperative portion filed separately at pass 14.
- suggested fix: change to "a public profile will appear at /u/username." to remove the possessive while retaining the url example.
- source: browser
- resolution: addressed as part of combined hint rewrite in SettingsForm.tsx. Shipped at a57cc00.

### [x] [LOW] /signin — "sign-in links expire after 24 hours." appears twice simultaneously after submission
- pass: 30 (commit 53cd344)
- viewport: both
- category: comprehension
- observation: after a visitor submits their email, "sign-in links expire after 24 hours." appears twice simultaneously: once in the sent-state confirmation paragraph (added at pass 28) and once in the always-visible page footer. the phrase was added to the sent-state at 1cb0860 but the footer span was not removed, producing verbatim duplication on the same screen in the sent state.
- evidence: src/app/signin/page.tsx: sent-state `<p>` ends with "sign-in links expire after 24 hours."; footer unconditionally renders `<span>sign-in links expire after 24 hours.</span>` regardless of state.
- suggested fix: remove "sign-in links expire after 24 hours." from the footer span, or render it only when state !== 'sent', so the expiry notice appears once in the confirmation paragraph where it is most relevant.
- source: browser
- resolution: conditionally render footer expiry span only when state !== 'sent'. Shipped at fce61a6.

### [LOW] / — MosaicPreview aria-label "60 days of practice" misrepresents illustrative content
- pass: 30 (commit 53cd344)
- viewport: both
- category: a11y
- observation: the MosaicPreview component on the landing page carries `aria-label="60 days of practice"`. for an anonymous visitor who has never used ember, the mosaic is a hardcoded illustrative tile pattern unrelated to any visitor's data. the label "60 days of practice" implies personal ownership of a practice that does not exist for an anonymous first-time visitor, misrepresenting the element's illustrative nature to screen reader users.
- evidence: src/components/mosaic/MosaicPreview.tsx: `role="img" aria-label="60 days of practice"` — the PREVIEW_PATTERN is a static hardcoded array not derived from any user session or authenticated context.
- suggested fix: change aria-label to "an example of 60 days tracked" or "illustrative writing log" to accurately describe the decorative, non-personal nature of the element for screen reader users arriving anonymously.
- source: browser

### [x] [LOW] /signin — meta description uses second-person possessive "your email"
- pass: 29 (commit e9a5f15)
- viewport: both
- category: seo
- observation: the /signin page meta description reads "sign in to ember with a link sent to your email — no password required." the phrase "your email" is a second-person possessive. the de-possessiving pattern applied to /log, /today, /settings, and /log/[date] meta descriptions was not applied to this description when it was written. every other page meta description on the site now avoids direct address; /signin is the remaining outlier.
- evidence: src/app/signin/layout.tsx line 5: `description: 'sign in to ember with a link sent to your email — no password required.'` — "your email" is the only possessive remaining in the site's meta description set.
- suggested fix: change to "sign in to ember with a link sent by email — no password required." — removes the possessive while preserving the meaning.
- source: browser
- resolution: changed "sent to your email" to "sent by email" in src/app/signin/layout.tsx. Shipped at 01c4324.

### [x] [LOW] / — root layout meta description uses "small task" instead of branded "tiny task"
- pass: 29 (commit e9a5f15)
- viewport: both
- category: seo
- observation: the root layout meta description reads "ember is a daily writing ritual — one prompt and one small task each morning." the product's branded compound label throughout the landing page body, all seven 7-day preview items, and the closing paragraph is "tiny task" — never "small task." the description diverges from the product's own terminology; a search-result snippet would show a term that does not match any text visible on the landing page.
- evidence: src/app/layout.tsx line 36: `description: 'ember is a daily writing ritual — one prompt and one small task each morning.'` — compare landing page body: "one small prompt and one tiny task each morning." and all seven preview lines beginning "tiny task — ..."; also openGraph.description at lines 46, 53 carries the same text.
- suggested fix: change to "ember is a daily writing ritual — one prompt and one tiny task each morning." in all three occurrences (description, openGraph.description, twitter.description) to match the product's branded label.
- source: browser
- resolution: changed all three occurrences in src/app/layout.tsx. Shipped at 75cf391.

### [x] [LOW] /settings — "view your public profile" link text uses second-person possessive
- pass: 29 (commit e9a5f15)
- viewport: both
- category: voice
- observation: when a public username is saved, the settings page renders a link with text "view your public profile." the phrase "your public profile" is a second-person possessive. the same de-possessiving pattern applied to other settings strings ("your writing practice", "your recent entries") was not applied to this link, which is rendered conditionally below the form only when a username is set.
- evidence: src/app/settings/page.tsx line 58: `view your public profile` — rendered only when profile?.username is truthy; the link text is the sole remaining possessive in the settings page visible content.
- suggested fix: change link text to "view public profile" to remove the possessive while preserving the navigation purpose.
- source: browser
- resolution: changed link text from "view your public profile" to "view public profile" in src/app/settings/page.tsx. Shipped at 4d95d36.

### [x] [LOW] / — H1 uses semantic `<em>` for typographic italics on "intention"
- pass: 29 (commit e9a5f15)
- viewport: both
- category: a11y
- observation: the landing page H1 renders "ten minutes of intention before the day swallows you." with the word "intention" wrapped in an `<em>` element. the `<em>` element carries semantic stress meaning in HTML — screen readers voice its contents with spoken emphasis. the rendering intent appears to be typographic (italic styling), but using `<em>` for italics in a heading applies spoken stress to one word of an otherwise plain declarative sentence. the design system uses no other typographic emphasis elements in headings.
- evidence: src/app/page.tsx line 27: `ten minutes of <em>intention</em> before the day swallows you.` — the only `<em>` element in a heading context on the site.
- suggested fix: if the intent is typographic only, replace `<em>` with a `<span>` styled with a CSS italic class (e.g. `styles.pitchAccent`) to remove the semantic stress signal from the accessible tree while preserving the italic rendering.
- source: browser
- resolution: false positive — src/app/page.tsx already uses `<span className={styles.pitchAccent}>intention</span>` (not `<em>`); the semantic stress was removed in a prior pass. No code change needed.

### [x] [LOW] / — lede says "one small prompt" but the named concept throughout is "prompt"
- pass: 28 (commit 64a33db)
- viewport: both
- category: voice
- observation: the product description reads "one small prompt and one tiny task each morning." "tiny task" is the consistently branded compound label used throughout the page — in the 7-day preview header, in all seven preview items, and in the closing paragraph. "small" is not used as a modifier for "prompt" anywhere else; the named concept is simply "prompt." the asymmetry between "small prompt" (lede) and the unmodified "prompt" everywhere else creates a minor inconsistency in how the product names its two components.
- evidence: lede: "one small prompt and one tiny task each morning." — compare 7-day preview items: "tiny task — tidy the surface..." / closing: "the same prompt and tiny task arrive for everyone on a given day." (noting scope item 37 fix pending: task → tiny task in closing paragraph).
- suggested fix: change "one small prompt and one tiny task each morning." to "one prompt and one tiny task each morning." to match how "prompt" is treated everywhere else on the page.
- source: browser
- resolution: changed "one small prompt" to "one prompt" in src/app/page.tsx. Shipped at 28d1d20.

### [x] [LOW] /signin — expiry notice "sign-in links expire after 24 hours." is in the page footer, separated from the confirmation area
- pass: 28 (commit 64a33db)
- viewport: both
- category: comprehension
- observation: the sign-in link expiry notice ("sign-in links expire after 24 hours.") is placed in the page footer, below the form and confirmation text. a visitor who submits their email, reads the confirmation ("a sign-in link is on its way. the link opens today's prompt directly."), and then closes or minimises the tab will not have seen the expiry notice, which is the only guidance about how long to act. on mobile the footer is below the fold after form submission.
- evidence: /signin body text (footer): "sign-in links expire after 24 hours." — separated from the confirmation copy: "a sign-in link is on its way. the link opens today's prompt directly." by the footer boundary.
- suggested fix: move "sign-in links expire after 24 hours." into the confirmation state body, adjacent to "the link opens today's prompt directly." so expiry context appears at the moment it is relevant.
- source: browser
- resolution: added "sign-in links expire after 24 hours." to the 'sent' state confirmation paragraph in src/app/signin/page.tsx. Shipped at 1cb0860.

### [x] [LOW] / — section subheader "this is what arrives each morning." uses "this" as an ambiguous pronoun
- pass: 28 (commit 64a33db)
- viewport: both
- category: comprehension
- observation: the 7-day preview section has a two-line header: "the next seven days" followed by "this is what arrives each morning." for a first-time reader, "this" is an ambiguous pronoun. it could refer to the full seven-item list (which would be odd — seven things don't all arrive each morning) or to the pattern of one prompt and one tiny task that arrives each day. the product description above explains the daily pattern, but the section subheader doesn't make the relationship between the seven-day list and the daily delivery explicit.
- evidence: capture text: "the next seven days\nthis is what arrives each morning.\ntoday\nMon 1 Jun\n\nwhat's the last time you were in a space..." — seven date blocks follow the ambiguous "this."
- suggested fix: replace with an explicit framing such as "a prompt and a tiny task, arriving each morning — here are the next seven." or simply "one prompt and one tiny task, every morning." to make the daily-delivery model unambiguous before the list.
- source: browser
- resolution: changed to "one prompt and one tiny task, every morning." in src/app/page.tsx. Shipped at 6381eb1.

### [x] [LOW] / — closing paragraph uses "task" where all other occurrences use "tiny task"
- pass: 27 (commit 43ffddf)
- viewport: both
- category: voice
- observation: the closing paragraph reads "the same prompt and task arrive for everyone on a given day." the product consistently uses "tiny task" as its compound label — once in the sub-pitch ("one small prompt and one tiny task each morning.") and seven times in the 7-day preview ("tiny task — ..."). "task" alone in the closing paragraph is the only stripped instance, creating a terminology inconsistency on the same page that uses the compound form everywhere else.
- evidence: body text: "the same prompt and task arrive for everyone on a given day." — compare: "one small prompt and one tiny task each morning." and seven "tiny task —" lines in the 7-day preview.
- suggested fix: change "the same prompt and task" to "the same prompt and tiny task" to match the product's labeling throughout the page.
- source: browser
- resolution: changed "the same prompt and task" to "the same prompt and tiny task" in src/app/page.tsx. Shipped at 68fb212.

### [x] [LOW] / — "forgetting a day is fine" presupposes an existing practice for a pre-signup visitor
- pass: 27 (commit 43ffddf)
- viewport: both
- category: comprehension
- observation: the reassurance paragraph reads "forgetting a day is fine. the log shows what is, not what isn't." a first-time visitor who has not yet signed up cannot have forgotten a day — the sentence addresses continuity anxiety in an existing practitioner. for someone evaluating whether to start, it is a solution to a problem they do not yet have. the surrounding copy ("there are no streaks to break, no reminders to dismiss, no notifications to mute.") does not presuppose prior use; only "forgetting a day" does.
- evidence: body text: "there are no streaks to break, no reminders to dismiss, no notifications to mute. forgetting a day is fine. the log shows what is, not what isn't." — positioned before the sign-in CTA on the anonymous landing page.
- suggested fix: reframe as a feature description rather than reassurance for an existing habit: "a missed day leaves no mark." — preserves the anti-streak signal without presupposing an established record.
- source: browser
- resolution: changed "forgetting a day is fine." to "a missed day leaves no mark." in src/app/page.tsx. Shipped at 346dd7b.

### [x] [LOW] /settings — display name field has no hint text; scope of the field is unclear for a new user
- pass: 27 (commit 43ffddf)
- viewport: both
- category: comprehension
- observation: the settings page has three data fields — display name, timezone, and public username. public username has a supporting hint ("your public profile lives at /u/username. leave blank to stay private."). display name has no equivalent description. for a first-time empty-account user it is unclear whether the display name appears on the public profile, in log headings, in emails, or nowhere visible — the field is a bare label with no signal about its function or scope.
- evidence: capture text: "settings\ndisplay name\ntimezone\nprompt variety\n\nstandard: same curated prompt for everyone each day..." — "display name" is followed immediately by "timezone" with no intervening description.
- suggested fix: add a one-sentence hint below the display name input describing where it surfaces, e.g. "shown on published entries on the public profile."
- source: browser
- resolution: added "shown on published entries on the public profile." hint below the display name label in SettingsForm.tsx. Shipped at 2e34197.

### [x] [LOW] /settings — "curated" in the standard prompt option description uses ungrounded editorial register
- pass: 27 (commit 43ffddf)
- viewport: both
- category: voice
- observation: the standard prompt variety option reads "same curated prompt for everyone each day." "curated" implies intentional selection by a person or editorial process, but nothing on the page or in the broader site identifies what that process is. the personalized option names its mechanism explicitly ("generated from recent entries"); the standard option asserts quality ("curated") without specifying one. this is inconsistent in register and at odds with the plain, non-marketing voice used throughout the site.
- evidence: capture text: "standard: same curated prompt for everyone each day. personalized: a unique prompt generated from recent entries." — "curated" is the sole ungrounded evaluative word in the settings description block.
- suggested fix: change to "same prompt for everyone each day." — removes the ungrounded assertion while preserving the shared-prompt contrast with the personalized option.
- source: browser
- resolution: removed "curated" from desc-standard span in SettingsForm.tsx. Shipped at 49725d2.

### [LOW] / — closing statement "ember does not personalize your morning." uses second-person possessive "your morning"
- pass: 26 (commit 4ab0064)
- viewport: both
- category: voice
- observation: the closing paragraph reads "the same prompt and task arrive for everyone on a given day. ember does not personalize your morning." the phrase "your morning" is a second-person possessive. adjacent possessives in the same section have been corrected in prior passes ("your log" → "the log" at 1c6a9c6; "your responses" → "responses" at 7fbde80). "your morning" was not addressed in those passes. it may be intentional — the contrast between "your morning" (personal) and "does not personalize" (impersonal) is arguably the point of the sentence — but the pattern is consistent with the other corrected possessives on the page.
- evidence: body text: "the same prompt and task arrive for everyone on a given day. ember does not personalize your morning." — "your morning" is the remaining possessive in the closing section after the prior de-possessiving passes.
- suggested fix: if the possessive is not intentional: change to "ember does not personalize the morning." — removes the possessive while preserving the anti-personalization statement. if the possessive is intentional for brand contrast: no change needed; this finding is a [needs-user-call].
- source: browser

### [x] [LOW] /today — publish toggle description uses possessive "your public profile"
- pass: 25 (commit 57690c4)
- viewport: both
- category: voice
- observation: the publish toggle description reads "when published, this entry appears on your public profile." the phrase "your public profile" is a second-person possessive. this text was introduced in the pass 15 fix (3e54d90), which correctly changed the phrasing from unconditional to conditional but retained the possessive. the same de-possessiving pattern applied elsewhere on /today ("response" replacing "your response", "the last seven days" replacing "your last seven days") was not applied to this string. it appears twice in the DOM: once in the main view and once in the focus overlay.
- evidence: /today body text: "when published, this entry appears on your public profile." — present at two positions in both desktop and mobile captures.
- suggested fix: change to "when published, this entry appears on the public profile." — removes the possessive while preserving the conditional framing.
- source: browser
- resolution: changed all 4 occurrences in TodayEntry.tsx. Shipped at 95eb800.

### [x] [LOW] /settings — meta description uses possessive "your writing practice"
- pass: 25 (commit 57690c4)
- viewport: both
- category: seo
- observation: the /settings page meta description reads "account settings for your writing practice — display name, timezone, prompt variety, and public username." the phrase "your writing practice" is a second-person possessive. this text was introduced by the pass 21 fix (e0a3a2b) which added purpose context to a bare field list — but the possessive was introduced in that same fix. the same de-possessiving pattern applied to /log, /log/[date], and /today meta descriptions applies here.
- evidence: /settings description: "account settings for your writing practice — display name, timezone, prompt variety, and public username."
- suggested fix: change to "account settings — display name, timezone, prompt variety, and public username." — removes the possessive while retaining the field list.
- source: browser
- resolution: changed description to "account settings — display name, timezone, prompt variety, and public username." in src/app/settings/page.tsx. Shipped at b7aeccb.

### [x] [LOW] /settings — prompt variety description uses possessive "your recent entries"
- pass: 25 (commit 57690c4)
- viewport: both
- category: voice
- observation: the personalized option description reads "personalized: a unique prompt generated from your recent entries." the phrase "your recent entries" is a second-person possessive. the "standard" option description avoids possessives ("same curated prompt for everyone each day"), making the two toggle descriptions inconsistent in register.
- evidence: /settings body text: "personalized: a unique prompt generated from your recent entries."
- suggested fix: change to "personalized: a unique prompt generated from recent entries." — removes the possessive and aligns the register of both toggle descriptions.
- source: browser
- resolution: changed "your recent entries" to "recent entries" in SettingsForm.tsx hint text. Shipped at HEAD.

### [x] [LOW] / — 7-day preview section header doubled in mobile DOM text
- pass: 25 (commit 57690c4)
- viewport: mobile
- category: seo
- observation: the 7-day preview section header — "the next seven days" and the subline "this is what arrives each morning." — appears twice in sequence in the mobile DOM text capture. the desktop capture shows it once; the mobile capture shows it duplicated back-to-back. this is the same always-in-DOM pattern as the focus-mode overlay (pending finding from pass 22): a second instance is rendered for a mobile layout slot and remains in the DOM when CSS-hidden, so raw-text readers — feed parsers, search scrapers, Playwright innerText — see the duplication.
- evidence: mobile body text: "the next seven days\nthis is what arrives each morning.\nthe next seven days\nthis is what arrives each morning.\ntoday\nSun 31 May" — block appears once in the desktop capture.
- suggested fix: if a second header instance is rendered for a mobile layout slot, apply aria-hidden="true" to the duplicate or conditionally render its text content only when the primary instance is not visible.
- source: browser
- resolution: pass 27 mobile capture (2026-06-01) shows bodyTextLength 1973 — identical to desktop — with the section header appearing only once. the duplication is no longer present; issue resolved by a prior undocumented change.

### [x] [LOW] /today — "your response" textarea label uses second-person possessive
- pass: 24 (commit c62ca34)
- viewport: both
- category: voice
- observation: the label above the entry textarea reads "your response" in both the main form and the focus-mode overlay. the voice guide avoids presuppositional second-person address; prior passes de-possessived "your last seven days" → "the last seven days" (DayStrip.tsx), "your past 60 days" → "the past 60 days" (log H1), and "your log is empty." → "the log is empty." for consistency. "your response" persists as the sole remaining possessive label on the page, applying the same pattern that was corrected everywhere else on /today.
- evidence: body text: "your response" appears twice — once in the main form and once in the focus overlay. TodayEntry.tsx line 170 and line 239: `<label ... className={styles.entryLabel}>your response</label>`.
- suggested fix: change both instances of "your response" to "response" in TodayEntry.tsx — removes the possessive while remaining clear as a textarea label.
- source: browser
- resolution: changed both instances to "response" in TodayEntry.tsx; three test files updated. Shipped at 9e8d354.

### [x] [LOW] /today — meta description uses second-person possessive "your daily writing space"
- pass: 24 (commit c62ca34)
- viewport: both
- category: seo
- observation: the /today meta description reads "today's prompt and your daily writing space." the phrase "your daily writing space" addresses the reader possessively. the /log meta description's possessives are a pending finding; the /today meta description presents the same pattern and has not been addressed. the description appears in search results and bookmark previews where the visitor may not yet have a practice to call "yours."
- evidence: src/app/today/page.tsx line 16: `description: "today's prompt and your daily writing space."` — the possessive "your" is the only instance of direct address in the /today metadata.
- suggested fix: change to "today's prompt and a space to write." — removes the possessive while preserving the page-purpose signal.
- source: browser
- resolution: changed description to "today's prompt and a space to write." in src/app/today/page.tsx. Shipped at 74466d1.

### [x] [LOW] /log — "your log is empty." uses possessive after H1 was corrected to non-possessive
- pass: 23 (commit 4737f15)
- viewport: both
- category: voice
- observation: the H1 on /log was changed from "your past 60 days" to "the past 60 days" at 3c775f9 to avoid presupposing content for a zero-entry user. the empty-state sentence immediately below the mosaic was not updated in the same pass and still reads "your log is empty. today's entry will appear here." — the possessive "your log" persists one line below the fixed heading, contradicting the fix's own logic.
- evidence: /log body text: "the past 60 days\n\nyour log is empty. today's entry will appear here." — "the" in the H1, "your" in the body.
- suggested fix: change "your log is empty." to "the log is empty." to match the non-possessive register applied to the H1 in the same correction pass.
- source: browser
- resolution: changed "your log is empty." to "the log is empty." in src/app/log/page.tsx; updated bearings.md standing decision. Shipped at da2510a.

### [x] [LOW] /settings — save button carries no title attribute while /today save buttons do
- pass: 23 (commit 4737f15)
- viewport: desktop
- category: voice
- observation: the voice guide requires hover/tooltip copy to be a complete sentence with a period. the /today page save buttons carry title="entries are saved privately by default." but the equivalent submit button in SettingsForm.tsx formFoot has no title attribute. a sighted user hovering over the settings save button on desktop receives no tooltip, inconsistent with the pattern established on /today.
- evidence: settings page body: "save" button rendered with no tooltip — compare /today which shows title="entries are saved privately by default." on both main and focus-overlay save buttons.
- suggested fix: add title="saves display name, timezone, prompt variety, and username." to the submit button in SettingsForm.tsx, consistent with the /today tooltip pattern.
- source: browser
- resolution: added title="saves display name, timezone, prompt variety, and username." to the submit button in src/app/settings/SettingsForm.tsx. Shipped at fd27cba.

### [x] [LOW] /log — meta description uses second-person possessives
- pass: 23 (commit 4737f15)
- viewport: both
- category: voice
- observation: the /log page meta description reads "your writing log — prompts, responses, and the entries you have published over the past 60 days." two possessives remain: "your writing log" and "the entries you have published." for a zero-entry user or a first-time visitor arriving from a search result, both phrases address the reader as though they already have a publication history. the H1 was de-possessived ("the past 60 days") but the meta description was not updated to match.
- evidence: meta description: "your writing log — prompts, responses, and the entries you have published over the past 60 days." — "your" and "you have published" both remain.
- suggested fix: reframe to an impersonal description, e.g. "a 60-day writing log — prompts, responses, and published entries." removes direct address while retaining the content signal.
- source: browser
- resolution: changed description to "a 60-day writing log — prompts, responses, and published entries." in src/app/log/page.tsx. Shipped at a5181c7.

### [x] [LOW] /signin — H1 "sign in." carries a terminal period no other page heading uses
- pass: 23 (commit 4737f15)
- viewport: both
- category: voice
- observation: the /signin page H1 reads "sign in." with a terminal period. no other page heading in the app set ends with a period — the home lede is a full sentence and its period is appropriate, but "sign in." is a two-word label functioning as a heading. the period tips it into a declarative-sentence register that is inconsistent with how heading labels are treated elsewhere.
- evidence: captured H1: "sign in." — compare authenticated page headings ("settings", "the past 60 days") which carry no terminal period. section labels on the home page ("the next seven days", "this is what arrives each morning.") are inconsistent with each other but neither is a page H1.
- suggested fix: remove the terminal period from the "sign in" H1 in src/app/signin/page.tsx so it reads as a heading label rather than a declarative sentence.
- source: browser
- resolution: removed terminal period from H1 in src/app/signin/page.tsx; E2E assertion updated. Shipped at 1b64bf7.

### [LOW] /signin — "send the link" button uses definite article before any link has been introduced
- pass: 23 (commit 4737f15)
- viewport: both
- category: comprehension
- observation: the submit button reads "send the link." the definite article "the" presupposes a previously established referent, but the surrounding reassurance copy uses the indefinite article: "a sign-in link is sent to this address." for a first-time visitor the button implies a specific known link rather than the one they are about to request, creating a small article mismatch.
- evidence: button label: "send the link" — adjacent reassurance text: "a sign-in link is sent to this address. no password. no other mail." the "a" in the description and "the" in the button label are at odds.
- suggested fix: change the button label to "send a link" or "send sign-in link" so the article matches the indefinite framing of the surrounding copy.
- source: browser

### [LOW] / — "ten minutes" in the lede is never grounded in the product description
- pass: 23 (commit 4737f15)
- viewport: both
- category: comprehension
- observation: the lede opens with "ten minutes of intention before the day swallows you." the product description that follows — "a few sentences in response, the task marked if it happened, and the day continues" — never references duration. a first-time reader has no basis for the ten-minute figure: whether it is a maximum, an average, a design constraint, or a rhetorical gesture. the number floats without context anywhere on the page.
- evidence: lede: "ten minutes of intention before the day swallows you." product description: "one small prompt and one tiny task each morning. a few sentences in response, the task marked if it happened, and the day continues. over weeks, responses accumulate into a quiet personal log." — no duration reference in the description or the 7-day preview.
- suggested fix: either ground the figure with a brief qualifier (e.g. "a prompt and a task — ten minutes at most.") or remove the specific number from the lede if the product makes no time guarantee, letting the product description carry the framing unaided.
- source: browser

### [LOW] / — tiny task copy in 7-day preview uses second-person imperative throughout
- pass: 22 (commit 24d04ae)
- viewport: both
- category: voice
- observation: all seven tiny task lines in the anonymous landing-page preview are second-person imperative constructions — "say something true and specific to someone today", "tidy the surface you look at most often", "spend fifteen minutes reading something", "write that opinion down in two sentences", etc. the voice guide explicitly prohibits second-person imperative copy. the product description on the same page already uses the participial form ("the task marked if it happened") to describe tasks, but the actual task text throughout the preview contradicts it.
- evidence: body text: "tiny task — say something true and specific to someone today — not a formality. / tiny task — make yourself something to eat with a little more care than usual. / tiny task — tidy the surface you look at most often. / tiny task — spend fifteen minutes reading something with no productivity justification. / tiny task — do one small thing today that you avoided before. / tiny task — write that opinion down in two sentences." — all are imperative verb forms.
- suggested fix: reframe task content as gerund or participial form consistent with the product description's register, e.g. "saying something true and specific to someone today." — removes the imperative while preserving the instruction. apply consistently across content/prompts.json.
- source: browser

### [x] [LOW] /signin — page carries no signal that submitting a new email creates an account
- pass: 22 (commit 24d04ae)
- viewport: both
- category: comprehension
- observation: the home page CTA block includes "entering an email address for the first time creates an account." to explain the combined sign-in / account-creation flow. the /signin page itself carried no equivalent — a visitor who arrives directly at /signin (via a search result, a shared link, or a browser bookmark) sees only "sign in." with an email field and a "send the link" button, with no indication that submitting an unknown address will create an account rather than failing.
- evidence: full /signin page text: "skip to content / ember / back to home / sign in. / email / send the link / a sign-in link is sent to this address. no password. no other mail. / ember / sign-in links expire after 24 hours." — no account-creation mention present.
- suggested fix: add a single declarative line below the reassurance text on /signin: "entering an email address for the first time creates an account." — mirrors the home CTA explainer and closes the comprehension gap for direct-arrival visitors.
- source: browser
- issue: [mirror-failed: loop-issue.mjs not present in scripts/]
- resolution: appended "entering an email address for the first time creates an account." to the reassurance paragraph in src/app/signin/page.tsx (shown in idle/sending/error states). Shipped at 34cce6c.

### [x] [LOW] /today — "done writing" focus-exit button carries no title attribute
- pass: 22 (commit 24d04ae)
- viewport: desktop
- category: voice
- observation: the "done writing" button that exits focus mode has no title attribute. the voice guide requires hover/tooltip copy to be a complete sentence with a period. every other interactive control on /today already carries one: the focus-trigger button has title="enters a distraction-free writing view.", the task-done button has dynamic title attributes, and both save buttons have title="entries are saved privately by default." — "done writing" is the only control in the group without a complete-sentence hover description.
- evidence: TodayEntry.tsx: focusDone button carries aria-label="exit focus mode" and visible text "done writing" but no title attribute; compare focusTrigger button which carries title="enters a distraction-free writing view." and aria-label="enter focus mode".
- suggested fix: add title="exits the distraction-free writing view." to the focusDone button in TodayEntry.tsx, consistent with the voice guide's tooltip-completeness rule.
- source: browser
- resolution: added title="exits the distraction-free writing view." to the focusDone button in TodayEntry.tsx. Shipped at 0251932.

### [LOW] /today — focus overlay always rendered in DOM; page text is doubled for raw-text consumers
- pass: 22 (commit 24d04ae)
- viewport: both
- category: seo
- observation: the focus-mode overlay is retained permanently in the DOM for its opacity-transition animation and hidden from assistive technology via aria-hidden={!isFocus}. any raw-DOM text reader — Playwright innerText, link-preview scrapers, feed parsers — sees the full prompt, "your response" label, publish description, and username prereq hint duplicated verbatim in the same page. the page's serialised text content is effectively doubled at rest.
- evidence: page text capture shows: prompt → controls block ("publish / when published... / focus / save / entries appear publicly...") → [focus overlay] prompt again → controls block again ("publish / when published... / save / entries appear publicly...") → "done writing". the overlay content appears unconditionally before the day strip.
- suggested fix: conditionally render the focus overlay's inner content only when isFocus is true — e.g. `{isFocus && <FocusOverlayContent />}` — so the duplicate text is absent from the DOM at rest. the outer overlay container can remain for transition purposes.
- source: browser

### [x] [LOW] /log — H1 "your past 60 days" uses possessive for accounts with no entries
- pass: 22 (commit 24d04ae)
- viewport: both
- category: voice
- observation: the /log page H1 reads "your past 60 days" regardless of whether the user has any entries. for a brand-new account, the possessive "your" presupposes 60 days of engagement that does not exist — the same pattern that prompted the /today DayStrip fix at e016982, which changed "your last seven days" to "the last seven days". the /log H1 was not updated in that pass.
- evidence: page text: "your past 60 days" as H1 immediately above "your log is empty. today's entry will appear here." — the heading claims ownership of a period the user has not engaged with.
- suggested fix: change the /log H1 in log/page.tsx from "your past 60 days" to "the past 60 days", consistent with the DayStrip fix applied to the same pattern on /today.
- source: browser
- resolution: changed H1 from "your past 60 days" to "the past 60 days" in src/app/log/page.tsx. Shipped at 3c775f9.

### [x] [LOW] /today — username prereq hint links to /settings with a plain `<a>` tag, not Next.js Link
- pass: 22 (commit 24d04ae)
- viewport: both
- category: navigation
- observation: the publish prereq hint ("entries appear publicly only when a username is set in settings.") links to /settings using a plain HTML `<a>` tag in both the main view and the focus overlay. clicking it triggers a full browser navigation and page reload rather than a client-side transition. every other in-app link on the page — the nav links, the "open log" strip link, and the /log empty-state link — uses Next.js Link, which prefetches and routes client-side.
- evidence: TodayEntry.tsx: `<a href="/settings">settings</a>` appears twice — once in the main prereq hint (around line 219) and once in the focus overlay prereq hint (around line 282). all nav links use `<Link href="...">` from 'next/link'.
- suggested fix: replace both `<a href="/settings">` instances in TodayEntry.tsx with `<Link href="/settings">` (importing Link from 'next/link') to restore consistent client-side routing.
- source: browser
- resolution: replaced both instances with `<Link href="/settings">` and added Link import in TodayEntry.tsx. Shipped at 2082b89.

### [x] [LOW] /settings — meta description enumerates field names without a descriptive sentence
- pass: 21 (commit 737e7d7)
- viewport: both
- category: seo
- observation: the /settings page exports `description: 'display name, timezone, prompt variety, public username'` — a bare comma-separated list of field labels. a search-engine snippet or bookmark tooltip for /settings shows only control names with no context about what the page does or why a user would visit it. compare /today ("today's prompt and your daily writing space.") and /log ("your writing log — prompts, responses, and the entries you have published over the past 60 days.") — both describe page purpose.
- evidence: meta description: "display name, timezone, prompt variety, public username" — no sentence form, no purpose signal.
- suggested fix: replace with a sentence: "account settings for your writing practice — display name, timezone, prompt variety, and public username." or similar that conveys purpose alongside the field list.
- source: browser
- resolution: changed description to 'account settings for your writing practice — display name, timezone, prompt variety, and public username.' in src/app/settings/page.tsx. Shipped at e0a3a2b.

### [x] [MED] /settings — no unsaved-changes guard when navigating away
- pass: 19 (commit fc34abc)
- viewport: both
- category: comprehension
- observation: the settings form provides no indication of unsaved changes and no route-leave warning. a user who edits fields and navigates away without saving loses their changes silently. /today implements a window.onbeforeunload guard for unsaved entries; /settings has no equivalent, creating an inconsistent safety model across the two primary edit surfaces.
- evidence: src/app/settings/SettingsForm.tsx formFoot renders the save button with no dirty-state indicator and no route-change guard; contrast with TodayEntry.tsx which sets window.onbeforeunload when the textarea has content and saveState is 'idle' or 'error'.
- suggested fix: track whether any field value differs from its initially-loaded profile value and either show an 'unsaved changes' indicator near the save button or add a window.onbeforeunload guard that fires when the form is dirty, mirroring the /today pattern.
- source: browser
- resolution: added savedSnapshotRef + isDirty logic + window.onbeforeunload guard in SettingsForm.tsx; 2 unit tests added. Shipped at 5da280f.

### [x] [LOW] /today — date paragraph has no programmatic association with the prompt H1
- pass: 19 (commit fc34abc)
- viewport: both
- category: a11y
- observation: the page renders the date string (e.g. "Thu 28 May 2026") as a plain <p> element immediately before the prompt H1. the date contextualises the H1 but has no semantic relationship to it — no aria-describedby on the H1 and no hgroup wrapper. a screen reader user encounters the date as an unrelated body paragraph before the page's H1, with no signal that the date is the heading's temporal context.
- evidence: src/app/today/page.tsx: <p className={styles.dateStamp}>{displayDate}</p> followed immediately by <h1 className={styles.prompt}>{prompt}</h1> — no association element present.
- suggested fix: wrap both elements in <hgroup> so AT understands the date as supplementary context for the heading, or add aria-describedby on the H1 pointing to the dateStamp paragraph's id.
- source: browser
- resolution: added id="today-date" to date <p> and aria-describedby="today-date" to prompt <h1> in src/app/today/page.tsx. Shipped at 4ccd1b3.

### [x] [LOW] / — full sentence wrapped in <em>, applying spoken stress to a plain declaration
- pass: 19 (commit fc34abc)
- viewport: both
- category: voice
- observation: the closing paragraph wraps the entire sentence "ember does not personalize your morning." in an <em> element. screen readers voice <em> with stress inflection. the voice guide specifies plain, settled statements of value; wrapping a complete declarative sentence in emphasis applies editorial pressure that conflicts with the understated register of the surrounding copy.
- evidence: src/app/page.tsx: <p>the same prompt and task arrive for everyone on a given day. <em>ember does not personalize your morning.</em></p>
- suggested fix: remove the <em> wrapper and let the sentence stand as plain text, consistent with the rest of the closing paragraph.
- source: browser
- resolution: removed <em> wrapper from "ember does not personalize your morning." in src/app/page.tsx. Shipped at d4a139f.

### [x] [LOW] /today — "your last seven days" heading implies an existing record for a new user
- pass: 19 (commit fc34abc)
- viewport: both
- category: voice
- observation: the day strip section is headed "your last seven days" regardless of whether the user has written anything. for a first-time user whose strip shows seven consecutive "no entry" states, the possessive heading implies ownership of a history that does not yet exist. the heading is technically accurate but the "your" framing presupposes content, inconsistent with the voice guide's observational register.
- evidence: src/app/today/DayStrip.tsx: <h2 className={styles.stripLabel}>your last seven days</h2>; authenticated capture shows all seven strip days as "no entry".
- suggested fix: change to "the last seven days" to describe the time window without the possessive.
- source: browser
- resolution: changed heading to "the last seven days" in src/app/today/DayStrip.tsx. Shipped at e016982.

### [x] [LOW] / — "your responses accumulate" addresses a visitor who has no responses yet
- pass: 19 (commit fc34abc)
- viewport: both
- category: voice
- observation: the sub-pitch paragraph reads "over weeks, your responses accumulate into a quiet personal log." for an anonymous first-time visitor, "your responses" presupposes a writing history that does not exist. this is a separate phrase from the standing "your log" finding — it appears earlier in the same paragraph and uses a different possessive noun.
- evidence: body text: "one small prompt and one tiny task each morning. you write a few sentences in response, mark the task done if you did it, and move on. over weeks, your responses accumulate into a quiet personal log."
- suggested fix: remove the possessive: "over weeks, responses accumulate into a quiet personal log." — describes the feature without assuming an existing account.
- source: browser
- resolution: removed possessive "your" from "your responses accumulate" in src/app/page.tsx. Shipped at 7fbde80.

### [LOW] /signin — post-submission confirmation appends redundant password reassurance
- pass: 19 (commit fc34abc)
- viewport: both
- category: comprehension
- observation: when the sign-in link has been sent, the page renders "a sign-in link is on its way. no password required." the password reassurance was already visible pre-submission in the form's reassurance line ("no password. no other mail."). repeating it in the confirmed state — when the user is focused on retrieving their email — is redundant, and the <em> emphasis increases its salience at an odd moment.
- evidence: src/app/signin/page.tsx: state === 'sent' renders <p>a sign-in link is on its way. <em>no password required.</em></p>
- suggested fix: remove "no password required." from the confirmation state; "a sign-in link is on its way." is sufficient post-submission copy.
- source: browser

### [x] [MED] /today — save button carries no description; privacy of saved-but-unpublished entries is unstated
- pass: 18 (commit 6c01dc8)
- viewport: both
- category: comprehension
- observation: the publish toggle has an inline description ("when published, this entry appears on your public profile.") explaining its effect on visibility. the save button has no equivalent description. a first-time user cannot determine whether an entry that is saved without publishing is stored privately or visible elsewhere. the only copy addressing visibility is scoped to the publish toggle; the default state — saved, not published — is never described.
- evidence: capture text: "publish / when published, this entry appears on your public profile. / focus / save" — save appears as a bare label with no adjacent description in either main or focus-overlay view.
- suggested fix: add a short description near the save action, e.g. "entries are saved privately by default." to close the visibility gap for users who save without publishing.
- source: browser
- resolution: added title="entries are saved privately by default." to both save buttons (main view and focus overlay) in TodayEntry.tsx. Shipped at ac5aee3.

### [x] [MED] /today — no signal that entries are not auto-saved; navigation away silently discards unsaved work
- pass: 18 (commit 6c01dc8)
- viewport: both
- category: comprehension
- observation: the page requires an explicit press of "save" to persist an entry. no copy or ui pattern informs the user that the entry is not saved automatically. a user who writes a response and then navigates to /log or /settings without pressing save would lose their work with no warning. the blank idle save-state indicator correctly shows nothing before typing but provides no guidance after writing begins.
- evidence: capture shows "save" as the sole persistence action with no "unsaved changes" notice, no auto-save mention, and no navigation-away guard visible on the /today page.
- suggested fix: add a route-change guard warning when the textarea has unsaved content, or add a brief note near the save button such as "entries are not saved automatically." to set the user's expectation.
- source: browser
- resolution: added window.onbeforeunload handler in TodayEntry.tsx — fires when saveState is 'idle' or 'error' and textarea is non-empty; cleared on successful save, empty textarea, or unmount. Shipped at bdcd692.

### [x] [LOW] /today — nav links carry no aria-current marker identifying the active page
- pass: 18 (commit 6c01dc8)
- viewport: both
- category: a11y
- observation: the authenticated navigation renders "today / log / settings" identically across all three pages. no aria-current="page" attribute is applied to the link matching the current route. sighted users infer location from page content; screen reader users traversing the nav have no programmatic signal indicating which page is active.
- evidence: all three page captures show the same nav text "today / log / settings" with no active-state differentiation; no aria-current is inferable from any capture.
- suggested fix: add aria-current="page" to the nav anchor matching the current route in the shared navigation component, conditioned on the active pathname.
- source: browser
- resolution: false positive — all three authenticated pages already carry `aria-current="page"` on the active nav link (today/page.tsx:65, log/page.tsx:74, settings/page.tsx:40). The critique text-capture reader cannot see HTML attributes; the attribute is present. No code change required.

### [x] [LOW] / — "the link arrives once" is ambiguous before any link has been sent
- pass: 18 (commit 6c01dc8)
- viewport: both
- category: comprehension
- observation: in the home-page footer CTA, "the link arrives once" appears before a visitor has entered their email. "once" is ambiguous: it could mean the system sends exactly one link per request (the intended meaning) or that only one link is ever issued to an address across all time. a first-time visitor who misses or does not receive the link may read this as meaning the opportunity is permanently spent.
- evidence: footer CTA: "today's prompt is waiting. entering an email address for the first time creates an account. the link arrives once. no password is set. no other mail is sent."
- suggested fix: replace "the link arrives once" with per-request language, e.g. "a link is sent each time this form is submitted." — or drop the clause entirely, since single-send-per-request is implicit in a magic-link flow.
- source: browser
- resolution: removed "the link arrives once." from the CTA footer span in src/app/page.tsx. Shipped at a595d0f.

### [x] [LOW] / — "your log" referenced before the visitor has created an account
- pass: 18 (commit 6c01dc8)
- viewport: both
- category: comprehension
- observation: the reassurance paragraph closes with "your log shows what is, not what isn't." a first-time visitor has no log — the possessive "your" presupposes an existing account and record. the sentence is designed as reassurance but lands as an abstraction with no concrete referent for someone who has never used ember.
- evidence: body text: "there are no streaks to break, no reminders to dismiss, no notifications to mute. forgetting a day is fine. your log shows what is, not what isn't."
- suggested fix: remove the possessive to de-anchor from an assumed account: "the log shows what is, not what isn't." — preserves the reassurance without implying the visitor already has a record.
- source: browser
- resolution: changed "your log shows what is" to "the log shows what is" in src/app/page.tsx. Shipped at 1c6a9c6.

### [LOW] / — home meta description is the brand tagline with no product-category keyword
- pass: 18 (commit 6c01dc8)
- viewport: both
- category: seo
- observation: the home page meta description is "ten minutes of intention before the day swallows you" — identical to the visible lede. it contains no word from the functional product vocabulary (writing, ritual, daily, prompt, log) that appears in the page title. a search-results reader scanning snippets gets no indication of what the site does; the description reads as a motivational tagline with no product-category terms.
- evidence: meta description: "ten minutes of intention before the day swallows you" — page title: "ember — a daily writing ritual"; none of those title terms appear in the description.
- suggested fix: extend or replace the description to anchor the product category, e.g. "ember is a daily writing ritual — one prompt and one small task each morning." keeps the tone while adding terms a search-snippet reader can act on.
- source: browser

### [x] [LOW] / — product description contains embedded second-person imperative clause
- pass: 17 (commit 21ebca6)
- viewport: both
- category: voice
- observation: the introductory paragraph reads "you write a few sentences in response, mark the task done if you did it, and move on." — the clause "mark the task done" is an imperative verb form embedded in what is otherwise a descriptive series using "you write... and move on." the voice guide prohibits second-person imperative copy outside quoted text. a first-time reader could receive this as a directive rather than a description.
- evidence: body text: "one small prompt and one tiny task each morning. you write a few sentences in response, mark the task done if you did it, and move on." — "mark the task done" uses imperative mood mid-sentence.
- suggested fix: reframe as fully descriptive: "one small prompt and one tiny task each morning. a few sentences in response, the task marked if it happened, and the day continues." — removes the imperative verb while preserving the meaning.
- source: browser
- resolution: changed sub-pitch to "a few sentences in response, the task marked if it happened, and the day continues." in src/app/page.tsx. Shipped at 6b618e3.

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

### [x] [LOW] /today — task-done button has no hover tooltip while adjacent controls do
- pass: 17 (commit 21ebca6)
- viewport: desktop
- category: comprehension
- observation: the publish toggle carries title="when published, this entry appears on your public profile." and the focus button carries title="enters a distraction-free writing view." — both complete sentences with periods, per the voice guide. the task-done button is the only control in the group without a title attribute; a sighted user hovering over it receives no tooltip.
- evidence: /today controls row: "publish / focus / save" alongside the task-done button — the task-done button's visible label changes state (done / not done) but carries no hover description consistent with the adjacent controls.
- suggested fix: add title="marks today's tiny task as done." (and title="marks today's tiny task as not done." when already marked) to the task-done button in TodayEntry.tsx, consistent with the voice guide requirement for complete-sentence tooltip copy.
- source: browser
- resolution: added dynamic title attribute to the task-done button in TodayEntry.tsx. Shipped at 156c342.

### [x] [MED] / — "sign in" CTA gives no signal that it is also the account-creation path
- pass: 16 (commit 27718e9)
- viewport: both
- category: comprehension
- observation: the landing page CTA is labelled "sign in" with no surrounding copy acknowledging that ember uses a single magic-link flow for both new and returning visitors. a first-time visitor who has never used the product sees "sign in" and may assume an account already exists — there is no "create account", "get started", or onboarding signal to indicate that entering an email for the first time is how an account is created.
- evidence: footer CTA text: "today's prompt is waiting. the link arrives once. no password is set. no other mail is sent. sign in" — "the link arrives once" presupposes a prior send that has not occurred for a first-time visitor.
- suggested fix: add a single declarative line near the CTA explaining the combined flow, e.g. "entering your email for the first time creates your account." — no second-person imperative required.
- source: browser
- resolution: added "entering an email address for the first time creates an account." before the link-arrival trust signal in the CTA copy in src/app/page.tsx. Shipped at 631bd72.

### [x] [LOW] / — "no password is set" phrasing differs from sign-in page's "no password"
- pass: 16 (commit 27718e9)
- viewport: both
- category: voice
- observation: the home page footer CTA uses "no password is set. no other mail is sent." while the sign-in page uses the shorter "no password. no other mail." for the same reassurance. the passive-voice "is set" on the home page introduces a slightly different register and a word that is absent on the sign-in page, creating a minor cross-page inconsistency in how the passwordless model is described.
- evidence: home footer: "no password is set. no other mail is sent." — /signin helper: "no password. no other mail."
- suggested fix: normalise the home page footer to "no password. no other mail is sent." or adopt the sign-in page's shorter form throughout.
- source: browser
- resolution: changed "no password is set. no other mail is sent." to "no password. no other mail." in src/app/page.tsx. Shipped at 0941397.

### [x] [LOW] /today — textarea placeholder "take your time." is second-person imperative
- pass: 16 (commit 27718e9)
- viewport: both
- category: voice
- observation: both the main textarea and the focus-overlay textarea carry the placeholder text "take your time." — a second-person imperative instruction. the voice guide explicitly prohibits second-person imperative copy. the placeholder is visible to any user whose textarea is empty and focused.
- evidence: src/app/today/TodayEntry.tsx: placeholder="take your time." appears on both the main-view textarea and the focus-overlay textarea.
- suggested fix: replace with an impersonal declarative such as "there is no rush." or remove the placeholder entirely and let the "your response" label above the field carry the framing.
- source: browser
- resolution: changed placeholder to "there is no rush." on both main and focus-overlay textareas in src/app/today/TodayEntry.tsx. Shipped at ddafc86.

### [x] [LOW] /today — focus-mode overlay renders aria-modal="false" when inactive
- pass: 16 (commit 27718e9)
- viewport: both
- category: a11y
- observation: the focus-mode overlay uses aria-modal={isFocus}, which serialises to aria-modal="false" when focus mode is inactive. the ARIA spec does not define a false state for aria-modal — the attribute should be absent when the dialog is not modal, not set to "false". the overlay is simultaneously aria-hidden="true" when inactive so practical impact on screen readers is limited, but the pattern diverges from the spec and may trigger warnings in axe-core.
- evidence: src/app/today/TodayEntry.tsx line 204: aria-modal={isFocus} — when isFocus is false this produces aria-modal="false" on the div.
- suggested fix: change to aria-modal={isFocus || undefined} so the attribute is absent rather than explicitly false when focus mode is not active.
- source: browser
- resolution: changed aria-modal={isFocus} to aria-modal={isFocus || undefined} in src/app/today/TodayEntry.tsx. Shipped at 4db7e74.

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

### [x] [LOW] /signin — post-submission confirmation uses second-person imperative
- pass: 14 (commit e748b34)
- viewport: both
- category: voice
- observation: the confirmation state (after the link is sent) reads "check your email. a sign-in link is on its way." — "check your email" is a second-person imperative instruction, which the voice guide explicitly prohibits. the rest of the sign-in page avoids direct address.
- evidence: src/app/signin/page.tsx line 55: `check your email. a sign-in link is on its way.` — rendered when state === 'sent'.
- suggested fix: reframe as an observation: "a sign-in link is on its way." — removes the imperative while preserving the useful information.
- source: browser
- resolution: changed confirmation text to "a sign-in link is on its way." in src/app/signin/page.tsx. Shipped at ad55037.

### [LOW] /signin — email input placeholder uses second-person example address
- pass: 14 (commit e748b34)
- viewport: both
- category: voice
- observation: the email input carries the placeholder "you@somewhere.com" — a second-person illustrative address. the display name placeholder on /settings ("how you appear on your public profile") is already a pending finding; this is a separate instance of the same pattern on a different page.
- evidence: src/app/signin/page.tsx line 69: `placeholder="you@somewhere.com"` — the only second-person reference on the form outside the reassurance line.
- suggested fix: change to a neutral placeholder such as "email address" or remove the placeholder entirely, relying on the visible "email" label above the field.
- source: browser

### [x] [LOW] / — OG image alt attribute carries brand name only, no descriptive text
- pass: 14 (commit e748b34)
- viewport: both
- category: seo
- observation: the root layout sets the OG image alt to the bare string "ember" with no descriptive phrase. if the image fails to render in a social card preview or is read by an assistive tool, the alt conveys only the brand name and nothing about the page content.
- evidence: src/app/layout.tsx line 48: `{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ember' }` — no descriptive phrase accompanies the brand name.
- suggested fix: expand the alt to match the page description: "ember — a daily writing ritual" so the OG image carries the same context as the page title.
- source: browser
- resolution: changed alt to 'ember — a daily writing ritual' in src/app/layout.tsx openGraph images. Shipped at bb32ff9.

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

### [x] [MED] /today — publish toggle active with no hint that a public username is required
- pass: 13 (commit 4f08c21); severity raised pass 21 — independent reader re-identified as significant
- viewport: both
- category: comprehension
- observation: the publish toggle appears on /today whether or not the user has set a public username in settings. toggling it without a username stores a published state in the database but the entry will not appear publicly because there is no /u/username route. there is no hint at the point of use that a username is a prerequisite.
- evidence: /today shows the full publish toggle with "this entry will appear on your public profile." while /settings shows no username value in the public username field.
- suggested fix: when no public username is saved, render the publish toggle as disabled or add a note inline: "set a username in settings for entries to appear on your profile."
- source: browser
- resolution: added hasUsername prop to TodayEntry; renders declarative prereq hint below publish toggle when no username is set. Shipped at bceeb20.

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

### [x] [LOW] /log — page meta description is minimal and does not describe content
- pass: 12 (commit 997e3b1)
- viewport: both
- category: seo
- observation: the /log page meta description reads "your past 60 days" — technically accurate but does not describe the page's content or purpose to someone arriving from a search result or bookmark. it names the data window but not what the page shows.
- evidence: title: "ember · log"; description: "your past 60 days"
- suggested fix: expand to describe the page's content, e.g. "a record of your past 60 days of writing — prompts, responses, and the entries you have published."
- source: browser
- resolution: updated description in src/app/log/page.tsx to 'your writing log — prompts, responses, and the entries you have published over the past 60 days.' Shipped at a29ff1f.

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

### [x] [LOW] /signin — sign-in page gives no destination context after email submission
- pass: 7 (commit 69def1e)
- viewport: both
- category: comprehension
- observation: the sign-in page confirms an email link will be sent and notes "sign-in links expire after 24 hours." but never tells the user where that link takes them. a first-time visitor has no frame of reference for what the logged-in experience looks like before clicking.
- evidence: "we email you a sign-in link. no password, no spam." / "sign-in links expire after 24 hours." — no destination copy
- suggested fix: add one sentence to the footer, e.g. "the link opens your daily prompt directly." — closes the post-submit loop.
- source: browser
- resolution: added "the link opens today's prompt directly." to the sent-state confirmation in src/app/signin/page.tsx. Shipped at 97821b2.

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

### [x] [MED] / — root layout and /signin missing alternates.canonical
- pass: 44 (commit 6441e65)
- viewport: both
- category: seo
- observation: neither the root layout nor the /signin layout sets alternates.canonical, so next.js emits no <link rel="canonical"> tag on either anonymous-facing page. the public-profile routes at /u/[username] and /u/[username]/[date] both set alternates.canonical explicitly. the site is served at a vercel preview hostname as well as the production url; without a canonical tag, search engines may split indexing across the two hostnames.
- evidence: src/app/layout.tsx: metadata export has no alternates key. src/app/signin/layout.tsx: same. src/app/u/[username]/page.tsx: alternates: { canonical: url } — present for public-profile routes only.
- suggested fix: add alternates: { canonical: siteUrl } to the metadata export in src/app/layout.tsx and alternates: { canonical: `${siteUrl}/signin` } to src/app/signin/layout.tsx, matching the pattern already used on /u/[username].
- source: browser
- resolution: added alternates: { canonical: siteUrl } to src/app/layout.tsx and alternates: { canonical: '/signin' } to src/app/signin/layout.tsx. Shipped at 73e062b.

### [LOW] /signin — layout sets no openGraph or twitter override
- pass: 44 (commit 6441e65)
- viewport: both
- category: seo
- observation: the /signin layout exports only title and description; it sets no openGraph or twitter keys. next.js merges from the root layout for any unset keys, so a social share of the /signin url surfaces the root og:title "ember · a daily writing ritual" and og:url pointing to the root path — neither reflects the sign-in page. every other page with its own layout (settings, log, today, u/[username]) overrides og metadata for its context.
- evidence: src/app/signin/layout.tsx: metadata export contains title and description only — no openGraph or twitter keys. src/app/layout.tsx openGraph.title: "ember · a daily writing ritual", openGraph.url: siteUrl.
- suggested fix: add an openGraph block to src/app/signin/layout.tsx with title, url, and description matching the signin page, so a social share of the signin url produces an accurate open graph card.
- source: browser

### [x] [LOW] / — seven-day preview section unnamed; not exposed as landmark
- pass: 44 (commit 6441e65)
- viewport: both
- category: a11y
- observation: the seven-day preview is wrapped in <section className={styles.seven}> with no aria-label or aria-labelledby attribute. per the aria spec a section without an accessible name is not exposed as a named region landmark. the section contains an h2 "the next seven days" but the h2 does not grant landmark status to the enclosing section without an explicit aria-labelledby association. the identical pattern was corrected on /today for the day-strip section in a prior pass; the landing-page section was not updated in parallel.
- evidence: src/app/page.tsx: <section className={styles.seven}> — no aria-label or aria-labelledby. the contained h2 "the next seven days" has no id for association. compare the day-strip fix in DayStrip.tsx: <section id="day-strip" aria-labelledby="day-strip-heading">.
- suggested fix: add id="seven-days-heading" to the h2 element and aria-labelledby="seven-days-heading" to the section element, exposing the seven-day preview as a named landmark region consistent with the /today day-strip fix.
- source: browser
- resolution: added aria-labelledby="seven-days-heading" to <section className={styles.seven}> and id="seven-days-heading" to the H2 in src/app/page.tsx; landmark test added to LandingPage.test.tsx. Shipped at e929d2b.

### [LOW] / — sign-in cta aside contains no heading element
- pass: 44 (commit 6441e65)
- viewport: both
- category: a11y
- observation: the sign-in cta is an <aside aria-label="sign in"> landmark reachable by landmark navigation but contains no heading element. at users navigating by heading cannot reach the aside's content; they can only enter it by landmark shortcut and then read linearly. the first sentence of the aside copy ("today's prompt is waiting.") functions as a contextual title but is marked as a <p> element.
- evidence: src/app/page.tsx: <aside className={styles.cta} aria-label="sign in"> contains <div className={styles.ctaInner}> with <p className={styles.ctaCopy}> and <Link>. no heading element is present inside the aside.
- suggested fix: add a visually-hidden heading such as <h2 className="sr-only">sign in</h2> inside the aside so the cta region is reachable by both landmark and heading navigation.
- source: browser

### [LOW] /settings — page has no sub-headings for individual setting groups
- pass: 44 (commit 6441e65)
- viewport: both
- category: a11y
- observation: the settings page has a single h1 ("settings") and no sub-headings for the four distinct setting groups (display name, timezone, prompt variety, public username). each group is introduced only by its form label element. screen reader users navigating by heading see only the page title and cannot jump directly to a specific setting group.
- evidence: body text: "settings" (h1) followed by "display name", "timezone", "prompt variety", "public username" — each as a label element, not a heading. no h2 or fieldset/legend structure visible.
- suggested fix: wrap each setting group in a fieldset with a legend, or add a visually-muted h2 above each group, so heading-based navigation reaches individual groups directly.
- source: browser

### [LOW] / — mosaic preview has no visible caption for sighted users
- pass: 44 (commit 6441e65)
- viewport: both
- category: comprehension
- observation: the mosaic tile grid appears between the lede and the seven-day list with no adjacent caption or label visible to sighted users. the grid is the only graphic on the page but first-time visitors have no text cue explaining what the tile pattern represents. the aria-label "60 days of practice" is at-only. a sighted visitor sees an unlabeled tile pattern with no context before reaching the seven-day list.
- evidence: src/app/page.tsx: <section className={styles.previewMark}><MosaicPreview /></section> — no adjacent <p>, <figcaption>, or visible text label in the containing section. desktop and mobile captures show the mosaic between the hero and the seven-day preview with no visible annotation.
- suggested fix: add a short visible caption in the previewMark section, e.g. a <p> reading "the log, over time." so sighted first-time visitors understand the graphic's meaning without relying on the at-only aria-label.
- source: browser

### [x] [MED] /log — "59 days quiet" stat line implies a performance score; contradicts "a missed day leaves no mark" philosophy
- pass: 57 (commit ee8ddd0)
- viewport: both
- category: voice
- observation: the /log summary reads "1 day written. 59 days quiet. 0 days published." placing the quiet-day count as a headline figure alongside written days renders the two as a comparative score. the landing page and bearings.md both state "a missed day leaves no mark" and "the log shows what is, not what isn't." a stat line that reports 59 quiet days is the opposite — it shows exactly what isn't. a new user with one entry reads their log as 1 written vs 59 absent, which is soft streak-shaming through arithmetic.
- evidence: authenticated /log capture: "1 day written. 59 days quiet. 0 days published." — the quiet-day count is derived and prominently displayed.
- suggested fix: remove the "N days quiet" figure from the stat line. show only "N days written. N days published." so the line reports practice without counting absence.
- source: browser
- issue: #61
- resolution: removed `const quiet` and the quiet span from /log stat line in src/app/log/page.tsx. Shipped at 0cf2771.

### [LOW] /today — save timestamp "last saved · 06:36" shows time only; no date context when session persists across midnight
- pass: 57 (commit ee8ddd0)
- viewport: both
- category: comprehension
- observation: the save indicator on /today shows "last saved · 06:36" — a clock time with no date qualifier. a user who leaves the tab open overnight, or who opens the page after midnight before the prompt rolls over, cannot distinguish today's save from a prior session's autosave. the ambiguity is bounded (the page is entry-per-day), but the site's register of careful precision makes a bare time stamp feel incomplete.
- evidence: authenticated /today capture: "last saved · 06:36" — time only, no relative date ("today" / "yesterday").
- suggested fix: when the save timestamp's date is the current calendar day, show the time only; when it is a prior day, append a short qualifier: "last saved · 06:36 yesterday" or "last saved · 06:36, Sun 14 Jun". today is the common case so this change only activates in the edge case.
- source: browser

### [LOW] /log — "private" label on entry listing is free-floating text with no programmatic association to its entry
- pass: 57 (commit ee8ddd0)
- viewport: both
- category: a11y
- observation: the /log entry list item ends with the word "private" as a trailing label. in the accessible text stream it appears after the entry preview and before "showing the most recent. browse by date" — spatially ambiguous and not linked to the entry element via aria-describedby or similar. a screen reader user moving through entries by article or heading would encounter "private" as orphaned text.
- evidence: authenticated /log capture: "e2e write test — today (edited)\n\nshowing the most recent. browse by date\nprivate" — "private" trails the next paragraph rather than the entry element.
- suggested fix: associate the "private" badge with its parent entry container via aria-describedby, or wrap it in a <span> with a visually-hidden context prefix ("visibility: private") placed inside the article element it describes.
- source: browser

### [LOW] /settings — "personalized" prompt description does not state the minimum entry threshold
- pass: 57 (commit ee8ddd0)
- viewport: both
- category: comprehension
- observation: the prompt variety option reads "personalized: a unique prompt generated from recent entries. falls back to a standard prompt until entries exist." "until entries exist" is vague — a user with one entry cannot tell whether personalisation is active or whether the fallback is still in use. the setting appears consequential but offers no signal about when it actually activates.
- evidence: authenticated /settings capture: "personalized: a unique prompt generated from recent entries. falls back to a standard prompt until entries exist."
- suggested fix: specify a concrete threshold, e.g. "personalized: a unique prompt generated from your recent entries. requires a few entries to take effect — uses the standard prompt until then." if the threshold is defined in code, echo it here.
- source: browser

### [x] [MED] /signin — submit button has no :focus-visible rule; keyboard focus invisible on sign-in form
- pass: 58 (commit a9827d4)
- viewport: both
- category: a11y
- observation: the submit button ("send link.") on /signin has no :focus or :focus-visible rule. tailwind v4 preflight resets browser default outlines. a keyboard user tabbing to the button sees no visible focus indicator. the email input received an outline fix at bd69812 and the landing page ctaBtn received :focus-visible at 32c93fb, but the submit button in page.module.css was not updated in either pass.
- evidence: src/app/signin/page.module.css: no :focus or :focus-visible rule on .submit. compare .fieldInput:focus { outline: 2px solid var(--color-accent); outline-offset: 2px; } and landing page .ctaBtn:focus-visible added at 32c93fb.
- suggested fix: add .submit:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; } to src/app/signin/page.module.css, consistent with the pattern on .fieldInput and .ctaBtn.
- source: browser
- resolution: added .submit:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; } to src/app/signin/page.module.css. Shipped at f571cbb.

### [x] [MED] /settings — daily reminder "off" radio aria-describedby points to description of the active ("on") behavior
- pass: 58 (commit a9827d4)
- viewport: both
- category: a11y
- observation: both "off" and "on" radio inputs for the daily reminder share aria-describedby pointing to the same paragraph id. that paragraph describes the active-reminder behavior ("a quiet email at your chosen time to write today's entry. never sent if you have already written."). screen readers announcing the "off" option speak text that explains what happens when the reminder is on, not when it is disabled — misleading users who select "off".
- evidence: src/app/settings/SettingsForm.tsx: both off and on radio inputs carry aria-describedby="desc-reminder-off". the paragraph at id="desc-reminder-off" reads "a quiet email at your chosen time to write today's entry. never sent if you have already written." — active-state behavior, not the no-reminder state.
- suggested fix: give each radio its own description: id="desc-reminder-off" paragraph text "no reminder email will be sent." on the off radio; a separate id="desc-reminder-on" paragraph describing active behavior on the on radio; update aria-describedby on each radio accordingly.
- source: browser
- resolution: changed desc-reminder-off text to "no reminder email will be sent."; added desc-reminder-on with active copy; updated on-radio aria-describedby to desc-reminder-on. Also fixed identical pattern for weekly reflection (pass 59). Shipped at b08765f.

### [x] [MED] /today — focus-mode check-in and tags inputs have no accessible descriptions; hint paragraphs hidden by aria-hidden
- pass: 58 (commit a9827d4)
- viewport: both
- category: a11y
- observation: when focus mode is active, the main entry section receives aria-hidden, removing hint paragraphs for check-in ("optional. a mood or weather word for this day.") and tags ("optional. up to five tags, comma-separated.") from the AT tree. the focus-overlay inputs for both fields have no aria-describedby, so screen readers in focus mode have no accessible description of either input's purpose or constraints.
- evidence: src/app/today/TodayEntry.tsx: focus-overlay check-in input and tags input (approximately lines 315–344) have no aria-describedby. hint paragraphs with the relevant descriptions are inside <section aria-hidden={isFocus || undefined}> (line 184), which hides them from AT when focus mode is active.
- suggested fix: add hint paragraphs inside the focus overlay (with ids such as "focus-checkin-desc" and "focus-tags-desc") and add matching aria-describedby attributes to the corresponding focus-mode inputs.
- source: browser
- resolution: added aria-describedby="focus-checkin-desc" and aria-describedby="focus-tags-desc" to overlay inputs; added duplicate hint paragraphs inside the focus overlay in TodayEntry.tsx. Shipped at 22b0bcd.

### [x] [MED] /log — "all entries" link implies an archive but navigates to the single most-recent entry's dated page
- pass: 58 (commit a9827d4)
- viewport: both
- category: navigation
- observation: the section footer below the most-recent entry card reads "showing the most recent. all entries" where "all entries" is a link. the label implies a full archive listing, but the link resolves to /log/${recentDate} — a single dated-entry detail page. a first-time user clicking "all entries" expecting a full log index reaches one entry instead.
- evidence: authenticated /log capture: "showing the most recent. all entries". src/app/log/page.tsx line 218: <Link href={`/log/${recentDate}`}>all entries</Link> — recentDate is the most recent entry date, resolving to a single page.
- suggested fix: change the link text to "view entry" or the specific date (e.g. "Mon 15 Jun") to accurately describe the destination; "all entries" implies an index that does not exist at that URL.
- source: browser
- issue: #66
- resolution: changed link text from "all entries" to "full entry" in src/app/log/page.tsx. Shipped at 74143b7.

### [LOW] /log — search input aria-label "search your entries" overrides visible label; introduces second-person "your"
- pass: 58 (commit a9827d4)
- viewport: both
- category: a11y
- observation: the log search field has both a visible <label> ("search entries") and an aria-label="search your entries" on the input. aria-label wins in accessible name computation, making the visible label irrelevant to screen readers. the two strings are inconsistent, and the aria-label introduces second-person "your" absent from the visible label — contrary to the voice guide.
- evidence: src/app/log/LogSearch.tsx: <label htmlFor="log-search">search entries</label> as visible label; aria-label="search your entries" on the input overrides it for AT. the visible label and AT-computed name diverge.
- suggested fix: remove aria-label from the input and rely solely on the programmatically-associated <label>; "search entries" is sufficient and consistent with the visible UI without introducing second-person copy.
- source: browser

### [LOW] / — "the next seven days" section heading includes today; heading implies future-only content
- pass: 58 (commit a9827d4)
- viewport: both
- category: comprehension
- observation: the seven-day preview section heading reads "the next seven days" but the first item in the list is today's prompt, not tomorrow's. the list spans today through six future days (7 items total, starting with "today / Mon 15 Jun"). "next" implies future-only to a first-time visitor, who would not expect today's prompt to appear under that heading.
- evidence: anonymous capture: "the next seven days ... today\nMon 15 Jun\nwhat part of your day do you look forward to..." — today is the first item in the list under the heading. prompt label logic: index 0 is labeled "today", included in the seven-item preview.
- suggested fix: change the heading to "the coming week" or "seven days of prompts" to describe a list that begins with today without implying future-only content.
- source: browser

## Done

### [x] [LOW] /signin — submit button label "send the link" uses definite article before any link exists
- pass: 43 (commit 5e1498c)
- viewport: both
- category: comprehension
- observation: the submit button reads "send the link." the definite article "the" presupposes a previously established referent, but the surrounding reassurance copy uses the indefinite article: "a sign-in link is sent to this address." for a first-time visitor the button implies a specific known link rather than the one they are about to request. the article mismatch is subtle but creates a small semantic inconsistency in the form's register.
- evidence: body text: "send the link" — adjacent reassurance: "a sign-in link is sent to this address. it expires after 24 hours. no password. no other mail." — "a" in the description and "the" in the button label are at odds.
- suggested fix: change the button label to "send a link" to match the indefinite framing of the surrounding reassurance copy.
- source: browser
- resolution: changed button label from "send the link" to "send a link" in src/app/signin/page.tsx. Shipped at 41d6df7.

### [x] [MED] /today — focus mode overlay lacks focus trap; Tab exits active dialog into obscured main content
- pass: 37 (commit 562a795)
- viewport: both
- category: a11y
- observation: the focus mode overlay uses role="dialog" and aria-modal={isFocus} but none of the interactive elements in the main form — the response textarea, publish checkbox, focus trigger button, and save button — have their tabIndex set to -1 when focus mode is active. a keyboard user who opens focus mode can Tab out of the overlay into the main form elements, which are visually obscured by the overlay but remain in the tab order. aria-modal alone is insufficient: NVDA+Firefox does not implement it, so screen reader users on that pairing can navigate outside the dialog boundary.
- evidence: src/app/today/TodayEntry.tsx:232–234 — `aria-hidden={!isFocus}` `aria-modal={isFocus}` on overlay; main textarea at ~line 178 and buttons at ~lines 196, 203 have no conditional tabIndex management.
- suggested fix: when isFocus is true, set tabIndex={-1} on the main response textarea, publish checkbox, focus trigger button, and save button so keyboard focus is contained within the overlay until focus mode is exited.
- source: browser
- resolution: added tabIndex={isFocus ? -1 : undefined} to task-done button, main response textarea, publish checkbox, focus trigger button, main save button, and settings link in TodayEntry.tsx; two FocusMode tests verify enter/exit behavior. Shipped at 8e9244f.

### [x] [LOW] /today — offline save indicator "saved locally — will sync" is a sentence fragment with no terminal period
- pass: 35 (commit 2dad7ef)
- viewport: both
- category: voice
- observation: the offline save indicator returns "saved locally — will sync" — a fragment with no terminal period and no finite verb. the other four save indicator strings all carry terminal periods: "saving.", "saved.", "draft restored.", "not yet saved." the offline string is inconsistent with the pattern established across the same function.
- evidence: src/app/today/TodayEntry.tsx:146: `if (!isOnline && saveState !== 'saved') return 'saved locally — will sync'` — no period. compare surrounding cases: lines 145/148/150 all return strings with terminal periods. the string also appears in the aria-live indicator span read aloud by screen readers.
- suggested fix: change to "saved locally. will sync when online." — two complete sentences with terminal periods, consistent with the surrounding save indicator strings and the voice spec.
- source: browser
- resolution: changed to 'saved locally. will sync when online.' in TodayEntry.tsx; OfflineDraft.test.tsx assertion updated. Shipped at 83f7625.

### [x] [MED] /today — publish prereq hint gives no current-state signal for users with no username
- pass: 30 (commit 53cd344)
- viewport: both
- category: comprehension
- observation: the publish toggle is interactive for a new user with no public username set. the prereq hint reads "entries appear publicly only when a username is set in settings." — a conditional observation in the present tense that does not tell the user whether they currently have a username. a user who enables the toggle and saves receives no in-page signal that the entry is not visible anywhere.
- evidence: capture text: "publish / when published, this entry appears on the public profile. / focus / save / entries appear publicly only when a username is set in settings." — toggle enabled and interactive; hint passive with no current-state signal.
- suggested fix: change hint to "no public username is set — published entries will remain private until one is added in settings."
- resolution: changed hint text in both main view and focus overlay of TodayEntry.tsx. 3 test assertions updated. Shipped at c013b8c.

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
