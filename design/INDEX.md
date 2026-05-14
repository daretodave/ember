# ember · design · index

> a one-paragraph tour. each section links to its canonical file.
> read top to bottom — the order matches the build sequence.

## tokens

[`tokens.css`](./tokens.css) is the authoritative source for
every value in the system: palette (light + dark, both via
`prefers-color-scheme` and explicit `[data-theme="…"]`
overrides), the 8-stop type ramp, the 8-stop 4px spacing
ramp, the 0/4/8 radius set, the 200ms motion duration with
a single easing curve, and the mosaic-tile geometry as
custom properties. when phase 2 ports the system to
react/tailwind, the tailwind config references these
properties rather than re-encoding the values.

## brand

[`Ember · Brand.html`](./Ember%20·%20Brand.html) is the
canonical mosaic reference. it shows the mark at three tile
sizes (16 / 24 / 32 px) in light and dark mode, with all
four states annotated at hero scale (empty, filled, today,
published). it includes the construction table — every
geometry number written down — the hover tooltip spec, the
two permitted lockups (mosaic-alone, mosaic + wordmark),
and a don't-list covering wordmark-alone, illustration,
shadow, gradient, rounded tiles, and streak counts.

## tokens (visible form)

[`Ember · Tokens.html`](./Ember%20·%20Tokens.html) is the
swatch sheet — every palette stop in both modes, the type
ladder with line and tracking notes, family specimens for
source serif 4 / inter / jetbrains mono, the spacing ramp
visualized, the three radii, the four tile states at
demonstration scale, motion notes, and the button + input
primitives. if a screen needs a value, this page shows you
what it is and what it costs.

## landing

[`Ember · Landing.html`](./Ember%20·%20Landing.html) is the
anonymous `/` page. brand mark in the header, the one-line
pitch as a serif hero, the full 60-day mosaic as the in-
situ brand statement, a seven-day prompt preview rendered
as a vertical list (today highlighted with a paper-sunk
row), a short closing note that names what ember will not
do, and a sticky bottom cta with one sentence of
reassurance and a single "sign in to start" button.

## today

[`Ember · Today.html`](./Ember%20·%20Today.html) is the
authenticated `/today` screen. mono date stamp at the top,
today's prompt at 32px serif, the tiny task with a check
control on a hairline-bordered row, a borderless textarea
with a single hairline bottom-rule, a save button and a
publish toggle, and a seven-day strip at the footer with
today marked. there is no autosave indicator anywhere
trying to celebrate.

## log

[`Ember · Log.html`](./Ember%20·%20Log.html) is the
authenticated `/log` screen. the 60-day mosaic at the
"display" 24px tile size, centered, with every tile
hovering a date + 80-char excerpt tooltip in mono. below
the mosaic, a quiet count ("52 days written. 8 quiet. 4
published.") and the most recent entry rendered in full —
date in mono, prompt at 24px serif, task echoed in muted
serif, response in 17px serif at prose line-height. there
is no pagination. there is no edit affordance on this
page (a v1.5 stretch per spec).

## profile

[`Ember · Profile.html`](./Ember%20·%20Profile.html) is the
public `/u/[username]` page. centered name and `@handle` in
mono, one line of bio, the 60-day mosaic with **only
published tiles filled** — unpublished days are empty
regardless of whether the user practiced, so the mosaic
leaks nothing about private activity. an italic privacy
note states this explicitly. one published entry rendered
below, with prev/next links to the surrounding published
entries (chronological order, per spec).

## signin

[`Ember · Signin.html`](./Ember%20·%20Signin.html) is the
`/signin` screen. one email field, one send button, one
sentence of reassurance ("we email you a sign-in link. no
password, no spam."). centered vertically. nothing else.
no social-auth options. no "trouble signing in?" link.

## mobile

[`Ember · Mobile.html`](./Ember%20·%20Mobile.html) is the
375px walkthrough. five device frames in a horizontal
scroll — landing, today, log, profile, signin — each
loading the live html so any future change to those
sources flows through. no separate mobile design: the
desktop layouts already collapse to a single column under
their own max-width, so the same html ships on both. the
walkthrough is the verification surface, not a new design.

## decisions

[`decisions.md`](./decisions.md) is the brief. it covers
the mood interpretation, the palette rationale (every hex
defended), the type rationale (why source serif 4 carries
body, why inter is chrome-only, where mono goes), the
mosaic spec in prose, the five things the system will not
do, and the "wins over bearings on conflict" note. read
this before changing a token. read it again before adding
a new screen.

ember · design · v1 · pause 3
