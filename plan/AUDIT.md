# Audit — Ember

> Open findings, scored and categorized. `/iterate` drains
> the Pending section. `/oversight` may bias the loop with
> `> Bias: <category>` rows.

## Pending

### [user-issue #5] [HIGH] log in bug — magic-link callback redirects to localhost

- category: external-issue
- impact: 9
- ease: 7
- detail: after clicking magic-link email, user lands on localhost:3000/auth/callback instead of the production URL. Supabase is falling back to localhost because the signin code does not pass an explicit `redirectTo` and/or the Supabase project Site URL is not set to production. Code fix: pass `redirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/auth/callback'` in the `signInWithOtp` call. Dashboard fix (user action): set Site URL in Supabase → Authentication → URL Configuration to the production Vercel URL.
- next: /iterate will audit src/app/signin and ship the redirectTo fix; reference #5 in commit body.

## Done

(none yet)
