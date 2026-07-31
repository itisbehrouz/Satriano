---
name: ui-bug-triage
description: >
  Triage UI issue reports and screenshots systematically before proposing or executing fixes.
  Use when presented with a screenshot, visual issue report, or UI bug report.
  Classifies issues into: real code bug, test/seed data noise, browser/OS artifact, or ambiguous requirement before writing code or running cleanup.
---

# UI Bug Triage From Screenshot

## Step 1 — Classify the report BEFORE proposing any fix

Not everything that looks wrong in a screenshot is a code bug. Sort into one of these buckets first:

1. **Real application code bug** — something our own React/Next.js code rendered incorrectly (broken layout, wrong href, missing data, wrong state).
2. **Test/seed data noise** — the UI is rendering correctly, but the underlying data is fake/placeholder from earlier testing (e.g. a test application's website field says "https://mail.com" because someone typed that during a test run, not because the code is broken). Fix: clean up the data, not the code.
3. **Browser/OS/extension artifact** — an overlay, tooltip, or box that isn't part of the app's own DOM at all (e.g. a browser extension's memory/performance overlay, a screenshot tool's own UI, OS-level chrome). Fix: nothing to do in code; confirm with the user it's not application-rendered before spending any effort.
4. **Ambiguous / needs a specific example** — "this link is wrong" without saying which link, where it goes vs. where it should go. Do not guess and start writing fixes for a plausible-sounding candidate; ask for the specific element and its actual vs. expected behavior first. A wrong guess wastes a full fix-verify-redeploy cycle.

## Step 2 — For real code bugs, gather what's needed before prompting

- Which exact page/route was the screenshot taken on?
- Which exact element (button, link, badge, row) is wrong?
- What does it currently do, and what should it do instead?
- Is this reproducible for anyone, or specific to one browser/session (ask if unsure — see bucket 3 above)?

## Step 3 — Write the fix prompt only once classified

- For bucket 1 (real bug): a normal fix prompt — trace the actual component, fix, verify (tsc + tests), redeploy, confirm with evidence (not just "fixed it").
- For bucket 2 (data noise): a cleanup prompt (delete/update the specific bad records), not a code-fix prompt.
- For bucket 3 (external artifact): no prompt needed — tell the user it's outside the app, no code changes required.
- For bucket 4 (ambiguous): ask one clarifying question with the specific missing detail, don't proceed on a guess.

## Why this matters here specifically

This project has a recurring pattern: screenshots get shared, and the instinct is to immediately write a fix prompt for whatever looks most plausible. Several past incidents (a memory-usage browser overlay mistaken for an app bug, test company data like "E2E Portal Partner Co" mistaken for a real feature gap) show that skipping this classification step wastes an iteration. Always classify first, ask if bucket is unclear, then act.
