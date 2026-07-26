# Claude Code — Task Prompt

Paste everything below into Claude Code as your opening message.

---

## Context

You are building the sign-in / sign-up page (`/login`) for **LEXFIT**, a Hungarian-language home fitness product built around one trainer, Alexa. The design is a split-screen: a light eucalyptus brand panel on the left, a white auth column on the right with a segmented Login / Register toggle.

This replaces an existing page that had structural problems, not just visual ones. **The four fixes below are the point of the redesign — preserve them:**

1. **One primary action.** The old page had two competing equal-weight headlines. Now it is brand panel + single form.
2. **Returning users can log in.** The old page was registration-only with no login path.
3. **Pricing is out of auth.** Plan selection moves to a later checkout step. **Do not add pricing cards back to this page.**
4. **Real form fields.** "Or continue with email" used to be inert text.

## Files in this bundle

| Path | What it is |
|---|---|
| `README.md` | **The specification. Read it fully before starting.** Tokens, layout, components, verbatim Hungarian copy, behaviour, a11y. |
| `LEXFIT Auth.html` | The design reference — layout, states, and interactions in working form. Not production code. |
| `image-slot.js` | Prototype-only image placeholder. **Do not port.** |

## Your task

Recreate this page in the target codebase using its existing form primitives, validation library, and auth SDK. Follow `README.md`; work its build order at the end.

## Two hard constraints

Both come from measurement and have already caused rework. Do not "improve" past them.

**1. Never put non-`--ink` text directly on `--accent` (`#7a9b8d`).**
Eucalyptus is light. Only `--ink` (`#18201d`) passes, at 5.46:1. `--ink-2` is 2.63:1, `--ink-3` is 1.78:1, white is 3.04:1 — all fail. This is why the brand panel uses the lighter `#e1f1ea` gradient rather than solid accent: on the tint the full ink ramp works.

The single exception is the **white LEXFIT mark inside the accent logo tile** — a logo is a graphic, not text, so WCAG text contrast does not apply, and a dark mark loses the silhouette. Keep it white.

**2. No text below 14px may carry `opacity` under `.78`.**
The WCAG large-text exemption starts at 18.66px bold / 24px regular; everything smaller needs 4.5:1. This page has several 10–13px mono labels — they use solid `--ink-2` / `--ink-3`, never dimming. Do not introduce `opacity` on small text.

## Notes

- All copy is Hungarian and reproduced verbatim in README §Copy. Do not translate or reword.
- The marketing opt-in checkbox is **unchecked** by default; "stay signed in" is **checked**. Keep both (GDPR).
- The prototype toggles panes with `display:none`. In production use real routes (`/login`, `/register`) or controlled state — **keep the URL meaningful** so states are linkable and analytics can tell them apart.
- Validation in the prototype is client-side only. **Always re-validate server-side.**
- **One open decision:** on mobile the brand panel stacks above the form, pushing it below the fold. README flags two options — ask me which you should take before building the mobile view.

## Definition of done

- Both panes match the reference at desktop and the agreed mobile treatment
- Hungarian copy verbatim
- All contrast pairs hold; no sub-14px `opacity < .78`
- Toggle, password reveal, inline validation, loading state all work
- Wired to the real auth provider with server-side validation
- a11y items in README §Accessibility addressed
- No console errors

Ask me before making any decision the README does not cover.
